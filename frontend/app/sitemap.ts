import { MetadataRoute } from "next";
import { allDefaultArticles, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

const BASE_URL = "https://globalawaaz.com";

const STATIC_SECTIONS = [
  "",
  "/education",
  "/world",
  "/india",
  "/business",
  "/technology",
  "/sports",
  "/entertainment",
  "/science",
  "/health",
  "/opinion",
  "/videos",
  "/epaper",
  "/shorts",
  "/about",
];

async function fetchDynamicArticles() {
  try {
    const res = await fetch(API_ENDPOINTS.articles, { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    // API unavailable — return empty, no hardcoded fallback
  }
  return []; // No hardcoded fallback — all articles from DB
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static Category & Core Pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_SECTIONS.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "always" : "hourly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic News Articles
  const articles = await fetchDynamicArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((art: any) => ({
    url: `${BASE_URL}${getArticleUrl(art)}`,
    lastModified: art.createdAt ? new Date(art.createdAt) : now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticEntries, ...articleEntries];
}
