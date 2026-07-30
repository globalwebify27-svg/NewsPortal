// =============================================================================
// Meilisearch Config — Full-text Search Engine
// =============================================================================

import { MeiliSearch } from "meilisearch";
import { logger } from "./logger";

export const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const INDICES = {
  ARTICLES: process.env.MEILISEARCH_INDEX_ARTICLES || "articles",
};

// ─── Index Configuration ──────────────────────────────────────────────────────
export async function initializeMeilisearch(): Promise<void> {
  try {
    // Articles index
    const articlesIndex = meili.index(INDICES.ARTICLES);

    await articlesIndex.updateSettings({
      searchableAttributes: [
        "title",
        "titleHi",
        "summary",
        "summaryHi",
        "body",
        "authorName",
        "categoryName",
        "tags",
      ],
      filterableAttributes: [
        "category",
        "categoryId",
        "status",
        "authorId",
        "isBreaking",
        "isTrending",
        "isFeatured",
        "isPremium",
        "publishedAt",
        "tags",
      ],
      sortableAttributes: ["publishedAt", "views", "createdAt"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
      displayedAttributes: [
        "id",
        "title",
        "titleHi",
        "slug",
        "summary",
        "featuredImage",
        "categoryName",
        "authorName",
        "publishedAt",
        "readTime",
        "tags",
        "views",
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
      pagination: { maxTotalHits: 1000 },
    });

    logger.info("✅ Meilisearch indices configured");
  } catch (error) {
    logger.warn("⚠️  Meilisearch not available — search will use database fallback", error);
  }
}

// ─── Index Article ─────────────────────────────────────────────────────────────
export async function indexArticle(article: Record<string, unknown>): Promise<void> {
  try {
    await meili.index(INDICES.ARTICLES).addDocuments([article]);
  } catch (error) {
    logger.warn("Meilisearch: Failed to index article", error);
  }
}

// ─── Remove Article from Index ────────────────────────────────────────────────
export async function removeArticleFromIndex(id: string): Promise<void> {
  try {
    await meili.index(INDICES.ARTICLES).deleteDocument(id);
  } catch (error) {
    logger.warn("Meilisearch: Failed to remove article from index", error);
  }
}

// ─── Search Articles ──────────────────────────────────────────────────────────
export async function searchArticles(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    filter?: string;
    sort?: string[];
  } = {}
) {
  const { limit = 20, offset = 0, filter, sort } = options;
  return meili.index(INDICES.ARTICLES).search(query, {
    limit,
    offset,
    filter,
    sort,
    attributesToHighlight: ["title", "summary"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
  });
}

export default meili;
