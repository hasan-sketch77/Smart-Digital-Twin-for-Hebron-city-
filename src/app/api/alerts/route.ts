import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const alerts = await prisma.alert.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alert = await prisma.alert.create({
      data: {
        titleAr: body.titleAr,
        descriptionAr: body.descriptionAr,
        type: body.type ?? "info",
        severity: body.severity ?? "medium",
        isRead: false,
      },
    });
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    // Mark all as read
    if (body.markAllRead) {
      await prisma.alert.updateMany({ data: { isRead: true } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to update alerts" }, { status: 500 });
  }
}
