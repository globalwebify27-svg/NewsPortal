// =============================================================================
// /api/v1/staff — Secure RBAC Staff User Management API
// Backed exclusively by MySQL (users table).
// Enforces role-based permissions and server-side validation.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/apiAuth";
import {
  getAllStaff,
  createStaffUser,
  toggleStaffStatus,
  resetStaffPassword,
  deleteStaff,
} from "@/lib/services/staff";

// GET /api/v1/staff -> Retrieve all staff accounts from MySQL DB (sanitized)
export async function GET() {
  try {
    const data = await getAllStaff();
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (err: unknown) {
    console.error("[api/v1/staff] Error fetching staff:", err);
    return NextResponse.json({ success: false, data: [], count: 0 }, { status: 500 });
  }
}

// POST /api/v1/staff -> Create user, toggle status, or reset temporary password
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const actorRole = auth.payload.role;
  const actorId = auth.payload.userId;

  // Only super_admin or chief_editor can manage staff
  if (actorRole !== "super_admin" && actorRole !== "chief_editor") {
    return NextResponse.json(
      { success: false, message: "Permission denied. Chief Editor or Super Admin required." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || "create";

    // ── Action: Toggle Active/Suspended Status ─────────────────────────────
    if (action === "toggle_status") {
      const { userId, isActive } = body;
      if (!userId || typeof isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "userId and isActive boolean are required" },
          { status: 400 }
        );
      }

      const updated = await toggleStaffStatus(userId, isActive, actorId);
      return NextResponse.json({
        success: true,
        data: updated,
        message: `Account status updated to ${isActive ? "Active" : "Suspended"}`,
      });
    }

    // ── Action: Reset Temporary Password ──────────────────────────────────
    if (action === "reset_password") {
      const { userId, newPassword, password } = body;
      if (!userId) {
        return NextResponse.json(
          { success: false, message: "userId is required for password reset" },
          { status: 400 }
        );
      }

      const passToSet = newPassword || password;
      const result = await resetStaffPassword(userId, actorId, passToSet);
      return NextResponse.json({
        success: true,
        data: result.user,
        temporaryPassword: result.temporaryPassword,
        message: "New password saved and applied successfully",
      });
    }

    // ── Action: Create Staff User ──────────────────────────────────────────
    const { name, email, password, roleSlug } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required to create a staff account" },
        { status: 400 }
      );
    }

    // Chief Editors may ONLY create Editors
    let targetRoleSlug = roleSlug || "editor";
    if (actorRole === "chief_editor") {
      targetRoleSlug = "editor";
    }

    const { user, temporaryPassword } = await createStaffUser(
      {
        name,
        email,
        password,
        roleSlug: targetRoleSlug,
      },
      actorId
    );

    return NextResponse.json({
      success: true,
      data: user,
      temporaryPassword,
      message: `Staff account for ${user.name} created successfully in MySQL database`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("[api/v1/staff] Error processing request:", err);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}

// DELETE /api/v1/staff?id=... -> Delete/Revoke staff account
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  // Only Super Admin can delete staff accounts
  if (auth.payload.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "Only Super Admin can delete staff accounts." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: "User ID or Email is required" },
        { status: 400 }
      );
    }

    await deleteStaff(id, email, auth.payload.userId);

    return NextResponse.json({
      success: true,
      message: "Staff user removed successfully from MySQL database",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("[api/v1/staff] Error deleting staff user:", err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
