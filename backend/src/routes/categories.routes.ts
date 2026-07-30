// =============================================================================
// Category Routes — Public Read & Admin Write
// =============================================================================

import { Router } from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/rbac.middleware";

export const categoriesRouter = Router();

// Public
categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:slug", getCategoryBySlug);

// Protected (Admin only)
categoriesRouter.use(protect, requireAdmin);
categoriesRouter.post("/", createCategory);
categoriesRouter.put("/:id", updateCategory);
categoriesRouter.delete("/:id", deleteCategory);
