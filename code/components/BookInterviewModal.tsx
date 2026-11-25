"use client";

import { useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";
import { Modal } from "./Modal";
import { AVAILABLE_INTERVIEW_SLOTS } from "@/lib/slots";
import { useApp } from "@/lib/store";

export function BookInterviewModal({
  applicationId,
  onClose,
  onBooked,
}: {
  applicationId: string;
  onClose: () => void;
  onBooked: () => void;
}) {
  const { bookInterview } = useApp();
  const [selected, setSelected] = useState<number | null>(null);

  function confirm() {
    if (selected === null) return;
    bookInterview(applicationId, AVAILABLE_INTERVIEW_SLOTS[selected]);
    onBooked();
  }

  return (
    <Modal title="Book In-Person Interview" onClose={onClose}>
      <p className="mb-4 text-sm text-muted">Pick an available slot below.</p>
      <div className="flex flex-col gap-2">
        {AVAILABLE_INTERVIEW_SLOTS.map((slot, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex items-center justify-between rounded-2xl border-2 px-3.5 py-3 text-left transition"
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
                  · {slot.time}
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
      <button
        disabled={selected === null}
        onClick={confirm}
        className="mt-5 w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white transition disabled:opacity-40"
      >
        Confirm Booking
      </button>
    </Modal>
  );
}
