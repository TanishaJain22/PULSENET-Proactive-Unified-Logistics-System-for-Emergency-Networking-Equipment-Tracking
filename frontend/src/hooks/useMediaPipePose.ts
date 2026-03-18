import { useEffect, useRef, useState, useCallback } from 'react';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: PoseLandmark[];
}

declare global {
  interface Window {
    Pose: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
  }
}

export const useMediaPipePose = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pose, setPose] = useState<any>(null);
  const [camera, setCamera] = useState<any>(null);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load MediaPipe scripts dynamically
  const loadMediaPipe = useCallback(async () => {
    if (window.Pose) {
      setIsLoaded(true);
      return;
    }

    try {
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
      ];

      for (const src of scripts) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load MediaPipe:', error);
    }
  }, []);

  // Initialize pose detection with optimized settings for squats
  const initializePose = useCallback(async () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    try {
      const poseInstance = new window.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      // Optimized settings for squat detection
      poseInstance.setOptions({
        modelComplexity: 1,        // Balanced model for leg detection
        smoothLandmarks: true,     // Smooth tracking for squats
        enableSegmentation: false, // No segmentation needed
        minDetectionConfidence: 0.6, // Higher confidence for squats
        minTrackingConfidence: 0.5
      });

      poseInstance.onResults((results: PoseResults) => {
        if (results.poseLandmarks) {
          setLandmarks(results.poseLandmarks);
          drawPose(results);
        }
      });

      setPose(poseInstance);

      // Initialize camera with good resolution for squat detection
      const cameraInstance = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseInstance) {
            await poseInstance.send({ image: videoRef.current });
          }
        },
        width: 640,  // Good resolution for leg tracking
        height: 480
      });

      setCamera(cameraInstance);
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
    }
  }, [isLoaded]);

  // Optimized drawing function for squats (focus on legs)
  const drawPose = useCallback((results: PoseResults) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw full pose connections
    if (window.drawConnectors && window.POSE_CONNECTIONS) {
      window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 3
      });
    }

    // Highlight leg joints for squats
    const legJoints = [23, 24, 25, 26, 27, 28]; // Hips, knees, ankles
    ctx.fillStyle = '#FF0000';
    legJoints.forEach(index => {
      const landmark = results.poseLandmarks[index];
      if (landmark) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw all other landmarks smaller
    if (window.drawLandmarks) {
      window.drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FFFF00',
        lineWidth: 1,
        radius: 3
      });
    }
  }, []);

  // Calculate angle between three points
  const calculateAngle = useCallback((point1: PoseLandmark, point2: PoseLandmark, point3: PoseLandmark): number => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }, []);

  // Get squat-specific angles
  const getSquatAngles = useCallback(() => {
    if (landmarks.length < 33) return null;

    const LANDMARKS = {
      LEFT_HIP: 23,
      LEFT_KNEE: 25,
      LEFT_ANKLE: 27,
      RIGHT_HIP: 24,
      RIGHT_KNEE: 26,
      RIGHT_ANKLE: 28
    };

    return {
      // Left leg angle (hip-knee-ankle)
      leftLegAngle: calculateAngle(
        landmarks[LANDMARKS.LEFT_HIP],
        landmarks[LANDMARKS.LEFT_KNEE],
        landmarks[LANDMARKS.LEFT_ANKLE]
      ),
      // Right leg angle (hip-knee-ankle)
      rightLegAngle: calculateAngle(
        landmarks[LANDMARKS.RIGHT_HIP],
        landmarks[LANDMARKS.RIGHT_KNEE],
        landmarks[LANDMARKS.RIGHT_ANKLE]
      ),
      // Average leg angle for squats
      averageLegAngle: function() {
        return (this.leftLegAngle + this.rightLegAngle) / 2;
      }
    };
  }, [landmarks, calculateAngle]);

  const startDetection = useCallback(async () => {
    if (camera) {
      try {
        await camera.start();
        setIsDetecting(true);
      } catch (error) {
        console.error('Failed to start camera:', error);
      }
    }
  }, [camera]);

  const stopDetection = useCallback(() => {
    if (camera) {
      camera.stop();
      setIsDetecting(false);
    }
  }, [camera]);

  useEffect(() => {
    loadMediaPipe();
  }, [loadMediaPipe]);

  useEffect(() => {
    if (isLoaded) {
      initializePose();
    }
  }, [isLoaded, initializePose]);

  return {
    isLoaded,
    isDetecting,
    landmarks,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    getSquatAngles
  };
};