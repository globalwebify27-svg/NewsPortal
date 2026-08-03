"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  ImageIcon,
  BarChart3,
  Bot,
  Plus,
  Video,
  Eye,
  Activity,
  ArrowUpRight,
  Sparkles,
  Search,
  Edit,
  Trash2
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { getStoredVideos } from "@/lib/youtube";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  category?: { name: string; slug?: string; color?: string };
  author?: { name: string };
  status: string;
  views?: number;
  publishedAt?: string;
  isHero?: boolean;
  state?: string;
}

const LOCAL_STORAGE_KEY = "ga_custom_articles";

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      let combined: AdminArticle[] = [];
      try {
        const res = await fetch(API_ENDPOINTS.articles);
        const json = await res.json();
        if (json && json.data && Array.isArray(json.data)) {
          combined = json.data;
        }
      } catch (e) {}

      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const custom: AdminArticle[] = stored ? JSON.parse(stored) : [];
        const customIds = new Set(custom.map((c) => c.id));
        const backendFiltered = combined.filter((b) => !customIds.has(b.id));
        combined = [...custom, ...backendFiltered];
      } catch (e) {}

      setArticles(combined);
      setLoading(false);

      const vids = getStoredVideos();
      setVideoCount(vids.length);
    }

    loadDashboardData();
  }, []);

  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 120), 0);

  return (
    <div>
      {/* Top Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "20px", padding: "28px", color: "#ffffff", boxShadow: "0 10px 30px rgba(15,23,42,0.15)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <span style={{ background: "rgba(229,9,20,0.2)", color: "#f87171", border: "1px solid rgba(229,9,20,0.4)", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            LIVE SYSTEM DASHBOARD
          </span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "10px 0 4px 0", letterSpacing: "-0.02em" }}>
            Welcome back, Editorial Chief
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8" }}>
            Monitor real-time readership, manage content queues, and adjust global site branding.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/admin/articles"
            style={{ background: "#e50914", color: "#ffffff", padding: "11px 20px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}
          >
            <Plus size={16} /> Compose Article
          </Link>
          <Link
            href="/admin/settings"
            style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", padding: "11px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}
          >
            Logo & Settings
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <Link href="/admin/articles" style={{ textDecoration: "none" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Total Articles</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fee2e2", color: "#e50914", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} />
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>{articles.length}</div>
            <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>Published & Active</span>
          </div>
        </Link>

        <Link href="/admin/analytics" style={{ textDecoration: "none" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Total Portal Views</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Eye size={18} />
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>{totalViews.toLocaleString()}</div>
            <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>Across English & Hindi</span>
          </div>
        </Link>

        <Link href="/admin/categories" style={{ textDecoration: "none" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Categories & Desks</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FolderTree size={18} />
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>10 Desks</div>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>+ 28 Indian States</span>
          </div>
        </Link>

        <Link href="/admin/videos" style={{ textDecoration: "none" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>YouTube Bulletins</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fae8ff", color: "#c026d3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Video size={18} />
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>{videoCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#c026d3", fontWeight: 700 }}>Video Reports Active</span>
          </div>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Recent Articles Queue
            </h3>
            <Link href="/admin/articles" style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e50914", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {articles.slice(0, 5).map((art) => (
              <div key={art.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e50914", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {art.title}
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", flexShrink: 0 }}>
                  {art.category?.name || "General"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI & Quick Settings Banner */}
        <div style={{ background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)", border: "1px solid #fecdd3", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e50914", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                AI Content & Branding Suite
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              Use AI copilot for headline generation or fine-tune site logos and header margins live across your news portal.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/admin/ai"
              style={{ flex: 1, background: "#0f172a", color: "#ffffff", padding: "10px", borderRadius: "8px", textAlign: "center", fontWeight: 700, fontSize: "0.84rem", textDecoration: "none" }}
            >
              Open AI Copilot
            </Link>
            <Link
              href="/admin/settings"
              style={{ flex: 1, background: "#e50914", color: "#ffffff", padding: "10px", borderRadius: "8px", textAlign: "center", fontWeight: 700, fontSize: "0.84rem", textDecoration: "none" }}
            >
              Site Branding Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
