import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const layers = await prisma.mapLayer.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json(layers);
  } catch (error) {
    console.error("Layers GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch map layers" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, enabled } = body as { key: string; enabled: boolean };

    const layer = await prisma.mapLayer.update({
      where: { key },
      data: { enabled },
    });

    return NextResponse.json(layer);
  } catch (error) {
    console.error("Layers PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update map layer" },
      { status: 500 }
    );
  }
}
