import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/apiAuth";
import { getAllStaff, createOrUpdateStaff, deleteStaff } from "@/lib/services/staff";

// GET /api/v1/staff -> Retrieve all staff accounts from MySQL DB
export async function GET() {
  try {
    const data = await getAllStaff();
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (err: unknown) {
    console.error("Error fetching staff from DB:", err);
    return NextResponse.json({ success: false, data: [], count: 0 });
  }
}

// POST /api/v1/staff -> Create or update a staff account in MySQL DB
export async function POST(request: NextRequest) {
  // Require super_admin or chief_editor
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { name, email, password, roleSlug } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const user = await createOrUpdateStaff({ name, email, password, roleSlug });

    return NextResponse.json({
      success: true,
      data: user,
      message: `Staff account for ${user.name} created successfully in MySQL database`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("Error saving staff user to DB:", err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// DELETE /api/v1/staff?id=... -> Revoke/Delete staff account from MySQL DB
export async function DELETE(request: NextRequest) {
  // Require super_admin
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;
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
      return NextResponse.json({ success: false, message: "User ID or Email is required" }, { status: 400 });
    }

    await deleteStaff(id, email);

    return NextResponse.json({
      success: true,
      message: "Staff user revoked successfully from MySQL database",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("Error deleting staff user from DB:", err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
