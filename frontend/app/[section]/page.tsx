"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Calendar, Loader2 } from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import { useLanguage } from "@/context/LanguageContext";
import { stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug: string; color?: string };
  author?: { name: string };
  readTime?: string;
  createdAt?: string;
  status?: string;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
}

function formatCardDate(dateStr?: string) {
  if (!dateStr) return "22 July 2026";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

function formatCardTime(dateStr?: string) {
  if (!dateStr) {
    const now = new Date();
    return now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return ""; }
}

export default function SectionPage() {
  const { lang, t } = useLanguage();
  const params = useParams();
  const section = (params?.section as string) || "news";
  const formattedTitle = section.charAt(0).toUpperCase() + section.slice(1);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSectionArticles() {
      let combined: Article[] = [];

      // 1. Backend API
      try {
        const res = await fetch(API_ENDPOINTS.articles);
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          combined = json.data;
        }
      } catch (err) {
        console.warn("Failed fetching section articles from API:", err);
      }

      // 2. Admin custom articles from localStorage
      try {
        const local = localStorage.getItem("ga_custom_articles");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const apiIds = new Set(combined.map((a) => a.id));
            // Only published articles, skip drafts
            const uniqueCustom = parsed.filter(
              (a: Article) => !apiIds.has(a.id) && a.status !== "DRAFT"
            );
            combined = [...uniqueCustom, ...combined];
          }
        }
      } catch (e) {}

      // 3. Filter by current language
      const langFiltered = combined.filter((art: Article) => {
        if (lang === "HI") return art.language === "HI";
        return art.language !== "HI";
      });

      // Use lang-filtered list if available, else all combined
      const pool = langFiltered.length > 0 ? langFiltered : combined;

      // 4. STRICT category filter — match by slug OR name, case-insensitive
      //    Do NOT fall back to all articles if no match — show empty state instead.
      const sectionLower = section.toLowerCase();
      const filtered = pool.filter((art: Article) => {
        const slugMatch = art.category?.slug?.toLowerCase() === sectionLower;
        const nameMatch = art.category?.name?.toLowerCase() === sectionLower;
        return slugMatch || nameMatch;
      });

      setArticles(filtered);   // strictly category-filtered — no global fallback
      setLoading(false);
    }

    fetchSectionArticles();
    window.addEventListener("storage", fetchSectionArticles);
    return () => window.removeEventListener("storage", fetchSectionArticles);
  }, [section, lang]);

  return (
    <div style={{ marginTop: "30px", minHeight: "60vh" }}>
      {/* Category Header Banner */}
      <div style={{ borderBottom: "3px solid #e50914", paddingBottom: "16px", marginBottom: "30px" }}>
        <h1 style={{ fontFamily: "serif", fontSize: "2.2rem", fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
          {formattedTitle} {lang === "HI" ? "समाचार और संपादकीय" : "News & Editorial Coverage"}
        </h1>
        <p style={{ color: "var(--color-secondary)", marginTop: "6px" }}>
          {lang === "HI"
            ? `${formattedTitle} पर लाइव अपडेट, ब्रेकिंग खबरें और गहन विश्लेषण।`
            : `Live updates, breaking insights, and in-depth analytical reports on ${formattedTitle}.`}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#e50914" }} />
        </div>
      ) : articles.length === 0 ? (
        <div style={{
          padding: "48px 32px", textAlign: "center",
          background: "var(--color-card-bg)",
          borderRadius: "16px",
          border: "1px dashed var(--color-border)",
          maxWidth: "520px", margin: "0 auto"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📂</div>
          <h3 style={{ fontFamily: "serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "10px", color: "var(--color-primary)" }}>
            {lang === "HI"
              ? `${formattedTitle} अनुभाग में अभी कोई समाचार नहीं है`
              : `No articles in ${formattedTitle} section yet`}
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)", lineHeight: 1.6 }}>
            {lang === "HI"
              ? `कृपया नवीनतम समाचारों के लिए बाद में पुनः जांचें।`
              : `Please check back later for the latest news updates.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "24px" }}>
          {articles.map((item) => (
            <article
              key={item.id}
              className="section-article-card"
              style={{
                background: "var(--color-card-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
            >
              <Link href={`/article/${item.slug && item.slug.length > 1 ? item.slug : item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>

                {/* Full-width image */}
                <div
                  className="section-article-img-wrap"
                  style={{
                    position: "relative",
                    height: item.imageHeight && item.imageHeight !== "auto" ? item.imageHeight : "200px",
                    width: "100%",
                    background: "#18181b",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={item.featuredImage || ""}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: item.imageFit || "cover", transition: "transform 0.5s ease" }}
                  />
                  <span style={{
                    position: "absolute", top: "12px", left: "12px",
                    background: item.category?.color || "#e50914",
                    color: "#fff", padding: "4px 10px", borderRadius: "6px",
                    fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.05em", zIndex: 2
                  }}>
                    {item.category?.name || formattedTitle}
                  </span>
                </div>

                {/* Content body */}
                <div
                  className="section-article-body"
                  style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1, gap: "8px" }}
                >
                  {/* Bold title */}
                  <h3
                    className="section-article-title"
                    style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, lineHeight: 1.35, color: "var(--color-primary)" }}
                  >
                    {item.title}
                  </h3>

                  {/* ⊙ Time  |  📅 Date */}
                  <div
                    className="card-meta-row"
                    style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "var(--color-secondary)", marginTop: "2px" }}
                  >
                    <span className="meta-time" style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      <Clock size={13} />
                      {formatCardTime(item.createdAt)}
                    </span>
                    <span style={{ color: "var(--color-border)" }}>|</span>
                    <span className="meta-date" style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      <Calendar size={13} />
                      {formatCardDate(item.createdAt)}
                    </span>
                  </div>

                  {/* Summary excerpt — justified, 4-line clamp */}
                  <p
                    className="section-article-excerpt"
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--color-secondary)",
                      margin: 0,
                      flex: 1,
                      lineHeight: 1.65,
                      textAlign: "justify",
                      display: "-webkit-box",
                      WebkitLineClamp: 7,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {stripHtml(item.summary) || (item.body ? stripHtml(item.body).slice(0, 400) + " [....]" : item.title)}
                  </p>

                  {/* Footer: author name + share icons */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderTop: "1px solid var(--color-border)", paddingTop: "10px",
                    fontSize: "0.78rem", color: "var(--color-secondary)", marginTop: "auto"
                  }}>
                    <span style={{ fontWeight: 600 }}>
                      {item.author?.name || "Global Awaaz Staff"}
                    </span>
                    <SocialShareButtons title={item.title} slug={item.slug} size="sm" />
                  </div>
                </div>

              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
