import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Heart, Play, Pause } from 'lucide-react';
import * as THREE from 'three';
import { ZoomResponsive3DModel } from '@/components/ZoomResponsiveContainer';

interface HeartPreviewProps {
  heartRate?: number;
  isAnimating?: boolean;
}

function HeartModel3D({ heartRate = 72, isAnimating = true }: HeartPreviewProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/3d_model_of_a_human_heart.glb');
  const [scale, setScale] = useState(1);

  // Heart beating animation
  useFrame((state, delta) => {
    if (group.current && isAnimating) {
      // Slow rotation
      group.current.rotation.y += delta * 0.2;

      // Pulsing effect based on heart rate
      const beatFrequency = heartRate / 60; // beats per second
      const time = state.clock.getElapsedTime();
      const pulse = Math.sin(time * beatFrequency * Math.PI * 2) * 0.05 + 1;
      setScale(pulse);
      group.current.scale.setScalar(scale * 0.6);
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

interface Heart3DPreviewProps {
  className?: string;
  heartRate?: number;
  showControls?: boolean;
  width?: number;
  height?: number;
}

export const Heart3DPreview: React.FC<Heart3DPreviewProps> = ({
  className = '',
  heartRate = 72,
  showControls = false,
  width = 400,
  height = 192
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <ZoomResponsive3DModel 
      className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden ${className}`}
      width={width}
      height={height}
    >
      {/* 3D Canvas */}
      <div className="relative h-48 w-full">
        <Canvas
          className="zoom-responsive"
          camera={{ position: [2, 1, 3], fov: 50 }}
          style={{ 
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            width: '100%',
            height: '100%'
          }}
        >
          <Suspense fallback={
            <Html center>
              <div className="text-white text-center">
                <div className="animate-spin w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-xs">Loading Heart...</div>
              </div>
            </Html>
          }>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[0, 0, 5]} intensity={0.8} color="#ff6b6b" />
            
            <HeartModel3D
              heartRate={heartRate}
              isAnimating={isAnimating}
            />
            
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={true}
              autoRotate={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Suspense>
        </Canvas>

        {/* Heart Rate Overlay */}
        <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium">
          <Heart className="w-3 h-3 inline mr-1 text-red-400" />
          {heartRate} BPM
        </div>

        {/* Controls */}
        {showControls && (
          <div className="absolute top-3 right-3">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="p-2 bg-black/80 hover:bg-black/90 rounded-full text-white transition-colors"
              title={isAnimating ? 'Pause' : 'Play'}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-white text-xs">
            {isAnimating ? 'Live' : 'Paused'}
          </span>
        </div>
      </div>
    </ZoomResponsive3DModel>
  );
};

// Preload the heart model
useGLTF.preload('/models/3d_model_of_a_human_heart.glb');

export default Heart3DPreview;