import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.aIRecommendation.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.trafficData.deleteMany();
  await prisma.ioTDevice.deleteMany();
  await prisma.street.deleteMany();
  await prisma.building.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.report.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.mapLayer.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const user = await prisma.user.create({
    data: {
      nameAr: "حسن أحمد",
      nameEn: "Hasan Ahmad",
      email: "hasan.ahmad@hebron-municipality.ps",
      role: "مخطط بلدي",
      avatarInitial: "H",
    },
  });
  console.log("✅ User created");

  // Create settings
  await prisma.settings.create({
    data: {
      userId: user.id,
      darkMode: false,
      desktopNotifications: true,
      autoSave: true,
      mapQuality: "high",
      language: "ar",
      region: "ps",
    },
  });

  // Create map layers
  const layersData = [
    { key: "traffic", nameAr: "حركة المرور", icon: "Map", enabled: true },
    { key: "infrastructure", nameAr: "البنية التحتية", icon: "Layers", enabled: true },
    { key: "maintenance", nameAr: "أعمال الصيانة", icon: "Construction", enabled: false },
    { key: "lighting", nameAr: "الإنارة الذكية", icon: "Lightbulb", enabled: true },
    { key: "pedestrian", nameAr: "مناطق المشاة", icon: "Footprints", enabled: false },
    { key: "heatmap", nameAr: "خريطة الحرارة", icon: "Activity", enabled: true },
  ];

  const layers: Record<string, string> = {};
  for (const l of layersData) {
    const layer = await prisma.mapLayer.create({ data: l });
    layers[l.key] = layer.id;
  }
  console.log("✅ Map layers created");

  // Create streets
  const streetsData = [
    {
      nameAr: "شارع السلام",
      nameEn: "Al-Salam Street",
      type: "main",
      coordinates: JSON.stringify([[0, 0, 0], [200, 0, 0], [400, 0, 50]]),
      width: 14,
      speedLimit: 60,
      congestion: 0.35,
      avgSpeed: 45,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع عين ساره",
      nameEn: "Ein Sarah Street",
      type: "main",
      coordinates: JSON.stringify([[0, 0, 100], [150, 0, 100], [300, 0, 150]]),
      width: 12,
      speedLimit: 50,
      congestion: 0.55,
      avgSpeed: 28,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع باب الزاوية",
      nameEn: "Bab Al-Zawiyeh Street",
      type: "main",
      coordinates: JSON.stringify([[100, 0, -50], [100, 0, 100], [100, 0, 250]]),
      width: 10,
      speedLimit: 40,
      congestion: 0.68,
      avgSpeed: 12,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع الإبراهيمية",
      nameEn: "Al-Ibrahimiya Street",
      type: "main",
      coordinates: JSON.stringify([[-100, 0, 200], [0, 0, 200], [200, 0, 200], [400, 0, 200]]),
      width: 14,
      speedLimit: 50,
      congestion: 0.45,
      avgSpeed: 32,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "منطقة الحرس",
      nameEn: "Al-Haras Area",
      type: "secondary",
      coordinates: JSON.stringify([[-200, 0, -100], [-200, 0, 0], [-200, 0, 100]]),
      width: 8,
      speedLimit: 30,
      congestion: 0.25,
      avgSpeed: 25,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "مفرق المدارس",
      nameEn: "Schools Junction",
      type: "secondary",
      coordinates: JSON.stringify([[200, 0, -100], [200, 0, 0], [300, 0, 50]]),
      width: 8,
      speedLimit: 30,
      congestion: 0.72,
      avgSpeed: 10,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع النمارة",
      nameEn: "Al-Namara Street",
      type: "secondary",
      coordinates: JSON.stringify([[-100, 0, -200], [0, 0, -200], [100, 0, -200]]),
      width: 10,
      speedLimit: 40,
      congestion: 0.30,
      avgSpeed: 35,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع الملك فيصل",
      nameEn: "King Faisal Street",
      type: "main",
      coordinates: JSON.stringify([[-300, 0, 0], [-200, 0, 0], [0, 0, 0]]),
      width: 16,
      speedLimit: 60,
      congestion: 0.42,
      avgSpeed: 40,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع وادي التفاح",
      nameEn: "Wadi Al-Tuffah Street",
      type: "secondary",
      coordinates: JSON.stringify([[300, 0, 100], [300, 0, 200], [300, 0, 300]]),
      width: 8,
      speedLimit: 40,
      congestion: 0.38,
      avgSpeed: 30,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع رأس الجورة",
      nameEn: "Ras Al-Jora Street",
      type: "main",
      coordinates: JSON.stringify([[-200, 0, 300], [0, 0, 300], [200, 0, 300]]),
      width: 12,
      speedLimit: 50,
      congestion: 0.50,
      avgSpeed: 28,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع جديد مقترح",
      nameEn: "Proposed New Street",
      type: "proposed",
      coordinates: JSON.stringify([[50, 0, 50], [150, 0, 80], [250, 0, 120]]),
      width: 12,
      speedLimit: 50,
      congestion: 0,
      avgSpeed: 0,
      isProposed: true,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "منطقة المشاة - البلدة القديمة",
      nameEn: "Old City Pedestrian Zone",
      type: "pedestrian",
      coordinates: JSON.stringify([[50, 0, -100], [80, 0, -80], [120, 0, -50]]),
      width: 6,
      speedLimit: 5,
      congestion: 0.10,
      avgSpeed: 4,
      mapLayerId: layers.pedestrian,
    },
    {
      nameAr: "شارع الشهداء",
      nameEn: "Al-Shuhada Street",
      type: "main",
      coordinates: JSON.stringify([[-100, 0, -100], [0, 0, -100], [100, 0, -100]]),
      width: 12,
      speedLimit: 40,
      congestion: 0.60,
      avgSpeed: 18,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع الجامعة",
      nameEn: "University Street",
      type: "secondary",
      coordinates: JSON.stringify([[-200, 0, 200], [-200, 0, 300], [-200, 0, 400]]),
      width: 10,
      speedLimit: 40,
      congestion: 0.48,
      avgSpeed: 25,
      mapLayerId: layers.traffic,
    },
    {
      nameAr: "شارع المنطقة الصناعية",
      nameEn: "Industrial Zone Street",
      type: "main",
      coordinates: JSON.stringify([[400, 0, -200], [400, 0, 0], [400, 0, 200]]),
      width: 16,
      speedLimit: 60,
      congestion: 0.33,
      avgSpeed: 45,
      mapLayerId: layers.traffic,
    },
  ];

  const streetIds: string[] = [];
  for (const s of streetsData) {
    const street = await prisma.street.create({ data: s });
    streetIds.push(street.id);
  }
  console.log("✅ Streets created");

  // Create traffic data (30 days x 24 hours for each street)
  const now = new Date();
  const trafficBatch: Prisma.TrafficDataCreateManyInput[] = [];

  for (let si = 0; si < streetIds.length; si++) {
    const baseCongestion = streetsData[si].congestion;
    const baseSpeed = streetsData[si].avgSpeed;

    for (let day = 0; day < 30; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(hour, 0, 0, 0);

        // Realistic traffic pattern
        let hourFactor = 0.3; // night base
        if (hour >= 7 && hour <= 9) hourFactor = 1.0; // morning rush
        else if (hour >= 12 && hour <= 14) hourFactor = 0.7; // lunch
        else if (hour >= 15 && hour <= 18) hourFactor = 0.95; // evening rush
        else if (hour >= 10 && hour <= 11) hourFactor = 0.6;
        else if (hour >= 19 && hour <= 22) hourFactor = 0.5;

        // Weekend reduction (Friday/Saturday)
        const dayOfWeek = date.getDay();
        const weekendFactor = (dayOfWeek === 5 || dayOfWeek === 6) ? 0.6 : 1.0;

        const variance = 0.85 + Math.random() * 0.3;
        const congestion = Math.min(1, Math.max(0, baseCongestion * hourFactor * weekendFactor * variance));
        const speed = Math.max(5, baseSpeed * (1 - congestion * 0.7) * (0.9 + Math.random() * 0.2));
        const vehicleCount = Math.round(200 * hourFactor * weekendFactor * variance);
        const pedestrianCount = Math.round(50 * hourFactor * weekendFactor * (0.8 + Math.random() * 0.4));
        const co2 = parseFloat((congestion * vehicleCount * 0.015).toFixed(3));

        trafficBatch.push({
          streetId: streetIds[si],
          timestamp: date,
          congestion: parseFloat(congestion.toFixed(3)),
          avgSpeed: parseFloat(speed.toFixed(1)),
          vehicleCount,
          pedestrianCount,
          co2Level: co2,
        });
      }
    }
  }

  // Insert in chunks to avoid SQLite limits
  const chunkSize = 500;
  for (let i = 0; i < trafficBatch.length; i += chunkSize) {
    await prisma.trafficData.createMany({
      data: trafficBatch.slice(i, i + chunkSize),
    });
  }
  console.log(`✅ Traffic data created (${trafficBatch.length} records)`);

  // Create buildings
  const buildingsData = [
    { nameAr: "جامعة الخليل", nameEn: "Hebron University", type: "educational", coordinates: JSON.stringify([-180, 320]), footprint: JSON.stringify([[-200, 300], [-160, 300], [-160, 340], [-200, 340]]), height: 16, floors: 4 },
    { nameAr: "جامعة بوليتكنك فلسطين", nameEn: "Palestine Polytechnic University", type: "educational", coordinates: JSON.stringify([-220, 280]), footprint: JSON.stringify([[-240, 260], [-200, 260], [-200, 300], [-240, 300]]), height: 20, floors: 5 },
    { nameAr: "بلدية الخليل", nameEn: "Hebron Municipality", type: "government", coordinates: JSON.stringify([50, 50]), footprint: JSON.stringify([[30, 30], [70, 30], [70, 70], [30, 70]]), height: 12, floors: 3 },
    { nameAr: "المسجد الإبراهيمي", nameEn: "Ibrahimi Mosque", type: "mosque", coordinates: JSON.stringify([80, -80]), footprint: JSON.stringify([[60, -100], [100, -100], [100, -60], [60, -60]]), height: 25, floors: 2 },
    { nameAr: "مستشفى الأهلي", nameEn: "Al-Ahli Hospital", type: "hospital", coordinates: JSON.stringify([250, 180]), footprint: JSON.stringify([[230, 160], [270, 160], [270, 200], [230, 200]]), height: 24, floors: 6 },
    { nameAr: "مدرسة الخليل الثانوية", nameEn: "Hebron Secondary School", type: "educational", coordinates: JSON.stringify([180, -80]), footprint: JSON.stringify([[160, -100], [200, -100], [200, -60], [160, -60]]), height: 12, floors: 3 },
    { nameAr: "السوق القديم", nameEn: "Old Market", type: "commercial", coordinates: JSON.stringify([90, -40]), footprint: JSON.stringify([[70, -60], [110, -60], [110, -20], [70, -20]]), height: 8, floors: 2 },
    { nameAr: "مركز الشرطة", nameEn: "Police Station", type: "government", coordinates: JSON.stringify([-50, 100]), footprint: JSON.stringify([[-70, 80], [-30, 80], [-30, 120], [-70, 120]]), height: 10, floors: 2 },
    { nameAr: "مركز التسوق الحديث", nameEn: "Modern Shopping Center", type: "commercial", coordinates: JSON.stringify([320, 50]), footprint: JSON.stringify([[300, 20], [340, 20], [340, 80], [300, 80]]), height: 18, floors: 4 },
    { nameAr: "مسجد الحسين", nameEn: "Al-Hussein Mosque", type: "mosque", coordinates: JSON.stringify([-120, 150]), footprint: JSON.stringify([[-135, 135], [-105, 135], [-105, 165], [-135, 165]]), height: 20, floors: 1 },
  ];

  // Add generic buildings
  const genericTypes = ["residential", "commercial", "residential", "residential"];
  for (let i = 0; i < 35; i++) {
    const type = genericTypes[i % genericTypes.length];
    const x = -300 + Math.random() * 700;
    const z = -250 + Math.random() * 600;
    const size = 10 + Math.random() * 20;
    const floors = type === "residential" ? 2 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 4);
    buildingsData.push({
      nameAr: type === "residential" ? null as unknown as string : null as unknown as string,
      nameEn: null as unknown as string,
      type,
      coordinates: JSON.stringify([x, z]),
      footprint: JSON.stringify([
        [x - size / 2, z - size / 2],
        [x + size / 2, z - size / 2],
        [x + size / 2, z + size / 2],
        [x - size / 2, z + size / 2],
      ]),
      height: floors * 3.5,
      floors,
    });
  }

  for (const b of buildingsData) {
    await prisma.building.create({ data: b });
  }
  console.log("✅ Buildings created");

  // Create IoT devices
  const devicesData = [
    { nameAr: "حساس تدفق مروري 01", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([100, 100]), dataType: "traffic_flow", batteryLevel: 87, installDate: new Date("2024-06-15"), firmwareVersion: "2.1.4", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 02", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([200, 0]), dataType: "traffic_flow", batteryLevel: 92, installDate: new Date("2024-07-01"), firmwareVersion: "2.1.4", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 03", type: "traffic_sensor", status: "warning", coordinates: JSON.stringify([100, -50]), dataType: "traffic_flow", batteryLevel: 23, installDate: new Date("2024-03-10"), maintenanceDue: new Date("2026-05-01"), firmwareVersion: "2.0.8", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 04", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([-100, 200]), dataType: "traffic_flow", batteryLevel: 76, installDate: new Date("2025-01-15"), firmwareVersion: "2.1.4", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 05", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([300, 100]), dataType: "traffic_flow", batteryLevel: 65, installDate: new Date("2024-09-20"), firmwareVersion: "2.1.3", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 06", type: "traffic_sensor", status: "offline", coordinates: JSON.stringify([-200, -100]), dataType: "traffic_flow", batteryLevel: 0, installDate: new Date("2023-11-05"), maintenanceDue: new Date("2026-04-20"), firmwareVersion: "1.9.2", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 07", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([200, -100]), dataType: "traffic_flow", batteryLevel: 81, installDate: new Date("2025-02-28"), firmwareVersion: "2.1.4", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 08", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([0, 0]), dataType: "traffic_flow", batteryLevel: 94, installDate: new Date("2025-03-15"), firmwareVersion: "2.1.4", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 09", type: "traffic_sensor", status: "active", coordinates: JSON.stringify([-300, 0]), dataType: "traffic_flow", batteryLevel: 71, installDate: new Date("2024-08-12"), firmwareVersion: "2.1.3", mapLayerId: layers.traffic },
    { nameAr: "حساس تدفق مروري 10", type: "traffic_sensor", status: "warning", coordinates: JSON.stringify([400, -200]), dataType: "traffic_flow", batteryLevel: 18, installDate: new Date("2024-01-20"), maintenanceDue: new Date("2026-04-25"), firmwareVersion: "2.0.5", mapLayerId: layers.traffic },
    { nameAr: "حساس جودة الهواء 01", type: "air_quality", status: "active", coordinates: JSON.stringify([150, 150]), dataType: "air_quality_index", batteryLevel: 88, installDate: new Date("2025-01-10"), firmwareVersion: "1.5.2", mapLayerId: layers.infrastructure },
    { nameAr: "حساس جودة الهواء 02", type: "air_quality", status: "active", coordinates: JSON.stringify([-50, -150]), dataType: "air_quality_index", batteryLevel: 73, installDate: new Date("2024-11-20"), firmwareVersion: "1.5.1", mapLayerId: layers.infrastructure },
    { nameAr: "حساس جودة الهواء 03", type: "air_quality", status: "warning", coordinates: JSON.stringify([350, 250]), dataType: "air_quality_index", batteryLevel: 31, installDate: new Date("2024-04-05"), maintenanceDue: new Date("2026-05-10"), firmwareVersion: "1.4.8", mapLayerId: layers.infrastructure },
    { nameAr: "حساس جودة الهواء 04", type: "air_quality", status: "active", coordinates: JSON.stringify([-250, 200]), dataType: "air_quality_index", batteryLevel: 95, installDate: new Date("2025-03-01"), firmwareVersion: "1.5.2", mapLayerId: layers.infrastructure },
    { nameAr: "حساس جودة الهواء 05", type: "air_quality", status: "active", coordinates: JSON.stringify([0, 300]), dataType: "air_quality_index", batteryLevel: 82, installDate: new Date("2025-02-14"), firmwareVersion: "1.5.2", mapLayerId: layers.infrastructure },
    { nameAr: "حساس ضوضاء 01", type: "noise", status: "active", coordinates: JSON.stringify([80, -80]), dataType: "noise_db", batteryLevel: 67, installDate: new Date("2024-08-15"), firmwareVersion: "1.2.0", mapLayerId: layers.infrastructure },
    { nameAr: "حساس ضوضاء 02", type: "noise", status: "active", coordinates: JSON.stringify([200, 200]), dataType: "noise_db", batteryLevel: 54, installDate: new Date("2024-10-01"), firmwareVersion: "1.2.0", mapLayerId: layers.infrastructure },
    { nameAr: "حساس ضوضاء 03", type: "noise", status: "maintenance", coordinates: JSON.stringify([-100, 0]), dataType: "noise_db", batteryLevel: 45, installDate: new Date("2024-05-20"), maintenanceDue: new Date("2026-04-18"), firmwareVersion: "1.1.5", mapLayerId: layers.infrastructure },
    { nameAr: "حساس ضوضاء 04", type: "noise", status: "active", coordinates: JSON.stringify([400, 0]), dataType: "noise_db", batteryLevel: 78, installDate: new Date("2025-01-05"), firmwareVersion: "1.2.0", mapLayerId: layers.infrastructure },
    { nameAr: "كاميرا مراقبة ذكية 01", type: "camera", status: "active", coordinates: JSON.stringify([100, 0]), dataType: "video_feed", batteryLevel: null, installDate: new Date("2024-03-01"), firmwareVersion: "3.0.1", mapLayerId: layers.traffic },
    { nameAr: "كاميرا مراقبة ذكية 02", type: "camera", status: "active", coordinates: JSON.stringify([0, 200]), dataType: "video_feed", batteryLevel: null, installDate: new Date("2024-06-15"), firmwareVersion: "3.0.1", mapLayerId: layers.traffic },
    { nameAr: "كاميرا مراقبة ذكية 03", type: "camera", status: "active", coordinates: JSON.stringify([-200, 0]), dataType: "video_feed", batteryLevel: null, installDate: new Date("2024-09-10"), firmwareVersion: "3.0.0", mapLayerId: layers.traffic },
    { nameAr: "كاميرا مراقبة ذكية 04", type: "camera", status: "offline", coordinates: JSON.stringify([300, -100]), dataType: "video_feed", batteryLevel: null, installDate: new Date("2024-02-20"), maintenanceDue: new Date("2026-04-22"), firmwareVersion: "2.9.8", mapLayerId: layers.traffic },
    { nameAr: "كاميرا مراقبة ذكية 05", type: "camera", status: "active", coordinates: JSON.stringify([50, -200]), dataType: "video_feed", batteryLevel: null, installDate: new Date("2025-02-01"), firmwareVersion: "3.0.1", mapLayerId: layers.traffic },
    { nameAr: "كاميرا مراقبة ذكية 06", type: "camera", status: "active", coordinates: JSON.stringify([-150, 250]), dataType: "video_feed", batteryLevel: null, installDate: new Date("2025-03-10"), firmwareVersion: "3.0.1", mapLayerId: layers.traffic },
    { nameAr: "محطة طقس 01", type: "weather", status: "active", coordinates: JSON.stringify([0, 100]), dataType: "weather", batteryLevel: 91, installDate: new Date("2024-01-15"), firmwareVersion: "1.8.0", mapLayerId: layers.infrastructure },
    { nameAr: "محطة طقس 02", type: "weather", status: "active", coordinates: JSON.stringify([300, 300]), dataType: "weather", batteryLevel: 85, installDate: new Date("2024-07-20"), firmwareVersion: "1.8.0", mapLayerId: layers.infrastructure },
    { nameAr: "محطة طقس 03", type: "weather", status: "active", coordinates: JSON.stringify([-250, -100]), dataType: "weather", batteryLevel: 79, installDate: new Date("2025-01-01"), firmwareVersion: "1.8.1", mapLayerId: layers.infrastructure },
    { nameAr: "متحكم إنارة ذكية 01", type: "lighting", status: "active", coordinates: JSON.stringify([50, 0]), dataType: "light_level", batteryLevel: null, installDate: new Date("2024-04-01"), firmwareVersion: "2.3.0", mapLayerId: layers.lighting },
    { nameAr: "متحكم إنارة ذكية 02", type: "lighting", status: "active", coordinates: JSON.stringify([200, 100]), dataType: "light_level", batteryLevel: null, installDate: new Date("2024-04-01"), firmwareVersion: "2.3.0", mapLayerId: layers.lighting },
    { nameAr: "متحكم إنارة ذكية 03", type: "lighting", status: "warning", coordinates: JSON.stringify([-100, 200]), dataType: "light_level", batteryLevel: null, installDate: new Date("2024-04-01"), maintenanceDue: new Date("2026-04-30"), firmwareVersion: "2.2.5", mapLayerId: layers.lighting },
    { nameAr: "متحكم إنارة ذكية 04", type: "lighting", status: "active", coordinates: JSON.stringify([100, 250]), dataType: "light_level", batteryLevel: null, installDate: new Date("2025-01-15"), firmwareVersion: "2.3.0", mapLayerId: layers.lighting },
    { nameAr: "متحكم إنارة ذكية 05", type: "lighting", status: "active", coordinates: JSON.stringify([-200, 100]), dataType: "light_level", batteryLevel: null, installDate: new Date("2025-02-01"), firmwareVersion: "2.3.0", mapLayerId: layers.lighting },
  ];

  for (const d of devicesData) {
    await prisma.ioTDevice.create({
      data: {
        ...d,
        lastReading: JSON.stringify({ value: Math.random() * 100, unit: d.dataType === "noise_db" ? "dB" : d.dataType === "air_quality_index" ? "AQI" : "count" }),
        lastReadingAt: new Date(Date.now() - Math.random() * 3600000),
      },
    });
  }
  console.log("✅ IoT devices created");

  // Create simulations
  const sim1 = await prisma.simulation.create({
    data: {
      nameAr: "محاكاة دوار جديد - تقاطع باب الزاوية",
      type: "add_roundabout",
      status: "completed",
      progress: 100,
      inputData: JSON.stringify({ type: "add_roundabout", affectedStreetIds: [streetIds[2]], parameters: { coordinates: [[100, 0, 100]], radius: 15, lanes: 2 } }),
      userId: user.id,
      completedAt: new Date("2026-04-12T14:30:00"),
    },
  });

  const sim2 = await prisma.simulation.create({
    data: {
      nameAr: "توسعة شارع الإبراهيمية الرئيسي",
      type: "widen_street",
      status: "running",
      progress: 67,
      inputData: JSON.stringify({ type: "widen_street", affectedStreetIds: [streetIds[3]], parameters: { widthChange: 4 } }),
      userId: user.id,
    },
  });

  await prisma.simulation.create({
    data: {
      nameAr: "إضافة ممرات مشاة - المدينة القديمة",
      type: "add_pedestrian_zone",
      status: "pending",
      progress: 0,
      inputData: JSON.stringify({ type: "add_pedestrian_zone", affectedStreetIds: [streetIds[11]], parameters: { coordinates: [[50, 0, -100], [120, 0, -50]] } }),
      userId: user.id,
    },
  });

  const sim4 = await prisma.simulation.create({
    data: {
      nameAr: "تحسين شبكة الإنارة الذكية",
      type: "optimize_lighting",
      status: "completed",
      progress: 100,
      inputData: JSON.stringify({ type: "optimize_lighting", affectedStreetIds: streetIds.slice(0, 5), parameters: {} }),
      userId: user.id,
      completedAt: new Date("2026-04-10T11:00:00"),
    },
  });

  // Create simulation results
  const result1 = await prisma.simulationResult.create({
    data: {
      simulationId: sim1.id,
      congestionReduction: -42,
      speedIncrease: 35,
      emissionReduction: -18,
      safetyScore: 87.5,
      beforeMetrics: JSON.stringify({ avgTravelTime: 47, co2: 85, failedIntersections: 60 }),
      afterMetrics: JSON.stringify({ avgTravelTime: 19, co2: 61, failedIntersections: 8 }),
      explanationAr: "إضافة دوار عند تقاطع باب الزاوية سيقلل الازدحام بشكل كبير ويحسن تدفق حركة المرور في المنطقة المحيطة. النتائج تشير إلى تحسن ملحوظ في جميع المؤشرات.",
      dataPointsProcessed: 12847,
      modelAccuracy: 94.2,
    },
  });

  await prisma.simulationResult.create({
    data: {
      simulationId: sim4.id,
      congestionReduction: -12,
      speedIncrease: 8,
      emissionReduction: -22,
      safetyScore: 91.0,
      beforeMetrics: JSON.stringify({ avgTravelTime: 38, co2: 72, failedIntersections: 15 }),
      afterMetrics: JSON.stringify({ avgTravelTime: 34, co2: 56, failedIntersections: 5 }),
      explanationAr: "تحسين شبكة الإنارة الذكية أدى إلى تقليل كبير في الانبعاثات وتحسين ظروف السلامة المرورية ليلاً.",
      dataPointsProcessed: 8934,
      modelAccuracy: 91.8,
    },
  });

  // Create AI recommendations
  await prisma.aIRecommendation.create({
    data: {
      simulationResultId: result1.id,
      titleAr: "توصية الذكاء الاصطناعي",
      descriptionAr: "بدلاً من توسيع هذا الشارع، أضف دواراً عند التقاطع X للحصول على نتائج أفضل. التحليل يشير إلى أن الدوار سيكون أكثر فعالية من حيث التكلفة وسيحقق نتائج أفضل في تخفيف الازدحام.",
      metrics: JSON.stringify({ congestion: -31, efficiency: 42, response: 28 }),
      priority: "high",
      type: "infrastructure",
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      titleAr: "تحسين توقيت إشارات المرور",
      descriptionAr: "يمكن تحسين توقيت إشارات المرور في شارع السلام لتقليل وقت الانتظار بنسبة 25%. هذا التعديل البسيط سيحسن تدفق المرور بشكل ملحوظ.",
      metrics: JSON.stringify({ congestion: -25, efficiency: 30, response: 15 }),
      priority: "medium",
      type: "timing",
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      titleAr: "إنشاء مسار بديل",
      descriptionAr: "إنشاء مسار بديل موازٍ لشارع باب الزاوية يمكن أن يخفف الضغط المروري بنسبة 35% خلال ساعات الذروة.",
      metrics: JSON.stringify({ congestion: -35, efficiency: 28, response: 20 }),
      priority: "high",
      type: "alternative_route",
    },
  });
  console.log("✅ Simulations and recommendations created");

  // Create scenarios
  const scenariosData = [
    {
      nameAr: "سيناريو 2025 - النمو المعتدل",
      descriptionAr: "توقع نمو حركة المرور بنسبة 15% خلال 12 شهراً مع 3 مشاريع بنية تحتية",
      status: "active",
      impact: "medium",
      color: "#00AEEF",
      metrics: JSON.stringify({ traffic: "+15%", infrastructure: "3 مشاريع", timeline: "12 شهر" }),
      reliability: 87,
      userId: user.id,
    },
    {
      nameAr: "سيناريو 2030 - التوسع العمراني",
      descriptionAr: "توسعة شاملة مع 8 شوارع رئيسية جديدة ونمو مروري متوقع بنسبة 45%",
      status: "planned",
      impact: "high",
      color: "#4CAF50",
      metrics: JSON.stringify({ traffic: "+45%", infrastructure: "8 مشاريع", timeline: "5 سنوات" }),
      reliability: 72,
      userId: user.id,
    },
    {
      nameAr: "سيناريو الطوارئ - إغلاق مؤقت",
      descriptionAr: "خطة بديلة لإغلاق الطرق الرئيسية مع مسارات تحويلية",
      status: "standby",
      impact: "critical",
      color: "#FF6B6B",
      metrics: JSON.stringify({ traffic: "متغير", infrastructure: "2 بدائل", timeline: "فوري" }),
      reliability: null,
      userId: user.id,
    },
    {
      nameAr: "سيناريو النقل المستدام 2028",
      descriptionAr: "تحويل 30% من حركة المرور إلى وسائل نقل عام ومشاة",
      status: "draft",
      impact: "medium",
      color: "#FFB84D",
      metrics: JSON.stringify({ traffic: "-30%", infrastructure: "5 مشاريع", timeline: "3 سنوات" }),
      reliability: 65,
      userId: user.id,
    },
  ];

  for (const s of scenariosData) {
    await prisma.scenario.create({ data: s });
  }
  console.log("✅ Scenarios created");

  // Create reports
  const reportsData = [
    {
      titleAr: "تقرير الأداء الشهري - مارس 2026",
      type: "monthly",
      status: "ready",
      fileSize: "2.4 MB",
      pageCount: 24,
      dateAr: "1 أبريل 2026",
      userId: user.id,
      completedAt: new Date("2026-04-01"),
    },
    {
      titleAr: "تحليل الازدحام المروري - Q1 2026",
      type: "quarterly",
      status: "ready",
      fileSize: "5.8 MB",
      pageCount: 42,
      dateAr: "28 مارس 2026",
      userId: user.id,
      completedAt: new Date("2026-03-28"),
    },
    {
      titleAr: "تقرير البنية التحتية السنوي 2025",
      type: "annual",
      status: "ready",
      fileSize: "12.3 MB",
      pageCount: 86,
      dateAr: "15 يناير 2026",
      userId: user.id,
      completedAt: new Date("2026-01-15"),
    },
    {
      titleAr: "تقييم جودة الطرق - أبريل 2026",
      type: "monthly",
      status: "processing",
      fileSize: null,
      pageCount: null,
      dateAr: "قيد الإنشاء",
      userId: user.id,
      completedAt: null,
    },
  ];

  for (const r of reportsData) {
    await prisma.report.create({ data: r });
  }
  console.log("✅ Reports created");

  // Create alerts
  const alertsData = [
    { titleAr: "ازدحام شديد في شارع باب الزاوية", descriptionAr: "مستوى الازدحام وصل إلى 68% مع متوسط سرعة 12 كم/ساعة", type: "traffic", severity: "critical", isRead: false },
    { titleAr: "حساس رقم 7 بحاجة صيانة", descriptionAr: "مستوى البطارية منخفض (18%) ويحتاج لاستبدال", type: "maintenance", severity: "warning", isRead: false },
    { titleAr: "جودة الهواء منخفضة قرب المنطقة الصناعية", descriptionAr: "مؤشر جودة الهواء تجاوز الحد المسموح به", type: "safety", severity: "warning", isRead: false },
    { titleAr: "اكتمال محاكاة دوار باب الزاوية", descriptionAr: "تم الانتهاء من المحاكاة بنجاح مع نتائج إيجابية", type: "system", severity: "info", isRead: true },
    { titleAr: "تحديث نظام الإنارة الذكية", descriptionAr: "تم تحديث البرمجيات لـ 5 متحكمات إنارة", type: "system", severity: "info", isRead: true },
    { titleAr: "تقرير مارس جاهز للمراجعة", descriptionAr: "تقرير الأداء الشهري لمارس 2026 جاهز", type: "system", severity: "info", isRead: true },
  ];

  for (const a of alertsData) {
    await prisma.alert.create({ data: a });
  }
  console.log("✅ Alerts created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
