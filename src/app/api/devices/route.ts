import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function parseDevice(device: {
  coordinates: string;
  lastReading?: string | null;
  [key: string]: unknown;
}) {
  return {
    ...device,
    coordinates: (() => {
      try {
        return JSON.parse(device.coordinates);
      } catch {
        return device.coordinates;
      }
    })(),
    lastReading: (() => {
      if (!device.lastReading) return device.lastReading;
      try {
        return JSON.parse(device.lastReading);
      } catch {
        return device.lastReading;
      }
    })(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const devices = await prisma.ioTDevice.findMany({ where });

    return NextResponse.json(devices.map(parseDevice));
  } catch (error) {
    console.error("GET /api/devices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const device = await prisma.ioTDevice.create({
      data: {
        nameAr: body.nameAr,
        type: body.type,
        status: body.status ?? "active",
        coordinates:
          typeof body.coordinates === "string"
            ? body.coordinates
            : JSON.stringify(body.coordinates),
        dataType: body.dataType,
        batteryLevel: body.batteryLevel ?? null,
        lastReading:
          body.lastReading !== undefined
            ? typeof body.lastReading === "string"
              ? body.lastReading
              : JSON.stringify(body.lastReading)
            : null,
        lastReadingAt: body.lastReadingAt ? new Date(body.lastReadingAt) : null,
        installDate: new Date(body.installDate),
        maintenanceDue: body.maintenanceDue
          ? new Date(body.maintenanceDue)
          : null,
        firmwareVersion: body.firmwareVersion ?? null,
        mapLayerId: body.mapLayerId ?? null,
      },
    });

    return NextResponse.json(parseDevice(device), { status: 201 });
  } catch (error) {
    console.error("POST /api/devices error:", error);
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    );
  }
}
