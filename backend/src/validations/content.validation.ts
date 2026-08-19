// =============================================================================
// Content Validation Schemas (Article, Category, Tag)
// =============================================================================

import { z } from "zod";
import { ArticleStatus, FactCheckVerdict } from "@prisma/client";

// ─── Article Schemas ──────────────────────────────────────────────────────────
export const createArticleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(500),
  titleHi: z.string().optional(),
  summary: z.string().max(1000).optional(),
  summaryHi: z.string().max(1000).optional(),
  body: z.string().min(20, "Article content must be at least 20 characters"),
  bodyHi: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  tagIds: z.array(z.string()).optional(),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  isBreaking: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isEditorsPick: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  featuredImage: z.string().url("Invalid image URL").optional().nullable(),
  featuredImageAlt: z.string().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  seoTitle: z.string().max(200).optional(),
  seoDesc: z.string().max(500).optional(),
  seoKeywords: z.string().max(300).optional(),
  canonicalUrl: z.string().url().optional().nullable(),
  isFactChecked: z.boolean().default(false),
  factCheckVerdict: z.nativeEnum(FactCheckVerdict).optional().nullable(),
  factCheckNote: z.string().optional(),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  subCategory: z.string().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial();

// ─── Category Schemas ─────────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  nameHi: z.string().optional(),
  description: z.string().optional(),
  descHi: z.string().optional(),
  parentId: z.string().optional().nullable(),
  color: z.string().default("#e50914"),
  icon: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// ─── Tag Schemas ──────────────────────────────────────────────────────────────
export const createTagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters").max(50),
  nameHi: z.string().optional(),
  color: z.string().optional(),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
