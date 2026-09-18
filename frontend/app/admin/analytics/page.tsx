"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Eye, FileText, Users, FolderTree, TrendingUp, Sparkles, ExternalLink } from "lucide-react";

interface CategoryStat {
  id: string;
  name: string;
  nameHi?: string | null;
  color: string;
  articlesCount: number;
  views: number;
  percent: number;
}

interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  publishedAt?: string;
  category?: { name: string; color: string };
}

interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  publishedArticles: number;
  totalShares: number;
  totalUsers: number;
  totalComments: number;
  avgReadTime: string;
  categories: CategoryStat[];
  topArticles: TopArticle[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/v1/admin/analytics", { cache: "no-store" });
        const json = await res.json();
        if (json && json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const totalViews = data?.totalViews || 0;
  const publishedArticles = data?.publishedArticles || 0;
  const totalUsers = data?.totalUsers || 0;
  const categories = data?.categories || [];
  const topArticles = data?.topArticles || [];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)",
              color: "#c026d3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Reader Engagement & Traffic Analytics
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Real-time database metrics, readership impressions, and category breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row — Live Database Values */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Total Pageviews</span>
            <Eye size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "6px" }}>
            {totalViews.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: 700 }}>
            Real Live Impressions
          </span>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Published News</span>
            <FileText size={18} color="#e50914" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "6px" }}>
            {publishedArticles.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: 700 }}>Active in Feed</span>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Active Categories</span>
            <FolderTree size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "6px" }}>
            {categories.length} Desks
          </div>
          <span style={{ fontSize: "0.76rem", color: "#2563eb", fontWeight: 700 }}>Coverage Desks</span>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Editorial Team</span>
            <Users size={18} color="#059669" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "6px" }}>
            {totalUsers} Members
          </div>
          <span style={{ fontSize: "0.76rem", color: "#059669", fontWeight: 700 }}>Active Accounts</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Category Breakdown */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Live Category Distribution
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              {publishedArticles} Total Stories
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {categories.slice(0, 8).map((item) => (
              <div key={item.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: item.color || "#e50914",
                        display: "inline-block",
                      }}
                    />
                    <span>{item.name} {item.nameHi ? `(${item.nameHi})` : ""}</span>
                  </div>
                  <span style={{ color: "#64748b" }}>
                    {item.articlesCount} stories ({item.percent}%)
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#f1f5f9",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(item.percent, 3)}%`,
                      height: "100%",
                      background: item.color || "#e50914",
                      borderRadius: "9999px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Read Stories */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Top Read Stories
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              Ranked by Views
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topArticles.map((art, idx) => (
              <div
                key={art.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "10px 12px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: idx === 0 ? "#e50914" : "#0f172a",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {art.title}
                    </p>
                    {art.category?.name && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: art.category.color || "#e50914",
                          fontWeight: 700,
                        }}
                      >
                        {art.category.name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#2563eb" }}>
                    {art.views || 0}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
