"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  Globe,
  ChevronRight,
  Eye,
  X,
  FileCode
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  ipAddress: string;
  userAgent: string;
  before?: any;
  after?: any;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    // Seed initial mock audit log history for demonstration
    const sampleLogs: AuditLogItem[] = [
      {
        id: "log_1",
        action: "CREATE_ROLE",
        resource: "roles",
        resourceId: "r_custom_102",
        user: { name: "Global Awaaz Admin", email: "Global2409@globalawaaz.com", role: "Super Admin" },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        before: null,
        after: { name: "Senior Fact Checker", slug: "senior_fact_checker", permissions: ["articles:view", "articles:approve"] },
        createdAt: new Date().toISOString()
      },
      {
        id: "log_2",
        action: "ASSIGN_USER_ROLE",
        resource: "users",
        resourceId: "usr_8819",
        user: { name: "Global Awaaz Admin", email: "Global2409@globalawaaz.com", role: "Super Admin" },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        before: { role: "Editor", roleId: "r3" },
        after: { role: "Chief Editor", roleId: "r2" },
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "log_3",
        action: "ENABLE_2FA",
        resource: "users",
        resourceId: "usr_admin",
        user: { name: "Global Awaaz Admin", email: "Global2409@globalawaaz.com", role: "Super Admin" },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        before: { twoFAEnabled: false },
        after: { twoFAEnabled: true, twoFAVerifiedAt: new Date().toISOString() },
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: "log_4",
        action: "PUBLISH_ARTICLE",
        resource: "articles",
        resourceId: "art_9918",
        user: { name: "Chief Editor", email: "chief@globalawaaz.com", role: "Chief Editor" },
        ipAddress: "192.168.1.45",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        before: { status: "REVIEW" },
        after: { status: "PUBLISHED", publishedAt: new Date().toISOString() },
        createdAt: new Date(Date.now() - 14400000).toISOString()
      }
    ];

    setLogs(sampleLogs);
    setLoading(false);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = filterAction === "ALL" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "#ffffff",
          padding: "28px 32px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(229,9,20,0.2)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <History size={22} />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
              System Audit Trail Logs
            </h1>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500 }}>
            Immutable security event log tracking role changes, 2FA updates, and admin permissions.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.08)", padding: "10px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", fontSize: "0.86rem", fontWeight: 700 }}>
          Total Audit Records: <strong style={{ color: "#38bdf8" }}>{logs.length}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", minWidth: "300px", flexGrow: 1 }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search action, user, or resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 42px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 600,
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} style={{ color: "#64748b" }} />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#334155",
              outline: "none"
            }}
          >
            <option value="ALL">All Event Actions</option>
            <option value="CREATE_ROLE">CREATE_ROLE</option>
            <option value="ASSIGN_USER_ROLE">ASSIGN_USER_ROLE</option>
            <option value="ENABLE_2FA">ENABLE_2FA</option>
            <option value="PUBLISH_ARTICLE">PUBLISH_ARTICLE</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Data Table */}
      <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Timestamp</th>
                <th style={{ padding: "14px 20px", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Action</th>
                <th style={{ padding: "14px 20px", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>User Agent / Actor</th>
                <th style={{ padding: "14px 20px", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>IP Address</th>
                <th style={{ padding: "14px 20px", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    No audit logs matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px", fontSize: "0.84rem", fontWeight: 600, color: "#475569" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={14} style={{ color: "#94a3b8" }} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "6px",
                          background: log.action.includes("2FA")
                            ? "rgba(16,185,129,0.1)"
                            : log.action.includes("ROLE")
                            ? "rgba(229,9,20,0.1)"
                            : "rgba(37,99,235,0.1)",
                          color: log.action.includes("2FA")
                            ? "#059669"
                            : log.action.includes("ROLE")
                            ? "#e50914"
                            : "#2563eb",
                          border: "1px solid rgba(0,0,0,0.05)"
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                        {log.user.name}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                        {log.user.email} • ({log.user.role})
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px", fontSize: "0.84rem", color: "#475569", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Globe size={14} style={{ color: "#94a3b8" }} />
                        <span>{log.ipAddress}</span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        style={{
                          background: "#f1f5f9",
                          color: "#0f172a",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <Eye size={14} /> View State Diff
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Log Payload Diff */}
      {selectedLog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "600px", padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileCode size={22} style={{ color: "#e50914" }} />
                <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Audit Payload State Diff
                </h2>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>
                  State Before Change
                </h4>
                <pre style={{ background: "#090d16", color: "#f87171", padding: "14px", borderRadius: "10px", fontSize: "0.78rem", overflowX: "auto" }}>
                  {JSON.stringify(selectedLog.before || { state: "N/A (Initial Creation)" }, null, 2)}
                </pre>
              </div>

              <div>
                <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>
                  State After Change
                </h4>
                <pre style={{ background: "#090d16", color: "#34d399", padding: "14px", borderRadius: "10px", fontSize: "0.78rem", overflowX: "auto" }}>
                  {JSON.stringify(selectedLog.after || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0f172a", color: "#ffffff", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer" }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
