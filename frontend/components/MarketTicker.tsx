"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface MarketItem {
  symbol: string;
  name: string;
  nameHi: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  icon: string;
  direction: "up" | "down" | "flat";
}

function formatPrice(price: number, currency: string, symbol: string): string {
  if (symbol === "GOLD" || symbol === "SILVER") {
    return `${currency}${price.toLocaleString("en-IN")}`;
  }
  if (symbol === "BTC") {
    return `${currency}${price.toLocaleString("en-US")}`;
  }
  if (symbol === "USDINR") {
    return `${currency}${price.toFixed(2)}`;
  }
  return price.toLocaleString("en-IN");
}

function formatUnit(symbol: string, lang: string): string {
  if (symbol === "GOLD") return lang === "HI" ? "/10ग्राम" : "/10g";
  if (symbol === "SILVER") return lang === "HI" ? "/किग्रा" : "/kg";
  return "";
}

function ArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: "inline", verticalAlign: "middle", marginBottom: "1px" }}>
      <path d="M5 1L9 9H1L5 1Z" fill="currentColor" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: "inline", verticalAlign: "middle", marginTop: "1px" }}>
      <path d="M5 9L1 1H9L5 9Z" fill="currentColor" />
    </svg>
  );
}

function TickerItem({ item, lang }: { item: MarketItem; lang: string }) {
  const isUp = item.direction === "up";
  const isDown = item.direction === "down";
  const color = isUp ? "#16a34a" : isDown ? "#dc2626" : "#6b7280";
  const bgColor = isUp ? "rgba(22,163,74,0.1)" : isDown ? "rgba(220,38,38,0.08)" : "transparent";

  return (
    <div
      className="market-ticker-item"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 12px 3px 8px",
        borderRadius: "20px",
        background: bgColor,
        border: `1px solid ${isUp ? "rgba(22,163,74,0.2)" : isDown ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.08)"}`,
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "background 0.5s ease",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: "13px", lineHeight: 1 }}>{item.icon}</span>

      {/* Name */}
      <span style={{
        fontWeight: 700,
        fontSize: "0.72rem",
        color: "var(--market-ticker-text, rgba(255,255,255,0.85))",
        letterSpacing: "0.02em",
      }}>
        {lang === "HI" ? item.nameHi : item.name}
        <span style={{ fontSize: "0.62rem", opacity: 0.65, marginLeft: "2px" }}>{formatUnit(item.symbol, lang)}</span>
      </span>

      {/* Price */}
      <span style={{
        fontWeight: 800,
        fontSize: "0.74rem",
        color: "var(--market-ticker-text, rgba(255,255,255,0.95))",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.01em",
      }}>
        {formatPrice(item.price, item.currency, item.symbol)}
      </span>

      {/* Change */}
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        color,
        fontWeight: 700,
        fontSize: "0.68rem",
        fontVariantNumeric: "tabular-nums",
      }}>
        {isUp && <ArrowUp />}
        {isDown && <ArrowDown />}
        <span>{Math.abs(item.changePercent).toFixed(2)}%</span>
      </span>
    </div>
  );
}

function LiveDot() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 6px rgba(34,197,94,0.8)",
          animation: "market-pulse 1.8s ease-in-out infinite",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span style={{
        fontSize: "0.62rem",
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#22c55e",
      }}>
        LIVE
      </span>
    </div>
  );
}

// Fallback market data shown while fetching
const FALLBACK_DATA: MarketItem[] = [
  { symbol: "GOLD", name: "Gold", nameHi: "सोना", price: 72450, change: 120, changePercent: 0.17, currency: "₹", icon: "🪙", direction: "up" },
  { symbol: "SILVER", name: "Silver", nameHi: "चाँदी", price: 87200, change: -110, changePercent: -0.13, currency: "₹", icon: "🥈", direction: "down" },
  { symbol: "SENSEX", name: "Sensex", nameHi: "सेंसेक्स", price: 82450, change: 245, changePercent: 0.30, currency: "", icon: "📈", direction: "up" },
  { symbol: "NIFTY", name: "Nifty 50", nameHi: "निफ्टी 50", price: 25120, change: 88, changePercent: 0.35, currency: "", icon: "📊", direction: "up" },
  { symbol: "USDINR", name: "USD/INR", nameHi: "डॉलर/रुपया", price: 83.45, change: 0.12, changePercent: 0.14, currency: "₹", icon: "💱", direction: "up" },
  { symbol: "BTC", name: "Bitcoin", nameHi: "बिटकॉइन", price: 65200, change: -320, changePercent: -0.49, currency: "$", icon: "₿", direction: "down" },
];

export default function MarketTicker() {
  const { lang } = useLanguage();
  const [data, setData] = useState<MarketItem[]>(FALLBACK_DATA);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [flashKeys, setFlashKeys] = useState<Record<string, string>>({});
  const [paused, setPaused] = useState(false);
  const prevDataRef = useRef<Record<string, number>>({});

  const fetchData = async (silent = false) => {
    try {
      const res = await fetch("/api/v1/market-data", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        const newData: MarketItem[] = json.data;

        // Detect price changes to flash cells
        const newFlash: Record<string, string> = {};
        newData.forEach((item) => {
          const prev = prevDataRef.current[item.symbol];
          if (prev !== undefined && prev !== item.price) {
            newFlash[item.symbol] = item.price > prev ? "flash-green" : "flash-red";
          }
          prevDataRef.current[item.symbol] = item.price;
        });

        setData(newData);
        setFlashKeys(newFlash);
        setLastUpdated(json.updatedAt ? new Date(json.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : "");

        // Clear flash after 1.2s
        if (Object.keys(newFlash).length > 0) {
          setTimeout(() => setFlashKeys({}), 1200);
        }
      }
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items for seamless CSS marquee loop
  const items = [...data, ...data];

  return (
    <div
      id="marketTickerBar"
      className="market-ticker-bar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      style={{
        width: "100%",
        background: "linear-gradient(90deg, #08080f 0%, #0f0f1a 50%, #08080f 100%)",
        borderBottom: "1px solid rgba(229,9,20,0.2)",
        overflow: "hidden",
        height: "36px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Left sticky label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px 0 14px",
        background: "linear-gradient(90deg, #08080f 75%, transparent 100%)",
        zIndex: 20,
        flexShrink: 0,
        height: "100%",
        position: "relative",
      }}>
        <LiveDot />
        <span style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.12)", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          {lang === "HI" ? "बाज़ार" : "Markets"}
        </span>
        <span style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.12)", display: "inline-block", flexShrink: 0 }} />
      </div>

      {/* Scrolling ticker track */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", height: "100%" }}>
        {/* Left edge fade */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "48px", background: "linear-gradient(90deg, #08080f, transparent)", zIndex: 5, pointerEvents: "none" }} />
        {/* Right edge fade */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48px", background: "linear-gradient(270deg, #08080f, transparent)", zIndex: 5, pointerEvents: "none" }} />

        {/* CSS marquee belt — animationPlayState controlled by hover */}
        <div
          className="market-ticker-track"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {items.map((item, idx) => (
            <React.Fragment key={`${item.symbol}_${idx}`}>
              <div className={idx < data.length && flashKeys[item.symbol] ? flashKeys[item.symbol] : ""}>
                <TickerItem item={item} lang={lang} />
              </div>
              <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: last updated time */}
      {lastUpdated && (
        <div style={{ padding: "0 12px", flexShrink: 0, background: "linear-gradient(270deg, #08080f 80%, transparent 100%)", zIndex: 20, height: "100%", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.25)", fontWeight: 500, whiteSpace: "nowrap" }}>
            {lastUpdated}
          </span>
        </div>
      )}
    </div>
  );
}
