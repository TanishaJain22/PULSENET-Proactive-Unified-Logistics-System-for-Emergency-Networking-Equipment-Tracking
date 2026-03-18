import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ZoomResponsive3DModel } from '@/components/ZoomResponsiveContainer';

interface SimpleHeartModelProps {
  heartRate?: number;
}

function SimpleHeartModel({ heartRate = 72 }: SimpleHeartModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/3d_model_of_a_human_heart.glb');

  useFrame((state, delta) => {
    if (group.current) {
      // Continuous 360-degree rotation
      group.current.rotation.y += delta * 0.5; // Adjust speed as needed
      
      // Heart pumping animation based on heart rate
      const beatFrequency = Math.round(heartRate) / 60; // beats per second
      const time = state.clock.getElapsedTime();
      const pump = Math.sin(time * beatFrequency * Math.PI * 2) * 0.08 + 1;
      group.current.scale.setScalar(pump * 1.0); // Reduced from 1.2 to fit better
    }
  });

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

interface SimpleHeart3DProps {
  className?: string;
  heartRate?: number;
  height?: string;
  width?: number;
  heightPx?: number;
}

export const SimpleHeart3D: React.FC<SimpleHeart3DProps> = ({
  className = '',
  heartRate = 72,
  height = 'h-96',
  width = 400,
  heightPx = 384
}) => {
  // Adjust camera distance based on container height for better framing
  const cameraDistance = heightPx < 200 ? 3.5 : 2.5;
  
  return (
    <ZoomResponsive3DModel 
      className={`relative overflow-hidden ${height} ${className}`}
      width={width}
      height={heightPx}
    >
      <Canvas
        className="zoom-responsive"
        camera={{ position: [2, 0.5, cameraDistance], fov: 50 }}
        style={{ background: 'transparent', width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
      >
        <Suspense fallback={
          <Html center>
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm">Loading Heart...</div>
            </div>
          </Html>
        }>
          {/* Lighting setup for a nice heart visualization */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[0, 0, 10]} intensity={1.2} color="#ff4444" />
          <pointLight position={[5, 5, 0]} intensity={0.8} color="#ff6b6b" />
          
          <SimpleHeartModel heartRate={heartRate} />
        </Suspense>
      </Canvas>
      
      {/* Simple heart rate indicator - floating overlay */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">{Math.round(heartRate)} BPM</span>
        </div>
      </div>
    </ZoomResponsive3DModel>
  );
};

// Preload the heart model
useGLTF.preload('/models/3d_model_of_a_human_heart.glb');

export default SimpleHeart3D;