"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "./ProgressIndicator";
import type { ExportProgress } from "@/types/video-generator";

interface ExportControlsProps {
  onExport: () => void;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  disabled: boolean;
}

export function ExportControls({
  onExport,
  isExporting,
  exportProgress,
  disabled,
}: ExportControlsProps) {
  return (
    <Card title="Generate Video">
      <div className="space-y-4">
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Video Duration: 4 seconds</p>
          <p>• Frame Rate: 8 FPS</p>
          <p>• Format: H.264 MP4</p>
          <p>• Pattern: A → B → A → B (1 second each)</p>
        </div>

        {exportProgress && <ProgressIndicator progress={exportProgress} />}

        <Button
          onClick={onExport}
          disabled={disabled || isExporting}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isExporting ? "Generating..." : "Generate & Download Video"}
        </Button>

        {disabled && !isExporting && (
          <p className="text-sm text-gray-500 text-center">
            FFmpeg is loading... Please wait.
          </p>
        )}
      </div>
    </Card>
  );
}
