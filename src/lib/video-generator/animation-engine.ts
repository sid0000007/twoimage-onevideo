import type { Frame } from "@/types/video-generator";
import { getFrameAtTime } from "./frame-generator";

export class AnimationEngine {
  private rafId: number | null = null;
  private startTime: number = 0;
  private frames: Frame[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isPlaying: boolean = false;

  start(frames: Frame[], canvas: HTMLCanvasElement): void {
    this.frames = frames;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    if (!this.ctx) {
      throw new Error("Failed to get 2D context");
    }

    this.isPlaying = true;
    this.startTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    if (!this.isPlaying || !this.ctx) {
      return;
    }

    const elapsed = performance.now() - this.startTime;
    const frame = getFrameAtTime(this.frames, elapsed);

    // Render frame to canvas
    this.ctx.putImageData(frame.imageData, 0, 0);

    this.rafId = requestAnimationFrame(this.animate);
  };

  pause(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = performance.now() - (this.getCurrentTime() || 0);
    this.animate();
  }

  stop(): void {
    this.pause();
    this.startTime = 0;
  }

  toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private getCurrentTime(): number {
    if (!this.startTime) return 0;
    return performance.now() - this.startTime;
  }
}
