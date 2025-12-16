import { useState } from "react";
import { ImagePairSchema } from "@/types/validation";
import { processImages } from "@/lib/video-generator/image-processor";
import type { UploadedImage, ProcessedImage } from "@/types/video-generator";

export function useImageUpload() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]) => {
    setError(null);
    setIsProcessing(true);

    try {
      // Validate with Zod
      const result = ImagePairSchema.safeParse(files);
      if (!result.success) {
        const errorMessage = result.error.issues
          .map((e) => e.message)
          .join(", ");
        throw new Error(errorMessage);
      }

      // Process images
      const { uploadedImages: uploaded, processedImages: processed } =
        await processImages(files);

      setUploadedImages(uploaded);
      setProcessedImages(processed);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process images";
      setError(errorMessage);
      setUploadedImages([]);
      setProcessedImages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImages = () => {
    // Revoke object URLs to free memory
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));

    setUploadedImages([]);
    setProcessedImages([]);
    setError(null);
  };

  return {
    uploadedImages,
    processedImages,
    isProcessing,
    error,
    uploadImages,
    clearImages,
  };
}
