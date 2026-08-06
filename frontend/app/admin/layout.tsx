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
  Plus,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Newspaper,
  Megaphone,
  Globe
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>("Global2409");

  // Login form state — empty by default
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("ga_admin_logged_in") === "true";
    if (isAuth) {
      const user = localStorage.getItem("ga_admin_user");
      if (user) setAdminUser(user);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const userEmail = emailInput.trim().toLowerCase();
      const pass = passwordInput;

      const isValidUser = userEmail === "global2409" || userEmail === "global2409@globalawaaz.com";
      const isValidPass = pass === "Global@#2409";

      if (isValidUser && isValidPass) {
        localStorage.setItem("ga_admin_logged_in", "true");
        localStorage.setItem("ga_admin_user", "Global2409");
        setAdminUser("Global2409");
        setIsAuthenticated(true);
        setIsSubmitting(false);
      } else {
        setLoginError("Invalid Admin credentials. Access denied.");
        setIsSubmitting(false);
      }
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem("ga_admin_logged_in");
    localStorage.removeItem("ga_admin_user");
    setIsAuthenticated(false);
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Articles Queue", href: "/admin/articles", icon: FileText },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Videos Manager", href: "/admin/videos", icon: Video },
    { name: "Advertisements", href: "/admin/ads", icon: Megaphone, badge: "ADS" },
    { name: "About Us Page", href: "/admin/about", icon: BookOpen, badge: "NEW" },
    { name: "e-Paper Manager", href: "/admin/epaper", icon: Newspaper, badge: "NEW" },
    { name: "SEO Settings", href: "/admin/seo", icon: Globe, badge: "SEO" },
    { name: "AI Copilot", href: "/admin/ai", icon: Bot, badge: "AI" },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Site Settings", href: "/admin/settings", icon: Settings }
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // Loading state
  if (isAuthenticated === null) {
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
        {/* Subtle Ambient Background Light Glows */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(229,9,20,0.15) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />
        
        <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 2 }}>
          
          {/* Brand Emblem & Header */}
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

          {/* Login Card */}
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
                ● Admin Gate
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
                {isSubmitting ? "Authenticating Credentials..." : "Sign In to Control Center"}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Security & Return Link Footer */}
          <div style={{ marginTop: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.84rem", fontWeight: 600 }}>
              ← Return to Live Global Awaaz Portal
            </Link>
            <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <ShieldCheck size={14} style={{ color: "#10b981" }} /> TLS 256-Bit Encrypted • Enterprise RBAC Gate
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
        <div style={{ paddingBottom: "24px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: active ? "#e50914" : "transparent",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                  boxShadow: active ? "0 4px 14px rgba(229,9,20,0.3)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon size={18} style={{ opacity: active ? 1 : 0.7 }} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      background: active ? "rgba(255,255,255,0.25)" : "rgba(229,9,20,0.2)",
                      color: active ? "#ffffff" : "#e50914",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "6px"
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
        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "0.84rem",
              fontWeight: 600
            }}
          >
            <span>View Live Site</span>
            <ArrowUpRight size={15} />
          </Link>

          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", color: "#94a3b8", fontSize: "0.76rem" }}>
            User: <strong style={{ color: "#ffffff", wordBreak: "break-all" }}>{adminUser}</strong>
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
        {/* Top Header Bar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
              Portal Control Center
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.84rem", color: "#64748b" }}>
              Global Awaaz CMS & Media Management Platform
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "6px 14px", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} /> Authenticated Admin Session
            </span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
