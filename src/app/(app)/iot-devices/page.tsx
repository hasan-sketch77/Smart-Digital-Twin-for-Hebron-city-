"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Plus,
  Trash2,
  RefreshCw,
  Camera,
  Wind,
  CloudRain,
  Radio,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Battery,
  MapPin,
  Calendar,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface IoTDevice {
  id: string;
  nameAr: string;
  type: string;
  status: string;
  coordinates: string;
  dataType: string;
  batteryLevel: number | null;
  lastReading: string | null;
  lastReadingAt: string | null;
  installDate: string;
  maintenanceDue: string | null;
  firmwareVersion: string | null;
}

const DEVICE_TYPES: Record<string, { labelAr: string; icon: React.ComponentType<any>; color: string; unit: string }> = {
  camera:    { labelAr: "كاميرا مراقبة",    icon: Camera,    color: "#00AEEF", unit: "FPS" },
  traffic:   { labelAr: "مستشعر مرور",      icon: Radio,     color: "#F59E0B", unit: "مركبة/ساعة" },
  weather:   { labelAr: "محطة طقس",          icon: CloudRain, color: "#10B981", unit: "°م" },
  air:       { labelAr: "مستشعر جودة الهواء", icon: Wind,     color: "#8B5CF6", unit: "AQI" },
  parking:   { labelAr: "مستشعر مواقف",     icon: MapPin,    color: "#EC4899", unit: "مكان" },
  noise:     { labelAr: "مستشعر الضوضاء",   icon: Radio,     color: "#EF4444", unit: "dB" },
};

const STATUS_CONFIG: Record<string, { labelAr: string; color: string; icon: React.ComponentType<any> }> = {
  active:  { labelAr: "نشط",    color: "#22C55E", icon: CheckCircle },
  warning: { labelAr: "تحذير",  color: "#F59E0B", icon: AlertTriangle },
  error:   { labelAr: "خطأ",    color: "#EF4444", icon: XCircle     },
  offline: { labelAr: "غير متصل", color: "#475569", icon: WifiOff   },
};

// ── Generate fake sensor readings ──
function generateReadings(type: string) {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  return hours.map((hour) => ({
    time: hour,
    قيمة: type === "traffic"
      ? Math.round(200 + Math.random() * 600)
      : type === "weather"
      ? parseFloat((15 + Math.random() * 18).toFixed(1))
      : type === "air"
      ? Math.round(30 + Math.random() * 80)
      : type === "camera"
      ? 30
      : type === "noise"
      ? Math.round(45 + Math.random() * 35)
      : Math.round(5 + Math.random() * 20),
  }));
}

// ── Battery indicator ──
function BatteryBar({ level }: { level: number }) {
  const color = level > 60 ? "#22C55E" : level > 30 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-1.5">
      <Battery className="w-3 h-3" style={{ color }} />
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-12">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{level}%</span>
    </div>
  );
}

// ── Device card ──
function DeviceCard({
  device,
  active,
  onClick,
  onDelete,
}: {
  device: IoTDevice;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const typeInfo = DEVICE_TYPES[device.type] ?? DEVICE_TYPES.traffic;
  const statusInfo = STATUS_CONFIG[device.status] ?? STATUS_CONFIG.offline;
  const Icon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
        active
          ? "border-opacity-60 shadow-lg"
          : "border-slate-200 bg-white hover:border-slate-700"
      }`}
      style={active ? { borderColor: typeInfo.color + "50", backgroundColor: typeInfo.color + "08" } : {}}
      onClick={onClick}
      dir="rtl"
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: typeInfo.color + "20", border: `1px solid ${typeInfo.color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color: typeInfo.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-900 truncate">{device.nameAr}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{typeInfo.labelAr}</div>

          {device.lastReading && (
            <div className="text-[10px] text-gray-400 mt-1">
              آخر قراءة: <span className="text-slate-900 font-semibold">{typeof device.lastReading === "object" ? (device.lastReading as any).value : device.lastReading} {typeInfo.unit}</span>
            </div>
          )}

          {device.batteryLevel != null && (
            <div className="mt-1.5">
              <BatteryBar level={device.batteryLevel} />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div
            className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border"
            style={{ color: statusInfo.color, borderColor: statusInfo.color + "40", backgroundColor: statusInfo.color + "15" }}
          >
            <StatusIcon className="w-2 h-2" />
            {statusInfo.labelAr}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-900/30 transition-all"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Device Detail Panel ──
function DeviceDetail({ device }: { device: IoTDevice }) {
  const typeInfo = DEVICE_TYPES[device.type] ?? DEVICE_TYPES.traffic;
  const statusInfo = STATUS_CONFIG[device.status] ?? STATUS_CONFIG.offline;
  const Icon = typeInfo.icon;
  const readings = generateReadings(device.type);

  let coords = { lat: "31.5326", lng: "35.0998" };
  try { coords = JSON.parse(device.coordinates); } catch { }

  return (
    <motion.div
      key={device.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      dir="rtl"
    >
      {/* Header card */}
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: typeInfo.color + "40", background: `linear-gradient(135deg, ${typeInfo.color}08 0%, transparent 100%)` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: typeInfo.color + "20", border: `2px solid ${typeInfo.color}40` }}
          >
            <Icon className="w-7 h-7" style={{ color: typeInfo.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">{device.nameAr}</h2>
            <div className="text-xs text-gray-400 mt-0.5">{typeInfo.labelAr}</div>
            <div className="flex items-center gap-3 mt-2">
              <div
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border"
                style={{ color: statusInfo.color, borderColor: statusInfo.color + "40", backgroundColor: statusInfo.color + "15" }}
              >
                {device.status === "active" ? (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusInfo.color }} />
                ) : null}
                {statusInfo.labelAr}
              </div>
              {device.firmwareVersion && (
                <span className="text-[10px] text-gray-500">FW: {device.firmwareVersion}</span>
              )}
            </div>
          </div>
          {device.batteryLevel != null && (
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">البطارية</div>
              <BatteryBar level={device.batteryLevel} />
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "آخر قراءة",    value: device.lastReading ? `${typeof device.lastReading === "object" ? (device.lastReading as any).value : device.lastReading} ${typeInfo.unit}` : "—",                       icon: Wifi,    color: typeInfo.color },
          { label: "الموقع",        value: `${coords.lat}، ${coords.lng}`,                                                            icon: MapPin,  color: "#F59E0B"      },
          { label: "تاريخ التركيب", value: new Date(device.installDate).toLocaleDateString("ar-PS"),                                   icon: Calendar, color: "#10B981"     },
          { label: "الصيانة القادمة", value: device.maintenanceDue ? new Date(device.maintenanceDue).toLocaleDateString("ar-PS") : "—", icon: RefreshCw, color: "#8B5CF6"   },
        ].map((item) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-3">
              <ItemIcon className="w-3.5 h-3.5 mb-2" style={{ color: item.color }} />
              <div className="text-[10px] text-gray-500">{item.label}</div>
              <div className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* Reading chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-900 mb-3">
          القراءات خلال 24 ساعة — {typeInfo.unit}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={readings} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sensorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={typeInfo.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={typeInfo.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 9 }} interval={3} />
            <YAxis tick={{ fill: "#64748b", fontSize: 9 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="قيمة"
              stroke={typeInfo.color}
              fill="url(#sensorGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status history */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-900 mb-3">سجل الأحداث</h3>
        <div className="space-y-2">
          {[
            { time: "منذ 5 دقائق",   text: "بيانات مُحدَّثة بنجاح",             icon: "✅" },
            { time: "منذ 1 ساعة",    text: "تم التحقق من الاتصال",               icon: "📡" },
            { time: "منذ 3 ساعات",   text: "تحديث البرنامج الثابت تلقائياً",     icon: "🔄" },
            { time: "منذ 12 ساعة",   text: "تنبيه: انخفاض مستوى البطارية إلى 25%", icon: "⚠️" },
            { time: "منذ 24 ساعة",   text: "إعادة تشغيل تلقائي مجدولة",          icon: "🔃" },
          ].map((event, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-200 last:border-0">
              <span className="text-sm shrink-0">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-300">{event.text}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{event.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Add Device Modal ──
function AddDeviceModal({ onSave, onClose }: { onSave: (data: Partial<IoTDevice>) => void; onClose: () => void }) {
  const [nameAr, setNameAr] = useState("");
  const [type, setType] = useState("traffic");
  const [lat, setLat] = useState("31.5326");
  const [lng, setLng] = useState("35.0998");
  const [battery, setBattery] = useState(100);

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
            <Plus className="w-4 h-4 text-[#EC4899]" />
            <h2 className="text-sm font-bold text-slate-900">إضافة جهاز IoT</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">اسم الجهاز *</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-[#EC4899]/60"
              placeholder="مثال: كاميرا شارع السلام ٣"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">نوع الجهاز</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none"
            >
              {Object.entries(DEVICE_TYPES).map(([key, info]) => (
                <option key={key} value={key}>{info.labelAr}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">خط العرض</label>
              <input value={lat} onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">خط الطول</label>
              <input value={lng} onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">
              البطارية: <span className="text-[#EC4899] font-bold">{battery}%</span>
            </label>
            <input type="range" min={0} max={100} value={battery} onChange={(e) => setBattery(Number(e.target.value))} className="w-full accent-[#EC4899]" />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => {
              if (!nameAr.trim()) return;
              onSave({
                nameAr,
                type,
                status: "active",
                coordinates: JSON.stringify({ lat, lng }),
                dataType: DEVICE_TYPES[type]?.unit ?? "—",
                batteryLevel: battery,
                installDate: new Date().toISOString(),
                firmwareVersion: "v2.4.1",
              });
            }}
            disabled={!nameAr.trim()}
            className="flex-1 py-2 rounded-lg bg-[#EC4899] text-slate-900 text-sm font-semibold hover:bg-[#db2777] transition-all disabled:opacity-50"
          >
            إضافة الجهاز
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 text-gray-400 text-sm hover:border-slate-600 transition-all">
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──
export default function IoTDevicesPage() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setDevices(data);
        if (!activeId) setActiveId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchDevices();
    const id = setInterval(fetchDevices, 15000);
    return () => clearInterval(id);
  }, [fetchDevices]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/devices/${id}`, { method: "DELETE" });
      setDevices((prev) => prev.filter((d) => d.id !== id));
      if (activeId === id) setActiveId(devices.find((d) => d.id !== id)?.id ?? null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (data: Partial<IoTDevice>) => {
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newDevice = await res.json();
      setDevices((prev) => [newDevice, ...prev]);
      setActiveId(newDevice.id);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = devices.filter((d) => {
    const matchType = filterType === "all" || d.type === filterType;
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    const matchSearch = !search || d.nameAr.includes(search);
    return matchType && matchStatus && matchSearch;
  });

  const activeDevice = devices.find((d) => d.id === activeId);

  // Stats
  const stats = {
    total: devices.length,
    active: devices.filter((d) => d.status === "active").length,
    warning: devices.filter((d) => d.status === "warning").length,
    error: devices.filter((d) => d.status === "error").length,
  };

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">
      {/* ── Left Panel ── */}
      <div className="w-80 shrink-0 border-l border-slate-200 bg-slate-950 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#EC4899]" />
            <h1 className="text-sm font-bold text-slate-900">أجهزة IoT</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#EC4899]/20 border border-[#EC4899]/40 text-[#EC4899] text-[10px] font-semibold hover:bg-[#EC4899]/30 transition-all"
          >
            <Plus className="w-3 h-3" />
            جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-0 border-b border-slate-200">
          {[
            { label: "الكل",     value: stats.total,   color: "#94a3b8" },
            { label: "نشط",      value: stats.active,  color: "#22C55E" },
            { label: "تحذير",    value: stats.warning, color: "#F59E0B" },
            { label: "خطأ",      value: stats.error,   color: "#EF4444" },
          ].map((stat, i) => (
            <div key={i} className="text-center py-2.5 border-l last:border-l-0 border-slate-200">
              <div className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="px-3 py-2 space-y-2 border-b border-slate-200">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-gray-600 focus:outline-none focus:border-[#EC4899]/60"
            placeholder="ابحث عن جهاز..."
          />
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-900 focus:outline-none"
            >
              <option value="all">كل الأنواع</option>
              {Object.entries(DEVICE_TYPES).map(([key, info]) => (
                <option key={key} value={key}>{info.labelAr}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-900 focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.labelAr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Device list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100/50 rounded-xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <div className="text-xs">لا توجد أجهزة مطابقة</div>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((d) => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  active={activeId === d.id}
                  onClick={() => setActiveId(d.id)}
                  onDelete={() => handleDelete(d.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      <div className="flex-1 overflow-y-auto p-5">
        {!activeDevice ? (
          <div className="h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <div className="text-sm">اختر جهازاً لعرض التفاصيل</div>
            </div>
          </div>
        ) : (
          <DeviceDetail device={activeDevice} />
        )}
      </div>

      <AnimatePresence>
        {showAddModal && <AddDeviceModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
