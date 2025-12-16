export interface Dimensions {
  width: number;
  height: number;
}

export interface AspectRatio {
  width: number;
  height: number;
  decimal: number;
}

export interface UploadedImage {
  file: File;
  url: string;
  aspectRatio: AspectRatio;
}

export interface ProcessedImage {
  imageData: ImageData;
  canvas: HTMLCanvasElement;
  dimensions: Dimensions;
  originalDimensions: Dimensions;
  letterboxed: boolean;
}

export interface VideoConfig {
  fps: 16;
  duration: 4;
  frameCount: 64;
  codec: "libx264";
  pixelFormat: "yuv420p";
}

export interface Frame {
  imageData: ImageData;
  frameNumber: number;
  timestamp: number;
}

export interface ExportProgress {
  phase: "preparing" | "encoding" | "finalizing" | "complete" | "error";
  progress: number;
  message: string;
}

export interface VideoGeneratorState {
  images: UploadedImage[];
  processedImages: ProcessedImage[];
  isPreviewPlaying: boolean;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  error: string | null;
}

export const VIDEO_CONFIG: VideoConfig = {
  fps: 16,
  duration: 4,
  frameCount: 64,
  codec: "libx264",
  pixelFormat: "yuv420p",
};

export const FRAME_DURATION_MS = 62.5;
