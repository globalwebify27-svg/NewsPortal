// =============================================================================
// Article Routes — Public Feeds & Protected Editorial Operations
// =============================================================================

import { Router } from "express";
import {
  getPublicArticles,
  getArticleBySlug,
  getFeaturedFeeds,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articles.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAuthor } from "../middleware/rbac.middleware";

export const articlesRouter = Router();

// Public Feeds
articlesRouter.get("/", getPublicArticles);
articlesRouter.get("/feeds/featured", getFeaturedFeeds);
articlesRouter.get("/:slug", getArticleBySlug);

// Protected Editorial Endpoints (Author+)
articlesRouter.use(protect, requireAuthor);
articlesRouter.post("/", createArticle);
articlesRouter.put("/:id", updateArticle);
articlesRouter.delete("/:id", deleteArticle);
