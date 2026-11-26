"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, MapPin, UserPlus } from "lucide-react";
import { Modal } from "./Modal";
import { apiFetch, formatTime } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useToast } from "./Toast";
import type { CampusEvent, Society } from "@/lib/types";

function toISODate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// The week the seed data's events actually fall in -- same Sept 2026 anchor
// the month grid below already defaults to.
const WEEK_START = new Date(2026, 8, 10);
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEEK_START);
  d.setDate(d.getDate() + i);
  return d;
});

export function CampusCalendar() {
  const { currentUser } = useApp();
  const { showToast } = useToast();
  const [cursor, setCursor] = useState(() => new Date(2026, 8, 1)); // Sept 2026 — seed data month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<string | "ALL">("ALL");
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiFetch<{ events: CampusEvent[] }>("/api/events").then((r) => setEvents(r.events));
    apiFetch<{ societies: Society[] }>("/api/societies").then((r) => setSocieties(r.societies));
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CampusEvent[]>();
    for (const e of events) {
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    return map;
  }, [events]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  const weekEventDates = useMemo(() => new Set(WEEK_DAYS.map((d) => toISODate(d.getFullYear(), d.getMonth(), d.getDate()))), []);
  const thisWeekEvents = useMemo(
    () =>
      events
        .filter((e) => weekEventDates.has(e.date) && (weekFilter === "ALL" || e.date === weekFilter))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [events, weekFilter, weekEventDates]
  );

  async function register(event: CampusEvent) {
    if (!currentUser) return;
    try {
      const { alreadyRegistered } = await apiFetch<{ alreadyRegistered: boolean }>(
        "/api/events/register",
        { method: "POST", body: { eventId: event.id, studentId: currentUser.id } }
      );
      setRegisteredIds((s) => new Set(s).add(event.id));
      showToast(alreadyRegistered ? "You're already registered for this event." : `Registered for ${event.title}!`);
    } catch {
      showToast("Failed to register for this event.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between px-1 pb-3">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition active:scale-95 hover:bg-surface-2 hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-bold text-navy">
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition active:scale-95 hover:bg-surface-2 hover:text-navy"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="pb-1.5 text-[11px] font-semibold text-muted">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const iso = toISODate(year, month, day);
            const dayEvents = eventsByDate.get(iso);
            const hasEvents = !!dayEvents?.length;
            return (
              <button
                key={i}
                disabled={!hasEvents}
                onClick={() => setSelectedDate(iso)}
                className="mx-auto flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-full text-sm transition active:scale-95"
                style={{
                  backgroundColor: hasEvents ? "var(--accent-soft)" : "transparent",
                  color: hasEvents ? "var(--accent-text)" : "var(--foreground)",
                  fontWeight: hasEvents ? 700 : 400,
                }}
              >
                {day}
                {hasEvents && <span className="h-1 w-1 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">This week</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setWeekFilter("ALL")}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95"
            style={{
              backgroundColor: weekFilter === "ALL" ? "var(--foreground)" : "var(--surface-2)",
              color: weekFilter === "ALL" ? "#ffffff" : "var(--muted)",
            }}
          >
            All Days
          </button>
          {WEEK_DAYS.map((d) => {
            const iso = toISODate(d.getFullYear(), d.getMonth(), d.getDate());
            const active = weekFilter === iso;
            return (
              <button
                key={iso}
                onClick={() => setWeekFilter(iso)}
                className="flex shrink-0 flex-col items-center rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95"
                style={{
                  backgroundColor: active ? "var(--foreground)" : "var(--surface-2)",
                  color: active ? "#ffffff" : "var(--muted)",
                }}
              >
                <span>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                <span>{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {thisWeekEvents.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">No events for this day.</p>
          ) : (
            thisWeekEvents.map((e) => {
              const society = societies.find((s) => s.id === e.societyId);
              const registered = registeredIds.has(e.id);
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-surface-2 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy">{e.title}</p>
                    {society && <p className="truncate text-xs font-semibold text-accent-text">{society.name}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(e.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {formatTime(e.time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {e.venue}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => register(e)}
                    disabled={registered}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-bold text-white transition active:scale-95 disabled:opacity-50"
                  >
                    <UserPlus className="h-3 w-3" />
                    {registered ? "Registered" : "Register"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedDate && (
        <Modal
          title={new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          onClose={() => setSelectedDate(null)}
        >
          <div className="flex flex-col gap-3">
            {selectedEvents.map((e) => {
              const society = societies.find((s) => s.id === e.societyId);
              const registered = registeredIds.has(e.id);
              return (
                <div key={e.id} className="rounded-2xl border border-black/5 bg-surface-2 p-3.5">
                  <p className="text-sm font-bold text-navy">{e.title}</p>
                  {society && <p className="text-xs font-semibold text-accent-text">{society.name}</p>}
                  <div className="mt-2 flex flex-col gap-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" /> {formatTime(e.time)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {e.venue}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {e.description}
                  </p>
                  <button
                    onClick={() => register(e)}
                    disabled={registered}
                    className="mt-3 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-bold text-white transition active:scale-95 disabled:opacity-50"
                  >
                    <UserPlus className="h-3 w-3" />
                    {registered ? "Registered" : "Register"}
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
