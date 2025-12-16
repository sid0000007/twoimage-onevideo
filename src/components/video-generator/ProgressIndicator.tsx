"use client";

import React from "react";
import type { ExportProgress } from "@/types/video-generator";

interface ProgressIndicatorProps {
  progress: ExportProgress;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const getPhaseColor = () => {
    switch (progress.phase) {
      case "complete":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "encoding":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getPhaseIcon = () => {
    switch (progress.phase) {
      case "complete":
        return "✓";
      case "error":
        return "✗";
      default:
        return "⋯";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {getPhaseIcon()} {progress.message}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress.progress)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getPhaseColor()}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {progress.phase === "error" && (
        <p className="text-sm text-red-600 mt-2">{progress.message}</p>
      )}

      {progress.phase === "complete" && (
        <p className="text-sm text-green-600 mt-2">
          Your video has been downloaded!
        </p>
      )}
    </div>
  );
}
