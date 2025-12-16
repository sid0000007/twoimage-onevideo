import type { Frame, ProcessedImage } from "@/types/video-generator";
import { FRAME_DURATION_MS, VIDEO_CONFIG } from "@/types/video-generator";

export function generateFrameSequence(
  imageA: ProcessedImage,
  imageB: ProcessedImage
): Frame[] {
  const frames: Frame[] = [];

  for (let i = 0; i < VIDEO_CONFIG.frameCount; i++) {
    // Fast ping-pong pattern: 6 frames per image (0.125 seconds each)
    // This creates 32 switches over 4 seconds for rapid alternation
    // Switches every ~125ms: A→B→A→B→A→B... (32 times total)
    const isImageA = Math.floor(i / 12) % 2 === 0;
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
