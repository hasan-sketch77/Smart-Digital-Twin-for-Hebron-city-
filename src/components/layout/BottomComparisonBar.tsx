"use client";

import { motion } from "motion/react";
import { GitCompare, ArrowLeft } from "lucide-react";
import { useSimulationStore } from "@/stores/simulation-store";
import { cn } from "@/lib/utils";

const DEFAULT_BEFORE = {
  avgTravelTime: 47,
  co2: 85,
  failedIntersections: 60,
};

const DEFAULT_AFTER = {
  avgTravelTime: 19,
  co2: 61,
  failedIntersections: 8,
};

export default function BottomComparisonBar() {
  const comparisonData = useSimulationStore((s) => s.comparisonData);
  const isSimulating = useSimulationStore((s) => s.isSimulating);

  const safeBefore = comparisonData?.before ? {
    avgTravelTime: isNaN(comparisonData.before.avgTravelTime) ? DEFAULT_BEFORE.avgTravelTime : comparisonData.before.avgTravelTime,
    co2: isNaN(comparisonData.before.co2) ? DEFAULT_BEFORE.co2 : comparisonData.before.co2,
    failedIntersections: isNaN(comparisonData.before.failedIntersections) ? DEFAULT_BEFORE.failedIntersections : comparisonData.before.failedIntersections,
  } : DEFAULT_BEFORE;

  const safeAfter = comparisonData?.after ? {
    avgTravelTime: isNaN(comparisonData.after.avgTravelTime) ? DEFAULT_AFTER.avgTravelTime : comparisonData.after.avgTravelTime,
    co2: isNaN(comparisonData.after.co2) ? DEFAULT_AFTER.co2 : comparisonData.after.co2,
    failedIntersections: isNaN(comparisonData.after.failedIntersections) ? DEFAULT_AFTER.failedIntersections : comparisonData.after.failedIntersections,
  } : DEFAULT_AFTER;

  const before = safeBefore;
  const after = safeAfter;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-20 bg-gradient-to-l from-slate-50 via-white to-slate-50 border-t-2 border-slate-200 flex items-center px-6 gap-6 shrink-0"
      dir="rtl"
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-2 text-slate-900 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#00AEEF]/20 border border-[#00AEEF]/40 flex items-center justify-center">
          <GitCompare className="w-4 h-4 text-[#00AEEF]" />
        </div>
        <span className="text-sm font-semibold text-[#00AEEF] whitespace-nowrap">
          مقارنة المحاكاة
        </span>
      </div>

      <div className="w-px h-10 bg-slate-300 shrink-0" />

      {/* Before Section */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
          قبل
        </span>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 leading-none">
              {before.avgTravelTime}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">دقيقة</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 leading-none">
              {before.co2}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">CO₂</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 leading-none">
              {before.failedIntersections}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">فاشل</div>
          </div>
        </div>
      </div>

      {/* Arrow Divider */}
      <div className="flex items-center shrink-0">
        <ArrowLeft className="w-5 h-5 text-[#00AEEF]" />
      </div>

      {/* After Section */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          بعد
        </span>
        <div className="flex items-center gap-3">
          <div className="text-center border border-emerald-500/30 rounded-md px-2 py-0.5 bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-400 leading-none">
              {after.avgTravelTime}
            </div>
            <div className="text-[10px] text-emerald-500/70 mt-0.5">دقيقة</div>
          </div>
          <div className="text-center border border-emerald-500/30 rounded-md px-2 py-0.5 bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-400 leading-none">
              {after.co2}
            </div>
            <div className="text-[10px] text-emerald-500/70 mt-0.5">CO₂</div>
          </div>
          <div className="text-center border border-emerald-500/30 rounded-md px-2 py-0.5 bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-400 leading-none">
              {after.failedIntersections}
            </div>
            <div className="text-[10px] text-emerald-500/70 mt-0.5">فاشل</div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            isSimulating
              ? "bg-emerald-400 animate-pulse"
              : "bg-emerald-400 animate-pulse"
          )}
        />
        <div className="text-right">
          <div className="text-xs font-semibold text-emerald-400 leading-none">
            مباشر
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">محاكاة نشطة</div>
        </div>
      </div>
    </motion.div>
  );
}
