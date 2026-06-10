import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streetId = searchParams.get("streetId");

    const trafficData = await prisma.trafficData.findMany({
      where: streetId ? { streetId } : undefined,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(trafficData);
  } catch (error) {
    console.error("Traffic GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch traffic data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      streetId,
      congestion,
      avgSpeed,
      vehicleCount,
      pedestrianCount,
      co2Level,
    } = body;

    const record = await prisma.trafficData.create({
      data: {
        streetId,
        congestion,
        avgSpeed,
        vehicleCount,
        pedestrianCount: pedestrianCount ?? 0,
        co2Level: co2Level ?? 0,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Traffic POST error:", error);
    return NextResponse.json(
      { error: "Failed to create traffic data" },
      { status: 500 }
    );
  }
}
