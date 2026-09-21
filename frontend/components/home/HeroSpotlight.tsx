"use client";
// =============================================================================
// HeroSpotlight — Top Hero Showcase Component
// Displays main hero article and side hero items with crisp typography
// =============================================================================

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Article } from "@/types/article";

interface HeroSpotlightProps {
  heroArticle?: Article | null;
  sideArticles?: Article[];
  getArticleUrl?: (article: Article) => string;
  getArticleImage?: (article: Article, index?: number) => string;
  lang?: string;
}

export default function HeroSpotlight({
  heroArticle,
  sideArticles = [],
  getArticleUrl = (a) => `/news/${a.slug || a.id}`,
  getArticleImage = (a) => a.featuredImage || "/placeholder.jpg",
  lang = "HI",
}: HeroSpotlightProps) {
  if (!heroArticle && sideArticles.length === 0) {
    return null;
  }

  return (
    <section className="hero-spotlight-section" aria-label="Top Stories" style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sideArticles.length > 0 ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr",
          gap: "1.5rem",
        }}
      >
        {/* Main Hero Card */}
        {heroArticle && (
          <div
            className="main-hero-card"
            style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              background: "#0f172a",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: "360px",
            }}
          >
            <img
              src={getArticleImage(heroArticle, 0, 1200)}
              alt={heroArticle.title}
              loading="eager"
              // @ts-ignore
              fetchpriority="high"
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: (heroArticle.imageFit as any) || "cover",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)",
                zIndex: 1,
              }}
            />

            <div style={{ position: "relative", zIndex: 2, padding: "1.5rem" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span
                  style={{
                    background: "#e50914",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {heroArticle.category?.name || (lang === "HI" ? "प्रमुख समाचार" : "Top Story")}
                </span>
                {heroArticle.isHero && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ★ SPOTLIGHT
                  </span>
                )}
              </div>

              <Link
                href={getArticleUrl(heroArticle)}
                style={{ textDecoration: "none", color: "#ffffff" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-headline, sans-serif)",
                    fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                    fontWeight: 800,
                    lineHeight: 1.35,
                    margin: "0 0 8px",
                  }}
                >
                  {heroArticle.title}
                </h2>
              </Link>

              {heroArticle.summary && (
                <p
                  style={{
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    color: "#cbd5e1",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {heroArticle.summary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Side Spotlight Items */}
        {sideArticles.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {sideArticles.slice(0, 3).map((item, idx) => (
              <Link
                key={item.id || idx}
                href={getArticleUrl(item)}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  background: "var(--color-card-bg, #ffffff)",
                  padding: "10px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "90px",
                    height: "75px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative",
                    flexShrink: 0,
                    background: "#0f172a",
                  }}
                >
                  <img
                    src={getArticleImage(item, idx + 1, 300)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {item.videoUrl && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.3)",
                      }}
                    >
                      <Play size={16} color="#ffffff" fill="#ffffff" />
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  {item.category?.name && (
                    <span
                      style={{
                        color: "#e50914",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {item.category.name}
                    </span>
                  )}
                  <h3
                    style={{
                      fontFamily: "var(--font-headline, sans-serif)",
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      lineHeight: 1.35,
                      margin: "3px 0 0",
                      color: "var(--color-text, #0f172a)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
