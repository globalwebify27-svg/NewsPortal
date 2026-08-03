"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Zap, ArrowUpRight } from "lucide-react";

export default function AdminAiPage() {
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRunAi = (action: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      if (action === "headlines") {
        setAiResult(`AI Generated Headlines:\n1. 🔥 Breaking: ${prompt}\n2. Deep Dive: Key Implications of ${prompt}\n3. Global Perspective: What Experts Are Saying About ${prompt}\n4. Analysis: How ${prompt} Impacts Everyday Citizens`);
      } else if (action === "summarize") {
        setAiResult(`Executive Summary for "${prompt}": Recent developments show significant strategic momentum. Key policy shifts and high reader interest suggest prioritizing this topic across digital and broadcast channels.`);
      } else {
        setAiResult(`SEO Meta Data Generated:\nTitle: ${prompt} | Global Awaaz News\nDescription: Comprehensive coverage and real-time updates on ${prompt}. Read full report on Global Awaaz.\nKeywords: ${prompt.toLowerCase().split(" ").join(", ")}, breaking news, global awaaz, india news`);
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              AI Editorial Assistant & Copilot
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Generate viral headlines, executive summaries, and SEO tags powered by AI.
            </p>
          </div>
        </div>
      </div>

      {/* AI Controls */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: "8px" }}>
          Enter Article Topic or Rough Draft Text:
        </label>
        <textarea
          rows={4}
          placeholder="e.g. India launch of 6G satellite network in Jharkhand region..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.92rem", marginBottom: "16px" }}
        />

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleRunAi("headlines")}
            disabled={loading}
            style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "11px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Sparkles size={16} /> Generate Viral Headlines
          </button>
          <button
            onClick={() => handleRunAi("summarize")}
            disabled={loading}
            style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "11px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Zap size={16} /> Summarize Key Takeaways
          </button>
          <button
            onClick={() => handleRunAi("seo")}
            disabled={loading}
            style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "11px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer" }}
          >
            Generate SEO Meta
          </button>
        </div>
      </div>

      {/* AI Output Result Box */}
      {aiResult && (
        <div style={{ background: "#0f172a", color: "#f8fafc", borderRadius: "20px", padding: "28px", boxShadow: "0 10px 30px rgba(15,23,42,0.2)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "12px" }}>
            AI Copilot Output
          </span>
          <pre style={{ fontFamily: "inherit", fontSize: "0.95rem", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
            {aiResult}
          </pre>
        </div>
      )}
    </div>
  );
}
