"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  FileEdit,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface Scenario {
  id: string;
  nameAr: string;
  descriptionAr: string;
  status: string;
  impact: string;
  color: string;
  reliability: number | null;
  metrics: {
    congestionReduction?: number;
    speedIncrease?: number;
    co2Reduction?: number;
    safetyImprovement?: number;
    costMillions?: number;
    timelineMonths?: number;
  };
  createdAt: string;
}

const STATUS_MAP: Record<string, { labelAr: string; color: string; icon: React.ElementType }> = {
  active:   { labelAr: "نشط",         color: "#22C55E", icon: CheckCircle },
  draft:    { labelAr: "مسودة",        color: "#64748b", icon: FileEdit    },
  pending:  { labelAr: "في الانتظار",  color: "#F59E0B", icon: Clock       },
  archived: { labelAr: "محفوظ",        color: "#475569", icon: AlertCircle },
};

const IMPACT_MAP: Record<string, { labelAr: string; color: string }> = {
  high:   { labelAr: "عالي",     color: "#EF4444" },
  medium: { labelAr: "متوسط",    color: "#F59E0B" },
  low:    { labelAr: "منخفض",   color: "#22C55E" },
};

const PRESET_SCENARIOS = [
  {
    nameAr: "توسعة الحلقة الداخلية",
    descriptionAr: "توسعة شوارع الحلقة الداخلية لمدينة الخليل بمعدل حارة إضافية لكل اتجاه",
    status: "active",
    impact: "high",
    color: "#00AEEF",
    metrics: { congestionReduction: 38, speedIncrease: 45, co2Reduction: 22, safetyImprovement: 15, costMillions: 12.5, timelineMonths: 24 },
  },
  {
    nameAr: "شبكة الدوارات الذكية",
    descriptionAr: "استبدال 12 تقاطع رئيسي بدوارات مرورية ذكية مزودة بأجهزة استشعار",
    status: "active",
    impact: "high",
    color: "#8B5CF6",
    metrics: { congestionReduction: 28, speedIncrease: 32, co2Reduction: 18, safetyImprovement: 42, costMillions: 8.2, timelineMonths: 18 },
  },
  {
    nameAr: "محور النقل الجماعي",
    descriptionAr: "إنشاء محور حافلات سريع على شارع السلام مع محطات ذكية",
    status: "draft",
    impact: "medium",
    color: "#10B981",
    metrics: { congestionReduction: 22, speedIncrease: 18, co2Reduction: 35, safetyImprovement: 10, costMillions: 6.8, timelineMonths: 30 },
  },
  {
    nameAr: "نظام الإشارات الضوئية الذكي",
    descriptionAr: "ربط جميع إشارات المرور بمركز تحكم ذكي يتكيف مع كثافة المرور آنياً",
    status: "pending",
    impact: "medium",
    color: "#F59E0B",
    metrics: { congestionReduction: 18, speedIncrease: 25, co2Reduction: 12, safetyImprovement: 8, costMillions: 3.4, timelineMonths: 12 },
  },
];

// ── Scenario Card ──
function ScenarioCard({
  scenario,
  active,
  onClick,
  onDelete,
}: {
  scenario: Scenario;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_MAP[scenario.status] ?? STATUS_MAP.draft;
  const impact = IMPACT_MAP[scenario.impact] ?? IMPACT_MAP.medium;
  const Icon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        active
          ? "border-opacity-60 shadow-lg"
          : "border-slate-200 bg-white hover:border-slate-700"
      }`}
      style={active ? { borderColor: scenario.color + "60", backgroundColor: scenario.color + "08" } : {}}
      onClick={onClick}
      dir="rtl"
    >
      {/* Color accent */}
      <div
        className="absolute top-0 right-0 w-1 h-full rounded-r-xl"
        style={{ backgroundColor: scenario.color }}
      />

      <div className="flex items-start justify-between mb-2 pr-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{scenario.nameAr}</div>
          <div className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">{scenario.descriptionAr}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="mr-2 p-1 rounded-md hover:bg-red-900/40 text-slate-700 hover:text-red-400 transition-all shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-2 pr-3">
        <div
          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border"
          style={{ color: status.color, borderColor: status.color + "40", backgroundColor: status.color + "15" }}
        >
          <Icon className="w-2.5 h-2.5" />
          {status.labelAr}
        </div>
        <div
          className="text-[10px] px-1.5 py-0.5 rounded-full border"
          style={{ color: impact.color, borderColor: impact.color + "40", backgroundColor: impact.color + "15" }}
        >
          تأثير {impact.labelAr}
        </div>
        {scenario.reliability && (
          <div className="text-[10px] text-slate-600 mr-auto">
            موثوقية: <span className="text-slate-900 font-bold">{scenario.reliability}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Metrics Radar ──
function MetricsRadar({ metrics }: { metrics: Scenario["metrics"] }) {
  const safeNum = (n: number | undefined, def: number = 0) => (isNaN(n) || n == null) ? def : n;
  const data = [
    { subject: "تقليل ازدحام", A: safeNum(metrics.congestionReduction, 0) },
    { subject: "رفع السرعة",   A: safeNum(metrics.speedIncrease, 0) },
    { subject: "خفض CO₂",      A: safeNum(metrics.co2Reduction, 0) },
    { subject: "السلامة",       A: safeNum(metrics.safetyImprovement, 0) },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
        <Radar
          name="السيناريو"
          dataKey="A"
          stroke="#00AEEF"
          fill="#00AEEF"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Add Scenario Modal ──
function AddScenarioModal({
  onSave,
  onClose,
}: {
  onSave: (data: Partial<Scenario>) => void;
  onClose: () => void;
}) {
  const [nameAr, setNameAr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [impact, setImpact] = useState("medium");
  const [color, setColor] = useState("#00AEEF");
  const [congestion, setCongestion] = useState(20);
  const [speed, setSpeed] = useState(20);
  const [co2, setCo2] = useState(15);
  const [safety, setSafety] = useState(10);
  const [cost, setCost] = useState(5);
  const [timeline, setTimeline] = useState(12);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white border border-slate-700 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#00AEEF]" />
            <h2 className="text-sm font-bold text-slate-900">سيناريو جديد</h2>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-600 block mb-1">اسم السيناريو *</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-[#00AEEF]/60"
              placeholder="أدخل اسم السيناريو..."
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-600 block mb-1">الوصف</label>
            <textarea
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              rows={2}
              className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-[#00AEEF]/60 resize-none"
              placeholder="وصف السيناريو..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-600 block mb-1">مستوى التأثير</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className="w-full bg-slate-100 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 focus:outline-none"
              >
                <option value="high">عالي</option>
                <option value="medium">متوسط</option>
                <option value="low">منخفض</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-600 block mb-1">اللون</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 bg-slate-100 border border-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="text-[10px] text-slate-600 mb-2 font-semibold">المؤشرات المتوقعة (%)</div>
            {[
              { label: "تقليل الازدحام", val: congestion, set: setCongestion },
              { label: "رفع السرعة",     val: speed,      set: setSpeed      },
              { label: "خفض CO₂",        val: co2,        set: setCo2        },
              { label: "تحسين السلامة",  val: safety,     set: setSafety     },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-slate-600 w-24 shrink-0">{item.label}</span>
                <input
                  type="range" min={0} max={80} value={item.val}
                  onChange={(e) => item.set(Number(e.target.value))}
                  className="flex-1 accent-[#00AEEF]"
                />
                <span className="text-[10px] text-[#00AEEF] font-bold w-8 text-right">{item.val}%</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-600 block mb-1">التكلفة (مليون ₪)</label>
              <input
                type="number" min={0} value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 block mb-1">المدة (أشهر)</label>
              <input
                type="number" min={1} value={timeline}
                onChange={(e) => setTimeline(Number(e.target.value))}
                className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => {
              if (!nameAr.trim()) return;
              onSave({
                nameAr,
                descriptionAr,
                status: "draft",
                impact,
                color,
                metrics: { congestionReduction: congestion, speedIncrease: speed, co2Reduction: co2, safetyImprovement: safety, costMillions: cost, timelineMonths: timeline },
              });
            }}
            disabled={!nameAr.trim()}
            className="flex-1 py-2 rounded-lg bg-[#00AEEF] text-slate-900 text-sm font-semibold hover:bg-[#0099d4] transition-all disabled:opacity-50"
          >
            حفظ السيناريو
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:border-slate-300 transition-all"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──
export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchScenarios = useCallback(async () => {
    try {
      const res = await fetch("/api/scenarios");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setScenarios(data);
        if (!activeId) setActiveId(data[0].id);
      } else {
        // Seed with presets if empty
        for (const preset of PRESET_SCENARIOS) {
          await fetch("/api/scenarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...preset, metrics: JSON.stringify(preset.metrics), userId: "seed" }),
          });
        }
        const res2 = await fetch("/api/scenarios");
        const data2 = await res2.json();
        setScenarios(data2);
        if (data2.length > 0) setActiveId(data2[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => { fetchScenarios(); }, []);

  const activeScenario = scenarios.find((s) => s.id === activeId);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      if (activeId === id) setActiveId(scenarios.find((s) => s.id !== id)?.id ?? null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (data: Partial<Scenario>) => {
    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          metrics: JSON.stringify(data.metrics ?? {}),
          userId: "user_default",
        }),
      });
      const newScenario = await res.json();
      setScenarios((prev) => [newScenario, ...prev]);
      setActiveId(newScenario.id);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/scenarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setScenarios((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">
      {/* ── Left Panel ── */}
      <div className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#F59E0B]" />
            <h1 className="text-sm font-bold text-slate-900">السيناريوهات</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] font-semibold hover:bg-[#F59E0B]/30 transition-all"
          >
            <Plus className="w-3 h-3" />
            جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0 border-b border-slate-200">
          {[
            { label: "نشط",    value: scenarios.filter((s) => s.status === "active").length,   color: "#22C55E" },
            { label: "مسودة",  value: scenarios.filter((s) => s.status === "draft").length,    color: "#64748b" },
            { label: "انتظار", value: scenarios.filter((s) => s.status === "pending").length,  color: "#F59E0B" },
          ].map((stat, i) => (
            <div key={i} className="text-center py-3 border-l last:border-l-0 border-slate-200">
              <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] text-slate-600 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100/50 rounded-xl animate-pulse" />
            ))
          ) : (
            <AnimatePresence>
              {scenarios.map((s) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  active={activeId === s.id}
                  onClick={() => setActiveId(s.id)}
                  onDelete={() => handleDelete(s.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {!activeScenario ? (
          <div className="h-full flex items-center justify-center text-slate-700">
            <div className="text-center">
              <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <div className="text-sm">اختر سيناريو لعرض التفاصيل</div>
            </div>
          </div>
        ) : (
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Header */}
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: activeScenario.color + "40",
                background: `linear-gradient(135deg, ${activeScenario.color}08 0%, transparent 100%)`,
              }}
              dir="rtl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeScenario.nameAr}</h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">{activeScenario.descriptionAr}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={activeScenario.status}
                    onChange={(e) => handleStatusChange(activeScenario.id, e.target.value)}
                    className="bg-slate-100 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    {Object.entries(STATUS_MAP).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.labelAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "تقليل الازدحام", val: activeScenario.metrics.congestionReduction, unit: "%", icon: "📉", color: "#EF4444" },
                  { label: "رفع السرعة",     val: activeScenario.metrics.speedIncrease,       unit: "%", icon: "⚡", color: "#00AEEF" },
                  { label: "خفض CO₂",        val: activeScenario.metrics.co2Reduction,        unit: "%", icon: "🌿", color: "#10B981" },
                  { label: "تحسين السلامة",  val: activeScenario.metrics.safetyImprovement,   unit: "%", icon: "🛡️", color: "#8B5CF6" },
                ].map((m) => (
                  <div key={m.label} className="bg-white/60 rounded-xl p-3 text-center border border-slate-200">
                    <div>{m.icon}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: m.color }}>
                      {m.val != null ? `${m.val}${m.unit}` : "—"}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Radar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4" dir="rtl">
                <h3 className="text-xs font-semibold text-slate-900 mb-2">مخطط الأداء الشامل</h3>
                <MetricsRadar metrics={activeScenario.metrics} />
              </div>

              {/* Project details */}
              <div className="bg-white border border-slate-200 rounded-xl p-4" dir="rtl">
                <h3 className="text-xs font-semibold text-slate-900 mb-4">تفاصيل المشروع</h3>
                <div className="space-y-3">
                  {[
                    { label: "التكلفة الإجمالية", value: activeScenario.metrics.costMillions ? `${activeScenario.metrics.costMillions} مليون ₪` : "غير محدد", icon: "💰" },
                    { label: "المدة الزمنية",      value: activeScenario.metrics.timelineMonths ? `${activeScenario.metrics.timelineMonths} شهر` : "غير محدد", icon: "📅" },
                    { label: "مستوى التأثير",      value: IMPACT_MAP[activeScenario.impact]?.labelAr ?? "متوسط", icon: "📊" },
                    { label: "الموثوقية",           value: activeScenario.reliability ? `${activeScenario.reliability}%` : "—", icon: "✅" },
                    { label: "تاريخ الإنشاء",      value: new Date(activeScenario.createdAt).toLocaleDateString("ar-PS"), icon: "🗓️" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-200 last:border-0">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-600">{item.label}</div>
                        <div className="text-xs font-semibold text-slate-900 mt-0.5">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison with other scenarios */}
            {scenarios.length > 1 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4" dir="rtl">
                <h3 className="text-xs font-semibold text-slate-900 mb-4">مقارنة السيناريوهات</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-right py-2 text-slate-600 font-normal">السيناريو</th>
                        <th className="text-center py-2 text-slate-600 font-normal">الازدحام</th>
                        <th className="text-center py-2 text-slate-600 font-normal">السرعة</th>
                        <th className="text-center py-2 text-slate-600 font-normal">CO₂</th>
                        <th className="text-center py-2 text-slate-600 font-normal">التكلفة</th>
                        <th className="text-center py-2 text-slate-600 font-normal">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios.map((s) => {
                        const isActive = s.id === activeScenario.id;
                        return (
                          <tr
                            key={s.id}
                            className={`border-b border-slate-200 last:border-0 cursor-pointer transition-all ${isActive ? "bg-[#00AEEF]/5" : "hover:bg-slate-100/50"}`}
                            onClick={() => setActiveId(s.id)}
                          >
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                <span className={isActive ? "text-slate-900 font-semibold" : "text-slate-600"}>{s.nameAr}</span>
                              </div>
                            </td>
                            <td className="text-center py-2.5">
                              <span className={s.metrics.congestionReduction ? "text-red-400 font-bold" : "text-slate-700"}>
                                {s.metrics.congestionReduction ? `−${s.metrics.congestionReduction}%` : "—"}
                              </span>
                            </td>
                            <td className="text-center py-2.5">
                              <span className={s.metrics.speedIncrease ? "text-[#00AEEF] font-bold" : "text-slate-700"}>
                                {s.metrics.speedIncrease ? `+${s.metrics.speedIncrease}%` : "—"}
                              </span>
                            </td>
                            <td className="text-center py-2.5">
                              <span className={s.metrics.co2Reduction ? "text-emerald-400 font-bold" : "text-slate-700"}>
                                {s.metrics.co2Reduction ? `−${s.metrics.co2Reduction}%` : "—"}
                              </span>
                            </td>
                            <td className="text-center py-2.5 text-slate-600">
                              {s.metrics.costMillions ? `${s.metrics.costMillions}م` : "—"}
                            </td>
                            <td className="text-center py-2.5">
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                style={{
                                  color: STATUS_MAP[s.status]?.color ?? "#64748b",
                                  backgroundColor: (STATUS_MAP[s.status]?.color ?? "#64748b") + "20",
                                }}
                              >
                                {STATUS_MAP[s.status]?.labelAr ?? s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddScenarioModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
