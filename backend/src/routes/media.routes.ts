// =============================================================================
// Media Routes — File Uploads & Media Library Management
// =============================================================================

import { Router } from "express";
import {
  uploadFile,
  getMediaFiles,
  deleteMediaFile,
  getResponsiveVariants,
} from "../controllers/media.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAuthor } from "../middleware/rbac.middleware";
import { upload } from "../middleware/upload.middleware";

export const mediaRouter = Router();

mediaRouter.use(protect);

mediaRouter.get("/", getMediaFiles);
mediaRouter.get("/:id/responsive", getResponsiveVariants);
mediaRouter.post("/upload", requireAuthor, upload.single("file"), uploadFile);
mediaRouter.delete("/:id", requireAuthor, deleteMediaFile);
