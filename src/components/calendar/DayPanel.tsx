"use client";

import { useEffect } from "react";
import { CalendarPlus, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryOf, eventColor } from "@/lib/calendar/categories";
import { eventsForDay } from "@/lib/calendar/layout";
import { getDayInfo } from "@/lib/calendar/lunar";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  dateKey,
  formatTimeLabel,
  weekdayFull,
} from "@/lib/date";
import { HolidayPill, LunarMeta } from "./DayMeta";

interface DayPanelContentProps {
  date: Date;
  today: Date;
  events: CalendarEvent[];
  onClose?: () => void;
  onAdd: (date: Date) => void;
  onEdit: (event: CalendarEvent) => void;
}

function DayPanelContent({
  date,
  today,
  events,
  onClose,
  onAdd,
  onEdit,
}: DayPanelContentProps) {
  const dayKey = dateKey(date);
  const dayEvents = eventsForDay(events, dayKey);
  const isToday = dayKey === dateKey(today);
  const dayInfo = getDayInfo(dayKey);

  return (
    <>
      <div className="flex items-start justify-between px-5 pb-4 pt-5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[36px] leading-none tracking-tight">
              {date.getDate()}
            </span>
            <span className="text-[13px] text-ink-soft">
              {date.getMonth() + 1}月 · {weekdayFull(date)}
            </span>
            {isToday && (
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
                今天
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-ink-faint">
            {date.getFullYear()}年
          </div>
          <LunarMeta info={dayInfo} className="mt-1" />
          {dayInfo.holiday && (
            <HolidayPill holiday={dayInfo.holiday} className="mt-2" />
          )}
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-ink"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="grid size-12 place-items-center rounded-full border border-dashed border-line-strong text-ink-faint">
              <CalendarPlus size={18} />
            </div>
            <p className="mt-3 text-[13px] text-ink-soft">这一天还没有安排</p>
            <p className="mt-1 text-[11px] text-ink-faint">
              双击日期格，或点击下方按钮添加
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 pb-2">
            {dayEvents.map((event) => {
              const color = eventColor(event);
              const category = categoryOf(event.category);
              const multiDay = event.startDate !== event.endDate;
              const timeLabel = event.allDay
                ? multiDay
                  ? `${event.startDate.slice(5)} – ${event.endDate.slice(5)} · 全天`
                  : "全天"
                : `${formatTimeLabel(event.startTime)} – ${formatTimeLabel(event.endTime)}`;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEdit(event)}
                  className="group flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
                >
                  <span
                    className="mt-0.5 w-[3px] shrink-0 self-stretch rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium leading-snug">
                      {event.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-ink-soft">
                      <span className="tabular-nums">{timeLabel}</span>
                      <span className="text-line-strong">·</span>
                      <span style={{ color }}>{category.label}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={() => onAdd(date)}
          className="flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-line bg-surface text-xs font-medium text-ink-soft transition-colors hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent"
        >
          <Plus size={13} strokeWidth={2.5} />
          新建日程
        </button>
      </div>
    </>
  );
}

interface DayPanelProps extends DayPanelContentProps {
  className?: string;
}

export function DayPanel({
  className,
  ...contentProps
}: DayPanelProps) {
  return (
    <aside
      className={cn(
        "w-[300px] shrink-0 flex-col border-l border-line bg-surface",
        className,
      )}
    >
      <DayPanelContent {...contentProps} />
    </aside>
  );
}

interface DayPanelSheetProps extends DayPanelContentProps {
  open: boolean;
}

export function DayPanelSheet({
  open,
  onClose,
  ...contentProps
}: DayPanelSheetProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 xl:hidden">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/20"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[76dvh] animate-sheet-up flex-col rounded-t-2xl border-t border-line bg-surface shadow-2xl">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" />
        <DayPanelContent {...contentProps} onClose={onClose} />
      </div>
    </div>
  );
}
