// =============================================================================
// Tag Routes — Public Read & Admin Write
// =============================================================================

import { Router } from "express";
import { getTags, createTag, updateTag, deleteTag } from "../controllers/tags.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/rbac.middleware";

export const tagsRouter = Router();

tagsRouter.get("/", getTags);

tagsRouter.use(protect, requireAdmin);
tagsRouter.post("/", createTag);
tagsRouter.put("/:id", updateTag);
tagsRouter.delete("/:id", deleteTag);
