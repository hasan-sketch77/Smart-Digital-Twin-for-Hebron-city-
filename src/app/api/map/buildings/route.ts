import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      orderBy: { createdAt: "asc" },
    });

    const parsed = buildings.map((building) => ({
      ...building,
      coordinates: safeParseJson(building.coordinates),
      footprint: safeParseJson(building.footprint),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Buildings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, type, coordinates, footprint, height, floors } =
      body;

    const building = await prisma.building.create({
      data: {
        nameAr: nameAr ?? null,
        nameEn: nameEn ?? null,
        type,
        coordinates:
          typeof coordinates === "string"
            ? coordinates
            : JSON.stringify(coordinates),
        footprint:
          typeof footprint === "string" ? footprint : JSON.stringify(footprint),
        height,
        floors,
      },
    });

    return NextResponse.json(
      {
        ...building,
        coordinates: safeParseJson(building.coordinates),
        footprint: safeParseJson(building.footprint),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Buildings POST error:", error);
    return NextResponse.json(
      { error: "Failed to create building" },
      { status: 500 }
    );
  }
}
