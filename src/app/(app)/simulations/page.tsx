"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FlaskConical,
  Play,
  Plus,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  BarChart2,
  Brain,
  AlertCircle,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import dynamic from "next/dynamic";
import { useSimulationStore } from "@/stores/simulation-store";
import { useMapStore } from "@/stores/map-store";

const CityMap3D = dynamic(() => import("@/components/map/CityMap3D"), { ssr: false });

type SimStatus = "pending" | "running" | "completed" | "failed";

interface SimResult {
  congestionReduction: number;
  speedIncrease: number;
  emissionReduction: number;
  safetyScore: number;
  beforeMetrics: Record<string, number>;
  afterMetrics: Record<string, number>;
  explanationAr: string;
  dataPointsProcessed: number;
  modelAccuracy: number;
  recommendations: Array<{
    id: string;
    titleAr: string;
    descriptionAr: string;
    priority: string;
    type: string;
  }>;
}

interface Simulation {
  id: string;
  nameAr: string;
  type: string;
  status: SimStatus;
  progress: number;
  createdAt: string;
  results: SimResult[];
}

const CHANGE_TYPES = [
  { type: "add_street",           labelAr: "إضافة شارع جديد",        icon: "➕" },
  { type: "widen_street",         labelAr: "توسعة شارع موجود",        icon: "↔️" },
  { type: "add_roundabout",       labelAr: "إضافة دوار مروري",        icon: "🔄" },
  { type: "remove_traffic_light", labelAr: "إزالة إشارة ضوئية",       icon: "🚦" },
  { type: "modify_street",        labelAr: "تعديل مسار شارع",         icon: "✏️" },
];

const STREET_OPTIONS = [
  "شارع السلام",
  "شارع عين ساره",
  "منطقة الحرس",
  "مفرق المدارس",
  "شارع باب الزاوية",
  "شارع الملك داود",
];

const STATUS_CONFIG: Record<SimStatus, { labelAr: string; color: string; icon: React.ElementType }> = {
  pending:   { labelAr: "في الانتظار", color: "#64748b", icon: Clock       },
  running:   { labelAr: "جارٍ",        color: "#00AEEF", icon: Play        },
  completed: { labelAr: "مكتمل",       color: "#22C55E", icon: CheckCircle },
  failed:    { labelAr: "فشل",         color: "#EF4444", icon: XCircle     },
};

// ── Progress bar ──
function ProgressBar({ progress, status }: { progress: number; status: SimStatus }) {
  const validProgress = isNaN(progress) || progress == null ? 0 : Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          backgroundColor: STATUS_CONFIG[status]?.color ?? "#64748b",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${validProgress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

// ── Simulation card ──
function SimulationCard({
  sim,
  active,
  onClick,
}: {
  sim: Simulation;
  active: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[sim.status];
  const Icon = cfg.icon;

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-right p-3 rounded-xl border transition-all duration-200 ${
        active
          ? "bg-[#00AEEF]/10 border-[#00AEEF]/50"
          : "bg-white border-slate-200 hover:border-slate-700"
      }`}
      dir="rtl"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-900 truncate">{sim.nameAr}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {new Date(sim.createdAt).toLocaleDateString("ar-PS")}
          </div>
          <div className="mt-2">
            <ProgressBar progress={sim.progress} status={sim.status} />
          </div>
        </div>
        <span
          className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full border"
          style={{
            color: cfg.color,
            borderColor: cfg.color + "40",
            backgroundColor: cfg.color + "15",
          }}
        >
          {cfg.labelAr}
        </span>
      </div>
    </motion.button>
  );
}

// ── Result panel ──
function ResultPanel({ result, simName }: { result: SimResult; simName: string }) {
  const safeNum = (n: number | undefined, def: number = 0) => isNaN(n) || n == null ? def : n;

  const radarData = [
    { subject: "تقليل الازدحام", A: safeNum(result.congestionReduction, 0) },
    { subject: "زيادة السرعة",   A: safeNum(result.speedIncrease, 0) },
    { subject: "خفض CO₂",        A: safeNum(result.emissionReduction, 0) },
    { subject: "السلامة",         A: safeNum(result.safetyScore, 60) },
  ];

  const compareData = [
    {
      metric: "وقت السفر",
      قبل: safeNum(result.beforeMetrics.avgTravelTime, 47),
      بعد: safeNum(result.afterMetrics.avgTravelTime, 19),
    },
    {
      metric: "السرعة",
      قبل: safeNum(result.beforeMetrics.avgSpeed, 18),
      بعد: safeNum(result.afterMetrics.avgSpeed, 25),
    },
    {
      metric: "CO₂",
      قبل: Math.round(safeNum(result.beforeMetrics.co2KgPerDay, 4250) / 100),
      بعد: Math.round(safeNum(result.afterMetrics.co2KgPerDay, 2550) / 100),
    },
    {
      metric: "السلامة",
      قبل: safeNum(result.beforeMetrics.safetyScore, 58),
      بعد: safeNum(result.afterMetrics.safetyScore, 75),
    },
  ];

  const priorityColors: Record<string, string> = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#22C55E",
  };
  const priorityLabels: Record<string, string> = {
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-900">نتائج محاكاة: {simName}</h3>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "تقليل الازدحام", value: safeNum(result.congestionReduction, 0), unit: "%", color: "#EF4444", icon: "📉" },
          { label: "زيادة السرعة",   value: safeNum(result.speedIncrease, 0),       unit: "%", color: "#00AEEF", icon: "⚡" },
          { label: "خفض انبعاثات",  value: safeNum(result.emissionReduction, 0),    unit: "%", color: "#10B981", icon: "🌿" },
          { label: "مؤشر السلامة",  value: safeNum(result.safetyScore, 60),          unit: "/100", color: "#8B5CF6", icon: "🛡️" },
        ].map((m) => (
          <div key={m.label} className="bg-slate-100 rounded-xl p-3 text-center">
            <div className="text-lg">{m.icon}</div>
            <div className="text-xl font-bold mt-1" style={{ color: m.color }}>
              {m.value.toFixed(1)}{m.unit}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-600 mb-2 font-medium">مؤشرات الأداء</div>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E8EAED" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#5F6368", fontSize: 9 }} />
              <Radar name="نتيجة" dataKey="A" stroke="#00AEEF" fill="#00AEEF" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-xs text-slate-600 mb-2 font-medium">قبل / بعد</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={compareData} margin={{ left: -25, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="metric" tick={{ fill: "#5F6368", fontSize: 8 }} />
              <YAxis tick={{ fill: "#5F6368", fontSize: 8 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", borderRadius: 8 }}
              />
              <Bar dataKey="قبل" fill="#EF4444" radius={[3,3,0,0]} />
              <Bar dataKey="بعد"  fill="#22C55E" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3.5 h-3.5 text-[#00AEEF]" />
          <span className="text-xs font-semibold text-[#00AEEF]">تفسير النموذج</span>
        </div>
        <p className="text-[11px] text-slate-700 leading-relaxed">{result.explanationAr}</p>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-600">
          <span>دقة النموذج: <span className="text-emerald-600 font-bold">{result.modelAccuracy.toFixed(1)}%</span></span>
          <span>نقاط البيانات: <span className="text-slate-900 font-bold">{result.dataPointsProcessed.toLocaleString("ar-PS")}</span></span>
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-900 mb-2">توصيات الذكاء الاصطناعي</div>
          <div className="space-y-2">
            {result.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-100 border border-slate-200 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-900">{rec.titleAr}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full border font-bold"
                    style={{
                      color: priorityColors[rec.priority] ?? "#64748b",
                      borderColor: (priorityColors[rec.priority] ?? "#64748b") + "40",
                      backgroundColor: (priorityColors[rec.priority] ?? "#64748b") + "15",
                    }}
                  >
                    {priorityLabels[rec.priority] ?? rec.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">{rec.descriptionAr}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── New Simulation Form ──
function NewSimulationForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [nameAr, setNameAr] = useState("");
  const [selectedStreet, setSelectedStreet] = useState(STREET_OPTIONS[0]);
  const [changeType, setChangeType] = useState(CHANGE_TYPES[0].type);
  const [widthIncrease, setWidthIncrease] = useState(3);
  const [lanes, setLanes] = useState(2);
  const [length, setLength] = useState(500);
  const [loading, setLoading] = useState(false);
  const { drawingPoints, clearDrawing } = useMapStore();

  const handleSubmit = async () => {
    if (!nameAr.trim()) return;
    setLoading(true);

    try {
      // Get first user from DB (simplified — in real app use auth)
      const usersRes = await fetch("/api/devices").catch(() => null);
      const userId = "user_default"; // fallback

      // Create simulation record
      const simRes = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr,
          type: changeType,
          userId,
          inputData: {
            mapChanges: [
              {
                type: changeType,
                streetName: selectedStreet,
                widthIncrease,
                length,
                lanes,
                drawingPoints: drawingPoints.length > 0 ? drawingPoints : undefined,
              },
            ],
          },
        }),
      });

      if (!simRes.ok) throw new Error("Failed to create simulation");
      const sim = await simRes.json();

      // Start ML simulation
      await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulationId: sim.id,
          mapChanges: [
            {
              type: changeType,
              streetName: selectedStreet,
              widthIncrease,
              length,
              lanes,
            },
          ],
          timeHorizonHours: 24,
        }),
      });

      clearDrawing();
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white border border-[#00AEEF]/30 rounded-xl p-4 space-y-4"
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4 text-[#00AEEF]" />
        <h3 className="text-sm font-bold text-slate-900">محاكاة جديدة</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-slate-600 block mb-1">اسم المحاكاة</label>
          <input
            type="text"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: توسعة شارع السلام"
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-600 focus:outline-none focus:border-[#00AEEF]/60 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">نوع التغيير</label>
          <select
            value={changeType}
            onChange={(e) => setChangeType(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#00AEEF]/60"
          >
            {CHANGE_TYPES.map((c) => (
              <option key={c.type} value={c.type}>
                {c.icon} {c.labelAr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">الشارع المستهدف</label>
          <select
            value={selectedStreet}
            onChange={(e) => setSelectedStreet(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#00AEEF]/60"
          >
            {STREET_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {changeType === "widen_street" && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">
              زيادة العرض: <span className="text-[#00AEEF] font-bold">{widthIncrease}م</span>
            </label>
            <input
              type="range" min={1} max={10} value={widthIncrease}
              onChange={(e) => setWidthIncrease(Number(e.target.value))}
              className="w-full accent-[#00AEEF]"
            />
          </div>
        )}

        {changeType === "add_street" && (
          <>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">
                الطول: <span className="text-[#00AEEF] font-bold">{length}م</span>
              </label>
              <input
                type="range" min={100} max={2000} step={50} value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-[#00AEEF]"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">
                عدد الحارات: <span className="text-[#00AEEF] font-bold">{lanes}</span>
              </label>
              <input
                type="range" min={1} max={6} value={lanes}
                onChange={(e) => setLanes(Number(e.target.value))}
                className="w-full accent-[#00AEEF]"
              />
            </div>
          </>
        )}

        {drawingPoints.length > 0 && (
          <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-2 text-[11px] text-emerald-400">
            ✓ تم رسم {drawingPoints.length} نقاط على الخريطة
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !nameAr.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#00AEEF] text-slate-900 text-sm font-semibold hover:bg-[#0099d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "جارٍ التنفيذ..." : "تشغيل المحاكاة"}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:border-slate-300 hover:text-slate-700 transition-all"
        >
          إلغاء
        </button>
      </div>
    </motion.div>
  );
}

// ── Main page ──
export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [activeSimId, setActiveSimId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { setIsSimulating, setComparisonData } = useSimulationStore();

  const fetchSimulations = useCallback(async () => {
    try {
      const res = await fetch("/api/simulations");
      const data = await res.json();
      setSimulations(data);

      // Auto-select first completed if none active
      if (!activeSimId && data.length > 0) {
        const completed = data.find((s: Simulation) => s.status === "completed");
        if (completed) setActiveSimId(completed.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeSimId]);

  useEffect(() => {
    fetchSimulations();
    pollRef.current = setInterval(fetchSimulations, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchSimulations]);

  const activeSim = simulations.find((s) => s.id === activeSimId);

  // Update global store when active simulation changes
  useEffect(() => {
    if (activeSim) {
      setIsSimulating(activeSim.status === "running");
      if (activeSim.status === "completed" && activeSim.results.length > 0) {
        const r = activeSim.results[0];
        const beforeTravelTime = r.beforeMetrics.avgTravelTime ?? 47;
        const beforeCo2 = r.beforeMetrics.co2KgPerDay ?? 4250;
        const beforeSafety = r.beforeMetrics.safetyScore ?? 58;
        const afterTravelTime = r.afterMetrics.avgTravelTime ?? 19;
        const afterCo2 = r.afterMetrics.co2KgPerDay ?? 2550;
        const afterSafety = r.afterMetrics.safetyScore ?? 75;

        setComparisonData({
          before: {
            avgTravelTime: isNaN(beforeTravelTime) ? 47 : beforeTravelTime,
            co2: isNaN(beforeCo2) ? 85 : Math.round(beforeCo2 / 100),
            failedIntersections: isNaN(beforeSafety) ? 60 : Math.round((1 - beforeSafety / 100) * 100),
          },
          after: {
            avgTravelTime: isNaN(afterTravelTime) ? 19 : afterTravelTime,
            co2: isNaN(afterCo2) ? 61 : Math.round(afterCo2 / 100),
            failedIntersections: isNaN(afterSafety) ? 8 : Math.round((1 - afterSafety / 100) * 100),
          },
        });
      }
    }
  }, [activeSim, setIsSimulating, setComparisonData]);

  return (
    <div className="flex h-full gap-0 overflow-hidden" dir="rtl">
      {/* ── Left Panel ── */}
      <div className="w-80 shrink-0 border-l border-slate-200 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#8B5CF6]" />
            <h1 className="text-sm font-bold text-slate-900">المحاكاة</h1>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6] text-[10px] font-semibold hover:bg-[#8B5CF6]/30 transition-all"
          >
            <Plus className="w-3 h-3" />
            جديد
          </button>
        </div>

        {/* New form */}
        <AnimatePresence>
          {showNewForm && (
            <div className="px-3 pt-3 pb-1">
              <NewSimulationForm
                onCreated={() => { setShowNewForm(false); fetchSimulations(); }}
                onCancel={() => setShowNewForm(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100/50 rounded-xl animate-pulse" />
            ))
          ) : simulations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <div className="text-xs">لا توجد محاكاة بعد</div>
            </div>
          ) : (
            simulations.map((sim) => (
              <SimulationCard
                key={sim.id}
                sim={sim}
                active={activeSimId === sim.id}
                onClick={() => setActiveSimId(sim.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map (top half) */}
        <div className="flex-1 relative" style={{ minHeight: 320 }}>
          <CityMap3D height="100%" />
          <div className="absolute top-3 left-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700" dir="rtl">
            <div className="font-semibold text-[#00AEEF] mb-1">الخريطة التفاعلية</div>
            <div className="text-[10px] text-slate-600">استخدم أدوات الرسم لتحديد مناطق التغيير</div>
          </div>
        </div>

        {/* Results panel (bottom half) */}
        <div className="h-[45%] border-t border-slate-200 bg-white overflow-y-auto px-5 py-4">
          {!activeSim ? (
            <div className="h-full flex items-center justify-center text-gray-600" dir="rtl">
              <div className="text-center">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <div className="text-sm">اختر محاكاة من القائمة لعرض النتائج</div>
              </div>
            </div>
          ) : activeSim.status === "running" ? (
            <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#00AEEF]/20 rounded-full" />
                <div className="w-16 h-16 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin absolute inset-0" />
                <Brain className="w-6 h-6 text-[#00AEEF] absolute inset-0 m-auto" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-900 mb-1">جارٍ تشغيل نموذج الذكاء الاصطناعي</div>
                <div className="text-xs text-gray-500">{activeSim.nameAr}</div>
              </div>
              <div className="w-64">
                <ProgressBar progress={activeSim.progress} status="running" />
                <div className="text-center text-[10px] text-[#00AEEF] mt-1">{activeSim.progress}%</div>
              </div>
            </div>
          ) : activeSim.status === "failed" ? (
            <div className="h-full flex items-center justify-center" dir="rtl">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-sm text-red-400 font-semibold">فشلت المحاكاة</div>
                <div className="text-xs text-gray-500 mt-1">{activeSim.nameAr}</div>
              </div>
            </div>
          ) : activeSim.results.length > 0 ? (
            <ResultPanel result={activeSim.results[0]} simName={activeSim.nameAr} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600" dir="rtl">
              <div className="text-sm">في انتظار بدء التحليل...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
