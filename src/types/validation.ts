import { z } from "zod";

export const ImageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "File size must be less than 5MB",
  })
  .refine(
    (file) =>
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp",
    {
      message: "File must be JPG, PNG, or WEBP",
    }
  );

export const ImagePairSchema = z
  .array(ImageFileSchema)
  .length(2, { message: "Exactly 2 images required" });

export const AspectRatioSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  decimal: z.number().positive(),
});

export const DimensionsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
