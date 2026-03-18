import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';

interface SquatDetectorProps {
  isActive: boolean;
  onRepDetected: () => void;
  onAngleUpdate: (angle: number) => void;
  onPoseDetected: (detected: boolean) => void;
  className?: string;
  voiceFeedbackEnabled?: boolean;
}

export const SquatDetector: React.FC<SquatDetectorProps> = ({
  isActive,
  onRepDetected,
  onAngleUpdate,
  onPoseDetected,
  className = '',
  voiceFeedbackEnabled = true
}) => {
  const {
    isLoaded,
    isDetecting,
    landmarks,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    getSquatAngles
  } = useMediaPipePose();

  const [repState, setRepState] = useState<'up' | 'down' | 'detecting'>('detecting');
  const [lastRepTime, setLastRepTime] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(160);
  const [voiceEnabled, setVoiceEnabled] = useState(voiceFeedbackEnabled);

  // Voice feedback functionality
  const speakFeedback = useCallback((message: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.2; // Slightly faster speech
    utterance.pitch = 1.1; // Slightly higher pitch for encouragement
    utterance.volume = 0.8; // Not too loud
    
    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Voice feedback messages
  const voiceMessages = {
    goodRep: ['Good rep!', 'Nice!', 'Perfect!', 'Great form!', 'Excellent!'],
    encouragement: ['Keep going!', 'You got this!', 'Stay strong!'],
    formTips: ['Go deeper!', 'Stand up straight!', 'Good posture!']
  };

  const getRandomMessage = (messageType: keyof typeof voiceMessages) => {
    const messages = voiceMessages[messageType];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Squat detection thresholds
  const SQUAT_CONFIG = {
    STANDING_THRESHOLD: 150,  // Legs extended (standing position)
    SQUAT_THRESHOLD: 90,      // Deep squat position
    MIN_REP_TIME: 1200,       // Minimum time between reps (1.2 seconds)
    ANGLE_SMOOTHING: 0.7      // Smoothing factor for angle changes
  };

  // Squat rep counting logic with voice feedback
  const countSquatReps = useCallback(() => {
    const angles = getSquatAngles();
    if (!angles) return;

    // Use average of both legs for more accurate detection
    const legAngle = angles.averageLegAngle();
    
    // Smooth the angle to reduce noise
    setCurrentAngle(prev => prev * SQUAT_CONFIG.ANGLE_SMOOTHING + legAngle * (1 - SQUAT_CONFIG.ANGLE_SMOOTHING));
    onAngleUpdate(currentAngle);

    const currentTime = Date.now();
    const timeSinceLastRep = currentTime - lastRepTime;

    // State machine for squat rep counting
    if (currentAngle < SQUAT_CONFIG.SQUAT_THRESHOLD && repState !== 'down') {
      setRepState('down');
      console.log(`🔽 Squat DOWN: ${currentAngle.toFixed(0)}°`);
      
      // Voice feedback for good squat depth
      if (currentAngle < 80) {
        speakFeedback(getRandomMessage('formTips'));
      }
    } else if (
      currentAngle > SQUAT_CONFIG.STANDING_THRESHOLD && 
      repState === 'down' && 
      timeSinceLastRep > SQUAT_CONFIG.MIN_REP_TIME
    ) {
      setRepState('up');
      setLastRepTime(currentTime);
      onRepDetected();
      
      // 🎉 VOICE FEEDBACK FOR SUCCESSFUL REP
      speakFeedback(getRandomMessage('goodRep'));
      
      console.log(`✅ Squat REP: ${currentAngle.toFixed(0)}°`);
      setTimeout(() => setRepState('detecting'), 500);
    }
  }, [getSquatAngles, repState, lastRepTime, currentAngle, onRepDetected, onAngleUpdate, speakFeedback, getRandomMessage]);

  // Initialize voice synthesis
  useEffect(() => {
    if (window.speechSynthesis) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      } else {
        loadVoices();
      }
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Start/stop detection based on active state
  useEffect(() => {
    if (isActive && isLoaded && !isDetecting) {
      startDetection();
    } else if (!isActive && isDetecting) {
      stopDetection();
    }
  }, [isActive, isLoaded, isDetecting, startDetection, stopDetection]);

  // Update pose detection status
  useEffect(() => {
    onPoseDetected(landmarks.length > 0);
  }, [landmarks, onPoseDetected]);

  // Count reps when landmarks update
  useEffect(() => {
    if (isActive && landmarks.length > 0) {
      countSquatReps();
    }
  }, [landmarks, isActive, countSquatReps]);

  // Reset state when component mounts
  useEffect(() => {
    setRepState('detecting');
    setLastRepTime(0);
    setCurrentAngle(160);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🦵</div>
          <div>Loading Squat AI...</div>
          <div className="text-sm opacity-80 mt-1">MediaPipe pose detection</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ display: isActive ? 'block' : 'none' }}
      />

      {/* Pose overlay canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          display: isActive && landmarks.length > 0 ? 'block' : 'none',
          zIndex: 10
        }}
      />

      {/* Status indicators */}
      {isActive && (
        <div className="absolute top-4 left-4 space-y-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            landmarks.length > 0 
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            {landmarks.length > 0 ? '✅ Squat Pose Detected' : '❌ Position Yourself'}
          </div>
          
          {landmarks.length > 0 && (
            <>
              <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                Leg Angle: {currentAngle.toFixed(0)}°
              </div>
              <div className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                Stage: {repState}
              </div>
              <div className="bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentAngle < 100 ? '🔽 Squat Down' : 
                 currentAngle > 140 ? '🔼 Stand Up' : 
                 '⚡ In Motion'}
              </div>
              
              {/* Voice Control */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  voiceEnabled 
                    ? 'bg-green-500/80 text-white hover:bg-green-600/80' 
                    : 'bg-gray-500/80 text-white hover:bg-gray-600/80'
                }`}
              >
                {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Squat instructions */}
      {isActive && landmarks.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg max-w-xs">
          <div className="text-sm font-semibold mb-1">🦵 Squat Instructions:</div>
          <div className="text-xs">
            • Stand facing the camera<br/>
            • Feet shoulder-width apart<br/>
            • Squat down until thighs parallel<br/>
            • Stand back up to complete rep<br/>
            • Keep your back straight
          </div>
        </div>
      )}

      {/* Form feedback */}
      {isActive && landmarks.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded-lg">
          <div className="text-xs">
            {currentAngle > 150 ? '✅ Good standing position' :
             currentAngle < 100 ? '✅ Good squat depth' :
             currentAngle < 120 ? '⚠️ Go deeper for full rep' :
             '🔄 Keep moving'}
          </div>
        </div>
      )}

      {/* Placeholder when not active */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
          <div className="text-6xl mb-4">🦵</div>
          <div className="text-xl font-semibold mb-2">Squat Detector</div>
          <div className="text-sm opacity-80">Real MediaPipe AI for squats</div>
        </div>
      )}
    </div>
  );
};