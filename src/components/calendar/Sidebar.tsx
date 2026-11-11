"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { Check, ChevronLeft, ChevronRight, Cloud } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORIES } from "@/lib/calendar/categories";
import { getHolidayCoverageLabel } from "@/lib/calendar/holidays";
import type { CalendarEvent, CategoryId } from "@/lib/calendar/types";
import { dateKey, formatMonthTitle, getMonthGrid } from "@/lib/date";

interface MiniMonthProps {
  cursor: Date;
  selected: Date;
  today: Date;
  onSelectDate: (date: Date) => void;
}

function MiniMonth({ cursor, selected, today, onSelectDate }: MiniMonthProps) {
  const [month, setMonth] = useState(() => startOfMonth(cursor));

  const days = useMemo(() => getMonthGrid(month), [month]);
  const selectedKey = dateKey(selected);
  const todayKey = dateKey(today);

  return (
    <div className="px-3 pt-4">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-tight">
          {formatMonthTitle(month)}
        </span>
        <div className="flex">
          <button
            type="button"
            aria-label="上个月"
            onClick={() => setMonth((value) => addMonths(value, -1))}
            className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-surface-muted hover:text-ink"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="下个月"
            onClick={() => setMonth((value) => addMonths(value, 1))}
            className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-surface-muted hover:text-ink"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {["一", "二", "三", "四", "五", "六", "日"].map((label) => (
          <div
            key={label}
            className="grid h-6 place-items-center text-[10px] text-ink-faint"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const key = dateKey(day);
          const inMonth = day.getMonth() === month.getMonth();
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "grid h-7 place-items-center rounded-full text-[11px] tabular-nums transition-colors",
                !inMonth && "text-ink-faint/40",
                inMonth && !isSelected && "text-ink-soft hover:bg-surface-muted",
                isToday &&
                  !isSelected &&
                  "font-semibold text-accent ring-1 ring-accent/35 ring-inset",
                isSelected && "bg-accent font-medium text-white",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SidebarProps {
  today: Date;
  cursor: Date;
  selected: Date;
  events: CalendarEvent[];
  activeCategories: Set<CategoryId>;
  onSelectDate: (date: Date) => void;
  onToggleCategory: (category: CategoryId) => void;
  lastSyncedAt: Date | null;
  syncing: boolean;
  loading: boolean;
  syncError: string | null;
  realtimeConnected: boolean;
}

export function Sidebar({
  today,
  cursor,
  selected,
  events,
  activeCategories,
  onSelectDate,
  onToggleCategory,
  lastSyncedAt,
  syncing,
  loading,
  syncError,
  realtimeConnected,
}: SidebarProps) {
  const lastSyncedLabel = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const counts = useMemo(() => {
    const monthStart = dateKey(startOfMonth(cursor));
    const monthEnd = dateKey(endOfMonth(cursor));
    const map = Object.fromEntries(
      CATEGORIES.map((category) => [category.id, 0]),
    ) as Record<CategoryId, number>;

    for (const event of events) {
      if (event.startDate <= monthEnd && event.endDate >= monthStart) {
        map[event.category] += 1;
      }
    }
    return map;
  }, [cursor, events]);

  return (
    <aside className="hidden w-[236px] shrink-0 flex-col overflow-y-auto border-r border-line bg-surface lg:flex">
      <MiniMonth
        key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
        cursor={cursor}
        selected={selected}
        today={today}
        onSelectDate={onSelectDate}
      />

      <div className="mx-4 mt-4 h-px bg-line" />

      <div className="px-4 pb-2 pt-4">
        <span className="text-[10px] font-medium tracking-[0.12em] text-ink-faint">
          我的分类
        </span>
      </div>

      <div className="space-y-0.5 px-2">
        {CATEGORIES.map((category) => {
          const active = activeCategories.has(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onToggleCategory(category.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-muted"
            >
              <span
                className="grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors"
                style={
                  active
                    ? {
                        backgroundColor: category.color,
                        borderColor: category.color,
                      }
                    : { borderColor: "var(--line-strong)" }
                }
              >
                {active && (
                  <Check size={10} strokeWidth={3.5} className="text-white" />
                )}
              </span>
              <span
                className={cn(
                  "text-[13px]",
                  active ? "text-ink" : "text-ink-faint line-through",
                )}
              >
                {category.label}
              </span>
              <span className="ml-auto text-[10px] tabular-nums text-ink-faint">
                {counts[category.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-xl border border-dashed border-line bg-surface-muted/60 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
            <Cloud
              size={12}
              className={syncError ? "text-accent" : "text-term"}
            />
            {syncError
              ? "同步异常"
              : syncing
                ? "正在同步…"
                : realtimeConnected
                  ? "云端已连接 · 实时"
                  : "云端已连接"}
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-faint">
            {lastSyncedLabel
              ? `最近同步 ${lastSyncedLabel}`
              : loading
                ? "正在加载日程…"
                : "尚未同步"}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-faint">
            法定节假日：{getHolidayCoverageLabel()}，依据国务院办公厅通知。
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[10px] text-ink-faint">
            <span className="rounded-[3px] bg-accent-soft px-1 py-[1px] font-semibold leading-none text-accent">
              休
            </span>
            放假
            <span className="rounded-[3px] bg-surface-muted px-1 py-[1px] font-semibold leading-none text-ink-faint ring-1 ring-line">
              班
            </span>
            调休上班
          </p>
          <Link
            href="/install"
            className="mt-2 inline-block text-[10px] font-medium text-accent hover:underline"
          >
            安装到手机 / 桌面 →
          </Link>
        </div>
      </div>
    </aside>
  );
}
