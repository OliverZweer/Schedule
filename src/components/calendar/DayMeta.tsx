"use client";

import { cn } from "@/lib/cn";
import type { HolidayDay } from "@/lib/calendar/holidays";
import type { DayInfo } from "@/lib/calendar/lunar";

export function HolidayPill({
  holiday,
  className,
}: {
  holiday: HolidayDay;
  className?: string;
}) {
  const makeup = holiday.isMakeupWorkday;
  const text = makeup
    ? `${holiday.name}调休上班`
    : holiday.isStatutory
      ? `${holiday.name} · 法定节假日`
      : `${holiday.name}假期`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        makeup
          ? "bg-surface-muted text-ink-soft ring-1 ring-line"
          : "bg-accent-soft text-accent",
        className,
      )}
    >
      <span className="font-semibold">{makeup ? "班" : "休"}</span>
      {text}
    </span>
  );
}

export function LunarMeta({
  info,
  className,
}: {
  info: DayInfo;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-ink-faint",
        className,
      )}
    >
      <span>
        农历{info.lunarMonthLabel}月{info.lunarDayLabel}
      </span>
      <span className="text-line-strong">·</span>
      <span>
        {info.ganzhiYear}年 · 属{info.zodiac}
      </span>
      {info.solarTerm && (
        <>
          <span className="text-line-strong">·</span>
          <span className="font-medium text-term">{info.solarTerm}</span>
        </>
      )}
      {info.lunarFestival ? (
        <>
          <span className="text-line-strong">·</span>
          <span className="font-medium text-accent">{info.lunarFestival}</span>
        </>
      ) : info.solarFestival ? (
        <>
          <span className="text-line-strong">·</span>
          <span className="font-medium text-accent">{info.solarFestival}</span>
        </>
      ) : null}
    </div>
  );
}
