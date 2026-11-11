"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { eventColor } from "@/lib/calendar/categories";
import { eventsForDay, layoutTimed } from "@/lib/calendar/layout";
import { getDayInfo } from "@/lib/calendar/lunar";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  dateKey,
  formatTimeLabel,
  minutesNowInTimeZone,
  weekdayFull,
} from "@/lib/date";
import { HolidayPill, LunarMeta } from "./DayMeta";

const HOUR_HEIGHT = 52;
const DAY_HEIGHT = 24 * HOUR_HEIGHT;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface DayViewProps {
  date: Date;
  today: Date;
  events: CalendarEvent[];
  onCreate: (date: Date) => void;
  onOpenEvent: (event: CalendarEvent) => void;
}

export function DayView({
  date,
  today,
  events,
  onCreate,
  onOpenEvent,
}: DayViewProps) {
  const key = dateKey(date);
  const isToday = key === dateKey(today);
  const dayInfo = getDayInfo(key);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);

  const dayEvents = useMemo(() => eventsForDay(events, key), [events, key]);
  const allDay = dayEvents.filter(
    (event) => event.allDay || event.startDate !== event.endDate,
  );
  const timed = layoutTimed(dayEvents);

  useEffect(() => {
    const update = () => setNowMinutes(minutesNowInTimeZone());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <div className="shrink-0 border-b border-line px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-[34px] leading-none tracking-tight">
                {date.getDate()}
              </span>
              <span className="text-sm text-ink-soft">
                {date.getMonth() + 1}月 · {weekdayFull(date)}
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-ink-faint">
              {date.getFullYear()}年
            </div>
            <LunarMeta info={dayInfo} className="mt-1" />
            {dayInfo.holiday && (
              <HolidayPill holiday={dayInfo.holiday} className="mt-2" />
            )}
          </div>
          <button
            type="button"
            onClick={() => onCreate(date)}
            className="flex h-8 items-center gap-1 rounded-lg bg-accent px-2.5 text-xs font-medium text-white shadow-sm hover:bg-accent/90"
          >
            <Plus size={13} strokeWidth={2.5} />
            新建
          </button>
        </div>

        {allDay.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {allDay.map((event) => {
              const color = eventColor(event);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onOpenEvent(event)}
                  className="flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{event.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="grid"
          style={{ gridTemplateColumns: "56px minmax(0, 1fr)" }}
        >
          <div aria-hidden="true">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-1.5 right-2 text-[10px] tabular-nums text-ink-faint">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          <div
            onDoubleClick={() => onCreate(date)}
            className={cn(
              "relative border-l border-line",
              isToday && "bg-accent-soft/20",
            )}
            style={{ height: DAY_HEIGHT }}
          >
            <div aria-hidden="true" className="pointer-events-none">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-t border-line/70"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}
            </div>

            {timed.map((item) => {
              const color = eventColor(item.event);
              return (
                <button
                  key={item.event.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenEvent(item.event);
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                  className="absolute z-10 px-[3px] text-left"
                  style={{
                    top: `${item.topPct}%`,
                    height: `${item.heightPct}%`,
                    left: `${item.leftPct}%`,
                    width: `${item.widthPct}%`,
                  }}
                >
                  <div
                    className="h-full overflow-hidden rounded-md border-l-[3px] px-2 py-1"
                    style={{
                      borderColor: color,
                      backgroundColor: `${color}1a`,
                    }}
                  >
                    <div
                      className="truncate text-[11px] font-semibold leading-tight"
                      style={{ color }}
                    >
                      {item.event.title}
                    </div>
                    <div className="truncate text-[10px] leading-tight text-ink-soft">
                      {formatTimeLabel(item.event.startTime)} –{" "}
                      {formatTimeLabel(item.event.endTime)}
                    </div>
                  </div>
                </button>
              );
            })}

            {isToday && nowMinutes !== null && (
              <div
                className="pointer-events-none absolute inset-x-0 z-20"
                style={{ top: `${(nowMinutes / 1440) * 100}%` }}
              >
                <div className="h-px bg-accent" />
                <div className="absolute -left-1 -top-[3px] size-1.5 rounded-full bg-accent" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
