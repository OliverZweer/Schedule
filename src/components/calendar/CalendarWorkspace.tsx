"use client";

import { useCallback, useMemo, useState } from "react";
import { addDays, addMonths, addWeeks } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CATEGORY_IDS } from "@/lib/calendar/categories";
import { hasHolidayData } from "@/lib/calendar/holidays";
import type {
  CalendarEvent,
  CalendarView,
  CategoryId,
  EventInput,
} from "@/lib/calendar/types";
import { useCloudEvents } from "@/lib/calendar/use-cloud-events";
import {
  formatMonthDay,
  formatMonthTitle,
  formatWeekRange,
  parseDateKey,
  weekdayFull,
} from "@/lib/date";
import { CalendarHeader } from "./CalendarHeader";
import { DayPanel, DayPanelSheet } from "./DayPanel";
import { DayView } from "./DayView";
import { EventDialog } from "./EventDialog";
import { MonthView } from "./MonthView";
import { Sidebar } from "./Sidebar";
import { WeekView } from "./WeekView";

interface CalendarWorkspaceProps {
  initialToday: Date;
}

export function CalendarWorkspace({ initialToday }: CalendarWorkspaceProps) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const {
    events,
    loading,
    syncing,
    error: syncError,
    lastSyncedAt,
    realtimeConnected,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent: deleteCloudEvent,
  } = useCloudEvents(userId);

  const [today] = useState(initialToday);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState<Date>(initialToday);
  const [selected, setSelected] = useState<Date>(initialToday);
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(
    () => new Set(CATEGORY_IDS),
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editorDate, setEditorDate] = useState<Date>(initialToday);

  const filteredEvents = useMemo(
    () => events.filter((event) => activeCategories.has(event.category)),
    [events, activeCategories],
  );

  const title = useMemo(() => {
    if (view === "month") return formatMonthTitle(cursor);
    if (view === "week") return formatWeekRange(cursor);
    return `${cursor.getFullYear()}年${formatMonthDay(cursor)} ${weekdayFull(cursor)}`;
  }, [view, cursor]);

  const goToday = useCallback(() => {
    setCursor(today);
    setSelected(today);
  }, [today]);

  const shift = useCallback(
    (direction: -1 | 1) => {
      if (view === "month") {
        setCursor((value) => addMonths(value, direction));
        setSelected((value) => addMonths(value, direction));
        return;
      }
      if (view === "week") {
        setCursor((value) => addWeeks(value, direction));
        setSelected((value) => addWeeks(value, direction));
        return;
      }
      setCursor((value) => addDays(value, direction));
      setSelected((value) => addDays(value, direction));
    },
    [view],
  );

  const changeView = useCallback(
    (next: CalendarView) => {
      setView(next);
      if (next !== "month") {
        setCursor(selected);
        if (next === "day") setPanelOpen(false);
      }
    },
    [selected],
  );

  const selectDate = useCallback((date: Date) => {
    setSelected(date);
    setPanelOpen(true);
  }, []);

  const openCreate = useCallback((date: Date) => {
    setEditingEvent(null);
    setEditorDate(date);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setEditorDate(parseDateKey(event.startDate));
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingEvent(null);
  }, []);

  const saveEvent = useCallback(
    async (input: EventInput, id?: string) => {
      if (id) {
        const current = events.find((event) => event.id === id);
        if (!current) {
          throw new Error("这条日程已不存在，请刷新后重试。");
        }
        const updated = await updateEvent(id, input, current.version);
        setSelected(parseDateKey(updated.startDate));
      } else {
        const created = await createEvent(input);
        setSelected(parseDateKey(created.startDate));
      }
      setEditorOpen(false);
      setEditingEvent(null);
    },
    [events, updateEvent, createEvent],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      await deleteCloudEvent(id);
      setEditorOpen(false);
      setEditingEvent(null);
    },
    [deleteCloudEvent],
  );

  const toggleCategory = useCallback((category: CategoryId) => {
    setActiveCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const closePanel = useCallback(() => setPanelOpen(false), []);

  const showInitialLoading = loading && events.length === 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <CalendarHeader
        view={view}
        title={title}
        onViewChange={changeView}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        onToday={goToday}
        onAdd={() => openCreate(selected)}
      />

      {!hasHolidayData(cursor.getFullYear()) && (
        <div className="shrink-0 border-b border-line bg-surface-muted/80 px-3 py-1.5 text-center text-[10px] text-ink-faint">
          {cursor.getFullYear()}{" "}
          年法定节假日安排尚未收录，仅显示农历信息，不显示休 / 班标识。
        </div>
      )}

      {syncError && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b border-line bg-accent-soft/60 px-3 py-1.5 text-[11px] text-accent">
          <span className="truncate">{syncError}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="shrink-0 underline underline-offset-2"
          >
            重试
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar
          today={today}
          cursor={cursor}
          selected={selected}
          events={events}
          activeCategories={activeCategories}
          onSelectDate={selectDate}
          onToggleCategory={toggleCategory}
          lastSyncedAt={lastSyncedAt}
          syncing={syncing}
          loading={loading}
          syncError={syncError}
          realtimeConnected={realtimeConnected}
        />

        <main className="flex min-h-0 min-w-0 flex-1">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface">
            {showInitialLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-ink-faint">
                <Loader2 size={20} className="animate-spin" />
                正在加载云端日程…
              </div>
            ) : (
              <>
                {view === "month" && (
                  <MonthView
                    cursor={cursor}
                    today={today}
                    selected={selected}
                    events={filteredEvents}
                    onSelectDate={selectDate}
                    onCreate={openCreate}
                    onOpenEvent={openEdit}
                  />
                )}

                {view === "week" && (
                  <WeekView
                    cursor={cursor}
                    today={today}
                    selected={selected}
                    events={filteredEvents}
                    onSelectDate={selectDate}
                    onCreate={openCreate}
                    onOpenEvent={openEdit}
                  />
                )}

                {view === "day" && (
                  <DayView
                    date={cursor}
                    today={today}
                    events={filteredEvents}
                    onCreate={openCreate}
                    onOpenEvent={openEdit}
                  />
                )}
              </>
            )}
          </section>

          {view !== "day" && (
            <DayPanel
              className="hidden xl:flex"
              date={selected}
              today={today}
              events={filteredEvents}
              onAdd={openCreate}
              onEdit={openEdit}
            />
          )}
        </main>
      </div>

      {view !== "day" && (
        <DayPanelSheet
          open={panelOpen}
          date={selected}
          today={today}
          events={filteredEvents}
          onClose={closePanel}
          onAdd={openCreate}
          onEdit={openEdit}
        />
      )}

      {editorOpen && (
        <EventDialog
          initialDate={editorDate}
          event={editingEvent}
          onClose={closeEditor}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
