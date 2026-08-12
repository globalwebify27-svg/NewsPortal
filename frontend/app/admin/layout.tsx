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
  CheckCircle2,
  Briefcase
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
  const [siteLogo, setSiteLogo] = useState<string>("/global-awaaz-logo.jpg");

  useEffect(() => {
    fetch("/api/v1/logo-settings")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data && json.data.site_logo_url) {
          setSiteLogo(json.data.site_logo_url);
        }
      })
      .catch(() => { });
  }, []);

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
          } catch (e) { }
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
      const found = storedUsers.find((u: any) => {
        const emailMatch = u.email && u.email.toLowerCase() === userEmail;
        const nameMatch = u.name && u.name.toLowerCase() === userEmail;
        const passMatch = u.password && u.password === pass;
        return (emailMatch || nameMatch) && passMatch;
      });
      if (found) {
        let slug = (found.roleSlug || found.role || "editor").toLowerCase();
        if (slug.includes("super")) slug = "super_admin";
        else if (slug.includes("chief")) slug = "chief_editor";
        else if (slug.includes("admin")) slug = "super_admin";
        else slug = "editor";

        matchedCreatedUser = {
          name: found.name || found.email,
          email: found.email,
          roleSlug: slug as AdminRoleSlug
        };
      }
    } catch (err) { }

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
    { name: "News Queue", href: "/admin/articles", icon: FileText, allowed: ["super_admin", "chief_editor", "editor"] },
    { name: "Categories", href: "/admin/categories", icon: FolderTree, allowed: ["super_admin", "chief_editor"] },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon, allowed: ["super_admin", "chief_editor", "editor"] },
    { name: "Videos Manager", href: "/admin/videos", icon: Video, allowed: ["super_admin", "chief_editor"] },
    { name: "Team Management", href: "/admin/team", icon: Users, badge: "TEAM", allowed: ["super_admin", "chief_editor"] },
    { name: "Careers & Jobs", href: "/admin/careers", icon: Briefcase, badge: "JOBS", allowed: ["super_admin", "chief_editor"] },
    { name: "Advertisements", href: "/admin/ads", icon: Megaphone, badge: "ADS", allowed: ["super_admin"] },
    { name: "Ad Desk & Proposals", href: "/admin/advertise", icon: Megaphone, badge: "AD DESK", allowed: ["super_admin", "chief_editor"] },
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

  // Clean Light & Pretty Enterprise Admin Login Portal when unauthenticated
  if (isAuthenticated === false) {
    return (
      <div
        style={{
          minHeight: "95vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#f8fafc",
          backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px), radial-gradient(#e2e8f0 1px, #f8fafc 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
          color: "#0f172a",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Soft Background Accent Circles */}
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(229,9,20,0.04) 0%, rgba(255,255,255,0) 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(37,99,235,0.03) 0%, rgba(255,255,255,0) 70%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", position: "relative", zIndex: 2, justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>

          {/* Top Brand Header with Large Site Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <img
                src={siteLogo}
                alt="Global Awaaz"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                style={{
                  maxHeight: "100px",
                  maxWidth: "350px",
                  objectFit: "contain"
                }}
              />
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
              Global Awaaz CMS
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ height: "1px", width: "32px", background: "#e50914" }} />
              <span style={{ color: "#64748b", fontSize: "0.86rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                Enterprise Editorial Control Center
              </span>
              <span style={{ height: "1px", width: "32px", background: "#e50914" }} />
            </div>
          </div>

          {/* 950px Width x 470px Height Centered White Card */}
          <div
            style={{
              width: "50%",
              minHeight: "470px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "24px",
              padding: "44px 56px",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.07)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

            }}
          >
            {/* Card Top Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "#fef2f2", color: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Lock size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Sign In to Account
                  </h3>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.84rem", color: "#64748b", fontWeight: 500 }}>
                    Access your editorial control center
                  </p>
                </div>
              </div>
              <span style={{ fontSize: "0.78rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "5px 12px", borderRadius: "8px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <CheckCircle2 size={14} style={{ color: "#16a34a" }} /> Security Active
              </span>
            </div>

            {loginError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={18} style={{ flexShrink: 0, color: "#dc2626" }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  USERNAME / EMAIL
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="e.g. Example@gmail.com"
                    value={emailInput}
                    autoComplete="off"
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 48px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#0f172a",
                      fontSize: "0.94rem",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 48px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#0f172a",
                      fontSize: "0.94rem",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.86rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#475569", fontWeight: 600 }}>
                  <input type="checkbox" defaultChecked style={{ width: "16px", height: "16px", accentColor: "#e50914", borderRadius: "4px" }} />
                  <span>Remember me</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Contact Super Admin to reset password credentials."); }} style={{ color: "#e50914", fontWeight: 700, textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #dc2626 0%, #b80710 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "15px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "0.98rem",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(220,38,38,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "4px"
                }}
              >
                {isSubmitting ? "Signing in..." : "Sign In to Control Center"}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Bottom Security Footer Links */}
          <div style={{ marginTop: "26px", textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.86rem", fontWeight: 600, transition: "color 0.2s" }}>
              ← Return to Live Global Awaaz Portal
            </Link>
            <div style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <ShieldCheck size={16} style={{ color: "#16a34a" }} /> TLS 256-Bit Encrypted • Granular DB RBAC Active
            </div>
          </div>

        </div>
      </div >
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
