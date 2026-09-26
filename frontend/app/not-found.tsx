"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ArrowLeft,
  Search,
  Compass,
  FileQuestion,
  TrendingUp,
  Video,
  Newspaper,
  BookOpen
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isHindi = lang === "HI";
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/india?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const popularSections = [
    { nameHi: "मुख्य समाचार", nameEn: "Lead News", slug: "/", icon: <TrendingUp size={16} /> },
    { nameHi: "झारखंड", nameEn: "Jharkhand", slug: "/jharkhand", icon: <Compass size={16} /> },
    { nameHi: "राजनीति", nameEn: "Politics", slug: "/politics", icon: <BookOpen size={16} /> },
    { nameHi: "वीडियो", nameEn: "Videos", slug: "/videos", icon: <Video size={16} /> },
    { nameHi: "ई-पेपर", nameEn: "E-Paper", slug: "/epaper", icon: <Newspaper size={16} /> },
  ];

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        background: "var(--color-bg, #ffffff)",
        color: "var(--color-primary, #0f172a)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "300px",
          background: "radial-gradient(circle, rgba(229, 9, 20, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(229, 9, 20, 0.1)",
            color: "#e50914",
            padding: "6px 16px",
            borderRadius: "99px",
            fontSize: "0.85rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "20px",
            border: "1px solid rgba(229, 9, 20, 0.2)",
          }}
        >
          <FileQuestion size={16} />
          <span>{isHindi ? "त्रुटि 404 • पृष्ठ अनुपलब्ध" : "Error 404 • Page Not Found"}</span>
        </div>

        {/* 404 Large Display */}
        <h1
          style={{
            fontFamily: "var(--font-headline, sans-serif)",
            fontSize: "clamp(4.5rem, 12vw, 8rem)",
            fontWeight: 900,
            lineHeight: 1,
            margin: "0 0 10px 0",
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #e50914 0%, #111111 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: "var(--font-headline, sans-serif)",
            fontSize: "clamp(1.3rem, 3.5vw, 1.85rem)",
            fontWeight: 800,
            margin: "0 0 12px 0",
            color: "var(--color-primary, #0f172a)",
          }}
        >
          {isHindi ? "क्षमा करें! यह पृष्ठ उपलब्ध नहीं है।" : "Oops! The page you are looking for does not exist."}
        </h2>

        <p
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            color: "var(--color-secondary, #64748b)",
            lineHeight: 1.6,
            margin: "0 auto 30px auto",
            maxWidth: "480px",
          }}
        >
          {isHindi
            ? "हो सकता है कि लिंक पुराना हो चुका हो, हटा दिया गया हो, या आपने गलत URL दर्ज किया हो।"
            : "The page may have been moved, deleted, or the URL might have been typed incorrectly."}
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            maxWidth: "460px",
            margin: "0 auto 32px auto",
            background: "var(--color-card-bg, #ffffff)",
            borderRadius: "10px",
            border: "1.5px solid var(--color-border, #e2e8f0)",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <input
            type="text"
            placeholder={isHindi ? "समाचार या विषय खोजें..." : "Search news, topics, articles..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              outline: "none",
              fontSize: "0.92rem",
              background: "transparent",
              color: "var(--color-primary, #0f172a)",
              fontFamily: "var(--font-ui, sans-serif)",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#e50914",
              color: "#ffffff",
              border: "none",
              padding: "0 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontWeight: 700,
              fontSize: "0.88rem",
              transition: "background 0.2s ease",
            }}
          >
            <Search size={16} />
            <span>{isHindi ? "खोजें" : "Search"}</span>
          </button>
        </form>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 22px",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #cbd5e1)",
              background: "var(--color-card-bg, #ffffff)",
              color: "var(--color-primary, #0f172a)",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={16} />
            <span>{isHindi ? "पीछे जाएं" : "Go Back"}</span>
          </button>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "8px",
              background: "#e50914",
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            <Home size={16} />
            <span>{isHindi ? "मुख्य पृष्ठ पर जाएं" : "Go to Homepage"}</span>
          </Link>
        </div>

        {/* Popular Navigation Shortcuts */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "var(--color-bg-alt, #f8fafc)",
            border: "1px solid var(--color-border, #e2e8f0)",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "0.78rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-secondary, #64748b)",
              marginBottom: "12px",
            }}
          >
            {isHindi ? "लोकप्रिय अनुभाग (Explore Popular Sections)" : "Explore Popular Sections"}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {popularSections.map((sec, idx) => (
              <Link
                key={idx}
                href={sec.slug}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "6px",
                  background: "var(--color-card-bg, #ffffff)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  color: "var(--color-primary, #0f172a)",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ color: "#e50914" }}>{sec.icon}</span>
                <span>{isHindi ? sec.nameHi : sec.nameEn}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
