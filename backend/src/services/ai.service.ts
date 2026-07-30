// =============================================================================
// AI Service — Google Gemini Integration for Editorial Newsrooms
// =============================================================================

import { logger } from "../config/logger";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error("Gemini API Error:", errText);
    throw new Error(`Gemini API returned error ${response.status}`);
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

// ─── 1. Generate Executive Summary ───────────────────────────────────────────
export async function generateArticleSummary(content: string): Promise<string> {
  const prompt = `You are a senior editor at BBC News. Write a concise 2-sentence executive summary (bullet points style) for the following news article:\n\n${content.slice(0, 4000)}`;
  return callGemini(prompt);
}

// ─── 2. Translate English to Hindi ───────────────────────────────────────────
export async function translateEnglishToHindi(text: string): Promise<string> {
  const prompt = `You are a professional Hindi news translator at BBC Hindi. Translate the following English news text accurately into fluent, natural Hindi (Devanagari script):\n\n${text.slice(0, 4000)}`;
  return callGemini(prompt);
}

// ─── 3. Generate SEO Headlines & Meta Description ─────────────────────────────
export async function generateSeoMetadata(
  title: string,
  content: string
): Promise<{ headlines: string[]; seoTitle: string; seoDesc: string; keywords: string }> {
  const prompt = `You are an expert SEO Strategist for news publishing.
Article Title: ${title}
Content snippet: ${content.slice(0, 1500)}

Return a JSON object ONLY with the following keys (no markdown formatting, no code blocks):
{
  "headlines": ["Headline 1 (Catchy)", "Headline 2 (SEO Focused)", "Headline 3 (Short & Punchy)"],
  "seoTitle": "Optimized Meta Title (under 60 chars)",
  "seoDesc": "Compelling Meta Description (under 155 chars)",
  "keywords": "comma, separated, key, phrases"
}`;

  const rawJson = await callGemini(prompt);
  try {
    const cleanJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch {
    return {
      headlines: [title],
      seoTitle: title.slice(0, 60),
      seoDesc: content.slice(0, 150),
      keywords: "news, breaking news, analysis",
    };
  }
}

// ─── 4. Auto-Suggest Tags & Category ──────────────────────────────────────────
export async function suggestArticleTags(content: string): Promise<string[]> {
  const prompt = `Extract 5 relevant, high-value news tags (topic keywords) from the following article content. Return ONLY a comma-separated list of tags:\n\n${content.slice(0, 2000)}`;
  const result = await callGemini(prompt);
  return result
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
