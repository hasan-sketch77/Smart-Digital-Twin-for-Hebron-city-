"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { labelAr: "لوحة التحكم", href: "/dashboard" },
  { labelAr: "المحاكاة", href: "/simulations" },
  { labelAr: "السيناريوهات", href: "/scenarios" },
  { labelAr: "التقارير", href: "/reports" },
  { labelAr: "أجهزة IoT", href: "/iot-devices" },
  { labelAr: "الإعدادات", href: "/settings" },
];

export default function NavigationTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-gray-100 rounded-lg p-1 flex gap-1"
      dir="rtl"
      aria-label="التنقل الرئيسي"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              isActive
                ? "bg-white text-[#00AEEF] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.labelAr}
          </Link>
        );
      })}
    </nav>
  );
}
