"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Search,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Building2,
  ChevronRight,
  Send,
  Loader2,
  Users,
  Award
} from "lucide-react";

interface JobOpening {
  id: string;
  title: string;
  titleHi?: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt?: string;
}

export default function CareersPage() {
  const { lang } = useLanguage();
  const isHi = lang === "HI";

  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Application Form
  const [appForm, setAppForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "1-3 Years",
    portfolioUrl: "",
    coverLetter: "",
    resumeUrl: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/careers/jobs");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setJobs(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenApplyModal = (job: JobOpening) => {
    setSelectedJob(job);
    setAppForm({
      fullName: "",
      email: "",
      phone: "",
      experience: "1-3 Years",
      portfolioUrl: "",
      coverLetter: "",
      resumeUrl: "",
    });
    setIsApplying(true);
  };

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/v1/media/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          setAppForm((prev) => ({ ...prev, resumeUrl: json.data.url }));
          showToast(isHi ? "रिज्यूमे फ़ाइल सफलतापूर्वक अपलोड हो गई!" : "Resume uploaded successfully!");
        } else {
          showToast(json.message || "Resume upload failed", "error");
        }
      }
    } catch (err: any) {
      showToast("Error uploading file: " + err.message, "error");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!appForm.fullName.trim() || !appForm.email.trim() || !appForm.phone.trim() || !appForm.resumeUrl.trim()) {
      showToast(isHi ? "कृपया सभी आवश्यक जानकारी एवं रिज्यूमे भरें!" : "Please fill all required fields and upload your resume!", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/careers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          ...appForm,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(
            isHi
              ? "आपका आवेदन सफलतापूर्वक जमा हो गया है! हमारी HR टीम आपसे जल्द ही संपर्क करेगी।"
              : "Application submitted successfully! Our HR team will reach out to you soon."
          );
          setIsApplying(false);
          setSelectedJob(null);
        } else {
          showToast(json.message || "Failed to submit application", "error");
        }
      }
    } catch (err: any) {
      showToast("Server error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const departments = Array.from(new Set(jobs.map((j) => j.department)));

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.titleHi && j.titleHi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "ALL" || j.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl font-medium flex items-center gap-3 transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border border-emerald-500"
              : "bg-red-600 text-white border border-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="flex-1 pb-16">
        {/* Light Mode Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-slate-50 py-8 sm:py-12 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>{isHi ? "GLOBAL AWAAZ करियर पोर्टल" : "Careers at GLOBAL AWAAZ"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 max-w-4xl mx-auto leading-tight">
              {isHi ? (
                <>
                  हमारे साथ जुड़ें और <span className="text-red-600">निष्पक्ष मीडिया</span> का हिस्सा बनें
                </>
              ) : (
                <>
                  Shape the Future of Media with <span className="text-red-600">GLOBAL AWAAZ</span>
                </>
              )}
            </h1>

            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed mb-4">
              {isHi
                ? "संपादकीय, पत्रकारिता, तकनीक, और वीडियो निर्माण क्षेत्र में नए अवसरों की तलाश करें और हमारे डिजिटल मीडिया नेटवर्क के साथ अपना करियर बनाएं।"
                : "Explore current openings in journalism, video production, tech, and digital marketing to build an impactful media career."}
            </p>

            {/* Department Filters Chips (No Search Bar) */}
            {departments.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setSelectedDept("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    selectedDept === "ALL"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {isHi ? "सभी विभाग" : "All Departments"}
                </button>

                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedDept === dept
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Job Openings Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {isHi ? "वर्तमान पद रिक्तियां" : "Open Positions"}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {isHi ? "उपयुक्त पद चुनें और सीधा रिज्यूमे अपलोड करें" : "Select a role below to review requirements and apply directly"}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl shrink-0">
              {filteredJobs.length} {isHi ? "पद उपलब्ध" : "Jobs Available"}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm font-medium">{isHi ? "नौकरियों की सूची लोड की जा रही है..." : "Loading job postings..."}</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                {isHi ? "कोई नौकरी रिक्तता नहीं मिली" : "No Job Openings Found"}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery
                  ? isHi ? "आपकी खोज के अनुसार कोई पद उपलब्ध नहीं है।" : "No jobs match your search criteria."
                  : isHi ? "जल्द ही नई रिक्तियां पोस्ट की जाएंगी।" : "New positions will be posted shortly. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 hover:border-red-300 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {job.department}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {job.type}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition leading-snug mb-1">
                      {isHi && job.titleHi ? job.titleHi : job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium my-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.experience}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {job.salary}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 border-t border-slate-100 pt-3">
                      {job.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-600/20 flex items-center gap-1.5"
                    >
                      <span>{isHi ? "आवेदन करें" : "Apply Now"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Candidate Application Light Mode Modal */}
      {isApplying && selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {selectedJob.department} • {selectedJob.type}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Apply for: {selectedJob.title}
                </h2>
              </div>
              <button
                onClick={() => setIsApplying(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Roy"
                    value={appForm.fullName}
                    onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ananya@example.com"
                    value={appForm.email}
                    onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={appForm.phone}
                    onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={appForm.experience}
                    onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Fresher">Fresher (0 Years)</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portfolio / LinkedIn / Work Samples URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/... or work samples"
                  value={appForm.portfolioUrl}
                  onChange={(e) => setAppForm({ ...appForm, portfolioUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Resume File Upload */}
              <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl p-4 text-center">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Upload Resume / CV (PDF or DOC) <span className="text-red-600">*</span>
                </label>

                <div className="flex flex-col items-center justify-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-sm transition">
                    {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Upload className="w-4 h-4 text-red-600" />}
                    <span>{uploadingResume ? "Uploading Resume..." : "Choose File (PDF/DOC)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileUpload}
                      className="hidden"
                      disabled={uploadingResume}
                    />
                  </label>

                  <div className="w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Or paste Direct Resume URL..."
                      value={appForm.resumeUrl}
                      onChange={(e) => setAppForm({ ...appForm, resumeUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 text-center"
                    />
                  </div>
                </div>

                {appForm.resumeUrl && (
                  <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Resume File Attached & Ready!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cover Letter / Introduction
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us why you are a great fit for this role..."
                  value={appForm.coverLetter}
                  onChange={(e) => setAppForm({ ...appForm, coverLetter: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-red-600/20 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
