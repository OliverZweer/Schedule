import { describe, expect, it } from "vitest";
import {
  dateKey,
  getMonthGrid,
  getWeekDays,
  parseDateKey,
  todayInTimeZone,
} from "./date";

describe("todayInTimeZone", () => {
  it("uses the Asia/Shanghai calendar day, not the device timezone", () => {
    // 16:30 UTC is already the next day in Shanghai (UTC+8).
    const nextDay = todayInTimeZone(
      "Asia/Shanghai",
      new Date("2026-11-10T16:30:00.000Z"),
    );
    expect(dateKey(nextDay)).toBe("2026-11-11");

    // 15:59 UTC is still the same day in Shanghai.
    const sameDay = todayInTimeZone(
      "Asia/Shanghai",
      new Date("2026-11-10T15:59:00.000Z"),
    );
    expect(dateKey(sameDay)).toBe("2026-11-10");
  });
});

describe("getMonthGrid", () => {
  it("returns six Monday-first weeks covering the whole month", () => {
    const grid = getMonthGrid(new Date(2026, 10, 11));

    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(1); // Monday
    expect(dateKey(grid[0])).toBe("2026-10-26");
    expect(dateKey(grid[41])).toBe("2026-12-06");
  });

  it("keeps a stable six-week grid for months that start on Monday", () => {
    const grid = getMonthGrid(new Date(2027, 1, 1)); // February 2027
    expect(grid).toHaveLength(42);
    expect(dateKey(grid[0])).toBe("2027-02-01");
    expect(dateKey(grid[41])).toBe("2027-03-14");
  });
});

describe("getWeekDays", () => {
  it("returns Monday through Sunday across a year boundary", () => {
    const days = getWeekDays(new Date(2026, 11, 31));
    expect(days.map(dateKey)).toEqual([
      "2026-12-28",
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
    ]);
  });
});

describe("parseDateKey", () => {
  it("round-trips without timezone drift", () => {
    expect(dateKey(parseDateKey("2026-03-01"))).toBe("2026-03-01");
    expect(dateKey(parseDateKey("2027-01-01"))).toBe("2027-01-01");
  });
});
