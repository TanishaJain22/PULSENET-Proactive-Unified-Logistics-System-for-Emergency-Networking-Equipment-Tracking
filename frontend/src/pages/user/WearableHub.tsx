import React, { useState, useEffect } from 'react';
import { 
  Bluetooth, 
  Heart, 
  Activity, 
  TrendingUp, 
  Battery, 
  Wifi,
  Smartphone,
  Watch,
  Zap,
  BarChart3,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import WearableDeviceManager from '@/components/WearableDeviceManager';
import { SimpleHeart3D } from '@/components/SimpleHeart3D';
import type { WearableDevice, HealthReading } from '@/services/BluetoothService';

interface HealthStats {
  heartRate: number;
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  lastUpdate: Date;
}

export default function WearableHub() {
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    heartRate: 72,
    steps: 0,
    calories: 0,
    distance: 0,
    activeMinutes: 0,
    lastUpdate: new Date()
  });
  const [recentReadings, setRecentReadings] = useState<HealthReading[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);

  const handleDeviceConnected = (device: WearableDevice) => {
    setConnectedDevices(prev => {
      const filtered = prev.filter(d => d.id !== device.id);
      return [...filtered, device];
    });
    setIsLiveMode(true);
  };

  const handleHealthReading = (reading: HealthReading) => {
    // Update recent readings
    setRecentReadings(prev => {
      const newReadings = [reading, ...prev.slice(0, 9)]; // Keep last 10 readings
      return newReadings;
    });

    // Update health stats based on reading type
    setHealthStats(prev => {
      const updated = { ...prev, lastUpdate: new Date() };
      
      switch (reading.type) {
        case 'heart_rate':
          updated.heartRate = typeof reading.value === 'number' ? reading.value : prev.heartRate;
          break;
        case 'steps':
          updated.steps = typeof reading.value === 'number' ? reading.value : prev.steps;
          break;
        case 'calories':
          updated.calories = typeof reading.value === 'number' ? reading.value : prev.calories;
          break;
      }
      
      return updated;
    });
  };

  const getReadingIcon = (type: HealthReading['type']) => {
    switch (type) {
      case 'heart_rate': return <Heart className="w-4 h-4 text-red-400" />;
      case 'steps': return <Activity className="w-4 h-4 text-green-400" />;
      case 'calories': return <Zap className="w-4 h-4 text-orange-400" />;
      case 'oxygen': return <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">O₂</div>;
      default: return <BarChart3 className="w-4 h-4 text-blue-400" />;
    }
  };

  const getReadingLabel = (type: HealthReading['type']) => {
    switch (type) {
      case 'heart_rate': return 'Heart Rate';
      case 'steps': return 'Steps';
      case 'calories': return 'Calories';
      case 'oxygen': return 'Oxygen';
      case 'blood_pressure': return 'Blood Pressure';
      case 'temperature': return 'Temperature';
      default: return type.replace('_', ' ');
    }
  };

  const formatReadingValue = (reading: HealthReading) => {
    if (typeof reading.value === 'object') {
      return `${reading.value.systolic}/${reading.value.diastolic}`;
    }
    return reading.value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Bluetooth className="w-8 h-8 mr-3 text-blue-400" />
              Wearable Device Hub
            </h1>
            <p className="text-gray-400">Connect and monitor your Flipkart health devices</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last updated: {healthStats.lastUpdate.toLocaleTimeString()}</span>
            </div>
            {connectedDevices.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">{connectedDevices.length} device(s) connected</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Device Manager */}
          <div className="lg:col-span-2">
            <WearableDeviceManager 
              onHealthReading={handleHealthReading}
              onDeviceConnected={handleDeviceConnected}
            />
          </div>

          {/* Right Column - Live Heart Monitor */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-400" />
                  Live Heart Monitor
                </h3>
                {isLiveMode && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                )}
              </div>
              
              {/* 3D Heart */}
              <SimpleHeart3D 
                heartRate={healthStats.heartRate}
                height="h-64"
                className="mb-4"
              />
              
              {/* Heart Rate Display */}
              <div className="text-center bg-gray-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {Math.round(healthStats.heartRate)} <span className="text-lg text-gray-400">BPM</span>
                </div>
                <div className="text-sm text-gray-400">Current Heart Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Stats Dashboard */}
        {connectedDevices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Steps */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-gray-300">Steps</span>
                </div>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {healthStats.steps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Goal: 10,000 steps</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((healthStats.steps / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Calories */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="text-sm font-medium text-gray-300">Calories</span>
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {healthStats.calories.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Burned today</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((healthStats.calories / 2500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Distance */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">KM</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Distance</span>
                </div>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {(healthStats.steps * 0.0008).toFixed(1)} km
              </div>
              <div className="text-xs text-gray-400">Estimated distance</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(((healthStats.steps * 0.0008) / 8) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Active Minutes */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-gray-300">Active</span>
                </div>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {healthStats.activeMinutes} min
              </div>
              <div className="text-xs text-gray-400">Goal: 30 minutes</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((healthStats.activeMinutes / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Readings */}
        {recentReadings.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
              Recent Readings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReadings.slice(0, 6).map((reading, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getReadingIcon(reading.type)}
                      <span className="text-sm font-medium text-white">
                        {getReadingLabel(reading.type)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {reading.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-white">
                      {formatReadingValue(reading)}
                      <span className="text-sm font-normal text-gray-400 ml-1">
                        {reading.unit}
                      </span>
                    </div>
                    
                    {reading.quality && (
                      <div className={`px-2 py-1 rounded text-xs ${
                        reading.quality === 'excellent' ? 'bg-green-500/20 text-green-400' :
                        reading.quality === 'good' ? 'bg-blue-500/20 text-blue-400' :
                        reading.quality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {reading.quality}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Devices Connected State */}
        {connectedDevices.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No Devices Connected</h3>
                <p className="text-gray-400 mb-4">
                  Connect your Flipkart wearable device to start monitoring your health data in real-time.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Make sure your device is in pairing mode</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}