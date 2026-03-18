# Bluetooth Wearable Device Integration

## Overview

This implementation provides comprehensive Bluetooth connectivity for wearable devices, specifically designed for Flipkart health devices. The system uses the Web Bluetooth API to establish real-time connections and collect health data.

## Features

### 🔗 Device Connectivity
- **Web Bluetooth API Integration**: Native browser-based Bluetooth connectivity
- **Device Discovery**: Automatic scanning for compatible wearable devices
- **Real-time Connection Management**: Live connection status monitoring
- **Battery Level Monitoring**: Track device battery levels
- **Auto-reconnection**: Handles connection drops gracefully

### 📊 Health Data Collection
- **Heart Rate Monitoring**: Real-time BPM tracking with quality indicators
- **Activity Tracking**: Steps, calories, distance, and active minutes
- **Multi-metric Support**: Blood pressure, oxygen saturation, temperature
- **Data Quality Assessment**: Automatic quality scoring for readings
- **Historical Data**: Store and display recent readings

### 🎯 Flipkart Device Support
- **Optimized for Flipkart Devices**: Specifically configured for Flipkart wearables
- **Device Type Detection**: Automatic identification of device capabilities
- **Brand Recognition**: Flipkart device branding and model detection
- **Custom Service Support**: Extended Bluetooth service compatibility

## Architecture

### Core Components

#### 1. BluetoothWearableService (`/services/BluetoothService.ts`)
- **Singleton Pattern**: Single instance for app-wide device management
- **Event-driven Architecture**: Subscription-based health reading updates
- **Connection Management**: Handle multiple device connections
- **Data Processing**: Parse and validate incoming health data

#### 2. WearableDeviceManager (`/components/WearableDeviceManager.tsx`)
- **Device Discovery UI**: Scan and list available devices
- **Connection Interface**: Connect/disconnect device controls
- **Status Monitoring**: Real-time connection and battery status
- **Setup Guidance**: Step-by-step pairing instructions

#### 3. WearableHub (`/pages/user/WearableHub.tsx`)
- **Main Dashboard**: Comprehensive wearable device hub
- **3D Heart Visualization**: Live heart rate with 3D heart model
- **Health Analytics**: Real-time stats and progress tracking
- **Reading History**: Display recent health measurements

## Technical Implementation

### Web Bluetooth API Usage

```typescript
// Device Discovery
const device = await navigator.bluetooth.requestDevice({
  filters: [
    { services: ['heart_rate'] },
    { namePrefix: 'Flipkart' }
  ],
  optionalServices: [
    'heart_rate',
    'battery_service',
    'device_information'
  ]
});

// Data Collection
const heartRateService = await server.getPrimaryService('heart_rate');
const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
await heartRateCharacteristic.startNotifications();
```

### Supported Bluetooth Services

1. **Heart Rate Service** (`heart_rate`)
   - Heart rate measurement characteristic
   - Real-time BPM data
   - Quality assessment

2. **Battery Service** (`battery_service`)
   - Battery level monitoring
   - Low battery alerts
   - Power management

3. **Device Information** (`device_information`)
   - Manufacturer identification
   - Model and version info
   - Capability detection

### Data Flow

```
Flipkart Device → Bluetooth → Web Bluetooth API → BluetoothService → React Components → UI Updates
```

## Usage Guide

### For Users

#### Step 1: Enable Bluetooth
- Ensure Bluetooth is enabled on your computer
- Use a compatible browser (Chrome, Edge, Opera)
- Grant Bluetooth permissions when prompted

#### Step 2: Prepare Your Flipkart Device
- Put your Flipkart wearable in pairing mode
- Ensure the device is charged and nearby
- Follow device-specific pairing instructions

#### Step 3: Connect Through PulseNet
1. Navigate to **Wearable Hub** in the user dashboard
2. Click **"Scan Devices"** button
3. Select your Flipkart device from the list
4. Click **"Connect"** to establish connection
5. Monitor live health data in real-time

### For Developers

#### Integration Example

```typescript
import BluetoothWearableService from '@/services/BluetoothService';

const bluetoothService = BluetoothWearableService.getInstance();

// Subscribe to health readings
const subscriptionId = bluetoothService.onHealthReading((reading) => {
  console.log('New health reading:', reading);
  // Update UI with new data
});

// Connect to device
try {
  const device = await bluetoothService.connectToDevice(deviceId);
  console.log('Connected to:', device.name);
} catch (error) {
  console.error('Connection failed:', error);
}
```

## Browser Compatibility

### Supported Browsers
- ✅ **Chrome 56+**: Full Web Bluetooth support
- ✅ **Edge 79+**: Complete functionality
- ✅ **Opera 43+**: All features available
- ❌ **Firefox**: Limited support (experimental)
- ❌ **Safari**: Not supported

### Platform Support
- ✅ **Windows 10+**: Full compatibility
- ✅ **macOS**: Complete support
- ✅ **Linux**: Supported with BlueZ
- ✅ **Android Chrome**: Mobile support
- ❌ **iOS**: Not supported (Apple restrictions)

## Security & Privacy

### Data Protection
- **Local Processing**: All health data processed locally
- **No Cloud Storage**: Data remains on user's device
- **Encrypted Connections**: Bluetooth LE security
- **User Consent**: Explicit permission for device access

### Privacy Features
- **Automatic Data Expiry**: Old readings automatically removed
- **User Control**: Full control over data sharing
- **Secure Pairing**: Authenticated device connections
- **No Tracking**: No user behavior tracking

## Troubleshooting

### Common Issues

#### "Bluetooth not supported"
- **Solution**: Use Chrome, Edge, or Opera browser
- **Alternative**: Update to latest browser version

#### "Device not found"
- **Solution**: Ensure device is in pairing mode
- **Check**: Device is within range (< 10 meters)
- **Verify**: Device is not connected to another app

#### "Connection failed"
- **Solution**: Restart both device and browser
- **Check**: Bluetooth permissions granted
- **Try**: Clear browser cache and cookies

#### "No data received"
- **Solution**: Check device battery level
- **Verify**: Device supports required Bluetooth services
- **Restart**: Disconnect and reconnect device

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('bluetooth-debug', 'true');
```

## Future Enhancements

### Planned Features
- **Multi-device Support**: Connect multiple devices simultaneously
- **Data Export**: Export health data to CSV/JSON
- **Cloud Sync**: Optional cloud backup (with user consent)
- **Advanced Analytics**: ML-powered health insights
- **Notification System**: Health alerts and reminders

### Device Expansion
- **Blood Pressure Monitors**: Dedicated BP device support
- **Glucose Meters**: Diabetes management integration
- **Sleep Trackers**: Advanced sleep analysis
- **ECG Devices**: Heart rhythm monitoring

## API Reference

### BluetoothWearableService Methods

```typescript
// Device Management
isBluetoothSupported(): boolean
scanForDevices(): Promise<WearableDevice[]>
connectToDevice(deviceId: string): Promise<WearableDevice>
disconnectDevice(deviceId: string): Promise<void>

// Data Subscriptions
onHealthReading(callback: (reading: HealthReading) => void): string
offHealthReading(subscriptionId: string): void
onDeviceConnection(callback: (device: WearableDevice) => void): string

// Status & Info
getConnectionStatus(): BluetoothConnectionStatus
getConnectedDevices(): WearableDevice[]
```

### Data Types

```typescript
interface WearableDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'heart_monitor';
  connected: boolean;
  batteryLevel?: number;
  lastSync?: Date;
  manufacturer?: string;
}

interface HealthReading {
  timestamp: Date;
  deviceId: string;
  type: 'heart_rate' | 'steps' | 'calories' | 'oxygen';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
}
```

## Support

For technical support or questions about the Bluetooth wearable integration:

1. **Check Browser Compatibility**: Ensure you're using a supported browser
2. **Review Troubleshooting**: Follow the troubleshooting guide above
3. **Enable Debug Mode**: Use debug logging for detailed error information
4. **Device Documentation**: Refer to your Flipkart device manual for pairing instructions

---

**Note**: This implementation requires HTTPS for security. The Web Bluetooth API only works on secure origins.