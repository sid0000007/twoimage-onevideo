"use client";

import React from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAnimationPreview } from "@/hooks/useAnimationPreview";
import { useVideoExport } from "@/hooks/useVideoExport";
import { ImageUploader } from "./ImageUploader";
import { AnimationPreview } from "./AnimationPreview";
import { ExportControls } from "./ExportControls";

export function VideoGenerator() {
  const { encoder, isLoaded, loadError, loadProgress } = useFFmpeg();

  const {
    uploadedImages,
    processedImages,
    isProcessing,
    error: uploadError,
    uploadImages,
    clearImages,
  } = useImageUpload();

  const {
    startPreview,
    togglePreview,
    isPlaying,
    frames,
  } = useAnimationPreview(processedImages);

  const { exportVideo, isExporting, exportProgress } = useVideoExport(
    frames,
    encoder
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ping-Pong Video Generator
          </h1>
          <p className="text-gray-600">
            Upload 2 images and create a mesmerizing ping-pong animation
          </p>
        </div>

        {/* FFmpeg Loading Status */}
        {!isLoaded && !loadError && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center">
              Loading FFmpeg... {Math.round(loadProgress)}%
            </p>
          </div>
        )}

        {/* FFmpeg Load Error */}
        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center">
              Error loading FFmpeg: {loadError}
            </p>
            <p className="text-red-600 text-sm text-center mt-2">
              Please refresh the page and ensure you have a stable internet
              connection.
            </p>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center">{uploadError}</p>
          </div>
        )}

        {/* Image Uploader */}
        <ImageUploader
          onUpload={uploadImages}
          uploadedImages={uploadedImages}
          onClear={clearImages}
          isProcessing={isProcessing}
        />

        {/* Preview and Export Controls */}
        {processedImages.length === 2 && (
          <div className="grid md:grid-cols-2 gap-8">
            <AnimationPreview
              processedImages={processedImages}
              isPlaying={isPlaying}
              onStartPreview={startPreview}
              onTogglePreview={togglePreview}
            />

            <ExportControls
              onExport={exportVideo}
              isExporting={isExporting}
              exportProgress={exportProgress}
              disabled={!isLoaded}
            />
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>
            All processing happens in your browser using FFmpeg.wasm - no data
            is uploaded to any server
          </p>
          <p>Supported formats: JPG, PNG, WEBP (max 5MB each)</p>
        </div>
      </div>
    </div>
  );
}
