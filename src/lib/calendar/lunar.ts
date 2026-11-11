import { Solar } from "lunar-javascript";
import { dateKey, parseDateKey } from "@/lib/date";
import { getHolidayDay, type HolidayDay } from "./holidays";

export type SecondaryLabelKind = "festival" | "term";

export interface DayInfo {
  key: string;
  /** Negative for a leap month (lunar-javascript convention). */
  lunarMonth: number;
  isLeapMonth: boolean;
  /** "闰六" / "十" */
  lunarMonthLabel: string;
  lunarDay: number;
  /** "初三" / "廿九" */
  lunarDayLabel: string;
  /** First line under the Gregorian day: day name, or month name on day 1. */
  lunarDayText: string;
  lunarFullLabel: string;
  ganzhiYear: string;
  zodiac: string;
  /** 24 solar terms, e.g. "立冬"; empty on ordinary days. */
  solarTerm: string;
  lunarFestival: string;
  solarFestival: string;
  /** Festival > solar term > major solar festival. */
  secondaryLabel: string;
  secondaryKind: SecondaryLabelKind;
  holiday: HolidayDay | null;
}

/**
 * Only the official legal holidays are surfaced from the library's large
 * solar-festival list. Traditional festivals come from the lunar calendar.
 */
const SOLAR_FESTIVALS = new Map<string, string>([
  ["元旦节", "元旦"],
  ["劳动节", "劳动节"],
  ["国庆节", "国庆节"],
]);

const cache = new Map<string, DayInfo>();

function first(items: string[]): string {
  return items.length > 0 ? items[0] : "";
}

export function getDayInfo(date: Date | string): DayInfo {
  const key = typeof date === "string" ? date : dateKey(date);
  const cached = cache.get(key);
  if (cached) return cached;

  const parsed = parseDateKey(key);
  const solar = Solar.fromYmd(
    parsed.getFullYear(),
    parsed.getMonth() + 1,
    parsed.getDate(),
  );
  const lunar = solar.getLunar();

  const lunarMonth = lunar.getMonth();
  const lunarMonthLabel = lunar.getMonthInChinese();
  const lunarDay = lunar.getDay();
  const lunarDayLabel = lunar.getDayInChinese();
  const lunarFestival = first(lunar.getFestivals());
  const solarFestival = SOLAR_FESTIVALS.get(first(solar.getFestivals())) ?? "";
  const solarTerm = lunar.getJieQi();
  const holiday = getHolidayDay(key);

  let secondaryLabel = "";
  let secondaryKind: SecondaryLabelKind = "festival";

  if (lunarFestival) {
    secondaryLabel = lunarFestival;
    secondaryKind = "festival";
  } else if (solarTerm) {
    secondaryLabel = solarTerm;
    secondaryKind = "term";
  } else if (solarFestival) {
    secondaryLabel = solarFestival;
    secondaryKind = "festival";
  }

  const info: DayInfo = {
    key,
    lunarMonth,
    isLeapMonth: lunarMonth < 0,
    lunarMonthLabel,
    lunarDay,
    lunarDayLabel,
    lunarDayText: lunarDay === 1 ? `${lunarMonthLabel}月` : lunarDayLabel,
    lunarFullLabel: `${lunar.getYearInGanZhi()}年 ${lunarMonthLabel}月${lunarDayLabel}`,
    ganzhiYear: lunar.getYearInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
    solarTerm,
    lunarFestival,
    solarFestival,
    secondaryLabel,
    secondaryKind,
    holiday,
  };

  cache.set(key, info);
  return info;
}
