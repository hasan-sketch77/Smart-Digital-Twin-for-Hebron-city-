"use client";

import { useState, useEffect } from "react";

const arabicDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

interface ClockData {
  time: string;
  dateAr: string;
}

function formatClock(date: Date): ClockData {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;

  const dayName = arabicDays[date.getDay()];
  const day = date.getDate();
  const month = arabicMonths[date.getMonth()];
  const year = date.getFullYear();
  const dateAr = `${dayName} ${day} ${month} ${year}`;

  return { time, dateAr };
}

export function useClock(): ClockData {
  const [clockData, setClockData] = useState<ClockData>(() =>
    formatClock(new Date())
  );

  useEffect(() => {
    const tick = () => setClockData(formatClock(new Date()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return clockData;
}
