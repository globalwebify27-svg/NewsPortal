import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Safely access teamMember model even if IDE language server caches stale PrismaClient types
const dbTeamMember = (prisma as any).teamMember;

// GET /api/v1/team -> Retrieve team members
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  try {
    const where: any = {};
    if (!admin) {
      where.isActive = true;
    }

    const members = dbTeamMember
      ? await dbTeamMember.findMany({
          where,
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        })
      : [];

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// POST /api/v1/team -> Create or Update Team Member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      nameHi,
      designation,
      designationHi,
      bio,
      bioHi,
      avatar,
      email,
      phone,
      twitter,
      linkedin,
      facebook,
      instagram,
      order,
      isActive,
    } = body;

    if (!name || !designation) {
      return NextResponse.json(
        { success: false, message: "Name and designation are required" },
        { status: 400 }
      );
    }

    const payload = {
      name: name.trim(),
      nameHi: nameHi?.trim() || null,
      designation: designation.trim(),
      designationHi: designationHi?.trim() || null,
      bio: bio || null,
      bioHi: bioHi || null,
      avatar: avatar || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      twitter: twitter?.trim() || null,
      linkedin: linkedin?.trim() || null,
      facebook: facebook?.trim() || null,
      instagram: instagram?.trim() || null,
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    if (!dbTeamMember) {
      return NextResponse.json(
        { success: false, message: "Database model TeamMember not available" },
        { status: 500 }
      );
    }

    let member;
    if (id) {
      member = await dbTeamMember.update({
        where: { id },
        data: payload,
      });
    } else {
      member = await dbTeamMember.create({
        data: payload,
      });
    }

    return NextResponse.json({
      success: true,
      data: member,
      message: `Team member '${member.name}' saved successfully in MySQL DB`,
    });
  } catch (error: any) {
    console.error("Error saving team member:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/team?id=... -> Delete team member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Team member ID is required" },
        { status: 400 }
      );
    }

    if (!dbTeamMember) {
      return NextResponse.json(
        { success: false, message: "Database model TeamMember not available" },
        { status: 500 }
      );
    }

    await dbTeamMember.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully from MySQL DB",
    });
  } catch (error: any) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

