import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseScenario(s: {
  metrics: string;
  [key: string]: unknown;
}) {
  return {
    ...s,
    metrics: (() => { try { return JSON.parse(s.metrics); } catch { return s.metrics; } })(),
  };
}

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(scenarios.map(parseScenario));
  } catch (error) {
    console.error("GET /api/scenarios error:", error);
    return NextResponse.json({ error: "Failed to fetch scenarios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scenario = await prisma.scenario.create({
      data: {
        nameAr: body.nameAr,
        descriptionAr: body.descriptionAr,
        status: body.status ?? "draft",
        impact: body.impact ?? "medium",
        color: body.color ?? "#00AEEF",
        metrics: typeof body.metrics === "string" ? body.metrics : JSON.stringify(body.metrics ?? {}),
        reliability: body.reliability ?? null,
        userId: body.userId,
      },
    });
    return NextResponse.json(parseScenario(scenario), { status: 201 });
  } catch (error) {
    console.error("POST /api/scenarios error:", error);
    return NextResponse.json({ error: "Failed to create scenario" }, { status: 500 });
  }
}
