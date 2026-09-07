"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipData {
  text: string;
  badge?: string;
  icon?: string;
  rect: DOMRect;
  side: "top" | "bottom" | "left" | "right";
}

export default function GlobalAutoTooltip() {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const activeElementRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<TooltipData | null>(null);
  tooltipRef.current = tooltip;

  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isWarmRef = useRef<boolean>(false);
  const warmTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    // Suppress native browser title popups and cache original title in data attribute
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

    const findTargetElement = (
      e: MouseEvent | FocusEvent
    ): {
      el: HTMLElement;
      text: string;
      badge: string;
      icon: string;
      side?: "top" | "bottom" | "left" | "right";
    } | null => {
      let target = e.target as HTMLElement | null;
      if (!target) return null;

      // Don't show global auto tooltip if an element has a local Tooltip component or is part of a tooltip
      if (
        target.closest("[data-tooltip-trigger='true']") ||
        target.closest(".global-auto-tooltip") ||
        target.closest("[role='tooltip']") ||
        target.closest(".ui-tooltip-content")
      ) {
        return null;
      }

      // Suppress native titles up the tree
      suppressNativeTitles(target);

      // Check if target is inside an interactive container first (<a> or <button>)
      const interactiveParent = target.closest(
        "a, button, [role='button']"
      ) as HTMLElement | null;

      if (interactiveParent) {
        suppressNativeTitles(interactiveParent);

        if (
          interactiveParent.closest("[data-tooltip-trigger='true']") ||
          interactiveParent.getAttribute("data-tooltip-trigger") === "true"
        ) {
          return null;
        }

        const explicitTooltip =
          interactiveParent.getAttribute("data-tooltip") ||
          interactiveParent.getAttribute("data-original-title") ||
          interactiveParent.getAttribute("title");

        const isDropdownItem = !!interactiveParent.closest(
          ".mega-dropdown, [role='menu'], .dropdown-menu"
        );

        // Interactive Link
        if (interactiveParent.tagName.toLowerCase() === "a") {
          const linkText =
            explicitTooltip ||
            interactiveParent.getAttribute("aria-label") ||
            interactiveParent.textContent?.trim();
          const href = interactiveParent.getAttribute("href");

          if (linkText && linkText.length > 0 && linkText.length < 90 && href && href !== "#") {
            return {
              el: interactiveParent,
              text: linkText.length > 55 ? linkText.slice(0, 52) + "..." : linkText,
              badge: isDropdownItem ? "Sub-tab" : "Link",
              icon: isDropdownItem ? "📌" : "🔗",
              side: isDropdownItem ? "right" : undefined,
            };
          }
        }

        // Interactive Button
        if (
          interactiveParent.tagName.toLowerCase() === "button" ||
          interactiveParent.getAttribute("role") === "button"
        ) {
          const btnText =
            explicitTooltip ||
            interactiveParent.getAttribute("aria-label") ||
            interactiveParent.textContent?.trim();

          if (btnText && btnText.length > 0 && btnText.length < 80) {
            return {
              el: interactiveParent,
              text: btnText.length > 50 ? btnText.slice(0, 47) + "..." : btnText,
              badge: "Action",
              icon: "⚡",
            };
          }
        }
      }

      // Check up to 4 parent levels for semantic targets (headings, standalone images, explicit tooltips)
      let curr: HTMLElement | null = target;
      let depth = 0;
      while (curr && curr !== document.body && depth < 4) {
        const explicitTooltip =
          curr.getAttribute("data-tooltip") ||
          curr.getAttribute("data-original-title") ||
          curr.getAttribute("title");

        const tagName = curr.tagName.toLowerCase();

        // Standalone Images
        if (tagName === "img" || (tagName === "svg" && !curr.closest("a, button"))) {
          const altText =
            curr.getAttribute("alt") ||
            curr.getAttribute("aria-label") ||
            explicitTooltip;
          const imgCaption = curr
            .closest("figure")
            ?.querySelector("figcaption")?.textContent;
          const displayText = altText?.trim() || imgCaption?.trim();

          if (
            displayText &&
            displayText.length > 0 &&
            displayText !== "Global Awaaz Media"
          ) {
            return {
              el: curr,
              text:
                displayText.length > 55
                  ? displayText.slice(0, 52) + "..."
                  : displayText,
              badge: "Photo",
              icon: "🖼️",
            };
          }
        }

        // Headings (h1 - h6)
        if (/^h[1-6]$/.test(tagName)) {
          const headingText = curr.textContent?.trim() || explicitTooltip;
          if (headingText && headingText.length > 0) {
            return {
              el: curr,
              text:
                headingText.length > 60
                  ? headingText.slice(0, 57) + "..."
                  : headingText,
              badge: "Heading",
              icon: "📌",
            };
          }
        }

        // Explicit tooltip attribute
        if (explicitTooltip && explicitTooltip.trim()) {
          return {
            el: curr,
            text:
              explicitTooltip.trim().length > 60
                ? explicitTooltip.trim().slice(0, 57) + "..."
                : explicitTooltip.trim(),
            badge: "Info",
            icon: "💡",
          };
        }

        curr = curr.parentElement;
        depth++;
      }

      return null;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const match = findTargetElement(e);

      if (!match) {
        if (activeElementRef.current) {
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            setTooltip(null);
            activeElementRef.current = null;
          }, 80);
        }
        return;
      }

      // If already hovering this exact element, cancel pending hide and return
      if (activeElementRef.current === match.el) {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        return;
      }

      // Clear all pending timers before switching
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (warmTimerRef.current) {
        clearTimeout(warmTimerRef.current);
        warmTimerRef.current = null;
      }

      activeElementRef.current = match.el;

      const triggerDisplay = () => {
        if (!activeElementRef.current || activeElementRef.current !== match.el)
          return;

        const rect = match.el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setTooltip(null);
          return;
        }

        const viewportWidth = window.innerWidth;
        let side: "top" | "bottom" | "left" | "right" =
          match.side || (rect.top < 65 ? "bottom" : "top");

        if (side === "right" && rect.right + 220 > viewportWidth) {
          side = rect.left > 220 ? "left" : "top";
        }

        isWarmRef.current = true;
        setTooltip({
          text: match.text,
          badge: match.badge,
          icon: match.icon,
          rect,
          side,
        });
      };

      // Warm transfer: if user already has an active tooltip or was warm, update instantly!
      if (isWarmRef.current || tooltipRef.current !== null) {
        triggerDisplay();
      } else {
        // Cold start delay to avoid flurries on rapid cursor travel
        showTimerRef.current = setTimeout(triggerDisplay, 60);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;

      // Internal transition inside the active element: ignore
      if (
        activeElementRef.current &&
        related &&
        activeElementRef.current.contains(related)
      ) {
        return;
      }

      // Grace period before closing so moving to adjacent items feels immediate
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setTooltip(null);
        activeElementRef.current = null;

        if (warmTimerRef.current) clearTimeout(warmTimerRef.current);
        warmTimerRef.current = setTimeout(() => {
          isWarmRef.current = false;
        }, 350);
      }, 70);
    };

    const handleScrollOrResize = () => {
      if (tooltipRef.current && activeElementRef.current) {
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
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (warmTimerRef.current) clearTimeout(warmTimerRef.current);
    };
  }, [mounted]);

  if (!mounted || !tooltip || typeof document === "undefined") return null;

  const { rect, side, text } = tooltip;
  const viewportWidth = window.innerWidth;

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999999,
    pointerEvents: "none",
  };

  if (side === "top") {
    const centerX = rect.left + rect.width / 2;
    const leftPos = Math.max(16, Math.min(viewportWidth - 16, centerX));
    style.top = `${rect.top - 6}px`;
    style.left = `${leftPos}px`;
    style.transform = "translate(-50%, -100%)";
  } else if (side === "bottom") {
    const centerX = rect.left + rect.width / 2;
    const leftPos = Math.max(16, Math.min(viewportWidth - 16, centerX));
    style.top = `${rect.bottom + 6}px`;
    style.left = `${leftPos}px`;
    style.transform = "translate(-50%, 0)";
  } else if (side === "right") {
    style.top = `${rect.top + rect.height / 2}px`;
    style.left = `${rect.right + 8}px`;
    style.transform = "translate(0, -50%)";
  } else if (side === "left") {
    style.top = `${rect.top + rect.height / 2}px`;
    style.left = `${rect.left - 8}px`;
    style.transform = "translate(-100%, -50%)";
  }

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
