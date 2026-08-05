"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Calendar, Loader2 } from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import { useLanguage } from "@/context/LanguageContext";
import { stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { INDIAN_STATES, IndianState } from "@/lib/states";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug: string; color?: string; subCategory?: string };
  subCategory?: string;
  author?: { name: string };
  readTime?: string;
  createdAt?: string;
  status?: string;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  state?: string;
}

const SECTION_SUB_CATEGORIES: Record<string, { en: string; hi: string }[]> = {
  education: [
    { en: "Education News", hi: "शिक्षा समाचार" },
    { en: "Board Exams (10th/12th)", hi: "बोर्ड परीक्षा (10वीं/12वीं)" },
    { en: "Competitive Exams (UPSC/JEE/NEET)", hi: "प्रतियोगी परीक्षाएं" },
    { en: "College & Admissions", hi: "कॉलेज और प्रवेश" },
    { en: "Career Guidance", hi: "करियर मार्गदर्शन" }
  ],
  latest: [
    { en: "Education News", hi: "शिक्षा समाचार" },
    { en: "Board Exams (10th/12th)", hi: "बोर्ड परीक्षा (10वीं/12वीं)" },
    { en: "Competitive Exams (UPSC/JEE/NEET)", hi: "प्रतियोगी परीक्षाएं" },
    { en: "College & Admissions", hi: "कॉलेज और प्रवेश" }
  ],
  world: [
    { en: "International Affairs", hi: "अंतरराष्ट्रीय मामले" },
    { en: "World Politics", hi: "वैश्विक राजनीति" },
    { en: "Defence & Security", hi: "रक्षा व सुरक्षा" },
    { en: "Diplomacy", hi: "कूटनीति व संबंध" },
    { en: "Global Economy", hi: "ग्लोबल अर्थव्यवस्था" }
  ],
  business: [
    { en: "Stock Markets", hi: "शेयर बाज़ार" },
    { en: "Companies & Startups", hi: "कंपनियां व स्टार्ट-अप" },
    { en: "Personal Finance & Tax", hi: "पर्सनल फाइनेंस" },
    { en: "Economy", hi: "अर्थव्यवस्था" },
    { en: "Crypto & Banking", hi: "क्रिप्टो व बैंकिंग" }
  ],
  technology: [
    { en: "AI & Machine Learning", hi: "एआई और मशीन लर्निंग" },
    { en: "Smartphones & Gadgets", hi: "स्मार्टफोन और गैजेट्स" },
    { en: "Cloud & Software", hi: "सॉफ्टवेयर और ऐप्स" },
    { en: "Space Tech", hi: "अंतरिक्ष तकनीक" },
    { en: "Cybersecurity", hi: "साइबर सुरक्षा" }
  ],
  sports: [
    { en: "Cricket", hi: "क्रिकेट" },
    { en: "Football", hi: "फुटबॉल" },
    { en: "Formula 1", hi: "फॉर्मूला 1" },
    { en: "Olympics & Athletics", hi: "ओलंपिक व अन्य खेल" }
  ],
  entertainment: [
    { en: "Cinema & Movies", hi: "सिनेमा और फिल्में" },
    { en: "OTT & Web Series", hi: "ओटीटी और वेब सीरीज" },
    { en: "Music & Songs", hi: "म्यूजिक और गाने" },
    { en: "Celebrity Gossips", hi: "सेलेब्रिटी अपडेट्स" }
  ],
  science: [
    { en: "Space Exploration", hi: "अंतरिक्ष अनुसंधान" },
    { en: "Innovations & Discoveries", hi: "नवाचार व खोजें" },
    { en: "Environment & Climate", hi: "पर्यावरण व जलवायु" }
  ],
  health: [
    { en: "Fitness & Yoga", hi: "फिटनेस और योग" },
    { en: "Nutrition & Diet", hi: "आहार और पोषण" },
    { en: "Medical Breakthroughs", hi: "चिकित्सा शोध" }
  ],
  opinion: [
    { en: "Daily Editorials", hi: "दैनिक संपादकीय" },
    { en: "Expert Columns", hi: "विशेषज्ञ दृष्टिकोण" },
    { en: "Special Reports", hi: "विशेष विश्लेषणात्मक रिपोर्ट" }
  ],
  videos: [
    { en: "Trending Video Clips", hi: "ट्रेंडिंग वीडियो" },
    { en: "Ground Reports", hi: "ग्राउंड रिपोर्ट" },
    { en: "Documentaries", hi: "वृत्तचित्र" }
  ]
};

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

  const [allSectionArticles, setAllSectionArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubCategory, setSelectedSubCategory] = useState("ALL");

  // State Sub-Tab selection (Default Jharkhand)
  const [selectedState, setSelectedState] = useState<IndianState>(INDIAN_STATES[0]);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const subParam = searchParams.get("sub");
      if (subParam) {
        setSelectedSubCategory(subParam);
      } else {
        setSelectedSubCategory("ALL");
      }
    } catch (e) {}
  }, [section]);

  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem("ga_selected_state");
        if (stored) {
          const found = INDIAN_STATES.find(s => s.code === stored || s.slug === stored || s.nameEn.toLowerCase() === stored.toLowerCase());
          if (found) setSelectedState(found);
        } else {
          const jharkhand = INDIAN_STATES.find(s => s.code === "JH") || INDIAN_STATES[0];
          setSelectedState(jharkhand);
          localStorage.setItem("ga_selected_state", jharkhand.code);
        }
      } catch (e) {}
    };
    loadState();
    window.addEventListener("storage", loadState);
    window.addEventListener("ga_state_changed", loadState);
    return () => {
      window.removeEventListener("storage", loadState);
      window.removeEventListener("ga_state_changed", loadState);
    };
  }, []);

  const handleStateClick = (st: IndianState) => {
    setSelectedState(st);
    localStorage.setItem("ga_selected_state", st.code);
    window.dispatchEvent(new Event("ga_state_changed"));
  };

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

      const pool = langFiltered.length > 0 ? langFiltered : combined;

      // 4. Category filter matching single or multi-selected categories
      const sectionLower = section.toLowerCase();
      const sectionFiltered = pool.filter((art: Article) => {
        const catName = art.category?.name?.toLowerCase() || "";
        const catSlug = art.category?.slug?.toLowerCase() || "";
        const multiCats = ((art as any).categories || []).map((c: string) => c.toLowerCase());

        if (sectionLower === "latest" || sectionLower === "top news") {
          return true;
        }

        const isPrimaryMatch = catSlug === sectionLower || catName === sectionLower;
        const isMultiMatch = multiCats.some(c => c === sectionLower || c.includes(sectionLower) || sectionLower.includes(c));

        return isPrimaryMatch || isMultiMatch;
      });

      setAllSectionArticles(sectionFiltered);
      setLoading(false);
    }

    fetchSectionArticles();
    window.addEventListener("storage", fetchSectionArticles);
    return () => window.removeEventListener("storage", fetchSectionArticles);
  }, [section, lang]);

  useEffect(() => {
    if (selectedSubCategory === "ALL") {
      setArticles(allSectionArticles);
    } else {
      const subLower = selectedSubCategory.toLowerCase();
      const subFiltered = allSectionArticles.filter((art) => {
        const artSub = (art.subCategory || art.category?.subCategory || "").toLowerCase();
        return artSub.includes(subLower) || subLower.includes(artSub);
      });
      setArticles(subFiltered.length > 0 ? subFiltered : allSectionArticles);
    }
  }, [selectedSubCategory, allSectionArticles]);

  return (
    <div style={{ marginTop: "30px", minHeight: "60vh" }}>
      {/* Category Header Banner */}
      <div style={{ borderBottom: "3px solid #e50914", paddingBottom: "16px", marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "serif", fontSize: "2.2rem", fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
          {formattedTitle} {lang === "HI" ? "समाचार और संपादकीय" : "News & Editorial Coverage"}
        </h1>
        <p style={{ color: "var(--color-secondary)", marginTop: "6px" }}>
          {lang === "HI"
            ? `${formattedTitle} पर लाइव अपडेट, ब्रेकिंग खबरें और गहन विश्लेषण।`
            : `Live updates, breaking insights, and in-depth analytical reports on ${formattedTitle}.`}
        </p>
      </div>

      {/* Sub-Category Topics Filter Bar */}
      {SECTION_SUB_CATEGORIES[section.toLowerCase()] && SECTION_SUB_CATEGORIES[section.toLowerCase()].length > 0 && (
        <div style={{ marginBottom: "20px", display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
          <button
            onClick={() => setSelectedSubCategory("ALL")}
            style={{
              padding: "7px 16px",
              borderRadius: "20px",
              border: selectedSubCategory === "ALL" ? "2px solid #e50914" : "1px solid var(--color-border, #cbd5e1)",
              background: selectedSubCategory === "ALL" ? "#e50914" : "var(--color-card-bg, #ffffff)",
              color: selectedSubCategory === "ALL" ? "#ffffff" : "var(--color-text, #0f172a)",
              fontWeight: selectedSubCategory === "ALL" ? 800 : 600,
              fontSize: "0.84rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
              boxShadow: selectedSubCategory === "ALL" ? "0 4px 12px rgba(229,9,20,0.25)" : "none"
            }}
          >
            {lang === "HI" ? "सभी विषय (All Topics)" : "All Topics"}
          </button>
          {SECTION_SUB_CATEGORIES[section.toLowerCase()].map((sub) => {
            const isSelected = selectedSubCategory.toLowerCase() === sub.en.toLowerCase();
            return (
              <button
                key={sub.en}
                onClick={() => setSelectedSubCategory(sub.en)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  border: isSelected ? "2px solid #e50914" : "1px solid var(--color-border, #cbd5e1)",
                  background: isSelected ? "#e50914" : "var(--color-card-bg, #ffffff)",
                  color: isSelected ? "#ffffff" : "var(--color-text, #0f172a)",
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 4px 12px rgba(229,9,20,0.25)" : "none"
                }}
              >
                {lang === "HI" ? sub.hi : sub.en}
              </button>
            );
          })}
        </div>
      )}

      {/* Indian States Sub-Tabs Bar (Smartly Active on India Page) */}
      {section.toLowerCase() === "india" && (
        <div style={{ marginBottom: "28px", background: "var(--color-card-bg, #ffffff)", padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--color-border, #e2e8f0)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
              📍 {lang === "HI" ? "राज्य-वार समाचार (State-wise News):" : "State-wise News Highlights:"}
              <span style={{ color: "var(--color-primary)", fontWeight: 900, textTransform: "none" }}>
                {lang === "HI" ? selectedState.nameHi : selectedState.nameEn}
              </span>
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--color-secondary)", fontWeight: 600 }}>
              {lang === "HI" ? "डिफ़ॉल्ट: झारखंड" : "Default: Jharkhand"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "thin" }}>
            {INDIAN_STATES.map((st) => {
              const isSelected = selectedState.code === st.code;
              return (
                <button
                  key={st.code}
                  onClick={() => handleStateClick(st)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    border: isSelected ? "2px solid #e50914" : "1px solid var(--color-border, #cbd5e1)",
                    background: isSelected ? "#e50914" : "transparent",
                    color: isSelected ? "#ffffff" : "var(--color-text)",
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 12px rgba(229,9,20,0.25)" : "none"
                  }}
                >
                  {lang === "HI" ? st.nameHi : st.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
