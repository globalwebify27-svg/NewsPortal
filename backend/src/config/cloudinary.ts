// =============================================================================
// Local Media Storage Config — Local File Upload Handler
// =============================================================================

import fs from "fs";
import path from "path";
import { logger } from "./logger";

export const CLOUDINARY_FOLDERS = {
  articles: "articles",
  avatars: "avatars",
  heroes: "heroes",
  videos: "videos",
  audio: "audio",
  ads: "ads",
  og: "og-images",
};

// ─── Upload Image Locally ───────────────────────────────────────────────────
export async function uploadImage(
  file: string,
  folder: string = CLOUDINARY_FOLDERS.articles,
  options: Record<string, unknown> = {}
): Promise<{ url: string; publicId: string; width: number; height: number }> {
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

  const url = `/uploads/${filename}`;
  logger.info(`Local Upload: Image saved on disk — ${url}`);
  return {
    url,
    publicId: filename,
    width: 800,
    height: 600,
  };
}

// ─── Upload Video Locally ───────────────────────────────────────────────────
export async function uploadVideo(
  file: string,
  folder: string = CLOUDINARY_FOLDERS.videos
): Promise<{ url: string; publicId: string; duration: number }> {
  const uploadsDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `video-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.mp4`;
  const filepath = path.join(uploadsDir, filename);

  const base64Data = file.replace(/^data:video\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filepath, buffer);

  const url = `/uploads/${filename}`;
  logger.info(`Local Upload: Video saved on disk — ${url}`);
  return {
    url,
    publicId: filename,
    duration: 0,
  };
}

// ─── Delete Media ────────────────────────────────────────────────────────────
export async function deleteMedia(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  try {
    const filepath = path.join(__dirname, "../../uploads", publicId);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      logger.info(`Local Upload: Deleted — ${publicId}`);
    }
  } catch (err: any) {
    logger.warn(`Local Delete Warning: ${err?.message}`);
  }
}

// ─── Generate Image URL ─────────────────────────────────────────────────────
export function getResponsiveUrl(
  publicId: string,
  width: number,
  format: "webp" | "avif" | "jpg" = "webp"
): string {
  return `/uploads/${publicId}`;
}

export const cloudinary = {};
