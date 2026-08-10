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
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  MessageSquare
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { fetchCentralVideos } from "@/lib/youtube";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  category?: { name: string; slug?: string; color?: string };
  author?: { name: string };
  authorId?: string;
  status: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  views?: number;
  publishedAt?: string;
  isHero?: boolean;
  state?: string;
  featuredImage?: string;
  submittedBy?: string;
  reviewComment?: string;
  reviewedBy?: string;
}

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [adminRole, setAdminRole] = useState<string>("super_admin");
  const [adminUserName, setAdminUserName] = useState<string>("Chief Editor");
  const [loading, setLoading] = useState(true);
  const [videoCount, setVideoCount] = useState(0);

  // Chief Editor Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingArticle, setRejectingArticle] = useState<AdminArticle | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  useEffect(() => {
    async function initRole() {
      try {
        let rawRole = sessionStorage.getItem("ga_admin_role") || "";
        const userName = sessionStorage.getItem("ga_admin_user") || "Global Admin";

        if (userName && userName !== "Global Awaaz Admin" && userName !== "Chief Editor" && userName !== "Staff Editor") {
          try {
            const res = await fetch("/api/v1/staff");
            const json = await res.json();
            const storedUsers = (json && json.success && Array.isArray(json.data)) ? json.data : [];
            const found = storedUsers.find((u: any) => u.name === userName || u.email === userName);
            if (found && found.roleSlug) {
              rawRole = found.roleSlug;
            }
          } catch (e) {}
        }

        const role = (rawRole || "super_admin").toLowerCase();
        setAdminRole(role);
        setAdminUserName(userName);
      } catch (e) {}
    }
    initRole();
  }, []);

  const persistArticlesToDatabase = async (updated: AdminArticle[]) => {
    try {
      await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: updated })
      });
    } catch (e) {}
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch("/api/v1/articles?admin=true");
        const json = await res.json();
        if (json && (json.data || json.articles)) {
          const list = json.data || json.articles;
          if (Array.isArray(list)) {
            setArticles(list);
          }
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }

    fetchCentralVideos().then(({ videos }) => {
      if (Array.isArray(videos)) setVideoCount(videos.length);
    });

    loadDashboardData();
  }, []);

  // Chief Editor Actions directly from Dashboard
  const handleApproveArticle = async (art: AdminArticle) => {
    const nowIso = new Date().toISOString();
    const reviewer = `${adminUserName} (${adminRole === "chief_editor" ? "Chief Editor" : "Super Admin"})`;

    const updatedArt = {
      ...art,
      status: "PUBLISHED",
      approvedBy: reviewer,
      approvedAt: nowIso,
      rejectedBy: undefined,
      rejectedAt: undefined,
      reviewComment: undefined,
      rejectionReason: undefined,
      publishedAt: art.publishedAt || nowIso
    };

    setArticles((prev) => prev.map((a) => (a.id === art.id ? updatedArt : a)));
    showToast(`✅ Article "${art.title}" approved & published live!`);

    try {
      await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedArt,
          userRole: adminRole,
          userName: adminUserName,
          reviewerName: reviewer,
          status: "PUBLISHED"
        })
      });
    } catch (e) {}
  };

  const handleOpenRejectModal = (art: AdminArticle) => {
    setRejectingArticle(art);
    setRejectComment("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingArticle) return;
    if (!rejectComment.trim()) {
      showToast("Please enter a revision feedback comment!");
      return;
    }

    const nowIso = new Date().toISOString();
    const reviewer = `${adminUserName} (${adminRole === "chief_editor" ? "Chief Editor" : "Super Admin"})`;

    const updatedArt = {
      ...rejectingArticle,
      status: "REJECTED",
      rejectedBy: reviewer,
      rejectedAt: nowIso,
      reviewComment: rejectComment.trim(),
      rejectionReason: rejectComment.trim(),
      approvedBy: undefined,
      approvedAt: undefined
    };

    setArticles((prev) => prev.map((a) => (a.id === rejectingArticle.id ? updatedArt : a)));
    setShowRejectModal(false);
    setRejectingArticle(null);
    setRejectComment("");
    showToast(`❌ Article rejected with feedback comment sent back to Editor.`);

    try {
      await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedArt,
          userRole: adminRole,
          userName: adminUserName,
          reviewerName: reviewer,
          rejectionReason: rejectComment.trim(),
          status: "REJECTED"
        })
      });
    } catch (e) {}
  };

  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 120), 0);
  const pendingReviewArticles = articles.filter((a) => a.status === "PENDING_REVIEW" || a.status === "REVIEW");

  const isEditor = (role: string) => {
    const r = (role || "").toLowerCase();
    return r.includes("editor") && !r.includes("chief");
  };

  const isChiefOrSuperAdmin = (role: string) => {
    const r = (role || "").toLowerCase();
    return r.includes("chief") || r.includes("super") || r.includes("admin");
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: "2px solid #e50914", padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(229,9,20,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={18} style={{ color: "#00875a" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "20px", padding: "28px", color: "#ffffff", boxShadow: "0 10px 30px rgba(15,23,42,0.15)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <span style={{ background: "rgba(229,9,20,0.2)", color: "#f87171", border: "1px solid rgba(229,9,20,0.4)", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {isEditor(adminRole) ? "EDITOR PORTAL" : adminRole.includes("chief") ? "CHIEF EDITOR DASHBOARD" : "SUPER ADMIN PORTAL"}
          </span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "10px 0 4px 0", letterSpacing: "-0.02em" }}>
            Welcome back, {adminUserName}
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8" }}>
            {isEditor(adminRole)
              ? "Compose new articles and submit them for Chief Editor review & approval."
              : "Review pending editor submissions, approve live news, and monitor readership metrics."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/admin/articles"
            style={{ background: "#e50914", color: "#ffffff", padding: "11px 20px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(229,9,20,0.3)" }}
          >
            <Plus size={16} /> {isEditor(adminRole) ? "Compose News for Review" : "Compose Article"}
          </Link>
          {!isEditor(adminRole) && (
            <Link
              href="/admin/settings"
              style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", padding: "11px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}
            >
              Logo & Settings
            </Link>
          )}
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

        {/* Pending Reviews KPI Card */}
        <Link href="/admin/articles" style={{ textDecoration: "none" }}>
          <div style={{ background: pendingReviewArticles.length > 0 ? "#fefce8" : "#ffffff", border: `1px solid ${pendingReviewArticles.length > 0 ? "#fef08a" : "#e2e8f0"}`, borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: pendingReviewArticles.length > 0 ? "#a16207" : "#64748b", fontWeight: 700 }}>Pending Review</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef9c3", color: "#ca8a04", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: pendingReviewArticles.length > 0 ? "#854d0e" : "#0f172a" }}>{pendingReviewArticles.length}</div>
            <span style={{ fontSize: "0.75rem", color: pendingReviewArticles.length > 0 ? "#ca8a04" : "#64748b", fontWeight: 700 }}>
              {pendingReviewArticles.length > 0 ? "⚠️ Requires Chief Review" : "No pending submissions"}
            </span>
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
      </div>

      {/* PROMINENT EDITORIAL REVIEW QUEUE SECTION FOR CHIEF EDITOR & SUPER ADMIN ONLY */}
      {isChiefOrSuperAdmin(adminRole) && pendingReviewArticles.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #fefce8 0%, #fffbeb 100%)", border: "2px solid #fde047", borderRadius: "20px", padding: "24px", marginBottom: "28px", boxShadow: "0 10px 25px rgba(234,179,8,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#eab308", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                <Clock size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#713f12", margin: 0 }}>
                  ⚡ Pending Editorial Review Queue ({pendingReviewArticles.length})
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#a16207", fontWeight: 600 }}>
                  Submitted by Editors awaiting Chief Editor & Super Admin approval to publish live.
                </p>
              </div>
            </div>
            <Link
              href="/admin/articles"
              style={{ background: "#ca8a04", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: 800, fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              Open Full Queue <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingReviewArticles.map((art) => (
              <div key={art.id} style={{ background: "#ffffff", border: "1px solid #fef08a", borderRadius: "14px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "280px" }}>
                  {art.featuredImage && (
                    <img src={art.featuredImage} alt="" style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.92rem", marginBottom: "4px" }}>
                      {art.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>
                      <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                        {art.category?.name || "General"}
                      </span>
                      <span>✍️ Submitted by: <strong>{art.submittedBy || art.author?.name || "Editor"}</strong></span>
                      <span>📅 {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                  <button
                    onClick={() => handleApproveArticle(art)}
                    style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(16,185,129,0.3)" }}
                  >
                    <CheckCircle size={14} /> Approve & Publish
                  </button>
                  <button
                    onClick={() => handleOpenRejectModal(art)}
                    style={{ background: "#fff1f2", color: "#dc2626", border: "1px solid #fca5a5", padding: "8px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <X size={14} /> Reject & Comment
                  </button>
                  <Link
                    href="/admin/articles"
                    style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "0.8rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Edit size={14} /> Review Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: art.status === "PUBLISHED" ? "#10b981" : art.status === "REVIEW" ? "#eab308" : art.status === "REJECTED" ? "#dc2626" : "#64748b", flexShrink: 0 }} />
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
            {adminRole !== "editor" && (
              <Link
                href="/admin/settings"
                style={{ flex: 1, background: "#e50914", color: "#ffffff", padding: "10px", borderRadius: "8px", textAlign: "center", fontWeight: 700, fontSize: "0.84rem", textDecoration: "none" }}
              >
                Site Branding Settings
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chief Editor Rejection Feedback Modal on Dashboard */}
      {showRejectModal && rejectingArticle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "28px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Reject Article & Send Feedback
                </h3>
              </div>
              <button onClick={() => setShowRejectModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Article Title:</span>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                {rejectingArticle.title}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                Feedback / Revision Instructions for Editor <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Specify what needs correction (e.g. headline revision, factual proof, spelling fix, or formatting)..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 700, fontSize: "0.86rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#dc2626", color: "#ffffff", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                Reject Article & Send Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
