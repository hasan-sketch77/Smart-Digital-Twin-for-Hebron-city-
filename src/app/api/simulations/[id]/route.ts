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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        results: {
          include: {
            recommendations: true,
          },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(parseSimulation(simulation));
  } catch (error) {
    console.error("GET /api/simulations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch simulation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};

    if (body.status !== undefined) data.status = body.status;
    if (body.progress !== undefined) data.progress = body.progress;
    if (body.completedAt !== undefined) {
      data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
    }
    if (body.nameAr !== undefined) data.nameAr = body.nameAr;
    if (body.inputData !== undefined) {
      data.inputData =
        typeof body.inputData === "string"
          ? body.inputData
          : JSON.stringify(body.inputData);
    }

    const simulation = await prisma.simulation.update({
      where: { id },
      data,
      include: {
        results: {
          include: {
            recommendations: true,
          },
        },
      },
    });

    return NextResponse.json(parseSimulation(simulation));
  } catch (error) {
    console.error("PATCH /api/simulations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update simulation" },
      { status: 500 }
    );
  }
}
