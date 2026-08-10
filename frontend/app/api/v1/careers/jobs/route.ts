import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Safely access job model
const dbJob = (prisma as any).job;

// GET /api/v1/careers/jobs -> List active jobs (or all if admin=true)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  try {
    const where: any = {};
    if (!admin) {
      where.isActive = true;
    }

    const jobs = dbJob
      ? await dbJob.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            applications: admin ? true : false,
          },
        })
      : [];

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// POST /api/v1/careers/jobs -> Create or Update job posting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      titleHi,
      department,
      location,
      type,
      experience,
      salary,
      description,
      requirements,
      isActive,
    } = body;

    if (!title || !department || !description) {
      return NextResponse.json(
        { success: false, message: "Title, Department, and Description are required" },
        { status: 400 }
      );
    }

    if (!dbJob) {
      return NextResponse.json(
        { success: false, message: "Job database model is not initialized" },
        { status: 500 }
      );
    }

    const payload = {
      title: title.trim(),
      titleHi: titleHi?.trim() || null,
      department: department.trim(),
      location: location?.trim() || "Ranchi, Jharkhand",
      type: type?.trim() || "Full-Time",
      experience: experience?.trim() || "1-3 Years",
      salary: salary?.trim() || null,
      description: description.trim(),
      requirements: requirements?.trim() || "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    let job;
    if (id) {
      job = await dbJob.update({
        where: { id },
        data: payload,
      });
    } else {
      job = await dbJob.create({
        data: payload,
      });
    }

    return NextResponse.json({
      success: true,
      data: job,
      message: `Job position '${job.title}' saved successfully`,
    });
  } catch (error: any) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/careers/jobs?id=... -> Delete job
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 }
      );
    }

    if (!dbJob) {
      return NextResponse.json(
        { success: false, message: "Job model not available" },
        { status: 500 }
      );
    }

    await dbJob.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
