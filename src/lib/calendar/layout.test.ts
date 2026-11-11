import { describe, expect, it } from "vitest";
import { eventsForDay, layoutTimed, layoutWeek } from "./layout";
import type { CalendarEvent } from "./types";

function makeEvent(
  overrides: Partial<CalendarEvent> &
    Pick<CalendarEvent, "id" | "title" | "startDate" | "endDate">,
): CalendarEvent {
  return {
    allDay: true,
    category: "study",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("layoutWeek", () => {
  it("keeps a month-crossing event continuous inside each week", () => {
    const event = makeEvent({
      id: "cross-month",
      title: "跨月",
      startDate: "2026-11-29",
      endDate: "2026-12-02",
    });

    const layout = layoutWeek(new Date(2026, 10, 30), [event]);
    expect(layout.segments).toHaveLength(1);
    expect(layout.segments[0]).toMatchObject({
      startIndex: 0,
      endIndex: 2,
      lane: 0,
      continuesBefore: true,
      continuesAfter: false,
    });
  });

  it("keeps a year-crossing event continuous", () => {
    const event = makeEvent({
      id: "cross-year",
      title: "跨年",
      startDate: "2026-12-30",
      endDate: "2027-01-02",
    });

    const layout = layoutWeek(new Date(2026, 11, 28), [event]);
    expect(layout.segments[0]).toMatchObject({
      startIndex: 2,
      endIndex: 5,
      continuesBefore: false,
      continuesAfter: false,
    });
  });

  it("clamps a long event to the full week", () => {
    const event = makeEvent({
      id: "long",
      title: "整周",
      startDate: "2026-12-01",
      endDate: "2026-12-31",
    });

    const layout = layoutWeek(new Date(2026, 11, 7), [event]);
    expect(layout.segments[0]).toMatchObject({
      startIndex: 0,
      endIndex: 6,
      continuesBefore: true,
      continuesAfter: true,
    });
  });

  it("packs overlapping events into lanes and reports hidden ones", () => {
    const events = [1, 2, 3, 4].map((index) =>
      makeEvent({
        id: `event-${index}`,
        title: `日程 ${index}`,
        startDate: "2026-11-11",
        endDate: "2026-11-11",
      }),
    );

    const layout = layoutWeek(new Date(2026, 10, 9), events, 3);
    expect(layout.segments).toHaveLength(3);
    expect(layout.segments.map((segment) => segment.lane)).toEqual([0, 1, 2]);
    expect(layout.hiddenByDay.get("2026-11-11")).toBe(1);
    expect(layout.laneCount).toBe(3);
  });
});

describe("eventsForDay", () => {
  it("includes both endpoints and puts all-day events first", () => {
    const allDay = makeEvent({
      id: "all-day",
      title: "全天",
      startDate: "2026-11-10",
      endDate: "2026-11-12",
    });
    const timed = makeEvent({
      id: "timed",
      title: "会议",
      startDate: "2026-11-11",
      endDate: "2026-11-11",
      allDay: false,
      startTime: "09:00",
      endTime: "10:00",
      category: "meeting",
    });

    const result = eventsForDay([timed, allDay], "2026-11-11");
    expect(result.map((event) => event.id)).toEqual(["all-day", "timed"]);
  });
});

describe("layoutTimed", () => {
  it("places overlapping timed events side by side", () => {
    const first = makeEvent({
      id: "first",
      title: "A",
      startDate: "2026-11-11",
      endDate: "2026-11-11",
      allDay: false,
      startTime: "09:00",
      endTime: "10:00",
    });
    const second = makeEvent({
      id: "second",
      title: "B",
      startDate: "2026-11-11",
      endDate: "2026-11-11",
      allDay: false,
      startTime: "09:30",
      endTime: "10:30",
    });

    const result = layoutTimed([first, second]);
    expect(result).toHaveLength(2);
    expect(result[0].leftPct).toBe(0);
    expect(result[1].leftPct).toBe(50);
    expect(result[0].widthPct).toBe(50);
    expect(result[1].widthPct).toBe(50);
    expect(result[0].topPct).toBeCloseTo((9 / 24) * 100, 5);
  });
});
