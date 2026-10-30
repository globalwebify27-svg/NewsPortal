// =============================================================================
// Staff Service — Production MySQL-Backed RBAC User Management
// - MySQL is the exclusive source of truth
// - Passwords and MFA secrets are NEVER returned via API
// - Temporary passwords generated cryptographically and displayed only once
// - Full audit logging on user creation, status changes, and resets
// =============================================================================

import { prisma } from "../prisma";
import { Role } from "@prisma/client";
import { hashPassword, generateSecurePassword } from "../auth";
import { logAuditEvent } from "../audit";
import { serverCache, TTL } from "../cache";

const CACHE_KEY_STAFF = "staff:all:list";

export interface StaffUserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  roleSlug: string;
  roleName: string;
  mustChangePassword?: boolean;
  twoFAEnabled?: boolean;
}

export interface CreateStaffInput {
  name?: string;
  email: string;
  password?: string;
  roleSlug?: string;
}

export function mapRole(roleSlug?: string): Role {
  const r = (roleSlug || "editor").toLowerCase();
  if (r.includes("super")) return Role.SUPERADMIN;
  if (r.includes("chief") || r.includes("admin")) return Role.ADMIN;
  if (r.includes("publish")) return Role.PUBLISHER;
  if (r.includes("report")) return Role.REPORTER;
  if (r.includes("author")) return Role.AUTHOR;
  return Role.EDITOR;
}

export function getRoleMeta(role: Role): { roleSlug: string; roleName: string } {
  if (role === Role.ADMIN) return { roleSlug: "chief_editor", roleName: "Chief Editor" };
  if (role === Role.SUPERADMIN) return { roleSlug: "super_admin", roleName: "Super Admin" };
  if (role === Role.EDITOR) return { roleSlug: "editor", roleName: "Editor" };
  if (role === Role.PUBLISHER) return { roleSlug: "publisher", roleName: "Publisher" };
  if (role === Role.REPORTER) return { roleSlug: "reporter", roleName: "Reporter" };
  if (role === Role.AUTHOR) return { roleSlug: "author", roleName: "Author" };
  return { roleSlug: "editor", roleName: "Editor" };
}

/**
 * Retrieve all active and registered staff accounts strictly from MySQL.
 * Guaranteed: never returns password or twoFASecret.
 */
export async function getAllStaff(): Promise<StaffUserSummary[]> {
  const cached = serverCache.get<StaffUserSummary[]>(CACHE_KEY_STAFF);
  if (cached) return cached;

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.SUPERADMIN, Role.ADMIN, Role.PUBLISHER, Role.EDITOR, Role.REPORTER, Role.AUTHOR],
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        mustChangePassword: true,
        twoFAEnabled: true,
      },
    });

    const result = users.map((u) => {
      const meta = getRoleMeta(u.role);
      return {
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        isActive: u.isActive ?? true,
        createdAt: u.createdAt,
        roleSlug: meta.roleSlug,
        roleName: meta.roleName,
        mustChangePassword: u.mustChangePassword ?? false,
        twoFAEnabled: u.twoFAEnabled ?? false,
      };
    });

    serverCache.set(CACHE_KEY_STAFF, result, TTL.STAFF);
    return result;
  } catch (err) {
    console.error("[staff_service] Error querying staff users from DB:", err);
    return serverCache.getStale<StaffUserSummary[]>(CACHE_KEY_STAFF) || [];
  }
}

/**
 * Create a new staff account in MySQL.
 * Generates a strong temporary password if none is provided.
 * Forces password change on first login.
 */
export async function createStaffUser(
  input: CreateStaffInput,
  actorUserId?: string
): Promise<{ user: StaffUserSummary; temporaryPassword: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const assignedRole = mapRole(input.roleSlug);
  const displayName = input.name?.trim() || cleanEmail.split("@")[0];

  // Prevent duplicate email registration
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error(`An account with email '${cleanEmail}' already exists in the system.`);
  }

  const temporaryPassword = input.password && input.password.trim().length >= 8
    ? input.password.trim()
    : generateSecurePassword(16);

  const hashedPassword = await hashPassword(temporaryPassword);
  const meta = getRoleMeta(assignedRole);

  const newUser = await prisma.user.create({
    data: {
      name: displayName,
      email: cleanEmail,
      password: hashedPassword,
      role: assignedRole,
      isActive: true,
      mustChangePassword: true,
      failedLoginAttempts: 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      mustChangePassword: true,
      twoFAEnabled: true,
    },
  });

  await logAuditEvent({
    userId: actorUserId,
    action: "USER_CREATE",
    resource: "USER",
    resourceId: newUser.id,
    after: { email: cleanEmail, role: meta.roleSlug, name: displayName },
  });

  serverCache.delete(CACHE_KEY_STAFF);

  const summary: StaffUserSummary = {
    id: newUser.id,
    name: newUser.name || displayName,
    email: newUser.email,
    role: newUser.role,
    avatar: newUser.avatar,
    isActive: newUser.isActive ?? true,
    createdAt: newUser.createdAt,
    roleSlug: meta.roleSlug,
    roleName: meta.roleName,
    mustChangePassword: newUser.mustChangePassword,
    twoFAEnabled: newUser.twoFAEnabled,
  };

  return { user: summary, temporaryPassword };
}

/** Backward compatibility helper for legacy call signatures */
export async function createOrUpdateStaff(input: CreateStaffInput) {
  const result = await createStaffUser(input);
  return {
    ...result.user,
    temporaryPassword: result.temporaryPassword,
  };
}

/**
 * Toggle or set staff account status (Active / Inactive / Suspended)
 */
export async function toggleStaffStatus(
  userId: string,
  isActive: boolean,
  actorUserId?: string
): Promise<StaffUserSummary> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      mustChangePassword: true,
      twoFAEnabled: true,
    },
  });

  await logAuditEvent({
    userId: actorUserId,
    action: "USER_STATUS_CHANGE",
    resource: "USER",
    resourceId: userId,
    after: { isActive },
  });

  serverCache.delete(CACHE_KEY_STAFF);

  const meta = getRoleMeta(updated.role);
  return {
    id: updated.id,
    name: updated.name || updated.email.split("@")[0],
    email: updated.email,
    role: updated.role,
    avatar: updated.avatar,
    isActive: updated.isActive ?? true,
    createdAt: updated.createdAt,
    roleSlug: meta.roleSlug,
    roleName: meta.roleName,
    mustChangePassword: updated.mustChangePassword,
    twoFAEnabled: updated.twoFAEnabled,
  };
}

/**
 * Generate a new temporary password for a staff account and reset lockouts.
 */
export async function resetStaffPassword(
  userId: string,
  actorUserId?: string,
  customPassword?: string
): Promise<{ temporaryPassword: string; user: StaffUserSummary }> {
  const temporaryPassword = (customPassword && customPassword.trim().length >= 6)
    ? customPassword.trim()
    : generateSecurePassword(16);
  const hashedPassword = await hashPassword(temporaryPassword);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      mustChangePassword: true,
      twoFAEnabled: true,
    },
  });

  await logAuditEvent({
    userId: actorUserId,
    action: "PASSWORD_RESET_REQUEST",
    resource: "USER",
    resourceId: userId,
  });

  serverCache.delete(CACHE_KEY_STAFF);

  const meta = getRoleMeta(updated.role);
  return {
    temporaryPassword,
    user: {
      id: updated.id,
      name: updated.name || updated.email.split("@")[0],
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      isActive: updated.isActive ?? true,
      createdAt: updated.createdAt,
      roleSlug: meta.roleSlug,
      roleName: meta.roleName,
      mustChangePassword: updated.mustChangePassword,
      twoFAEnabled: updated.twoFAEnabled,
    },
  };
}

/**
 * Safely delete / revoke a staff account from MySQL.
 */
export async function deleteStaff(id?: string | null, email?: string | null, actorUserId?: string) {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanId = id?.trim();

  const where: { id?: string; email?: string } = {};
  if (cleanId) where.id = cleanId;
  else if (cleanEmail) where.email = cleanEmail;
  else return false;

  const target = await prisma.user.findFirst({ where });
  if (!target) return false;

  // Never allow deleting the primary Super Admin
  if (target.email === "global2409@globalawaaz.com" || target.role === Role.SUPERADMIN) {
    throw new Error("Super Admin accounts cannot be deleted directly.");
  }

  await prisma.user.delete({ where: { id: target.id } });

  serverCache.delete(CACHE_KEY_STAFF);

  await logAuditEvent({
    userId: actorUserId,
    action: "USER_DELETE",
    resource: "USER",
    resourceId: target.id,
    before: { email: target.email, name: target.name, role: target.role },
  });

  return true;
}
