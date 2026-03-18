// Bluetooth Service for Wearable Device Integration
export interface WearableDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'heart_monitor' | 'blood_pressure' | 'glucose_meter';
  connected: boolean;
  batteryLevel?: number;
  lastSync?: Date;
  manufacturer?: string;
  model?: string;
}

export interface HealthReading {
  timestamp: Date;
  deviceId: string;
  type: 'heart_rate' | 'blood_pressure' | 'steps' | 'calories' | 'sleep' | 'oxygen' | 'temperature' | 'glucose';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface BluetoothConnectionStatus {
  isSupported: boolean;
  isEnabled: boolean;
  isScanning: boolean;
  connectedDevices: WearableDevice[];
  availableDevices: WearableDevice[];
}

class BluetoothWearableService {
  private static instance: BluetoothWearableService;
  private connectedDevices: Map<string, WearableDevice> = new Map();
  private readingCallbacks: Map<string, (reading: HealthReading) => void> = new Map();
  private connectionCallbacks: Map<string, (device: WearableDevice) => void> = new Map();
  private isScanning = false;

  static getInstance(): BluetoothWearableService {
    if (!BluetoothWearableService.instance) {
      BluetoothWearableService.instance = new BluetoothWearableService();
    }
    return BluetoothWearableService.instance;
  }

  // Check if Web Bluetooth API is supported
  isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  // Check if Bluetooth is available
  async isBluetoothAvailable(): Promise<boolean> {
    if (!this.isBluetoothSupported()) return false;
    
    try {
      return await navigator.bluetooth.getAvailability();
    } catch (error) {
      console.error('Error checking Bluetooth availability:', error);
      return false;
    }
  }

  // Scan for available wearable devices
  async scanForDevices(): Promise<WearableDevice[]> {
    if (!this.isBluetoothSupported()) {
      throw new Error('Bluetooth is not supported in this browser');
    }

    this.isScanning = true;
    const devices: WearableDevice[] = [];

    try {
      // Request device with health-related services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] },
          { services: ['device_information'] },
          { namePrefix: 'Flipkart' },
          { namePrefix: 'Health' },
          { namePrefix: 'Fitness' }
        ],
        optionalServices: [
          'heart_rate',
          'battery_service',
          'device_information',
          'blood_pressure',
          'glucose',
          'body_composition',
          'cycling_power',
          'running_speed_and_cadence'
        ]
      });

      if (device) {
        const wearableDevice: WearableDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          type: this.detectDeviceType(device.name || ''),
          connected: false,
          manufacturer: 'Flipkart',
          model: device.name || 'Unknown'
        };

        devices.push(wearableDevice);
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    } finally {
      this.isScanning = false;
    }

    return devices;
  }

  // Connect to a specific device
  async connectToDevice(deviceId: string): Promise<WearableDevice> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information']
      });

      await device.gatt?.connect();

      const wearableDevice: WearableDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        type: this.detectDeviceType(device.name || ''),
        connected: true,
        lastSync: new Date(),
        manufacturer: 'Flipkart'
      };

      this.connectedDevices.set(deviceId, wearableDevice);

      // Set up event listeners
      device.addEventListener('gattserverdisconnected', () => {
        this.handleDeviceDisconnection(deviceId);
      });

      // Start reading data from the device
      this.startDataCollection(device, wearableDevice);

      return wearableDevice;
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  // Disconnect from a device
  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      device.connected = false;
      this.connectedDevices.delete(deviceId);
    }
  }

  // Start collecting data from connected device
  private async startDataCollection(device: BluetoothDevice, wearableDevice: WearableDevice): Promise<void> {
    try {
      const server = device.gatt;
      if (!server) return;

      // Heart Rate Service
      try {
        const heartRateService = await server.getPrimaryService('heart_rate');
        const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
        
        await heartRateCharacteristic.startNotifications();
        heartRateCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          const heartRate = this.parseHeartRateData(event.target as BluetoothRemoteGATTCharacteristic);
          this.emitHealthReading({
            timestamp: new Date(),
            deviceId: wearableDevice.id,
            type: 'heart_rate',
            value: heartRate,
            unit: 'bpm',
            quality: heartRate > 50 && heartRate < 200 ? 'good' : 'fair'
          });
        });
      } catch (error) {
        console.log('Heart rate service not available:', error);
      }

      // Battery Service
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryCharacteristic.readValue();
        wearableDevice.batteryLevel = batteryValue.getUint8(0);
      } catch (error) {
        console.log('Battery service not available:', error);
      }

    } catch (error) {
      console.error('Error starting data collection:', error);
    }
  }

  // Parse heart rate data from Bluetooth characteristic
  private parseHeartRateData(characteristic: BluetoothRemoteGATTCharacteristic): number {
    const value = characteristic.value;
    if (!value) return 0;

    const flags = value.getUint8(0);
    const is16Bit = flags & 0x01;
    
    if (is16Bit) {
      return value.getUint16(1, true); // Little endian
    } else {
      return value.getUint8(1);
    }
  }

  // Detect device type based on name
  private detectDeviceType(deviceName: string): WearableDevice['type'] {
    const name = deviceName.toLowerCase();
    if (name.includes('heart') || name.includes('hr')) return 'heart_monitor';
    if (name.includes('watch')) return 'smartwatch';
    if (name.includes('fitness') || name.includes('tracker')) return 'fitness_tracker';
    if (name.includes('pressure') || name.includes('bp')) return 'blood_pressure';
    if (name.includes('glucose') || name.includes('sugar')) return 'glucose_meter';
    return 'fitness_tracker';
  }

  // Handle device disconnection
  private handleDeviceDisconnection(deviceId: string): void {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      device.connected = false;
      this.connectedDevices.set(deviceId, device);
    }
  }

  // Emit health reading to subscribers
  private emitHealthReading(reading: HealthReading): void {
    this.readingCallbacks.forEach(callback => callback(reading));
  }

  // Subscribe to health readings
  onHealthReading(callback: (reading: HealthReading) => void): string {
    const id = Math.random().toString(36).substr(2, 9);
    this.readingCallbacks.set(id, callback);
    return id;
  }

  // Unsubscribe from health readings
  offHealthReading(subscriptionId: string): void {
    this.readingCallbacks.delete(subscriptionId);
  }

  // Subscribe to connection events
  onDeviceConnection(callback: (device: WearableDevice) => void): string {
    const id = Math.random().toString(36).substr(2, 9);
    this.connectionCallbacks.set(id, callback);
    return id;
  }

  // Get current connection status
  getConnectionStatus(): BluetoothConnectionStatus {
    return {
      isSupported: this.isBluetoothSupported(),
      isEnabled: true, // This would need to be checked via API
      isScanning: this.isScanning,
      connectedDevices: Array.from(this.connectedDevices.values()),
      availableDevices: []
    };
  }

  // Get connected devices
  getConnectedDevices(): WearableDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  // Simulate readings for demo purposes (remove in production)
  startSimulatedReadings(deviceId: string): void {
    const interval = setInterval(() => {
      const readings: HealthReading[] = [
        {
          timestamp: new Date(),
          deviceId,
          type: 'heart_rate',
          value: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
          unit: 'bpm',
          quality: 'good'
        },
        {
          timestamp: new Date(),
          deviceId,
          type: 'steps',
          value: Math.floor(Math.random() * 100) + 8000, // 8000-8100 steps
          unit: 'steps',
          quality: 'excellent'
        },
        {
          timestamp: new Date(),
          deviceId,
          type: 'calories',
          value: Math.floor(Math.random() * 50) + 2000, // 2000-2050 calories
          unit: 'kcal',
          quality: 'good'
        }
      ];

      readings.forEach(reading => this.emitHealthReading(reading));
    }, 3000);

    // Store interval for cleanup
    setTimeout(() => clearInterval(interval), 300000); // Stop after 5 minutes
  }
}

export default BluetoothWearableService;