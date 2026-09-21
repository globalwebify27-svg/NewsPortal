// =============================================================================
// XSS Sanitizer Middleware — Uses `sanitize-html` for robust XSS prevention
// =============================================================================

import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

// ─── Allowlist for Rich Text (Quill editor body fields) ──────────────────────
// Only safe structural/formatting tags are allowed. All scripts, event handlers,
// and dangerous attributes are stripped by default.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "blockquote", "pre", "code",
    "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "s", "strike",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span", "figure", "figcaption",
    "sub", "sup",
  ],
  allowedAttributes: {
    "*": ["class", "style", "dir", "lang"],
    "a": ["href", "target", "rel", "title"],
    "img": ["src", "alt", "width", "height", "loading"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan", "scope"],
  },
  allowedSchemes: ["http", "https", "data"],
  // Strip all event handler attributes like onclick, onerror, etc.
  disallowedTagsMode: "discard",
};

// ─── Plain Text Options (for all non-rich-text fields) ────────────────────────
const PLAIN_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

// ─── Rich Text Field Names ─────────────────────────────────────────────────────
const RICH_TEXT_FIELDS = new Set(["body", "bodyHi", "htmlCode", "content"]);

function sanitizeValue(value: unknown, fieldName?: string): unknown {
  if (typeof value === "string") {
    if (fieldName && RICH_TEXT_FIELDS.has(fieldName)) {
      return sanitizeHtml(value, RICH_TEXT_OPTIONS);
    }
    return sanitizeHtml(value, PLAIN_TEXT_OPTIONS);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key], key);
    }
    return sanitized;
  }
  return value;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query) as typeof req.query;
  if (req.params) req.params = sanitizeValue(req.params) as typeof req.params;
  next();
}
