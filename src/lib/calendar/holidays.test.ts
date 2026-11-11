import { describe, expect, it } from "vitest";
import data2025 from "@/data/holidays/2025.json";
import data2026 from "@/data/holidays/2026.json";
import data2027 from "@/data/holidays/2027.json";
import {
  AVAILABLE_HOLIDAY_YEARS,
  getHolidayCoverageLabel,
  getHolidayDay,
  getHolidayPeriodForDate,
  getHolidayYear,
  hasHolidayData,
} from "./holidays";

describe("statutory holiday data", () => {
  it("covers 2025 through 2027 only", () => {
    expect(AVAILABLE_HOLIDAY_YEARS).toEqual([2025, 2026, 2027]);
    expect(getHolidayCoverageLabel()).toBe("2025–2027");
    expect(hasHolidayData(2028)).toBe(false);
    expect(getHolidayYear(2028)).toBeNull();
  });

  it("marks 2026 Spring Festival statutory and makeup days", () => {
    expect(getHolidayDay("2026-02-15")).toMatchObject({
      name: "春节",
      isHoliday: true,
      isStatutory: false,
    });
    // 除夕至初三
    for (const date of [
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
    ]) {
      expect(getHolidayDay(date)).toMatchObject({
        isHoliday: true,
        isStatutory: true,
      });
    }
    expect(getHolidayDay("2026-02-23")).toMatchObject({
      isHoliday: true,
      isStatutory: false,
    });
    expect(getHolidayDay("2026-02-14")).toMatchObject({
      isHoliday: false,
      isMakeupWorkday: true,
    });
    expect(getHolidayDay("2026-02-28")).toMatchObject({
      isMakeupWorkday: true,
    });
    expect(getHolidayDay("2026-02-24")).toBeNull();
  });

  it("handles the combined 2025 National Day + Mid-Autumn break", () => {
    expect(getHolidayDay("2025-10-06")).toMatchObject({
      isHoliday: true,
      isStatutory: true,
    });
    expect(getHolidayPeriodForDate("2025-10-06")?.name).toBe(
      "国庆节、中秋节",
    );
    expect(getHolidayDay("2025-09-28")?.isMakeupWorkday).toBe(true);
    expect(getHolidayDay("2025-10-11")?.isMakeupWorkday).toBe(true);
  });

  it("includes the published 2027 schedule", () => {
    expect(getHolidayDay("2027-02-05")).toMatchObject({
      name: "春节",
      isHoliday: true,
      isStatutory: true,
    });
    expect(getHolidayDay("2027-02-14")?.isMakeupWorkday).toBe(true);
    expect(getHolidayDay("2027-06-09")).toMatchObject({
      name: "端午节",
      isHoliday: true,
      isStatutory: true,
    });
    expect(getHolidayDay("2027-09-15")).toMatchObject({
      name: "中秋节",
      isHoliday: true,
    });
    expect(getHolidayDay("2027-10-01")?.isStatutory).toBe(true);
  });

  it("keeps every year internally consistent", () => {
    for (const data of [data2025, data2026, data2027]) {
      const dates = data.days.map((day) => day.date);
      expect(dates).toEqual([...dates].sort());
      expect(new Set(dates).size).toBe(dates.length);

      for (const day of data.days) {
        expect(day.date.startsWith(`${data.year}-`)).toBe(true);
        expect(day.isHoliday).toBe(!day.isMakeupWorkday);
        if (day.isStatutory) expect(day.isHoliday).toBe(true);
      }

      const year = getHolidayYear(data.year);
      expect(year?.source.url).toContain("gov.cn");
      expect(year?.source.documentNumber).toContain("国办发明电");
      expect(year?.periods.length).toBeGreaterThan(0);

      for (const period of year?.periods ?? []) {
        for (const date of period.statutoryDates) {
          expect(getHolidayDay(date)?.isStatutory).toBe(true);
        }
        for (const date of period.makeupDates) {
          expect(getHolidayDay(date)?.isMakeupWorkday).toBe(true);
        }
      }
    }
  });
});
