"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { eventColor } from "@/lib/calendar/categories";
import {
  chunkWeeks,
  eventsForDay,
  layoutWeek,
  type WeekSegment,
} from "@/lib/calendar/layout";
import { getDayInfo } from "@/lib/calendar/lunar";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  dateKey,
  formatTimeLabel,
  getMonthGrid,
  WEEKDAY_LABELS,
} from "@/lib/date";

interface MonthViewProps {
  cursor: Date;
  today: Date;
  selected: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onCreate: (date: Date) => void;
  onOpenEvent: (event: CalendarEvent) => void;
}

function segmentLabel(segment: WeekSegment) {
  const event = segment.event;
  if (event.allDay) return event.title;
  return `${formatTimeLabel(event.startTime)} ${event.title}`.trim();
}

interface MonthWeekProps extends Omit<MonthViewProps, "cursor"> {
  week: Date[];
  monthIndex: number;
  isLast: boolean;
}

function MonthWeek({
  week,
  monthIndex,
  today,
  selected,
  events,
  isLast,
  onSelectDate,
  onCreate,
  onOpenEvent,
}: MonthWeekProps) {
  const layout = useMemo(
    () => layoutWeek(week[0], events, 3),
    [week, events],
  );

  const todayKey = dateKey(today);
  const selectedKey = dateKey(selected);

  return (
    <div
      className={cn(
        "relative grid min-h-0 grid-cols-7",
        !isLast && "border-b border-line",
      )}
    >
      {week.map((day) => {
        const key = dateKey(day);
        const inMonth = day.getMonth() === monthIndex;
        const isToday = key === todayKey;
        const isSelected = key === selectedKey;
        const dayEvents = eventsForDay(events, key);
        const dayInfo = getDayInfo(key);

        return (
          <div
            key={key}
            role="button"
            tabIndex={0}
            aria-label={`${day.getFullYear()}年${day.getMonth() + 1}月${day.getDate()}日`}
            onClick={() => onSelectDate(day)}
            onDoubleClick={() => onCreate(day)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectDate(day);
              }
            }}
            className={cn(
              "relative min-h-0 cursor-pointer border-r border-line p-1 transition-colors last:border-r-0",
              !inMonth && "bg-surface-muted/60",
              isSelected ? "bg-accent-soft/45" : "hover:bg-surface-muted/70",
            )}
          >
            <div className="flex items-start justify-between px-0.5">
              <span
                className={cn(
                  "grid size-[26px] place-items-center rounded-full text-[12px] font-medium tabular-nums",
                  isToday
                    ? "bg-accent text-white shadow-sm"
                    : inMonth
                      ? "text-ink"
                      : "text-ink-faint",
                  isSelected && !isToday && "ring-1 ring-accent/45",
                )}
              >
                {day.getDate()}
              </span>

              {dayInfo.holiday && (
                <span
                  className={cn(
                    "mt-0.5 rounded-[3px] px-1 py-[1px] text-[9px] font-semibold leading-none",
                    dayInfo.holiday.isMakeupWorkday
                      ? "bg-surface-muted text-ink-faint ring-1 ring-line"
                      : "bg-accent-soft text-accent",
                  )}
                  aria-label={
                    dayInfo.holiday.isMakeupWorkday ? "调休上班" : "放假"
                  }
                >
                  {dayInfo.holiday.isMakeupWorkday ? "班" : "休"}
                </span>
              )}
            </div>

            <div className="mt-0.5 min-h-[22px] px-1 leading-none">
              <div className="truncate text-[10px] text-ink-faint">
                {dayInfo.lunarDayText}
              </div>
              {dayInfo.secondaryLabel && (
                <div
                  className={cn(
                    "mt-[1px] truncate text-[9px] font-medium",
                    dayInfo.secondaryKind === "term"
                      ? "text-term"
                      : "text-accent",
                  )}
                >
                  {dayInfo.secondaryLabel}
                </div>
              )}
            </div>

            <div className="absolute bottom-1.5 left-2 flex items-center gap-1 sm:hidden">
              {dayEvents.slice(0, 3).map((event) => (
                <span
                  key={event.id}
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: eventColor(event) }}
                />
              ))}
              {dayEvents.length > 3 && (
                <span className="text-[9px] font-medium text-ink-faint">
                  +{dayEvents.length - 3}
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 bottom-1 top-[52px] hidden auto-rows-[17px] grid-cols-7 gap-x-1 gap-y-[2px] px-1 sm:grid">
        {layout.segments.map((segment) => {
          const color = eventColor(segment.event);
          return (
            <button
              key={segment.event.id}
              type="button"
              title={segment.event.title}
              onClick={(event) => {
                event.stopPropagation();
                onOpenEvent(segment.event);
              }}
              className={cn(
                "pointer-events-auto flex h-[17px] items-center overflow-hidden px-1.5 text-left text-[10px] font-medium leading-none transition-opacity hover:opacity-80",
                segment.continuesBefore ? "rounded-l-none" : "rounded-l-[4px]",
                segment.continuesAfter ? "rounded-r-none" : "rounded-r-[4px]",
              )}
              style={{
                gridColumn: `${segment.startIndex + 1} / ${segment.endIndex + 2}`,
                gridRow: segment.lane + 1,
                backgroundColor: `${color}1f`,
                color,
              }}
            >
              <span className="truncate">{segmentLabel(segment)}</span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 hidden grid-cols-7 sm:grid">
        {week.map((day) => {
          const key = dateKey(day);
          const hidden = layout.hiddenByDay.get(key) ?? 0;
          if (!hidden) return <div key={key} />;
          return (
            <div key={key} className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectDate(day);
                }}
                className="pointer-events-auto absolute bottom-0.5 right-1 rounded bg-surface/90 px-1 text-[10px] font-medium text-ink-faint hover:text-ink"
              >
                +{hidden} 更多
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonthView({
  cursor,
  today,
  selected,
  events,
  onSelectDate,
  onCreate,
  onOpenEvent,
}: MonthViewProps) {
  const weeks = useMemo(() => chunkWeeks(getMonthGrid(cursor)), [cursor]);
  const monthIndex = cursor.getMonth();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid shrink-0 grid-cols-7 border-b border-line bg-surface">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={cn(
              "py-2 text-center text-[11px] font-medium tracking-wide",
              index >= 5 ? "text-weekend" : "text-ink-soft",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-6">
        {weeks.map((week, index) => (
          <MonthWeek
            key={dateKey(week[0])}
            week={week}
            monthIndex={monthIndex}
            isLast={index === weeks.length - 1}
            today={today}
            selected={selected}
            events={events}
            onSelectDate={onSelectDate}
            onCreate={onCreate}
            onOpenEvent={onOpenEvent}
          />
        ))}
      </div>
    </div>
  );
}
