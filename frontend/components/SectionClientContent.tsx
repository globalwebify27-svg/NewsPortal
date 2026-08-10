"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Clock, Calendar, Loader2 } from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import { useLanguage } from "@/context/LanguageContext";
import { stripHtml, getArticleImage, formatArticleSlug, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { INDIAN_STATES, IndianState, autoDetectUserIndianState } from "@/lib/states";
import { getDistrictsForState } from "@/lib/districts";
import { getSubCategories } from "@/lib/subCategories";

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
  district?: string;
}

const MAIN_INDIAN_STATES = INDIAN_STATES.filter(s =>
  ["JH", "BR", "UP", "DL", "WB", "MH", "RJ", "MP", "PB", "HR", "CG", "UK"].includes(s.code)
);

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
  const [activeDistrict, setActiveDistrict] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("");

  const searchParams = useSearchParams();
  const subParam = searchParams?.get("sub");
  const stateParam = searchParams?.get("state");

  useEffect(() => {
    if (subParam) {
      setActiveSubCat(subParam);
    }
  }, [subParam]);

  useEffect(() => {
    if (stateParam) {
      if (stateParam.toLowerCase() === "all" || stateParam.toLowerCase() === "national") {
        setSelectedState("ALL");
      } else {
        const st = INDIAN_STATES.find(s => s.slug.toLowerCase() === stateParam.toLowerCase() || s.code.toLowerCase() === stateParam.toLowerCase() || s.nameEn.toLowerCase() === stateParam.toLowerCase());
        if (st) setSelectedState(st.code);
      }
    }
  }, [stateParam]);

  useEffect(() => {
    setActiveDistrict("ALL");
  }, [selectedState]);

  useEffect(() => {
    const handleSubCatChange = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv.detail) {
        setActiveSubCat(customEv.detail);
      }
    };
    window.addEventListener("ga_subcat_changed", handleSubCatChange);
    return () => window.removeEventListener("ga_subcat_changed", handleSubCatChange);
  }, []);

  useEffect(() => {
    const syncState = () => {
      const stored = sessionStorage.getItem("ga_selected_state");
      if (stored) {
        setSelectedState(stored);
      } else if (section === "state" || section === "states") {
        autoDetectUserIndianState().then((detected) => {
          if (detected?.code) setSelectedState(detected.code);
        });
      }
    };
    syncState();
    window.addEventListener("ga_state_changed", syncState);
    return () => window.removeEventListener("ga_state_changed", syncState);
  }, [section]);

  useEffect(() => {
    async function fetchSectionArticles() {
      setLoading(true);
      let combined: Article[] = [];

      try {
        let fetchUrl = `${API_ENDPOINTS.articles}?category=${section}&limit=50`;
        if (section === "state" || section === "states") {
          const stParam = selectedState || "JH";
          fetchUrl = `${API_ENDPOINTS.articles}?state=${stParam}&limit=50`;
        }

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          const list = data?.data?.articles || data?.articles || data?.data || [];
          if (Array.isArray(list)) {
            combined = list;
          }
        }
      } catch (err) {
        console.warn("API fetch error for section:", section, err);
      }

      setArticles(combined);
      setLoading(false);
    }

    fetchSectionArticles();
  }, [section, selectedState]);

  const availableSubCats = getSubCategories(section);
  const selectedStateObj = INDIAN_STATES.find(s => s.code === selectedState);
  const stateDistricts = selectedStateObj ? getDistrictsForState(selectedStateObj.code) : [];

  const filteredArticles = articles.filter((item) => {
    // 1. Sub-category filter
    if (activeSubCat !== "ALL") {
      const itemSub = (item.subCategory || item.category?.subCategory || "").toLowerCase().trim();
      if (!itemSub || itemSub === "general") {
        return false;
      }

      const targetSub = activeSubCat.toLowerCase().trim().replace(/-/g, " ");
      const targetSubSlug = activeSubCat.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      const subItem = availableSubCats.find(
        (s) =>
          s.en.toLowerCase() === targetSub ||
          s.hi.toLowerCase() === targetSub ||
          s.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") === targetSubSlug
      );

      if (subItem) {
        const enLower = subItem.en.toLowerCase().trim();
        const hiLower = subItem.hi.toLowerCase().trim();
        const isMatch =
          itemSub === enLower ||
          itemSub === hiLower ||
          itemSub.includes(enLower) ||
          enLower.includes(itemSub) ||
          itemSub.includes(hiLower) ||
          hiLower.includes(itemSub);

        if (!isMatch) return false;
      } else {
        if (!itemSub.includes(targetSub) && !targetSub.includes(itemSub)) {
          return false;
        }
      }
    }

    // 2. District filter
    if (activeDistrict !== "ALL" && stateDistricts.length > 0) {
      const itemDist = (item.district || "").toLowerCase().trim();
      const targetDist = activeDistrict.toLowerCase().trim();
      const distObj = stateDistricts.find(d => d.nameEn.toLowerCase() === targetDist);

      const enName = distObj ? distObj.nameEn.toLowerCase() : targetDist;
      const hiName = distObj ? distObj.nameHi.toLowerCase() : "";

      const distMatches =
        itemDist === enName ||
        itemDist === hiName ||
        itemDist.includes(enName) ||
        enName.includes(itemDist) ||
        (hiName && itemDist.includes(hiName)) ||
        (hiName && hiName.includes(itemDist)) ||
        item.title.toLowerCase().includes(enName) ||
        (hiName && item.title.toLowerCase().includes(hiName)) ||
        (item.summary && item.summary.toLowerCase().includes(enName)) ||
        (hiName && item.summary && item.summary.toLowerCase().includes(hiName));

      if (!distMatches) return false;
    }

    return true;
  });

  const stateMatchedArticles = (selectedState && selectedState !== "ALL" && (section === "india" || section === "state" || section === "states"))
    ? filteredArticles.filter((item) => {
        const stLower = (item.state || "national").toLowerCase().trim();
        if (stLower === "national" || stLower === "all india" || stLower === "all") return true;
        if (selectedStateObj) {
          const nameEn = selectedStateObj.nameEn.toLowerCase();
          const code = selectedStateObj.code.toLowerCase();
          const slug = selectedStateObj.slug.toLowerCase();
          return stLower === nameEn || stLower === code || stLower === slug || stLower.includes(nameEn);
        }
        return false;
      })
    : filteredArticles;

  const displayArticles = stateMatchedArticles;

  const sectionDisplayName = (section === "state" || section === "states" || section === "india")
    ? (!selectedState || selectedState === "ALL"
        ? (lang === "HI" ? "भारत समाचार (All India News)" : "India News (All India Headlines)")
        : (selectedStateObj ? (lang === "HI" ? `${selectedStateObj.nameHi} (भारत समाचार)` : `${selectedStateObj.nameEn} (India News)`) : "भारत समाचार"))
    : (section.charAt(0).toUpperCase() + section.slice(1));

  return (
    <div className="section-feed-page" style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 16px" }}>
      <header className="section-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, textTransform: "capitalize", margin: 0 }}>
          {sectionDisplayName}
        </h1>
      </header>

      {/* PROFESSIONAL COMPACT DROPDOWN FILTER CONTROL BAR */}
      {(section === "india" || section === "state" || section === "states") && (
        <div
          style={{
            marginBottom: "18px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "10px",
            alignItems: "center",
            boxSizing: "border-box",
            maxWidth: "100%",
            width: "100%",
            overflow: "hidden"
          }}
        >
          {/* STATE DROPDOWN */}
          <div style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
              <span>🇮🇳</span>
              <span>{lang === "HI" ? "राज्य चुनें (Select State)" : "Select State"}</span>
            </label>
            <select
              value={selectedState || "ALL"}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedState(val);
                sessionStorage.setItem("ga_selected_state", val);
                window.dispatchEvent(new Event("ga_state_changed"));
              }}
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.82rem",
                fontWeight: 700,
                background: "#ffffff",
                color: "#0f172a",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                outline: "none",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden"
              }}
            >
              <option value="ALL">🇮🇳 {lang === "HI" ? "पूरे भारत की खबरें (All India News)" : "All India News"}</option>
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  📍 {lang === "HI" ? st.nameHi : st.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* CITY / DISTRICT DROPDOWN */}
          <div style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 800, color: (selectedState && selectedState !== "ALL") ? "#e50914" : "#64748b", marginBottom: "4px" }}>
              <span>📍</span>
              <span>
                {(selectedStateObj && selectedState !== "ALL")
                  ? (lang === "HI" ? `${selectedStateObj.nameHi} के ज़िले (Select District)` : `Districts of ${selectedStateObj.nameEn}`)
                  : (lang === "HI" ? "शहर / ज़िला चुनें (Select District)" : "Select City / District")}
              </span>
            </label>
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              disabled={!selectedState || selectedState === "ALL"}
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.82rem",
                fontWeight: 700,
                background: (!selectedState || selectedState === "ALL") ? "#f1f5f9" : "#ffffff",
                color: (!selectedState || selectedState === "ALL") ? "#94a3b8" : "#0f172a",
                cursor: (!selectedState || selectedState === "ALL") ? "not-allowed" : "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                outline: "none",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden"
              }}
            >
              {(!selectedState || selectedState === "ALL") ? (
                <option value="ALL">📍 {lang === "HI" ? "सभी शहर और ज़िले (All Cities & Districts)" : "All Cities & Districts"}</option>
              ) : (
                <>
                  <option value="ALL">📍 {lang === "HI" ? `सभी ज़िले (${selectedStateObj?.nameHi || "All Districts"})` : `All Districts in ${selectedStateObj?.nameEn}`}</option>
                  {stateDistricts.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      📍 {lang === "HI" ? d.nameHi : d.nameEn}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {availableSubCats.length > 0 && !(selectedStateObj && (section === "india" || section === "state" || section === "states")) && (
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
      ) : displayArticles.length === 0 ? (
        <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--color-secondary)", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", margin: "20px 0" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📍</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
            {activeDistrict !== "ALL"
              ? (lang === "HI" ? `"${activeDistrict}" ज़िले में कोई समाचार उपलब्ध नहीं है।` : `No news available in "${activeDistrict}" district.`)
              : (lang === "HI" ? "इस श्रेणी में कोई समाचार उपलब्ध नहीं है।" : "No news available in this category.")}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {lang === "HI" ? "कृपया दूसरा ज़िला या 'सभी ज़िले' चुनें।" : "Please select another district or 'All Districts'."}
          </div>
        </div>
      ) : (
        <div className="articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          {displayArticles.map((item) => (
            <article key={item.id || item.slug} style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
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
