import React, { useState, useEffect } from 'react';
import { 
  Bluetooth, 
  Battery, 
  Heart, 
  Activity, 
  Wifi, 
  WifiOff, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Watch,
  Zap,
  RefreshCw
} from 'lucide-react';
import BluetoothWearableService, { type WearableDevice, type HealthReading } from '@/services/BluetoothService';

interface WearableDeviceManagerProps {
  onHealthReading?: (reading: HealthReading) => void;
  onDeviceConnected?: (device: WearableDevice) => void;
}

export default function WearableDeviceManager({ onHealthReading, onDeviceConnected }: WearableDeviceManagerProps) {
  const [bluetoothService] = useState(() => BluetoothWearableService.getInstance());
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<WearableDevice[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [lastReading, setLastReading] = useState<HealthReading | null>(null);

  useEffect(() => {
    // Check Bluetooth support
    setIsSupported(bluetoothService.isBluetoothSupported());

    // Subscribe to health readings
    const readingSubscription = bluetoothService.onHealthReading((reading) => {
      setLastReading(reading);
      onHealthReading?.(reading);
    });

    // Subscribe to device connections
    const connectionSubscription = bluetoothService.onDeviceConnection((device) => {
      setConnectedDevices(prev => [...prev.filter(d => d.id !== device.id), device]);
      onDeviceConnected?.(device);
    });

    // Load initial connected devices
    setConnectedDevices(bluetoothService.getConnectedDevices());

    return () => {
      bluetoothService.offHealthReading(readingSubscription);
    };
  }, [bluetoothService, onHealthReading, onDeviceConnected]);

  const handleScanForDevices = async () => {
    if (!isSupported) {
      setConnectionStatus('Bluetooth is not supported in this browser');
      return;
    }

    setIsScanning(true);
    setConnectionStatus('Scanning for devices...');

    try {
      const devices = await bluetoothService.scanForDevices();
      setAvailableDevices(devices);
      setConnectionStatus(`Found ${devices.length} device(s)`);
    } catch (error) {
      console.error('Scan error:', error);
      setConnectionStatus('Failed to scan for devices. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (deviceId: string) => {
    setConnectionStatus('Connecting...');
    
    try {
      const device = await bluetoothService.connectToDevice(deviceId);
      setConnectedDevices(prev => [...prev.filter(d => d.id !== device.id), device]);
      setConnectionStatus(`Connected to ${device.name}`);
      
      // Start simulated readings for demo
      bluetoothService.startSimulatedReadings(device.id);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Failed to connect to device');
    }
  };

  const handleDisconnectDevice = async (deviceId: string) => {
    try {
      await bluetoothService.disconnectDevice(deviceId);
      setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
      setConnectionStatus('Device disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      setConnectionStatus('Failed to disconnect device');
    }
  };

  const getDeviceIcon = (type: WearableDevice['type']) => {
    switch (type) {
      case 'smartwatch': return <Watch className="w-5 h-5" />;
      case 'heart_monitor': return <Heart className="w-5 h-5" />;
      case 'fitness_tracker': return <Activity className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  const getDeviceTypeLabel = (type: WearableDevice['type']) => {
    switch (type) {
      case 'smartwatch': return 'Smart Watch';
      case 'heart_monitor': return 'Heart Monitor';
      case 'fitness_tracker': return 'Fitness Tracker';
      case 'blood_pressure': return 'Blood Pressure Monitor';
      case 'glucose_meter': return 'Glucose Meter';
      default: return 'Wearable Device';
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-center space-x-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Bluetooth Not Supported</h3>
            <p className="text-sm text-gray-400 mt-1">
              Your browser doesn't support Web Bluetooth API. Please use Chrome, Edge, or Opera.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Bluetooth className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Wearable Devices</h3>
              <p className="text-sm text-gray-400">Connect your Flipkart health devices</p>
            </div>
          </div>
          <button
            onClick={handleScanForDevices}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isScanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isScanning ? 'Scanning...' : 'Scan Devices'}</span>
          </button>
        </div>

        {connectionStatus && (
          <div className="mb-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">{connectionStatus}</p>
          </div>
        )}
      </div>

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            Connected Devices ({connectedDevices.length})
          </h4>
          
          <div className="space-y-3">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-green-400">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{device.name}</div>
                    <div className="text-sm text-gray-400">{getDeviceTypeLabel(device.type)}</div>
                    {device.lastSync && (
                      <div className="text-xs text-gray-500">
                        Last sync: {device.lastSync.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {device.batteryLevel && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Battery className="w-4 h-4" />
                      <span>{device.batteryLevel}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                  
                  <button
                    onClick={() => handleDisconnectDevice(device.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Devices */}
      {availableDevices.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Search className="w-5 h-5 text-blue-400 mr-2" />
            Available Devices ({availableDevices.length})
          </h4>
          
          <div className="space-y-3">
            {availableDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{device.name}</div>
                    <div className="text-sm text-gray-400">{getDeviceTypeLabel(device.type)}</div>
                    {device.manufacturer && (
                      <div className="text-xs text-gray-500">{device.manufacturer}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs">Not Connected</span>
                  </div>
                  
                  <button
                    onClick={() => handleConnectDevice(device.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Data Feed */}
      {lastReading && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            Live Data Feed
          </h4>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-white capitalize">
                  {lastReading.type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {lastReading.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">
                {typeof lastReading.value === 'object' 
                  ? `${lastReading.value.systolic}/${lastReading.value.diastolic}`
                  : lastReading.value
                }
                <span className="text-sm font-normal text-gray-400 ml-1">
                  {lastReading.unit}
                </span>
              </div>
              
              {lastReading.quality && (
                <div className={`px-2 py-1 rounded text-xs ${
                  lastReading.quality === 'excellent' ? 'bg-green-500/20 text-green-400' :
                  lastReading.quality === 'good' ? 'bg-blue-500/20 text-blue-400' :
                  lastReading.quality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {lastReading.quality}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Setup Guide */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Quick Setup Guide</h4>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <div className="font-medium">Enable Bluetooth</div>
              <div className="text-gray-400">Make sure Bluetooth is enabled on your device and computer</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <div className="font-medium">Put Device in Pairing Mode</div>
              <div className="text-gray-400">Follow your Flipkart device instructions to enable pairing mode</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <div className="font-medium">Scan and Connect</div>
              <div className="text-gray-400">Click "Scan Devices" and select your device from the list</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}