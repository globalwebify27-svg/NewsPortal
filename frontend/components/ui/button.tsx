"use client";

import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", style, children, ...props }, ref) => {
    // Base styles
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap",
      borderRadius: "8px",
      fontSize: size === "sm" ? "0.82rem" : size === "lg" ? "1rem" : "0.88rem",
      fontWeight: 600,
      transition: "all 0.2s ease",
      cursor: "pointer",
      border: "1px solid transparent",
      outline: "none",
      userSelect: "none",
      ...style,
    };

    // Variant styling
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: "var(--color-primary, #e50914)",
        color: "#ffffff",
      },
      outline: {
        backgroundColor: "transparent",
        borderColor: "var(--color-border, #cbd5e1)",
        color: "var(--color-text, #0f172a)",
      },
      secondary: {
        backgroundColor: "var(--color-bg-alt, #f1f5f9)",
        color: "var(--color-text, #0f172a)",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "var(--color-text, #0f172a)",
      },
      destructive: {
        backgroundColor: "#dc2626",
        color: "#ffffff",
      },
      link: {
        backgroundColor: "transparent",
        color: "#0284c7",
        textDecoration: "underline",
        padding: 0,
      },
    };

    // Size styling
    const sizeStyles: Record<string, React.CSSProperties> = {
      default: { padding: "8px 16px", height: "38px" },
      sm: { padding: "6px 12px", height: "32px" },
      lg: { padding: "10px 22px", height: "46px" },
      icon: { width: "38px", height: "38px", padding: 0 },
    };

    const combinedStyle = {
      ...baseStyles,
      ...(variantStyles[variant] || variantStyles.default),
      ...(sizeStyles[size] || sizeStyles.default),
      ...style,
    };

    return (
      <button ref={ref} style={combinedStyle} className={`ui-button ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
