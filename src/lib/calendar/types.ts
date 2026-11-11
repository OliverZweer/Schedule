export type CategoryId = "study" | "work" | "life" | "meeting" | "other";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  /** Inclusive "yyyy-MM-dd". */
  startDate: string;
  /** Inclusive "yyyy-MM-dd". */
  endDate: string;
  /** "HH:mm", only for timed events. */
  startTime?: string;
  /** "HH:mm", only for timed events. */
  endTime?: string;
  allDay: boolean;
  category: CategoryId;
  /** Optional per-event override; falls back to the category color. */
  color?: string;
  /** Incremented by the database on every update (optimistic concurrency). */
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  soft: string;
}

export interface EventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  category: CategoryId;
  color?: string;
}
