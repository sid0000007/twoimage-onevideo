import { useEffect, useRef, useState } from "react";
import { FFmpegEncoder } from "@/lib/video-generator/ffmpeg-encoder";

export function useFFmpeg() {
  const encoderRef = useRef<FFmpegEncoder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const encoder = new FFmpegEncoder();
    encoderRef.current = encoder;

    encoder
      .initialize(
        (progress) => {
          setLoadProgress(progress);
        },
        (message) => {
          console.log("FFmpeg log:", message);
        }
      )
      .then(() => {
        setIsLoaded(true);
        setLoadProgress(100);
      })
      .catch((err) => {
        setLoadError(err.message);
        console.error("FFmpeg load error:", err);
      });
  }, []);

  return {
    encoder: encoderRef.current,
    isLoaded,
    loadError,
    loadProgress,
  };
}
