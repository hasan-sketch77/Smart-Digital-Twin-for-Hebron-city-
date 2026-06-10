import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const scenario = await prisma.scenario.findUnique({ where: { id } });
    if (!scenario) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...scenario,
      metrics: (() => { try { return JSON.parse(scenario.metrics); } catch { return scenario.metrics; } })(),
    });
  } catch (error) {
    console.error("GET /api/scenarios/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch scenario" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.scenario.update({
      where: { id },
      data: {
        ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
        ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.impact !== undefined && { impact: body.impact }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.metrics !== undefined && {
          metrics: typeof body.metrics === "string" ? body.metrics : JSON.stringify(body.metrics),
        }),
        ...(body.reliability !== undefined && { reliability: body.reliability }),
      },
    });
    return NextResponse.json({
      ...updated,
      metrics: (() => { try { return JSON.parse(updated.metrics); } catch { return updated.metrics; } })(),
    });
  } catch (error) {
    console.error("PATCH /api/scenarios/[id] error:", error);
    return NextResponse.json({ error: "Failed to update scenario" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.scenario.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/scenarios/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete scenario" }, { status: 500 });
  }
}
