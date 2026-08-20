"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  cloneElement,
  isValidElement,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

// ── Types & Context ──────────────────────────────────────────────────────────

interface TriggerCoords {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerCoords: TriggerCoords | null;
  setTriggerCoords: (coords: TriggerCoords | null) => void;
  delayDuration: number;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

// ── Tooltip Root ─────────────────────────────────────────────────────────────

export interface TooltipProps {
  children: ReactNode;
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  children,
  delayDuration = 50,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [triggerCoords, setTriggerCoords] = useState<TriggerCoords | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (newOpen: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (newOpen && delayDuration > 0) {
      timeoutRef.current = setTimeout(() => {
        if (!isControlled) setUncontrolledOpen(true);
        onOpenChange?.(true);
      }, delayDuration);
    } else {
      if (!isControlled) setUncontrolledOpen(newOpen);
      onOpenChange?.(newOpen);
    }
  };

  return (
    <TooltipContext.Provider
      value={{
        isOpen,
        setIsOpen,
        triggerCoords,
        setTriggerCoords,
        delayDuration,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

// ── Tooltip Trigger ──────────────────────────────────────────────────────────

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  asChild?: boolean;
  render?: ReactNode;
}

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children, asChild, render, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
    const context = useContext(TooltipContext);
    const triggerRef = useRef<HTMLElement | null>(null);

    const updateCoords = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      context?.setTriggerCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      });
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      const el = (e.currentTarget || triggerRef.current) as HTMLElement;
      if (el) updateCoords(el);
      context?.setIsOpen(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      context?.setIsOpen(false);
      onMouseLeave?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
      const el = (e.currentTarget || triggerRef.current) as HTMLElement;
      if (el) updateCoords(el);
      context?.setIsOpen(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      context?.setIsOpen(false);
      onBlur?.(e);
    };

    const content = render || children;

    const setRef = (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as any).current = node;
    };

    if (isValidElement(content)) {
      return cloneElement(content as React.ReactElement, {
        ref: setRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        "data-tooltip-trigger": "true",
        ...props,
      });
    }

    return (
      <span
        ref={setRef as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-tooltip-trigger="true"
        tabIndex={0}
        style={{ display: "inline-flex", cursor: "pointer" }}
        {...props}
      >
        {content}
      </span>
    );
  }
);

TooltipTrigger.displayName = "TooltipTrigger";

// ── Tooltip Content ──────────────────────────────────────────────────────────

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      children,
      side = "bottom",
      align = "center",
      sideOffset = 5,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const context = useContext(TooltipContext);
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    const isOpen = context?.isOpen && mounted;
    const coords = context?.triggerCoords;

    if (!isOpen || !coords || typeof document === "undefined") return null;

    let fixedStyle: React.CSSProperties = {
      position: "fixed",
      zIndex: 99999999,
      pointerEvents: "none",
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      padding: "3px 7px",
      borderRadius: "4px",
      fontSize: "0.68rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12)",
      animation: "ga-tooltip-fade 0.14s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      ...style,
    };

    if (side === "top") {
      fixedStyle.top = `${coords.top - sideOffset}px`;
      fixedStyle.transform = align === "start" ? "translate(0, -100%)" : align === "end" ? "translate(-100%, -100%)" : "translate(-50%, -100%)";
      fixedStyle.left = align === "start" ? `${coords.left}px` : align === "end" ? `${coords.right}px` : `${coords.left + coords.width / 2}px`;
    } else if (side === "bottom") {
      fixedStyle.top = `${coords.bottom + sideOffset}px`;
      fixedStyle.transform = align === "start" ? "translate(0, 0)" : align === "end" ? "translate(-100%, 0)" : "translate(-50%, 0)";
      fixedStyle.left = align === "start" ? `${coords.left}px` : align === "end" ? `${coords.right}px` : `${coords.left + coords.width / 2}px`;
    } else if (side === "left") {
      fixedStyle.left = `${coords.left - sideOffset}px`;
      fixedStyle.top = `${coords.top + coords.height / 2}px`;
      fixedStyle.transform = "translate(-100%, -50%)";
    } else if (side === "right") {
      fixedStyle.left = `${coords.right + sideOffset}px`;
      fixedStyle.top = `${coords.top + coords.height / 2}px`;
      fixedStyle.transform = "translate(0, -50%)";
    }

    const tooltipElement = (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
        }}
        role="tooltip"
        style={fixedStyle}
        className={`ui-tooltip-content ${className}`}
        {...props}
      >
        {/* Arrow pointer */}
        <div
          style={{
            position: "absolute",
            width: "5px",
            height: "5px",
            backgroundColor: "#0f172a",
            transform: "rotate(45deg)",
            ...(side === "top"
              ? { bottom: "-2.5px", left: "calc(50% - 2.5px)", borderRight: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }
              : side === "bottom"
              ? { top: "-2.5px", left: "calc(50% - 2.5px)", borderLeft: "1px solid rgba(255,255,255,0.12)", borderTop: "1px solid rgba(255,255,255,0.12)" }
              : side === "left"
              ? { right: "-2.5px", top: "calc(50% - 2.5px)", borderRight: "1px solid rgba(255,255,255,0.12)", borderTop: "1px solid rgba(255,255,255,0.12)" }
              : { left: "-2.5px", top: "calc(50% - 2.5px)", borderLeft: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }),
          }}
        />
        {children}
      </div>
    );

    return createPortal(tooltipElement, document.body);
  }
);

TooltipContent.displayName = "TooltipContent";

// ── Demo Component ───────────────────────────────────────────────────────────

import { Button } from "./button";

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover</Button>} />
      <TooltipContent>
        <p style={{ margin: 0 }}>Add to library</p>
      </TooltipContent>
    </Tooltip>
  );
}
