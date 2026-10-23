import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fastRevalidateAfterArticle,
  fastRevalidateAfterCategory,
  fastRevalidateAfterSettings,
  fastRevalidateAfterVideos,
  fastRevalidateAfterEpaper,
  fastRevalidateEverything,
} from "./revalidation";
import { serverCache, TTL } from "./cache";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Fast Revalidation System (lib/revalidation.ts)", () => {
  beforeEach(() => {
    serverCache.clear();
    vi.clearAllMocks();
  });

  it("should invalidate article caches and call revalidation paths on article change", () => {
    serverCache.set("articles:page:1", { items: [] }, TTL.ARTICLES_LIST);
    serverCache.set("sitemap:articles:recent:24", [{ id: "1" }], TTL.ARTICLES_LIST);

    fastRevalidateAfterArticle({ slug: "test-slug", categorySlug: "bharat" });

    expect(serverCache.get("articles:page:1")).toBeNull();
    expect(serverCache.get("sitemap:articles:recent:24")).toBeNull();
  });

  it("should invalidate category caches on category change", () => {
    serverCache.set("categories:active", [{ id: "c1" }], TTL.CATEGORIES);
    serverCache.set("sitemap:articles:cat:bharat", [], TTL.ARTICLES_LIST);

    fastRevalidateAfterCategory("bharat");

    expect(serverCache.get("categories:active")).toBeNull();
    expect(serverCache.get("sitemap:articles:cat:bharat")).toBeNull();
  });

  it("should invalidate settings caches on settings change", () => {
    serverCache.set("settings:logo:all", { logo: "url" }, TTL.SETTINGS);
    serverCache.set("settings:ads:all", { ad1: "code" }, TTL.SETTINGS);

    fastRevalidateAfterSettings("logo");
    expect(serverCache.get("settings:logo:all")).toBeNull();
    expect(serverCache.get("settings:ads:all")).not.toBeNull();

    fastRevalidateAfterSettings("ads");
    expect(serverCache.get("settings:ads:all")).toBeNull();
  });

  it("should purge all in-memory caches and revalidate routes on fastRevalidateEverything", () => {
    serverCache.set("articles:test", 123, TTL.ARTICLES_LIST);
    serverCache.set("categories:active", 456, TTL.CATEGORIES);
    serverCache.set("settings:logo:all", 789, TTL.SETTINGS);

    const result = fastRevalidateEverything();

    expect(result.success).toBe(true);
    expect(serverCache.get("articles:test")).toBeNull();
    expect(serverCache.get("categories:active")).toBeNull();
    expect(serverCache.get("settings:logo:all")).toBeNull();
  });
});
