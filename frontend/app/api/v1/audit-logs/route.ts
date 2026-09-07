import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

// GET /api/v1/audit-logs -> Fetch real audit logs from database
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const action = searchParams.get("action");

    const where: { action?: string } = {};
    if (action && action !== "ALL") {
      where.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const mapped = logs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || undefined,
      user: {
        name: log.user?.name || "System / Administrator",
        email: log.user?.email || "admin@globalawaaz.com",
        role: log.user?.role || "Super Admin",
      },
      ipAddress: log.ipAddress || "127.0.0.1",
      userAgent: log.userAgent || "Mozilla/5.0",
      before: log.before,
      after: log.after,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Database error";
    console.error("[AuditLog API Error]:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
