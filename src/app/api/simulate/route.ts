import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─────────────────────────────────────────────
// ML Simulation Engine (TypeScript)
// Implements fake regression + simple neural network logic
// ─────────────────────────────────────────────

interface MapChange {
  type: "add_street" | "widen_street" | "add_roundabout" | "remove_traffic_light" | "modify_street";
  streetName?: string;
  widthIncrease?: number;       // meters
  length?: number;              // meters
  lanes?: number;
  currentCongestion?: number;   // 0–1
}

interface SimulationInput {
  simulationId: string;
  mapChanges: MapChange[];
  timeHorizonHours?: number;
}

// ── Activation functions ──
function relu(x: number): number {
  return Math.max(0, x);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function tanh(x: number): number {
  return Math.tanh(x);
}

// ── Simple 3-layer neural network ──
// Input layer: [normalised change count, total length, width factor, roundabouts, removed lights]
// Hidden layer 1: 8 neurons (ReLU)
// Hidden layer 2: 4 neurons (tanh)
// Output layer: 4 neurons (sigmoid) → [congestion, speed, co2, safety]

const W1: number[][] = [
  [0.42, -0.31,  0.18,  0.55, -0.22],
  [0.61,  0.27, -0.44,  0.38,  0.49],
  [-0.19, 0.53,  0.67, -0.29,  0.33],
  [0.38, -0.18,  0.52,  0.41, -0.35],
  [0.55,  0.44, -0.27,  0.63,  0.21],
  [-0.33, 0.61,  0.39, -0.48,  0.57],
  [0.29, -0.52,  0.44,  0.37,  0.68],
  [0.47,  0.35, -0.61,  0.52, -0.28],
];
const B1: number[] = [0.1, -0.05, 0.08, 0.12, -0.03, 0.07, 0.15, -0.06];

const W2: number[][] = [
  [ 0.52,  0.38, -0.29,  0.61,  0.44, -0.33,  0.27,  0.55],
  [-0.41,  0.63,  0.47, -0.28,  0.59,  0.35, -0.44,  0.31],
  [ 0.34, -0.57,  0.62,  0.39, -0.46,  0.51,  0.28, -0.63],
  [ 0.48,  0.29, -0.53,  0.44,  0.37, -0.62,  0.55,  0.24],
];
const B2: number[] = [0.05, -0.08, 0.11, 0.03];

const W3: number[][] = [
  [ 0.73, -0.41,  0.58,  0.32],
  [-0.28,  0.65,  0.39, -0.47],
  [ 0.51,  0.29, -0.62,  0.58],
  [ 0.44, -0.55,  0.37,  0.61],
];
const B3: number[] = [0.06, -0.04, 0.09, 0.02];

function forwardPass(input: number[]): number[] {
  // Layer 1
  const h1 = W1.map((weights, i) => {
    const sum = weights.reduce((acc, w, j) => acc + w * input[j], 0) + B1[i];
    return relu(sum);
  });

  // Layer 2
  const h2 = W2.map((weights, i) => {
    const sum = weights.reduce((acc, w, j) => acc + w * h1[j], 0) + B2[i];
    return tanh(sum);
  });

  // Output layer
  const out = W3.map((weights, i) => {
    const sum = weights.reduce((acc, w, j) => acc + w * h2[j], 0) + B3[i];
    return sigmoid(sum);
  });

  return out;
}

// ── Feature extraction from map changes ──
function extractFeatures(changes: MapChange[]): number[] {
  const changeCount = Math.min(changes.length / 10, 1);
  const totalLength = Math.min(
    changes.reduce((sum, c) => sum + (c.length ?? 200), 0) / 5000,
    1
  );
  const widthFactor = Math.min(
    changes.reduce((sum, c) => sum + (c.widthIncrease ?? 0), 0) / 50,
    1
  );
  const roundabouts = Math.min(
    changes.filter((c) => c.type === "add_roundabout").length / 5,
    1
  );
  const removedLights = Math.min(
    changes.filter((c) => c.type === "remove_traffic_light").length / 10,
    1
  );
  return [changeCount, totalLength, widthFactor, roundabouts, removedLights];
}

// ── Regression adjustments (domain-specific corrections) ──
function regressionCorrection(
  changes: MapChange[],
  rawOutput: number[]
): { congestion: number; speed: number; co2: number; safety: number } {
  let congestionReduction = rawOutput[0] * 45 + 5;  // 5–50%
  let speedIncrease = rawOutput[1] * 35 + 5;        // 5–40%
  let emissionReduction = rawOutput[2] * 40 + 5;    // 5–45%
  let safetyScore = rawOutput[3] * 30 + 60;         // 60–90

  // Regression corrections based on change types
  for (const change of changes) {
    if (change.type === "add_street") {
      congestionReduction += (change.lanes ?? 2) * 2.5;
      speedIncrease += (change.length ?? 200) / 100;
    }
    if (change.type === "widen_street") {
      congestionReduction += (change.widthIncrease ?? 3) * 1.8;
      speedIncrease += (change.widthIncrease ?? 3) * 1.2;
      emissionReduction += (change.widthIncrease ?? 3) * 0.9;
    }
    if (change.type === "add_roundabout") {
      safetyScore += 4.5;
      congestionReduction += 3.2;
      emissionReduction += 2.1;
    }
    if (change.type === "remove_traffic_light") {
      speedIncrease += 2.8;
      emissionReduction += 1.5;
    }
  }

  // Clamp all values
  congestionReduction = Math.min(Math.max(congestionReduction, 5), 75);
  speedIncrease = Math.min(Math.max(speedIncrease, 5), 65);
  emissionReduction = Math.min(Math.max(emissionReduction, 5), 70);
  safetyScore = Math.min(Math.max(safetyScore, 55), 98);

  return { congestion: congestionReduction, speed: speedIncrease, co2: emissionReduction, safety: safetyScore };
}

// ── Generate Arabic recommendation text ──
function generateArabicRecommendations(
  changes: MapChange[],
  metrics: { congestion: number; speed: number; co2: number; safety: number }
): Array<{ titleAr: string; descriptionAr: string; priority: string; type: string; metrics: object }> {
  const recommendations = [];

  if (metrics.congestion > 20) {
    recommendations.push({
      titleAr: "تحسين تدفق حركة المرور",
      descriptionAr: `من المتوقع أن تؤدي التغييرات المقترحة إلى تقليل الازدحام بنسبة ${metrics.congestion.toFixed(1)}% في الشوارع الرئيسية. يُنصح بتطبيق نظام إشارات ذكي متزامن لتحقيق أقصى استفادة.`,
      priority: metrics.congestion > 35 ? "high" : "medium",
      type: "traffic",
      metrics: { congestionReduction: metrics.congestion, affectedStreets: changes.length },
    });
  }

  if (metrics.co2 > 15) {
    recommendations.push({
      titleAr: "خفض الانبعاثات الكربونية",
      descriptionAr: `يُتوقع تخفيض انبعاثات ثاني أكسيد الكربون بنسبة ${metrics.co2.toFixed(1)}% مما يُسهم في تحسين جودة الهواء في مدينة الخليل. يُوصى بزراعة أشجار إضافية على جوانب الطرق الجديدة.`,
      priority: metrics.co2 > 30 ? "high" : "medium",
      type: "environment",
      metrics: { emissionReduction: metrics.co2, treesRequired: Math.ceil(changes.length * 12) },
    });
  }

  if (metrics.safety > 70) {
    recommendations.push({
      titleAr: "تعزيز السلامة المرورية",
      descriptionAr: `سيرتفع مؤشر السلامة المرورية إلى ${metrics.safety.toFixed(0)} نقطة من أصل 100. إضافة الدوارات تُقلل حوادث التقاطع بنسبة تصل إلى 40%. يُنصح بإضافة ممرات مشاة مضيئة عند كل تقاطع رئيسي.`,
      priority: "medium",
      type: "safety",
      metrics: { safetyScore: metrics.safety, accidentReduction: Math.round(metrics.safety * 0.4) },
    });
  }

  if (changes.some((c) => c.type === "add_roundabout")) {
    recommendations.push({
      titleAr: "الدوارات كحلول مستدامة",
      descriptionAr: "الدوارات المقترحة ستُحسّن انسيابية حركة المرور وتُقلل أوقات الانتظار عند التقاطعات بنسبة 35%. يُنصح بتجهيزها بإضاءة LED موفرة للطاقة وعلامات توجيهية بالعربية.",
      priority: "low",
      type: "infrastructure",
      metrics: { intersectionDelay: -35, energySaving: 22 },
    });
  }

  if (changes.some((c) => c.type === "add_street" && (c.length ?? 0) > 300)) {
    recommendations.push({
      titleAr: "شوارع جديدة — متطلبات البنية التحتية",
      descriptionAr: "الشوارع الجديدة المقترحة تستلزم تمديد شبكة الصرف الصحي، وشبكة المياه، وأسلاك الكهرباء. يُوصى بالتنسيق مع بلدية الخليل قبل البدء بأعمال الإنشاء.",
      priority: "high",
      type: "infrastructure",
      metrics: { infrastructureCost: changes.filter((c) => c.type === "add_street").length * 850000, timelineMonths: 18 },
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      titleAr: "التأثير العام للمشروع",
      descriptionAr: `التحسينات المقترحة ستُحسّن كفاءة شبكة الطرق في الخليل بشكل ملحوظ. تقليل وقت السفر بمعدل ${metrics.speed.toFixed(1)}% وتحسين مؤشر السلامة العامة.`,
      priority: "medium",
      type: "general",
      metrics: { overallImprovement: (metrics.congestion + metrics.speed + metrics.co2) / 3 },
    });
  }

  return recommendations;
}

// ── Main ML Simulation Logic ──
function runMLSimulation(input: SimulationInput): {
  congestionReduction: number;
  speedIncrease: number;
  emissionReduction: number;
  safetyScore: number;
  beforeMetrics: object;
  afterMetrics: object;
  explanationAr: string;
  dataPointsProcessed: number;
  modelAccuracy: number;
  recommendations: ReturnType<typeof generateArabicRecommendations>;
} {
  const features = extractFeatures(input.mapChanges);
  const rawOutput = forwardPass(features);
  const metrics = regressionCorrection(input.mapChanges, rawOutput);

  // Add small noise for realism
  const noise = () => (Math.random() - 0.5) * 2;
  metrics.congestion += noise();
  metrics.speed += noise();
  metrics.co2 += noise();
  metrics.safety = Math.min(98, metrics.safety + noise() * 0.5);

  const beforeMetrics = {
    avgTravelTime: 47,
    congestionIndex: 0.72,
    co2KgPerDay: 4250,
    safetyScore: 58,
    avgSpeed: 18,
    vehiclesPerHour: 1840,
  };

  const afterMetrics = {
    avgTravelTime: Math.round(47 * (1 - metrics.speed / 100)),
    congestionIndex: parseFloat((0.72 * (1 - metrics.congestion / 100)).toFixed(3)),
    co2KgPerDay: Math.round(4250 * (1 - metrics.co2 / 100)),
    safetyScore: parseFloat(metrics.safety.toFixed(1)),
    avgSpeed: Math.round(18 * (1 + metrics.speed / 100)),
    vehiclesPerHour: Math.round(1840 * (1 + metrics.congestion / 100 * 0.3)),
  };

  const changeTypeNames: Record<string, string> = {
    add_street: "إضافة شارع",
    widen_street: "توسعة شارع",
    add_roundabout: "إضافة دوار",
    remove_traffic_light: "إزالة إشارة ضوئية",
    modify_street: "تعديل شارع",
  };

  const changesSummary = input.mapChanges
    .map((c) => changeTypeNames[c.type] ?? c.type)
    .join("، ");

  const explanationAr = `
تم تحليل ${input.mapChanges.length} تغيير مقترح على شبكة الطرق في مدينة الخليل باستخدام نموذج الشبكة العصبية المتعددة الطبقات (MLP) مع تصحيحات الانحدار الخطي.
التغييرات المُحللة: ${changesSummary}.
النتائج تُشير إلى تحسين ملموس في معدل تدفق المركبات بنسبة ${metrics.speed.toFixed(1)}%،
وتراجع الازدحام بمقدار ${metrics.congestion.toFixed(1)}%،
وخفض انبعاثات CO₂ بنسبة ${metrics.co2.toFixed(1)}%.
مؤشر السلامة المرورية المتوقع: ${metrics.safety.toFixed(0)}/100.
الأفق الزمني المُحلَّل: ${input.timeHorizonHours ?? 24} ساعة.
  `.trim();

  const dataPointsProcessed = 14400 + Math.floor(Math.random() * 5600);
  const modelAccuracy = 87.5 + Math.random() * 7.5;

  const recommendations = generateArabicRecommendations(input.mapChanges, metrics);

  const congestionReduction = parseFloat(metrics.congestion.toFixed(2));
  const speedIncrease = parseFloat(metrics.speed.toFixed(2));
  const emissionReduction = parseFloat(metrics.co2.toFixed(2));
  const safetyScore = parseFloat(metrics.safety.toFixed(2));

  return {
    congestionReduction: isNaN(congestionReduction) ? 0 : congestionReduction,
    speedIncrease: isNaN(speedIncrease) ? 0 : speedIncrease,
    emissionReduction: isNaN(emissionReduction) ? 0 : emissionReduction,
    safetyScore: isNaN(safetyScore) ? 0 : safetyScore,
    beforeMetrics,
    afterMetrics,
    explanationAr,
    dataPointsProcessed,
    modelAccuracy: isNaN(modelAccuracy) ? 87.5 : parseFloat(modelAccuracy.toFixed(2)),
    recommendations,
  };
}

// ── Simulate progress updates (stored in DB) ──
async function runSimulationWithProgress(simulationId: string, input: SimulationInput) {
  const steps = [10, 25, 40, 60, 75, 90, 100];

  for (const progress of steps) {
    await new Promise((r) => setTimeout(r, 300));
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { progress, status: progress < 100 ? "running" : "completed" },
    });
  }

  const result = runMLSimulation(input);

  const simResult = await prisma.simulationResult.create({
    data: {
      simulationId,
      congestionReduction: result.congestionReduction,
      speedIncrease: result.speedIncrease,
      emissionReduction: result.emissionReduction,
      safetyScore: result.safetyScore,
      beforeMetrics: JSON.stringify(result.beforeMetrics),
      afterMetrics: JSON.stringify(result.afterMetrics),
      explanationAr: result.explanationAr,
      dataPointsProcessed: result.dataPointsProcessed,
      modelAccuracy: result.modelAccuracy,
    },
  });

  for (const rec of result.recommendations) {
    await prisma.aIRecommendation.create({
      data: {
        simulationResultId: simResult.id,
        titleAr: rec.titleAr,
        descriptionAr: rec.descriptionAr,
        priority: rec.priority,
        type: rec.type,
        metrics: JSON.stringify(rec.metrics),
      },
    });
  }

  await prisma.simulation.update({
    where: { id: simulationId },
    data: { completedAt: new Date(), status: "completed", progress: 100 },
  });
}

// ── POST /api/simulate ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { simulationId, mapChanges, timeHorizonHours } = body as SimulationInput;

    if (!simulationId || !mapChanges || !Array.isArray(mapChanges)) {
      return NextResponse.json(
        { error: "simulationId and mapChanges are required" },
        { status: 400 }
      );
    }

    // Mark as running immediately
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "running", progress: 5 },
    });

    // Run simulation async (don't await — respond immediately)
    runSimulationWithProgress(simulationId, { simulationId, mapChanges, timeHorizonHours }).catch(
      (err) => {
        console.error("Simulation error:", err);
        prisma.simulation.update({
          where: { id: simulationId },
          data: { status: "failed" },
        });
      }
    );

    return NextResponse.json({
      message: "Simulation started",
      simulationId,
      status: "running",
    });
  } catch (error) {
    console.error("POST /api/simulate error:", error);
    return NextResponse.json({ error: "Failed to start simulation" }, { status: 500 });
  }
}

// ── GET /api/simulate?id=xxx (poll status) ──
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        results: {
          include: { recommendations: true },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...simulation,
      inputData: (() => {
        try { return JSON.parse(simulation.inputData); } catch { return simulation.inputData; }
      })(),
      results: simulation.results.map((r) => ({
        ...r,
        beforeMetrics: (() => { try { return JSON.parse(r.beforeMetrics); } catch { return r.beforeMetrics; } })(),
        afterMetrics: (() => { try { return JSON.parse(r.afterMetrics); } catch { return r.afterMetrics; } })(),
        recommendations: r.recommendations.map((rec) => ({
          ...rec,
          metrics: (() => { try { return JSON.parse(rec.metrics); } catch { return rec.metrics; } })(),
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/simulate error:", error);
    return NextResponse.json({ error: "Failed to fetch simulation" }, { status: 500 });
  }
}
