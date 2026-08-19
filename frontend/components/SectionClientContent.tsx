"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Clock, Calendar, Loader2 } from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import { useLanguage } from "@/context/LanguageContext";
import { stripHtml, getArticleImage, formatArticleSlug, getArticleUrl } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { INDIAN_STATES, IndianState, autoDetectUserIndianState } from "@/lib/states";
import { getDistrictsForState } from "@/lib/districts";
import { getSubCategories, isSubCategoryMatch } from "@/lib/subCategories";

// Returns state if section param matches a state slug/code/name, else null
function detectStateFromSection(section: string): IndianState | null {
  const lower = section.toLowerCase();
  return INDIAN_STATES.find(
    (st) =>
      st.slug === lower ||
      st.code.toLowerCase() === lower ||
      st.nameEn.toLowerCase() === lower ||
      st.nameEn.toLowerCase().replace(/\s+/g, "-") === lower
  ) || null;
}

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

export default function SectionClientContent({
  section: propSection,
  initialSubCat,
}: {
  section?: string;
  initialSubCat?: string;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const rawSection = propSection || (params?.section as string) || "india";
  const section = rawSection.toLowerCase();
  const { lang } = useLanguage();

  // Detect if this section param is actually a state slug (e.g. /jharkhand, /bihar)
  const detectedStateFromPath = detectStateFromSection(section);
  const isStatePage = !!detectedStateFromPath || section === "india" || section === "state" || section === "states";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCat, setActiveSubCat] = useState<string>(initialSubCat || "ALL");
  const [activeDistrict, setActiveDistrict] = useState<string>("ALL");
  // Initialize selectedState from path if it's a state page
  const [selectedState, setSelectedState] = useState<string>(
    detectedStateFromPath ? detectedStateFromPath.code : ""
  );

  const searchParams = useSearchParams();
  const subParam = searchParams?.get("sub");

  useEffect(() => {
    if (subParam) {
      setActiveSubCat(subParam);
    } else if (initialSubCat) {
      setActiveSubCat(initialSubCat);
    }
  }, [subParam, initialSubCat]);

  // Sync selectedState when path changes (e.g. user navigates /jharkhand -> /bihar)
  useEffect(() => {
    if (detectedStateFromPath) {
      // Direct state route like /jharkhand — lock to that state
      setSelectedState(detectedStateFromPath.code);
    } else if (section === "india") {
      // /india page: always show All India by default, not the geo-detected state
      setSelectedState("ALL");
    }
    setActiveDistrict("ALL");
  }, [section]);

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
    async function fetchSectionArticles() {
      setLoading(true);
      let combined: Article[] = [];

      try {
        let fetchUrl: string;

        if (detectedStateFromPath) {
          // /jharkhand, /bihar etc — fetch articles tagged with this state
          fetchUrl = `${API_ENDPOINTS.articles}?state=${detectedStateFromPath.code}&limit=100`;
        } else if (section === "india" || section === "state" || section === "states") {
          if (selectedState && selectedState !== "ALL") {
            // User picked a specific state from dropdown on /india — fetch that state
            fetchUrl = `${API_ENDPOINTS.articles}?state=${selectedState}&limit=100`;
          } else {
            // All India view — fetch all india-category articles (includes national + all states)
            fetchUrl = `${API_ENDPOINTS.articles}?category=india&limit=150`;
          }
        } else {
          fetchUrl = `${API_ENDPOINTS.articles}?category=${section}&limit=100`;
        }

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          const list = data?.data?.articles || data?.articles || data?.data || [];
          if (Array.isArray(list)) combined = list;
        }
      } catch (err) {
        console.warn("API fetch error for section:", section, err);
      }

      setArticles(combined);
      setLoading(false);
    }

    fetchSectionArticles();
  }, [section, selectedState]);

  const availableSubCats = getSubCategories(isStatePage ? "india" : section);
  const selectedStateObj = detectedStateFromPath || INDIAN_STATES.find(s => s.code === selectedState);
  const stateDistricts = selectedStateObj ? getDistrictsForState(selectedStateObj.code) : [];




  /**
   * ADMIN → FRONTEND MAPPING FOR INDIA / STATE PAGES
   * -------------------------------------------------------
   * Admin saves:                        Shows on frontend:
   * SubCat="National News"              /india → चालू सब-टैब जो बाधा है बनाएं
   * + State="National/All India"        ⇒ राष्ट्रीय समाचार sub-tab
   * State="Jharkhand"                   ⇒ /jharkhand page, all sub-tabs
   * State="Jharkhand"+District="Ranchi" ⇒ /jharkhand, Ranchi district filter
   */

  // Helper: is this a "national" state value (not a specific Indian state)
  const NATIONAL_STATE_VALUES = ["national", "all india", "all", "national / all india", "pur bharat", "पूरा भारत", "national/all india"];
  const isNationalState = (st: string) => {
    const lower = st.toLowerCase().trim();
    return NATIONAL_STATE_VALUES.some(v => lower === v || lower.includes(v));
  };

  // Sub-category pill filter (applied first)
  const subCatFiltered = articles.filter((item) => {
    if (activeSubCat === "ALL") return true;
    const itemSub = item.subCategory || item.category?.subCategory || "";
    return isSubCategoryMatch(itemSub, activeSubCat);
  });

  // District filter
  const districtFiltered = subCatFiltered.filter((item) => {
    if (activeDistrict === "ALL" || stateDistricts.length === 0) return true;
    const itemDist = (item.district || "").toLowerCase().trim();
    const targetDist = activeDistrict.toLowerCase().trim();
    const distObj = stateDistricts.find(d => d.nameEn.toLowerCase() === targetDist);
    const enName = distObj ? distObj.nameEn.toLowerCase() : targetDist;
    const hiName = distObj ? distObj.nameHi.toLowerCase() : "";
    return (
      itemDist === enName || itemDist === hiName ||
      itemDist.includes(enName) || enName.includes(itemDist) ||
      (hiName && itemDist.includes(hiName)) ||
      item.title.toLowerCase().includes(enName) ||
      (hiName && item.title.toLowerCase().includes(hiName))
    );
  });

  // State-level filter — the main mapping logic
  const displayArticles = (() => {
    if (!isStatePage) return districtFiltered; // non-india sections: no state filter

    if (selectedStateObj) {
      // SPECIFIC STATE SELECTED (e.g. Jharkhand): only show articles tagged with that state
      return districtFiltered.filter((item) => {
        const stLower = (item.state || "").toLowerCase().trim();
        if (!stLower) return false;
        const nameEn = selectedStateObj.nameEn.toLowerCase();
        const nameHi = selectedStateObj.nameHi.toLowerCase();
        const code = selectedStateObj.code.toLowerCase();
        const slug = selectedStateObj.slug.toLowerCase();
        return (
          stLower === nameEn || stLower === code || stLower === slug ||
          stLower.includes(nameEn) || stLower.includes(nameHi) || stLower.includes(slug)
        );
      });
    }

    // ALL INDIA VIEW (/india page, no state selected)
    // • "National News" sub-tab → articles where state = National / All India
    // • "All" sub-tab         → all india-category articles (national + state-specific)
    if (activeSubCat === "National News" || activeSubCat === "राष्ट्रीय समाचार") {
      return districtFiltered.filter((item) => {
        const stLower = (item.state || "").toLowerCase().trim();
        return isNationalState(stLower);
      });
    }

    // All India, any sub-tab: show everything returned by the API
    return districtFiltered;
  })();

  const sectionDisplayName = isStatePage
    ? (selectedStateObj
      ? (lang === "HI" ? `${selectedStateObj.nameHi} समाचार` : `${selectedStateObj.nameEn} News`)
      : (lang === "HI" ? "भारत समाचार" : "India News"))
    : (section.charAt(0).toUpperCase() + section.slice(1));

  return (
    <div className="section-feed-page" style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 16px" }}>
      <header className="section-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, textTransform: "capitalize", margin: 0 }}>
          {sectionDisplayName}
        </h1>
      </header>

      {/* PROFESSIONAL COMPACT DROPDOWN FILTER CONTROL BAR */}
      {isStatePage && (
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
                if (val === "ALL") {
                  router.push("/india");
                } else {
                  const stateObj = INDIAN_STATES.find(s => s.code === val);
                  if (stateObj) {
                    router.push(`/${stateObj.slug}`);
                  }
                }
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

      {/* SUB-CATEGORY PILLS — only on /india and other category pages, NOT on state routes like /jharkhand */}
      {availableSubCats.length > 0 && !detectedStateFromPath && (
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
