import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "staff_users_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "staff_users_db.json");

function getDbPath(): string {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (fs.existsSync(dir)) {
      return DB_FILE_PATH;
    }
  } catch (e) {}
  return ALT_DB_FILE_PATH;
}

function readStaffUsers(): any[] {
  try {
    const filePath = getDbPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading staff DB file:", e);
  }
  return [];
}

function writeStaffUsers(users: any[]): boolean {
  try {
    const filePath = getDbPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing staff DB file:", e);
    return false;
  }
}

// GET /api/v1/staff -> Retrieve all staff accounts from central DB
export async function GET() {
  const users = readStaffUsers();
  return NextResponse.json({
    success: true,
    data: users,
    count: users.length,
  });
}

// POST /api/v1/staff -> Create a new staff account in central DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, roleSlug, roleName, createdBy } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const currentUsers = readStaffUsers();
    const existingIndex = currentUsers.findIndex(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    const newUserObj = {
      id: existingIndex >= 0 ? currentUsers[existingIndex].id : `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name?.trim() || email.split("@")[0],
      email: email.trim().toLowerCase(),
      password: password,
      roleSlug: roleSlug || "editor",
      roleName: roleName || "Editor",
      createdBy: createdBy || "Super Admin",
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      currentUsers[existingIndex] = newUserObj;
    } else {
      currentUsers.unshift(newUserObj);
    }

    const saved = writeStaffUsers(currentUsers);
    if (!saved) {
      return NextResponse.json({ success: false, message: "Failed to save to database" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newUserObj,
      message: `Staff account for ${newUserObj.name} created successfully in central database`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/staff?id=... -> Revoke/Delete staff account from central DB
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json({ success: false, message: "User ID or Email is required" }, { status: 400 });
    }

    let currentUsers = readStaffUsers();
    const initialLength = currentUsers.length;

    currentUsers = currentUsers.filter((u) => {
      if (id && u.id === id) return false;
      if (email && u.email.toLowerCase() === email.toLowerCase()) return false;
      return true;
    });

    if (currentUsers.length === initialLength) {
      return NextResponse.json({ success: false, message: "Staff user not found" }, { status: 404 });
    }

    writeStaffUsers(currentUsers);
    return NextResponse.json({
      success: true,
      message: "Staff user revoked successfully from central database",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
