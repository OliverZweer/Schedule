import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendarEvent, CategoryId, EventInput } from "./types";

export interface EventRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  category: CategoryId;
  color: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

function timeOrUndefined(value: string | null): string | undefined {
  return value ? value.slice(0, 5) : undefined;
}

export function rowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: timeOrUndefined(row.start_time),
    endTime: timeOrUndefined(row.end_time),
    allDay: row.all_day,
    category: row.category,
    color: row.color ?? undefined,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function eventToInsert(input: EventInput, userId: string) {
  return {
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    start_date: input.startDate,
    end_date: input.endDate,
    start_time: input.allDay ? null : (input.startTime ?? null),
    end_time: input.allDay ? null : (input.endTime ?? null),
    all_day: input.allDay,
    category: input.category,
    color: input.color || null,
  };
}

export function eventToUpdate(input: EventInput) {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    start_date: input.startDate,
    end_date: input.endDate,
    start_time: input.allDay ? null : (input.startTime ?? null),
    end_time: input.allDay ? null : (input.endTime ?? null),
    all_day: input.allDay,
    category: input.category,
    color: input.color || null,
  };
}

export async function fetchEvents(
  supabase: SupabaseClient,
  userId: string,
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (error) {
    throw new Error(`加载日程失败：${error.message}`);
  }

  return (data as EventRow[]).map(rowToEvent);
}

export async function insertEvent(
  supabase: SupabaseClient,
  userId: string,
  input: EventInput,
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("events")
    .insert(eventToInsert(input, userId))
    .select("*")
    .single();

  if (error) {
    throw new Error(`创建日程失败：${error.message}`);
  }

  return rowToEvent(data as EventRow);
}

export async function patchEvent(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: EventInput,
  expectedVersion: number,
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("events")
    .update(eventToUpdate(input))
    .eq("id", id)
    .eq("user_id", userId)
    .eq("version", expectedVersion)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`保存日程失败：${error.message}`);
  }

  if (!data) {
    throw new Error(
      "这条日程已在其他设备被修改或删除，请刷新后重试，避免覆盖最新内容。",
    );
  }

  return rowToEvent(data as EventRow);
}

export async function removeEvent(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error, count } = await supabase
    .from("events")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`删除日程失败：${error.message}`);
  }

  if (!count) {
    throw new Error("这条日程不存在或已被删除。");
  }
}
