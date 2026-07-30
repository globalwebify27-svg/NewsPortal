// =============================================================================
// XSS Sanitizer Middleware — Strip Malicious Script Tags & Attributes
// =============================================================================

import { Request, Response, NextFunction } from "express";

function sanitizeString(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*>(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:[^"]*/gi, "");
}

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Preserve rich HTML text inside 'body' field (Phase 1 rich text Quill editor)
    if (key === "body" || key === "bodyHi" || key === "htmlCode") {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === "string") {
      sanitized[key] = sanitizeString(obj[key]);
    } else {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}
