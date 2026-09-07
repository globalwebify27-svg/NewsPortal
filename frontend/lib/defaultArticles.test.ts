import { describe, it, expect } from "vitest";
import { formatArticleSlug, getArticleUrl, getArticleImage, stripHtml } from "./defaultArticles";

describe("Article Utility Functions (lib/defaultArticles.ts)", () => {
  it("should strip HTML tags cleanly", () => {
    const html = "<p>Breaking News: <strong>Major Update</strong> on climate summit.</p>";
    const text = stripHtml(html);
    expect(text).toBe("Breaking News: Major Update on climate summit.");
  });

  it("should format article slug and preserve or normalize date format", () => {
    const slug1 = formatArticleSlug({ title: "Global Economy", slug: "global-economy-26-09-07-a1b2" });
    expect(slug1).toBe("global-economy-26-09-07-a1b2");

    const slug2 = formatArticleSlug(null);
    expect(slug2).toBe("news");
  });

  it("should generate correct full URL path for articles", () => {
    const url = getArticleUrl({
      id: "art-1",
      slug: "tech-breakthrough-26-09-07-abcd",
      category: { name: "Technology", slug: "technology", color: "#3b82f6" },
    });
    expect(url).toBe("/technology/tech-breakthrough-26-09-07-abcd");
  });

  it("should route video articles to /videos correctly", () => {
    const videoUrl = getArticleUrl({
      id: "vid-1",
      slug: "live-press-conference",
      format: "video",
      youtubeId: "dQw4w9WgXcQ",
      category: { name: "Videos", slug: "videos", color: "#e50914" },
    });
    expect(videoUrl).toContain("/videos");
  });

  it("should resolve and clean article image URLs", () => {
    const img1 = getArticleImage({ featuredImage: "https://globalawaaz.com/uploads/photo.jpg" });
    expect(img1).toBe("/uploads/photo.jpg");

    const img2 = getArticleImage({ image: "https//example.com/photo.png" });
    expect(img2).toBe("https://example.com/photo.png");
  });
});
