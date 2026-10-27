"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0f172a",
          color: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "90%",
            textAlign: "center",
            padding: "32px",
            background: "#1e293b",
            borderRadius: "16px",
            border: "1px solid #334155",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px", color: "#ef4444" }}>
            Critical Error Encountered
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
            The application encountered a critical issue. Please click below to reload the application.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              background: "#dc2626",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
