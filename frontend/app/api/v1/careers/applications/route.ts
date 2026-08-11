import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getJobAppModel() {
  return (prisma as any).jobApplication || (prisma as any).JobApplication;
}

// GET /api/v1/careers/applications -> List candidate applications for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const dbJobApp = getJobAppModel();
    let applications: any[] = [];

    if (dbJobApp) {
      const where: any = {};
      if (jobId) {
        where.jobId = jobId;
      }

      applications = await dbJobApp.findMany({
        where,
        orderBy: { appliedAt: "desc" },
        include: {
          job: true,
        },
      });
    } else {
      const rawQuery = jobId
        ? `SELECT a.*, j.title as jobTitle, j.department as jobDepartment FROM job_applications a LEFT JOIN jobs j ON a.jobId = j.id WHERE a.jobId = '${jobId}' ORDER BY a.appliedAt DESC`
        : `SELECT a.*, j.title as jobTitle, j.department as jobDepartment FROM job_applications a LEFT JOIN jobs j ON a.jobId = j.id ORDER BY a.appliedAt DESC`;
      const rawRes = (await prisma.$queryRawUnsafe(rawQuery)) as any[];
      applications = rawRes.map((r) => ({
        ...r,
        job: r.jobTitle ? { title: r.jobTitle, department: r.jobDepartment } : null,
      }));
    }

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// POST /api/v1/careers/applications -> Submit candidate job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobId,
      fullName,
      email,
      phone,
      experience,
      portfolioUrl,
      coverLetter,
      resumeUrl,
    } = body;

    if (!jobId || !fullName || !email || !phone || !resumeUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Job ID, Full Name, Email, Phone, and Resume are required",
        },
        { status: 400 }
      );
    }

    let cleanResumeUrl = resumeUrl.trim();
    if (!/^https?:\/\//i.test(cleanResumeUrl)) {
      if (cleanResumeUrl.startsWith("//")) {
        cleanResumeUrl = `https:${cleanResumeUrl}`;
      } else if (cleanResumeUrl.startsWith("/")) {
        cleanResumeUrl = `https://yellowgreen-rook-384455.hostingersite.com${cleanResumeUrl}`;
      } else {
        cleanResumeUrl = `https://${cleanResumeUrl}`;
      }
    }

    const payload = {
      jobId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      experience: experience?.trim() || "1-3 Years",
      portfolioUrl: portfolioUrl?.trim() || null,
      coverLetter: coverLetter?.trim() || null,
      resumeUrl: cleanResumeUrl,
      status: "PENDING",
    };

    const dbJobApp = getJobAppModel();
    let application: any;

    if (dbJobApp) {
      application = await dbJobApp.create({
        data: payload,
      });
    } else {
      const newId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await prisma.$executeRawUnsafe(
        `INSERT INTO job_applications (
          id, jobId, fullName, email, phone, 
          experience, portfolioUrl, coverLetter, resumeUrl, 
          status, appliedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        newId,
        payload.jobId,
        payload.fullName,
        payload.email,
        payload.phone,
        payload.experience,
        payload.portfolioUrl,
        payload.coverLetter,
        payload.resumeUrl,
        payload.status,
        now
      );
      application = { id: newId, ...payload, appliedAt: now };
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: "Application submitted successfully! Our HR team will reach out to you soon.",
    });
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/careers/applications -> Update application status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Application ID and Status are required" },
        { status: 400 }
      );
    }

    const dbJobApp = getJobAppModel();
    let updated: any;

    if (dbJobApp) {
      updated = await dbJobApp.update({
        where: { id },
        data: { status },
      });
    } else {
      await prisma.$executeRawUnsafe(`UPDATE job_applications SET status = ? WHERE id = ?`, status, id);
      updated = { id, status };
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Candidate status updated to '${status}'`,
    });
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/careers/applications?id=... -> Delete application
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }

    const dbJobApp = getJobAppModel();
    if (dbJobApp) {
      await dbJobApp.delete({ where: { id } });
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM job_applications WHERE id = ?`, id);
    }

    return NextResponse.json({
      success: true,
      message: "Candidate application deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

