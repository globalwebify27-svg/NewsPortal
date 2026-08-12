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
  Clock,
  ChevronRight,
  Target,
  BarChart3
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

  const [portalSettings, setPortalSettings] = useState({
    whatsapp: "+91 98765 43210",
    whatsappMsg: "Hello Global Awaaz, I want to inquire about advertising opportunities.",
    liveStatus: "Live Ad Desk Active",
    liveEnabled: "true",
    email: "advertise@globalawaaz.com",
    location: "Patna, Bihar & Ranchi, Jharkhand",
    turnaround: "Fast 2-Hour Proposal Turnaround"
  });

  React.useEffect(() => {
    fetch("/api/v1/ad-settings")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data) {
          setPortalSettings({
            whatsapp: json.data.ad_portal_whatsapp || "+91 98765 43210",
            whatsappMsg: json.data.ad_portal_whatsapp_msg || "Hello Global Awaaz, I want to inquire about advertising opportunities.",
            liveStatus: json.data.ad_portal_live_status || "Live Ad Desk Active",
            liveEnabled: json.data.ad_portal_live_enabled ?? "true",
            email: json.data.ad_portal_email || "advertise@globalawaaz.com",
            location: json.data.ad_portal_location || "Patna, Bihar & Ranchi, Jharkhand",
            turnaround: json.data.ad_portal_turnaround || "Fast 2-Hour Proposal Turnaround"
          });
        }
      })
      .catch(() => {});
  }, []);

  const cleanWaNumber = (portalSettings.whatsapp || "").replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${cleanWaNumber || "919876543210"}?text=${encodeURIComponent(portalSettings.whatsappMsg)}`;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "adType") {
        setSelectedAdTypeChip(value);
      }
    }
  };

  const selectChip = (optionValue: string) => {
    setSelectedAdTypeChip(optionValue);
    setFormData((prev) => ({ ...prev, adType: optionValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.contactPerson || !formData.mobileNumber || !formData.agreeContact) {
      setToastMessage("⚠️ Please fill in all required fields and check the agreement box.");
      setTimeout(() => setToastMessage(""), 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/advertise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        setToastMessage("🎉 " + (json.message || "Proposal inquiry sent successfully! Our advertising team will contact you shortly."));
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
      } else {
        setToastMessage("❌ " + (json.message || "Failed to submit proposal inquiry. Please try again."));
      }
    } catch (err: any) {
      setToastMessage("❌ Error sending inquiry: " + (err?.message || "Server error"));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(""), 6000);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById("proposal-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-600 selection:text-white pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-7 right-7 bg-slate-900 text-white border-2 border-red-600 px-6 py-4 rounded-2xl shadow-2xl z-[99999] font-bold text-sm flex items-center gap-3 backdrop-blur-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* ─── NEW CLEAN & SIMPLE HERO SECTION ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-slate-50 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="absolute top-0 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tag Capsule */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
            <Megaphone className="w-4 h-4 text-red-600" />
            <span>Enterprise Advertising Portal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4 max-w-4xl mx-auto">
            Advertise With <span className="text-red-600">GLOBAL AWAAZ</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Reach engaged readers across Bihar and Jharkhand through India's trusted digital news platform.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
              <ChevronRight className="w-4 h-4" />
            </a>

            <button
              onClick={scrollToForm}
              className="px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition shadow-md shadow-red-600/20 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Request Proposal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Clean Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2.5M+</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Monthly Readers</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Bihar & Jharkhand</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Primary Regional Reach</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 fill-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Under 2 Hours</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Fast Response Guarantee</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">High Engagement</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Targeted Display & Video</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT SECTION CONTAINER ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-16">
        {/* ─── ADVERTISING OPPORTUNITIES GRID ─────────────────────────────────── */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-100/80 px-3 py-1 rounded-full border border-red-200">
              High-Impact Placement Options
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-2">
              Advertising Opportunities
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Select high-performing display banner placements or editorial content sponsorships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Homepage Leaderboard Banner",
                icon: Layout,
                tag: "High Visibility",
                desc: "Top header leaderboard banner placed prominently above main headlines for maximum brand recall."
              },
              {
                title: "Sidebar Sticky Banner",
                icon: SidebarIcon,
                tag: "High CTR",
                desc: "Sticky right-hand rail ad unit visible continuously as readers scroll through news articles."
              },
              {
                title: "Mobile Web Banner",
                icon: Smartphone,
                tag: "Mobile First",
                desc: "Optimized mobile web banner units tailored for 85%+ smartphone news readers."
              },
              {
                title: "Sponsored Editorial Article",
                icon: FileText,
                tag: "Editorial Trust",
                desc: "Custom brand narrative or press release written in editorial style with permanent SEO backlinks."
              },
              {
                title: "Video News Promotion",
                icon: Video,
                tag: "High Engagement",
                desc: "Short video ad placement integrated inside central video reels and ground reporting coverage."
              },
              {
                title: "Festive & Event Campaigns",
                icon: Sparkles,
                tag: "Special Offer",
                desc: "Custom festive packages for Chhath Puja, Diwali, Holi, Durga Puja & New Year sales promotions."
              }
            ].map((op, i) => {
              const OpIcon = op.icon;
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-red-400 hover:shadow-xl transition duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition">
                        <OpIcon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {op.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition mb-2">
                      {op.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {op.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        selectChip(op.title);
                        scrollToForm();
                      }}
                      className="text-red-600 font-bold text-xs hover:text-red-700 transition flex items-center gap-1.5"
                    >
                      <span>Select Format</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── REQUEST PROPOSAL FORM & CONTACT SECTION ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="proposal-form-section">
          {/* Proposal Request Form */}
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="mb-8 pb-6 border-b border-slate-100">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                Custom Media Kit
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-2">
                Request an Advertising Proposal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Fill out the campaign details below and our media advertising team will send custom proposal pricing within 2 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Business / Brand Name *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      placeholder="e.g. Acme Retailers"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Contact Person *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Your Full Name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@business.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    City / State
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="cityState"
                      value={formData.cityState}
                      onChange={handleInputChange}
                      placeholder="e.g. Patna, Bihar"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Type of Advertisement
                  </label>
                  <select
                    name="adType"
                    value={formData.adType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium"
                  >
                    <option value="">Select an option</option>
                    <option value="Homepage Leaderboard Banner">Homepage Leaderboard Banner</option>
                    <option value="Sidebar Sticky Banner">Sidebar Sticky Banner</option>
                    <option value="Mobile Web Banner">Mobile Web Banner</option>
                    <option value="Sponsored Editorial Article">Sponsored Editorial Article</option>
                    <option value="Video News Promotion">Video News Promotion</option>
                    <option value="Festive & Event Campaigns">Festive & Event Campaigns</option>
                  </select>
                </div>
              </div>

              {/* Format Chips */}
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-2">
                  Quick Format Selection:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Homepage Leaderboard Banner",
                    "Sidebar Sticky Banner",
                    "Mobile Web Banner",
                    "Sponsored Editorial Article",
                    "Video News Promotion"
                  ].map((chip) => {
                    const isSelected = selectedAdTypeChip === chip || formData.adType === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => selectChip(chip)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-red-50 border-red-500 text-red-600 font-bold"
                            : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Tell us about your campaign
                </label>
                <textarea
                  name="campaignDetails"
                  rows={4}
                  value={formData.campaignDetails}
                  onChange={handleInputChange}
                  placeholder="Share details about your campaign dates, target budget, or promotion goals..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition font-medium resize-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="agreeContact"
                  name="agreeContact"
                  checked={formData.agreeContact}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  required
                />
                <label htmlFor="agreeContact" className="text-xs text-slate-700 font-medium cursor-pointer">
                  I agree to be contacted regarding advertising opportunities on Global Awaaz.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Sending Inquiry..." : "Send Proposal Inquiry"}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>

          {/* Contact Assistance Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 sticky top-24 shadow-xl space-y-6">
              {/* Active Badge */}
              {portalSettings.liveEnabled === "true" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{portalSettings.liveStatus}</span>
                </div>
              )}

              <h3 className="text-xl font-black text-white border-b border-slate-800 pb-4">
                Need Immediate Assistance?
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      WhatsApp Ad Desk:
                    </span>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-bold text-sm hover:text-emerald-400 transition inline-block mt-0.5"
                    >
                      {portalSettings.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Email Address:
                    </span>
                    <a
                      href={`mailto:${portalSettings.email}`}
                      className="text-white font-bold text-sm hover:text-red-400 transition inline-block mt-0.5"
                    >
                      {portalSettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Head Office:
                    </span>
                    <span className="text-white font-bold text-sm block mt-0.5">
                      {portalSettings.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-center space-y-3">
                <span className="text-xs text-slate-400 block font-medium">
                  {portalSettings.turnaround}
                </span>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Quick WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
