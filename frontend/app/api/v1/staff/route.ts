import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Map string role slugs to Prisma Role Enum
function mapRole(roleSlug?: string): Role {
  const r = (roleSlug || "editor").toLowerCase();
  if (r.includes("super")) return Role.SUPERADMIN;
  if (r.includes("admin")) return Role.ADMIN;
  if (r.includes("publish")) return Role.PUBLISHER;
  if (r.includes("report")) return Role.REPORTER;
  if (r.includes("author")) return Role.AUTHOR;
  return Role.EDITOR;
}

// GET /api/v1/staff -> Retrieve all staff accounts from MySQL DB
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.SUPERADMIN, Role.ADMIN, Role.PUBLISHER, Role.EDITOR, Role.REPORTER, Role.AUTHOR]
        }
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      }
    });

    const mappedUsers = users.map(u => ({
      ...u,
      roleSlug: u.role.toLowerCase(),
      roleName: u.role,
    }));

    return NextResponse.json({
      success: true,
      data: mappedUsers,
      count: mappedUsers.length,
    });
  } catch (err: any) {
    console.error("Error fetching staff from DB:", err);
    return NextResponse.json({ success: false, data: [], count: 0 });
  }
}

// POST /api/v1/staff -> Create a new staff account in MySQL DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, roleSlug } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const assignedRole = mapRole(roleSlug);
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split("@")[0];

    const userRecord = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: displayName,
        password: password,
        role: assignedRole,
        isActive: true,
      },
      create: {
        name: displayName,
        email: cleanEmail,
        password: password,
        role: assignedRole,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        roleSlug: userRecord.role.toLowerCase(),
        roleName: userRecord.role,
        createdAt: userRecord.createdAt,
      },
      message: `Staff account for ${userRecord.name} created successfully in MySQL database`,
    });
  } catch (err: any) {
    console.error("Error saving staff user to DB:", err);
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/staff?id=... -> Revoke/Delete staff account from MySQL DB
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json({ success: false, message: "User ID or Email is required" }, { status: 400 });
    }

    const where: any = {};
    if (id) where.id = id;
    if (email) where.email = email.trim().toLowerCase();

    await prisma.user.deleteMany({ where });

    return NextResponse.json({
      success: true,
      message: "Staff user revoked successfully from MySQL database",
    });
  } catch (err: any) {
    console.error("Error deleting staff user from DB:", err);
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
