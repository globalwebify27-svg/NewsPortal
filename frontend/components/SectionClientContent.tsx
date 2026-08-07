"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Calendar, Loader2 } from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import { useLanguage } from "@/context/LanguageContext";
import { stripHtml, getArticleImage, formatArticleSlug, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { INDIAN_STATES, IndianState, autoDetectUserIndianState } from "@/lib/states";

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
    { en: "Celebrities", hi: "सेलेब्रिटी अपडेट्स" }
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
    return "02:15 PM";
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return "02:15 PM"; }
}

export default function SectionClientContent() {
  const params = useParams();
  const rawSection = (params?.section as string) || "india";
  const section = rawSection.toLowerCase();
  const { lang } = useLanguage();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCat, setActiveSubCat] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    if (section === "state" || section === "states") {
      autoDetectUserIndianState().then((detected) => {
        if (detected?.code) setSelectedState(detected.code);
      });
    }
  }, [section]);

  useEffect(() => {
    async function fetchSectionArticles() {
      setLoading(true);
      try {
        let fetchUrl = `${API_ENDPOINTS.articles}?category=${section}&limit=30`;
        if (section === "state" || section === "states") {
          const stParam = selectedState || "JH";
          fetchUrl = `${API_ENDPOINTS.articles}?state=${stParam}&limit=30`;
        }

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          const list = data?.data?.articles || data?.articles || data?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setArticles(list);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API fetch error for section:", section, err);
      }

      setArticles([]);
      setLoading(false);
    }

    fetchSectionArticles();
  }, [section, selectedState]);

  const availableSubCats = SECTION_SUB_CATEGORIES[section] || [];

  const filteredArticles = articles.filter((item) => {
    if (activeSubCat !== "ALL") {
      const itemSub = (item.subCategory || item.category?.subCategory || "").toLowerCase().trim();
      const targetSub = activeSubCat.toLowerCase().trim();
      if (!itemSub.includes(targetSub) && !targetSub.includes(itemSub)) {
        return false;
      }
    }
    return true;
  });

  const sectionDisplayName = (section === "state" || section === "states")
    ? (INDIAN_STATES.find(s => s.code === selectedState)?.[lang === "HI" ? "nameHi" : "nameEn"] || "राज्य समाचार")
    : (section.charAt(0).toUpperCase() + section.slice(1));

  return (
    <div className="section-feed-page" style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 16px" }}>
      <header className="section-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, textTransform: "capitalize", margin: 0 }}>
          {sectionDisplayName}
        </h1>
      </header>

      {availableSubCats.length > 0 && (
        <div className="sub-category-pills" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveSubCat("ALL")}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 600,
              border: activeSubCat === "ALL" ? "none" : "1px solid var(--color-border)",
              backgroundColor: activeSubCat === "ALL" ? "var(--color-primary)" : "var(--color-bg)",
              color: activeSubCat === "ALL" ? "#fff" : "var(--color-text)", cursor: "pointer"
            }}
          >
            {lang === "HI" ? "सभी खबरें" : "All News"}
          </button>
          {availableSubCats.map((sub, idx) => {
            const label = lang === "HI" ? sub.hi : sub.en;
            const isSelected = activeSubCat === sub.en;
            return (
              <button
                key={idx}
                onClick={() => setActiveSubCat(sub.en)}
                style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 600,
                  border: isSelected ? "none" : "1px solid var(--color-border)",
                  backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-bg)",
                  color: isSelected ? "#fff" : "var(--color-text)", cursor: "pointer"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--color-secondary)" }}>
          {lang === "HI" ? "इस श्रेणी में कोई समाचार उपलब्ध नहीं है।" : "No news available in this category."}
        </div>
      ) : (
        <div className="articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {filteredArticles.map((item) => (
            <article key={item.id || item.slug} style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <Link href={getArticleUrl(item)} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                {getArticleImage(item) && (
                  <img
                    src={getArticleImage(item)}
                    alt={item.title}
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                  />
                )}
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                    {item.title}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "var(--color-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} /> {formatCardTime(item.createdAt)}
                    </span>
                    <span>|</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} /> {formatCardDate(item.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--color-secondary)", margin: 0, flex: 1, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {stripHtml(item.summary) || (item.body ? stripHtml(item.body).slice(0, 200) : item.title)}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
