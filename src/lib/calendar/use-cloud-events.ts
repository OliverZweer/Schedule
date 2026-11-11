"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchEvents,
  insertEvent,
  patchEvent,
  removeEvent,
  rowToEvent,
  type EventRow,
} from "./events-repo";
import type { CalendarEvent, EventInput } from "./types";

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    const aTime = a.startTime ?? "99:99";
    const bTime = b.startTime ?? "99:99";
    if (aTime !== bTime) return aTime < bTime ? -1 : 1;
    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function messageOf(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

function upsertEvent(
  events: CalendarEvent[],
  incoming: CalendarEvent,
): CalendarEvent[] {
  const index = events.findIndex((event) => event.id === incoming.id);
  if (index === -1) return sortEvents([...events, incoming]);
  const next = [...events];
  next[index] = incoming;
  return sortEvents(next);
}

export function useCloudEvents(userId: string | null) {
  const { supabase } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const refresh = useCallback(
    async (showLoading = true) => {
      if (!userId) return;
      if (showLoading) setLoading(true);
      try {
        const rows = await fetchEvents(supabase, userId);
        setEvents(sortEvents(rows));
        setLastSyncedAt(new Date());
        setError(null);
      } catch (cause) {
        setError(messageOf(cause, "加载日程失败"));
      } finally {
        setLoading(false);
      }
    },
    [supabase, userId],
  );

  useEffect(() => {
    if (!userId) return;
    const uid = userId;
    let cancelled = false;

    async function load() {
      try {
        const rows = await fetchEvents(supabase, uid);
        if (cancelled) return;
        setEvents(sortEvents(rows));
        setLastSyncedAt(new Date());
        setError(null);
      } catch (cause) {
        if (!cancelled) setError(messageOf(cause, "加载日程失败"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  // Realtime: another device/tab signed in as the same user should update this
  // calendar without a refresh. RLS still decides which rows are delivered.
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`events:${userId}:${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const incoming = rowToEvent(payload.new as EventRow);
            setEvents((previous) => upsertEvent(previous, incoming));
            setLastSyncedAt(new Date());
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id?: string }).id;
            if (deletedId) {
              setEvents((previous) =>
                previous.filter((event) => event.id !== deletedId),
              );
              setLastSyncedAt(new Date());
            }
          }
        },
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const createEvent = useCallback(
    async (input: EventInput) => {
      if (!userId) throw new Error("请先登录");
      setSyncing(true);
      try {
        const created = await insertEvent(supabase, userId, input);
        setEvents((previous) => sortEvents([...previous, created]));
        setLastSyncedAt(new Date());
        setError(null);
        return created;
      } catch (cause) {
        const message = messageOf(cause, "创建日程失败");
        setError(message);
        throw new Error(message);
      } finally {
        setSyncing(false);
      }
    },
    [supabase, userId],
  );

  const updateEvent = useCallback(
    async (id: string, input: EventInput, expectedVersion: number) => {
      if (!userId) throw new Error("请先登录");
      setSyncing(true);
      try {
        const updated = await patchEvent(
          supabase,
          userId,
          id,
          input,
          expectedVersion,
        );
        setEvents((previous) =>
          sortEvents(
            previous.map((event) => (event.id === id ? updated : event)),
          ),
        );
        setLastSyncedAt(new Date());
        setError(null);
        return updated;
      } catch (cause) {
        const message = messageOf(cause, "保存日程失败");
        setError(message);
        throw new Error(message);
      } finally {
        setSyncing(false);
      }
    },
    [supabase, userId],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("请先登录");
      setSyncing(true);
      try {
        await removeEvent(supabase, userId, id);
        setEvents((previous) =>
          previous.filter((event) => event.id !== id),
        );
        setLastSyncedAt(new Date());
        setError(null);
      } catch (cause) {
        const message = messageOf(cause, "删除日程失败");
        setError(message);
        throw new Error(message);
      } finally {
        setSyncing(false);
      }
    },
    [supabase, userId],
  );

  return {
    events,
    loading,
    syncing,
    error,
    lastSyncedAt,
    realtimeConnected,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
