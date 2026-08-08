"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface NewsTickerProps {
  items: string[];
  badgeText: string;
  badgeLink?: string;
  speed?: number; // pixels per frame (default 0.75)
}

export default function NewsTicker({
  items,
  badgeText,
  badgeLink = "/breaking",
  speed = 0.75,
}: NewsTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const posRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      if (!isPaused && track) {
        // Half width is the exact width of 1 set of items
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          posRef.current += speed;
          if (posRef.current >= halfWidth) {
            posRef.current -= halfWidth; // Seamless loop back
          }
          track.style.transform = `translate3d(-${posRef.current}px, 0, 0)`;
        }
      }
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPaused, speed, items]);

  // Duplicate items array once for seamless loop continuity
  const displayItems = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className="news-ticker-container"
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "40px",
        backgroundColor: "#e50914",
        color: "#ffffff",
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        userSelect: "none",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Breaking Badge */}
      <Link
        href={badgeLink}
        className="news-ticker-badge"
        style={{
          backgroundColor: "#b91c1c",
          color: "#ffffff",
          fontSize: "0.82rem",
          fontWeight: 800,
          padding: "0 16px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          zIndex: 10,
          whiteSpace: "nowrap",
          textDecoration: "none",
          letterSpacing: "0.02em",
          boxShadow: "4px 0 12px rgba(0,0,0,0.25)",
        }}
      >
        {badgeText}
      </Link>

      {/* Viewport & Track */}
      <div
        className="news-ticker-viewport"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          ref={trackRef}
          className="news-ticker-track"
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexDirection: "row",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
            width: "max-content",
            willChange: "transform",
          }}
        >
          {displayItems.map((text, idx) => (
            <div
              key={idx}
              className="news-ticker-item"
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexDirection: "row",
                flexWrap: "nowrap",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#ffffff",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <span>{text}</span>
              <span
                style={{
                  marginLeft: "24px",
                  color: "#fef08a",
                  fontSize: "0.75rem",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              >
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
