"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  FileText,
  UserCheck,
  RefreshCw,
  Loader2,
  X,
  Clock,
  MapPin,
  IndianRupee,
  Download,
  Filter
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
  applications?: CandidateApp[];
}

interface CandidateApp {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  experience?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  resumeUrl: string;
  status: string;
  appliedAt?: string;
  job?: JobOpening;
}

function formatExternalUrl(url?: string): string {
  if (!url) return "#";
  let clean = url.trim().replace(/^(https?[:/]+)+/i, "");
  if (clean.startsWith("/")) {
    return `https://yellowgreen-rook-384455.hostingersite.com${clean}`;
  }
  return `https://${clean}`;
}

export default function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");

  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<CandidateApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Adding/Editing Jobs
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [submittingJob, setSubmittingJob] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Job Form State
  const [jobForm, setJobForm] = useState({
    title: "",
    titleHi: "",
    department: "Editorial",
    location: "Ranchi, Jharkhand",
    type: "Full-Time",
    experience: "1-3 Years",
    salary: "",
    description: "",
    requirements: "",
    isActive: true,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch("/api/v1/careers/jobs?admin=true"),
        fetch("/api/v1/careers/applications"),
      ]);

      if (jobsRes.ok) {
        const json = await jobsRes.json();
        if (json.success && Array.isArray(json.data)) {
          setJobs(json.data);
        }
      }

      if (appsRes.ok) {
        const json = await appsRes.json();
        if (json.success && Array.isArray(json.data)) {
          setApplications(json.data);
        }
      }
    } catch (err) {
      showToast("Failed to load career data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddJobModal = () => {
    setEditingJobId(null);
    setJobForm({
      title: "",
      titleHi: "",
      department: "Editorial",
      location: "Ranchi, Jharkhand",
      type: "Full-Time",
      experience: "1-3 Years",
      salary: "",
      description: "",
      requirements: "",
      isActive: true,
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJobModal = (job: JobOpening) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      titleHi: job.titleHi || "",
      department: job.department || "Editorial",
      location: job.location || "Ranchi, Jharkhand",
      type: job.type || "Full-Time",
      experience: job.experience || "1-3 Years",
      salary: job.salary || "",
      description: job.description || "",
      requirements: job.requirements || "",
      isActive: job.isActive ?? true,
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      showToast("Title and Description are required!", "error");
      return;
    }

    setSubmittingJob(true);
    try {
      const payload = {
        ...(editingJobId ? { id: editingJobId } : {}),
        ...jobForm,
      };

      const res = await fetch("/api/v1/careers/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(editingJobId ? "Job opening updated!" : "New job opening created!");
          setIsJobModalOpen(false);
          fetchData();
        } else {
          showToast(json.message || "Failed to save job", "error");
        }
      }
    } catch (err: any) {
      showToast("Server error: " + err.message, "error");
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete job position '${title}'?`)) return;

    try {
      const res = await fetch(`/api/v1/careers/jobs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(`Job '${title}' deleted.`);
          fetchData();
        }
      }
    } catch (err: any) {
      showToast("Delete error: " + err.message, "error");
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch("/api/v1/careers/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(`Candidate status updated to ${status}`);
          fetchData();
        }
      }
    } catch (err: any) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove application from '${name}'?`)) return;

    try {
      const res = await fetch(`/api/v1/careers/applications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showToast(`Application from '${name}' removed.`);
          fetchData();
        }
      }
    } catch (err: any) {
      showToast("Delete error: " + err.message, "error");
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApps = applications.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.job && a.job.title.toLowerCase().includes(searchQuery.toLowerCase()))
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
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
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
                <Briefcase className="w-6 h-6 text-red-600" />
                Job Openings & Candidate Resumes
              </h1>
            </div>
            <p className="text-slate-500 text-sm ml-11 font-normal">
              Post new career opportunities and review submitted applicant CVs & resumes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/careers"
              target="_blank"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition border border-slate-200 flex items-center gap-2"
            >
              View Public Careers Portal
            </Link>
            <button
              onClick={handleOpenAddJobModal}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-red-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                activeTab === "jobs"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Postings ({jobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                activeTab === "applications"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Candidate Applications ({applications.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === "jobs" ? "Search job title, dept..." : "Search applicant name, email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>
            <button
              onClick={fetchData}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm transition border border-slate-200"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tab 1: Jobs Management */}
        {activeTab === "jobs" && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <p className="text-sm font-medium">Loading jobs from database...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Jobs Found</h3>
                <p className="text-slate-500 text-sm mb-6">
                  {searchQuery ? "No jobs match your search criteria." : "Start recruiting by posting your first job opening."}
                </p>
                <button
                  onClick={handleOpenAddJobModal}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2 transition shadow-md"
                >
                  <Plus className="w-4 h-4" /> Post New Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all hover:shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded uppercase tracking-wider">
                          {job.department}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${job.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                            title={job.isActive ? "Active Posting" : "Inactive"}
                          />
                          <button
                            onClick={() => handleOpenEditJobModal(job)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition leading-snug mb-1">
                        {job.title}
                      </h3>
                      {job.titleHi && <p className="text-xs text-slate-500 mb-2">{job.titleHi}</p>}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium my-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.type}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.experience}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.location}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 border-t border-slate-100 pt-3 mt-3">
                        {job.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Applications: <strong className="text-slate-900">{job.applications?.length || 0}</strong></span>
                      <button
                        onClick={() => {
                          setSearchQuery(job.title);
                          setActiveTab("applications");
                        }}
                        className="text-red-600 hover:underline"
                      >
                        View CVs →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Candidate Applications Review Table */}
        {activeTab === "applications" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <p className="text-sm font-medium">Loading candidate applications...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Candidate Applications Yet</h3>
                <p className="text-slate-400 text-xs mt-1">Submitted candidate applications & resume download links will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Applied Job Role</th>
                      <th className="p-4">Experience</th>
                      <th className="p-4">Resume / CV File</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-red-50/30 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{app.fullName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {app.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {app.phone}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-800">{app.job?.title || "Job Posting"}</div>
                          <span className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded font-semibold inline-block mt-0.5">
                            {app.job?.department || "Editorial"}
                          </span>
                        </td>

                        <td className="p-4 text-xs font-semibold text-slate-700">
                          {app.experience || "1-3 Years"}
                        </td>

                        <td className="p-4">
                          {app.resumeUrl ? (
                            <a
                              href={formatExternalUrl(app.resumeUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>View / Download Resume</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">No Resume URL</span>
                          )}
                        </td>

                        <td className="p-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                              app.status === "SHORTLISTED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : app.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : app.status === "REVIEWED"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="REVIEWED">REVIEWED</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteApp(app.id, app.fullName)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-100"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Job Posting Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-red-600" />
                {editingJobId ? "Edit Job Posting" : "Post New Job Opportunity"}
              </h2>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Title (English) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Crime Reporter"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title (Hindi)</label>
                  <input
                    type="text"
                    placeholder="e.g. वरिष्ठ अपराध रिपोर्टर"
                    value={jobForm.titleHi}
                    onChange={(e) => setJobForm({ ...jobForm, titleHi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Editorial">Editorial</option>
                    <option value="Reporting">Reporting</option>
                    <option value="Video Production">Video Production</option>
                    <option value="Technology">Technology</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Sales & Ads">Sales & Ads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required</label>
                  <input
                    type="text"
                    placeholder="e.g. 2-5 Years"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Ranchi, Jharkhand"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000 - ₹40,000 / month"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed role responsibilities..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={jobForm.isActive}
                    onChange={(e) => setJobForm({ ...jobForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span>Active Job Posting (Visible on Public Careers Portal)</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingJob}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-red-600/20 flex items-center gap-2"
                  >
                    {submittingJob && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingJobId ? "Save Job" : "Publish Job Posting"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
