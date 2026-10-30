import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";
  let dbLatency = 0;

  try {
    const dbPingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbPingStart;
  } catch (error) {
    dbStatus = "disconnected";
    console.error("[HealthCheck] Database connection error:", error);
  }

  const isHealthy = dbStatus === "connected";
  const statusCode = isHealthy ? 200 : 503;

  const response = NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      service: "Global Awaaz Enterprise News CMS",
      version: "1.0.0",
      instance: {
        port: process.env.PORT || "3000",
        pid: process.pid,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
        },
      },
      responseTimeMs: Date.now() - startTime,
    },
    { status: statusCode }
  );

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("X-Instance-Port", process.env.PORT || "3000");

  return response;
}
