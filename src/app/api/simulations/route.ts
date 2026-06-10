import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function tryParseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function parseSimulation(simulation: {
  inputData: string;
  results: Array<{
    beforeMetrics: string;
    afterMetrics: string;
    recommendations: Array<{ metrics: string; [key: string]: unknown }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}) {
  return {
    ...simulation,
    inputData: tryParseJson(simulation.inputData),
    results: simulation.results.map((result) => ({
      ...result,
      beforeMetrics: tryParseJson(result.beforeMetrics),
      afterMetrics: tryParseJson(result.afterMetrics),
      recommendations: result.recommendations.map((rec) => ({
        ...rec,
        metrics: tryParseJson(rec.metrics),
      })),
    })),
  };
}

export async function GET() {
  try {
    const simulations = await prisma.simulation.findMany({
      include: {
        results: {
          include: {
            recommendations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(simulations.map(parseSimulation));
  } catch (error) {
    console.error("GET /api/simulations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch simulations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const simulation = await prisma.simulation.create({
      data: {
        nameAr: body.nameAr,
        type: body.type,
        status: "pending",
        progress: 0,
        inputData:
          typeof body.inputData === "string"
            ? body.inputData
            : JSON.stringify(body.inputData ?? {}),
        userId: body.userId,
      },
      include: {
        results: {
          include: {
            recommendations: true,
          },
        },
      },
    });

    return NextResponse.json(parseSimulation(simulation), { status: 201 });
  } catch (error) {
    console.error("POST /api/simulations error:", error);
    return NextResponse.json(
      { error: "Failed to create simulation" },
      { status: 500 }
    );
  }
}
