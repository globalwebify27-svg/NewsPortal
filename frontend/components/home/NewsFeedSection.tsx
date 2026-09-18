"use client";
// =============================================================================
// NewsFeedSection — Chronological Latest News Stream with Categories
// =============================================================================

import React from "react";
import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { Article } from "@/types/article";

interface NewsFeedSectionProps {
  articles: Article[];
  categoryTitle?: string;
  categorySlug?: string;
  getArticleUrl?: (article: Article) => string;
  getArticleImage?: (article: Article, index?: number) => string;
  lang?: string;
}

export default function NewsFeedSection({
  articles = [],
  categoryTitle,
  categorySlug,
  getArticleUrl = (a) => `/news/${a.slug || a.id}`,
  getArticleImage = (a) => a.featuredImage || "/placeholder.jpg",
  lang = "HI",
}: NewsFeedSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="news-feed-section" aria-label={categoryTitle || "Latest News"} style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
          borderBottom: "2px solid #e50914",
          paddingBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={20} color="#e50914" />
          <h2
            style={{
              fontFamily: "var(--font-headline, sans-serif)",
              fontSize: "1.25rem",
              fontWeight: 800,
              margin: 0,
              color: "var(--color-text, #0f172a)",
            }}
          >
            {categoryTitle || (lang === "HI" ? "ताज़ा ख़बरें" : "Latest Stories")}
          </h2>
        </div>

        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#e50914",
              textDecoration: "none",
            }}
          >
            {lang === "HI" ? "सभी देखें ▶" : "View All ▶"}
          </Link>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {articles.map((article, idx) => (
          <article
            key={article.id || idx}
            style={{
              background: "var(--color-card-bg, #ffffff)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <Link
              href={getArticleUrl(article)}
              style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0f172a" }}>
                <img
                  src={getArticleImage(article, idx)}
                  alt={article.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {article.category?.name && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "#e50914",
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {article.category.name}
                  </span>
                )}
              </div>

              <div style={{ padding: "14px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-headline, sans-serif)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    lineHeight: 1.4,
                    margin: "0 0 8px",
                    color: "var(--color-text, #0f172a)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {article.title}
                </h3>

                {article.summary && (
                  <p
                    style={{
                      fontFamily: "var(--font-body, sans-serif)",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      color: "var(--color-secondary, #64748b)",
                      margin: "0 0 12px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {article.summary}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "auto",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--color-border, #f1f5f9)",
                    fontSize: "0.78rem",
                    color: "var(--color-muted, #94a3b8)",
                  }}
                >
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.publishedAt && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
