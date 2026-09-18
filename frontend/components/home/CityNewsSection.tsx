"use client";
// =============================================================================
// CityNewsSection — State & City / District Filtered News Module
// =============================================================================

import React from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { Article } from "@/types/article";

interface CityNewsSectionProps {
  articles: Article[];
  selectedState?: string;
  selectedCity?: string;
  onStateChange?: (state: string) => void;
  onCityChange?: (city: string) => void;
  statesList?: string[];
  citiesList?: string[];
  getArticleUrl?: (article: Article) => string;
  getArticleImage?: (article: Article, index?: number) => string;
  lang?: string;
}

export default function CityNewsSection({
  articles = [],
  selectedState = "",
  selectedCity = "",
  onStateChange,
  onCityChange,
  statesList = ["उत्तर प्रदेश", "बिहार", "मध्य प्रदेश", "राजस्थान", "दिल्ली", "महाराष्ट्र"],
  citiesList = [],
  getArticleUrl = (a) => `/news/${a.slug || a.id}`,
  getArticleImage = (a) => a.featuredImage || "/placeholder.jpg",
  lang = "HI",
}: CityNewsSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="city-news-section" aria-label="City & Regional News" style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "1rem",
          borderBottom: "2px solid #0284c7",
          paddingBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={22} color="#0284c7" />
          <h2
            style={{
              fontFamily: "var(--font-headline, sans-serif)",
              fontSize: "1.25rem",
              fontWeight: 800,
              margin: 0,
              color: "var(--color-text, #0f172a)",
            }}
          >
            {lang === "HI" ? "शहर और राज्य समाचार" : "City & Regional News"}
          </h2>
        </div>

        {/* State / City Selector Tabs */}
        {statesList.length > 0 && onStateChange && (
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", maxWidth: "100%", paddingBottom: "2px" }}>
            {statesList.map((st) => (
              <button
                key={st}
                onClick={() => onStateChange(st)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: selectedState === st ? "none" : "1px solid #cbd5e1",
                  background: selectedState === st ? "#0284c7" : "#f8fafc",
                  color: selectedState === st ? "#ffffff" : "#334155",
                  fontWeight: selectedState === st ? 700 : 500,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {articles.slice(0, 6).map((article, idx) => (
          <Link
            key={article.id || idx}
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
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0f172a" }}>
              <img
                src={getArticleImage(article, idx)}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {(article.district || article.state) && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    background: "rgba(2, 132, 199, 0.9)",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {article.district ? `${article.district}, ${article.state || ""}` : article.state}
                </span>
              )}
            </div>

            <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3
                style={{
                  fontFamily: "var(--font-headline, sans-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  lineHeight: 1.4,
                  margin: "0 0 6px",
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
