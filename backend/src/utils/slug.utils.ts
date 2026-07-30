// =============================================================================
// Slug & Read Time Utilities
// =============================================================================

import slugify from "slugify";
import { prisma } from "../config/database";

// ─── Generate Unique Article Slug ─────────────────────────────────────────────
export async function createUniqueArticleSlug(title: string): Promise<string> {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ─── Generate Category/Tag Slug ───────────────────────────────────────────────
export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

// ─── Calculate Reading Time ───────────────────────────────────────────────────
export function calculateReadTime(text: string): string {
  if (!text) return "1 min read";
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, "");
  const words = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
