"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Car,
  Wind,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";

const CityMap3D = dynamic(() => import("@/components/map/CityMap3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-xl">
      <div className="text-center" dir="rtl">
        <div className="w-8 h-8 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-slate-600 text-sm">جارٍ تحميل الخريطة الثلاثية الأبعاد...</div>
      </div>
    </div>
  ),
});

// ── Mock real-time data generators ──
const generateTrafficData = () =>
  Array.from({ length: 12 }, (_, i) => ({
    time: `${(8 + i).toString().padStart(2, "0")}:00`,
    ازدحام: Math.round(30 + Math.random() * 50),
    سرعة: Math.round(15 + Math.random() * 30),
  }));

const generateCO2Data = () => [
  { name: "الاثنين",   قبل: 85, بعد: 61 },
  { name: "الثلاثاء",  قبل: 78, بعد: 55 },
  { name: "الأربعاء",  قبل: 92, بعد: 68 },
  { name: "الخميس",   قبل: 88, بعد: 62 },
  { name: "الجمعة",   قبل: 65, بعد: 44 },
  { name: "السبت",    قبل: 70, بعد: 50 },
  { name: "الأحد",    قبل: 60, بعد: 42 },
];

const CONGESTION_DIST = [
  { name: "منخفض",   value: 35, color: "#22C55E" },
  { name: "متوسط",   value: 40, color: "#F59E0B" },
  { name: "مرتفع",   value: 25, color: "#EF4444" },
];

const ALERTS_DATA = [
  { id: 1, titleAr: "ازدحام شديد في شارع السلام",      severity: "critical", time: "منذ 5 دقائق",  type: "traffic" },
  { id: 2, titleAr: "صيانة مطلوبة — مستشعر الهواء ٤",  severity: "warning",  time: "منذ 23 دقيقة", type: "maintenance" },
  { id: 3, titleAr: "انقطاع إشارة ضوئية — مفرق المدارس", severity: "critical", time: "منذ 1 ساعة",  type: "infrastructure" },
  { id: 4, titleAr: "مستوى CO₂ مرتفع — منطقة الحرس",    severity: "warning",  time: "منذ 2 ساعة",  type: "environment" },
];

const STREET_STATUS = [
  { nameAr: "شارع السلام",      congestion: 35, speed: 42, status: "good" },
  { nameAr: "شارع عين ساره",    congestion: 65, speed: 22, status: "warning" },
  { nameAr: "منطقة الحرس",      congestion: 45, speed: 31, status: "fair" },
  { nameAr: "مفرق المدارس",     congestion: 80, speed: 14, status: "critical" },
  { nameAr: "شارع باب الزاوية", congestion: 55, speed: 27, status: "fair" },
];

// ── KPI Card ──
function KpiCard({
  icon: Icon,
  labelAr,
  value,
  unit,
  trend,
  trendValue,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  labelAr: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-all"
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "20", border: `1px solid ${color}30` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend === "down"
                ? "bg-emerald-500/10 text-emerald-400"
                : trend === "up"
                ? "bg-red-500/10 text-red-400"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {trend === "down" ? (
              <TrendingDown className="w-3 h-3" />
            ) : trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : null}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <div className="text-slate-600 text-xs mb-1">{labelAr}</div>
        <div className="text-slate-900 text-2xl font-bold leading-none">
          {value}
          {unit && <span className="text-sm font-normal text-gray-500 mr-1">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ── Alert Badge ──
function AlertBadge({ alert }: { alert: typeof ALERTS_DATA[0] }) {
  const colors = {
    critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
    warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
  };
  const c = colors[alert.severity as keyof typeof colors] ?? colors.warning;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${c.bg} ${c.border} transition-all hover:opacity-80`}
      dir="rtl"
    >
      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold ${c.text} truncate`}>{alert.titleAr}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{alert.time}</div>
      </div>
    </div>
  );
}

// ── Street Status Row ──
function StreetStatusRow({ street }: { street: typeof STREET_STATUS[0] }) {
  const statusColors = {
    good: "#22C55E",
    fair: "#F59E0B",
    warning: "#FB923C",
    critical: "#EF4444",
  };
  const color = statusColors[street.status as keyof typeof statusColors] ?? "#64748b";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-200 last:border-0" dir="rtl">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-900 truncate">{street.nameAr}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-[10px]">
        <span className="text-slate-600">{street.speed} كم/س</span>
        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${street.congestion}%`, backgroundColor: color }}
          />
        </div>
        <span style={{ color }} className="font-bold w-6 text-right">{street.congestion}%</span>
      </div>
    </div>
  );
}

// ── Main Dashboard ──
export default function DashboardPage() {
  const [trafficData, setTrafficData] = useState(generateTrafficData());
  const [kpiData, setKpiData] = useState({
    roadCondition: 78,
    travelTime: 24,
    openAlerts: 4,
    co2Saved: 18.4,
  });

  // Simulate real-time updates
  const refreshData = useCallback(() => {
    setTrafficData(generateTrafficData());
    setKpiData({
      roadCondition: Math.round(70 + Math.random() * 20),
      travelTime: Math.round(18 + Math.random() * 15),
      openAlerts: Math.round(2 + Math.random() * 5),
      co2Saved: parseFloat((15 + Math.random() * 8).toFixed(1)),
    });
  }, []);

  useEffect(() => {
    // Load from API
    fetch("/api/kpi")
      .then((r) => r.json())
      .then((data) => {
        if (data.roadCondition) {
          setKpiData({
            roadCondition: data.roadCondition.percent,
            travelTime: data.travelTime.minutes,
            openAlerts: data.openAlerts.count,
            co2Saved: data.co2Saved.tons,
          });
        }
      })
      .catch(() => {});

    // Live updates every 30 seconds
    const id = setInterval(refreshData, 30000);
    return () => clearInterval(id);
  }, [refreshData]);

  const co2Data = generateCO2Data();

  return (
    <div className="p-5 space-y-5 min-h-full" dir="rtl">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-500 text-xs mt-0.5">نظام إدارة المدينة الذكية — الخليل 2035</p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] text-xs font-medium hover:bg-[#00AEEF]/20 transition-all"
        >
          <Zap className="w-3 h-3" />
          تحديث البيانات
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Car}
          labelAr="حالة الطرق"
          value={kpiData.roadCondition}
          unit="%"
          trend="up"
          trendValue="+5%"
          color="#00AEEF"
          delay={0}
        />
        <KpiCard
          icon={Clock}
          labelAr="متوسط وقت السفر"
          value={kpiData.travelTime}
          unit="دقيقة"
          trend="down"
          trendValue="−8 دق"
          color="#8B5CF6"
          delay={0.05}
        />
        <KpiCard
          icon={AlertTriangle}
          labelAr="تنبيهات مفتوحة"
          value={kpiData.openAlerts}
          trend="down"
          trendValue="−2"
          color="#F59E0B"
          delay={0.1}
        />
        <KpiCard
          icon={Wind}
          labelAr="CO₂ موفَّر اليوم"
          value={kpiData.co2Saved}
          unit="طن"
          trend="down"
          trendValue="−12%"
          color="#10B981"
          delay={0.15}
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── 3D Map (takes 2 cols) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden"
          style={{ height: 420 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">الخريطة الثلاثية الأبعاد — الخليل</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400">مباشر</span>
            </div>
          </div>
          <div className="relative" style={{ height: "calc(100% - 45px)" }}>
            <CityMap3D height="100%" />
          </div>
        </motion.div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">التنبيهات النشطة</h2>
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 font-bold">
                {ALERTS_DATA.length} جديد
              </span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {ALERTS_DATA.map((alert) => (
                <AlertBadge key={alert.id} alert={alert} />
              ))}
            </div>
          </motion.div>

          {/* Congestion distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            <h2 className="text-sm font-semibold text-slate-900 mb-3">توزيع الازدحام</h2>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie
                    data={CONGESTION_DIST}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={46}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CONGESTION_DIST.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {CONGESTION_DIST.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Traffic chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-xl p-4"
        >
          <h2 className="text-sm font-semibold text-slate-900 mb-4">حركة المرور — اليوم</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="ازدحام" stroke="#EF4444" fill="url(#congGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="سرعة"   stroke="#00AEEF" fill="url(#speedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* CO2 chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-white border border-slate-200 rounded-xl p-4"
        >
          <h2 className="text-sm font-semibold text-slate-900 mb-4">انبعاثات CO₂ — قبل وبعد التحسين</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={co2Data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="قبل" fill="#EF4444" radius={[3, 3, 0, 0]} opacity={0.7} />
              <Bar dataKey="بعد"  fill="#22C55E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Street Status Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="bg-white border border-slate-200 rounded-xl p-4"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">حالة الشوارع الرئيسية</h2>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />جيد</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />متوسط</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />حرج</div>
          </div>
        </div>
        <div>
          {STREET_STATUS.map((street) => (
            <StreetStatusRow key={street.nameAr} street={street} />
          ))}
        </div>
      </motion.div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { labelAr: "مركبات اليوم",       value: "28,450",  icon: "🚗", color: "#00AEEF" },
          { labelAr: "مستشعرات نشطة",      value: "247",     icon: "📡", color: "#8B5CF6" },
          { labelAr: "كاميرات عاملة",       value: "89 / 94", icon: "📷", color: "#F59E0B" },
          { labelAr: "وقت الاستجابة",       value: "4.2 دق",  icon: "⚡", color: "#10B981" },
        ].map((stat, i) => (
          <motion.div
            key={stat.labelAr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.05 }}
            className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3"
            dir="rtl"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: stat.color + "15" }}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-slate-900 font-bold text-sm">{stat.value}</div>
              <div className="text-gray-500 text-[10px]">{stat.labelAr}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Recent Simulations ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="bg-white border border-slate-200 rounded-xl p-4"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">آخر المحاكاة</h2>
          <a href="/simulations" className="text-[#00AEEF] text-xs hover:underline">
            عرض الكل
          </a>
        </div>
        <div className="space-y-2">
          {[
            { name: "توسعة شارع السلام",        status: "completed", impact: "−28% ازدحام", date: "اليوم، ٩:٣٠ ص"   },
            { name: "إضافة دوار مفرق المدارس",  status: "completed", impact: "−35% حوادث", date: "أمس، ٢:١٥ م"    },
            { name: "شارع جديد — عين ساره",     status: "running",   impact: "جارٍ...",      date: "الآن"              },
            { name: "إزالة إشارات منطقة الحرس", status: "pending",   impact: "في الانتظار",  date: "اليوم، ١١:٠٠ ص" },
          ].map((sim, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-200 last:border-0">
              <div className="shrink-0">
                {sim.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : sim.status === "running" ? (
                  <div className="w-4 h-4 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-900 truncate">{sim.name}</div>
                <div className="text-[10px] text-gray-500">{sim.date}</div>
              </div>
              <div
                className={`text-xs font-semibold shrink-0 ${
                  sim.status === "completed" ? "text-emerald-400" :
                  sim.status === "running"   ? "text-[#00AEEF]"   :
                  "text-gray-500"
                }`}
              >
                {sim.impact}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
