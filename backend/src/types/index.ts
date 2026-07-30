// =============================================================================
// Centralized Backend Types & Interfaces
// =============================================================================

import { Role } from "@prisma/client";

export type UserRole = Role;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginatedMeta;
  error?: string;
}
