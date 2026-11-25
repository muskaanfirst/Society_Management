"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Modal } from "./Modal";
import { events, societies } from "@/lib/mockData";

function toISODate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CampusCalendar() {
  const [cursor, setCursor] = useState(() => new Date(2026, 8, 1)); // Sept 2026 — seed data month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    return map;
  }, []);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-navy"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-navy">
          {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-navy"
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
              className="mx-auto flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-full text-sm transition"
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
              return (
                <div key={e.id} className="rounded-2xl border border-slate-200 bg-surface-2 p-3.5">
                  <p className="text-sm font-bold text-navy">{e.title}</p>
                  {society && <p className="text-xs font-semibold text-accent-text">{society.name}</p>}
                  <div className="mt-2 flex flex-col gap-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" /> {e.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {e.venue}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {e.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
