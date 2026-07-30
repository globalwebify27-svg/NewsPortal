// =============================================================================
// Module Routes — Polls, Fact Check, Live Blog
// =============================================================================

import { Router } from "express";
import {
  getPolls,
  createPoll,
  votePoll,
  getFactChecks,
  setFactCheck,
  getLiveBlog,
  addLiveBlogEntry,
} from "../controllers/modules.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAuthor, requireEditor } from "../middleware/rbac.middleware";

export const modulesRouter = Router();

// Polls
modulesRouter.get("/polls", getPolls);
modulesRouter.post("/polls", protect, requireAuthor, createPoll);
modulesRouter.post("/polls/:pollId/vote", votePoll);

// Fact Check
modulesRouter.get("/fact-check", getFactChecks);
modulesRouter.post("/fact-check/:articleId", protect, requireEditor, setFactCheck);

// Live Blog
modulesRouter.get("/live-blog/:articleId", getLiveBlog);
modulesRouter.post("/live-blog/:articleId/entries", protect, requireAuthor, addLiveBlogEntry);
