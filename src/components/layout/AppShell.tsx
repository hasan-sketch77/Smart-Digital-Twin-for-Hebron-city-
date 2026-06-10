"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FlaskConical,
  GitBranch,
  FileText,
  Cpu,
  Settings,
  Bell,
  ChevronLeft,
  Activity,
  Wifi,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import BottomComparisonBar from "@/components/layout/BottomComparisonBar";

const NAV_ITEMS = [
  { href: "/dashboard",    labelAr: "لوحة التحكم",    icon: LayoutDashboard, color: "#00AEEF" },
  { href: "/simulations",  labelAr: "المحاكاة",        icon: FlaskConical,    color: "#8B5CF6" },
  { href: "/scenarios",    labelAr: "السيناريوهات",    icon: GitBranch,       color: "#F59E0B" },
  { href: "/reports",      labelAr: "التقارير",        icon: FileText,        color: "#10B981" },
  { href: "/iot-devices",  labelAr: "أجهزة IoT",      icon: Cpu,             color: "#EC4899" },
  { href: "/settings",     labelAr: "الإعدادات",       icon: Settings,        color: "#6B7280" },
];

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ar-PS", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("ar-PS", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right" dir="rtl">
      <div className="text-slate-900 font-mono text-sm font-bold tracking-wider">{time}</div>
      <div className="text-slate-500 text-[10px] mt-0.5">{date}</div>
    </div>
  );
}

function StatusIndicator({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn("w-1.5 h-1.5 rounded-full", ok ? "bg-emerald-400 animate-pulse" : "bg-red-400")}
      />
      <span className="text-[10px] text-slate-600">{label}</span>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alertCount] = useState(3);

  return (
    <div className="flex h-screen bg-white overflow-hidden" dir="rtl">
      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative flex flex-col bg-white border-l border-slate-200 shrink-0 overflow-hidden z-20"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00AEEF] to-[#0077cc] flex items-center justify-center shrink-0 shadow-lg shadow-[#00AEEF]/20">
            <Map className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="text-slate-900 font-bold text-sm leading-tight whitespace-nowrap">
                  الخليل 2035
                </div>
                <div className="text-[#00AEEF] text-[10px] font-medium whitespace-nowrap">
                  التوأم الرقمي
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-slate-100 shadow-inner"
                    : "hover:bg-slate-100/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: item.color + "15", borderLeft: `3px solid ${item.color}` }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                )}
                <Icon
                  className="w-4.5 h-4.5 shrink-0 relative z-10"
                  style={{ color: isActive ? item.color : "#64748b" }}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className={cn(
                        "text-sm font-medium whitespace-nowrap relative z-10",
                        isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-700"
                      )}
                    >
                      {item.labelAr}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-3 border-t border-slate-200 space-y-1.5"
            >
              <StatusIndicator label="قاعدة البيانات" ok={true} />
              <StatusIndicator label="محرك ML" ok={true} />
              <StatusIndicator label="IoT شبكة" ok={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-16 -left-3 w-6 h-6 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center hover:bg-slate-300 transition-all shadow-lg z-30"
        >
          <ChevronLeft
            className={cn("w-3 h-3 text-slate-600 transition-transform", sidebarCollapsed && "rotate-180")}
          />
        </button>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center px-5 gap-4 shrink-0 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 flex-1 min-w-0" dir="rtl">
            <span className="text-[#00AEEF] text-xs font-medium">
              {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.labelAr ?? ""}
            </span>
          </div>

          {/* Live status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-semibold">مباشر</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 rounded-full px-2 py-1">
              <Wifi className="w-3 h-3 text-slate-600" />
              <span className="text-[10px] text-slate-600">IoT: 247</span>
            </div>
          </div>

          {/* Clock */}
          <div className="hidden lg:block shrink-0">
            <LiveClock />
          </div>

          {/* Alerts bell */}
          <button className="relative w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-all shrink-0">
            <Bell className="w-4 h-4 text-slate-600" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                {alertCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00AEEF] to-[#0077cc] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-[#00AEEF]/20">
            ح
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>

        {/* Bottom comparison bar */}
        <BottomComparisonBar />
      </div>
    </div>
  );
}
