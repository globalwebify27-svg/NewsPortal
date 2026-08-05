"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  MessageCircle,
  FileText,
  Users,
  Globe,
  Share2,
  Award,
  Zap,
  Layout,
  Smartphone,
  Sidebar as SidebarIcon,
  Video,
  Sparkles,
  Send,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  HelpCircle,
  Check,
  Building,
  User,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock
} from "lucide-react";

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    brandName: "",
    contactPerson: "",
    mobileNumber: "",
    email: "",
    cityState: "",
    adType: "",
    campaignDetails: "",
    agreeContact: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedAdTypeChip, setSelectedAdTypeChip] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === "adType") {
        setSelectedAdTypeChip(value);
      }
    }
  };

  const selectChip = (optionValue: string) => {
    setSelectedAdTypeChip(optionValue);
    setFormData(prev => ({ ...prev, adType: optionValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.contactPerson || !formData.mobileNumber || !formData.agreeContact) {
      setToastMessage("⚠️ Please fill in all required fields and check the agreement box.");
      setTimeout(() => setToastMessage(""), 4000);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setToastMessage("🎉 Proposal inquiry sent successfully! Our advertising team will contact you shortly.");
      setFormData({
        brandName: "",
        contactPerson: "",
        mobileNumber: "",
        email: "",
        cityState: "",
        adType: "",
        campaignDetails: "",
        agreeContact: false
      });
      setSelectedAdTypeChip("");
      setTimeout(() => setToastMessage(""), 5000);
    }, 800);
  };

  const scrollToForm = () => {
    const el = document.getElementById("proposal-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", color: "#0f172a", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#0f172a",
            color: "#ffffff",
            border: "2px solid #e50914",
            padding: "16px 24px",
            borderRadius: "14px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            zIndex: 99999,
            fontWeight: 700,
            fontSize: "0.92rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backdropFilter: "blur(12px)"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ─── HERO HEADER SECTION ──────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #111827 50%, #0f172a 100%)",
          color: "#ffffff",
          padding: "85px 20px 95px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          borderBottom: "4px solid #e50914"
        }}
      >
        {/* Background Ambient Glow Effects */}
        <div style={{ position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)", width: "750px", height: "450px", background: "radial-gradient(circle, rgba(229,9,20,0.25) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", bottom: "-80px", right: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(37,211,102,0.12) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }}></div>

        <div style={{ maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 2 }}>

          {/* Premium Capsule Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(229, 9, 20, 0.12)",
              border: "1px solid rgba(229, 9, 20, 0.4)",
              color: "#ff4d4d",
              padding: "7px 18px",
              borderRadius: "30px",
              fontSize: "0.82rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              marginBottom: "24px",
              textTransform: "uppercase",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 15px rgba(229, 9, 20, 0.15)"
            }}
          >
            <Megaphone size={15} /> Enterprise Advertising Portal
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              margin: "0 0 18px 0",
              lineHeight: "1.15",
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            Advertise With <span style={{ color: "#e50914", background: "linear-gradient(135deg, #ef4444 0%, #e50914 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GLOBAL AWAAZ</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1.25rem",
              color: "#cbd5e1",
              maxWidth: "720px",
              margin: "0 auto 40px auto",
              lineHeight: "1.6",
              fontWeight: 500
            }}
          >
            Reach readers across Bihar and Jharkhand through our digital news platform.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/919876543210?text=Hello%20Global%20Awaaz,%20I%20want%20to%20advertise%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #1da851 100%)",
                color: "#ffffff",
                padding: "15px 32px",
                borderRadius: "30px",
                fontWeight: 800,
                fontSize: "0.98rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 8px 25px rgba(37,211,102,0.35)",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <MessageCircle size={19} /> Chat on WhatsApp
            </a>

            <button
              onClick={scrollToForm}
              style={{
                background: "linear-gradient(135deg, #e50914 0%, #b91c1c 100%)",
                color: "#ffffff",
                border: "none",
                padding: "15px 32px",
                borderRadius: "30px",
                fontWeight: 800,
                fontSize: "0.98rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 8px 25px rgba(229,9,20,0.38)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <FileText size={19} /> Request Proposal
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "50px", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px" }}>
            {[
              { label: "Regional Readership", val: "2.5M+ Readers" },
              { label: "Primary Coverage", val: "Bihar & Jharkhand" },
              { label: "Ad Response Time", val: "Under 2 Hours" }
            ].map((m, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
                <CheckCircle size={15} style={{ color: "#25D366" }} />
                <span><strong style={{ color: "#ffffff", fontWeight: 800 }}>{m.val}</strong> — {m.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── MAIN CONTENT CONTAINER ───────────────────────────────────────────── */}
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "70px 20px" }}>

        {/* ─── WHY BUSINESSES CHOOSE US ────────────────────────────────────────── */}
        <section style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.08em" }}>Proven Media Reach</span>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 900, color: "#0f172a", margin: "6px 0 10px 0", letterSpacing: "-0.02em" }}>
              Why businesses choose us
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.02rem", margin: 0, maxWidth: "600px", marginInline: "auto" }}>
              Targeted digital promotion connecting national & regional brands directly with active news consumers.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "22px" }}>
            {[
              { num: "01", title: "Local Bihar & Jharkhand audience", icon: MapPin, desc: "Direct reach in Patna, Ranchi, Gaya, Muzaffarpur, Dhanbad, Jamshedpur & Bhagalpur." },
              { num: "02", title: "Hindi news readers", icon: Globe, desc: "Deep engagement with native Hindi readers who check daily regional & local headlines." },
              { num: "03", title: "Website + social media promotion", icon: Share2, desc: "Cross-channel campaign reach spanning news portal, mobile web, WhatsApp & social feeds." },
              { num: "04", title: "Sponsored articles and banner opportunities", icon: Award, desc: "High-impact leaderboard banners, sidebar sticky units & custom editorial stories." },
              { num: "05", title: "Quick campaign support", icon: Zap, desc: "Dedicated media account strategist for instant ad setup, design assistance & reports." }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderTop: "4px solid #e50914",
                    borderRadius: "18px",
                    padding: "26px 20px",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.04)",
                    transition: "all 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 14px 35px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,0,0,0.04)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(229, 9, 20, 0.08)", color: "#e50914", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconComp size={23} />
                    </div>
                    <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#cbd5e1" }}>{item.num}</span>
                  </div>

                  <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px 0", lineHeight: "1.35" }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: "0.87rem", color: "#64748b", margin: 0, lineHeight: "1.6" }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>


        {/* ─── ADVERTISING OPPORTUNITIES GRID ─────────────────────────────────── */}
        <section style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.08em" }}>Flexible Formats</span>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 900, color: "#0f172a", margin: "6px 0 10px 0", letterSpacing: "-0.02em" }}>
              Advertising opportunities
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.02rem", margin: 0 }}>
              Select high-performing display banner placements or editorial content sponsorships.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "26px" }}>
            {[
              { title: "Homepage Banner", icon: Layout, tag: "High Visibility", desc: "Top header leaderboard banner placed prominently above main headlines for maximum brand recall." },
              { title: "Sidebar Banner", icon: SidebarIcon, tag: "High CTR", desc: "Sticky right-hand rail ad unit visible continuously as readers scroll through news articles." },
              { title: "Mobile Banner", icon: Smartphone, tag: "Mobile First", desc: "Optimized mobile web banner units tailored for 85%+ smartphone news readers." },
              { title: "Sponsored News Article", icon: FileText, tag: "Editorial Trust", desc: "Custom brand narrative or press release written in editorial style with SEO backlinks." },
              { title: "Video Promotion", icon: Video, tag: "Engagement", desc: "Short video ad placement integrated inside video news reels and ground reports." },
              { title: "Festival Campaigns", icon: Sparkles, tag: "Special Offer", desc: "Custom festive packages for Chhath Puja, Diwali, Holi, Durga Puja & New Year sales." }
            ].map((op, i) => {
              const OpIcon = op.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.03)",
                    transition: "all 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,0,0,0.03)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <OpIcon size={23} />
                      </div>
                      <span style={{ background: "rgba(229,9,20,0.08)", color: "#e50914", border: "1px solid rgba(229,9,20,0.2)", fontSize: "0.74rem", fontWeight: 800, padding: "5px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {op.tag}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px 0" }}>
                      {op.title}
                    </h3>

                    <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0, lineHeight: "1.6" }}>
                      {op.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: "22px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => {
                        selectChip(op.title);
                        scrollToForm();
                      }}
                      style={{ background: "transparent", border: "none", color: "#e50914", fontWeight: 800, fontSize: "0.84rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}
                    >
                      Select This Format →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ─── REQUEST PROPOSAL FORM & CONTACT SECTION ───────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "40px" }} id="proposal-form-section">

          {/* Proposal Request Form */}
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ marginBottom: "30px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#e50914", textTransform: "uppercase", letterSpacing: "0.08em" }}>Custom Media Kit</span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", margin: "4px 0 6px 0", letterSpacing: "-0.02em" }}>
                Request an advertising proposal
              </h2>
              <p style={{ fontSize: "0.92rem", color: "#64748b", margin: 0 }}>
                Fill out the campaign details below and our media advertising team will send custom proposal pricing.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                    Business / Brand Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Building size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      placeholder="e.g. Acme Retailers"
                      style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", outline: "none", fontWeight: 600, color: "#0f172a" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                    Contact Person *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Your Full Name"
                      style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", outline: "none", fontWeight: 600, color: "#0f172a" }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                    Mobile Number *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", outline: "none", fontWeight: 600, color: "#0f172a" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@business.com"
                      style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", outline: "none", fontWeight: 600, color: "#0f172a" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                    City / State
                  </label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="cityState"
                      value={formData.cityState}
                      onChange={handleInputChange}
                      placeholder="e.g. Patna, Bihar"
                      style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", outline: "none", fontWeight: 600, color: "#0f172a" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                    Type of Advertisement
                  </label>
                  <select
                    name="adType"
                    value={formData.adType}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "13px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", background: "#ffffff", color: "#0f172a", outline: "none", fontWeight: 600 }}
                  >
                    <option value="">Select an option</option>
                    <option value="Homepage Banner">Homepage Banner</option>
                    <option value="Sidebar Banner">Sidebar Banner</option>
                    <option value="Mobile Banner">Mobile Banner</option>
                    <option value="Sponsored News Article">Sponsored News Article</option>
                    <option value="Video Promotion">Video Promotion</option>
                    <option value="Festival Campaigns">Festival Campaigns</option>
                    <option value="Full Brand Takeover">Full Brand Takeover</option>
                  </select>
                </div>
              </div>

              {/* Quick Select Chips */}
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "8px" }}>Quick Format Selection:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["Homepage Banner", "Sidebar Banner", "Mobile Banner", "Sponsored News Article", "Video Promotion", "Festival Campaigns"].map((chip) => {
                    const isSelected = selectedAdTypeChip === chip || formData.adType === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => selectChip(chip)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: isSelected ? 800 : 600,
                          border: isSelected ? "2px solid #e50914" : "1px solid #cbd5e1",
                          background: isSelected ? "rgba(229,9,20,0.08)" : "#f8fafc",
                          color: isSelected ? "#e50914" : "#475569",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "7px" }}>
                  Tell us about your campaign
                </label>
                <textarea
                  name="campaignDetails"
                  rows={4}
                  value={formData.campaignDetails}
                  onChange={handleInputChange}
                  placeholder="Share details about your campaign dates, target budget, or specific promotion goals..."
                  style={{ width: "100%", padding: "13px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "0.92rem", outline: "none", resize: "vertical", fontWeight: 500 }}
                ></textarea>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <input
                  type="checkbox"
                  id="agreeContact"
                  name="agreeContact"
                  checked={formData.agreeContact}
                  onChange={handleInputChange}
                  style={{ marginTop: "2px", width: "19px", height: "19px", accentColor: "#e50914", cursor: "pointer" }}
                  required
                />
                <label htmlFor="agreeContact" style={{ fontSize: "0.87rem", color: "#334155", fontWeight: 700, cursor: "pointer", lineHeight: "1.4" }}>
                  I agree to be contacted regarding advertising opportunities.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: "linear-gradient(135deg, #e50914 0%, #b91c1c 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "16px 32px",
                  borderRadius: "14px",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 8px 25px rgba(229,9,20,0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"} <Send size={19} />
              </button>
            </form>
          </section>


          {/* Immediate Assistance Contact Sidebar */}
          <aside>
            <div
              style={{
                background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                borderRadius: "24px",
                padding: "36px 28px",
                boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                position: "sticky",
                top: "100px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              {/* Live Desk Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)", padding: "4px 12px", borderRadius: "20px", width: "fit-content", marginBottom: "16px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#25D366", boxShadow: "0 0 8px #25D366" }}></span>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#25D366", textTransform: "uppercase" }}>Live Ad Desk Active</span>
              </div>

              <h3 style={{ fontSize: "1.35rem", fontWeight: 900, margin: "0 0 22px 0", color: "#ffffff", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "14px" }}>
                Need immediate assistance?
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(37,211,102,0.18)", color: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>WhatsApp:</span>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", fontWeight: 900, fontSize: "1.08rem", textDecoration: "none", display: "inline-block", marginTop: "2px" }}>
                      +91 XXXXX XXXXX
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(229,9,20,0.18)", color: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email:</span>
                    <a href="mailto:advertise@globalawaaz.com" style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.98rem", textDecoration: "none", display: "inline-block", marginTop: "2px" }}>
                      advertise@globalawaaz.com
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(59,130,246,0.18)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Location:</span>
                    <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.98rem", display: "block", marginTop: "2px" }}>
                      Patna, Bihar
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "12px", fontWeight: 600 }}>Fast 2-Hour Proposal Turnaround</span>
                <a
                  href="https://wa.me/919876543210?text=I%20want%20to%20advertise"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", background: "#25D366", color: "#ffffff", padding: "12px 18px", borderRadius: "25px", fontWeight: 800, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 6px 20px rgba(37,211,102,0.3)" }}
                >
                  <MessageCircle size={16} /> Quick WhatsApp Chat
                </a>
              </div>
            </div>
          </aside>

        </div>

      </div>

    </div>
  );
}
