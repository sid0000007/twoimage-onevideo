import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import type { Frame } from "@/types/video-generator";
import { VIDEO_CONFIG } from "@/types/video-generator";

export class FFmpegEncoder {
  private ffmpeg: FFmpeg;
  private loaded = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async initialize(
    onProgress?: (progress: number) => void,
    onLog?: (message: string) => void
  ): Promise<void> {
    this.ffmpeg.on("log", ({ message }) => {
      console.log("FFmpeg:", message);
      onLog?.(message);
    });

    this.ffmpeg.on("progress", ({ progress }) => {
      console.log("FFmpeg progress:", progress);
      onProgress?.(progress * 100);
    });

    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      this.loaded = true;
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load FFmpeg - Full error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to load FFmpeg: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async encodeVideo(
    frames: Frame[],
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    if (!this.loaded) {
      throw new Error("FFmpeg not loaded. Call initialize() first.");
    }

    console.log(`Encoding ${frames.length} frames to video...`);

    try {
      // Write frames to virtual FS as PNG images
      for (let i = 0; i < frames.length; i++) {
        const frameBlob = await this.imageDataToBlob(frames[i].imageData);
        const frameBuffer = await frameBlob.arrayBuffer();
        const fileName = `frame${i.toString().padStart(4, "0")}.png`;

        await this.ffmpeg.writeFile(fileName, new Uint8Array(frameBuffer));

        // Report progress for frame writing (0-20%)
        if (onProgress) {
          onProgress((i / frames.length) * 20);
        }
      }

      console.log("All frames written to FFmpeg virtual FS");

      // Execute FFmpeg command
      // -r 8: 8 FPS input/output
      // -i frame%04d.png: Input pattern
      // -c:v libx264: H.264 codec
      // -pix_fmt yuv420p: Pixel format (most compatible)
      // -t 4: Duration 4 seconds
      // -an: No audio
      await this.ffmpeg.exec([
        "-r",
        VIDEO_CONFIG.fps.toString(),
        "-i",
        "frame%04d.png",
        "-c:v",
        VIDEO_CONFIG.codec,
        "-pix_fmt",
        VIDEO_CONFIG.pixelFormat,
        "-t",
        VIDEO_CONFIG.duration.toString(),
        "-an",
        "output.mp4",
      ]);

      console.log("FFmpeg encoding complete");

      // Read output
      const data = await this.ffmpeg.readFile("output.mp4");

      // Cleanup virtual FS
      for (let i = 0; i < frames.length; i++) {
        await this.ffmpeg.deleteFile(
          `frame${i.toString().padStart(4, "0")}.png`
        );
      }
      await this.ffmpeg.deleteFile("output.mp4");

      console.log("FFmpeg virtual FS cleaned up");

      if (onProgress) {
        onProgress(100);
      }

      return data as Uint8Array;
    } catch (error) {
      console.error("FFmpeg encoding error:", error);
      throw new Error("Failed to encode video");
    }
  }

  private async imageDataToBlob(imageData: ImageData): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      }, "image/png");
    });
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}
