"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
  X,
  BarChart2,
  FileBarChart,
  FileSpreadsheet,
  FilePieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Report {
  id: string;
  titleAr: string;
  type: string;
  status: string;
  fileSize: string | null;
  pageCount: number | null;
  dateAr: string;
  createdAt: string;
  user?: { nameAr: string; avatarInitial: string };
}

const REPORT_TYPES: Record<string, { labelAr: string; icon: React.ComponentType<any>; color: string; description: string }> = {
  traffic:     { labelAr: "تقرير المرور",          icon: BarChart2,       color: "#00AEEF", description: "تحليل تدفق المركبات والازدحام وأوقات الذروة" },
  simulation:  { labelAr: "تقرير المحاكاة",        icon: FileBarChart,   color: "#8B5CF6", description: "نتائج نماذج الذكاء الاصطناعي والتنبؤات المستقبلية" },
  environment: { labelAr: "التقرير البيئي",         icon: FilePieChart,   color: "#10B981", description: "انبعاثات CO₂ وجودة الهواء والأثر البيئي" },
  iot:         { labelAr: "تقرير أجهزة IoT",       icon: FileSpreadsheet, color: "#F59E0B", description: "حالة المستشعرات والأجهزة الذكية والبيانات المُجمَّعة" },
  kpi:         { labelAr: "مؤشرات الأداء",         icon: BarChart2,       color: "#EC4899", description: "ملخص شامل لكل مؤشرات أداء المدينة الذكية" },
  monthly:     { labelAr: "التقرير الشهري",         icon: FileText,        color: "#6B7280", description: "تقرير شامل عن أنشطة الشهر الماضي" },
};

const STATUS_MAP: Record<string, { labelAr: string; color: string; icon: React.ComponentType<any> }> = {
  ready:      { labelAr: "جاهز",       color: "#22C55E", icon: CheckCircle },
  generating: { labelAr: "جارٍ الإنشاء", color: "#00AEEF", icon: Loader2    },
  pending:    { labelAr: "في الانتظار", color: "#F59E0B", icon: Clock       },
  failed:     { labelAr: "فشل",         color: "#EF4444", icon: X           },
};

// ── Preview charts data ──
const TRAFFIC_CHART = [
  { time: "٦ص",  مركبات: 420  },
  { time: "٧ص",  مركبات: 980  },
  { time: "٨ص",  مركبات: 1620 },
  { time: "٩ص",  مركبات: 1400 },
  { time: "١٠ص", مركبات: 1100 },
  { time: "١١ص", مركبات: 950  },
  { time: "١٢م", مركبات: 1350 },
  { time: "١م",  مركبات: 1580 },
  { time: "٢م",  مركبات: 1700 },
  { time: "٣م",  مركبات: 1850 },
  { time: "٤م",  مركبات: 1920 },
  { time: "٥م",  مركبات: 1650 },
];

const CO2_TREND = [
  { month: "يناير",   co2: 92 },
  { month: "فبراير",  co2: 88 },
  { month: "مارس",    co2: 85 },
  { month: "أبريل",   co2: 79 },
  { month: "مايو",    co2: 72 },
  { month: "يونيو",   co2: 68 },
  { month: "يوليو",   co2: 65 },
];

const DEVICE_STATUS = [
  { name: "نشطة",    value: 214, color: "#22C55E" },
  { name: "تحذير",   value: 23,  color: "#F59E0B" },
  { name: "خطأ",     value: 10,  color: "#EF4444" },
];

// ── Report Card ──
function ReportCard({
  report,
  active,
  onClick,
  onDelete,
  onDownload,
}: {
  report: Report;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const typeInfo = REPORT_TYPES[report.type] ?? REPORT_TYPES.traffic;
  const statusInfo = STATUS_MAP[report.status] ?? STATUS_MAP.pending;
  const Icon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
        active
          ? "border-[#10B981]/40 bg-[#10B981]/5"
          : "border-slate-200 bg-white hover:border-slate-700"
      }`}
      onClick={onClick}
      dir="rtl"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: typeInfo.color + "20", border: `1px solid ${typeInfo.color}30` }}
      >
        <Icon className="w-4 h-4" style={{ color: typeInfo.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-900 truncate">{report.titleAr}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusIcon
            className={`w-2.5 h-2.5 ${report.status === "generating" ? "animate-spin" : ""}`}
            style={{ color: statusInfo.color }}
          />
          <span className="text-[10px]" style={{ color: statusInfo.color }}>{statusInfo.labelAr}</span>
          {report.pageCount && (
            <span className="text-[10px] text-slate-700">{report.pageCount} صفحة</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {report.status === "ready" && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="p-1.5 rounded-lg hover:bg-emerald-900/40 text-slate-600 hover:text-emerald-400 transition-all"
          >
            <Download className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-700 hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Report Preview ──
function ReportPreview({ report }: { report: Report }) {
  const typeInfo = REPORT_TYPES[report.type] ?? REPORT_TYPES.traffic;
  const Icon = typeInfo.icon;

  return (
    <motion.div
      key={report.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      dir="rtl"
    >
      {/* Header */}
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: typeInfo.color + "40",
          background: `linear-gradient(135deg, ${typeInfo.color}08 0%, transparent 100%)`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: typeInfo.color + "20", border: `1px solid ${typeInfo.color}40` }}
          >
            <Icon className="w-6 h-6" style={{ color: typeInfo.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">{report.titleAr}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{typeInfo.description}</p>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-600">
              <span>التاريخ: {report.dateAr}</span>
              {report.pageCount && <span>{report.pageCount} صفحة</span>}
              {report.fileSize && <span>الحجم: {report.fileSize}</span>}
              {report.user && <span>بواسطة: {report.user.nameAr}</span>}
            </div>
          </div>
          {report.status === "ready" && (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
              style={{ borderColor: typeInfo.color + "40", color: typeInfo.color, backgroundColor: typeInfo.color + "10" }}
            >
              <Download className="w-3.5 h-3.5" />
              تحميل PDF
            </button>
          )}
        </div>
      </div>

      {/* Chart preview based on type */}
      {report.type === "traffic" && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-900 mb-3">معدل المركبات خلال اليوم</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TRAFFIC_CHART} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="مركبات" fill="#00AEEF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {report.type === "environment" && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-900 mb-3">اتجاه انبعاثات CO₂ (طن/يوم)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CO2_TREND} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
              <Line type="monotone" dataKey="co2" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {report.type === "iot" && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-900 mb-3">حالة الأجهزة الذكية</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={DEVICE_STATUS} cx="50%" cy="50%" outerRadius={58} dataKey="value" paddingAngle={3}>
                  {DEVICE_STATUS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {DEVICE_STATUS.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-700">{item.name}</span>
                  <span className="text-xs font-bold text-slate-900 mr-2">{item.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-700">
                <span className="text-[10px] text-slate-600">الإجمالي: </span>
                <span className="text-xs font-bold text-slate-900">
                  {DEVICE_STATUS.reduce((s, d) => s + d.value, 0)} جهاز
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي البيانات",    value: "14,280",  icon: "📊" },
          { label: "فترة التحليل",        value: "30 يوم",  icon: "📅" },
          { label: "دقة النموذج",         value: "91.4%",   icon: "🎯" },
          { label: "التوصيات",            value: "8 توصية", icon: "💡" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-sm font-bold text-slate-900">{stat.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Key findings */}
      <div className="bg-white border border-slate-200 rounded-xl p-4" dir="rtl">
        <h3 className="text-xs font-semibold text-slate-900 mb-3">أبرز النتائج</h3>
        <div className="space-y-2.5">
          {[
            { icon: "📉", text: "انخفض معدل الازدحام بنسبة 23% مقارنة بالشهر الماضي في شارع السلام" },
            { icon: "⚡", text: "تحسّن متوسط سرعة المركبات من 18 كم/س إلى 26 كم/س في أوقات الذروة" },
            { icon: "🌿", text: "تراجعت انبعاثات CO₂ بمقدار 14 طن/يوم بفضل تحسينات حركة المرور" },
            { icon: "🚨", text: "تم تسجيل 3 حوادث أقل من المتوسط الشهري المعتاد في المنطقة المدروسة" },
            { icon: "📡", text: "نسبة توافر المستشعرات الذكية: 94.7% — أعلى معدل منذ تشغيل الشبكة" },
          ].map((finding, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-200 last:border-0">
              <span className="text-sm shrink-0">{finding.icon}</span>
              <span className="text-xs text-slate-700 leading-relaxed">{finding.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── New Report Modal ──
function NewReportModal({ onSave, onClose }: { onSave: (data: Partial<Report>) => void; onClose: () => void }) {
  const [titleAr, setTitleAr] = useState("");
  const [type, setType] = useState("traffic");

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
        exit={{ scale: 0.95 }}
        className="bg-white border border-slate-700 rounded-2xl p-5 w-full max-w-md"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-sm font-bold text-slate-900">تقرير جديد</h2>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-600 block mb-1">عنوان التقرير *</label>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-[#10B981]/60"
              placeholder="أدخل عنوان التقرير..."
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-600 block mb-2">نوع التقرير</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(REPORT_TYPES).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-all ${
                      type === key
                        ? "border-opacity-60"
                        : "border-slate-700 bg-slate-100/50 hover:border-slate-600"
                    }`}
                    style={type === key ? { borderColor: info.color + "60", backgroundColor: info.color + "10" } : {}}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: info.color }} />
                    <span className={`text-[10px] font-medium ${type === key ? "text-slate-900" : "text-slate-600"}`}>
                      {info.labelAr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => {
              if (!titleAr.trim()) return;
              onSave({
                titleAr,
                type,
                status: "generating",
                dateAr: new Date().toLocaleDateString("ar-PS"),
              });
            }}
            disabled={!titleAr.trim()}
            className="flex-1 py-2 rounded-lg bg-[#10B981] text-slate-900 text-sm font-semibold hover:bg-[#059669] transition-all disabled:opacity-50"
          >
            إنشاء التقرير
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:border-slate-300 transition-all">
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──
export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setReports(data);
        if (!activeId) setActiveId(data[0].id);
      } else {
        // Seed reports
        const seeds = [
          { titleAr: "تقرير المرور — أبريل 2035",    type: "traffic",     status: "ready",  fileSize: "2.4 MB", pageCount: 28, dateAr: "١٤ أبريل ٢٠٣٥" },
          { titleAr: "التقرير البيئي الربع الأول",    type: "environment", status: "ready",  fileSize: "1.8 MB", pageCount: 22, dateAr: "١ أبريل ٢٠٣٥" },
          { titleAr: "تقرير أجهزة IoT — مارس ٢٠٣٥", type: "iot",         status: "ready",  fileSize: "3.1 MB", pageCount: 35, dateAr: "١ مارس ٢٠٣٥" },
          { titleAr: "تقرير المحاكاة الأسبوعي",      type: "simulation",  status: "generating", fileSize: null, pageCount: null, dateAr: "اليوم" },
          { titleAr: "مؤشرات الأداء — مارس ٢٠٣٥",   type: "kpi",         status: "ready",  fileSize: "1.2 MB", pageCount: 18, dateAr: "١ مارس ٢٠٣٥" },
        ];
        for (const s of seeds) {
          await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...s, userId: "seed" }),
          });
        }
        const res2 = await fetch("/api/reports");
        const data2 = await res2.json();
        setReports(data2);
        if (data2.length > 0) setActiveId(data2[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => { fetchReports(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reports/${id}`, { method: "DELETE" });
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (activeId === id) setActiveId(reports.find((r) => r.id !== id)?.id ?? null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (data: Partial<Report>) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: "user_default" }),
      });
      const newReport = await res.json();
      setReports((prev) => [newReport, ...prev]);
      setActiveId(newReport.id);
      setShowAddModal(false);

      // Simulate generation completing
      setTimeout(async () => {
        await fetch(`/api/reports/${newReport.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ready", fileSize: "1.5 MB", pageCount: 20, completedAt: new Date().toISOString() }),
        });
        setReports((prev) => prev.map((r) => r.id === newReport.id ? { ...r, status: "ready", fileSize: "1.5 MB", pageCount: 20 } : r));
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = reports.filter((r) => filter === "all" || r.type === filter);
  const activeReport = reports.find((r) => r.id === activeId);

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">
      {/* ── Left Panel ── */}
      <div className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#10B981]" />
            <h1 className="text-sm font-bold text-slate-900">التقارير</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-[10px] font-semibold hover:bg-[#10B981]/30 transition-all"
          >
            <Plus className="w-3 h-3" />
            جديد
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-0 border-b border-slate-200">
          {[
            { label: "جاهز",     value: reports.filter((r) => r.status === "ready").length,      color: "#22C55E" },
            { label: "إنشاء",    value: reports.filter((r) => r.status === "generating").length,  color: "#00AEEF" },
            { label: "الإجمالي", value: reports.length,                                           color: "#94a3b8" },
          ].map((stat, i) => (
            <div key={i} className="text-center py-3 border-l last:border-l-0 border-slate-200">
              <div className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] text-slate-600 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="px-3 py-2 border-b border-slate-200">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-100 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-slate-900 focus:outline-none"
          >
            <option value="all">كل التقارير</option>
            {Object.entries(REPORT_TYPES).map(([key, info]) => (
              <option key={key} value={key}>{info.labelAr}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100/50 rounded-xl animate-pulse" />
            ))
          ) : (
            <AnimatePresence>
              {filteredReports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  active={activeId === r.id}
                  onClick={() => setActiveId(r.id)}
                  onDelete={() => handleDelete(r.id)}
                  onDownload={() => alert(`تحميل: ${r.titleAr}`)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Preview Panel ── */}
      <div className="flex-1 overflow-y-auto p-5">
        {!activeReport ? (
          <div className="h-full flex items-center justify-center text-slate-700">
            <div className="text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <div className="text-sm">اختر تقريراً لعرض المحتوى</div>
            </div>
          </div>
        ) : activeReport.status === "generating" ? (
          <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#10B981]/20 rounded-full" />
              <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin absolute inset-0" />
              <FileText className="w-6 h-6 text-[#10B981] absolute inset-0 m-auto" />
            </div>
            <div className="text-sm font-semibold text-slate-900">جارٍ إنشاء التقرير...</div>
            <div className="text-xs text-slate-600">{activeReport.titleAr}</div>
          </div>
        ) : (
          <ReportPreview report={activeReport} />
        )}
      </div>

      <AnimatePresence>
        {showAddModal && <NewReportModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
