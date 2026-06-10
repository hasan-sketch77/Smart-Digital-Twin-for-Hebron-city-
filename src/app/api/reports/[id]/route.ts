import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: { select: { nameAr: true, avatarInitial: true } } },
    });
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.report.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.fileSize !== undefined && { fileSize: body.fileSize }),
        ...(body.pageCount !== undefined && { pageCount: body.pageCount }),
        ...(body.completedAt !== undefined && { completedAt: new Date(body.completedAt) }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
