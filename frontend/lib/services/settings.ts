// =============================================================================
// Site Settings Service — Central Service for Logo, Advertisements, and Content Settings
// =============================================================================

import prisma from "../prisma";
import { cleanMediaUrl } from "../mediaUpload";
import { serverCache, TTL } from "../cache";

export const LOGO_SETTING_KEYS = [
  "site_logo_url",
  "site_logo_size",
  "site_logo_margin",
  "header_bg_gif",
  "header_bg_height",
  "header_bg_size_fit",
  "header_bg_overlay_opacity",
  "sidebar_video_ad_url",
  "sidebar_video_ad_title",
  "sidebar_video_ad_target_link",
  "sidebar_video_ad_enabled",
  "sidebar_video_ads_list",
  "spotlight_col1_ad_url",
  "spotlight_col1_ad_link",
  "spotlight_col1_ad_title",
  "spotlight_col2_ad_url",
  "spotlight_col2_ad_link",
  "spotlight_col2_ad_title",
];

export const AD_SETTING_KEYS = [
  "ad_sticky_enabled",
  "ad_sticky_text",
  "ad_sticky_link",
  "ad_sticky_image",
  "ad_sticky_bg",
  "ad_sticky_badge",
  "ad_leaderboard_enabled",
  "ad_leaderboard_image",
  "ad_leaderboard_title",
  "ad_leaderboard_subtitle",
  "ad_leaderboard_link",
  "ad_leaderboard_btn_text",
  "ad_leaderboard_badge",
  "ad_leaderboard_height",
  "ad_left_grid_enabled",
  "ad_left_grid_image",
  "ad_left_grid_title",
  "ad_left_grid_subtitle",
  "ad_left_grid_link",
  "ad_left_grid_btn_text",
  "ad_left_grid_badge",
  "ad_portal_whatsapp",
  "ad_portal_whatsapp_msg",
  "ad_portal_live_status",
  "ad_portal_live_enabled",
  "ad_portal_email",
  "ad_portal_location",
  "ad_portal_turnaround",
];

const CACHE_KEY_LOGO = "settings:logo";
const CACHE_KEY_ADS = "settings:ads";

export async function getLogoSettings(): Promise<Record<string, string>> {
  const cached = serverCache.get<Record<string, string>>(CACHE_KEY_LOGO);
  if (cached) return cached;

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: LOGO_SETTING_KEYS } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    if (s.key === "site_logo_url" || s.key === "header_bg_gif" || s.key.includes("_url")) {
      map[s.key] = cleanMediaUrl(s.value);
    } else {
      map[s.key] = s.value;
    }
  }

  serverCache.set(CACHE_KEY_LOGO, map, TTL.SETTINGS);
  return map;
}

export async function saveLogoSettings(pairs: { key: string; value: string }[]): Promise<{ count: number }> {
  let count = 0;
  for (const { key, value } of pairs) {
    if (!LOGO_SETTING_KEYS.includes(key)) continue;

    const valStr = String(value);
    const cleanVal =
      key === "site_logo_url" || key === "header_bg_gif" || key.includes("_url")
        ? cleanMediaUrl(valStr)
        : valStr;

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: cleanVal },
      create: { key, value: cleanVal, label: key, group: "branding" },
    });
    count++;
  }

  serverCache.delete(CACHE_KEY_LOGO);
  return { count };
}

export async function deleteLogoSetting(key: string): Promise<boolean> {
  if (!LOGO_SETTING_KEYS.includes(key)) return false;
  await prisma.siteSetting.deleteMany({ where: { key } });
  serverCache.delete(CACHE_KEY_LOGO);
  return true;
}

export async function getAdSettings(): Promise<Record<string, string>> {
  const cached = serverCache.get<Record<string, string>>(CACHE_KEY_ADS);
  if (cached) return cached;

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: AD_SETTING_KEYS } },
  });

  const map: Record<string, string> = {
    ad_sticky_enabled: "true",
    ad_sticky_text: "📢 SPECIAL ANNOUNCEMENT: Reach Millions of Readers with Global Awaaz Digital Sponsorships!",
    ad_sticky_link: "/advertise",
    ad_sticky_image: "",
    ad_sticky_bg: "#000000",
    ad_sticky_badge: "SPONSORED",
    ad_leaderboard_enabled: "true",
    ad_leaderboard_image: "",
    ad_leaderboard_title: "GLOBAL AWAAZ DIGITAL MEDIA COVERAGE",
    ad_leaderboard_subtitle: "Get real-time news updates across Bihar, Jharkhand & National headlines 24/7",
    ad_leaderboard_link: "/advertise",
    ad_leaderboard_btn_text: "Advertise With Us",
    ad_leaderboard_badge: "ADVERTISEMENT",
    ad_leaderboard_height: "110",
    ad_left_grid_enabled: "true",
    ad_left_grid_image: "",
    ad_left_grid_title: "GLOBAL AWAAZ SPONSORSHIP",
    ad_left_grid_subtitle: "Promote your brand to millions of readers across Bihar, Jharkhand & India.",
    ad_left_grid_link: "/advertise",
    ad_left_grid_btn_text: "Advertise With Us",
    ad_left_grid_badge: "SPONSORED",
    ad_portal_whatsapp: "+91 98765 43210",
    ad_portal_whatsapp_msg: "Hello Global Awaaz, I want to inquire about advertising opportunities.",
    ad_portal_live_status: "Live Ad Desk Active",
    ad_portal_live_enabled: "true",
    ad_portal_email: "advertise@globalawaaz.com",
    ad_portal_location: "Patna, Bihar & Ranchi, Jharkhand",
    ad_portal_turnaround: "Fast 2-Hour Proposal Turnaround",
  };

  for (const s of settings) {
    if (s.key === "ad_sticky_bg" && s.value.includes("#1e293b")) {
      map[s.key] = "#000000";
    } else {
      map[s.key] = s.value;
    }
  }

  serverCache.set(CACHE_KEY_ADS, map, TTL.SETTINGS);
  return map;
}

export async function saveAdSettings(pairs: { key: string; value: string }[]): Promise<{ count: number }> {
  let count = 0;
  for (const { key, value } of pairs) {
    if (!AD_SETTING_KEYS.includes(key)) continue;

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value), label: key, group: "advertisements" },
    });
    count++;
  }

  serverCache.delete(CACHE_KEY_ADS);
  return { count };
}

export async function deleteAdSetting(key?: string | null): Promise<boolean> {
  if (key && AD_SETTING_KEYS.includes(key)) {
    await prisma.siteSetting.deleteMany({ where: { key } });
  } else {
    await prisma.siteSetting.deleteMany({ where: { key: { in: AD_SETTING_KEYS } } });
  }
  serverCache.delete(CACHE_KEY_ADS);
  return true;
}
