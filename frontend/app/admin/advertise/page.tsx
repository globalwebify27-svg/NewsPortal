"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Megaphone,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  User,
  FileText,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  RefreshCw,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface AdProposal {
  id: string;
  brandName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  cityState: string;
  adType: string;
  campaignDetails: string;
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

export default function AdminAdvertisePage() {
  const [proposals, setProposals] = useState<AdProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/advertise");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProposals(json.data);
      }
    } catch (err) {
      console.error("Error loading proposals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/v1/advertise", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setProposals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p))
        );
        showToast(`✓ Proposal status updated to '${newStatus}'`);
      } else {
        showToast("❌ Failed to update status");
      }
    } catch (err: any) {
      showToast("❌ Error updating status: " + (err?.message || ""));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal inquiry?")) return;

    try {
      const res = await fetch(`/api/v1/advertise?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setProposals((prev) => prev.filter((p) => p.id !== id));
        showToast("✓ Proposal inquiry deleted successfully!");
      } else {
        showToast("❌ Failed to delete proposal");
      }
    } catch (err: any) {
      showToast("❌ Error deleting proposal: " + (err?.message || ""));
    }
  };

  // Filtered list
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.adType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics counts
  const totalCount = proposals.length;
  const pendingCount = proposals.filter((p) => p.status === "PENDING").length;
  const contactedCount = proposals.filter((p) => p.status === "CONTACTED").length;
  const approvedCount = proposals.filter((p) => p.status === "APPROVED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-7 right-7 bg-slate-900 text-white border-2 border-red-600 px-6 py-4 rounded-2xl shadow-2xl z-[99999] font-bold text-sm flex items-center gap-3 backdrop-blur-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Advertising Proposal Inquiries (विज्ञापन प्रस्ताव अनुरोध)
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm pl-13">
            View, track, and manage all advertising proposal inquiries submitted from the public Advertise page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProposals}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh List</span>
          </button>

          <Link
            href="/admin/ads"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <span>Manage Ad Banners</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
            <h3 className="text-2xl font-black text-slate-900">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <h3 className="text-2xl font-black text-amber-600">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Contacted</span>
            <h3 className="text-2xl font-black text-blue-600">{contactedCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Approved / Active</span>
            <h3 className="text-2xl font-black text-emerald-600">{approvedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Brand, Name, Phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">Filter Status:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "PENDING", "CONTACTED", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  statusFilter === st
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table / Cards View */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-600 mb-3" />
          <p className="font-bold text-sm">Loading Advertising Proposals...</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Proposals Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No proposal inquiries match your current search or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((prop) => {
            const cleanPhone = prop.mobileNumber.replace(/[^0-9]/g, "");
            const whatsappLink = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=Hello%20${encodeURIComponent(
              prop.contactPerson
            )},%20thank%20you%20for%20contacting%20Global%20Awaaz%20Advertising%20Team%20regarding%20${encodeURIComponent(
              prop.brandName
            )}.`;

            return (
              <div
                key={prop.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Brand & Contact Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold rounded-full">
                      {prop.adType || "General Ad Inquiry"}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        prop.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : prop.status === "CONTACTED"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : prop.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-rose-50 text-rose-700 border-rose-300"
                      }`}
                    >
                      ● {prop.status}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(prop.submittedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-slate-400 shrink-0" />
                      <span>{prop.brandName}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Contact Person: {prop.contactPerson}</span>
                    </p>
                  </div>

                  {prop.campaignDetails && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-normal leading-relaxed">
                      <strong>Campaign Details:</strong> {prop.campaignDetails}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {prop.mobileNumber}
                    </span>

                    {prop.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {prop.email}
                      </span>
                    )}

                    {prop.cityState && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {prop.cityState}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    <select
                      value={prop.status}
                      onChange={(e) => handleUpdateStatus(prop.id, e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Client</span>
                    </a>

                    {prop.email && (
                      <a
                        href={`mailto:${prop.email}?subject=Global%20Awaaz%20Advertising%20Proposal`}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200"
                      title="Delete Proposal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
