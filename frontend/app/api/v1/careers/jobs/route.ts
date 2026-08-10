import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getJobModel() {
  return (prisma as any).job || (prisma as any).Job;
}

// GET /api/v1/careers/jobs -> List active jobs (or all if admin=true)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  try {
    const dbJob = getJobModel();
    let jobs: any[] = [];

    if (dbJob) {
      const where: any = {};
      if (!admin) {
        where.isActive = true;
      }

      jobs = await dbJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          applications: admin ? true : false,
        },
      });
    } else {
      const rawQuery = admin
        ? `SELECT * FROM jobs ORDER BY createdAt DESC`
        : `SELECT * FROM jobs WHERE isActive = 1 ORDER BY createdAt DESC`;
      jobs = (await prisma.$queryRawUnsafe(rawQuery)) as any[];
    }

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

    const dbJob = getJobModel();
    let job: any;

    const saveJobViaRawSql = async (jobId: string | undefined, data: typeof payload) => {
      const newId = jobId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      if (jobId) {
        await prisma.$executeRawUnsafe(
          `UPDATE jobs SET 
            title = ?, titleHi = ?, department = ?, location = ?, 
            type = ?, experience = ?, salary = ?, description = ?, 
            requirements = ?, isActive = ?, updatedAt = ? 
           WHERE id = ?`,
          data.title,
          data.titleHi,
          data.department,
          data.location,
          data.type,
          data.experience,
          data.salary,
          data.description,
          data.requirements,
          data.isActive ? 1 : 0,
          now,
          jobId
        );
        return { id: jobId, ...data };
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO jobs (
            id, title, titleHi, department, location, 
            type, experience, salary, description, 
            requirements, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          newId,
          data.title,
          data.titleHi,
          data.department,
          data.location,
          data.type,
          data.experience,
          data.salary,
          data.description,
          data.requirements,
          data.isActive ? 1 : 0,
          now,
          now
        );
        return { id: newId, ...data };
      }
    };

    if (dbJob) {
      try {
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
      } catch (ormErr: any) {
        console.warn("Prisma ORM validation warning for jobs, saving via Raw SQL fallback:", ormErr?.message);
        job = await saveJobViaRawSql(id, payload);
      }
    } else {
      job = await saveJobViaRawSql(id, payload);
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

    const dbJob = getJobModel();
    if (dbJob) {
      await dbJob.delete({ where: { id } });
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM jobs WHERE id = ?`, id);
    }

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

