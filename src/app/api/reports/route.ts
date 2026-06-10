import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { nameAr: true, avatarInitial: true } } },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const report = await prisma.report.create({
      data: {
        titleAr: body.titleAr,
        type: body.type,
        status: body.status ?? "generating",
        fileSize: body.fileSize ?? null,
        pageCount: body.pageCount ?? null,
        dateAr: body.dateAr ?? new Date().toLocaleDateString("ar-PS"),
        userId: body.userId,
      },
      include: { user: { select: { nameAr: true, avatarInitial: true } } },
    });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
