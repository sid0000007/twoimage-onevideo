import type { Frame, ProcessedImage } from "@/types/video-generator";
import { FRAME_DURATION_MS, VIDEO_CONFIG } from "@/types/video-generator";

export function generateFrameSequence(
  imageA: ProcessedImage,
  imageB: ProcessedImage
): Frame[] {
  const frames: Frame[] = [];

  for (let i = 0; i < VIDEO_CONFIG.frameCount; i++) {
    // Ping-pong pattern: 8 frames A, 8 frames B, repeat
    // Frame 0-7: Image A (0ms - 875ms)
    // Frame 8-15: Image B (1000ms - 1875ms)
    // Frame 16-23: Image A (2000ms - 2875ms)
    // Frame 24-31: Image B (3000ms - 3875ms)
    const isImageA = Math.floor(i / 8) % 2 === 0;
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
