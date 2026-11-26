"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, MapPin } from "lucide-react";
import { Modal } from "./Modal";
import { apiFetch, ApiError, formatTime } from "@/lib/api";
import { useToast } from "./Toast";
import type { InterviewSlot } from "@/lib/types";

export function BookInterviewModal({
  applicationId,
  onClose,
  onBooked,
}: {
  applicationId: number;
  onClose: () => void;
  onBooked: () => void;
}) {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<InterviewSlot[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string | "ALL">("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ slots: InterviewSlot[] }>("/api/slots?status=available").then((r) =>
      setSlots(r.slots)
    );
  }, []);

  const availableDates = useMemo(
    () => Array.from(new Set((slots ?? []).map((s) => s.date))).sort(),
    [slots]
  );
  const visibleSlots = useMemo(
    () => (slots ?? []).filter((s) => dateFilter === "ALL" || s.date === dateFilter),
    [slots, dateFilter]
  );

  async function confirm() {
    if (selected === null) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/slots/book", {
        method: "POST",
        body: { slotId: selected, applicationId },
      });
      showToast("Interview slot booked!");
      onBooked();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setSelected(null);
        apiFetch<{ slots: InterviewSlot[] }>("/api/slots?status=available").then((r) =>
          setSlots(r.slots)
        );
      } else {
        setError("Failed to book interview.");
      }
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Book In-Person Interview" onClose={onClose}>
      <p className="mb-4 text-sm text-muted">Pick an available slot below.</p>

      {availableDates.length > 1 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setDateFilter("ALL")}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95"
            style={{
              backgroundColor: dateFilter === "ALL" ? "var(--foreground)" : "var(--surface-2)",
              color: dateFilter === "ALL" ? "#ffffff" : "var(--muted)",
            }}
          >
            All Days
          </button>
          {availableDates.map((date) => {
            const d = new Date(date + "T00:00:00");
            const active = dateFilter === date;
            return (
              <button
                key={date}
                onClick={() => setDateFilter(date)}
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
      )}

      {!slots ? (
        <p className="text-sm text-muted">Loading slots…</p>
      ) : visibleSlots.length === 0 ? (
        <p className="text-sm text-muted">No slots are available right now — check back soon.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleSlots.map((slot) => {
            const active = selected === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setSelected(slot.id)}
                className="flex items-center justify-between rounded-2xl border-2 px-3.5 py-3 text-left transition active:scale-[0.99]"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  backgroundColor: active ? "var(--accent-soft)" : "var(--surface-2)",
                }}
              >
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                    <CalendarClock className="h-3.5 w-3.5 text-accent-text" />
                    {new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {formatTime(slot.time)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <MapPin className="h-3 w-3" />
                    {slot.venue}
                  </p>
                </div>
                <div
                  className="h-4 w-4 shrink-0 rounded-full border-2"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    backgroundColor: active ? "var(--accent)" : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="mt-3 text-xs font-semibold text-danger">{error}</p>}
      <button
        disabled={selected === null || submitting}
        onClick={confirm}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-bold text-white transition active:scale-95 disabled:opacity-40"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
      </button>
    </Modal>
  );
}
