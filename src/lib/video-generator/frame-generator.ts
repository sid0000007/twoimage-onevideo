import type { Frame, ProcessedImage } from "@/types/video-generator";
import { FRAME_DURATION_MS, VIDEO_CONFIG } from "@/types/video-generator";

export function generateFrameSequence(
  imageA: ProcessedImage,
  imageB: ProcessedImage
): Frame[] {
  const frames: Frame[] = [];

  for (let i = 0; i < VIDEO_CONFIG.frameCount; i++) {
    // Ping-pong pattern: 16 frames A, 16 frames B, repeat
    // Frame 0-15: Image A (0ms - 937.5ms)
    // Frame 16-31: Image B (1000ms - 1937.5ms)
    // Frame 32-47: Image A (2000ms - 2937.5ms)
    // Frame 48-63: Image B (3000ms - 3937.5ms)
    const isImageA = Math.floor(i / 16) % 2 === 0;
    const sourceImage = isImageA ? imageA : imageB;

    frames.push({
      imageData: sourceImage.imageData,
      frameNumber: i,
      timestamp: i * FRAME_DURATION_MS,
    });
  }

  return frames;
}

export function getFrameAtTime(frames: Frame[], timeMs: number): Frame {
  const loopDuration = VIDEO_CONFIG.duration * 1000;
  const currentTime = timeMs % loopDuration;
  const frameIndex = Math.floor(currentTime / FRAME_DURATION_MS);

  // Ensure index is within bounds
  const safeIndex = Math.min(frameIndex, frames.length - 1);

  return frames[safeIndex];
}
