import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/v1/newsletter -> Subscribe email to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = body.name ? String(body.name).trim() : null;
    const source = body.source ? String(body.source).trim() : "footer";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Valid email address is required" }, { status: 400 });
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, unsubscribedAt: null },
      create: { email, name, source, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully to Global Awaaz newsletter!",
      data: { id: subscriber.id, email: subscriber.email },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Database error";
    console.error("[Newsletter API Error]:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
