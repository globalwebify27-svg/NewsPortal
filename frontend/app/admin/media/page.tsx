"use client";

import React, { useState } from "react";
import { ImageIcon, Upload, Link2, Check, Copy } from "lucide-react";

export default function AdminMediaPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const mediaList = [
    { id: "m1", name: "Global Breaking Banner", url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60", size: "1.2 MB", date: "Aug 3, 2026" },
    { id: "m2", name: "Parliament News Still", url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=60", size: "850 KB", date: "Aug 2, 2026" },
    { id: "m3", name: "Market Stocks Graphic", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60", size: "620 KB", date: "Aug 1, 2026" },
    { id: "m4", name: "Tech Innovation Event", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60", size: "1.4 MB", date: "Jul 31, 2026" },
    { id: "m5", name: "Sports Stadium Hero", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60", size: "910 KB", date: "Jul 30, 2026" },
    { id: "m6", name: "Weather Satellite Map", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60", size: "1.1 MB", date: "Jul 29, 2026" }
  ];

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Media Assets & CDN Gallery
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Manage article cover images, vector graphics, and Cloudinary CDN uploads.
            </p>
          </div>
        </div>

        <label style={{ background: "#e50914", color: "#ffffff", padding: "11px 22px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}>
          <Upload size={16} /> Upload New Asset
          <input type="file" accept="image/*" style={{ display: "none" }} />
        </label>
      </div>

      {/* Media Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
        {mediaList.map((item) => (
          <div key={item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            <div style={{ height: "180px", background: "#f1f5f9", overflow: "hidden" }}>
              <img src={item.url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "16px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>{item.name}</h4>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "#94a3b8", marginBottom: "14px" }}>
                <span>{item.size}</span>
                <span>{item.date}</span>
              </div>
              <button
                onClick={() => handleCopy(item.url)}
                style={{ width: "100%", background: copiedUrl === item.url ? "#ecfdf5" : "#f8fafc", color: copiedUrl === item.url ? "#047857" : "#334155", border: "1px solid #cbd5e1", padding: "8px", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {copiedUrl === item.url ? <Check size={14} /> : <Copy size={14} />}
                {copiedUrl === item.url ? "CDN URL Copied!" : "Copy Image CDN Link"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
