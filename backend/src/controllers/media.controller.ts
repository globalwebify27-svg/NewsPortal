// =============================================================================
// Media Controller — Cloudinary Upload, Media Library Management
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { MediaType } from "@prisma/client";
import { prisma } from "../config/database";
import { uploadImage, uploadVideo, deleteMedia as deleteCloudinaryMedia, getResponsiveUrl } from "../config/cloudinary";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, UnauthorizedError, ValidationError, ForbiddenError } from "../middleware/error.middleware";
import { getPaginationParams } from "../utils/response.utils";

// Helper to deduce MediaType from mimetype
function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return MediaType.IMAGE;
  if (mimeType.startsWith("video/")) return MediaType.VIDEO;
  if (mimeType.startsWith("audio/")) return MediaType.AUDIO;
  if (mimeType === "application/pdf") return MediaType.PDF;
  return MediaType.DOCUMENT;
}

// ─── 1. Upload Single File ───────────────────────────────────────────────────
export async function uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    if (!req.file) throw new ValidationError("No file provided for upload.");

    const file = req.file;
    const mediaType = getMediaType(file.mimetype);
    const folder = (req.body.folder as string) || "general";
    const altText = (req.body.altText as string) || file.originalname;

    // Convert Buffer to Data URI for Cloudinary
    const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    let result: { url: string; publicId: string; width?: number; height?: number; duration?: number };

    if (mediaType === MediaType.VIDEO) {
      result = await uploadVideo(fileBase64, `global-awaaz/${folder}`);
    } else {
      result = await uploadImage(fileBase64, `global-awaaz/${folder}`);
    }

    const media = await prisma.media.create({
      data: {
        url: result.url,
        cloudinaryId: result.publicId,
        publicId: result.publicId,
        type: mediaType,
        mimeType: file.mimetype,
        size: file.size,
        width: result.width,
        height: result.height,
        duration: result.duration,
        altText,
        folder,
        uploadedById: req.user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    sendCreated(res, media, "File uploaded successfully!");
  } catch (error) {
    next(error);
  }
}

// ─── 2. Get Media Library (Paginated & Filtered) ─────────────────────────────
export async function getMediaFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const type = req.query.type as MediaType | undefined;
    const folder = req.query.folder as string | undefined;

    const where: any = {};
    if (type) where.type = type;
    if (folder) where.folder = folder;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, name: true } } },
      }),
      prisma.media.count({ where }),
    ]);

    sendPaginated(res, media, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ─── 3. Delete Media ─────────────────────────────────────────────────────────
export async function deleteMediaFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const id = req.params.id as string;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundError("Media file not found.");

    if (!["ADMIN", "SUPERADMIN"].includes(req.user.role) && media.uploadedById !== req.user.id) {
      throw new ForbiddenError("You do not have permission to delete this file.");
    }

    // Delete from Cloudinary if publicId exists
    if (media.cloudinaryId) {
      const resType = media.type === MediaType.VIDEO ? "video" : "image";
      await deleteCloudinaryMedia(media.cloudinaryId, resType).catch(() => {});
    }

    await prisma.media.delete({ where: { id } });

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// ─── 4. Get Responsive Image Variants ───────────────────────────────────────
export async function getResponsiveVariants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media || !media.cloudinaryId) throw new NotFoundError("Media not found");

    const widths = [320, 640, 768, 1024, 1280, 1920];
    const variants = widths.map((w) => ({
      width: w,
      webp: getResponsiveUrl(media.cloudinaryId!, w, "webp"),
      avif: getResponsiveUrl(media.cloudinaryId!, w, "avif"),
    }));

    sendSuccess(res, { original: media.url, variants });
  } catch (error) {
    next(error);
  }
}
