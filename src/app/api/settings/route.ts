import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const settings = await prisma.settings.findUnique({ where: { userId } });
    if (!settings) return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const settings = await prisma.settings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
