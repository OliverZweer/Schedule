"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { eventColor } from "@/lib/calendar/categories";
import {
  eventsForDay,
  layoutTimed,
  layoutWeek,
  type TimedLayout,
} from "@/lib/calendar/layout";
import { getDayInfo } from "@/lib/calendar/lunar";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  dateKey,
  formatTimeLabel,
  getWeekDays,
  minutesNowInTimeZone,
  weekdayLabel,
} from "@/lib/date";

const HOUR_HEIGHT = 48;
const DAY_HEIGHT = 24 * HOUR_HEIGHT;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const TIME_COLUMN = "52px";

interface WeekViewProps {
  cursor: Date;
  today: Date;
  selected: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onCreate: (date: Date) => void;
  onOpenEvent: (event: CalendarEvent) => void;
}

function TimedEventBlock({
  item,
  onOpenEvent,
}: {
  item: TimedLayout;
  onOpenEvent: (event: CalendarEvent) => void;
}) {
  const color = eventColor(item.event);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpenEvent(item.event);
      }}
      onDoubleClick={(event) => event.stopPropagation()}
      className="absolute z-10 px-[2px] text-left"
      style={{
        top: `${item.topPct}%`,
        height: `${item.heightPct}%`,
        left: `${item.leftPct}%`,
        width: `${item.widthPct}%`,
      }}
    >
      <div
        className="h-full overflow-hidden rounded-[5px] border-l-[2.5px] py-0.5 pl-1.5 pr-1"
        style={{ borderColor: color, backgroundColor: `${color}1a` }}
      >
        <div
          className="truncate text-[10px] font-semibold leading-tight"
          style={{ color }}
        >
          {item.event.title}
        </div>
        <div className="truncate text-[9px] leading-tight text-ink-soft">
          {formatTimeLabel(item.event.startTime)} –{" "}
          {formatTimeLabel(item.event.endTime)}
        </div>
      </div>
    </button>
  );
}

export function WeekView({
  cursor,
  today,
  selected,
  events,
  onSelectDate,
  onCreate,
  onOpenEvent,
}: WeekViewProps) {
  const days = useMemo(() => getWeekDays(cursor), [cursor]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);

  const todayKey = dateKey(today);
  const selectedKey = dateKey(selected);

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

  const allDayEvents = useMemo(
    () =>
      events.filter(
        (event) => event.allDay || event.startDate !== event.endDate,
      ),
    [events],
  );

  const allDayLayout = useMemo(
    () => layoutWeek(days[0], allDayEvents, 3),
    [days, allDayEvents],
  );

  const allDayHeight = Math.max(1, allDayLayout.laneCount) * 22 + 12;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-[760px]">
          <div
            className="sticky top-0 z-20 grid border-b border-line bg-surface"
            style={{
              gridTemplateColumns: `${TIME_COLUMN} repeat(7, minmax(0, 1fr))`,
            }}
          >
            <div />
            {days.map((day) => {
              const key = dateKey(day);
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              const dayInfo = getDayInfo(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDate(day)}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 border-l border-line py-2 transition-colors hover:bg-surface-muted/70",
                    isToday && "bg-accent-soft/25",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px]",
                      isToday ? "font-medium text-accent" : "text-ink-faint",
                    )}
                  >
                    {weekdayLabel(day)}
                  </span>
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-sm font-medium tabular-nums",
                      isToday && "bg-accent text-white shadow-sm",
                      !isToday && isSelected && "ring-1 ring-accent/45",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayInfo.holiday && (
                    <span
                      className={cn(
                        "absolute right-1 top-1 rounded-[3px] px-1 py-[1px] text-[8px] font-semibold leading-none",
                        dayInfo.holiday.isMakeupWorkday
                          ? "bg-surface-muted text-ink-faint ring-1 ring-line"
                          : "bg-accent-soft text-accent",
                      )}
                    >
                      {dayInfo.holiday.isMakeupWorkday ? "班" : "休"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="sticky top-[61px] z-10 border-b border-line bg-surface"
            style={{ minHeight: allDayHeight }}
          >
            <div
              className="grid h-full"
              style={{
                gridTemplateColumns: `${TIME_COLUMN} repeat(7, minmax(0, 1fr))`,
              }}
            >
              <div className="flex items-start justify-end pr-2 pt-1.5 text-[10px] text-ink-faint">
                全天
              </div>
              {days.map((day) => {
                const key = dateKey(day);
                const hidden = allDayLayout.hiddenByDay.get(key) ?? 0;
                return (
                  <div
                    key={key}
                    onClick={() => onSelectDate(day)}
                    className={cn(
                      "relative cursor-pointer border-l border-line",
                      key === todayKey && "bg-accent-soft/20",
                    )}
                  >
                    {hidden > 0 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] text-ink-faint">
                        +{hidden}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="pointer-events-none absolute inset-y-1.5 left-[52px] right-0 grid auto-rows-[20px] grid-cols-7 gap-x-1 gap-y-[2px] px-1"
              style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
            >
              {allDayLayout.segments.map((segment) => {
                const color = eventColor(segment.event);
                return (
                  <button
                    key={segment.event.id}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenEvent(segment.event);
                    }}
                    className={cn(
                      "pointer-events-auto flex h-5 items-center overflow-hidden px-1.5 text-left text-[10px] font-medium leading-none hover:opacity-80",
                      segment.continuesBefore
                        ? "rounded-l-none"
                        : "rounded-l-[4px]",
                      segment.continuesAfter
                        ? "rounded-r-none"
                        : "rounded-r-[4px]",
                    )}
                    style={{
                      gridColumn: `${segment.startIndex + 1} / ${segment.endIndex + 2}`,
                      gridRow: segment.lane + 1,
                      backgroundColor: `${color}1f`,
                      color,
                    }}
                  >
                    <span className="truncate">{segment.event.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: `${TIME_COLUMN} repeat(7, minmax(0, 1fr))`,
            }}
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

            {days.map((day) => {
              const key = dateKey(day);
              const dayEvents = eventsForDay(events, key);
              const timed = layoutTimed(dayEvents);
              const isToday = key === todayKey;

              return (
                <div
                  key={key}
                  onDoubleClick={() => onCreate(day)}
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

                  {timed.map((item) => (
                    <TimedEventBlock
                      key={item.event.id}
                      item={item}
                      onOpenEvent={onOpenEvent}
                    />
                  ))}

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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
