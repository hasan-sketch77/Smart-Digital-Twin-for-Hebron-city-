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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const device = await prisma.ioTDevice.findUnique({ where: { id } });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(parseDevice(device));
  } catch (error) {
    console.error("GET /api/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch device" },
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

    if (body.nameAr !== undefined) data.nameAr = body.nameAr;
    if (body.type !== undefined) data.type = body.type;
    if (body.status !== undefined) data.status = body.status;
    if (body.coordinates !== undefined) {
      data.coordinates =
        typeof body.coordinates === "string"
          ? body.coordinates
          : JSON.stringify(body.coordinates);
    }
    if (body.dataType !== undefined) data.dataType = body.dataType;
    if (body.batteryLevel !== undefined) data.batteryLevel = body.batteryLevel;
    if (body.lastReading !== undefined) {
      data.lastReading =
        typeof body.lastReading === "string"
          ? body.lastReading
          : JSON.stringify(body.lastReading);
    }
    if (body.lastReadingAt !== undefined) {
      data.lastReadingAt = body.lastReadingAt
        ? new Date(body.lastReadingAt)
        : null;
    }
    if (body.maintenanceDue !== undefined) {
      data.maintenanceDue = body.maintenanceDue
        ? new Date(body.maintenanceDue)
        : null;
    }
    if (body.firmwareVersion !== undefined) {
      data.firmwareVersion = body.firmwareVersion;
    }
    if (body.mapLayerId !== undefined) data.mapLayerId = body.mapLayerId;

    const device = await prisma.ioTDevice.update({ where: { id }, data });

    return NextResponse.json(parseDevice(device));
  } catch (error) {
    console.error("PATCH /api/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.ioTDevice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    );
  }
}
