'use client';

import { useEffect, useState, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface Direction {
  dx: number;
  dy: number;
}

interface GestureState {
  isHandPresent: boolean;
  lastGesture: string | null;
  confidence: number;
}

export default function IdleScreen() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const directionRef = useRef<Direction>({
    dx: Math.cos(Math.random() * 2 * Math.PI) * 0.75,
    dy: Math.sin(Math.random() * 2 * Math.PI) * 0.75
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [permissionGiven, setPermissionGiven] = useState(false);
  const permissionGivenRef = useRef(permissionGiven);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isHandPresent: false,
    lastGesture: null,
    confidence: 0
  });

  // Effect to keep the ref in sync with the state
  useEffect(() => {
    permissionGivenRef.current = permissionGiven;
  }, [permissionGiven]);

  useEffect(() => {
    let animationFrameId: number;
    
    const initializeHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
    };

    const detectHands = async () => {
      if (!videoRef.current || !handLandmarkerRef.current) return;
      
      const startTimeMs = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]; // Use first hand
        
        // Basic gesture detection
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        // Calculate distance between thumb and index finger
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // Update gesture state based on hand position
        setGestureState({
          isHandPresent: true,
          lastGesture: distance < 0.1 ? 'pinch' : 'open',
          confidence: results.handedness[0][0].score
        });
      } else {
        setGestureState({
          isHandPresent: false,
          lastGesture: null,
          confidence: 0
        });
      }

      // Continue the detection loop
      animationFrameId = requestAnimationFrame(detectHands);
    };

    // Animation effect for the circle
    const animate = () => {
      if (!textRef.current || !containerRef.current) return;

      const textRect = textRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate boundaries in percentage, accounting for element width/height
      const textWidthPercent = (textRect.width / containerRect.width) * 100;
      const textHeightPercent = (textRect.height / containerRect.height) * 100;
      const minX = textWidthPercent / 2;
      const maxX = 100 - textWidthPercent / 2;
      const minY = textHeightPercent / 2;
      const maxY = 100 - textHeightPercent / 2;

      if (permissionGivenRef.current) {
        setPosition(prev => {
          const newX = prev.x + directionRef.current.dx;
          const newY = prev.y + directionRef.current.dy;

          if (newX <= minX || newX >= maxX) {
            directionRef.current.dx *= -1;
            directionRef.current.dy += (Math.random() - 0.5) * 0.2;
          }
          if (newY <= minY || newY >= maxY) {
            directionRef.current.dy *= -1;
            directionRef.current.dx += (Math.random() - 0.5) * 0.2;
          }

          const currentSpeed = Math.sqrt(
            directionRef.current.dx * directionRef.current.dx + 
            directionRef.current.dy * directionRef.current.dy
          );
          if (currentSpeed > 0) {
            const targetSpeed = 0.75;
            directionRef.current.dx = (directionRef.current.dx / currentSpeed) * targetSpeed;
            directionRef.current.dy = (directionRef.current.dy / currentSpeed) * targetSpeed;
          }

          return {
            x: Math.max(minX, Math.min(maxX, newX)),
            y: Math.max(minY, Math.min(maxY, newY))
          };
        });
      }
    };

    const interval = setInterval(animate, 33);

    // Initialize media devices
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to be ready
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });
        }
        setPermissionGiven(true);
        
        // Initialize hand tracking after media is set up
        await initializeHandLandmarker();
        // Start the detection loop
        detectHands();
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          console.error('Permission denied for media devices:', error);
          setPermissionGiven(false);
        } else if (error instanceof Error) {
          console.error('Error initializing media:', error.message);
          setPermissionGiven(false);
        } else {
          console.error('An unknown error occurred during media initialization');
          setPermissionGiven(false);
        }
      }
    };

    initializeMedia();

    return () => {
      clearInterval(interval);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Visual feedback based on gesture state
  const circleStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transition: 'all 0.2s linear',
    width: '180px',
    height: '180px',
    boxShadow: gestureState.isHandPresent 
      ? `0 0 20px 10px rgba(255,255,255,${gestureState.confidence})`
      : 'none'
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 relative overflow-hidden">
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      
      <div
        ref={textRef}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
        style={circleStyle}
      />

      {/* Debug overlay */}
      {gestureState.isHandPresent && (
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded">
          Gesture: {gestureState.lastGesture}<br />
          Confidence: {(gestureState.confidence * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
} 