"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "36px 28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
          Something went wrong
        </h2>

        <p style={{ fontSize: "0.92rem", color: "#64748b", lineHeight: 1.5, marginBottom: "24px" }}>
          An unexpected error occurred while loading this page. You can try refreshing or return to the homepage.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#dc2626",
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} /> Try Again
          </button>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#f1f5f9",
              color: "#334155",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid #cbd5e1",
            }}
          >
            <Home size={15} /> Back to Newsroom
          </Link>
        </div>
      </div>
    </div>
  );
}
