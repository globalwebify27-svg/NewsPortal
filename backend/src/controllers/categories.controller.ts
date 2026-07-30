// =============================================================================
// Categories Controller — CRUD & Tree Navigation
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { cache, cacheKeys } from "../config/redis";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, ConflictError } from "../middleware/error.middleware";
import { createSlug } from "../utils/slug.utils";
import { createCategorySchema, updateCategorySchema } from "../validations/content.validation";

// ─── Get All Categories ───────────────────────────────────────────────────────
export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = cacheKeys.categories();
    const cached = await cache.get<unknown[]>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, "Categories retrieved (cached)");
      return;
    }

    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { order: "asc" },
        },
        _count: { select: { articles: true } },
      },
      orderBy: { order: "asc" },
    });

    await cache.set(cacheKey, categories, 3600); // Cache for 1 hour

    sendSuccess(res, categories, "Categories retrieved successfully");
  } catch (error) {
    next(error);
  }
}

// ─── Get Category By Slug ─────────────────────────────────────────────────────
export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
        _count: { select: { articles: true } },
      },
    });

    if (!category) throw new NotFoundError("Category not found");

    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

// ─── Create Category ──────────────────────────────────────────────────────────
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createCategorySchema.parse(req.body);
    const slug = createSlug(data.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictError("Category with this name already exists");

    const category = await prisma.category.create({
      data: { ...data, slug },
    });

    await cache.del(cacheKeys.categories());

    sendCreated(res, category, "Category created successfully");
  } catch (error) {
    next(error);
  }
}

// ─── Update Category ──────────────────────────────────────────────────────────
export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateCategorySchema.parse(req.body);

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    await cache.del(cacheKeys.categories());

    sendSuccess(res, category, "Category updated successfully");
  } catch (error) {
    next(error);
  }
}

// ─── Delete Category ──────────────────────────────────────────────────────────
export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    await prisma.category.delete({ where: { id } });
    await cache.del(cacheKeys.categories());

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
