// =============================================================================
// User Feature Routes — Comments, Bookmarks, Likes, Follows
// =============================================================================

import { Router } from "express";
import {
  getArticleComments,
  postComment,
  moderateComment,
  toggleBookmark,
  getUserBookmarks,
  toggleArticleLike,
  toggleFollowAuthor,
} from "../controllers/userFeatures.controller";
import { protect } from "../middleware/auth.middleware";
import { requireEditor } from "../middleware/rbac.middleware";

export const userFeaturesRouter = Router();

// Comments Public Read
userFeaturesRouter.get("/comments/:articleId", getArticleComments);

// Comments Write (Protected)
userFeaturesRouter.post("/comments/:articleId", protect, postComment);
userFeaturesRouter.patch("/comments/:id/moderate", protect, requireEditor, moderateComment);

// Bookmarks (Protected)
userFeaturesRouter.get("/bookmarks", protect, getUserBookmarks);
userFeaturesRouter.post("/bookmarks/:articleId", protect, toggleBookmark);

// Likes (Protected)
userFeaturesRouter.post("/likes/:articleId", protect, toggleArticleLike);

// Author Follows (Protected)
userFeaturesRouter.post("/authors/:authorId/follow", protect, toggleFollowAuthor);
