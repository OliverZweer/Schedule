"use client";

import { useEffect, useState } from "react";
import { CalendarApp } from "@/components/calendar/CalendarApp";
import { todayInTimeZone } from "@/lib/date";

export default function HomePage() {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    // Compute "today" in the browser so the app can also be deployed as a
    // pure static export (no server-side date rendering required).
    const timer = window.setTimeout(() => setToday(todayInTimeZone()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!today) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
        <div className="grid size-12 place-items-center rounded-xl bg-accent font-serif text-2xl text-white shadow-sm">
          序
        </div>
        <div className="text-xs tracking-wide text-ink-faint">
          正在加载日历…
        </div>
      </div>
    );
  }

  return <CalendarApp initialToday={today} />;
}
