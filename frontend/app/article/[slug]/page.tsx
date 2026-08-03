"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Calendar, Heart, MessageSquare, Send, Loader2, ArrowLeft, Share2, BookOpen, User } from "lucide-react";

import SocialShareButtons from "@/components/SocialShareButtons";
import { findDefaultArticle, stripHtml } from "@/lib/defaultArticles";
import { API_ENDPOINTS } from "@/lib/config";
import { extractYouTubeId } from "@/lib/youtube";

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  featuredImage: string;
  category?: { name: string; slug: string; color?: string };
  author?: { name: string; bio?: string };
  readTime?: string;
  views?: number;
  createdAt?: string;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

function formatTime(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function ArticlePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "article";

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([
    { id: 1, author: "Rajesh Sharma", text: "Exceptional analysis. Highly relevant to current policy frameworks.", time: "2 hours ago" },
    { id: 2, author: "Emily Watson", text: "Great points regarding sustainable scalability and technological alignment.", time: "4 hours ago" }
  ]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      const rawParam = params?.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : "article";
      const targetSlug = decodeURIComponent(rawParam).trim().toLowerCase();

      // 1. Check localStorage (custom admin articles)
      try {
        const local = localStorage.getItem("ga_custom_articles");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const found = parsed.find((a: ArticleDetail) => {
              if (!a) return false;
              const aSlug = (a.slug || "").trim().toLowerCase();
              const aId = (a.id || "").trim().toLowerCase();
              const cleanId = aId.replace(/^custom-/, "");
              return (
                aSlug === targetSlug ||
                aId === targetSlug ||
                cleanId === targetSlug ||
                (aSlug && targetSlug.includes(aSlug)) ||
                (aSlug && aSlug.includes(targetSlug))
              );
            });
            if (found) {
              setArticle(found);
              if (found.views) setLikes(found.views);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("localStorage read error:", e);
      }

      // 2. Fetch from backend API
      try {
        const res = await fetch(API_ENDPOINTS.articleBySlug(targetSlug));
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setArticle(json.data);
            if (json.data.views) setLikes(json.data.views);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API fetch failed:", err);
      }

      // 3. Fall back to built-in default articles (always available, no network needed)
      const defaultFound = findDefaultArticle(targetSlug);
      if (defaultFound) {
        setArticle({
          ...defaultFound,
          featuredImage: defaultFound.featuredImage
        } as ArticleDetail);
        setLoading(false);
        return;
      }

      // 4. Nothing found — show article-not-found state
      setLoading(false);
    }

    fetchArticle();
  }, [slug]);

  const handleLike = () => {
    setLikes(l => hasLiked ? l - 1 : l + 1);
    setHasLiked(h => !h);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(c => [...c, { id: Date.now(), author: "Reader", text: newComment, time: "Just now" }]);
    setNewComment("");
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 0", gap: "16px" }}>
        <Loader2 size={38} style={{ animation: "spin 1s linear infinite", color: "#e50914" }} />
        <p style={{ color: "var(--color-secondary)", fontSize: "0.9rem" }}>Loading article…</p>
      </div>
    );
  }

  // ── Not Found ──────────────────────────────────────────────────────────────
  if (!article) {
    return (
      <div style={{ maxWidth: "700px", margin: "80px auto", padding: "0 18px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📰</div>
        <h1 style={{ fontFamily: "serif", fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>
          Article Not Found
        </h1>
        <p style={{ color: "var(--color-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "28px" }}>
          The article you&apos;re looking for is not available. It may have been removed or the URL may be incorrect.
        </p>
        <Link href="/" style={{ background: "#e50914", color: "#fff", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  const categoryColor = article.category?.color || "#e50914";

  return (
    <article style={{ maxWidth: "860px", margin: "0 auto 80px auto", padding: "0 18px" }}>

      {/* ── Back breadcrumb ────────────────────────────────────────────── */}
      <div style={{ padding: "24px 0 16px" }}>
        <Link
          href="/"
          style={{ color: "var(--color-secondary)", textDecoration: "none", fontSize: "0.84rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease" }}
        >
          <ArrowLeft size={15} /> Back to Global Awaaz
        </Link>
      </div>

      {/* ── Category badge + Title ─────────────────────────────────────── */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{
          display: "inline-block", background: categoryColor, color: "#fff",
          fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.06em", padding: "5px 12px", borderRadius: "6px", marginBottom: "14px"
        }}>
          {article.category?.name || "EDITORIAL"}
        </span>

        <h1 style={{
          fontFamily: "serif", fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
          fontWeight: 800, lineHeight: 1.2, margin: "0 0 14px 0",
          color: "var(--color-primary)", letterSpacing: "-0.01em"
        }}>
          {article.title}
        </h1>

        {article.summary && (
          <p style={{ fontSize: "1.1rem", fontWeight: 400, color: "var(--color-secondary)", lineHeight: 1.65, margin: "0 0 16px 0" }}>
            {stripHtml(article.summary)}
          </p>
        )}
      </div>

      {/* ── Author + meta bar ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)",
        padding: "14px 0", marginBottom: "28px", flexWrap: "wrap", gap: "14px"
      }}>
        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "linear-gradient(135deg, #e50914, #ff6b6b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0
          }}>
            {(article.author?.name || "G")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.94rem" }}>{article.author?.name || "Global Awaaz Staff"}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>
              {article.author?.bio || "Editorial Correspondent"}
            </div>
          </div>
        </div>

        {/* Meta: time | date | read time | likes | share */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 500 }}>
            <Clock size={14} /> {formatTime(article.createdAt)}
          </span>
          <span style={{ color: "var(--color-border)", fontSize: "0.8rem" }}>|</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 500 }}>
            <Calendar size={14} /> {formatDate(article.createdAt)}
          </span>
          <span style={{ color: "var(--color-border)", fontSize: "0.8rem" }}>|</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 500 }}>
            <BookOpen size={14} /> {article.readTime || "5 min read"}
          </span>
          <span style={{ color: "var(--color-border)", fontSize: "0.8rem" }}>|</span>
          <button
            onClick={handleLike}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: hasLiked ? "#e50914" : "var(--color-secondary)", fontWeight: 600, fontSize: "0.8rem", padding: 0 }}
          >
            <Heart size={16} fill={hasLiked ? "#e50914" : "none"} stroke={hasLiked ? "#e50914" : "currentColor"} /> {likes}
          </button>
        </div>
      </div>

      {/* ── Hero Image ────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        marginBottom: "32px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        height: article.imageHeight && article.imageHeight !== "auto" ? article.imageHeight : undefined
      }}>
        <img
          src={article.featuredImage}
          alt={article.title}
          style={{
            width: "100%",
            height: "100%",
            maxHeight: article.imageHeight ? "none" : "480px",
            objectFit: article.imageFit || "cover",
            display: "block"
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div style={{ position: "absolute", bottom: "16px", right: "16px" }}>
          <SocialShareButtons title={article.title} slug={slug} size="md" />
        </div>
      </div>

      {/* ── Embedded Article Video Story Player ───────────────────────── */}
      {article.videoUrl && article.videoUrl.trim() && (
        <div style={{
          position: "relative",
          marginBottom: "32px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          aspectRatio: "16 / 9",
          background: "#0a0a0c",
          border: "2px solid #e50914"
        }}>
          {extractYouTubeId(article.videoUrl) ? (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(article.videoUrl)}?autoplay=1&mute=1`}
              title={article.title}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={article.videoUrl}
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      )}

      {/* ── Article Body ──────────────────────────────────────────────── */}
      <div style={{ fontSize: "1.08rem", lineHeight: 1.85, color: "var(--color-primary)", letterSpacing: "0.01em" }}>
        {article.body && article.body.includes("<") ? (
          <div
            className="rich-article-body"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        ) : (
          article.body.split("\n\n").map((para, i) =>
            para.trim() ? (
              <p key={i} style={{ marginBottom: "1.4em", textAlign: "justify" }}>
                {para.trim()}
              </p>
            ) : null
          )
        )}

        {/* Pull quote */}
        <blockquote style={{
          borderLeft: `4px solid ${categoryColor}`,
          paddingLeft: "20px",
          fontStyle: "italic",
          fontSize: "1.2rem",
          margin: "32px 0",
          color: "var(--color-primary)",
          fontFamily: "serif",
          lineHeight: 1.6
        }}>
          "The convergence of information, technology, and global transparency represents the foundation of responsible journalism."
        </blockquote>
      </div>

      {/* ── Tags / Category link ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--color-border)" }}>
        {article.category && (
          <Link
            href={`/${article.category.slug}`}
            style={{ background: "var(--color-bg-alt)", border: `1px solid ${categoryColor}`, color: categoryColor, padding: "5px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            {article.category.name}
          </Link>
        )}
        <span style={{ background: "var(--color-bg-alt)", border: "1px solid var(--color-border)", color: "var(--color-secondary)", padding: "5px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
          {article.readTime || "5 min read"}
        </span>
      </div>

      {/* ── Comments Section ──────────────────────────────────────────── */}
      <section style={{ marginTop: "60px", paddingTop: "32px", borderTop: "2px solid var(--color-border)" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
          <MessageSquare size={22} style={{ color: "#e50914" }} /> Comments ({comments.length})
        </h2>

        {/* Add comment */}
        <form onSubmit={handleAddComment} style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Share your thoughts on this story…"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            style={{
              flex: 1, minWidth: "200px", padding: "12px 16px", borderRadius: "10px",
              border: "1px solid var(--color-border)", fontSize: "0.95rem",
              background: "var(--color-card-bg)", color: "var(--color-primary)",
              outline: "none"
            }}
          />
          <button
            type="submit"
            style={{
              background: "#e50914", color: "#fff", border: "none",
              padding: "12px 24px", borderRadius: "10px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem"
            }}
          >
            <Send size={15} /> Post
          </button>
        </form>

        {/* Comment list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {comments.map(c => (
            <div key={c.id} style={{
              background: "var(--color-card-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px", padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "0.85rem"
                  }}>
                    {c.author[0]}
                  </div>
                  <strong style={{ fontSize: "0.92rem" }}>{c.author}</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-secondary)" }}>{c.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-secondary)", lineHeight: 1.55 }}>
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
