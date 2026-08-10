"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Mail,
  Phone,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  MoveUp,
  MoveDown,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Loader2,
  GraduationCap,
  Briefcase,
  X
} from "lucide-react";
import { convertImageToWebP } from "@/lib/webpConverter";

interface TeamMember {
  id: string;
  name: string;
  nameHi?: string;
  designation: string;
  designationHi?: string;
  bio?: string;
  bioHi?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  education?: string;
  experience?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nameHi: "",
    designation: "",
    designationHi: "",
    bio: "",
    bioHi: "",
    avatar: "",
    email: "",
    phone: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    education: "",
    experience: "",
    order: 0,
    isActive: true,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/team?admin=true");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMembers(json.data);
        }
      }
    } catch (err) {
      showToast("Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      nameHi: "",
      designation: "",
      designationHi: "",
      bio: "",
      bioHi: "",
      avatar: "",
      email: "",
      phone: "",
      twitter: "",
      linkedin: "",
      facebook: "",
      instagram: "",
      education: "",
      experience: "",
      order: members.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name || "",
      nameHi: member.nameHi || "",
      designation: member.designation || "",
      designationHi: member.designationHi || "",
      bio: member.bio || "",
      bioHi: member.bioHi || "",
      avatar: member.avatar || "",
      email: member.email || "",
      phone: member.phone || "",
      twitter: member.twitter || "",
      linkedin: member.linkedin || "",
      facebook: member.facebook || "",
      instagram: member.instagram || "",
      education: member.education || "",
      experience: member.experience || "",
      order: member.order ?? 0,
      isActive: member.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploadingImage(true);
    try {
      const file = await convertImageToWebP(rawFile);
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/v1/media/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          setFormData((prev) => ({ ...prev, avatar: json.data.url }));
          showToast("Profile photo uploaded & optimized to WebP successfully!");
        } else {
          showToast(json.message || "Image upload failed", "error");
        }
      }
    } catch (err: any) {
      showToast("Error uploading image: " + err.message, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) {
      showToast("Name and Designation are required!", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...formData,
      };

      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(editingId ? "Team member updated!" : "New team member added!");
          setIsModalOpen(false);
          fetchMembers();
        } else {
          showToast(json.message || "Failed to save member", "error");
        }
      }
    } catch (err: any) {
      showToast("Server error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove '${name}' from the team?`)) return;

    try {
      const res = await fetch(`/api/v1/team?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(`Team member '${name}' removed.`);
          fetchMembers();
        } else {
          showToast(json.message || "Failed to delete", "error");
        }
      }
    } catch (err: any) {
      showToast("Delete error: " + err.message, "error");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl font-medium flex items-center gap-3 transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border border-emerald-500"
              : "bg-red-600 text-white border border-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/admin"
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-red-600" />
                Team Management
              </h1>
            </div>
            <p className="text-slate-500 text-sm ml-11 font-normal">
              Add, edit, or manage editorial team members, reporters, & leadership profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/team"
              target="_blank"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition border border-slate-200 flex items-center gap-2"
            >
              View Public Team Page
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-red-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          </div>
        </div>

        {/* Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
              Total Members: <strong className="text-slate-900">{members.length}</strong>
            </span>
            <button
              onClick={fetchMembers}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm transition border border-slate-200"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Member Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-sm font-medium">Loading team members from database...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Team Members Found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {searchQuery ? "No members match your search criteria." : "Start building your team by adding the first member."}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm inline-flex items-center gap-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="relative">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-red-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-black text-red-600">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          member.isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                        title={member.isActive ? "Active Profile" : "Inactive"}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Edit Member"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-100"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition">
                        {member.name}
                      </h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                        #{member.order}
                      </span>
                    </div>
                    {member.nameHi && (
                      <p className="text-xs text-slate-500 font-sans mb-1">{member.nameHi}</p>
                    )}
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mt-1 bg-red-50 border border-red-100 px-2 py-0.5 rounded inline-block">
                      {member.designation}
                    </p>
                    {member.designationHi && (
                      <p className="text-xs text-slate-500 mt-1">{member.designationHi}</p>
                    )}
                  </div>

                  {/* Education & Experience Badges */}
                  {(member.education || member.experience) && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                      {member.education && (
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-red-600" />
                          {member.education}
                        </span>
                      )}
                      {member.experience && (
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-red-600" />
                          {member.experience}
                        </span>
                      )}
                    </div>
                  )}

                  {member.bio && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed border-t border-slate-100 pt-3">
                      {member.bio}
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 space-y-2">
                  {member.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.facebook && (
                      <a href={member.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-700 transition">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Light Mode Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                {editingId ? "Edit Team Member" : "Add New Team Member"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Profile Photo / Avatar (Auto-optimized WebP)
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-500/50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Upload className="w-4 h-4 text-red-600" />}
                      <span>{uploadingImage ? "Optimizing & Uploading..." : "Choose Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter Image URL directly..."
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (English) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (Hindi)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. रमेश शर्मा"
                    value={formData.nameHi}
                    onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Role (English) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Editor / Senior Journalist"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Role (Hindi)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. मुख्य संपादक / वरिष्ठ पत्रकार"
                    value={formData.designationHi}
                    onChange={(e) => setFormData({ ...formData, designationHi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Education & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Education / Qualifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M.A. Journalism / BJMC"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience / Background
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ Years in Media & News"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="editor@globalawaaz.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={3}
                    placeholder="Brief background summary..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 resize-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bio (Hindi)</label>
                  <textarea
                    rows={3}
                    placeholder="संक्षिप्त विवरण..."
                    value={formData.bioHi}
                    onChange={(e) => setFormData({ ...formData, bioHi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 resize-none font-medium"
                  />
                </div>
              </div>

              {/* Social Handles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Twitter URL</label>
                  <input
                    type="text"
                    placeholder="https://x.com/..."
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Facebook URL</label>
                  <input
                    type="text"
                    placeholder="https://facebook.com/..."
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Order & Active */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Display Order:</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 text-center font-bold"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded bg-white border-slate-300 focus:ring-red-500"
                  />
                  <span>Active Profile (Visible on Public Team Page)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-red-600/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? "Save Changes" : "Create Team Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

