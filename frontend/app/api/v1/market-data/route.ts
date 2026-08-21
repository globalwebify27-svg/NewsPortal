// =====================================================================
// GET /api/v1/market-data
// Real-Time Market Data: Gold, Silver, Sensex, Nifty50, USD/INR, Bitcoin
// Sources: Yahoo Finance (free, no key) + CoinGecko public API
// 30-second server-side cache to avoid rate limits
// =====================================================================

import { NextResponse } from "next/server";

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

// Simple in-memory cache
let cachedData: MarketItem[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

async function fetchYahooQuote(symbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    return { price, change, changePercent };
  } catch {
    return null;
  }
}

async function fetchBitcoin(): Promise<{
  price: number;
  change: number;
  changePercent: number;
} | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const price = json?.bitcoin?.usd ?? 0;
    const changePercent = json?.bitcoin?.usd_24h_change ?? 0;
    const change = (price * changePercent) / 100;
    return { price, change, changePercent };
  } catch {
    return null;
  }
}

function dir(chg: number): "up" | "down" | "flat" {
  if (chg > 0) return "up";
  if (chg < 0) return "down";
  return "flat";
}

async function buildMarketData(): Promise<MarketItem[]> {
  // Fetch all in parallel
  const [gold, silver, sensex, nifty, usdInr, btc] = await Promise.all([
    fetchYahooQuote("GC=F"),      // Gold futures USD/oz
    fetchYahooQuote("SI=F"),      // Silver futures USD/oz
    fetchYahooQuote("^BSESN"),    // Sensex
    fetchYahooQuote("^NSEI"),     // Nifty 50
    fetchYahooQuote("USDINR=X"),  // USD/INR
    fetchBitcoin(),               // Bitcoin USD
  ]);

  // Convert Gold & Silver from USD/oz to INR/10g (approximate)
  const usdToInr = usdInr?.price ?? 83.5;
  const ozToTenGram = 0.32151; // 10g = 0.32151 troy oz

  const goldInrPer10g = gold ? gold.price * usdToInr * ozToTenGram : 72450;
  const goldChg = gold ? gold.change * usdToInr * ozToTenGram : 0;
  const goldPct = gold?.changePercent ?? 0;

  // Silver: INR per kg (1 troy oz = 31.1035g, so 1kg = 32.15 oz)
  const silverKgOz = 32.15;
  const silverInrPerKg = silver ? silver.price * usdToInr * (silverKgOz / 1000) * 1000 : 87200;
  const silverChg = silver ? silver.change * usdToInr * (silverKgOz / 1000) * 1000 : 0;
  const silverPct = silver?.changePercent ?? 0;

  const items: MarketItem[] = [
    {
      symbol: "GOLD",
      name: "Gold",
      nameHi: "सोना",
      price: Math.round(goldInrPer10g),
      change: Math.round(goldChg),
      changePercent: parseFloat(goldPct.toFixed(2)),
      currency: "₹",
      icon: "🪙",
      direction: dir(goldChg),
    },
    {
      symbol: "SILVER",
      name: "Silver",
      nameHi: "चाँदी",
      price: Math.round(silverInrPerKg),
      change: Math.round(silverChg),
      changePercent: parseFloat(silverPct.toFixed(2)),
      currency: "₹",
      icon: "🥈",
      direction: dir(silverChg),
    },
    {
      symbol: "SENSEX",
      name: "Sensex",
      nameHi: "सेंसेक्स",
      price: Math.round(sensex?.price ?? 82450),
      change: Math.round(sensex?.change ?? 0),
      changePercent: parseFloat((sensex?.changePercent ?? 0).toFixed(2)),
      currency: "",
      icon: "📈",
      direction: dir(sensex?.change ?? 0),
    },
    {
      symbol: "NIFTY",
      name: "Nifty 50",
      nameHi: "निफ्टी 50",
      price: Math.round(nifty?.price ?? 25120),
      change: Math.round(nifty?.change ?? 0),
      changePercent: parseFloat((nifty?.changePercent ?? 0).toFixed(2)),
      currency: "",
      icon: "📊",
      direction: dir(nifty?.change ?? 0),
    },
    {
      symbol: "USDINR",
      name: "USD/INR",
      nameHi: "डॉलर/रुपया",
      price: parseFloat((usdInr?.price ?? 83.45).toFixed(2)),
      change: parseFloat((usdInr?.change ?? 0).toFixed(2)),
      changePercent: parseFloat((usdInr?.changePercent ?? 0).toFixed(2)),
      currency: "₹",
      icon: "💱",
      direction: dir(usdInr?.change ?? 0),
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      nameHi: "बिटकॉइन",
      price: Math.round(btc?.price ?? 65200),
      change: Math.round(btc?.change ?? 0),
      changePercent: parseFloat((btc?.changePercent ?? 0).toFixed(2)),
      currency: "$",
      icon: "₿",
      direction: dir(btc?.change ?? 0),
    },
  ];

  return items;
}

export async function GET() {
  const now = Date.now();

  // Serve from in-memory cache if fresh
  if (cachedData && now - cacheTime < CACHE_TTL_MS) {
    return NextResponse.json(
      { success: true, data: cachedData, cached: true, updatedAt: new Date(cacheTime).toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  }

  try {
    const data = await buildMarketData();
    cachedData = data;
    cacheTime = now;

    return NextResponse.json(
      { success: true, data, cached: false, updatedAt: new Date(now).toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err: any) {
    // Return stale cache or fallback on error
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData, cached: true, stale: true });
    }
    return NextResponse.json({ success: false, message: "Failed to fetch market data" }, { status: 500 });
  }
}
