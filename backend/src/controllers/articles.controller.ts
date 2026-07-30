// =============================================================================
// Articles Controller — Core Editorial CMS & Public News Feed APIs
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { ArticlesService } from "../services/articles.service";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, getPaginationParams } from "../utils/response.utils";
import { UnauthorizedError } from "../middleware/error.middleware";
import { createArticleSchema, updateArticleSchema } from "../validations/content.validation";

// ─── 1. Get Public Articles (Paginated & Filtered) ───────────────────────────
export async function getPublicArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const category = req.query.category ? String(req.query.category) : undefined;
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const { articles, total } = await ArticlesService.getPublicArticles({
      page,
      limit,
      skip,
      category,
      tag,
      search,
    });

    sendPaginated(res, articles, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ─── 2. Get Article By Slug ───────────────────────────────────────────────────
export async function getArticleBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const article = await ArticlesService.getArticleBySlug(slug);
    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
}

// ─── 3. Get Hero & Special Section Feeds ─────────────────────────────────────
export async function getFeaturedFeeds(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const feeds = await ArticlesService.getFeaturedFeeds();
    sendSuccess(res, feeds);
  } catch (error) {
    next(error);
  }
}

// ─── 4. Create Article (Reporter / Author / Admin) ────────────────────────────
export async function createArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const data = createArticleSchema.parse(req.body);
    const article = await ArticlesService.createArticle(req.user.id, data);
    sendCreated(res, article, "Article created successfully!");
  } catch (error) {
    next(error);
  }
}

// ─── 5. Update Article ────────────────────────────────────────────────────────
export async function updateArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const id = req.params.id as string;
    const data = updateArticleSchema.parse(req.body);
    const article = await ArticlesService.updateArticle(id, req.user, data);
    sendSuccess(res, article, "Article updated successfully!");
  } catch (error) {
    next(error);
  }
}

// ─── 6. Delete Article ────────────────────────────────────────────────────────
export async function deleteArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const id = req.params.id as string;
    await ArticlesService.deleteArticle(id, req.user);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
