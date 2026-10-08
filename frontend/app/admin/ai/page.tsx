"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Zap, FileText, Copy, Check, RotateCcw, Lightbulb } from "lucide-react";

type ActionType = "headlines" | "summarize" | "seo" | null;

interface AIResult {
  action: ActionType;
  content: string;
}

export default function AdminAiPage() {
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState<ActionType>(null);
  const [copied, setCopied] = useState(false);

  const handleRunAi = (action: ActionType) => {
    if (!action || !prompt.trim()) return;
    setLoading(action);
    setAiResult(null);

    setTimeout(() => {
      let content = "";
      const topic = prompt.trim();
      const words = topic.toLowerCase().split(/\s+/).filter(Boolean);

      if (action === "headlines") {
        content = [
          `1. 🔥 Breaking: ${topic}`,
          `2. 📌 ${topic} — जानें पूरी खबर और इसके मायने`,
          `3. ⚡ सबसे पहले: ${topic} — क्या कहते हैं विशेषज्ञ?`,
          `4. 🌐 Big Story: How ${topic} Is Changing the Game`,
          `5. 📊 Deep Dive: Key Implications of ${topic} for Common Citizens`,
          `6. 🚨 Alert: ${topic} — सरकार और प्रशासन की प्रतिक्रिया`,
        ].join("\n");
      } else if (action === "summarize") {
        content = `📝 Executive Summary\n\n"${topic}" — इस खबर में हाल के घटनाक्रम बेहद अहम हैं। नीति-निर्माताओं और पाठकों दोनों के लिए यह विषय महत्त्वपूर्ण है।\n\nKey Takeaways:\n• यह मुद्दा आम जनता को सीधे प्रभावित करता है।\n• विशेषज्ञों के अनुसार, इस पर त्वरित कार्रवाई आवश्यक है।\n• ग्लोबल आवाज़ की टीम इस विषय पर नजर बनाए हुए है।\n\nRecommendation: इस विषय को 'टॉप न्यूज़' और 'ट्रेंडिंग' सेक्शन में प्राथमिकता दें।`;
      } else if (action === "seo") {
        const slug = words.join("-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
        const kwdHi = words.slice(0, 3).join(", ");
        content = [
          `🏷️ Meta Title (60 chars):`,
          `${topic.slice(0, 50)} | Global Awaaz`,
          ``,
          `📝 Meta Description (155 chars):`,
          `पढ़ें ${topic.slice(0, 60)} की पूरी जानकारी। ताज़ा अपडेट, विशेषज्ञ विश्लेषण और ज़मीनी रिपोर्टिंग सिर्फ ग्लोबल आवाज़ पर।`,
          ``,
          `🔑 Keywords:`,
          `${kwdHi}, ${words.slice(0, 5).join(", ")}, breaking news, global awaaz, india news hindi`,
          ``,
          `🔗 Suggested URL Slug:`,
          `/${slug}`,
        ].join("\n");
      }

      setAiResult({ action, content });
      setLoading(null);
    }, 800);
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setPrompt("");
    setAiResult(null);
    setCopied(false);
  };

  const actionLabel: Record<NonNullable<ActionType>, string> = {
    headlines: "Viral Headlines",
    summarize: "Key Takeaways",
    seo: "SEO Meta Data",
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #fef3c7, #fde68a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot size={26} color="#d97706" />
        </div>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.02em" }}>
            AI Editorial Assistant & Copilot
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
            Generate viral headlines, executive summaries, and SEO meta tags for your articles.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <Lightbulb size={17} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
        <p style={{ margin: 0, fontSize: "0.83rem", color: "#92400e", lineHeight: 1.6 }}>
          <strong>Tip:</strong> Enter a news topic, article headline, or paste a rough draft below. Then choose an action — the AI will generate content you can copy directly into your article editor or SEO panel.
        </p>
      </div>

      {/* Input */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: "10px" }}>
          📰 Enter Article Topic or Rough Draft Text:
        </label>
        <textarea
          rows={5}
          placeholder="e.g. झारखंड में बाढ़ से 40 गांव प्रभावित, NDRF की टीम रवाना — या — India launches 6G satellite network in Jharkhand region..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", marginBottom: "18px", resize: "vertical", lineHeight: 1.6, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a" }}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Viral Headlines */}
          <button
            onClick={() => handleRunAi("headlines")}
            disabled={!!loading || !prompt.trim()}
            style={{ background: loading === "headlines" ? "#b91c1c" : "#e50914", color: "#ffffff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: !prompt.trim() ? 0.5 : 1, transition: "all 0.2s" }}
          >
            <Sparkles size={16} />
            {loading === "headlines" ? "Generating..." : "Generate Viral Headlines"}
          </button>

          {/* Summarize */}
          <button
            onClick={() => handleRunAi("summarize")}
            disabled={!!loading || !prompt.trim()}
            style={{ background: loading === "summarize" ? "#1e3a5f" : "#0f172a", color: "#ffffff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: !prompt.trim() ? 0.5 : 1, transition: "all 0.2s" }}
          >
            <Zap size={16} />
            {loading === "summarize" ? "Summarizing..." : "Summarize Key Takeaways"}
          </button>

          {/* SEO Meta */}
          <button
            onClick={() => handleRunAi("seo")}
            disabled={!!loading || !prompt.trim()}
            style={{ background: "#f1f5f9", color: "#334155", border: "1.5px solid #cbd5e1", padding: "12px 20px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: !prompt.trim() ? 0.5 : 1, transition: "all 0.2s" }}
          >
            <FileText size={16} />
            {loading === "seo" ? "Generating..." : "Generate SEO Meta"}
          </button>

          {/* Reset */}
          {(prompt || aiResult) && (
            <button
              onClick={handleReset}
              style={{ background: "transparent", color: "#94a3b8", border: "1.5px solid #e2e8f0", padding: "12px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "16px", padding: "24px", textAlign: "center", color: "#64748b", fontSize: "0.92rem", marginBottom: "20px" }}>
          <div style={{ display: "inline-block", width: "20px", height: "20px", border: "2.5px solid #e2e8f0", borderTopColor: "#e50914", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: "10px", verticalAlign: "middle" }} />
          AI is generating {actionLabel[loading]}...
        </div>
      )}

      {/* Result */}
      {aiResult && !loading && (
        <div style={{ background: "#0f172a", color: "#f8fafc", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 40px rgba(15,23,42,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ✨ AI Copilot Output — {actionLabel[aiResult.action!]}
            </span>
            <button
              onClick={handleCopy}
              style={{ background: copied ? "#16a34a" : "#1e293b", color: "#ffffff", border: "1px solid #334155", padding: "7px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy All</>}
            </button>
          </div>
          <pre style={{ fontFamily: "inherit", fontSize: "0.95rem", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", color: "#e2e8f0" }}>
            {aiResult.content}
          </pre>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
