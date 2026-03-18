import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html, Text } from '@react-three/drei';
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import * as THREE from 'three';

interface SquatModel3DProps {
  modelPath: string;
  isPlaying: boolean;
  playbackSpeed: number;
  onAnimationProgress: (progress: number) => void;
}

function SquatModel3D({ modelPath, isPlaying, playbackSpeed, onAnimationProgress }: SquatModel3DProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, group);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const actionName = Object.keys(actions)[0];
      const action = actions[actionName];
      
      if (action) {
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.play();
        
        setDuration(action.getClip().duration);
        
        if (!isPlaying) {
          action.paused = true;
        } else {
          action.paused = false;
          action.timeScale = playbackSpeed;
        }
      }
    }
  }, [actions, isPlaying, playbackSpeed]);

  useFrame((state, delta) => {
    if (mixer && isPlaying) {
      mixer.update(delta);
      
      if (actions && Object.keys(actions).length > 0) {
        const actionName = Object.keys(actions)[0];
        const action = actions[actionName];
        
        if (action) {
          const progress = (action.time % action.getClip().duration) / action.getClip().duration;
          setCurrentTime(action.time % action.getClip().duration);
          onAnimationProgress(progress);
        }
      }
    }
  });

  // Set animation time manually when not playing
  useEffect(() => {
    if (!isPlaying && actions && Object.keys(actions).length > 0) {
      const actionName = Object.keys(actions)[0];
      const action = actions[actionName];
      if (action && mixer) {
        action.time = currentTime;
        mixer.update(0);
      }
    }
  }, [currentTime, isPlaying, actions, mixer]);

  return (
    <group ref={group} position={[0, -0.5, 0]} scale={[0.8, 0.8, 0.8]}>
      <primitive object={scene} />
    </group>
  );
}

interface SquatTutorial3DProps {
  className?: string;
  autoPlay?: boolean;
  showInstructions?: boolean;
}

export const SquatTutorial3D: React.FC<SquatTutorial3DProps> = ({
  className = '',
  autoPlay = false,
  showInstructions = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('Standing');

  const modelPath = '/models/Air Squat.glb';

  // Determine squat phase based on animation progress
  useEffect(() => {
    if (progress < 0.2) {
      setCurrentPhase('Standing');
    } else if (progress < 0.5) {
      setCurrentPhase('Descending');
    } else if (progress < 0.7) {
      setCurrentPhase('Bottom Position');
    } else {
      setCurrentPhase('Ascending');
    }
  }, [progress]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
  };

  const squatInstructions = {
    'Standing': [
      '🦵 Stand with feet shoulder-width apart',
      '👀 Keep your chest up and eyes forward',
      '💪 Engage your core muscles'
    ],
    'Descending': [
      '⬇️ Lower your body by bending knees and hips',
      '🍑 Push your hips back like sitting in a chair',
      '⚖️ Keep your weight on your heels'
    ],
    'Bottom Position': [
      '📐 Thighs should be parallel to the ground',
      '🦵 Knees should track over your toes',
      '📏 Maintain straight back posture'
    ],
    'Ascending': [
      '⬆️ Drive through your heels to stand up',
      '🍑 Push your hips forward',
      '💪 Squeeze your glutes at the top'
    ]
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Compressed 3D Canvas - Video Frame Size */}
      <div className="relative h-64 bg-gradient-to-b from-gray-800 to-gray-900">
        <Canvas
          camera={{ position: [2, 1, 3.5], fov: 40 }}
          style={{ background: 'linear-gradient(to bottom, #1f2937, #111827)' }}
        >
          <Suspense fallback={
            <Html center>
              <div className="text-white text-center">
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Loading 3D Model...</div>
              </div>
            </Html>
          }>
            <ambientLight intensity={0.7} />
            <directionalLight position={[8, 8, 5] } intensity={1.2} />
            <directionalLight position={[-8, -8, -5]} intensity={0.4} />
            
            <SquatModel3D
              modelPath={modelPath}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onAnimationProgress={handleProgressChange}
            />
            
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={5}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
            />
            
            {/* Compact 3D Text Label */}
            <Text
              position={[0, 1.8, 0]}
              fontSize={0.2}
              color="#4ade80"
              anchorX="center"
              anchorY="middle"
            >
              {currentPhase}
            </Text>
          </Suspense>
        </Canvas>

        {/* Compact Phase Indicator */}
        <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
          <div className="font-semibold">{currentPhase}</div>
          <div className="text-xs opacity-80">{Math.round(progress * 100)}%</div>
        </div>

        {/* Compact Speed Indicator */}
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
          <div className="font-semibold">{playbackSpeed}x</div>
        </div>
      </div>

      {/* Compact Video-like Controls */}
      <div className="bg-gray-800 p-3">
        {/* Compact Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Compact Control Buttons */}
        <div className="flex items-center justify-center space-x-2 mb-3">
          <button
            onClick={handleRestart}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setProgress(Math.max(0, progress - 0.1))}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            title="Rewind"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setProgress(Math.min(1, progress + 0.1))}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            title="Fast Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleSpeedChange}
            className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Compact Instructions Panel */}
        {showInstructions && (
          <div className="bg-gray-700 rounded p-3">
            <h4 className="text-white font-medium mb-2 text-sm flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {currentPhase}
            </h4>
            <ul className="text-gray-300 text-xs space-y-1">
              {squatInstructions[currentPhase as keyof typeof squatInstructions]?.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-1 text-green-400">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Preload the GLB model
useGLTF.preload('/models/Air Squat.glb');

export default SquatTutorial3D;