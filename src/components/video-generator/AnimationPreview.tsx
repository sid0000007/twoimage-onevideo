"use client";

import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ProcessedImage } from "@/types/video-generator";

interface AnimationPreviewProps {
  processedImages: ProcessedImage[];
  isPlaying: boolean;
  onStartPreview: (canvas: HTMLCanvasElement) => void;
  onTogglePreview: () => void;
}

export function AnimationPreview({
  processedImages,
  isPlaying,
  onStartPreview,
  onTogglePreview,
}: AnimationPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (
      processedImages.length === 2 &&
      canvasRef.current &&
      !hasStartedRef.current
    ) {
      // Set canvas dimensions
      const canvas = canvasRef.current;
      canvas.width = processedImages[0].dimensions.width;
      canvas.height = processedImages[0].dimensions.height;

      // Start preview
      onStartPreview(canvas);
      hasStartedRef.current = true;
    }

    return () => {
      hasStartedRef.current = false;
    };
  }, [processedImages, onStartPreview]);

  if (processedImages.length !== 2) {
    return null;
  }

  const dimensions = processedImages[0].dimensions;
  const maxWidth = 800;
  const scale = Math.min(1, maxWidth / dimensions.width);
  const displayWidth = dimensions.width * scale;
  const displayHeight = dimensions.height * scale;

  return (
    <Card title="Preview">
      <div className="space-y-4">
        <div className="flex justify-center bg-gray-100 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              imageRendering: "auto",
            }}
            className="border border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={onTogglePreview} variant="primary">
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>8 FPS ping-pong animation • 4 seconds • 32 frames</p>
          {processedImages.some((img) => img.letterboxed) && (
            <p className="text-yellow-700 mt-2">
              ⚠ Letterboxing applied due to different aspect ratios
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
