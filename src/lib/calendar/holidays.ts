import data2025 from "@/data/holidays/2025.json";
import data2026 from "@/data/holidays/2026.json";
import data2027 from "@/data/holidays/2027.json";

export interface HolidaySource {
  title: string;
  documentNumber: string;
  publishedAt: string;
  url: string;
}

export interface HolidayDay {
  date: string;
  name: string;
  isHoliday: boolean;
  isStatutory: boolean;
  isMakeupWorkday: boolean;
  note: string;
}

export interface HolidayPeriod {
  name: string;
  startDate: string;
  endDate: string;
  days: number;
  statutoryDates: string[];
  makeupDates: string[];
  note: string;
}

export interface HolidayYear {
  year: number;
  source: HolidaySource;
  periods: HolidayPeriod[];
  days: HolidayDay[];
}

const YEARS = [data2025, data2026, data2027] as HolidayYear[];

const dayIndex = new Map<string, HolidayDay>();
const yearIndex = new Map<number, HolidayYear>();

for (const year of YEARS) {
  yearIndex.set(year.year, year);
  for (const day of year.days) {
    dayIndex.set(day.date, day);
  }
}

export const AVAILABLE_HOLIDAY_YEARS = YEARS.map((year) => year.year).sort(
  (a, b) => a - b,
);

export function getHolidayDay(date: string): HolidayDay | null {
  return dayIndex.get(date) ?? null;
}

export function getHolidayYear(year: number): HolidayYear | null {
  return yearIndex.get(year) ?? null;
}

export function hasHolidayData(year: number): boolean {
  return yearIndex.has(year);
}

export function getHolidayCoverageLabel(): string {
  if (AVAILABLE_HOLIDAY_YEARS.length === 0) return "暂无";
  const first = AVAILABLE_HOLIDAY_YEARS[0];
  const last = AVAILABLE_HOLIDAY_YEARS[AVAILABLE_HOLIDAY_YEARS.length - 1];
  return first === last ? `${first}` : `${first}–${last}`;
}

export function getHolidayPeriodForDate(date: string): HolidayPeriod | null {
  const year = Number(date.slice(0, 4));
  const data = yearIndex.get(year);
  if (!data) return null;
  return (
    data.periods.find(
      (period) => date >= period.startDate && date <= period.endDate,
    ) ?? null
  );
}
