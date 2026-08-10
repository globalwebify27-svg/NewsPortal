// =============================================================================
// Roles & Permissions Express Routes
// =============================================================================

import { Router } from "express";
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignUserRole,
  createUserAccount,
} from "../controllers/roles.controller";
import { protect } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

export const rolesRouter = Router();

rolesRouter.use(protect);

// Permissions endpoints
rolesRouter.get("/permissions", requirePermission("roles:manage"), getPermissions);

// Roles endpoints
rolesRouter.get("/", requirePermission("roles:manage"), getRoles);
rolesRouter.post("/", requirePermission("roles:manage"), createRole);
rolesRouter.put("/:id", requirePermission("roles:manage"), updateRole);
rolesRouter.delete("/:id", requirePermission("roles:manage"), deleteRole);

// User account creation & role assignment
rolesRouter.post("/users/create", requirePermission("users:manage"), createUserAccount);
rolesRouter.patch("/users/:userId/role", requirePermission("users:manage"), assignUserRole);
