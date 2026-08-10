import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Safely access jobApplication model
const dbJobApp = (prisma as any).jobApplication;

// GET /api/v1/careers/applications -> List candidate applications for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const where: any = {};
    if (jobId) {
      where.jobId = jobId;
    }

    const applications = dbJobApp
      ? await dbJobApp.findMany({
          where,
          orderBy: { appliedAt: "desc" },
          include: {
            job: true,
          },
        })
      : [];

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

    if (!dbJobApp) {
      return NextResponse.json(
        { success: false, message: "Job application model not initialized" },
        { status: 500 }
      );
    }

    const application = await dbJobApp.create({
      data: {
        jobId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        experience: experience?.trim() || "1-3 Years",
        portfolioUrl: portfolioUrl?.trim() || null,
        coverLetter: coverLetter?.trim() || null,
        resumeUrl: resumeUrl.trim(),
        status: "PENDING",
      },
    });

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

// PATCH /api/v1/careers/applications -> Update application status (SHORTLISTED, REVIEWED, REJECTED)
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

    if (!dbJobApp) {
      return NextResponse.json(
        { success: false, message: "Job application model not available" },
        { status: 500 }
      );
    }

    const updated = await dbJobApp.update({
      where: { id },
      data: { status },
    });

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

    if (!dbJobApp) {
      return NextResponse.json(
        { success: false, message: "Job application model not available" },
        { status: 500 }
      );
    }

    await dbJobApp.delete({ where: { id } });

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
