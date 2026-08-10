// =============================================================================
// Role & Permission Management Controller
// =============================================================================

import { Request, Response, NextFunction } from "express";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { BadRequestError, ForbiddenError, NotFoundError } from "../middleware/error.middleware";
import { logAudit } from "../services/audit.service";
import { Role } from "@prisma/client";

// ─── 1. Get All Roles with Permissions & User Counts ───────────────────────
export async function getRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await prisma.roleModel.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    const formattedRoles = roles.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.users,
      permissions: r.permissions.map((p) => p.permission),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    sendSuccess(res, formattedRoles, "Roles retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 2. Get All System Permissions Grouped by Module ─────────────────────────
export async function getPermissions(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { slug: "asc" }],
    });

    // Group by module
    const grouped: Record<string, typeof permissions> = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    });

    sendSuccess(res, { permissions, grouped }, "Permissions list retrieved.");
  } catch (error) {
    next(error);
  }
}

// ─── 3. Create Custom Role ───────────────────────────────────────────────────
export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, permissionIds } = req.body;

    if (!name || typeof name !== "string") {
      throw new BadRequestError("Role name is required.");
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check slug uniqueness
    const existing = await prisma.roleModel.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestError(`Role with name or slug '${name}' already exists.`);
    }

    const newRole = await prisma.roleModel.create({
      data: {
        name,
        slug,
        description: description || "",
        isSystem: false,
      },
    });

    // Attach permissions
    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
      const rolePermissionsData = permissionIds.map((pId: string) => ({
        roleId: newRole.id,
        permissionId: pId,
      }));
      await prisma.rolePermission.createMany({
        data: rolePermissionsData,
      });
    }

    const createdRole = await prisma.roleModel.findUnique({
      where: { id: newRole.id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    await logAudit(req, {
      action: "CREATE_ROLE",
      resource: "roles",
      resourceId: newRole.id,
      after: { name, slug, permissionIds },
    });

    sendCreated(res, createdRole, "Custom role created successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 4. Update Role & Permission Matrix ──────────────────────────────────────
export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { name, description, permissionIds } = req.body;

    const existingRole = await prisma.roleModel.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!existingRole) {
      throw new NotFoundError("Role not found.");
    }

    // Protection: System default Super Admin role permissions cannot be trimmed
    if (existingRole.slug === "super_admin" && Array.isArray(permissionIds)) {
      const totalPermissions = await prisma.permission.count();
      if (permissionIds.length < totalPermissions) {
        throw new ForbiddenError("Super Admin role must retain all system permissions.");
      }
    }

    const updated = await prisma.roleModel.update({
      where: { id },
      data: {
        ...(name && !existingRole.isSystem && { name, slug: slugify(name, { lower: true, strict: true }) }),
        ...(description !== undefined && { description }),
      },
    });

    // Replace permissions if array passed
    if (Array.isArray(permissionIds)) {
      // Remove existing connections
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      if (permissionIds.length > 0) {
        const newConnections = permissionIds.map((pId: string) => ({
          roleId: id,
          permissionId: pId,
        }));
        await prisma.rolePermission.createMany({
          data: newConnections,
        });
      }
    }

    const result = await prisma.roleModel.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    await logAudit(req, {
      action: "UPDATE_ROLE",
      resource: "roles",
      resourceId: id,
      before: { name: existingRole.name, permissionCount: existingRole.permissions.length },
      after: { name: updated.name, permissionCount: permissionIds?.length },
    });

    sendSuccess(res, result, "Role updated successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 5. Delete Custom Role ────────────────────────────────────────────────────
export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const role = await prisma.roleModel.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    // Protection: Prevent deletion of system roles
    if (role.isSystem) {
      throw new ForbiddenError(`System default role '${role.name}' cannot be deleted.`);
    }

    // Protection: Prevent deletion of roles assigned to active users
    if (role._count.users > 0) {
      throw new BadRequestError(`Cannot delete role '${role.name}'. It is currently assigned to ${role._count.users} user(s). Reassign them first.`);
    }

    await prisma.roleModel.delete({ where: { id } });

    await logAudit(req, {
      action: "DELETE_ROLE",
      resource: "roles",
      resourceId: id,
      before: { name: role.name, slug: role.slug },
    });

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// ─── 6. Assign User Role with Safeguards ─────────────────────────────────────
export async function assignUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const { roleId, isActive } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { customRole: true },
    });

    if (!targetUser) {
      throw new NotFoundError("Target user not found.");
    }

    // Safeguard 1: Self-Role Demotion / Deletion Guard
    if (req.user && req.user.id === userId && roleId && targetUser.roleId !== roleId) {
      throw new ForbiddenError("Security Violation: You cannot alter or demote your own active role.");
    }

    // Safeguard 2: Super Admin Protection Guard
    // If target is Super Admin and requester is not Super Admin
    if (targetUser.role === Role.SUPERADMIN || targetUser.customRole?.slug === "super_admin") {
      if (req.user?.role !== Role.SUPERADMIN) {
        throw new ForbiddenError("Security Protection: Only primary Super Admin can modify a Super Admin account.");
      }
    }

    let selectedRoleModel = null;
    let mappedRoleEnum: Role = targetUser.role;

    if (roleId) {
      selectedRoleModel = await prisma.roleModel.findUnique({ where: { id: roleId } });
      if (!selectedRoleModel) {
        throw new NotFoundError("Selected role does not exist.");
      }

      // Map slug to Enum for backward compatibility
      if (selectedRoleModel.slug === "super_admin") mappedRoleEnum = Role.SUPERADMIN;
      else if (selectedRoleModel.slug === "chief_editor") mappedRoleEnum = Role.ADMIN;
      else if (selectedRoleModel.slug === "editor") mappedRoleEnum = Role.EDITOR;
      else mappedRoleEnum = Role.EDITOR;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(roleId && { roleId, role: mappedRoleEnum }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        customRole: { select: { id: true, name: true, slug: true } },
        isActive: true,
        updatedAt: true,
      },
    });

    await logAudit(req, {
      action: "ASSIGN_USER_ROLE",
      resource: "users",
      resourceId: userId,
      before: { role: targetUser.role, roleId: targetUser.roleId, isActive: targetUser.isActive },
      after: { role: updatedUser.role, roleId: updatedUser.roleId, isActive: updatedUser.isActive },
    });

    sendSuccess(res, updatedUser, "User role and security status updated successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 7. Create User Account with Role & Login Credentials ─────────────────────
export async function createUserAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, roleSlug, roleId } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError("Name, Email, and Password are required.");
    }

    const requesterRole = req.user?.role;

    // Check user uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      throw new BadRequestError(`User with email '${email}' already exists.`);
    }

    // Resolve target role
    let targetRoleModel = null;
    if (roleId) {
      targetRoleModel = await prisma.roleModel.findUnique({ where: { id: roleId } });
    } else if (roleSlug) {
      targetRoleModel = await prisma.roleModel.findUnique({ where: { slug: roleSlug } });
    }

    const targetSlug = targetRoleModel?.slug || roleSlug || "editor";

    // Enforce Creation Scope Rules:
    // - Chief Editor can ONLY create Editor accounts.
    // - Super Admin can create Chief Editor and Editor accounts.
    if (requesterRole !== Role.SUPERADMIN) {
      if (targetSlug !== "editor") {
        throw new ForbiddenError(
          "Permission Denied: Chief Editors can only create 'Editor' user accounts."
        );
      }
    }

    // Prevent non-SuperAdmins from creating Super Admin accounts
    if (targetSlug === "super_admin" && requesterRole !== Role.SUPERADMIN) {
      throw new ForbiddenError("Permission Denied: Only Super Admin can create another Super Admin account.");
    }

    // Map target slug to Role enum
    let mappedRoleEnum: Role = Role.EDITOR;
    if (targetSlug === "super_admin") mappedRoleEnum = Role.SUPERADMIN;
    else if (targetSlug === "chief_editor") mappedRoleEnum = Role.ADMIN;
    else mappedRoleEnum = Role.EDITOR;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: mappedRoleEnum,
        roleId: targetRoleModel?.id || null,
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        customRole: { select: { id: true, name: true, slug: true } },
        isActive: true,
        createdAt: true,
      },
    });

    await logAudit(req, {
      action: "CREATE_USER_ACCOUNT",
      resource: "users",
      resourceId: newUser.id,
      after: { name, email, role: mappedRoleEnum, targetSlug },
    });

    sendCreated(res, newUser, `User account for ${name} (${targetSlug.toUpperCase()}) created successfully.`);
  } catch (error) {
    next(error);
  }
}
