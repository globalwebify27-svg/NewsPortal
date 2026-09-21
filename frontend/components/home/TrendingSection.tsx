"use client";
// =============================================================================
// TrendingSection — Trending News Carousels & Grid
// =============================================================================

import React from "react";
import Link from "next/link";
import { TrendingUp, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { Article } from "@/types/article";

interface TrendingSectionProps {
  articles: Article[];
  getArticleUrl?: (article: Article) => string;
  getArticleImage?: (article: Article, index?: number) => string;
  lang?: string;
}

export default function TrendingSection({
  articles = [],
  getArticleUrl = (a) => `/news/${a.slug || a.id}`,
  getArticleImage = (a) => a.featuredImage || "/placeholder.jpg",
  lang = "HI",
}: TrendingSectionProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!articles || articles.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  return (
    <section className="trending-news-section" aria-label="Trending News" style={{ marginBottom: "2rem" }}>
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
          <Flame size={22} color="#e50914" />
          <h2
            style={{
              fontFamily: "var(--font-headline, sans-serif)",
              fontSize: "1.25rem",
              fontWeight: 800,
              margin: 0,
              color: "var(--color-text, #0f172a)",
            }}
          >
            {lang === "HI" ? "ट्रेंडिंग समाचार" : "Trending News"}
          </h2>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={handlePrev}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Previous trending article"
          >
            <ChevronLeft size={16} color="#0f172a" />
          </button>
          <button
            onClick={handleNext}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#e50914",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Next trending article"
          >
            <ChevronRight size={16} color="#ffffff" />
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {articles.slice(0, 4).map((article, index) => (
          <Link
            key={article.id || index}
            href={getArticleUrl(article)}
            style={{
              textDecoration: "none",
              background: "var(--color-card-bg, #ffffff)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              transition: "transform 0.2s ease",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0f172a" }}>
              <img
                src={getArticleImage(article, index, 600)}
                alt={article.title}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  background: "#e50914",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                #{index + 1} TRENDING
              </span>
            </div>

            <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3
                style={{
                  fontFamily: "var(--font-headline, sans-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  lineHeight: 1.4,
                  margin: 0,
                  color: "var(--color-text, #0f172a)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
