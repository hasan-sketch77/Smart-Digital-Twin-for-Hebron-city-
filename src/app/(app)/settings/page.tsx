"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Bell,
  Map,
  Globe,
  Moon,
  Sun,
  Save,
  RefreshCw,
  User,
  Shield,
  Database,
  Cpu,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  desktopNotifications: boolean;
  autoSave: boolean;
  mapQuality: string;
  language: string;
  region: string;
}

const SECTIONS = [
  { id: "general",      labelAr: "عام",              icon: Settings, color: "#00AEEF" },
  { id: "appearance",   labelAr: "المظهر",           icon: Sun,      color: "#F59E0B" },
  { id: "map",          labelAr: "الخريطة",          icon: Map,      color: "#10B981" },
  { id: "notifications", labelAr: "الإشعارات",      icon: Bell,     color: "#8B5CF6" },
  { id: "system",       labelAr: "النظام",           icon: Cpu,      color: "#EF4444" },
  { id: "account",      labelAr: "الحساب",           icon: User,     color: "#64748b" },
];

function ToggleSwitch({
  checked,
  onChange,
  color = "#00AEEF",
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  color?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5.5 rounded-full transition-all duration-300 shrink-0"
      style={{
        backgroundColor: checked ? color : "#334155",
        padding: "2px",
      }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
    </button>
  );
}

function SettingRow({
  labelAr,
  descriptionAr,
  children,
}: {
  labelAr: string;
  descriptionAr?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-200 last:border-0" dir="rtl">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900">{labelAr}</div>
        {descriptionAr && <div className="text-[10px] text-gray-500 mt-0.5">{descriptionAr}</div>}
      </div>
      <div className="mr-4 shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" dir="rtl">
      <div className="px-4 py-3 border-b border-slate-200 bg-white/50">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    id: "",
    userId: "user_default",
    darkMode: true,
    desktopNotifications: true,
    autoSave: true,
    mapQuality: "high",
    language: "ar",
    region: "ps",
  });
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbStats] = useState({ records: 2847, size: "24.6 MB", uptime: "99.8%" });
  const [simulationCount] = useState(14);
  const [deviceCount] = useState(247);

  useEffect(() => {
    fetch("/api/settings?userId=user_default")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      toast.success("تم حفظ الإعدادات بنجاح", { position: "top-left" });
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof UserSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">
      {/* ── Left Nav ── */}
      <div className="w-56 shrink-0 border-l border-slate-200 bg-slate-950 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#64748b]" />
          <h1 className="text-sm font-bold text-slate-900">الإعدادات</h1>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-right transition-all ${
                  isActive ? "bg-slate-100" : "hover:bg-slate-100/60"
                }`}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? section.color : "#64748b" }}
                />
                <span
                  className={`text-xs font-medium ${isActive ? "text-slate-900" : "text-slate-400"}`}
                >
                  {section.labelAr}
                </span>
                {isActive && (
                  <div
                    className="mr-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Save button */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00AEEF] text-slate-900 text-sm font-semibold hover:bg-[#0099d4] transition-all disabled:opacity-60 shadow-lg shadow-[#00AEEF]/20"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "جارٍ الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-2xl space-y-5"
        >
          {/* ─── General ─── */}
          {activeSection === "general" && (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-0.5" dir="rtl">الإعدادات العامة</h2>
                <p className="text-xs text-gray-500" dir="rtl">إدارة تفضيلات النظام الأساسية</p>
              </div>

              <SectionCard title="التفضيلات">
                <SettingRow
                  labelAr="الحفظ التلقائي"
                  descriptionAr="حفظ التغييرات تلقائياً كل 5 دقائق"
                >
                  <ToggleSwitch
                    checked={settings.autoSave}
                    onChange={(v) => update("autoSave", v)}
                  />
                </SettingRow>

                <SettingRow labelAr="اللغة" descriptionAr="لغة واجهة المستخدم">
                  <select
                    value={settings.language}
                    onChange={(e) => update("language", e.target.value)}
                    className="bg-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="he">עברית</option>
                  </select>
                </SettingRow>

                <SettingRow labelAr="المنطقة الجغرافية" descriptionAr="لتهيئة التقويم والوحدات">
                  <select
                    value={settings.region}
                    onChange={(e) => update("region", e.target.value)}
                    className="bg-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="ps">فلسطين</option>
                    <option value="jo">الأردن</option>
                    <option value="il">إسرائيل</option>
                    <option value="us">الولايات المتحدة</option>
                  </select>
                </SettingRow>
              </SectionCard>

              <SectionCard title="معلومات النظام">
                <SettingRow labelAr="إصدار المنصة">
                  <span className="text-xs text-[#00AEEF] font-mono">v2.4.1</span>
                </SettingRow>
                <SettingRow labelAr="بيئة التشغيل">
                  <span className="text-xs text-emerald-400 font-semibold">إنتاج</span>
                </SettingRow>
                <SettingRow labelAr="آخر تحديث">
                  <span className="text-xs text-gray-400">١٤ أبريل ٢٠٣٥</span>
                </SettingRow>
              </SectionCard>
            </>
          )}

          {/* ─── Appearance ─── */}
          {activeSection === "appearance" && (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-0.5" dir="rtl">المظهر والألوان</h2>
                <p className="text-xs text-gray-500" dir="rtl">تخصيص مظهر الواجهة</p>
              </div>

              <SectionCard title="وضع العرض">
                <SettingRow labelAr="الوضع الليلي" descriptionAr="واجهة داكنة مريحة للعينين">
                  <ToggleSwitch
                    checked={settings.darkMode}
                    onChange={(v) => update("darkMode", v)}
                    color="#8B5CF6"
                  />
                </SettingRow>
              </SectionCard>

              <SectionCard title="السمة">
                <div className="py-4" dir="rtl">
                  <div className="text-xs text-gray-400 mb-3">لون التمييز الرئيسي</div>
                  <div className="flex gap-2">
                    {["#00AEEF", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor: color === "#00AEEF" ? "#ffffff" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ─── Map ─── */}
          {activeSection === "map" && (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-0.5" dir="rtl">إعدادات الخريطة</h2>
                <p className="text-xs text-gray-500" dir="rtl">تخصيص عرض الخريطة الثلاثية الأبعاد</p>
              </div>

              <SectionCard title="الأداء والجودة">
                <SettingRow labelAr="جودة العرض" descriptionAr="تؤثر على أداء المتصفح">
                  <select
                    value={settings.mapQuality}
                    onChange={(e) => update("mapQuality", e.target.value)}
                    className="bg-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="ultra">ممتازة</option>
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </SettingRow>

                <SettingRow labelAr="الظلال ثلاثية الأبعاد" descriptionAr="تحسين مظهر المباني">
                  <ToggleSwitch checked={true} onChange={() => {}} color="#10B981" />
                </SettingRow>

                <SettingRow labelAr="تأثيرات الضباب" descriptionAr="ضباب بعيد لتحسين الواقعية">
                  <ToggleSwitch checked={false} onChange={() => {}} color="#10B981" />
                </SettingRow>

                <SettingRow labelAr="معدل الإطارات المستهدف">
                  <select
                    className="bg-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                    defaultValue="60"
                  >
                    <option value="30">30 FPS</option>
                    <option value="60">60 FPS</option>
                    <option value="120">120 FPS</option>
                  </select>
                </SettingRow>
              </SectionCard>

              <SectionCard title="طبقات الخريطة الافتراضية">
                {[
                  { label: "طبقة المرور",        desc: "عرض خريطة حرارة الازدحام",        key: "traffic"   },
                  { label: "البنية التحتية",      desc: "عرض الأنابيب والشبكات",           key: "infra"     },
                  { label: "طبقة المشاة",         desc: "مسارات المشاة والدراجات",          key: "pedestrian" },
                ].map((layer) => (
                  <SettingRow key={layer.key} labelAr={layer.label} descriptionAr={layer.desc}>
                    <ToggleSwitch checked={layer.key !== "pedestrian"} onChange={() => {}} color="#10B981" />
                  </SettingRow>
                ))}
              </SectionCard>
            </>
          )}

          {/* ─── Notifications ─── */}
          {activeSection === "notifications" && (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-0.5" dir="rtl">الإشعارات</h2>
                <p className="text-xs text-gray-500" dir="rtl">إدارة تنبيهات النظام</p>
              </div>

              <SectionCard title="قنوات الإشعارات">
                <SettingRow labelAr="إشعارات سطح المكتب" descriptionAr="تنبيهات نافذة المتصفح">
                  <ToggleSwitch
                    checked={settings.desktopNotifications}
                    onChange={(v) => update("desktopNotifications", v)}
                    color="#8B5CF6"
                  />
                </SettingRow>
                <SettingRow labelAr="الأصوات" descriptionAr="صوت عند وصول التنبيهات">
                  <ToggleSwitch checked={false} onChange={() => {}} color="#8B5CF6" />
                </SettingRow>
                <SettingRow labelAr="البريد الإلكتروني" descriptionAr="ملخص يومي بالبريد">
                  <ToggleSwitch checked={true} onChange={() => {}} color="#8B5CF6" />
                </SettingRow>
              </SectionCard>

              <SectionCard title="أنواع التنبيهات">
                {[
                  { label: "ازدحام حرج",          key: "critical_traffic" },
                  { label: "أعطال الأجهزة",        key: "device_failure" },
                  { label: "تقارير المحاكاة",       key: "simulation_done" },
                  { label: "تحديثات النظام",        key: "system_updates" },
                  { label: "إنذارات بيئية",         key: "environmental" },
                ].map((item) => (
                  <SettingRow key={item.key} labelAr={item.label}>
                    <ToggleSwitch checked={item.key !== "system_updates"} onChange={() => {}} color="#8B5CF6" />
                  </SettingRow>
                ))}
              </SectionCard>
            </>
          )}

          {/* ─── System ─── */}
          {activeSection === "system" && (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-0.5" dir="rtl">النظام والبيانات</h2>
                <p className="text-xs text-gray-500" dir="rtl">إدارة قاعدة البيانات ومحرك الذكاء الاصطناعي</p>
              </div>

              <SectionCard title="إحصائيات قاعدة البيانات">
                <SettingRow labelAr="إجمالي السجلات">
                  <span className="text-xs font-mono text-[#00AEEF]">{dbStats.records.toLocaleString("ar-PS")}</span>
                </SettingRow>
                <SettingRow labelAr="حجم قاعدة البيانات">
                  <span className="text-xs font-mono text-[#00AEEF]">{dbStats.size}</span>
                </SettingRow>
                <SettingRow labelAr="وقت التشغيل">
                  <span className="text-xs text-emerald-400 font-bold">{dbStats.uptime}</span>
                </SettingRow>
                <SettingRow labelAr="عدد المحاكاة">
                  <span className="text-xs font-mono text-slate-900">{simulationCount}</span>
                </SettingRow>
                <SettingRow labelAr="أجهزة IoT مُسجَّلة">
                  <span className="text-xs font-mono text-slate-900">{deviceCount}</span>
                </SettingRow>
              </SectionCard>

              <SectionCard title="محرك الذكاء الاصطناعي">
                <SettingRow labelAr="النموذج المستخدم">
                  <span className="text-xs text-[#8B5CF6] font-mono">MLP + Regression v3.1</span>
                </SettingRow>
                <SettingRow labelAr="متوسط دقة النموذج">
                  <span className="text-xs text-emerald-400 font-bold">91.8%</span>
                </SettingRow>
                <SettingRow labelAr="نقاط بيانات التدريب">
                  <span className="text-xs font-mono text-slate-900">1.24M</span>
                </SettingRow>
              </SectionCard>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-700 text-gray-400 text-xs font-medium hover:border-slate-600 hover:text-slate-900 transition-all" dir="rtl">
                  <Database className="w-3.5 h-3.5" />
                  نسخ احتياطي
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-800/50 text-red-400 text-xs font-medium hover:border-red-700 hover:bg-red-900/20 transition-all" dir="rtl">
                  <RefreshCw className="w-3.5 h-3.5" />
                  إعادة تعيين
                </button>
              </div>
            </>
          )}

          {/* ─── Account ─── */}
          {activeSection === "account" && (
            <>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-0.5" dir="rtl">معلومات الحساب</h2>
                <p className="text-xs text-gray-500" dir="rtl">بيانات المستخدم والصلاحيات</p>
              </div>

              {/* Profile card */}
              <div
                className="rounded-2xl border border-[#00AEEF]/30 bg-[#00AEEF]/5 p-5 flex items-center gap-4"
                dir="rtl"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#0077cc] flex items-center justify-center text-slate-900 text-2xl font-bold shrink-0 shadow-lg shadow-[#00AEEF]/20">
                  ح
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">حسن أحمد</div>
                  <div className="text-sm text-gray-400">مخطط بلدي — بلدية الخليل</div>
                  <div className="text-xs text-[#00AEEF] mt-1">hasan.ahmad@hebron-municipality.ps</div>
                </div>
              </div>

              <SectionCard title="الصلاحيات والأمان">
                <SettingRow labelAr="الدور الوظيفي">
                  <span className="text-xs bg-[#00AEEF]/10 text-[#00AEEF] border border-[#00AEEF]/30 rounded-full px-2 py-0.5 font-semibold">
                    مخطط بلدي
                  </span>
                </SettingRow>
                <SettingRow labelAr="المصادقة الثنائية" descriptionAr="حماية إضافية للحساب">
                  <ToggleSwitch checked={true} onChange={() => {}} color="#22C55E" />
                </SettingRow>
                <SettingRow labelAr="مدة الجلسة">
                  <select className="bg-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none" defaultValue="8h">
                    <option value="2h">ساعتان</option>
                    <option value="8h">8 ساعات</option>
                    <option value="24h">يوم كامل</option>
                  </select>
                </SettingRow>
              </SectionCard>

              <SectionCard title="سجل النشاط">
                {[
                  { action: "تسجيل دخول",               time: "اليوم ٩:٣٠ ص",    icon: "🔑" },
                  { action: "إنشاء محاكاة جديدة",        time: "اليوم ٩:٤٥ ص",    icon: "🧪" },
                  { action: "تصدير تقرير المرور",        time: "أمس ٢:١٥ م",       icon: "📄" },
                  { action: "تعديل سيناريو توسعة الحلقة", time: "أمس ١١:٠٠ ص",     icon: "📝" },
                  { action: "إضافة مستشعر جديد",         time: "منذ يومين ٣:٢٠ م", icon: "📡" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-slate-200 last:border-0">
                    <span className="text-sm">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-300">{item.action}</div>
                      <div className="text-[10px] text-gray-600">{item.time}</div>
                    </div>
                  </div>
                ))}
              </SectionCard>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
