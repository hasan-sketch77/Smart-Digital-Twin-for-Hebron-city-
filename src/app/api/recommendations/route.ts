import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const simulationResultId = searchParams.get("simulationResultId");

    const recs = await prisma.aIRecommendation.findMany({
      where: simulationResultId ? { simulationResultId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(
      recs.map((r) => ({
        ...r,
        metrics: (() => { try { return JSON.parse(r.metrics); } catch { return r.metrics; } })(),
      }))
    );
  } catch (error) {
    console.error("GET /api/recommendations error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
