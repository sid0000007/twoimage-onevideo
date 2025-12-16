import type {
  AspectRatio,
  Dimensions,
  ProcessedImage,
  UploadedImage,
} from "@/types/video-generator";

export async function loadImage(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

export function calculateAspectRatio(
  dimensions: Dimensions
): AspectRatio {
  const decimal = dimensions.width / dimensions.height;
  return {
    width: dimensions.width,
    height: dimensions.height,
    decimal,
  };
}

export function aspectRatiosMatch(ar1: number, ar2: number): boolean {
  const tolerance = 0.0001; // 0.01% tolerance
  return Math.abs(ar1 - ar2) < tolerance;
}

export function calculateTargetDimensions(
  images: { width: number; height: number }[]
): Dimensions {
  const maxWidth = Math.max(...images.map((img) => img.width));
  const maxHeight = Math.max(...images.map((img) => img.height));

  const aspectRatios = images.map((img) => img.width / img.height);
  const avgAspectRatio =
    aspectRatios.reduce((sum, ar) => sum + ar, 0) / aspectRatios.length;

  return {
    width: maxWidth,
    height: Math.round(maxWidth / avgAspectRatio),
  };
}

export function drawImageWithLetterbox(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  targetWidth: number,
  targetHeight: number
): void {
  const sourceAR = image.width / image.height;
  const targetAR = targetWidth / targetHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (Math.abs(sourceAR - targetAR) < 0.0001) {
    // Aspect ratios match, draw normally
    drawWidth = targetWidth;
    drawHeight = targetHeight;
    offsetX = 0;
    offsetY = 0;
  } else if (sourceAR > targetAR) {
    // Image is wider, letterbox top/bottom
    drawWidth = targetWidth;
    drawHeight = targetWidth / sourceAR;
    offsetX = 0;
    offsetY = (targetHeight - drawHeight) / 2;
  } else {
    // Image is taller, letterbox left/right
    drawHeight = targetHeight;
    drawWidth = targetHeight * sourceAR;
    offsetX = (targetWidth - drawWidth) / 2;
    offsetY = 0;
  }

  // Fill background with black for letterboxing
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw image centered
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export async function processImages(
  files: File[]
): Promise<{
  uploadedImages: UploadedImage[];
  processedImages: ProcessedImage[];
}> {
  if (files.length !== 2) {
    throw new Error("Exactly 2 images required");
  }

  // Load images
  const imageBitmaps = await Promise.all(files.map(loadImage));

  // Calculate aspect ratios
  const uploadedImages: UploadedImage[] = files.map((file, index) => {
    const bitmap = imageBitmaps[index];
    const dimensions: Dimensions = {
      width: bitmap.width,
      height: bitmap.height,
    };
    const aspectRatio = calculateAspectRatio(dimensions);

    return {
      file,
      url: URL.createObjectURL(file),
      aspectRatio,
    };
  });

  // Determine target dimensions
  const imageDimensions = imageBitmaps.map((bitmap) => ({
    width: bitmap.width,
    height: bitmap.height,
  }));

  const targetDimensions = calculateTargetDimensions(imageDimensions);

  // Process each image
  const processedImages: ProcessedImage[] = imageBitmaps.map(
    (bitmap, index) => {
      const canvas = document.createElement("canvas");
      canvas.width = targetDimensions.width;
      canvas.height = targetDimensions.height;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      const originalDimensions: Dimensions = {
        width: bitmap.width,
        height: bitmap.height,
      };

      const sourceAR = bitmap.width / bitmap.height;
      const targetAR = targetDimensions.width / targetDimensions.height;
      const letterboxed = !aspectRatiosMatch(sourceAR, targetAR);

      drawImageWithLetterbox(
        ctx,
        bitmap,
        targetDimensions.width,
        targetDimensions.height
      );

      const imageData = ctx.getImageData(
        0,
        0,
        targetDimensions.width,
        targetDimensions.height
      );

      return {
        imageData,
        canvas,
        dimensions: targetDimensions,
        originalDimensions,
        letterboxed,
      };
    }
  );

  return { uploadedImages, processedImages };
}
