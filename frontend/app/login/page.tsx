"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, Lock, Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setLoggedIn(true);
    }, 800);
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: "440px", background: "var(--color-card-bg)", border: "1px solid var(--color-border)", borderRadius: "20px", padding: "36px", boxShadow: "var(--shadow-lg)" }}>
        
        {/* Top Back Link */}
        <div style={{ marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--color-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Back to Global Awaaz
          </Link>
        </div>

        {loggedIn ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={54} style={{ color: "#00875a", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 8px 0" }}>Welcome Back!</h2>
            <p style={{ color: "var(--color-secondary)", fontSize: "0.9rem", margin: "0 0 24px 0" }}>
              Successfully authenticated as <strong style={{ color: "var(--color-primary)" }}>{email}</strong>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/admin" style={{ background: "#e50914", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", display: "block" }}>
                Go to CMS Admin Portal
              </Link>
              <Link href="/" style={{ background: "var(--color-bg-alt)", color: "var(--color-primary)", border: "1px solid var(--color-border)", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, textDecoration: "none", display: "block" }}>
                Return to Newsroom
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header Title */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ background: "linear-gradient(135deg, #e50914, #b80710)", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", color: "#ffffff", boxShadow: "0 6px 18px rgba(229,9,20,0.3)" }}>
                <LogIn size={24} />
              </div>
              <h1 style={{ fontFamily: "serif", fontSize: "1.75rem", fontWeight: 800, margin: "0 0 6px 0" }}>
                Account Sign In
              </h1>
              <p style={{ color: "var(--color-secondary)", fontSize: "0.88rem", margin: 0 }}>
                Access subscriber editions, bookmarks, and editorial CMS
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)" }} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-bg-alt)", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Password</label>
                  <a href="#" style={{ fontSize: "0.8rem", color: "#e50914", fontWeight: 600, textDecoration: "none" }}>Forgot?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)" }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-bg-alt)", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 500, color: "var(--color-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ accentColor: "#e50914" }}
                  />
                  Remember my session
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ width: "100%", background: "linear-gradient(135deg, #e50914, #b80710)", color: "#ffffff", border: "none", padding: "14px", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(229,9,20,0.3)", marginTop: "6px" }}
              >
                {isSubmitting ? "Authenticating..." : "Sign In to Account"}
              </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-border)", textAlign: "center", fontSize: "0.85rem", color: "var(--color-secondary)" }}>
              <span>Protected by Enterprise TLS 256-Bit Encryption</span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "8px", color: "#00875a", fontWeight: 600, fontSize: "0.78rem" }}>
                <ShieldCheck size={16} /> Global Awaaz Secure Gate
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
