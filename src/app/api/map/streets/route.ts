import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const streets = await prisma.street.findMany({
      orderBy: { createdAt: "asc" },
    });

    const parsed = streets.map((street) => ({
      ...street,
      coordinates: (() => {
        try {
          return JSON.parse(street.coordinates);
        } catch {
          return street.coordinates;
        }
      })(),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Streets GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nameAr,
      nameEn,
      type,
      coordinates,
      width,
      speedLimit,
      congestion,
      avgSpeed,
      isProposed,
      mapLayerId,
    } = body;

    const street = await prisma.street.create({
      data: {
        nameAr,
        nameEn,
        type,
        coordinates:
          typeof coordinates === "string"
            ? coordinates
            : JSON.stringify(coordinates),
        width,
        speedLimit,
        congestion: congestion ?? 0,
        avgSpeed: avgSpeed ?? 30,
        isProposed: isProposed ?? false,
        mapLayerId: mapLayerId ?? null,
      },
    });

    return NextResponse.json(
      {
        ...street,
        coordinates: (() => {
          try {
            return JSON.parse(street.coordinates);
          } catch {
            return street.coordinates;
          }
        })(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Streets POST error:", error);
    return NextResponse.json(
      { error: "Failed to create street" },
      { status: 500 }
    );
  }
}
