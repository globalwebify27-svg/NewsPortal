"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ImageIcon, Upload, Check, Copy, Trash2, Loader2, RefreshCw, FolderOpen } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  altText?: string;
  size?: number;
  createdAt?: string;
  mimeType?: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // ── Fetch uploaded media from DB ────────────────────────────────────────────
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/media");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data);
      } else {
        setMediaList([]);
      }
    } catch {
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  // ── Upload new file to Cloudinary → save to DB ─────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/media/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        showToast("✓ Image uploaded & saved to media library!");
        await fetchMedia();
      } else {
        showToast("❌ Upload failed: " + (json.message || "Unknown error"), "error");
      }
    } catch (err: any) {
      showToast("❌ Upload error: " + (err?.message || ""), "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── Delete media ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image from the media library?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/media/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok || json.success) {
        setMediaList(prev => prev.filter(m => m.id !== id));
        showToast("Image deleted from library.");
      } else {
        showToast("❌ Delete failed: " + (json.message || ""), "error");
      }
    } catch (err: any) {
      showToast("❌ Delete error: " + (err?.message || ""), "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Copy CDN URL ────────────────────────────────────────────────────────────
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div>
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#fff", border: `2px solid ${toastType === "error" ? "#ef4444" : "#e50914"}`, padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px", maxWidth: "340px", animation: "slideIn 0.2s ease" }}>
          <Check size={16} style={{ color: toastType === "error" ? "#f87171" : "#22c55e", flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Media Assets &amp; CDN Gallery
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              {loading ? "Loading media..." : `${mediaList.length} file${mediaList.length !== 1 ? "s" : ""} in your library`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Refresh */}
          <button
            onClick={fetchMedia}
            disabled={loading}
            style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>

          {/* Upload */}
          <label style={{ background: uploading ? "#64748b" : "#e50914", color: "#ffffff", padding: "11px 22px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", cursor: uploading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: uploading ? "none" : "0 4px 14px rgba(229,9,20,0.3)", transition: "all 0.2s ease" }}>
            {uploading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={16} />}
            {uploading ? "Uploading..." : "Upload New Asset"}
            <input type="file" accept="image/*" disabled={uploading} onChange={handleUpload} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "16px" }}>
          <Loader2 size={40} style={{ color: "#e50914", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#64748b", fontWeight: 600, fontSize: "0.95rem" }}>Loading media library...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && mediaList.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "20px", background: "#ffffff", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderOpen size={32} style={{ color: "#94a3b8" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>No media uploaded yet</p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Click "Upload New Asset" to add images to your library.</p>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {!loading && mediaList.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {mediaList.map((item) => (
            <div key={item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", transition: "box-shadow 0.2s ease" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)"}
            >
              {/* Image Preview */}
              <div style={{ height: "180px", background: "#f1f5f9", overflow: "hidden", position: "relative" }}>
                <img
                  src={item.url}
                  alt={item.altText || "Media"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {/* Delete overlay button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  title="Delete image"
                  style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(220,38,38,0.92)", color: "#fff", border: "none", width: "32px", height: "32px", borderRadius: "8px", cursor: deletingId === item.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", backdropFilter: "blur(4px)", transition: "all 0.15s ease" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(185,28,28,0.97)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.92)"}
                >
                  {deletingId === item.id
                    ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>

              {/* Card Info */}
              <div style={{ padding: "16px" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.altText || "Uploaded Image"}
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "#94a3b8", marginBottom: "12px" }}>
                  <span>{formatSize(item.size)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <button
                  onClick={() => handleCopy(item.url)}
                  style={{ width: "100%", background: copiedUrl === item.url ? "#ecfdf5" : "#f8fafc", color: copiedUrl === item.url ? "#047857" : "#334155", border: "1px solid", borderColor: copiedUrl === item.url ? "#a7f3d0" : "#e2e8f0", padding: "8px", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s ease" }}
                >
                  {copiedUrl === item.url ? <Check size={14} /> : <Copy size={14} />}
                  {copiedUrl === item.url ? "CDN URL Copied!" : "Copy Image CDN Link"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
