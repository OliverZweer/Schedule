import { describe, expect, it } from "vitest";
import {
  eventToInsert,
  eventToUpdate,
  rowToEvent,
  type EventRow,
} from "./events-repo";
import type { EventInput } from "./types";

const row: EventRow = {
  id: "0b6f3a2e-1111-4222-8333-444455556666",
  user_id: "user-1",
  title: "项目评审",
  description: "同步进度",
  start_date: "2026-11-11",
  end_date: "2026-11-11",
  start_time: "14:00:00",
  end_time: "15:30:00",
  all_day: false,
  category: "meeting",
  color: "#c2556b",
  version: 3,
  created_at: "2026-11-01T02:00:00.000Z",
  updated_at: "2026-11-02T02:00:00.000Z",
};

const timedInput: EventInput = {
  title: "  项目评审  ",
  description: "  同步进度  ",
  startDate: "2026-11-11",
  endDate: "2026-11-11",
  startTime: "14:00",
  endTime: "15:30",
  allDay: false,
  category: "meeting",
  color: "#c2556b",
};

describe("rowToEvent", () => {
  it("maps database snake_case and HH:mm:ss into the app model", () => {
    expect(rowToEvent(row)).toMatchObject({
      id: row.id,
      title: "项目评审",
      startDate: "2026-11-11",
      endDate: "2026-11-11",
      startTime: "14:00",
      endTime: "15:30",
      allDay: false,
      category: "meeting",
      color: "#c2556b",
      version: 3,
    });
  });

  it("turns null optional fields into undefined", () => {
    const event = rowToEvent({
      ...row,
      description: null,
      start_time: null,
      end_time: null,
      color: null,
      all_day: true,
    });
    expect(event.description).toBeUndefined();
    expect(event.startTime).toBeUndefined();
    expect(event.endTime).toBeUndefined();
    expect(event.color).toBeUndefined();
  });
});

describe("eventToInsert", () => {
  it("trims text, owns the user id and keeps timed fields", () => {
    expect(eventToInsert(timedInput, "user-9")).toMatchObject({
      user_id: "user-9",
      title: "项目评审",
      description: "同步进度",
      start_time: "14:00",
      end_time: "15:30",
      all_day: false,
      category: "meeting",
      color: "#c2556b",
    });
  });

  it("strips times for all-day events", () => {
    const inserted = eventToInsert(
      { ...timedInput, allDay: true },
      "user-9",
    );
    expect(inserted.start_time).toBeNull();
    expect(inserted.end_time).toBeNull();
  });

  it("stores blank descriptions and colors as null", () => {
    const inserted = eventToInsert(
      { ...timedInput, description: "   ", color: undefined },
      "user-9",
    );
    expect(inserted.description).toBeNull();
    expect(inserted.color).toBeNull();
  });
});

describe("eventToUpdate", () => {
  it("never includes user_id, so ownership cannot be reassigned", () => {
    const updated = eventToUpdate(timedInput);
    expect("user_id" in updated).toBe(false);
    expect(updated.title).toBe("项目评审");
  });
});
