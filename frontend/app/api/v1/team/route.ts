import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to get TeamMember model dynamically from Prisma instance
function getTeamModel() {
  return (prisma as any).teamMember || (prisma as any).TeamMember;
}

// GET /api/v1/team -> Retrieve team members
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  try {
    const dbTeamMember = getTeamModel();
    let members: any[] = [];

    if (dbTeamMember) {
      const where: any = {};
      if (!admin) {
        where.isActive = true;
      }

      members = await dbTeamMember.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
    } else {
      // Direct raw SQL fallback for MySQL
      const rawQuery = admin
        ? `SELECT * FROM team_members ORDER BY \`order\` ASC, createdAt ASC`
        : `SELECT * FROM team_members WHERE isActive = 1 ORDER BY \`order\` ASC, createdAt ASC`;
      members = (await prisma.$queryRawUnsafe(rawQuery)) as any[];
    }

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

    const dbTeamMember = getTeamModel();
    let member: any;

    if (dbTeamMember) {
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
    } else {
      // Raw MySQL fallback execution
      const newId = id || `tm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      if (id) {
        await prisma.$executeRawUnsafe(
          `UPDATE team_members SET 
            name = ?, nameHi = ?, designation = ?, designationHi = ?, 
            bio = ?, bioHi = ?, avatar = ?, email = ?, phone = ?, 
            twitter = ?, linkedin = ?, facebook = ?, instagram = ?, 
            \`order\` = ?, isActive = ?, updatedAt = ? 
           WHERE id = ?`,
          payload.name,
          payload.nameHi,
          payload.designation,
          payload.designationHi,
          payload.bio,
          payload.bioHi,
          payload.avatar,
          payload.email,
          payload.phone,
          payload.twitter,
          payload.linkedin,
          payload.facebook,
          payload.instagram,
          payload.order,
          payload.isActive ? 1 : 0,
          now,
          id
        );
        member = { id, ...payload };
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO team_members (
            id, name, nameHi, designation, designationHi, 
            bio, bioHi, avatar, email, phone, 
            twitter, linkedin, facebook, instagram, 
            \`order\`, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          newId,
          payload.name,
          payload.nameHi,
          payload.designation,
          payload.designationHi,
          payload.bio,
          payload.bioHi,
          payload.avatar,
          payload.email,
          payload.phone,
          payload.twitter,
          payload.linkedin,
          payload.facebook,
          payload.instagram,
          payload.order,
          payload.isActive ? 1 : 0,
          now,
          now
        );
        member = { id: newId, ...payload };
      }
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

    const dbTeamMember = getTeamModel();
    if (dbTeamMember) {
      await dbTeamMember.delete({ where: { id } });
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM team_members WHERE id = ?`, id);
    }

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


