import { describe, expect, it } from "vitest";
import { getDayInfo } from "./lunar";

describe("getDayInfo", () => {
  it("computes an ordinary lunar date", () => {
    const info = getDayInfo("2026-11-11");

    expect(info.lunarMonthLabel).toBe("十");
    expect(info.lunarDayLabel).toBe("初三");
    expect(info.lunarDayText).toBe("初三");
    expect(info.ganzhiYear).toBe("丙午");
    expect(info.zodiac).toBe("马");
    expect(info.solarTerm).toBe("");
    expect(info.secondaryLabel).toBe("");
  });

  it("handles leap months", () => {
    const info = getDayInfo("2025-07-25");

    expect(info.isLeapMonth).toBe(true);
    expect(info.lunarMonth).toBe(-6);
    expect(info.lunarMonthLabel).toBe("闰六");
    expect(info.lunarDay).toBe(1);
    expect(info.lunarDayText).toBe("闰六月");
  });

  it("marks 除夕 before the lunar new year starts", () => {
    const info = getDayInfo("2026-02-16");

    expect(info.lunarFestival).toBe("除夕");
    expect(info.secondaryLabel).toBe("除夕");
    expect(info.ganzhiYear).toBe("乙巳");
    expect(info.zodiac).toBe("蛇");
    expect(info.holiday?.isStatutory).toBe(true);
  });

  it("marks Spring Festival and the year of the horse", () => {
    const info = getDayInfo("2026-02-17");

    expect(info.lunarFestival).toBe("春节");
    expect(info.secondaryLabel).toBe("春节");
    expect(info.ganzhiYear).toBe("丙午");
    expect(info.zodiac).toBe("马");
    expect(info.lunarDayText).toBe("正月");
  });

  it("marks the major traditional festivals in 2026", () => {
    expect(getDayInfo("2026-03-03").lunarFestival).toBe("元宵节");
    expect(getDayInfo("2026-06-19").lunarFestival).toBe("端午节");
    expect(getDayInfo("2026-09-25").lunarFestival).toBe("中秋节");
    expect(getDayInfo("2026-10-18").lunarFestival).toBe("重阳节");
  });

  it("handles the end of the 2025 leap sixth month", () => {
    expect(getDayInfo("2025-08-22")).toMatchObject({
      isLeapMonth: true,
      lunarDay: 29,
    });
    expect(getDayInfo("2025-08-23")).toMatchObject({
      isLeapMonth: false,
      lunarMonth: 7,
      lunarDay: 1,
    });
  });

  it("marks 2025 and 2027 Spring Festival dates", () => {
    expect(getDayInfo("2025-01-28").lunarFestival).toBe("除夕");
    expect(getDayInfo("2025-01-29").lunarFestival).toBe("春节");
    expect(getDayInfo("2027-02-05").lunarFestival).toBe("除夕");
    expect(getDayInfo("2027-02-06").lunarFestival).toBe("春节");
  });

  it("calculates solar terms independently of holiday data", () => {
    expect(getDayInfo("2026-02-04").solarTerm).toBe("立春");
  });

  it("uses solar terms and major solar festivals", () => {
    expect(getDayInfo("2026-04-05")).toMatchObject({
      solarTerm: "清明",
      secondaryLabel: "清明",
      secondaryKind: "term",
    });
    expect(getDayInfo("2026-12-22").solarTerm).toBe("冬至");
    expect(getDayInfo("2026-01-01")).toMatchObject({
      solarFestival: "元旦",
      secondaryLabel: "元旦",
    });
    expect(getDayInfo("2026-10-01").solarFestival).toBe("国庆节");
  });

  it("attaches the independent statutory holiday data", () => {
    expect(getDayInfo("2026-02-17").holiday?.isStatutory).toBe(true);
    expect(getDayInfo("2027-02-05").holiday?.name).toBe("春节");
    expect(getDayInfo("2028-01-01").holiday).toBeNull();
  });
});
