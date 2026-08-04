// =============================================================================
// Frontend API Configuration
// Centralized API Base URL and Endpoint Helpers
// =============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const API_ENDPOINTS = {
  articles: `${API_BASE_URL}/articles`,
  articleBySlug: (slug: string) => `${API_BASE_URL}/articles/${slug}`,
  categories: `${API_BASE_URL}/categories`,
  tags: `${API_BASE_URL}/tags`,
  mediaUpload: `${API_BASE_URL}/media/upload`,
  adminStats: `${API_BASE_URL}/admin/stats`,
  search: `${API_BASE_URL}/search`,
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`,
  },
  adminSettings: `${API_BASE_URL}/admin/settings`,
  adminSettingPublic: `${API_BASE_URL}/admin/settings/public`,
  adminSettingDelete: (key: string) => `${API_BASE_URL}/admin/settings/${key}`,
};

