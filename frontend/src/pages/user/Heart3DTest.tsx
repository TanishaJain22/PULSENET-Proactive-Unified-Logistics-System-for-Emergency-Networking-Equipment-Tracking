import React from 'react';
import { Heart3DPreview } from '@/components/Heart3DPreview';
import { Heart3DDashboard } from '@/components/Heart3DDashboard';

export default function Heart3DTest() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">3D Heart Model Test</h1>
          <p className="text-gray-400">Testing the 3D heart visualization components</p>
        </div>

        {/* Preview Component Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Heart 3D Preview Component</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Heart3DPreview 
              heartRate={72} 
              showControls={true}
              className="border border-gray-700"
            />
            <Heart3DPreview 
              heartRate={95} 
              showControls={true}
              className="border border-gray-700"
            />
            <Heart3DPreview 
              heartRate={58} 
              showControls={true}
              className="border border-gray-700"
            />
          </div>
        </div>

        {/* Full Dashboard Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Full 3D Heart Dashboard</h2>
          <Heart3DDashboard 
            vitalSigns={{
              heartRate: 75,
              bloodPressure: { systolic: 120, diastolic: 80 },
              oxygenSaturation: 98,
              healthScore: 87
            }}
            showControls={true}
          />
        </div>

        {/* Different Vital Signs Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Different Health Scenarios</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Heart3DDashboard 
              vitalSigns={{
                heartRate: 105,
                bloodPressure: { systolic: 140, diastolic: 95 },
                oxygenSaturation: 96,
                healthScore: 65
              }}
              showControls={true}
              className="border-2 border-red-500/30"
            />
            <Heart3DDashboard 
              vitalSigns={{
                heartRate: 68,
                bloodPressure: { systolic: 115, diastolic: 75 },
                oxygenSaturation: 99,
                healthScore: 92
              }}
              showControls={true}
              className="border-2 border-green-500/30"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">3D Heart Controls</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Mouse drag:</strong> Rotate the heart</li>
                <li>• <strong>Mouse wheel:</strong> Zoom in/out</li>
                <li>• <strong>Play/Pause:</strong> Control heart animation</li>
                <li>• <strong>View modes:</strong> Normal, X-ray, Detailed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Health Indicators</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Heart rate:</strong> Real-time BPM display</li>
                <li>• <strong>Blood pressure:</strong> Systolic/Diastolic readings</li>
                <li>• <strong>Oxygen saturation:</strong> O₂ percentage</li>
                <li>• <strong>Health score:</strong> Overall health rating</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}