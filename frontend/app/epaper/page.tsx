"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCw,
  LayoutGrid,
  ListFilter,
  FileText,
  Smartphone,
  Sparkles,
  Sun,
  MapPin,
  Clock,
  Printer
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  defaultEditions,
  getStoredEPaperIssues,
  EPaperIssue,
  EPaperEdition,
  defaultEPaperIssue
} from "@/lib/epaperData";

export default function EPaperPage() {
  const { lang } = useLanguage();
  const isHindi = lang === "HI";

  const [allIssues, setAllIssues] = useState<EPaperIssue[]>([defaultEPaperIssue]);
  const [selectedEdition, setSelectedEdition] = useState<EPaperEdition>(defaultEditions[0]);
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-04");
  const [viewMode, setViewMode] = useState<"page" | "list">("page");
  
  // Flipbook / Viewer state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const loadIssues = () => {
      getStoredEPaperIssues().then((issues) => {
        if (Array.isArray(issues)) setAllIssues(issues);
      });
    };
    loadIssues();
    window.addEventListener("ga_epaper_updated", loadIssues);
    return () => {
      window.removeEventListener("ga_epaper_updated", loadIssues);
    };
  }, []);

  // Find active issue based on selected edition & date
  const activeIssue: EPaperIssue =
    allIssues.find((i) => i.editionId === selectedEdition.id && i.date === selectedDate) ||
    allIssues.find((i) => i.editionId === selectedEdition.id) ||
    allIssues[0] ||
    defaultEPaperIssue;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < activeIssue.totalPages) setCurrentPage(currentPage + 1);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 150) setZoomLevel(zoomLevel + 10);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 80) setZoomLevel(zoomLevel - 10);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadPDF = () => {
    alert(
      isHindi
        ? `ग्लोबल आवाज (${selectedEdition.nameHi}) ${activeIssue.displayDateHi} का PDF डाउनलोड हो रहा है...`
        : `Downloading Global Awaaz (${selectedEdition.nameEn}) ${activeIssue.displayDateEn} PDF...`
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ग्लोबल आवाज ई-पेपर - ${selectedEdition.nameHi}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isHindi ? "ई-पेपर लिंक कॉपी कर लिया गया है!" : "E-Paper link copied to clipboard!");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", color: "#0f172a", paddingBottom: "60px" }}>
      
      {/* ── TOP HEADER & TOOLBAR ────────────────────────────────────────── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <div style={{ maxWidth: "1340px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          
          {/* Title & Date Selector */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                {isHindi ? "ई-पेपर" : "E-Paper"}
              </h1>
              <span style={{ background: "#e50914", color: "#ffffff", fontSize: "0.75rem", fontWeight: 800, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase" }}>
                {selectedEdition.cityHi}
              </span>
            </div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.86rem", fontWeight: 500 }}>
              {isHindi ? "आज का ताज़ा अखबार पढ़ें" : "Read Today's Fresh Digital Newspaper"}
            </p>
          </div>

          {/* Controls: Date Picker Dropdown & View Mode Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            
            {/* Date Selector Box */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "6px 14px" }}>
              <CalendarIcon size={16} style={{ color: "#e50914" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b" }}>
                {isHindi ? "आज का अंक:" : "Issue Date:"}
              </span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ background: "transparent", border: "none", fontWeight: 800, fontSize: "0.88rem", color: "#0f172a", cursor: "pointer", outline: "none" }}
              >
                {Array.from(new Set([...allIssues.map((i) => i.date), "2026-08-04", "2026-07-04"])).map((d) => (
                  <option key={d} value={d}>
                    {d === "2026-08-04" ? "4 अगस्त 2026" : d === "2026-07-04" ? "4 जुलाई 2026 (4-07-2026)" : d}
                  </option>
                ))}
              </select>
            </div>

            {/* View Switcher Buttons */}
            <div style={{ display: "flex", background: "#e2e8f0", padding: "3px", borderRadius: "10px" }}>
              <button
                onClick={() => setViewMode("page")}
                style={{
                  background: viewMode === "page" ? "#e50914" : "transparent",
                  color: viewMode === "page" ? "#ffffff" : "#475569",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: viewMode === "page" ? "0 2px 8px rgba(229, 9, 20, 0.4)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <LayoutGrid size={15} />
                <span>{isHindi ? "पेज व्यू" : "Page View"}</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                style={{
                  background: viewMode === "list" ? "#e50914" : "transparent",
                  color: viewMode === "list" ? "#ffffff" : "#475569",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: viewMode === "list" ? "0 2px 8px rgba(229, 9, 20, 0.4)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <ListFilter size={15} />
                <span>{isHindi ? "लिस्ट व्यू" : "List View"}</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT WORKSPACE ────────────────────────────────────────── */}
      <div style={{ maxWidth: "1340px", margin: "24px auto 0 auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isFullscreen ? "1fr" : "280px 1fr", gap: "24px", alignItems: "flex-start" }}>
          
          {/* ── LEFT SIDEBAR (EDITIONS & ARCHIVE) ───────────────────────────── */}
          {!isFullscreen && (
            <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Edition Selector Card */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <FileText size={18} style={{ color: "#e50914" }} />
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                    {isHindi ? "अखबार चुनें" : "Select Edition"}
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {defaultEditions.map((ed) => {
                    const isSelected = selectedEdition.id === ed.id;
                    return (
                      <button
                        key={ed.id}
                        onClick={() => setSelectedEdition(ed)}
                        style={{
                          background: isSelected ? "#e50914" : "#f8fafc",
                          color: isSelected ? "#ffffff" : "#0f172a",
                          border: isSelected ? "none" : "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: isSelected ? "0 4px 14px rgba(229, 9, 20, 0.35)" : "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>
                            {isHindi ? ed.nameHi : ed.nameEn}
                          </div>
                          <span style={{ fontSize: "0.75rem", opacity: isSelected ? 0.9 : 0.6, fontWeight: 500 }}>
                            {isHindi ? `${ed.cityHi}, ${ed.stateHi}` : `${ed.cityEn}, ${ed.stateEn}`}
                          </span>
                        </div>
                        <span style={{ background: isSelected ? "rgba(255,255,255,0.25)" : "#fee2e2", color: isSelected ? "#ffffff" : "#dc2626", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px" }}>
                          {isHindi ? "आज" : "Today"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Archive Month Calendar Picker */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <CalendarIcon size={18} style={{ color: "#e50914" }} />
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                    {isHindi ? "पुराने अंक" : "Archive Edition Calendar"}
                  </h3>
                </div>

                <div style={{ textAlign: "center", marginBottom: "12px", fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                  अगस्त 2026 (August 2026)
                </div>

                {/* Calendar Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>
                  <span>रवि</span><span>सोम</span><span>मंगल</span><span>बुध</span><span>गुरु</span><span>शुक्र</span><span>शनि</span>
                  
                  {[27, 28, 29, 30, 31].map((d) => (
                    <span key={d} style={{ opacity: 0.3, padding: "6px 0" }}>{d}</span>
                  ))}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => {
                    const isSelected = day === 4;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(`2026-08-0${day > 9 ? day : `0${day}`}`)}
                        style={{
                          background: isSelected ? "#e50914" : "transparent",
                          color: isSelected ? "#ffffff" : "#0f172a",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 0",
                          fontWeight: isSelected ? 900 : 600,
                          cursor: "pointer"
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

            </aside>
          )}

          {/* ── CENTER MAIN READER CANVAS (MATCHING SCREENSHOT) ───────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Viewer Control Toolbar */}
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: "14px",
                padding: "10px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              {/* Left Controls: Page Navigation */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "none", borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>
                  {currentPage} / {activeIssue.totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === activeIssue.totalPages}
                  style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "none", borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === activeIssue.totalPages ? "not-allowed" : "pointer", opacity: currentPage === activeIssue.totalPages ? 0.4 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Center Controls: Zoom Level */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: "8px" }}>
                <button onClick={handleZoomOut} style={{ background: "transparent", color: "#ffffff", border: "none", fontWeight: 900, cursor: "pointer", fontSize: "1rem" }}>-</button>
                <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{zoomLevel}%</span>
                <button onClick={handleZoomIn} style={{ background: "transparent", color: "#ffffff", border: "none", fontWeight: 900, cursor: "pointer", fontSize: "1rem" }}>+</button>
              </div>

              {/* Right Controls: Rotate, Download, Fullscreen */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={handleDownloadPDF} style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "none", borderRadius: "6px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Download PDF">
                  <Download size={15} />
                </button>
                <button onClick={toggleFullscreen} style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "none", borderRadius: "6px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Toggle Fullscreen">
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            {/* NEWSPAPER PAGE CANVAS WORKSPACE */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "16px",
                padding: "30px 24px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                position: "relative",
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease"
              }}
            >
              {/* Side Floating Page Navigation Arrows */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                style={{
                  position: "absolute",
                  left: "-20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.3 : 1,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                  zIndex: 10
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNextPage}
                disabled={currentPage === activeIssue.totalPages}
                style={{
                  position: "absolute",
                  right: "-20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: currentPage === activeIssue.totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === activeIssue.totalPages ? 0.3 : 1,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                  zIndex: 10
                }}
              >
                <ChevronRight size={20} />
              </button>

              {/* TRADITIONAL NEWSPAPER FRONT PAGE MASTHEAD */}
              <div style={{ borderBottom: "3px double #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
                
                {/* Top Info Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={13} style={{ color: "#e50914" }} />
                    <span>{selectedEdition.cityHi}, {selectedEdition.stateHi}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span>वर्ष: {activeIssue.volumeNumber}</span>
                    <span>अंक: {activeIssue.issueNumber}</span>
                    <span>कुल पृष्ठ: {activeIssue.totalPages}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "4px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <Sun size={14} style={{ color: "#f59e0b" }} />
                    <span>{activeIssue.weatherInfo?.temp || "32°C"} {activeIssue.weatherInfo?.conditionHi}</span>
                  </div>
                </div>

                {/* Newspaper Title Banner */}
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <h1 style={{ fontFamily: "serif", fontSize: "clamp(2.5rem, 6vw, 4.2rem)", fontWeight: 900, margin: 0, color: "#0f172a", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    GLOBAL <span style={{ color: "#e50914" }}>AWAAZ</span>
                  </h1>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: 800, marginTop: "6px" }}>
                    <span style={{ width: "24px", height: "3px", background: "#e50914", borderRadius: "2px" }} />
                    <span>LOCAL <span style={{ color: "#e50914" }}>से</span> GLOBAL <span style={{ color: "#e50914" }}>तक</span></span>
                    <span style={{ width: "24px", height: "3px", background: "#e50914", borderRadius: "2px" }} />
                  </div>
                </div>

                {/* Date & Website Strip */}
                <div style={{ background: "#e50914", color: "#ffffff", padding: "6px 16px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", fontWeight: 800, marginTop: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <span>www.globalawaaz.com</span>
                  <span>{activeIssue.displayDateHi} | {selectedEdition.nameHi}</span>
                  <span>मूल्य: ₹5.00</span>
                </div>
              </div>

              {/* NEWSPAPER FRONT PAGE ARTICLES GRID */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* 1. TOP LEAD & SECONDARY GRID */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
                  
                  {/* Lead Story */}
                  {activeIssue.leadStory && (
                    <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "18px" }}>
                      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "0 0 6px 0", color: "#0f172a", lineHeight: 1.2 }}>
                        {activeIssue.leadStory.title}
                      </h2>
                      <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#475569", margin: "0 0 12px 0" }}>
                        {activeIssue.leadStory.subtitle}
                      </h4>
                      <img
                        src={activeIssue.leadStory.image}
                        alt={activeIssue.leadStory.title}
                        style={{ width: "100%", height: "230px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }}
                      />
                      <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "#334155", margin: "0 0 10px 0" }}>
                        {activeIssue.leadStory.summary}
                      </p>
                      <span style={{ color: "#e50914", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>
                        {activeIssue.leadStory.pageRef} →
                      </span>
                    </div>
                  )}

                  {/* Secondary Story */}
                  {activeIssue.secondaryStory && (
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 10px 0", color: "#0f172a", lineHeight: 1.25 }}>
                        {activeIssue.secondaryStory.title}
                      </h3>
                      <img
                        src={activeIssue.secondaryStory.image}
                        alt={activeIssue.secondaryStory.title}
                        style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
                      />
                      <p style={{ fontSize: "0.84rem", lineHeight: 1.55, color: "#475569", margin: "0 0 10px 0" }}>
                        {activeIssue.secondaryStory.summary}
                      </p>
                      <span style={{ color: "#e50914", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>
                        {activeIssue.secondaryStory.pageRef} →
                      </span>
                    </div>
                  )}

                </div>

                <div style={{ height: "1px", background: "#cbd5e1" }} />

                {/* 2. BOTTOM 3-COLUMN CATEGORIES GRID */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
                  {(activeIssue.bottomStories || []).map((story, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                      <span style={{ color: "#e50914", fontWeight: 800, fontSize: "0.78rem", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                        📌 {isHindi ? story.categoryHi : story.categoryEn}
                      </span>
                      <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: "0 0 8px 0", color: "#0f172a", lineHeight: 1.3 }}>
                        {story.title}
                      </h4>
                      <img
                        src={story.image}
                        alt={story.title}
                        style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }}
                      />
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 8px 0", lineHeight: 1.4 }}>
                        {story.summary}
                      </p>
                      <span style={{ color: "#e50914", fontWeight: 800, fontSize: "0.76rem" }}>
                        {story.pageRef}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── BOTTOM FEATURES FOOTER ────────────────────────────────────────── */}
      <div style={{ maxWidth: "1340px", margin: "30px auto 0 auto", padding: "0 16px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(229,9,20,0.1)", color: "#e50914", padding: "10px", borderRadius: "10px" }}>
              <CalendarIcon size={22} />
            </div>
            <div>
              <h5 style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: 800 }}>{isHindi ? "प्रतिदिन अपडेट" : "Daily Updates"}</h5>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{isHindi ? "हर दिन का ताज़ा अखबार" : "Fresh morning edition every day"}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(229,9,20,0.1)", color: "#e50914", padding: "10px", borderRadius: "10px" }}>
              <Smartphone size={22} />
            </div>
            <div>
              <h5 style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: 800 }}>{isHindi ? "सभी डिवाइस पर उपलब्ध" : "Multi-Device"}</h5>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{isHindi ? "मोबाइल, टैबलेट और डेस्कटॉप" : "Read on Mobile, Tablet & Desktop"}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={handleDownloadPDF}>
            <div style={{ background: "rgba(229,9,20,0.1)", color: "#e50914", padding: "10px", borderRadius: "10px" }}>
              <Download size={22} />
            </div>
            <div>
              <h5 style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: 800 }}>{isHindi ? "PDF डाउनलोड करें" : "Download PDF"}</h5>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{isHindi ? "अपने डिवाइस में सेव करें" : "Save full newspaper offline"}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={handleShare}>
            <div style={{ background: "rgba(229,9,20,0.1)", color: "#e50914", padding: "10px", borderRadius: "10px" }}>
              <Share2 size={22} />
            </div>
            <div>
              <h5 style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: 800 }}>{isHindi ? "शेयर करें" : "Share Edition"}</h5>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{isHindi ? "सोशल मीडिया पर शेयर करें" : "Share with friends & family"}</span>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
