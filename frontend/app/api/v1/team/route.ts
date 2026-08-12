import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to get TeamMember model dynamically from Prisma instance
function getTeamModel() {
  return (prisma as any).teamMember || (prisma as any).TeamMember;
}

function cleanImageUrl(imgUrl?: string | null): string | null {
  if (!imgUrl) return null;
  let url = imgUrl.trim();

  // Fix malformed protocol (https// -> https:// or http// -> http://)
  if (url.startsWith("https//")) url = url.replace("https//", "https://");
  if (url.startsWith("http//")) url = url.replace("http//", "http://");

  // Rewrite Hostinger internal hostname to main domain
  if (url.includes("yellowgreen-rook-384455.hostingersite.com")) {
    const pathPart = url
      .replace("https://yellowgreen-rook-384455.hostingersite.com", "")
      .replace("http://yellowgreen-rook-384455.hostingersite.com", "")
      .replace("//yellowgreen-rook-384455.hostingersite.com", "");
    url = `https://www.globalawaaz.com${pathPart.startsWith("/") ? pathPart : `/${pathPart}`}`;
  }

  return url;
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

    const sanitizedMembers = (members || []).map((m: any) => ({
      ...m,
      avatar: cleanImageUrl(m.avatar)
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedMembers,
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
      education,
      experience,
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
      avatar: cleanImageUrl(avatar),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      twitter: twitter?.trim() || null,
      linkedin: linkedin?.trim() || null,
      facebook: facebook?.trim() || null,
      instagram: instagram?.trim() || null,
      education: education?.trim() || null,
      experience: experience?.trim() || null,
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    const dbTeamMember = getTeamModel();
    let member: any;

    const saveViaRawSql = async (memberId: string | undefined, data: typeof payload) => {
      const newId = memberId || `tm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      if (memberId) {
        await prisma.$executeRawUnsafe(
          `UPDATE team_members SET 
            name = ?, nameHi = ?, designation = ?, designationHi = ?, 
            bio = ?, bioHi = ?, avatar = ?, email = ?, phone = ?, 
            twitter = ?, linkedin = ?, facebook = ?, instagram = ?, 
            education = ?, experience = ?,
            \`order\` = ?, isActive = ?, updatedAt = ? 
           WHERE id = ?`,
          data.name,
          data.nameHi,
          data.designation,
          data.designationHi,
          data.bio,
          data.bioHi,
          data.avatar,
          data.email,
          data.phone,
          data.twitter,
          data.linkedin,
          data.facebook,
          data.instagram,
          data.education,
          data.experience,
          data.order,
          data.isActive ? 1 : 0,
          now,
          memberId
        );
        return { id: memberId, ...data };
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO team_members (
            id, name, nameHi, designation, designationHi, 
            bio, bioHi, avatar, email, phone, 
            twitter, linkedin, facebook, instagram, 
            education, experience,
            \`order\`, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          newId,
          data.name,
          data.nameHi,
          data.designation,
          data.designationHi,
          data.bio,
          data.bioHi,
          data.avatar,
          data.email,
          data.phone,
          data.twitter,
          data.linkedin,
          data.facebook,
          data.instagram,
          data.education,
          data.experience,
          data.order,
          data.isActive ? 1 : 0,
          now,
          now
        );
        return { id: newId, ...data };
      }
    };

    if (dbTeamMember) {
      try {
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
      } catch (ormErr: any) {
        console.warn("Prisma ORM validation warning, saving via Raw SQL fallback:", ormErr?.message);
        member = await saveViaRawSql(id, payload);
      }
    } else {
      member = await saveViaRawSql(id, payload);
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


