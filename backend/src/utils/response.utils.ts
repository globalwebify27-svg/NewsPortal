// =============================================================================
// API Response Utilities — Consistent Response Format
// =============================================================================

import { Response } from "express";

// ─── Success Response ─────────────────────────────────────────────────────────
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  });
}

// ─── Created Response ─────────────────────────────────────────────────────────
export function sendCreated<T>(res: Response, data: T, message: string = "Resource created"): Response {
  return sendSuccess(res, data, message, 201);
}

// ─── Paginated Response ───────────────────────────────────────────────────────
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message: string = "Success"
): Response {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  res.setHeader("X-Total-Count", String(total));
  res.setHeader("X-Page", String(page));
  res.setHeader("X-Per-Page", String(limit));
  res.setHeader("X-Total-Pages", String(totalPages));

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
}

// ─── No Content ───────────────────────────────────────────────────────────────
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

// ─── Pagination Helper ─────────────────────────────────────────────────────────
export function getPaginationParams(
  query: Record<string, unknown>
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
