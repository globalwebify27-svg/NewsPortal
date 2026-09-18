"use client";
// =============================================================================
// AdBanners — Sticky Ad Bar + Leaderboard Ad Banner
// Extracted from HomeClient.tsx. Admin-configurable via /api/v1/ad-settings.
// =============================================================================

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

export interface StickyAdData {
  enabled: boolean;
  badge: string;
  text: string;
  link: string;
  image: string;
  bg: string;
  height: string;
}

export interface LeaderboardAdData {
  enabled: boolean;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  btnText: string;
  badge: string;
  height: string;
}

interface AdBannersProps {
  stickyAdData: StickyAdData;
  leaderboardAdData: LeaderboardAdData;
  adDismissed: boolean;
  leaderboardAdDismissed: boolean;
  onDismissStickyAd: () => void;
  onDismissLeaderboardAd: () => void;
  lang: string;
}

export default function AdBanners({
  stickyAdData,
  leaderboardAdData,
  adDismissed,
  leaderboardAdDismissed,
  onDismissStickyAd,
  onDismissLeaderboardAd,
  lang,
}: AdBannersProps) {
  return (
    <>
      {/* ── Sticky Advertisement Bar ─────────────────────────────────────── */}
      {stickyAdData?.enabled && !adDismissed && (
        <div
          className="sticky-ad-banner-bar"
          style={{
            position: "sticky",
            top: "70px",
            zIndex: 90,
            background: "#000000",
            borderRadius: "12px",
            padding: "10px 16px",
            marginBottom: "20px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
            {stickyAdData.badge && (
              <span style={{ background: "#e50914", color: "#ffffff", fontSize: "0.68rem", fontWeight: 900, padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(229, 9, 20, 0.4)", flexShrink: 0 }}>
                {stickyAdData.badge}
              </span>
            )}
            {stickyAdData.image && (
              <img src={stickyAdData.image} alt="Advertisement Banner" style={{ maxHeight: stickyAdData.text ? "44px" : "70px", maxWidth: "100%", objectFit: "contain", borderRadius: "6px", flexShrink: 0 }} />
            )}
            {stickyAdData.text && (
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {stickyAdData.text}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {stickyAdData.link && (
              <Link
                href={stickyAdData.link}
                target={stickyAdData.link.startsWith("http") ? "_blank" : "_self"}
                style={{ background: "#ffffff", color: "#0f172a", fontWeight: 800, fontSize: "0.78rem", padding: "6px 14px", borderRadius: "8px", textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", whiteSpace: "nowrap", transition: "all 0.2s ease" }}
              >
                {lang === "HI" ? "अभी देखें ▶" : "Explore Now ▶"}
              </Link>
            )}
            <button
              onClick={onDismissStickyAd}
              style={{ background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", border: "none", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s ease" }}
              title="Dismiss advertisement"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Leaderboard Ad Banner ─────────────────────────────────────────── */}
      {leaderboardAdData?.enabled && !leaderboardAdDismissed && (
        <div
          className="sticky-leaderboard-ad-bar"
          style={{
            position: "sticky",
            top: stickyAdData?.enabled && !adDismissed ? "126px" : "70px",
            zIndex: 85,
            background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "24px",
            minHeight: "80px",
            contain: "layout",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={onDismissLeaderboardAd}
            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0, 0, 0, 0.55)", color: "#ffffff", border: "none", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, transition: "background 0.2s ease" }}
            title="Dismiss banner"
          >
            <X size={13} />
          </button>

          {leaderboardAdData.image ? (
            <Link href={leaderboardAdData.link || "/advertise"} target={leaderboardAdData.link?.startsWith("http") ? "_blank" : "_self"} style={{ display: "block", textDecoration: "none", width: "100%" }}>
              <img
                src={leaderboardAdData.image}
                alt={leaderboardAdData.title || "Leaderboard Advertisement"}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "auto", maxHeight: `${leaderboardAdData.height || "110"}px`, objectFit: "cover", display: "block" }}
              />
            </Link>
          ) : (
            <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#ffffff", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span style={{ background: "#e50914", color: "#fff", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase" }}>
                  {leaderboardAdData.badge || "ADVERTISEMENT"}
                </span>
                <h3 style={{ margin: "6px 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>{leaderboardAdData.title}</h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8" }}>{leaderboardAdData.subtitle}</p>
              </div>
              {leaderboardAdData.link && (
                <Link href={leaderboardAdData.link} target={leaderboardAdData.link.startsWith("http") ? "_blank" : "_self"} style={{ background: "#ffffff", color: "#0f172a", padding: "8px 18px", borderRadius: "8px", fontWeight: 800, fontSize: "0.82rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                  {leaderboardAdData.btnText || (lang === "HI" ? "विज्ञापन दें" : "Advertise With Us")}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
