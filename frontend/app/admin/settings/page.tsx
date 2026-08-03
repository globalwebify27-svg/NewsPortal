"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Upload,
  Image as ImageIcon2,
  RotateCcw,
  Sliders,
  MoveHorizontal,
  Link2,
  Eye,
  Check,
  Globe,
  Share2,
  Sparkles,
  Search,
  Plus,
  Trash2,
  FileText
} from "lucide-react";

export default function AdminSettingsPage() {
  // Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Site Logo Settings State
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [logoInputUrl, setLogoInputUrl] = useState("");
  const [logoSize, setLogoSize] = useState<number>(64);
  const [logoMarginLeft, setLogoMarginLeft] = useState<number>(75);

  // Social Media Links State
  const [socialFb, setSocialFb] = useState("https://facebook.com");
  const [socialTwitter, setSocialTwitter] = useState("https://twitter.com");
  const [socialYt, setSocialYt] = useState("https://youtube.com");
  const [socialInsta, setSocialInsta] = useState("https://instagram.com");
  const [socialLinkedin, setSocialLinkedin] = useState("https://linkedin.com");

  // Company Footer Links State
  const [companyLinks, setCompanyLinks] = useState<Array<{ id: string; nameHi: string; nameEn: string; href: string }>>([
    { id: "1", nameHi: "हमारे बारे में", nameEn: "About Us", href: "/#about" },
    { id: "2", nameHi: "करियर", nameEn: "Careers", href: "/#careers" },
    { id: "3", nameHi: "गोपनीयता नीति", nameEn: "Privacy Policy", href: "/#privacy" },
    { id: "4", nameHi: "सेवा की शर्तें", nameEn: "Terms of Service", href: "/#terms" },
    { id: "5", nameHi: "संपर्क करें", nameEn: "Contact Us", href: "/#contact" },
    { id: "6", nameHi: "विज्ञापन दें", nameEn: "Advertise", href: "/#advertise" }
  ]);

  const [newLinkHi, setNewLinkHi] = useState("");
  const [newLinkEn, setNewLinkEn] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem("ga_custom_site_logo");
      if (storedLogo) {
        setSiteLogoUrl(storedLogo);
        if (!storedLogo.startsWith("data:image")) {
          setLogoInputUrl(storedLogo);
        }
      }
      const storedSize = localStorage.getItem("ga_custom_logo_size");
      if (storedSize) {
        setLogoSize(parseInt(storedSize, 10) || 64);
      }
      const storedMargin = localStorage.getItem("ga_custom_logo_margin");
      if (storedMargin) {
        setLogoMarginLeft(parseInt(storedMargin, 10) || 75);
      }

      const storedSocial = localStorage.getItem("ga_social_links");
      if (storedSocial) {
        const parsed = JSON.parse(storedSocial);
        if (parsed.facebook) setSocialFb(parsed.facebook);
        if (parsed.twitter) setSocialTwitter(parsed.twitter);
        if (parsed.youtube) setSocialYt(parsed.youtube);
        if (parsed.instagram) setSocialInsta(parsed.instagram);
        if (parsed.linkedin) setSocialLinkedin(parsed.linkedin);
      }

      const storedCompany = localStorage.getItem("ga_company_footer_links");
      if (storedCompany) {
        const parsed = JSON.parse(storedCompany);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCompanyLinks(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const handleAddCompanyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkHi.trim() || !newLinkEn.trim()) {
      showToast("Both Hindi and English link names are required!");
      return;
    }

    const newLink = {
      id: `link_${Date.now()}`,
      nameHi: newLinkHi.trim(),
      nameEn: newLinkEn.trim(),
      href: newLinkUrl.trim() || "/#custom"
    };

    const updated = [...companyLinks, newLink];
    setCompanyLinks(updated);
    localStorage.setItem("ga_company_footer_links", JSON.stringify(updated));
    window.dispatchEvent(new Event("ga_company_links_changed"));
    showToast(`✓ Footer link "${newLinkHi}" added successfully!`);

    setNewLinkHi("");
    setNewLinkEn("");
    setNewLinkUrl("");
  };

  const handleDeleteCompanyLink = (id: string, nameHi: string) => {
    const updated = companyLinks.filter(l => l.id !== id);
    setCompanyLinks(updated);
    localStorage.setItem("ga_company_footer_links", JSON.stringify(updated));
    window.dispatchEvent(new Event("ga_company_links_changed"));
    showToast(`Footer link "${nameHi}" deleted.`);
  };

  const handleUpdateLogoSize = (newSize: number) => {
    setLogoSize(newSize);
    localStorage.setItem("ga_custom_logo_size", newSize.toString());
    window.dispatchEvent(new Event("ga_logo_updated"));
  };

  const handleUpdateLogoMargin = (newMargin: number) => {
    setLogoMarginLeft(newMargin);
    localStorage.setItem("ga_custom_logo_margin", newMargin.toString());
    window.dispatchEvent(new Event("ga_logo_updated"));
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSiteLogoUrl(base64);
        setLogoInputUrl("");
        localStorage.setItem("ga_custom_site_logo", base64);
        window.dispatchEvent(new Event("ga_logo_updated"));
        showToast("✓ Custom Site Logo uploaded & applied globally!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogoUrl = () => {
    if (!logoInputUrl.trim()) {
      localStorage.removeItem("ga_custom_site_logo");
      setSiteLogoUrl("");
      window.dispatchEvent(new Event("ga_logo_updated"));
      showToast("Logo reset to default emblem!");
      return;
    }
    setSiteLogoUrl(logoInputUrl.trim());
    localStorage.setItem("ga_custom_site_logo", logoInputUrl.trim());
    window.dispatchEvent(new Event("ga_logo_updated"));
    showToast("✓ Custom Logo URL saved & updated globally!");
  };

  const handleResetLogo = () => {
    localStorage.removeItem("ga_custom_site_logo");
    setSiteLogoUrl("");
    setLogoInputUrl("");
    window.dispatchEvent(new Event("ga_logo_updated"));
    showToast("Logo reset to default emblem.");
  };

  const handleSaveSocialLinks = () => {
    const payload = {
      facebook: socialFb.trim(),
      twitter: socialTwitter.trim(),
      youtube: socialYt.trim(),
      instagram: socialInsta.trim(),
      linkedin: socialLinkedin.trim()
    };
    localStorage.setItem("ga_social_links", JSON.stringify(payload));
    window.dispatchEvent(new Event("ga_social_links_changed"));
    showToast("✓ Social media links updated successfully!");
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: "2px solid #e50914", padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(229,9,20,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <Check style={{ color: "#22c55e" }} size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Site Logo & Branding Settings Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(220,38,38,0.12)" }}>
              <Settings size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Header Site Logo & Branding Settings
              </h2>
              <p style={{ margin: "3px 0 0 0", fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
                Customize, upload, and fine-tune your portal logo position and sizing in real-time across all devices.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {siteLogoUrl ? (
              siteLogoUrl.startsWith("data:") ? (
                <span style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 6px rgba(16,185,129,0.08)" }}>
                  <Check size={15} strokeWidth={2.5} /> Local Logo Image File Active
                </span>
              ) : (
                <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 6px rgba(59,130,246,0.08)" }}>
                  <Globe size={15} strokeWidth={2.5} /> CDN Image URL Active
                </span>
              )
            ) : (
              <span style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={15} style={{ color: "#e50914" }} strokeWidth={2.5} /> Default Vector Emblem Active
              </span>
            )}
          </div>
        </div>

        {/* LIVE HEADER INTERACTIVE PREVIEW BANNER */}
        <div style={{ background: "#0f172a", borderRadius: "16px", padding: "20px", marginBottom: "32px", boxShadow: "0 8px 24px rgba(15,23,42,0.15)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "6px" }}>
                <Eye size={14} /> Live Interactive Header Banner Simulation
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700 }}>
                Size: <strong style={{ color: "#f87171" }}>{logoSize}px</strong>
              </span>
              <span style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700 }}>
                Position: <strong style={{ color: "#f87171" }}>{logoMarginLeft}px</strong>
              </span>
            </div>
          </div>

          {/* Header Canvas Container */}
          <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
            {/* Header Top Accent Bar */}
            <div style={{ height: "4px", background: "linear-gradient(90deg, #e50914 0%, #16a34a 50%, #e50914 100%)" }} />

            {/* Simulated Header Main Content */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", overflowX: "auto" }}>
              {/* Dynamic Logo & Title Group */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: `${Math.min(logoMarginLeft, 220)}px`, transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{ width: `${logoSize}px`, height: `${logoSize}px`, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  {siteLogoUrl ? (
                    <img src={siteLogoUrl} alt="Live Logo Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%" }}>
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <path d="M 50 5 A 45 45 0 0 0 10 76" fill="none" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
                        <path d="M 90 24 A 45 45 0 0 1 50 95" fill="none" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="37" fill="#ffffff" stroke="#15803d" strokeWidth="2.5" />
                        <g fill="#15803d">
                          <path d="M 30 22 C 38 24 38 32 32 40 C 26 48 34 58 32 72 C 24 64 22 48 24 34 Z" />
                          <path d="M 54 20 C 72 22 76 34 68 44 C 60 54 74 66 64 80 C 50 78 48 62 52 46 Z" />
                        </g>
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "1.35rem", fontWeight: 900, color: "#000000", display: "block", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                    GLOBAL AWAAZ
                  </span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#e50914", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: "2px" }}>
                    — LOCAL से GLOBAL तक —
                  </span>
                </div>
              </div>

              {/* Simulated Navigation items */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", opacity: 0.5, pointerEvents: "none", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                <span>HOME</span>
                <span>INDIA</span>
                <span>WORLD</span>
                <span>VIDEOS</span>
                <Search size={16} />
              </div>
            </div>
          </div>

          {/* Reset Control Bar */}
          <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 500 }}>
              💡 Changes made below update the live portal instantly.
            </span>
            {siteLogoUrl && (
              <button
                onClick={handleResetLogo}
                style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s ease" }}
              >
                <RotateCcw size={13} /> Reset to Default Vector Emblem
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", alignItems: "stretch", marginBottom: "32px" }}>
          {/* Card 1: Logo File & CDN URL */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={16} style={{ color: "#e50914" }} /> 1. Upload or CDN URL
              </h4>

              {/* File Upload Area */}
              <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "18px 14px", textAlign: "center", background: "#ffffff", marginBottom: "16px", transition: "all 0.2s ease" }}>
                <ImageIcon2 size={32} style={{ color: "#94a3b8", marginBottom: "6px" }} />
                <p style={{ margin: "0 0 10px 0", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                  Supports PNG, SVG, JPG, WebP
                </p>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e50914", color: "#ffffff", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,9,20,0.25)" }}>
                  <Upload size={15} /> Choose Logo Image
                  <input type="file" accept="image/*" onChange={handleLogoFileUpload} style={{ display: "none" }} />
                </label>
              </div>

              {/* CDN URL Section */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Or Paste Image / Cloudinary URL
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Link2 size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="https://res.cloudinary.com/.../logo.png"
                      value={logoInputUrl}
                      onChange={(e) => setLogoInputUrl(e.target.value)}
                      style={{ width: "100%", padding: "9px 10px 9px 32px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem", background: "#ffffff", color: "#0f172a" }}
                    />
                  </div>
                  <button
                    onClick={handleSaveLogoUrl}
                    style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
                  >
                    <Check size={14} /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Logo Size Control */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sliders size={16} style={{ color: "#e50914" }} /> 2. Display Size
                </h4>
                <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 800 }}>
                  {logoSize}px
                </span>
              </div>

              <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "#64748b" }}>
                Drag slider or choose a preset to adjust header emblem height & width.
              </p>

              {/* Range Slider */}
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="2"
                  value={logoSize}
                  onChange={(e) => handleUpdateLogoSize(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#e50914", cursor: "pointer", height: "6px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: "4px" }}>
                  <span>30px</span>
                  <span>105px</span>
                  <span>180px</span>
                </div>
              </div>

              {/* Preset Size Buttons */}
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Quick Size Presets:
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { label: "Small (40px)", size: 40 },
                  { label: "Medium (56px)", size: 56 },
                  { label: "Large (80px)", size: 80 },
                  { label: "XL (110px)", size: 110 },
                  { label: "Giant (140px)", size: 140 }
                ].map((p) => (
                  <button
                    key={p.size}
                    onClick={() => handleUpdateLogoSize(p.size)}
                    style={{
                      background: logoSize === p.size ? "#e50914" : "#ffffff",
                      color: logoSize === p.size ? "#ffffff" : "#334155",
                      border: logoSize === p.size ? "1px solid #e50914" : "1px solid #cbd5e1",
                      padding: "5px 10px",
                      borderRadius: "7px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: logoSize === p.size ? "0 2px 8px rgba(229,9,20,0.3)" : "none"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Logo Horizontal Shift/Position */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MoveHorizontal size={16} style={{ color: "#e50914" }} /> 3. Shift Position
                </h4>
                <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 800 }}>
                  {logoMarginLeft}px
                </span>
              </div>

              <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "#64748b" }}>
                Adjust left margin alignment to position logo perfectly in your header.
              </p>

              {/* Position Range Slider */}
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={logoMarginLeft}
                  onChange={(e) => handleUpdateLogoMargin(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#e50914", cursor: "pointer", height: "6px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: "4px" }}>
                  <span>0px</span>
                  <span>125px</span>
                  <span>250px</span>
                </div>
              </div>

              {/* Position Preset Buttons */}
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Position Presets:
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { label: "Left Edge (15px)", margin: 15 },
                  { label: "Default (45px)", margin: 45 },
                  { label: "Shift Right (75px)", margin: 75 },
                  { label: "Far Right (120px)", margin: 120 },
                  { label: "Max Right (180px)", margin: 180 }
                ].map((p) => (
                  <button
                    key={p.margin}
                    onClick={() => handleUpdateLogoMargin(p.margin)}
                    style={{
                      background: logoMarginLeft === p.margin ? "#e50914" : "#ffffff",
                      color: logoMarginLeft === p.margin ? "#ffffff" : "#334155",
                      border: logoMarginLeft === p.margin ? "1px solid #e50914" : "1px solid #cbd5e1",
                      padding: "5px 10px",
                      borderRadius: "7px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: logoMarginLeft === p.margin ? "0 2px 8px rgba(229,9,20,0.3)" : "none"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links Control Box */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
            <Share2 size={16} style={{ color: "#e50914" }} /> Social Media Links (सोशल मीडिया लिंक प्रबंधित करें)
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📘 Facebook URL</label>
              <input
                type="text"
                placeholder="https://facebook.com/yourpage"
                value={socialFb}
                onChange={(e) => setSocialFb(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🐦 Twitter / X URL</label>
              <input
                type="text"
                placeholder="https://twitter.com/yourhandle"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>🔴 YouTube Channel URL</label>
              <input
                type="text"
                placeholder="https://youtube.com/@yourchannel"
                value={socialYt}
                onChange={(e) => setSocialYt(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>📸 Instagram URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/yourprofile"
                value={socialInsta}
                onChange={(e) => setSocialInsta(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", color: "#0a0a0a" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSaveSocialLinks}
              style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,9,20,0.2)" }}
            >
              ✓ Save Social Links
            </button>
          </div>
        </div>

        {/* Company & Custom Pages Footer Links Manager */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} style={{ color: "#e50914" }} /> Company Footer Links & Custom Pages (कंपनी / 'हमारे बारे में' फुटर लिंक)
            </h4>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px" }}>
              {companyLinks.length} Active Footer Pages
            </span>
          </div>

          {/* Add New Link Form */}
          <form onSubmit={handleAddCompanyLink} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr auto", gap: "10px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>Hindi Name (e.g. हमारे बारे में)</label>
              <input
                type="text"
                placeholder="हमारे बारे में"
                value={newLinkHi}
                onChange={(e) => setNewLinkHi(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>English Name (e.g. About Us)</label>
              <input
                type="text"
                placeholder="About Us"
                value={newLinkEn}
                onChange={(e) => setNewLinkEn(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>Target URL / Route</label>
              <input
                type="text"
                placeholder="/#about or /about"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
              />
            </div>
            <button
              type="submit"
              style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "9px 18px", borderRadius: "6px", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={15} /> Add Link
            </button>
          </form>

          {/* Current Active Links List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {companyLinks.map((link) => (
              <div key={link.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                    {link.nameHi} <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>({link.nameEn})</span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 600 }}>
                    Target: {link.href}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCompanyLink(link.id, link.nameHi)}
                  style={{ background: "#fee2e2", color: "#dc2626", border: "none", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Remove Footer Link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
