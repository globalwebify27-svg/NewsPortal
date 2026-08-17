"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface SocialShareProps {
  title: string;
  slug: string;
  categorySlug?: string;
  size?: "sm" | "md" | "lg";
  layout?: "row" | "compact";
  image?: string;
  summary?: string;
}

export default function SocialShareButtons({
  title,
  slug,
  categorySlug = "top-news",
  size = "sm",
  layout = "row",
  image,
  summary,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Construct absolute public URL pointing specifically to this news story
  const getFullUrl = () => {
    if (!slug) {
      if (typeof window !== "undefined") return window.location.href.split("#")[0];
      return "https://www.globalawaaz.com";
    }

    // 1. If slug is already a full absolute URL:
    if (slug.startsWith("http://") || slug.startsWith("https://")) {
      return slug;
    }

    // 2. Clean the slug string and replace unencoded spaces with hyphens
    let cleanSlug = slug.startsWith("/") ? slug.slice(1) : slug;
    cleanSlug = cleanSlug.replace(/%20/g, "-").replace(/\s+/g, "-");

    // 3. If cleanSlug already includes a section path or standalone top-level route (videos, epaper, breaking, etc.)
    if (
      cleanSlug.includes("/") ||
      cleanSlug.startsWith("videos") ||
      cleanSlug.startsWith("epaper") ||
      cleanSlug.startsWith("breaking") ||
      cleanSlug.startsWith("top-news") ||
      cleanSlug.startsWith("advertise") ||
      cleanSlug.startsWith("about") ||
      cleanSlug.startsWith("careers")
    ) {
      return `https://www.globalawaaz.com/${cleanSlug}`;
    }

    // 4. If category is "videos"
    let cleanSection = (categorySlug || "top-news").toLowerCase().trim().replace(/\s+/g, "-");
    if (cleanSection === "videos") {
      const vidQuery = cleanSlug.includes("?v=") ? cleanSlug : `videos?v=${cleanSlug}`;
      return `https://www.globalawaaz.com/${vidQuery}`;
    }

    // 5. If on client-side reading an article page
    if (typeof window !== "undefined" && window.location.pathname !== "/" && window.location.pathname.length > 2) {
      const path = window.location.pathname;
      const pathSegments = path.split("/").filter(Boolean);
      if (pathSegments.length >= 2 || (pathSegments.length === 1 && !["admin", "login", "categories", "epaper", "about"].includes(pathSegments[0]))) {
        const cleanPath = path.replace(/%20/g, "-").replace(/\s+/g, "-");
        return `https://www.globalawaaz.com${cleanPath}`;
      }
    }

    // 6. Construct canonical URL with category section prefix
    if (cleanSection === "news" || !cleanSection) {
      cleanSection = "top-news";
    }

    return `https://www.globalawaaz.com/${cleanSection}/${cleanSlug}`;
  };

  const shareUrl = getFullUrl();
  const cleanSummary = summary ? summary.replace(/<[^>]*>?/gm, "").trim() : "";

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const textSnippet = cleanSummary ? `\n\n${cleanSummary.substring(0, 150)}${cleanSummary.length > 150 ? '...' : ''}` : "";
    const text = encodeURIComponent(`*${title}*${textSnippet}\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const t = encodeURIComponent(title);
    const u = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank");
  };

  const handleFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const u = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank");
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: cleanSummary ? `${title}\n\n${cleanSummary}` : title,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {}
  };

  const iconSizes = {
    sm: 14,
    md: 17,
    lg: 21,
  };

  const currentIconSize = iconSizes[size];

  return (
    <div
      className={`social-share-buttons ${layout}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "5px" : "8px",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="share-btn share-whatsapp"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        style={{
          background: "#25D366",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: size === "sm" ? "28px" : "34px",
          height: size === "sm" ? "28px" : "34px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.15s ease",
        }}
      >
        <svg width={currentIconSize} height={currentIconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.481 1.332 5.004L2 22l5.148-1.348c1.472.803 3.136 1.226 4.86 1.227h.004c5.506 0 9.989-4.478 9.99-9.984 0-2.668-1.039-5.176-2.927-7.065C17.187 3.041 14.68 2 12.012 2zm5.833 14.202c-.247.694-1.439 1.365-1.996 1.423-.518.054-1.189.082-3.418-.838-2.846-1.174-4.664-4.08-4.806-4.27-.14-.188-1.144-1.523-1.144-2.905 0-1.383.722-2.062.979-2.344.257-.282.564-.352.752-.352.188 0 .376.002.54.01.174.008.411-.066.643.49.247.593.847 2.07.922 2.222.075.152.125.328.025.526-.1.198-.15.32-.298.497-.149.176-.312.394-.446.529-.149.149-.304.312-.131.608.173.296.772 1.274 1.657 2.062 1.139 1.015 2.1 1.328 2.396 1.477.296.149.471.125.644-.075.173-.199.742-.865.94-1.162.198-.297.396-.247.668-.149.272.099 1.73.816 2.027.964.297.149.495.223.569.347.075.124.075.719-.172 1.413z" />
        </svg>
      </button>

      {/* Twitter / X */}
      <button
        type="button"
        onClick={handleTwitter}
        className="share-btn share-twitter"
        title="Share on X (Twitter)"
        aria-label="Share on X"
        style={{
          background: "#000000",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: size === "sm" ? "28px" : "34px",
          height: size === "sm" ? "28px" : "34px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.15s ease",
        }}
      >
        <svg width={currentIconSize} height={currentIconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={handleFacebook}
        className="share-btn share-facebook"
        title="Share on Facebook"
        aria-label="Share on Facebook"
        style={{
          background: "#1877F2",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: size === "sm" ? "28px" : "34px",
          height: size === "sm" ? "28px" : "34px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.15s ease",
        }}
      >
        <svg width={currentIconSize} height={currentIconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* Native / Copy Link */}
      <button
        type="button"
        onClick={handleNativeShare}
        className={`share-btn share-copy ${copied ? "copied" : ""}`}
        title={copied ? "Link Copied!" : "Copy Link / Share"}
        aria-label="Copy link or share"
        style={{
          background: copied ? "#10b981" : "#475569",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: size === "sm" ? "28px" : "34px",
          height: size === "sm" ? "28px" : "34px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {copied ? (
          <Check size={currentIconSize} style={{ color: "#ffffff" }} />
        ) : (
          <Share2 size={currentIconSize} />
        )}
      </button>

      {copied && (
        <span
          className="copied-tooltip"
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#10b981",
            background: "rgba(16, 185, 129, 0.1)",
            padding: "2px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Link Copied!
        </span>
      )}
    </div>
  );
}
