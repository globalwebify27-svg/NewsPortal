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

import fs from "fs";
import path from "path";

// ─── Upload Image ─────────────────────────────────────────────────────────────
export async function uploadImage(
  file: string,
  folder: string = CLOUDINARY_FOLDERS.articles,
  options: Record<string, unknown> = {}
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  // If Cloudinary credentials are missing, fallback to local disk storage
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;
    const filepath = path.join(uploadsDir, filename);

    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], "base64");
      fs.writeFileSync(filepath, buffer);
    } else {
      const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filepath, buffer);
    }

    const port = process.env.PORT || 5001;
    const url = `http://localhost:${port}/uploads/${filename}`;
    logger.info(`Local Upload: Image saved on disk — ${url}`);
    return {
      url,
      publicId: filename,
      width: 800,
      height: 600,
    };
  }

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
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn("⚠️ Cloudinary credentials missing. Video upload skipped.");
    return {
      url: "",
      publicId: "",
      duration: 0,
    };
  }

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
