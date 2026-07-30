// =============================================================================
// Admin Routes — Dashboard, Breaking News, Site Settings, User Roles, Audit Logs
// =============================================================================

import { Router } from "express";
import {
  getDashboardStats,
  getBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
  getSiteSettings,
  updateSiteSetting,
  getUsers,
  updateUserRole,
  getAuditLogs,
  getSystemVitals,
} from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin, requireSuperAdmin } from "../middleware/rbac.middleware";

export const adminRouter = Router();

adminRouter.use(protect, requireAdmin);

// Dashboard & System Vitals
adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/vitals", getSystemVitals);

// Breaking Ticker
adminRouter.get("/breaking-news", getBreakingNews);
adminRouter.post("/breaking-news", createBreakingNews);
adminRouter.put("/breaking-news/:id", updateBreakingNews);
adminRouter.delete("/breaking-news/:id", deleteBreakingNews);

// Settings
adminRouter.get("/settings", getSiteSettings);
adminRouter.post("/settings", updateSiteSetting);

// Users Management
adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id/role", requireSuperAdmin, updateUserRole);

// Audit Logs (SuperAdmin only)
adminRouter.get("/audit-logs", requireSuperAdmin, getAuditLogs);
