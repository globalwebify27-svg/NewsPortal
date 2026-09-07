// =============================================================================
// Staff Service — Server-Side Business Logic for Admin & Staff Accounts
// =============================================================================

import { prisma } from "../prisma";
import { Role } from "@prisma/client";
import { hashPassword } from "../auth";

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

export async function getAllStaff(): Promise<StaffUserSummary[]> {
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
    },
  });

  return users.map((u) => {
    const meta = getRoleMeta(u.role);
    return {
      ...u,
      ...meta,
    };
  });
}

export async function createOrUpdateStaff(input: CreateStaffInput) {
  const assignedRole = mapRole(input.roleSlug);
  const cleanEmail = input.email.trim().toLowerCase();
  const displayName = input.name?.trim() || cleanEmail.split("@")[0];

  const hashedPassword = input.password ? await hashPassword(input.password) : undefined;

  const userRecord = await prisma.user.upsert({
    where: { email: cleanEmail },
    update: {
      name: displayName,
      ...(hashedPassword ? { password: hashedPassword } : {}),
      role: assignedRole,
      isActive: true,
    },
    create: {
      name: displayName,
      email: cleanEmail,
      password: hashedPassword || "",
      role: assignedRole,
      isActive: true,
    },
  });

  const meta = getRoleMeta(userRecord.role);

  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    ...meta,
    createdAt: userRecord.createdAt,
  };
}

export async function deleteStaff(id?: string | null, email?: string | null) {
  const where: { id?: string; email?: string } = {};
  if (id) where.id = id;
  if (email) where.email = email.trim().toLowerCase();

  return prisma.user.deleteMany({ where });
}
