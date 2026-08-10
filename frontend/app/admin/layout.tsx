"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  ImageIcon,
  Video,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Newspaper,
  Megaphone,
  Globe,
  Users,
  ShieldAlert,
  History,
  CheckCircle2
} from "lucide-react";

export type AdminRoleSlug = "super_admin" | "chief_editor" | "editor";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<string>("Global2409");
  const [adminRole, setAdminRole] = useState<AdminRoleSlug>("super_admin");

  // Login form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [actualRole, setActualRole] = useState<AdminRoleSlug>("super_admin");

  useEffect(() => {
    async function initSession() {
      try {
        const isAuth = sessionStorage.getItem("ga_admin_logged_in") === "true";
        const user = sessionStorage.getItem("ga_admin_user");
        let savedActual = (sessionStorage.getItem("ga_actual_role") as AdminRoleSlug);
        let savedRole = (sessionStorage.getItem("ga_admin_role") as AdminRoleSlug);

        // Auto-resolve role from central DB API for staff accounts
        if (user && user !== "Global Awaaz Admin" && user !== "Chief Editor" && user !== "Staff Editor") {
          try {
            const res = await fetch("/api/v1/staff");
            const json = await res.json();
            const storedUsers = (json && json.success && Array.isArray(json.data)) ? json.data : [];
            const found = storedUsers.find((u: any) => u.name === user || u.email === user);
            if (found && found.roleSlug) {
              savedActual = found.roleSlug as AdminRoleSlug;
              savedRole = found.roleSlug as AdminRoleSlug;
              sessionStorage.setItem("ga_actual_role", found.roleSlug);
              sessionStorage.setItem("ga_admin_role", found.roleSlug);
            }
          } catch (e) {}
        }

        if (!savedActual) savedActual = "super_admin";
        if (!savedRole) savedRole = savedActual;

        if (user) setAdminUser(user);
        setActualRole(savedActual);
        setAdminRole(savedActual !== "super_admin" ? savedActual : savedRole);
        setIsAuthenticated(isAuth);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    }
    initSession();
  }, []);

  const handleRoleSwitch = (newRole: AdminRoleSlug) => {
    // SECURITY: Only actual Super Admin is permitted to switch role view
    if (actualRole !== "super_admin") return;
    setAdminRole(newRole);
    sessionStorage.setItem("ga_admin_role", newRole);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    const userEmail = emailInput.trim().toLowerCase();
    const pass = passwordInput;

    // 1. Super Admin Account Match
    const isSuperAdminMatch =
      (userEmail === "global2409@globalawaaz.com" || userEmail === "global2409") &&
      pass === "Global@#2409";

    // 2. Dynamically Created Staff Accounts (Server Database Endpoint)
    let matchedCreatedUser: { name: string; email: string; roleSlug: AdminRoleSlug } | null = null;
    try {
      const res = await fetch("/api/v1/staff");
      const json = await res.json();
      const storedUsers = (json && json.success && Array.isArray(json.data)) ? json.data : [];
      const found = storedUsers.find(
        (u: any) =>
          (u.email.toLowerCase() === userEmail || (u.name && u.name.toLowerCase() === userEmail)) &&
          u.password === pass
      );
      if (found) {
        matchedCreatedUser = {
          name: found.name,
          email: found.email,
          roleSlug: (found.roleSlug as AdminRoleSlug) || "editor"
        };
      }
    } catch (err) {}

    if (isSuperAdminMatch) {
      sessionStorage.setItem("ga_admin_logged_in", "true");
      sessionStorage.setItem("ga_admin_user", "Global Awaaz Admin");
      sessionStorage.setItem("ga_actual_role", "super_admin");
      sessionStorage.setItem("ga_admin_role", "super_admin");
      setAdminUser("Global Awaaz Admin");
      setActualRole("super_admin");
      setAdminRole("super_admin");
      setIsAuthenticated(true);
      setIsSubmitting(false);
    } else if (matchedCreatedUser) {
      const role = matchedCreatedUser.roleSlug;
      sessionStorage.setItem("ga_admin_logged_in", "true");
      sessionStorage.setItem("ga_admin_user", matchedCreatedUser.name || matchedCreatedUser.email);
      sessionStorage.setItem("ga_actual_role", role);
      sessionStorage.setItem("ga_admin_role", role);
      setAdminUser(matchedCreatedUser.name || matchedCreatedUser.email);
      setActualRole(role);
      setAdminRole(role);
      setIsAuthenticated(true);
      setIsSubmitting(false);
    } else {
      setLoginError("Invalid Admin credentials. Access denied.");
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ga_admin_logged_in");
    sessionStorage.removeItem("ga_admin_user");
    sessionStorage.removeItem("ga_actual_role");
    sessionStorage.removeItem("ga_admin_role");
    setIsAuthenticated(false);
  };

  const allNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, allowed: ["super_admin", "chief_editor", "editor"] },
    { name: "Articles Queue", href: "/admin/articles", icon: FileText, allowed: ["super_admin", "chief_editor", "editor"] },
    { name: "Categories", href: "/admin/categories", icon: FolderTree, allowed: ["super_admin", "chief_editor"] },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon, allowed: ["super_admin", "chief_editor", "editor"] },
    { name: "Videos Manager", href: "/admin/videos", icon: Video, allowed: ["super_admin", "chief_editor"] },
    { name: "Advertisements", href: "/admin/ads", icon: Megaphone, badge: "ADS", allowed: ["super_admin"] },
    { name: "About Us Page", href: "/admin/about", icon: BookOpen, badge: "NEW", allowed: ["super_admin", "chief_editor"] },
    { name: "e-Paper Manager", href: "/admin/epaper", icon: Newspaper, badge: "NEW", allowed: ["super_admin", "chief_editor"] },
    { name: "SEO Settings", href: "/admin/seo", icon: Globe, badge: "SEO", allowed: ["super_admin"] },
    { name: "AI Copilot", href: "/admin/ai", icon: Bot, badge: "AI", allowed: ["super_admin", "chief_editor"] },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3, allowed: ["super_admin", "chief_editor"] },
    { name: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck, badge: "RBAC", allowed: ["super_admin", "chief_editor"] },
    { name: "Audit Trail Logs", href: "/admin/audit-logs", icon: History, badge: "LOGS", allowed: ["super_admin"] },
    { name: "Site Settings", href: "/admin/settings", icon: Settings, allowed: ["super_admin"] }
  ];

  // Filter navigation items by active role permissions
  const navItems = allNavItems.filter((item) => item.allowed.includes(adminRole));

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // Route protection guard check
  const currentNav = allNavItems.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  const isRouteAllowed = !currentNav || currentNav.allowed.includes(adminRole);

  // Loading state
  if (isCheckingSession) {
    return (
      <div style={{ minHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#090d16", color: "#ffffff" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #e50914, #991b1b)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(229,9,20,0.5)" }}>
          <Lock size={26} />
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>Verifying Security Session...</h3>
      </div>
    );
  }

  // Professional Enterprise Admin Login Portal when unauthenticated
  if (isAuthenticated === false) {
    return (
      <div
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "radial-gradient(circle at 50% 10%, #1e1b4b 0%, #0f172a 50%, #090d16 100%)",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(229,9,20,0.15) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />
        
        <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 2 }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #e50914 0%, #7f1d1d 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                fontWeight: 900,
                color: "#ffffff",
                fontSize: "1.5rem",
                letterSpacing: "-0.03em",
                boxShadow: "0 10px 30px rgba(229,9,20,0.4), inset 0 1px 1px rgba(255,255,255,0.4)"
              }}
            >
              GA
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#ffffff", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
              Global Awaaz CMS
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: 0, fontWeight: 500 }}>
              Enterprise Editorial Management Console
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "24px",
              padding: "36px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Secure Sign In
              </span>
              <span style={{ fontSize: "0.74rem", background: "rgba(229,9,20,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                ● RBAC Protected
              </span>
            </div>

            {loginError && (
              <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "12px 14px", borderRadius: "10px", fontSize: "0.84rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={17} style={{ flexShrink: 0, color: "#ef4444" }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Admin Username / Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Enter Admin Username or Email"
                    value={emailInput}
                    autoComplete="off"
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "13px 14px 13px 44px",
                      borderRadius: "10px",
                      border: "1px solid #334155",
                      background: "#090d16",
                      color: "#ffffff",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Security Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "13px 44px 13px 44px",
                      borderRadius: "10px",
                      border: "1px solid #334155",
                      background: "#090d16",
                      color: "#ffffff",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #e50914 0%, #b80710 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(229,9,20,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "6px"
                }}
              >
                {isSubmitting ? "Authenticating..." : "Sign In to Control Center"}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div style={{ marginTop: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.84rem", fontWeight: 600 }}>
              ← Return to Live Global Awaaz Portal
            </Link>
            <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <ShieldCheck size={14} style={{ color: "#10b981" }} /> TLS 256-Bit Encrypted • Granular DB RBAC Active
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Admin Sidebar Navigation */}
      <aside className="admin-sidebar-nav">
        <div style={{ paddingBottom: "20px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #e50914 0%, #991b1b 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#ffffff", fontSize: "1.1rem", boxShadow: "0 4px 14px rgba(229,9,20,0.4)" }}>
              GA
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
                Global Awaaz
              </h2>
              <span style={{ fontSize: "0.72rem", color: "#e50914", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Editorial Console
              </span>
            </div>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div style={{ marginBottom: "16px", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
            Active Security Role
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={15} style={{ color: adminRole === "super_admin" ? "#e50914" : adminRole === "chief_editor" ? "#3b82f6" : "#10b981" }} />
              {adminRole === "super_admin" ? "Super Admin" : adminRole === "chief_editor" ? "Chief Editor" : "Editor"}
            </span>
            <span style={{ fontSize: "0.66rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
              DB Active
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  background: active ? "#e50914" : "transparent",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                  boxShadow: active ? "0 4px 14px rgba(229,9,20,0.3)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                  <Icon size={17} style={{ opacity: active ? 1 : 0.7 }} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      background: active ? "rgba(255,255,255,0.25)" : "rgba(229,9,20,0.2)",
                      color: active ? "#ffffff" : "#e50914",
                      fontSize: "0.66rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "5px"
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ marginTop: "auto", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", color: "#94a3b8", fontSize: "0.76rem" }}>
            User: <strong style={{ color: "#ffffff" }}>{adminUser}</strong>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(229,9,20,0.15)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.3)",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <LogOut size={15} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="admin-main-viewport">
        {/* Top Header Bar displaying Logged-in User Name & Authenticated DB Role */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
              Portal Control Center
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.84rem", color: "#64748b" }}>
              Enterprise Role-Based Access Control & Content Operations
            </p>
          </div>

          {/* User Name & Authenticated DB Security Role Badge (No Role Switcher) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "8px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a" }}>
              {adminUser}
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "6px",
                background: adminRole === "super_admin" ? "rgba(229,9,20,0.12)" : adminRole === "chief_editor" ? "rgba(37,99,235,0.12)" : "rgba(16,185,129,0.12)",
                color: adminRole === "super_admin" ? "#e50914" : adminRole === "chief_editor" ? "#2563eb" : "#059669",
                border: `1px solid ${adminRole === "super_admin" ? "rgba(229,9,20,0.25)" : adminRole === "chief_editor" ? "rgba(37,99,235,0.25)" : "rgba(16,185,129,0.25)"}`
              }}
            >
              ● {adminRole === "super_admin" ? "SUPER ADMIN" : adminRole === "chief_editor" ? "CHIEF EDITOR" : "EDITOR"}
            </span>
          </div>
        </header>

        {/* Route Protection Check */}
        {!isRouteAllowed ? (
          <div
            style={{
              padding: "48px 32px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #fee2e2",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.05)",
              maxWidth: "600px",
              margin: "40px auto"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                boxShadow: "0 0 20px rgba(239,68,68,0.2)"
              }}
            >
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0" }}>
              Access Denied — Insufficient Permissions
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, margin: "0" }}>
              Your current active security role (<strong style={{ color: "#ef4444" }}>{adminRole.toUpperCase()}</strong>) does not have permission to view or manage this module.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
