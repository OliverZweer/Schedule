"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORIES } from "@/lib/calendar/categories";
import type {
  CalendarEvent,
  EventInput,
} from "@/lib/calendar/types";
import { dateKey } from "@/lib/date";

const COLOR_OPTIONS = [
  "#5b6ee1",
  "#2f8f83",
  "#c28a2e",
  "#c2556b",
  "#7c5cbf",
  "#6b7280",
];

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/10";

interface EventDialogProps {
  initialDate: Date;
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (input: EventInput, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EventDialog({
  initialDate,
  event,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [form, setForm] = useState<EventInput>(() =>
    event
      ? {
          title: event.title,
          description: event.description ?? "",
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime ?? "09:00",
          endTime: event.endTime ?? "10:00",
          allDay: event.allDay,
          category: event.category,
          color: event.color,
        }
      : {
          title: "",
          description: "",
          startDate: dateKey(initialDate),
          endDate: dateKey(initialDate),
          startTime: "09:00",
          endTime: "10:00",
          allDay: true,
          category: "study",
          color: undefined,
        },
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const update = <K extends keyof EventInput>(
    key: K,
    value: EventInput[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));

  const switchAllDay = (allDay: boolean) => {
    setForm((previous) => ({
      ...previous,
      allDay,
      endDate: allDay ? previous.endDate : previous.startDate,
    }));
  };

  const submit = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    const title = form.title.trim();

    if (!title) {
      setError("请填写日程标题");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("请选择开始和结束日期");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("结束日期不能早于开始日期");
      return;
    }
    if (!form.allDay) {
      if (form.startDate !== form.endDate) {
        setError("跨天日程请选择「全天」");
        return;
      }
      if (!form.startTime || !form.endTime) {
        setError("请填写开始和结束时间");
        return;
      }
      if (form.endTime <= form.startTime) {
        setError("结束时间需晚于开始时间");
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          title,
          description: form.description?.trim() || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          startTime: form.allDay ? undefined : form.startTime,
          endTime: form.allDay ? undefined : form.endTime,
          allDay: form.allDay,
          category: form.category,
          color: form.color,
        },
        event?.id,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        className="relative z-10 flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-2xl border border-line bg-surface shadow-2xl sm:max-h-[86dvh] sm:w-[520px] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold">
            {event ? "编辑日程" : "新建日程"}
          </h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label
              htmlFor="event-title"
              className="mb-1 block text-[11px] text-ink-soft"
            >
              标题
            </label>
            <input
              id="event-title"
              autoFocus
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="例如：项目评审"
              className={cn(inputClass, "text-[15px] font-medium")}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-ink-soft">时间类型</span>
            <div className="flex rounded-lg border border-line bg-surface-muted p-0.5">
              <button
                type="button"
                onClick={() => switchAllDay(true)}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-medium transition-colors",
                  form.allDay
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-faint",
                )}
              >
                全天
              </button>
              <button
                type="button"
                onClick={() => switchAllDay(false)}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-medium transition-colors",
                  !form.allDay
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-faint",
                )}
              >
                指定时间
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] text-ink-soft">
                开始日期
              </span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((previous) => ({
                    ...previous,
                    startDate: value,
                    endDate: previous.allDay
                      ? previous.endDate < value
                        ? value
                        : previous.endDate
                      : value,
                  }));
                }}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-ink-soft">
                结束日期
              </span>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(event) => update("endDate", event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          {!form.allDay && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-soft">
                    开始时间
                  </span>
                  <input
                    type="time"
                    value={form.startTime ?? ""}
                    onChange={(event) => update("startTime", event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-soft">
                    结束时间
                  </span>
                  <input
                    type="time"
                    value={form.endTime ?? ""}
                    onChange={(event) => update("endTime", event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
              <p className="text-[10px] leading-relaxed text-ink-faint">
                时间日程仅限当天；跨天安排请使用「全天」。
              </p>
            </>
          )}

          <div>
            <span className="mb-1.5 block text-[11px] text-ink-soft">分类</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((category) => {
                const active = form.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        category: category.id,
                        color: undefined,
                      }))
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      active
                        ? "border-transparent"
                        : "border-line text-ink-soft hover:bg-surface-muted",
                    )}
                    style={
                      active
                        ? {
                            backgroundColor: `${category.color}1a`,
                            color: category.color,
                            borderColor: `${category.color}55`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] text-ink-soft">颜色</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => update("color", undefined)}
                className={cn(
                  "rounded-full border px-2 py-1 text-[10px]",
                  !form.color
                    ? "border-ink/20 bg-surface-muted text-ink"
                    : "border-line text-ink-faint",
                )}
              >
                跟随分类
              </button>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`选择颜色 ${color}`}
                  onClick={() => update("color", color)}
                  className={cn(
                    "size-6 rounded-full border-2 transition-transform",
                    form.color === color
                      ? "scale-110 border-ink/25"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-1 block text-[11px] text-ink-soft"
            >
              备注
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={form.description ?? ""}
              onChange={(event) => update("description", event.target.value)}
              placeholder="补充说明（可选）"
              className={cn(inputClass, "resize-none leading-relaxed")}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-accent-soft px-3 py-2 text-[11px] text-accent">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
          {event && (
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!window.confirm("确定删除这条日程吗？")) return;
                setSaving(true);
                setError(null);
                try {
                  await onDelete(event.id);
                } catch (cause) {
                  setError(
                    cause instanceof Error ? cause.message : "删除失败，请重试",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-ink-faint transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={13} />
              删除
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-soft hover:bg-surface-muted"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
