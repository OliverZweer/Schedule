import { addDays, format, startOfMonth, startOfWeek } from "date-fns";

export const APP_TIME_ZONE = "Asia/Shanghai";
export const WEEK_STARTS_ON = 1 as const;

export const WEEKDAY_LABELS = [
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六",
  "周日",
] as const;

const WEEKDAY_FULL = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
] as const;

/**
 * Returns today's calendar date in the target timezone, represented as a
 * local-midnight Date (so date-fns math stays timezone-naive and predictable).
 */
export function todayInTimeZone(
  timeZone = APP_TIME_ZONE,
  now: Date = new Date(),
): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((item) => item.type === type);
    if (!part) throw new Error(`Unable to read ${type} for timezone ${timeZone}`);
    return Number(part.value);
  };

  return new Date(read("year"), read("month") - 1, read("day"));
}

/** Stable, timezone-safe key, e.g. "2026-11-11". */
export function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parses "yyyy-MM-dd" as local midnight (never shifts across timezones). */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Always six weeks, Monday-first, including adjacent-month spillover. */
export function getMonthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON });
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[(date.getDay() + 6) % 7];
}

export function weekdayFull(date: Date): string {
  return WEEKDAY_FULL[date.getDay()];
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatWeekRange(anchor: Date): string {
  const days = getWeekDays(anchor);
  const first = days[0];
  const last = days[6];

  if (first.getFullYear() !== last.getFullYear()) {
    return `${first.getFullYear()}年${first.getMonth() + 1}月${first.getDate()}日 – ${last.getFullYear()}年${last.getMonth() + 1}月${last.getDate()}日`;
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${first.getFullYear()}年${first.getMonth() + 1}月${first.getDate()}日 – ${last.getMonth() + 1}月${last.getDate()}日`;
  }
  return `${first.getFullYear()}年${first.getMonth() + 1}月${first.getDate()}日 – ${last.getDate()}日`;
}

export function formatTimeLabel(time?: string | null): string {
  return time ? time.slice(0, 5) : "";
}

export function minutesFromTime(time?: string | null): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

/** Minutes since midnight for the current moment in the target timezone. */
export function minutesNowInTimeZone(
  timeZone = APP_TIME_ZONE,
  now: Date = new Date(),
): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return (read("hour") % 24) * 60 + read("minute");
}
