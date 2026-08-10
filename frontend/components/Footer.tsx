"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  User,
  Link2,
  Mail,
  Send,
  ShieldCheck,
  MapPin,
  FileText,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com"
  });

  const loadSocialLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/social-settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSocialLinks({
          facebook: json.data.facebook || "https://facebook.com",
          twitter: json.data.twitter || "https://twitter.com",
          youtube: json.data.youtube || "https://youtube.com",
          instagram: json.data.instagram || "https://instagram.com",
          linkedin: json.data.linkedin || "https://linkedin.com"
        });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadSocialLinks();
    const handleSocialUpdate = () => loadSocialLinks();
    window.addEventListener("ga_social_links_updated", handleSocialUpdate);
    return () => {
      window.removeEventListener("ga_social_links_updated", handleSocialUpdate);
    };
  }, [loadSocialLinks]);

  const [customCompanyLinks, setCustomCompanyLinks] = useState<Array<{ nameHi: string; nameEn: string; href: string }>>([
    { nameHi: "हमारे बारे में", nameEn: "About Us", href: "/about" },
    { nameHi: "हमारी टीम", nameEn: "Our Team", href: "/team" },
    { nameHi: "करियर / नौकरियां", nameEn: "Careers & Jobs", href: "/careers" },
    { nameHi: "गोपनीयता नीति", nameEn: "Privacy Policy", href: "/#privacy" },
    { nameHi: "सेवा की शर्तें", nameEn: "Terms of Service", href: "/#terms" },
    { nameHi: "संपर्क करें", nameEn: "Contact Us", href: "/#contact" },
    { nameHi: "विज्ञापन दें", nameEn: "Advertise", href: "/advertise" }
  ]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  const isHindi = lang === "HI";

  // Category links using the actual tabs in our application
  const categoryTabs = [
    { name: isHindi ? "विदेश" : "World", slug: "world" },
    { name: isHindi ? "भारत" : "India", slug: "india" },
    { name: isHindi ? "व्यापार" : "Business", slug: "business" },
    { name: isHindi ? "तकनीक" : "Technology", slug: "technology" },
    { name: isHindi ? "खेल" : "Sports", slug: "sports" },
    { name: isHindi ? "मनोरंजन" : "Entertainment", slug: "entertainment" },
    { name: isHindi ? "विज्ञान" : "Science", slug: "science" },
    { name: isHindi ? "स्वास्थ्य" : "Health", slug: "health" }
  ];

  // Dynamic Company links from Admin settings
  const companyLinks = customCompanyLinks.map(item => {
    let targetHref = item.href || "/#link";
    if (
      item.nameHi?.includes("हमारे बारे में") ||
      item.nameEn?.toLowerCase().includes("about us") ||
      targetHref === "/#about" ||
      targetHref === "#about"
    ) {
      targetHref = "/about";
    }
    if (
      item.nameHi?.includes("टीम") ||
      item.nameEn?.toLowerCase().includes("team") ||
      targetHref === "/#team" ||
      targetHref === "#team"
    ) {
      targetHref = "/team";
    }
    if (
      item.nameHi?.includes("करियर") ||
      item.nameEn?.toLowerCase().includes("careers") ||
      targetHref === "/#careers" ||
      targetHref === "#careers"
    ) {
      targetHref = "/careers";
    }
    if (
      item.nameHi?.includes("विज्ञापन") ||
      item.nameEn?.toLowerCase().includes("advertise") ||
      targetHref === "/#advertise" ||
      targetHref === "#advertise"
    ) {
      targetHref = "/advertise";
    }
    return {
      name: isHindi ? item.nameHi : item.nameEn,
      href: targetHref
    };
  });

  // Quick links
  const quickLinks = [
    { name: isHindi ? "ताज़ा समाचार" : "Latest News", href: "/#latest" },
    { name: isHindi ? "विशेष रिपोर्ट" : "Special Reports", href: "/#reports" },
    { name: isHindi ? "हमारी टीम" : "Our Editorial Team", href: "/team" },
    { name: isHindi ? "करियर / नौकरियां" : "Careers & Jobs", href: "/careers" },
    { name: isHindi ? "वीडियो" : "Videos", href: "/videos" },
    { name: isHindi ? "ई-पेपर" : "E-Paper", href: "/epaper" },
    { name: isHindi ? "विज्ञापन दें" : "Advertise With Us", href: "/advertise" }
  ];

  return (
    <footer
      style={{
        background: "#0b0f17",
        color: "#f8fafc",
        padding: "45px 0 24px 0",
        marginTop: "0px",
        borderTop: "3px solid #e50914",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Subtle background dot matrix pattern on the left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "400px",
          height: "100%",
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          pointerEvents: "none",
          opacity: 0.7
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── TOP SECTION: BRAND + 4 COLUMNS ──────────────────────────── */}
        <div className="footer-top-grid">

          {/* BRAND COLUMN */}
          <div className="footer-brand-col">
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "12px" }}>
              <h2 style={{ fontFamily: "serif", fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "0.02em" }}>
                <span style={{ color: "#ffffff" }}>GLOBAL </span>
                <span style={{ color: "#e50914" }}>AWAAZ</span>
              </h2>
            </Link>

            <p className="footer-brand-desc" style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.65, margin: "0 0 18px 0", maxWidth: "320px" }}>
              {isHindi
                ? "विश्वसनीय पत्रकारिता, ताज़ा समाचार, गहन व्यावसायिक विश्लेषण और तकनीकी नवाचार देने वाला प्रमुख मीडिया संस्थान।"
                : "A leading media organization delivering trusted journalism, breaking news, in-depth business analysis, and tech innovation."}
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { icon: <Facebook size={15} />, href: socialLinks.facebook || "#" },
                { icon: <Twitter size={15} />, href: socialLinks.twitter || "#" },
                { icon: <Instagram size={15} />, href: socialLinks.instagram || "#" },
                { icon: <Youtube size={15} />, href: socialLinks.youtube || "#" },
                { icon: <Linkedin size={15} />, href: socialLinks.linkedin || "#" }
              ].map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#cbd5e1",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e50914";
                    e.currentTarget.style.borderColor = "#e50914";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.color = "#cbd5e1";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 1: COMPANY */}
          <div className="footer-link-col">
            <div className="footer-heading" style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "8px", marginBottom: "14px", position: "relative" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "6px", color: "#ffffff" }}>
                <User size={15} style={{ color: "#e50914" }} />
                {isHindi ? "कंपनी" : "Company"}
              </h3>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "45px", height: "1.5px", background: "#e50914" }} />
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {companyLinks.map((item, idx) => (
                <li key={idx} className="footer-link-item" style={{ marginBottom: "6px" }}>
                  <Link
                    href={item.href}
                    className="footer-link-anchor"
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "color 0.15s ease"
                    }}
                  >
                    <ChevronRight size={12} style={{ color: "#e50914" }} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="footer-link-col">
            <div className="footer-heading" style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "8px", marginBottom: "14px", position: "relative" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "6px", color: "#ffffff" }}>
                <Link2 size={15} style={{ color: "#e50914" }} />
                {isHindi ? "त्वरित लिंक" : "Quick Links"}
              </h3>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "45px", height: "1.5px", background: "#e50914" }} />
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {quickLinks.map((item, idx) => (
                <li key={idx} className="footer-link-item" style={{ marginBottom: "6px" }}>
                  <Link
                    href={item.href}
                    className="footer-link-anchor"
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "color 0.15s ease"
                    }}
                  >
                    <ChevronRight size={12} style={{ color: "#e50914" }} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: CATEGORIES (USES ACTUAL TABS) */}
          <div className="footer-cat-col">
            <div className="footer-heading" style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "8px", marginBottom: "14px", position: "relative" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "6px", color: "#ffffff" }}>
                <LayoutGrid size={15} style={{ color: "#e50914" }} />
                {isHindi ? "श्रेणियां" : "Categories"}
              </h3>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "45px", height: "1.5px", background: "#e50914" }} />
            </div>

            <ul className="footer-cat-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {categoryTabs.map((cat) => (
                <li key={cat.slug} className="footer-link-item" style={{ marginBottom: "6px" }}>
                  <Link
                    href={`/${cat.slug}`}
                    className="footer-link-anchor"
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "color 0.15s ease"
                    }}
                  >
                    <ChevronRight size={12} style={{ color: "#e50914" }} />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div className="footer-newsletter-col">
            <div className="footer-heading" style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "8px", marginBottom: "14px", position: "relative" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "6px", color: "#ffffff" }}>
                <Mail size={15} style={{ color: "#e50914" }} />
                {isHindi ? "न्यूज़लेटर" : "Newsletter"}
              </h3>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "45px", height: "1.5px", background: "#e50914" }} />
            </div>

            <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.55, margin: "0 0 14px 0" }}>
              {isHindi
                ? "ताज़ा समाचार और अपडेट सीधे अपने ईमेल पर प्राप्त करें।"
                : "Get breaking news & daily editorial updates delivered straight to your inbox."}
            </p>

            {subscribed ? (
              <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", padding: "10px", borderRadius: "6px", fontSize: "0.82rem", fontWeight: 600 }}>
                ✓ {isHindi ? "सदस्यता लेने के लिए धन्यवाद!" : "Thanks for subscribing!"}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <input
                    type="email"
                    required
                    placeholder={isHindi ? "आपका ईमेल..." : "Enter email..."}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      background: "#1e293b",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      outline: "none"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#e50914",
                      color: "#ffffff",
                      border: "none",
                      padding: "0 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Send size={15} />
                  </button>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.75rem", color: "#94a3b8" }}>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    style={{ accentColor: "#e50914", cursor: "pointer" }}
                  />
                  <span>{isHindi ? "गोपनीयता नीति से सहमत हूँ" : "Agree to Privacy Policy"}</span>
                </label>
              </form>
            )}
          </div>

        </div>

        {/* ── BOTTOM BAR ───────────────────── */}
        <div className="footer-bottom-bar">
          {/* Copyright */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={15} style={{ color: "#e50914", flexShrink: 0 }} />
            <span>
              © 2026 Global Awaaz Media Group. {isHindi ? "सर्वाधिकार सुरक्षित।" : "All Rights Reserved."}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={15} style={{ color: "#e50914", flexShrink: 0 }} />
            <span>
              Global Awaaz Media Group — {isHindi ? "नई दिल्ली, भारत" : "New Delhi, India"}
            </span>
          </div>

          {/* Tech Stack */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FileText size={15} style={{ color: "#e50914", flexShrink: 0 }} />
            <span>
              {isHindi ? "नेक्स्ट.जेएस एवं एक्सप्रेस आर्किटेक्चर द्वारा संचालित" : "Powered by Next.js & Express Architecture"}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
