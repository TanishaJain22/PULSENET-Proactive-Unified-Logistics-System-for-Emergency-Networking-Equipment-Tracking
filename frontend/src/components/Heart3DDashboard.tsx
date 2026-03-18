import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Text } from '@react-three/drei';
import { Activity, Heart, Zap, TrendingUp, RotateCcw, Play, Pause } from 'lucide-react';
import * as THREE from 'three';

interface HeartModel3DProps {
  heartRate: number;
  isAnimating: boolean;
  healthScore: number;
}

function HeartModel3D({ heartRate, isAnimating, healthScore }: HeartModel3DProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/3d_model_of_a_human_heart.glb');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Heart beating animation based on heart rate
  useFrame((state, delta) => {
    if (group.current && isAnimating) {
      // Rotate the heart slowly
      setRotation(prev => prev + delta * 0.3);
      group.current.rotation.y = rotation;

      // Pulsing effect based on heart rate (60-100 BPM normal range)
      const beatFrequency = heartRate / 60; // beats per second
      const time = state.clock.getElapsedTime();
      const pulse = Math.sin(time * beatFrequency * Math.PI * 2) * 0.1 + 1;
      setScale(pulse);
      group.current.scale.setScalar(scale * 0.8);

      // Color intensity based on health score
      const intensity = healthScore / 100;
      if (scene.traverse) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.emissive.setRGB(intensity * 0.3, 0, 0);
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive.setRGB(intensity * 0.3, 0, 0);
            }
          }
        });
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

interface VitalSignsProps {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  oxygenSaturation: number;
  healthScore: number;
}

interface Heart3DDashboardProps {
  className?: string;
  vitalSigns?: VitalSignsProps;
  showControls?: boolean;
}

export const Heart3DDashboard: React.FC<Heart3DDashboardProps> = ({
  className = '',
  vitalSigns = {
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    oxygenSaturation: 98,
    healthScore: 85
  },
  showControls = true
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [viewMode, setViewMode] = useState<'normal' | 'xray' | 'detailed'>('normal');

  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: 'Low', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (hr > 100) return { status: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    return { status: 'Normal', color: 'text-green-400', bgColor: 'bg-green-500/20' };
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic > 140 || diastolic > 90) return { status: 'High', color: 'text-red-400' };
    if (systolic < 90 || diastolic < 60) return { status: 'Low', color: 'text-blue-400' };
    return { status: 'Normal', color: 'text-green-400' };
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const hrStatus = getHeartRateStatus(vitalSigns.heartRate);
  const bpStatus = getBPStatus(vitalSigns.bloodPressure.systolic, vitalSigns.bloodPressure.diastolic);

  return (
    <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">3D Heart Monitor</h3>
          </div>
          {showControls && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                title={isAnimating ? 'Pause Animation' : 'Start Animation'}
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setViewMode(prev => 
                  prev === 'normal' ? 'xray' : prev === 'xray' ? 'detailed' : 'normal'
                )}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xs transition-colors"
              >
                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* 3D Heart Visualization */}
        <div className="lg:col-span-2">
          <div className="relative h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [3, 2, 4], fov: 45 }}
              style={{ background: 'linear-gradient(to bottom, #1f2937, #111827)' }}
            >
              <Suspense fallback={
                <Html center>
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <div className="text-sm">Loading 3D Heart Model...</div>
                  </div>
                </Html>
              }>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                <pointLight position={[0, 0, 10]} intensity={0.8} color="#ff6b6b" />
                
                <HeartModel3D
                  heartRate={vitalSigns.heartRate}
                  isAnimating={isAnimating}
                  healthScore={vitalSigns.healthScore}
                />
                
                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={2}
                  maxDistance={8}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI / 1.5}
                />
                
                {/* Heart Rate Display in 3D Space */}
                <Text
                  position={[0, 2, 0]}
                  fontSize={0.3}
                  color="#ef4444"
                  anchorX="center"
                  anchorY="middle"
                >
                  {vitalSigns.heartRate} BPM
                </Text>
              </Suspense>
            </Canvas>

            {/* Overlay Status */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${hrStatus.bgColor} ${hrStatus.color}`}>
                <Activity className="w-3 h-3 inline mr-1" />
                {hrStatus.status}
              </div>
              {isAnimating && (
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Live
                </div>
              )}
            </div>

            {/* Health Score */}
            <div className="absolute top-4 right-4">
              <div className="bg-black/80 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${getHealthScoreColor(vitalSigns.healthScore)}`}>
                  {vitalSigns.healthScore}
                </div>
                <div className="text-xs text-gray-400">Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Signs Panel */}
        <div className="space-y-4">
          {/* Heart Rate */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-gray-300">Heart Rate</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${hrStatus.bgColor} ${hrStatus.color}`}>
                {hrStatus.status}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {vitalSigns.heartRate} <span className="text-sm font-normal text-gray-400">BPM</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((vitalSigns.heartRate / 120) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Blood Pressure</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded bg-gray-700 ${bpStatus.color}`}>
                {bpStatus.status}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic}
              <span className="text-sm font-normal text-gray-400 ml-1">mmHg</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400 mb-1">Systolic</div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full"
                    style={{ width: `${Math.min((vitalSigns.bloodPressure.systolic / 160) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Diastolic</div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full"
                    style={{ width: `${Math.min((vitalSigns.bloodPressure.diastolic / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Oxygen Saturation */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">O₂</span>
              </div>
              <span className="text-sm font-medium text-gray-300">Oxygen Saturation</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {vitalSigns.oxygenSaturation}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${vitalSigns.oxygenSaturation}%` }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors">
                📊 View Detailed Report
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors">
                📈 Heart Rate Trends
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors">
                🏥 Contact Doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preload the heart model
useGLTF.preload('/models/3d_model_of_a_human_heart.glb');

export default Heart3DDashboard;