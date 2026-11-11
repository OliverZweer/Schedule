import { addDays } from "date-fns";
import { dateKey, minutesFromTime } from "@/lib/date";
import type { CalendarEvent } from "./types";

export const MINUTES_PER_DAY = 24 * 60;

export interface WeekSegment {
  event: CalendarEvent;
  /** 0 = Monday … 6 = Sunday. */
  startIndex: number;
  endIndex: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export interface WeekLayout {
  segments: WeekSegment[];
  /** Number of segments hidden by the lane cap, per "yyyy-MM-dd". */
  hiddenByDay: Map<string, number>;
  laneCount: number;
}

/**
 * Packs events into lanes for a single week row. Multi-day events become one
 * continuous segment clamped to the week, so a range crossing month/year
 * boundaries is automatically split by week without losing continuity.
 */
export function layoutWeek(
  weekStart: Date,
  events: CalendarEvent[],
  maxLanes = 3,
): WeekLayout {
  const dayKeys = Array.from({ length: 7 }, (_, index) =>
    dateKey(addDays(weekStart, index)),
  );
  const firstKey = dayKeys[0];
  const lastKey = dayKeys[6];

  const relevant = events.filter(
    (event) => event.startDate <= lastKey && event.endDate >= firstKey,
  );

  relevant.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;
    if (a.endDate !== b.endDate) return a.endDate > b.endDate ? -1 : 1;
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return a.title.localeCompare(b.title, "zh-CN");
  });

  const laneEnds: number[] = [];
  const segments: WeekSegment[] = [];
  const hiddenByDay = new Map<string, number>();

  for (const event of relevant) {
    const startIndex =
      event.startDate <= firstKey ? 0 : dayKeys.indexOf(event.startDate);
    const endIndex =
      event.endDate >= lastKey ? 6 : dayKeys.indexOf(event.endDate);

    if (startIndex < 0 || endIndex < 0) continue;

    let lane = laneEnds.findIndex((end) => end < startIndex);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(endIndex);
    } else {
      laneEnds[lane] = endIndex;
    }

    if (lane >= maxLanes) {
      for (let index = startIndex; index <= endIndex; index += 1) {
        const key = dayKeys[index];
        hiddenByDay.set(key, (hiddenByDay.get(key) ?? 0) + 1);
      }
      continue;
    }

    segments.push({
      event,
      startIndex,
      endIndex,
      lane,
      continuesBefore: event.startDate < firstKey,
      continuesAfter: event.endDate > lastKey,
    });
  }

  return {
    segments,
    hiddenByDay,
    laneCount: Math.min(laneEnds.length, maxLanes),
  };
}

export function eventsForDay(
  events: CalendarEvent[],
  day: string,
): CalendarEvent[] {
  return events
    .filter((event) => event.startDate <= day && event.endDate >= day)
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      const aTime = a.startTime ?? "99:99";
      const bTime = b.startTime ?? "99:99";
      if (aTime !== bTime) return aTime < bTime ? -1 : 1;
      return a.title.localeCompare(b.title, "zh-CN");
    });
}

export interface TimedLayout {
  event: CalendarEvent;
  topPct: number;
  heightPct: number;
  leftPct: number;
  widthPct: number;
}

/** Side-by-side layout for overlapping timed events inside one day column. */
export function layoutTimed(events: CalendarEvent[]): TimedLayout[] {
  const timed = events
    .filter(
      (event) =>
        !event.allDay &&
        event.startDate === event.endDate &&
        Boolean(event.startTime),
    )
    .map((event) => {
      const start = minutesFromTime(event.startTime);
      const rawEnd = event.endTime
        ? minutesFromTime(event.endTime)
        : start + 60;
      return { event, start, end: Math.max(rawEnd, start + 30) };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const result: TimedLayout[] = [];
  let index = 0;

  while (index < timed.length) {
    const cluster = [timed[index]];
    let clusterEnd = timed[index].end;
    let next = index + 1;

    while (next < timed.length && timed[next].start < clusterEnd) {
      cluster.push(timed[next]);
      clusterEnd = Math.max(clusterEnd, timed[next].end);
      next += 1;
    }

    const columnEnds: number[] = [];
    const placed = cluster.map((item) => {
      let column = columnEnds.findIndex((end) => end <= item.start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(item.end);
      } else {
        columnEnds[column] = item.end;
      }
      return { ...item, column };
    });

    const columns = Math.max(columnEnds.length, 1);
    for (const item of placed) {
      result.push({
        event: item.event,
        topPct: (item.start / MINUTES_PER_DAY) * 100,
        heightPct:
          (Math.max(item.end - item.start, 30) / MINUTES_PER_DAY) * 100,
        leftPct: (item.column / columns) * 100,
        widthPct: 100 / columns,
      });
    }

    index = next;
  }

  return result;
}

export function chunkWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}
