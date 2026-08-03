// =============================================================================
// Cloudinary Integration for Next.js App Router
// Handles Serverless Image Uploads to Cloudinary CDN
// =============================================================================

import { v2 as cloudinary } from "cloudinary";

export async function uploadImageToCloudinary(
  base64Data: string,
  folder: string = "global-awaaz/articles"
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: "image",
    format: "webp",
    quality: "auto:good",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export { cloudinary };
