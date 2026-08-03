"use client";

import React from "react";
import { BarChart3, Activity, Eye, Zap, ArrowUpRight } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)", color: "#c026d3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Reader Engagement & Traffic Analytics
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Real-time readership metrics, pageviews, and category breakdown.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Total Pageviews</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>142,890</div>
          <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: 700 }}>+18.4% this week</span>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Unique Readers</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>48,210</div>
          <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: 700 }}>+12.1% this week</span>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Avg Read Time</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>3m 42s</div>
          <span style={{ fontSize: "0.76rem", color: "#2563eb", fontWeight: 700 }}>High engagement</span>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Social Shares</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>8,940</div>
          <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: 700 }}>+24.5% viral traffic</span>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
          Top Category Performance
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { name: "World News", percent: 85, views: "58.4K", color: "#e50914" },
            { name: "India & National", percent: 72, views: "42.1K", color: "#f59e0b" },
            { name: "Technology", percent: 64, views: "31.8K", color: "#8b5cf6" },
            { name: "Sports Bulletins", percent: 48, views: "22.5K", color: "#00875a" }
          ].map((item) => (
            <div key={item.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                <span>{item.name}</span>
                <span>{item.views} views ({item.percent}%)</span>
              </div>
              <div style={{ width: "100%", height: "10px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ width: `${item.percent}%`, height: "100%", background: item.color, borderRadius: "9999px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
