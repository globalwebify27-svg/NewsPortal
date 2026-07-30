// =============================================================================
// Centralized Frontend TypeScript Definitions & Models
// =============================================================================

export interface Category {
  id: string;
  name: string;
  nameHi?: string;
  slug: string;
  color?: string;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  twitterHandle?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  featuredImage?: string;
  caption?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  isEditorsPick?: boolean;
  views?: number;
  readTime?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  author?: Author;
  tags?: { tag: Tag }[];
  _count?: {
    comments?: number;
    likes?: number;
    bookmarks?: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "EDITOR" | "REPORTER" | "SUBSCRIBER" | "USER";
  avatar?: string;
}
