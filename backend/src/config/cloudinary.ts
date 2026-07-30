// =============================================================================
// Cloudinary Config — Media Upload, Transformation, CDN
// =============================================================================

import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Upload Presets ───────────────────────────────────────────────────────────
export const CLOUDINARY_FOLDERS = {
  articles: "global-awaaz/articles",
  avatars: "global-awaaz/avatars",
  heroes: "global-awaaz/heroes",
  videos: "global-awaaz/videos",
  audio: "global-awaaz/audio",
  ads: "global-awaaz/ads",
  og: "global-awaaz/og-images",
};

// ─── Upload Image ─────────────────────────────────────────────────────────────
export async function uploadImage(
  file: string,
  folder: string = CLOUDINARY_FOLDERS.articles,
  options: Record<string, unknown> = {}
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    format: "webp",
    quality: "auto:good",
    fetch_format: "auto",
    ...options,
  });
  logger.info(`Cloudinary: Image uploaded — ${result.public_id}`);
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

// ─── Upload Video ─────────────────────────────────────────────────────────────
export async function uploadVideo(
  file: string,
  folder: string = CLOUDINARY_FOLDERS.videos
): Promise<{ url: string; publicId: string; duration: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "video",
    chunk_size: 6_000_000, // 6MB chunks
  });
  logger.info(`Cloudinary: Video uploaded — ${result.public_id}`);
  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration || 0,
  };
}

// ─── Delete Media ─────────────────────────────────────────────────────────────
export async function deleteMedia(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  logger.info(`Cloudinary: Deleted — ${publicId}`);
}

// ─── Generate Responsive Image URLs ──────────────────────────────────────────
export function getResponsiveUrl(
  publicId: string,
  width: number,
  format: "webp" | "avif" | "jpg" = "webp"
): string {
  return cloudinary.url(publicId, {
    width,
    crop: "fill",
    format,
    quality: "auto",
    fetch_format: "auto",
  });
}

export { cloudinary };
