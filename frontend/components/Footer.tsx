"use client";

import React, { useState, useEffect } from "react";
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

  const [customCompanyLinks, setCustomCompanyLinks] = useState<Array<{ nameHi: string; nameEn: string; href: string }>>([
    { nameHi: "हमारे बारे में", nameEn: "About Us", href: "/#about" },
    { nameHi: "करियर", nameEn: "Careers", href: "/#careers" },
    { nameHi: "गोपनीयता नीति", nameEn: "Privacy Policy", href: "/#privacy" },
    { nameHi: "सेवा की शर्तें", nameEn: "Terms of Service", href: "/#terms" },
    { nameHi: "संपर्क करें", nameEn: "Contact Us", href: "/#contact" },
    { nameHi: "विज्ञापन दें", nameEn: "Advertise", href: "/#advertise" }
  ]);

  useEffect(() => {
    const loadSocialLinks = () => {
      try {
        const stored = localStorage.getItem("ga_social_links");
        if (stored) {
          const parsed = JSON.parse(stored);
          setSocialLinks((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    };

    const loadCompanyLinks = () => {
      try {
        const stored = localStorage.getItem("ga_company_footer_links");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCustomCompanyLinks(parsed);
          }
        }
      } catch (e) {}
    };

    loadSocialLinks();
    loadCompanyLinks();

    window.addEventListener("storage", loadSocialLinks);
    window.addEventListener("ga_social_links_changed", loadSocialLinks);
    window.addEventListener("storage", loadCompanyLinks);
    window.addEventListener("ga_company_links_changed", loadCompanyLinks);

    return () => {
      window.removeEventListener("storage", loadSocialLinks);
      window.removeEventListener("ga_social_links_changed", loadSocialLinks);
      window.removeEventListener("storage", loadCompanyLinks);
      window.removeEventListener("ga_company_links_changed", loadCompanyLinks);
    };
  }, []);

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
  const companyLinks = customCompanyLinks.map(item => ({
    name: isHindi ? item.nameHi : item.nameEn,
    href: item.href || "/#link"
  }));

  // Quick links
  const quickLinks = [
    { name: isHindi ? "ताज़ा समाचार" : "Latest News", href: "/#latest" },
    { name: isHindi ? "विशेष रिपोर्ट" : "Special Reports", href: "/#reports" },
    { name: isHindi ? "वीडियो" : "Videos", href: "/videos" },
    { name: isHindi ? "संपादकीय" : "Editorials", href: "/#editorials" },
    { name: isHindi ? "फोटो गैलरी" : "Photo Gallery", href: "/#gallery" },
    { name: isHindi ? "ई-पेपर" : "E-Paper", href: "/#epaper" }
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px", marginBottom: "48px" }}>

          {/* BRAND COLUMN */}
          <div style={{ gridColumn: "span 1.2" }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "serif", fontSize: "1.9rem", fontWeight: 800, margin: 0, letterSpacing: "0.02em" }}>
                <span style={{ color: "#ffffff" }}>GLOBAL </span>
                <span style={{ color: "#e50914" }}>AWAAZ</span>
              </h2>
            </Link>

            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 24px 0", maxWidth: "320px" }}>
              {isHindi
                ? "विश्वसनीय पत्रकारिता, ताज़ा समाचार, गहन व्यावसायिक विश्लेषण और तकनीकी नवाचार देने वाला प्रमुख मीडिया संस्थान।"
                : "A leading media organization delivering trusted journalism, breaking news, in-depth business analysis, and tech innovation."}
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { icon: <Facebook size={16} />, href: socialLinks.facebook || "#" },
                { icon: <Twitter size={16} />, href: socialLinks.twitter || "#" },
                { icon: <Instagram size={16} />, href: socialLinks.instagram || "#" },
                { icon: <Youtube size={16} />, href: socialLinks.youtube || "#" },
                { icon: <Linkedin size={16} />, href: socialLinks.linkedin || "#" }
              ].map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
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
                    e.currentTarget.style.transform = "translateY(-3px)";
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

          {/* COLUMN 1: CATEGORIES (USES ACTUAL TABS) */}
          <div>
            <div style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px", marginBottom: "16px", position: "relative" }}>
              <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                <LayoutGrid size={16} style={{ color: "#e50914" }} />
                {isHindi ? "श्रेणियां" : "Categories"}
              </h4>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "50px", height: "1.5px", background: "#e50914" }} />
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {categoryTabs.map((cat) => (
                <li key={cat.slug} style={{ marginBottom: "8px" }}>
                  <Link
                    href={`/${cat.slug}`}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.15s ease, transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ChevronRight size={13} style={{ color: "#e50914" }} />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 2: COMPANY */}
          <div>
            <div style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px", marginBottom: "16px", position: "relative" }}>
              <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                <User size={16} style={{ color: "#e50914" }} />
                {isHindi ? "कंपनी" : "Company"}
              </h4>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "50px", height: "1.5px", background: "#e50914" }} />
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {companyLinks.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  <Link
                    href={item.href}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.15s ease, transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ChevronRight size={13} style={{ color: "#e50914" }} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: QUICK LINKS */}
          <div>
            <div style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px", marginBottom: "16px", position: "relative" }}>
              <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                <Link2 size={16} style={{ color: "#e50914" }} />
                {isHindi ? "त्वरित लिंक" : "Quick Links"}
              </h4>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "50px", height: "1.5px", background: "#e50914" }} />
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {quickLinks.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  <Link
                    href={item.href}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.15s ease, transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ChevronRight size={13} style={{ color: "#e50914" }} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div>
            <div style={{ borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px", marginBottom: "16px", position: "relative" }}>
              <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                <Mail size={16} style={{ color: "#e50914" }} />
                {isHindi ? "न्यूज़लेटर" : "Newsletter"}
              </h4>
              <div style={{ position: "absolute", bottom: "-1.5px", left: 0, width: "50px", height: "1.5px", background: "#e50914" }} />
            </div>

            <p style={{ color: "#94a3b8", fontSize: "0.86rem", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              {isHindi
                ? "ताज़ा समाचार और अपडेट सीधे अपने ईमेल पर प्राप्त करें।"
                : "Get breaking news & daily editorial updates delivered straight to your inbox."}
            </p>

            {subscribed ? (
              <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                ✓ {isHindi ? "सदस्यता लेने के लिए धन्यवाद!" : "Thanks for subscribing!"}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <input
                    type="email"
                    required
                    placeholder={isHindi ? "आपका ईमेल पता..." : "Enter your email address..."}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "11px 14px",
                      background: "#1e293b",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      outline: "none"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#e50914",
                      color: "#ffffff",
                      border: "none",
                      padding: "0 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#b91c1c"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#e50914"; }}
                  >
                    <Send size={16} />
                  </button>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.78rem", color: "#94a3b8" }}>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    style={{ accentColor: "#e50914", cursor: "pointer" }}
                  />
                  <span>{isHindi ? "मैं गोपनीयता नीति से सहमत हूँ।" : "I agree to the Privacy Policy."}</span>
                </label>
              </form>
            )}
          </div>

        </div>

        {/* ── BOTTOM BAR (3 SECTIONS WITH SEPARATORS) ───────────────────── */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            fontSize: "0.82rem",
            color: "#64748b",
            alignItems: "center"
          }}
        >
          {/* Copyright */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} style={{ color: "#e50914", flexShrink: 0 }} />
            <span>
              © 2026 Global Awaaz Media Group. {isHindi ? "सर्वाधिकार सुरक्षित।" : "All Rights Reserved."}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={16} style={{ color: "#e50914", flexShrink: 0 }} />
            <span>
              Global Awaaz Media Group — {isHindi ? "नई दिल्ली, भारत" : "New Delhi, India"}
            </span>
          </div>

          {/* Tech Stack */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={16} style={{ color: "#e50914", flexShrink: 0 }} />
            <span>
              {isHindi ? "नेक्स्ट.जेएस एवं एक्सप्रेस आर्किटेक्चर द्वारा संचालित" : "Powered by Next.js & Express Architecture"}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
