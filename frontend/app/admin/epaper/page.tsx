"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Newspaper,
  Sparkles,
  Upload,
  Calendar,
  Check,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Save,
  Clock,
  MapPin
} from "lucide-react";
import {
  defaultEditions,
  getStoredEPaperIssues,
  saveEPaperIssue,
  compileEPaperFromArticles,
  EPaperIssue,
  EPaperEdition,
  defaultEPaperIssue
} from "@/lib/epaperData";
import { allDefaultArticles } from "@/lib/defaultArticles";

export default function AdminEPaperPage() {
  const [issues, setIssues] = useState<EPaperIssue[]>([defaultEPaperIssue]);
  const [selectedEdition, setSelectedEdition] = useState<string>("patna");
  const [issueDate, setIssueDate] = useState<string>("2026-08-04");
  
  // Custom manual fields
  const [leadTitle, setLeadTitle] = useState("बिहार में निवेश के नए अवसर");
  const [leadSub, setLeadSub] = useState("सरकार की नई नीति से उद्योगों को मिलेगा बढ़ावा");
  const [leadSummary, setLeadSummary] = useState("पटना: बिहार सरकार ने राज्य में निवेश को बढ़ावा देने के लिए नई औद्योगिक नीति 2026 की घोषणा की है।");
  const [leadImage, setLeadImage] = useState("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80");
  
  const [pdfUploadUrl, setPdfUploadUrl] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setIssues(getStoredEPaperIssues());
  }, []);

  const handleAutoCompile = () => {
    try {
      const compiled = compileEPaperFromArticles(allDefaultArticles, issueDate, selectedEdition);
      saveEPaperIssue(compiled);
      setIssues(getStoredEPaperIssues());
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } catch (e) {
      alert("Error auto-generating e-Paper!");
    }
  };

  const handleSaveManualIssue = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const edObj = defaultEditions.find((e) => e.id === selectedEdition) || defaultEditions[0];
      const newIssue: EPaperIssue = {
        ...defaultEPaperIssue,
        id: `issue-${issueDate}-${selectedEdition}`,
        editionId: selectedEdition,
        date: issueDate,
        displayDateHi: "4 अगस्त 2026",
        displayDateEn: "4 August 2026",
        pdfUrl: pdfUploadUrl || undefined,
        leadStory: {
          title: leadTitle,
          subtitle: leadSub,
          summary: leadSummary,
          image: leadImage,
          pageRef: "पृष्ठ 3 पर"
        },
        weatherInfo: {
          temp: "32°C",
          conditionHi: `${edObj.cityHi}, ${edObj.stateHi}`,
          conditionEn: `${edObj.cityEn}, ${edObj.stateEn}`,
          city: edObj.cityEn
        }
      };
      saveEPaperIssue(newIssue);
      setIssues(getStoredEPaperIssues());
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } catch (err) {
      alert("Failed to save e-Paper issue!");
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
          <Check size={18} /> e-Paper edition compiled & published live!
        </div>
      )}

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ background: "#e50914", color: "#ffffff", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Newspaper size={22} />
            </div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
              e-Paper Auto-Converter & Edition Manager
            </h1>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            Auto-compile published news into digital e-Papers date-wise by edition or upload daily print PDFs
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/epaper"
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
            <ExternalLink size={15} /> View Live e-Paper
          </Link>
          <button
            onClick={handleAutoCompile}
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
            <Sparkles size={16} /> 1-Click Auto-Generate Today's e-Paper
          </button>
        </div>
      </div>

      {/* ── 1-CLICK AUTO CONVERTER CARD ──────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", borderRadius: "16px", padding: "24px", marginBottom: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ background: "#e50914", color: "#ffffff", fontSize: "0.75rem", fontWeight: 800, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase" }}>
              Instant Auto-Compiler
            </span>
            <h3 style={{ margin: "8px 0 6px 0", fontSize: "1.3rem", fontWeight: 900 }}>
              Convert Today's Articles into e-Paper Layout
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem" }}>
              Automatically formats all articles published by editors today into traditional newspaper pages date-wise.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", outline: "none" }}
            >
              {defaultEditions.map((ed) => (
                <option key={ed.id} value={ed.id} style={{ background: "#0f172a" }}>
                  {ed.nameHi} ({ed.cityHi})
                </option>
              ))}
            </select>

            <button
              onClick={handleAutoCompile}
              style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229, 9, 20, 0.4)" }}
            >
              <Sparkles size={16} /> Compile e-Paper Now
            </button>
          </div>
        </div>
      </div>

      {/* ── MANUAL ISSUE EDIT & UPLOAD FORM ──────────────────────────────── */}
      <form onSubmit={handleSaveManualIssue} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <FileText size={20} style={{ color: "#e50914" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
              Edit Frontpage Headline & Upload PDF (मैन्युअल ई-पेपर संपादन)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Edition City</label>
              <select
                value={selectedEdition}
                onChange={(e) => setSelectedEdition(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 700 }}
              >
                {defaultEditions.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.nameHi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                style={{ width: "100%", padding: "9px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>PDF Document URL (Optional Upload)</label>
              <input
                type="text"
                placeholder="https://.../globalawaaz_patna.pdf"
                value={pdfUploadUrl}
                onChange={(e) => setPdfUploadUrl(e.target.value)}
                style={{ width: "100%", padding: "9px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Front Page Lead Headline (मुख्य समाचार शीर्षक)</label>
            <input
              type="text"
              value={leadTitle}
              onChange={(e) => setLeadTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.95rem", fontWeight: 800 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Lead Sub-heading</label>
              <input
                type="text"
                value={leadSub}
                onChange={(e) => setLeadSub(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Lead Image URL</label>
              <input
                type="text"
                value={leadImage}
                onChange={(e) => setLeadImage(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Front Page Summary Text</label>
            <textarea
              rows={3}
              value={leadSummary}
              onChange={(e) => setLeadSummary(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem", lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)" }}
            >
              <Save size={18} /> Save & Publish e-Paper Edition
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
