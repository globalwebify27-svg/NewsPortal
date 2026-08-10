"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Target,
  Globe2,
  ShieldCheck,
  Mail,
  MapPin,
  Phone,
  FileText,
  Save,
  Newspaper
} from "lucide-react";
import { getStoredAboutData, saveAboutData, AboutPageData, defaultAboutData } from "@/lib/aboutData";

export default function AdminAboutPage() {
  const [data, setData] = useState<AboutPageData>(defaultAboutData);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getStoredAboutData();
      setData(res);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAboutData(data);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } catch (err) {
      alert("Error saving About page data!");
    }
  };

  const handleResetToDefault = async () => {
    if (confirm("Are you sure you want to reset all About Us content to defaults?")) {
      setData(defaultAboutData);
      await saveAboutData(defaultAboutData);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    }
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "80px", color: "#0f172a" }}>
      
      {/* ── TOAST NOTIFICATION ────────────────────────────────────────────── */}
      {savedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#16a34a",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(22, 163, 74, 0.4)",
            zIndex: 99999
          }}
        >
          <Check size={18} /> About Us page updated & published live!
        </div>
      )}

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ background: "#e50914", color: "#ffffff", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={22} />
            </div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
              About Us Dedicated Manager
            </h1>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            Customize all content, mission, vision, core pillars, ethics, & contact details for <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", color: "#0f172a" }}>/about</code>
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/about"
            target="_blank"
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              padding: "10px 16px",
              borderRadius: "10px",
              fontSize: "0.88rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
            }}
          >
            <ExternalLink size={15} /> View Live Page
          </Link>
          <button
            onClick={handleSave}
            style={{
              background: "#e50914",
              color: "#ffffff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "10px",
              fontSize: "0.88rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)"
            }}
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* 1. HERO BANNER SECTION */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <Sparkles size={20} style={{ color: "#e50914" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>1. Hero Banner Content (हीरो शीर्षक एवं टैगलाइन)</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Badge Tag (Hindi)</label>
              <input
                type="text"
                value={data.heroTagHi}
                onChange={(e) => setData({ ...data, heroTagHi: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Badge Tag (English)</label>
              <input
                type="text"
                value={data.heroTagEn}
                onChange={(e) => setData({ ...data, heroTagEn: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Main Title / Brand Name</label>
            <input
              type="text"
              value={data.heroTitle}
              onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 800 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Subtitle Description (Hindi)</label>
              <textarea
                rows={3}
                value={data.heroSubHi}
                onChange={(e) => setData({ ...data, heroSubHi: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem", lineHeight: 1.5 }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Subtitle Description (English)</label>
              <textarea
                rows={3}
                value={data.heroSubEn}
                onChange={(e) => setData({ ...data, heroSubEn: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem", lineHeight: 1.5 }}
              />
            </div>
          </div>

          {/* Stats Editor */}
          <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800 }}>Stats Counter Bar (आंकड़े)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              {data.stats.map((st, idx) => (
                <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
                  <input
                    type="text"
                    placeholder="e.g. 10M+"
                    value={st.num}
                    onChange={(e) => {
                      const updated = [...data.stats];
                      updated[idx].num = e.target.value;
                      setData({ ...data, stats: updated });
                    }}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 800, color: "#e50914", marginBottom: "6px" }}
                  />
                  <input
                    type="text"
                    placeholder="Hindi Label"
                    value={st.labelHi}
                    onChange={(e) => {
                      const updated = [...data.stats];
                      updated[idx].labelHi = e.target.value;
                      setData({ ...data, stats: updated });
                    }}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "0.8rem", marginBottom: "4px" }}
                  />
                  <input
                    type="text"
                    placeholder="English Label"
                    value={st.labelEn}
                    onChange={(e) => {
                      const updated = [...data.stats];
                      updated[idx].labelEn = e.target.value;
                      setData({ ...data, stats: updated });
                    }}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. MISSION & VISION SECTION */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <Target size={20} style={{ color: "#e50914" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>2. Our Mission & Vision (हमारा मिशन एवं विज़न)</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
            {/* Mission Box */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 800, color: "#e50914" }}>🎯 Mission Details</h4>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mission Title (Hindi)</label>
                <input
                  type="text"
                  value={data.missionTitleHi}
                  onChange={(e) => setData({ ...data, missionTitleHi: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mission Description (Hindi)</label>
                <textarea
                  rows={4}
                  value={data.missionDescHi}
                  onChange={(e) => setData({ ...data, missionDescHi: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", lineHeight: 1.45 }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mission Description (English)</label>
                <textarea
                  rows={4}
                  value={data.missionDescEn}
                  onChange={(e) => setData({ ...data, missionDescEn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", lineHeight: 1.45 }}
                />
              </div>
            </div>

            {/* Vision Box */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 800, color: "#e50914" }}>🌐 Vision Details</h4>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Vision Title (Hindi)</label>
                <input
                  type="text"
                  value={data.visionTitleHi}
                  onChange={(e) => setData({ ...data, visionTitleHi: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Vision Description (Hindi)</label>
                <textarea
                  rows={4}
                  value={data.visionDescHi}
                  onChange={(e) => setData({ ...data, visionDescHi: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", lineHeight: 1.45 }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Vision Description (English)</label>
                <textarea
                  rows={4}
                  value={data.visionDescEn}
                  onChange={(e) => setData({ ...data, visionDescEn: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", lineHeight: 1.45 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. CORE PILLARS SECTION */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <ShieldCheck size={20} style={{ color: "#e50914" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>3. Core Pillars (मुख्य स्तंभ)</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {data.pillars.map((pillar, idx) => (
              <div key={idx} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "14px" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#e50914", marginBottom: "8px" }}>Pillar #{idx + 1}</div>
                <input
                  type="text"
                  placeholder="Title (Hindi)"
                  value={pillar.titleHi}
                  onChange={(e) => {
                    const updated = [...data.pillars];
                    updated[idx].titleHi = e.target.value;
                    setData({ ...data, pillars: updated });
                  }}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}
                />
                <input
                  type="text"
                  placeholder="Title (English)"
                  value={pillar.titleEn}
                  onChange={(e) => {
                    const updated = [...data.pillars];
                    updated[idx].titleEn = e.target.value;
                    setData({ ...data, pillars: updated });
                  }}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginBottom: "8px" }}
                />
                <textarea
                  rows={3}
                  placeholder="Description (Hindi)"
                  value={pillar.descHi}
                  onChange={(e) => {
                    const updated = [...data.pillars];
                    updated[idx].descHi = e.target.value;
                    setData({ ...data, pillars: updated });
                  }}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", lineHeight: 1.4 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. EDITORIAL ETHICS & NEWSROOM EMAIL */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <Newspaper size={20} style={{ color: "#e50914" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>4. Editorial Ethics & Newsroom Box (संपादकीय प्रतिबद्धता)</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Section Title (Hindi)</label>
              <input
                type="text"
                value={data.ethicsTitleHi}
                onChange={(e) => setData({ ...data, ethicsTitleHi: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Section Title (English)</label>
              <input
                type="text"
                value={data.ethicsTitleEn}
                onChange={(e) => setData({ ...data, ethicsTitleEn: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Newsroom Press Release Email</label>
            <input
              type="email"
              value={data.newsroomEmail}
              onChange={(e) => setData({ ...data, newsroomEmail: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 700 }}
            />
          </div>
        </div>

        {/* 5. CONTACT & HEADQUARTERS ADDRESS */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <MapPin size={20} style={{ color: "#e50914" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>5. Headquarters Address & Contacts (मुख्य कार्यालय एवं फोन हेल्पलाइन)</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Office Address (Hindi)</label>
              <input
                type="text"
                value={data.addressHi}
                onChange={(e) => setData({ ...data, addressHi: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Office Address (English)</label>
              <input
                type="text"
                value={data.addressEn}
                onChange={(e) => setData({ ...data, addressEn: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Contact Email 1</label>
              <input
                type="text"
                value={data.contactEmail1}
                onChange={(e) => setData({ ...data, contactEmail1: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Contact Email 2</label>
              <input
                type="text"
                value={data.contactEmail2}
                onChange={(e) => setData({ ...data, contactEmail2: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Phone Helpline 1</label>
              <input
                type="text"
                value={data.phone1}
                onChange={(e) => setData({ ...data, phone1: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>Phone Helpline 2</label>
              <input
                type="text"
                value={data.phone2}
                onChange={(e) => setData({ ...data, phone2: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
          <button
            type="button"
            onClick={handleResetToDefault}
            style={{ background: "transparent", border: "1px solid #cbd5e1", color: "#64748b", padding: "10px 18px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RotateCcw size={15} /> Reset Defaults
          </button>
          <button
            type="submit"
            style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "0.92rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)" }}
          >
            <Save size={18} /> Save & Publish About Us Page
          </button>
        </div>

      </form>
    </div>
  );
}
