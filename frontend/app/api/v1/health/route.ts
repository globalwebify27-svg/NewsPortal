import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Global Awaaz Fullstack Next.js API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
