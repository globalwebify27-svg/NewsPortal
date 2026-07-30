// =============================================================================
// Main API Router — Phase 2 Foundation
// All module routes assembled here
// =============================================================================

import { Router, Request, Response } from "express";
import { sendSuccess } from "../utils/response.utils";
import { authRouter } from "./auth.routes";
import { articlesRouter } from "./articles.routes";
import { categoriesRouter } from "./categories.routes";
import { tagsRouter } from "./tags.routes";
import { mediaRouter } from "./media.routes";
import { searchRouter } from "./search.routes";
import { adminRouter } from "./admin.routes";
import { modulesRouter } from "./modules.routes";
import { monetizationRouter } from "./monetization.routes";
import { userFeaturesRouter } from "./userFeatures.routes";
import { seoRouter } from "./seo.routes";
import { analyticsRouter } from "./analytics.routes";
import { aiRouter } from "./ai.routes";
import { notificationsRouter } from "./notifications.routes";

export const apiRouter = Router();

// ─── API Root Info ─────────────────────────────────────────────────────────────
apiRouter.get("/", (_req: Request, res: Response) => {
  sendSuccess(res, {
    name: "Global Awaaz CMS API",
    version: "1.0.0",
    phase: "14 — Live & Real-Time Features (WebSockets & Notifications)",
    endpoints: {
      auth: "/api/v1/auth",
      articles: "/api/v1/articles",
      categories: "/api/v1/categories",
      tags: "/api/v1/tags",
      media: "/api/v1/media",
      search: "/api/v1/search",
      admin: "/api/v1/admin",
      polls: "/api/v1/modules/polls",
      factCheck: "/api/v1/modules/fact-check",
      liveBlog: "/api/v1/modules/live-blog",
      ads: "/api/v1/monetization/ads",
      newsletter: "/api/v1/monetization/newsletter",
      comments: "/api/v1/user/comments",
      seo: "/api/v1/seo",
      analytics: "/api/v1/analytics",
      ai: "/api/v1/ai",
      notifications: "/api/v1/notifications",
    },
  });
});

// ─── Module Routes ────────────────────────────────────────────────────────────
// Phase 3: Auth System
apiRouter.use("/auth", authRouter);

// Phase 4: Core Content Engine
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/tags", tagsRouter);

// Phase 5: Media Library
apiRouter.use("/media", mediaRouter);

// Phase 6: Search Engine
apiRouter.use("/search", searchRouter);

// Phase 7: Admin CMS Core
apiRouter.use("/admin", adminRouter);

// Phase 8: Content Modules
apiRouter.use("/modules", modulesRouter);

// Phase 9: Monetization & Newsletter
apiRouter.use("/monetization", monetizationRouter);

// Phase 10: User Features & Community Engine
apiRouter.use("/user", userFeaturesRouter);

// Phase 11: SEO Automation
apiRouter.use("/seo", seoRouter);

// Phase 12: Analytics & Reporting Engine
apiRouter.use("/analytics", analyticsRouter);

// Phase 13: AI Newsroom Copilot (Google Gemini)
apiRouter.use("/ai", aiRouter);

// Phase 14: Live & Real-Time Notifications
apiRouter.use("/notifications", notificationsRouter);

// Phase 4: Core Content
// apiRouter.use("/articles", articlesRouter);
// apiRouter.use("/categories", categoriesRouter);
// apiRouter.use("/tags", tagsRouter);

// Phase 5: Media
// apiRouter.use("/media", mediaRouter);

// Phase 6: Search
// apiRouter.use("/search", searchRouter);

// Phase 7-9: Admin CMS
// apiRouter.use("/users", usersRouter);
// apiRouter.use("/breaking-news", breakingNewsRouter);
// apiRouter.use("/advertisements", advertisementsRouter);
// apiRouter.use("/settings", settingsRouter);

// Phase 10: User Features
// apiRouter.use("/comments", commentsRouter);
// apiRouter.use("/newsletter", newsletterRouter);
// apiRouter.use("/polls", pollsRouter);
// apiRouter.use("/notifications", notificationsRouter);

// Phase 12: Analytics
// apiRouter.use("/analytics", analyticsRouter);
