import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // --- Road Condition ---
    const totalStreets = await prisma.street.count();
    const goodStreets = await prisma.street.count({
      where: { congestion: { lt: 0.3 } },
    });
    const roadConditionPercent =
      totalStreets > 0 ? Math.round((goodStreets / totalStreets) * 100) : 0;
    const roadConditionStatus =
      roadConditionPercent >= 75
        ? "good"
        : roadConditionPercent >= 50
        ? "fair"
        : "poor";

    // --- Average Travel Time (from latest TrafficData per street) ---
    const latestTrafficData = await prisma.trafficData.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });
    const avgSpeed =
      latestTrafficData.length > 0
        ? latestTrafficData.reduce((sum, d) => sum + d.avgSpeed, 0) /
          latestTrafficData.length
        : 30;
    // Represent travel time in minutes based on a 10 km reference distance
    const travelTimeMinutes =
      avgSpeed > 0 ? Math.round((10 / avgSpeed) * 60) : 0;
    const travelTimeTrend = avgSpeed < 20 ? "up" : "down";

    // --- Open Alerts ---
    const openAlerts = await prisma.alert.findMany({
      where: { isRead: false },
    });
    const urgentAlerts = openAlerts.filter(
      (a) => a.severity === "critical"
    ).length;

    // --- CO2 Saved Today ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTraffic = await prisma.trafficData.findMany({
      where: { timestamp: { gte: todayStart } },
    });
    // Each record's co2Level represents saved CO2 in kg; convert total to tons
    const co2SavedKg = todayTraffic.reduce((sum, d) => sum + d.co2Level, 0);
    const co2SavedTons = parseFloat((co2SavedKg / 1000).toFixed(2));
    const co2Target = 22;

    return NextResponse.json({
      roadCondition: {
        percent: roadConditionPercent,
        status: roadConditionStatus,
      },
      travelTime: {
        minutes: travelTimeMinutes,
        trend: travelTimeTrend,
      },
      openAlerts: {
        count: openAlerts.length,
        urgent: urgentAlerts,
      },
      co2Saved: {
        tons: co2SavedTons,
        target: co2Target,
      },
    });
  } catch (error) {
    console.error("KPI GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 }
    );
  }
}
