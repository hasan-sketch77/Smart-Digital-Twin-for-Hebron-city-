import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.alert.update({
      where: { id },
      data: {
        ...(body.isRead !== undefined && { isRead: body.isRead }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/alerts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.alert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/alerts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
