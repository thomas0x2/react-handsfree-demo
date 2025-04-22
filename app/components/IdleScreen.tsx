'use client';

import { useEffect, useState, useRef } from 'react';

interface Direction {
  dx: number;
  dy: number;
}

export default function IdleScreen() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const directionRef = useRef<Direction>({
    dx: Math.cos(Math.random() * 2 * Math.PI) * 1.5,
    dy: Math.sin(Math.random() * 2 * Math.PI) * 1.5
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation effect for the company name
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

      setPosition(prev => {
        const newX = prev.x + directionRef.current.dx;
        const newY = prev.y + directionRef.current.dy;

        // Handle bouncing with adjusted boundaries
        if (newX <= minX || newX >= maxX) {
          directionRef.current.dx *= -1;
          // Add slight vertical variation on horizontal bounce
          directionRef.current.dy += (Math.random() - 0.5) * 0.2;
        }
        if (newY <= minY || newY >= maxY) {
          directionRef.current.dy *= -1;
          // Add slight horizontal variation on vertical bounce
          directionRef.current.dx += (Math.random() - 0.5) * 0.2;
        }

        // Normalize speed after adding variation
        const currentSpeed = Math.sqrt(
          directionRef.current.dx * directionRef.current.dx + 
          directionRef.current.dy * directionRef.current.dy
        );
        const targetSpeed = 1.5;
        directionRef.current.dx = (directionRef.current.dx / currentSpeed) * targetSpeed;
        directionRef.current.dy = (directionRef.current.dy / currentSpeed) * targetSpeed;

        return {
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY))
        };
      });
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
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      clearInterval(interval);
      // Cleanup media streams
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Hidden video element for webcam feed */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      
      {/* Animated company name */}
      <div
        ref={textRef}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 text-6xl font-serif text-white whitespace-nowrap"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transition: 'all 0.2s linear'
        }}
      >
        AS Bergern
      </div>
    </div>
  );
} 