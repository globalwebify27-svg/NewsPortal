// =============================================================================
// Search Routes — Public Search & Admin Index Sync
// =============================================================================

import { Router } from "express";
import {
  searchContent,
  searchAutoComplete,
  syncMeilisearchIndex,
} from "../controllers/search.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/rbac.middleware";
import { searchRateLimiter } from "../middleware/rateLimit.middleware";

export const searchRouter = Router();

// Public
searchRouter.get("/", searchRateLimiter, searchContent);
searchRouter.get("/autocomplete", searchRateLimiter, searchAutoComplete);

// Protected (Admin only)
searchRouter.post("/sync", protect, requireAdmin, syncMeilisearchIndex);
