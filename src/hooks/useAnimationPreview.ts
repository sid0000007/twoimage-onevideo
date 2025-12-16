import { useEffect, useRef, useState } from "react";
import { AnimationEngine } from "@/lib/video-generator/animation-engine";
import { generateFrameSequence } from "@/lib/video-generator/frame-generator";
import type { ProcessedImage, Frame } from "@/types/video-generator";

export function useAnimationPreview(processedImages: ProcessedImage[]) {
  const engineRef = useRef<AnimationEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<Frame[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize engine
    if (!engineRef.current) {
      engineRef.current = new AnimationEngine();
    }

    // Cleanup on unmount
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    // Generate frames when images change
    if (processedImages.length === 2) {
      framesRef.current = generateFrameSequence(
        processedImages[0],
        processedImages[1]
      );
    } else {
      framesRef.current = [];
    }
  }, [processedImages]);

  const startPreview = (canvas: HTMLCanvasElement) => {
    if (!engineRef.current || framesRef.current.length === 0) {
      return;
    }

    canvasRef.current = canvas;
    engineRef.current.start(framesRef.current, canvas);
    setIsPlaying(true);
  };

  const pausePreview = () => {
    engineRef.current?.pause();
    setIsPlaying(false);
  };

  const resumePreview = () => {
    engineRef.current?.resume();
    setIsPlaying(true);
  };

  const togglePreview = () => {
    if (isPlaying) {
      pausePreview();
    } else {
      resumePreview();
    }
  };

  const stopPreview = () => {
    engineRef.current?.stop();
    setIsPlaying(false);
  };

  return {
    startPreview,
    pausePreview,
    resumePreview,
    togglePreview,
    stopPreview,
    isPlaying,
    frames: framesRef.current,
  };
}
