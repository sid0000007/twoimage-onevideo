"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { UploadedImage } from "@/types/video-generator";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  uploadedImages: UploadedImage[];
  onClear: () => void;
  isProcessing: boolean;
}

export function ImageUploader({
  onUpload,
  uploadedImages,
  onClear,
  isProcessing,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card title="Upload Images">
      {uploadedImages.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />

          <div className="space-y-4">
            <div className="text-gray-600">
              <p className="text-lg font-medium">
                Drop 2 images here or click to browse
              </p>
              <p className="text-sm mt-2">
                Accepted formats: JPG, PNG, WEBP (max 5MB each)
              </p>
            </div>

            <Button
              onClick={handleButtonClick}
              disabled={isProcessing}
              variant="primary"
            >
              {isProcessing ? "Processing..." : "Choose Images"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">{img.file.name}</p>
                  <p>
                    {img.aspectRatio.width} × {img.aspectRatio.height}
                  </p>
                  <p className="text-xs">
                    Aspect Ratio: {img.aspectRatio.decimal.toFixed(3)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onClear} variant="outline" className="w-full">
            Clear & Upload New Images
          </Button>
        </div>
      )}
    </Card>
  );
}
