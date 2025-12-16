import { useState } from "react";
import type { ExportProgress, Frame } from "@/types/video-generator";
import { FFmpegEncoder } from "@/lib/video-generator/ffmpeg-encoder";

export function useVideoExport(frames: Frame[], encoder: FFmpegEncoder | null) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null
  );

  const exportVideo = async () => {
    if (!encoder || frames.length === 0) {
      setExportProgress({
        phase: "error",
        progress: 0,
        message: "FFmpeg not loaded or no frames available",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress({
      phase: "preparing",
      progress: 0,
      message: "Preparing frames...",
    });

    try {
      // Update to encoding phase
      setExportProgress({
        phase: "encoding",
        progress: 0,
        message: "Encoding video with FFmpeg...",
      });

      // Encode with FFmpeg
      const videoData = await encoder.encodeVideo(frames, (progress) => {
        setExportProgress({
          phase: "encoding",
          progress: Math.min(progress, 90),
          message: `Encoding video... ${Math.round(progress)}%`,
        });
      });

      // Finalize
      setExportProgress({
        phase: "finalizing",
        progress: 95,
        message: "Finalizing video...",
      });

      // Download
      const blob = new Blob([new Uint8Array(videoData)], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ping-pong-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Complete
      setExportProgress({
        phase: "complete",
        progress: 100,
        message: "Video downloaded successfully!",
      });

      // Clear progress after 3 seconds
      setTimeout(() => {
        setExportProgress(null);
      }, 3000);
    } catch (error) {
      console.error("Export error:", error);
      setExportProgress({
        phase: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Export failed",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportVideo,
    isExporting,
    exportProgress,
  };
}
