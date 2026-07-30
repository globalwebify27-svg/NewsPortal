// =============================================================================
// AI Routes — Protected Newsroom AI Copilot Endpoints
// =============================================================================

import { Router } from "express";
import { summarizeText, translateText, generateSeo, suggestTags } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAuthor } from "../middleware/rbac.middleware";

export const aiRouter = Router();

aiRouter.use(protect, requireAuthor);

aiRouter.post("/summarize", summarizeText);
aiRouter.post("/translate", translateText);
aiRouter.post("/generate-seo", generateSeo);
aiRouter.post("/suggest-tags", suggestTags);
