"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Target,
  Users,
  Globe2,
  Zap,
  BookOpen,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Newspaper
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredAboutData, AboutPageData, defaultAboutData } from "@/lib/aboutData";

export default function AboutPage() {
  const { lang } = useLanguage();
  const isHindi = lang === "HI";

  const [data, setData] = useState<AboutPageData>(defaultAboutData);

  useEffect(() => {
    const loadContent = () => {
      getStoredAboutData().then((res) => {
        if (res) setData(res);
      });
    };
    loadContent();
    window.addEventListener("ga_about_content_updated", loadContent);
    return () => {
      window.removeEventListener("ga_about_content_updated", loadContent);
    };
  }, []);

  return (
    <main suppressHydrationWarning style={{ minHeight: "100vh", background: "var(--color-bg, #f8fafc)", color: "var(--color-text, #0f172a)", paddingBottom: "60px" }}>
      {/* ── HERO BANNER ────────────────────────────────────────────────── */}
      <section className="about-hero-section">
        {/* Decorative Grid Pattern Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.6,
            pointerEvents: "none"
          }}
        />

        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span
            style={{
              background: "#e50914",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: 800,
              padding: "4px 14px",
              borderRadius: "99px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "inline-block",
              marginBottom: "14px",
              boxShadow: "0 4px 14px rgba(229, 9, 20, 0.4)"
            }}
          >
            {isHindi ? data.heroTagHi : data.heroTagEn}
          </span>

          <h1
            style={{
              fontFamily: "serif",
              fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
              fontWeight: 900,
              margin: "0 0 12px 0",
              lineHeight: 1.15,
              letterSpacing: "-0.01em"
            }}
          >
            {data.heroTitle}
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
              color: "#cbd5e1",
              maxWidth: "760px",
              margin: "0 auto 24px auto",
              lineHeight: 1.6,
              fontWeight: 500
            }}
          >
            {isHindi ? data.heroSubHi : data.heroSubEn}
          </p>

          {/* Stats Bar */}
          <div className="about-stats-grid">
            {(data.stats || defaultAboutData.stats).map((st, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e50914", lineHeight: 1 }}>{st.num}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px", fontWeight: 600 }}>
                  {isHindi ? st.labelHi : st.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT CONTAINER ────────────────────────────────────────────── */}
      <div className="about-container">
        
        {/* MISSION & VISION CARDS */}
        <div className="about-cards-grid">
          
          {/* Mission Card */}
          <div className="about-card">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(229, 9, 20, 0.1)",
                color: "#e50914",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
            >
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 10px 0", color: "var(--color-primary, #0f172a)" }}>
              {isHindi ? data.missionTitleHi : data.missionTitleEn}
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
              {isHindi ? data.missionDescHi : data.missionDescEn}
            </p>
          </div>

          {/* Vision Card */}
          <div className="about-card">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(229, 9, 20, 0.1)",
                color: "#e50914",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
            >
              <Globe2 size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 10px 0", color: "var(--color-primary, #0f172a)" }}>
              {isHindi ? data.visionTitleHi : data.visionTitleEn}
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
              {isHindi ? data.visionDescHi : data.visionDescEn}
            </p>
          </div>

        </div>

        {/* ── CORE PILLARS SECTION ────────────────────────────────────────── */}
        <section className="about-pillars-section">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 8px 0" }}>
              {isHindi ? data.pillarsTitleHi : data.pillarsTitleEn}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
              {isHindi ? data.pillarsSubHi : data.pillarsSubEn}
            </p>
          </div>

          <div className="about-pillars-grid">
            {(data.pillars || defaultAboutData.pillars).map((pillar, idx) => {
              const icons = [<ShieldCheck size={26} key={0} />, <Zap size={26} key={1} />, <BookOpen size={26} key={2} />, <Users size={26} key={3} />];
              return (
                <div
                  key={idx}
                  style={{
                    background: "var(--color-bg-alt, #f8fafc)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                    borderRadius: "12px",
                    padding: "20px 16px",
                    textAlign: "center"
                  }}
                >
                  <div style={{ color: "#e50914", display: "inline-block", marginBottom: "10px" }}>
                    {icons[idx % icons.length]}
                  </div>
                  <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: "0 0 6px 0" }}>
                    {isHindi ? pillar.titleHi : pillar.titleEn}
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.45, margin: 0 }}>
                    {isHindi ? pillar.descHi : pillar.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── EDITORIAL COMMITMENT ────────────────────────────────────────── */}
        <section className="about-editorial-section">
          <div className="about-editorial-grid">
            <div>
              <span style={{ color: "#e50914", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {isHindi ? data.ethicsTagHi : data.ethicsTagEn}
              </span>
              <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 800, margin: "6px 0 12px 0", lineHeight: 1.25 }}>
                {isHindi ? data.ethicsTitleHi : data.ethicsTitleEn}
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                {isHindi ? data.ethicsDescHi : data.ethicsDescEn}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(data.ethicsPoints || defaultAboutData.ethicsPoints).map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.85rem", color: "#e2e8f0" }}>
                    <CheckCircle2 size={16} style={{ color: "#e50914", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ lineHeight: 1.4 }}>{isHindi ? item.textHi : item.textEn}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "24px 18px",
                textAlign: "center"
              }}
            >
              <Newspaper size={40} style={{ color: "#e50914", marginBottom: "12px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 8px 0" }}>
                {isHindi ? "समाचार या सुझाव भेजें" : "Send Press Releases & Tips"}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.84rem", lineHeight: 1.45, margin: "0 0 16px 0" }}>
                {isHindi ? "क्या आपके पास कोई महत्वपूर्ण समाचार, दस्तावेज या सुझाव है? हमारे न्यूजडेस्क से संपर्क करें।" : "Have a news tip, document, or press release? Reach out to our newsroom."}
              </p>
              <a
                href={`mailto:${data.newsroomEmail}`}
                className="about-email-link"
                style={{
                  background: "#e50914",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  maxWidth: "100%",
                  wordBreak: "break-all"
                }}
              >
                <Mail size={15} style={{ flexShrink: 0 }} />
                <span>{data.newsroomEmail}</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── CONTACT & HEADQUARTERS ──────────────────────────────────────── */}
        <section className="about-contact-section">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px 0" }}>
              {isHindi ? "हमसे संपर्क करें (Contact Us)" : "Get In Touch"}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.86rem", margin: 0 }}>
              {isHindi ? "GLOBAL AWAAZ मुख्य कार्यालय" : "Global Awaaz Headquarters"}
            </p>
          </div>

          <div className="about-contact-grid">
            {/* Headquarters / Map */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                background: "var(--color-bg-alt, #f8fafc)",
                padding: "16px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-border, #e2e8f0)",
                transition: "all 0.2s ease"
              }}
            >
              <MapPin size={20} style={{ color: "#e50914", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h5 style={{ margin: "0 0 4px 0", fontSize: "0.9rem", fontWeight: 800, color: "var(--color-text, #0f172a)" }}>
                  {isHindi ? "मुख्य कार्यालय" : "Headquarters"}
                </h5>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.45 }}>
                  {isHindi ? data.addressHi : data.addressEn}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.addressEn || data.addressHi || "Global Awaaz Ranchi")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#e50914",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  📍 {isHindi ? "गूगल मैप पर देखें →" : "View on Google Maps →"}
                </a>
              </div>
            </div>

            {/* Email Contact */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                background: "var(--color-bg-alt, #f8fafc)",
                padding: "16px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-border, #e2e8f0)",
                transition: "all 0.2s ease"
              }}
            >
              <Mail size={20} style={{ color: "#e50914", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ minWidth: 0 }}>
                <h5 style={{ margin: "0 0 4px 0", fontSize: "0.9rem", fontWeight: 800, color: "var(--color-text, #0f172a)" }}>
                  {isHindi ? "ईमेल संपर्क" : "Email Enquiries"}
                </h5>
                <div style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6, wordBreak: "break-all", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {data.contactEmail1 && (
                    <a
                      href={`mailto:${data.contactEmail1}`}
                      style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {data.contactEmail1}
                    </a>
                  )}
                  {data.contactEmail2 && (
                    <a
                      href={`mailto:${data.contactEmail2}`}
                      style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {data.contactEmail2}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Hotline */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                background: "var(--color-bg-alt, #f8fafc)",
                padding: "16px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-border, #e2e8f0)",
                transition: "all 0.2s ease"
              }}
            >
              <Phone size={20} style={{ color: "#e50914", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h5 style={{ margin: "0 0 4px 0", fontSize: "0.9rem", fontWeight: 800, color: "var(--color-text, #0f172a)" }}>
                  {isHindi ? "फोन हेल्पलाइन" : "Phone Hotline"}
                </h5>
                <div style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "2px" }}>
                  {data.phone1 && (
                    <a
                      href={`tel:${data.phone1.replace(/[^0-9+]/g, "")}`}
                      style={{ color: "#16a34a", textDecoration: "none", fontWeight: 700 }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      📞 {data.phone1}
                    </a>
                  )}
                  {data.phone2 && (
                    <a
                      href={`tel:${data.phone2.replace(/[^0-9+]/g, "")}`}
                      style={{ color: "#64748b", textDecoration: "none", fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {data.phone2}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
