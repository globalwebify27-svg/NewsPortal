// =============================================================================
// Multer Upload Middleware — Memory Storage & File Validation
// =============================================================================

import multer from "multer";
import { ValidationError } from "./error.middleware";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "application/pdf",
];

const maxFileSizeMB = Number(process.env.MAX_FILE_SIZE_MB || 50);

export const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024, // 50MB
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          `Invalid file type: ${file.mimetype}. Allowed types: JPG, PNG, WebP, SVG, GIF, MP4, MP3, PDF.`
        )
      );
    }
  },
});
