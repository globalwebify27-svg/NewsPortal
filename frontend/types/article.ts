// =============================================================================
// Shared Article Type — Used across all frontend components and pages
// Replaces all `any[]` usages for article data
// =============================================================================

export interface ArticleCategory {
  name: string;
  slug: string;
  color: string;
  subCategory?: string;
}

export interface ArticleAuthor {
  name: string;
  avatar?: string;
}

export interface Article {
  id: string;
  title: string;
  titleHi?: string;
  slug: string;
  summary: string;
  summaryHi?: string;
  body: string;
  featuredImage: string;
  category?: ArticleCategory;
  categories?: string[];
  subCategory?: string;
  author?: ArticleAuthor;
  readTime?: string;
  isPinned?: boolean;
  isHero?: boolean;
  isSuperfast?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  status?: string;
  language?: "EN" | "HI";
  state?: string;
  district?: string;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper: get the best timestamp for chronological sorting
export function getArticleTimestamp(article: Article): number {
  const d = article.publishedAt || article.createdAt;
  if (!d) return 0;
  const t = new Date(d).getTime();
  return isNaN(t) ? 0 : t;
}

// Helper: sort articles newest-first
export function sortByLatest(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
}
