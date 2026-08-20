"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipData {
  text: string;
  badge?: string;
  icon?: string;
  rect: DOMRect;
  side: "top" | "bottom";
}

export default function GlobalAutoTooltip() {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    // Helper to suppress native browser title popups from target and all parent nodes
    const suppressNativeTitles = (startEl: HTMLElement | null) => {
      let curr: HTMLElement | null = startEl;
      let depth = 0;
      while (curr && curr !== document.body && depth < 6) {
        if (curr.hasAttribute("title")) {
          const val = curr.getAttribute("title");
          if (val) {
            curr.setAttribute("data-original-title", val);
          }
          curr.removeAttribute("title");
        }
        curr = curr.parentElement;
        depth++;
      }
    };

    const findTargetElement = (e: MouseEvent | FocusEvent): { el: HTMLElement; text: string; badge: string; icon: string } | null => {
      let target = e.target as HTMLElement | null;
      if (!target) return null;

      // Don't show global auto tooltip if an element has a local Tooltip component or is a tooltip itself
      if (
        target.closest("[data-tooltip-trigger='true']") ||
        target.closest(".global-auto-tooltip") ||
        target.closest("[role='tooltip']") ||
        target.closest(".ui-tooltip-content")
      ) {
        return null;
      }

      // Suppress native titles up the tree to prevent dual native browser tooltips
      suppressNativeTitles(target);

      // Check up to 4 parent levels for interactive/semantic targets
      let depth = 0;
      while (target && target !== document.body && depth < 4) {
        // 1. Stored title or data-tooltip attribute
        const explicitTooltip = target.getAttribute("data-tooltip") || target.getAttribute("data-original-title");
        
        // 2. Images (<img>, <picture>, svg, [role="img"])
        const tagName = target.tagName.toLowerCase();
        if (tagName === "img" || tagName === "svg" || target.getAttribute("role") === "img") {
          const altText = target.getAttribute("alt") || target.getAttribute("aria-label") || explicitTooltip;
          const imgCaption = target.closest("figure")?.querySelector("figcaption")?.textContent;
          const displayText = altText?.trim() || imgCaption?.trim() || "Global Awaaz Media";
          
          return {
            el: target,
            text: displayText.length > 55 ? displayText.slice(0, 52) + "..." : displayText,
            badge: "Photo",
            icon: "🖼️",
          };
        }

        // 3. Headings (h1, h2, h3, h4, h5, h6)
        if (/^h[1-6]$/.test(tagName)) {
          const headingText = target.textContent?.trim() || explicitTooltip;
          if (headingText && headingText.length > 0) {
            return {
              el: target,
              text: headingText.length > 60 ? headingText.slice(0, 57) + "..." : headingText,
              badge: "Heading",
              icon: "📌",
            };
          }
        }

        // 4. Explicit tooltip attribute if present
        if (explicitTooltip && explicitTooltip.trim()) {
          return {
            el: target,
            text: explicitTooltip.trim().length > 60 ? explicitTooltip.trim().slice(0, 57) + "..." : explicitTooltip.trim(),
            badge: "Info",
            icon: "💡",
          };
        }

        // 5. Buttons ([role="button"], <button>, .btn)
        if (tagName === "button" || target.getAttribute("role") === "button" || target.classList.contains("btn")) {
          const btnText = target.getAttribute("aria-label") || target.textContent?.trim() || "Button";
          if (btnText && btnText.length > 0) {
            return {
              el: target,
              text: btnText.length > 50 ? btnText.slice(0, 47) + "..." : btnText,
              badge: "Action",
              icon: "⚡",
            };
          }
        }

        // 6. Links (<a>)
        if (tagName === "a") {
          const linkText = target.getAttribute("aria-label") || target.textContent?.trim() || explicitTooltip;
          const href = target.getAttribute("href");
          if (linkText && linkText.length > 0 && linkText.length < 80 && href && href !== "#") {
            return {
              el: target,
              text: linkText.length > 55 ? linkText.slice(0, 52) + "..." : linkText,
              badge: "Link",
              icon: "🔗",
            };
          }
        }

        target = target.parentElement;
        depth++;
      }

      return null;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const match = findTargetElement(e);

      if (!match) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setTooltip(null);
        activeElementRef.current = null;
        return;
      }

      if (activeElementRef.current === match.el) return;
      activeElementRef.current = match.el;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        if (!activeElementRef.current) return;
        const rect = activeElementRef.current.getBoundingClientRect();
        
        // Hide if element is hidden or zero size
        if (rect.width === 0 && rect.height === 0) {
          setTooltip(null);
          return;
        }

        const side = rect.top < 65 ? "bottom" : "top";

        setTooltip({
          text: match.text,
          badge: match.badge,
          icon: match.icon,
          rect,
          side,
        });
      }, 80);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (activeElementRef.current) {
        if (!related || !activeElementRef.current.contains(related)) {
          if (timerRef.current) clearTimeout(timerRef.current);
          setTooltip(null);
          activeElementRef.current = null;
        }
      }
    };

    const handleScrollOrResize = () => {
      if (tooltip && activeElementRef.current) {
        const rect = activeElementRef.current.getBoundingClientRect();
        setTooltip((prev) => (prev ? { ...prev, rect } : null));
      }
    };

    document.body.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.body.addEventListener("mouseout", handleMouseOut, { passive: true });
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      document.body.removeEventListener("mouseover", handleMouseOver);
      document.body.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, tooltip]);

  if (!mounted || !tooltip || typeof document === "undefined") return null;

  const { rect, side, text, badge, icon } = tooltip;

  // Horizontal position calculation bounded to viewport
  const viewportWidth = window.innerWidth;
  const centerX = rect.left + rect.width / 2;
  
  // Safe margins
  const leftPos = Math.max(16, Math.min(viewportWidth - 16, centerX));

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999999,
    pointerEvents: "none",
    top: side === "top" ? `${rect.top - 6}px` : `${rect.bottom + 6}px`,
    left: `${leftPos}px`,
    transform: side === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
  };

  return createPortal(
    <div className="global-auto-tooltip" style={style} role="tooltip">
      <div className="tooltip-inner-box">
        <span className="tooltip-text-content">{text}</span>
      </div>
      <div className={`tooltip-arrow tooltip-arrow-${side}`} />
    </div>,
    document.body
  );
}
