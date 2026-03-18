import React, { useState } from 'react';
import { SimpleHeart3D } from '@/components/SimpleHeart3D';
import { Heart, Activity, Settings } from 'lucide-react';

export default function SimpleHeartPage() {
  const [heartRate, setHeartRate] = useState(72);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <Heart className="w-8 h-8 mr-3 text-red-400" />
            3D Heart Monitor
          </h1>
          <p className="text-gray-400">Interactive 3D heart visualization with real-time animation</p>
        </div>

        {/* Main 3D Heart Display - No container box */}
        <div className="w-full relative">
          <SimpleHeart3D 
            heartRate={heartRate}
            height="h-[600px]"
            className="shadow-2xl"
          />
        </div>

        {/* Simple Controls */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Heart Rate Control
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Activity className="w-4 h-4" />
              <span>Live Animation</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-300 min-w-[100px]">
                Heart Rate:
              </label>
              <input
                type="range"
                min="40"
                max="120"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-lg font-bold text-red-400 min-w-[80px]">
                {heartRate} BPM
              </span>
            </div>
            
            {/* Heart Rate Status */}
            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                onClick={() => setHeartRate(60)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Resting (60)
              </button>
              <button
                onClick={() => setHeartRate(72)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                Normal (72)
              </button>
              <button
                onClick={() => setHeartRate(90)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
              >
                Active (90)
              </button>
              <button
                onClick={() => setHeartRate(110)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Exercise (110)
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-semibold text-white mb-1">Continuous Rotation</h4>
            <p className="text-sm text-gray-400">360° rotation for full heart view</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-2">💓</div>
            <h4 className="font-semibold text-white mb-1">Realistic Pumping</h4>
            <p className="text-sm text-gray-400">Heart rate synchronized animation</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-2">🎨</div>
            <h4 className="font-semibold text-white mb-1">3D Visualization</h4>
            <p className="text-sm text-gray-400">High-quality 3D heart model</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-2">How it works:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• The heart rotates continuously 360° to show all angles</li>
            <li>• Pumping animation speed matches the heart rate (BPM)</li>
            <li>• Use the slider or preset buttons to change heart rate</li>
            <li>• The model automatically scales and pulses realistically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}