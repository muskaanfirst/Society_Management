"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, MapPin, Ticket } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { DynamicIcon } from "@/components/DynamicIcon";
import { apiFetch, formatTime } from "@/lib/api";
import { pastelBgFor } from "@/components/pastelAccents";
import { useApp } from "@/lib/store";
import type { InterviewSlot, MyApplication, Society } from "@/lib/types";

interface MySlot extends InterviewSlot {
  society: Society;
}

export default function SlotsPage() {
  const { currentUser } = useApp();
  const [mySlots, setMySlots] = useState<MySlot[] | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const [{ applications }, { slots }, { societies }] = await Promise.all([
        apiFetch<{ applications: MyApplication[] }>(`/api/applications?studentId=${currentUser.id}`),
        apiFetch<{ slots: InterviewSlot[] }>("/api/slots"),
        apiFetch<{ societies: Society[] }>("/api/societies"),
      ]);
      const myApplicationIds = new Set(applications.map((a) => a.id));
      const societyByApplication = new Map(applications.map((a) => [a.id, a.societyId]));
      const resolved = slots
        .filter((s) => s.applicationId !== null && myApplicationIds.has(s.applicationId))
        .map((s) => {
          const societyId = societyByApplication.get(s.applicationId!);
          const society = societies.find((soc) => soc.id === societyId);
          return society ? { ...s, society } : null;
        })
        .filter((s): s is MySlot => s !== null)
        .sort((a, b) => a.date.localeCompare(b.date));
      setMySlots(resolved);
    })();
  }, [currentUser]);

  return (
    <div>
      <TopBar title="My Slots" />
      <div className="px-4 pt-4">
        {!mySlots ? (
          <p className="mt-8 text-center text-sm text-muted">Loading…</p>
        ) : mySlots.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
              <Ticket className="h-6 w-6 text-muted" />
            </div>
            <p className="text-sm font-bold text-navy">No interviews booked yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted">
              Once you&apos;re shortlisted by a society, you can book an in-person interview slot
              here.
            </p>
            <Link
              href="/student/societies"
              className="mt-4 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
            >
              Browse Societies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mySlots.map((slot) => (
              <div key={slot.id} className={`overflow-hidden rounded-3xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${pastelBgFor(slot.society.id)}`}>
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <DynamicIcon name={slot.society.icon} className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{slot.society.name}</p>
                    <p className="text-xs text-foreground/60">Interview</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 border-t border-black/10 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-foreground/90">
                    <CalendarClock className="h-4 w-4 text-foreground" />
                    {new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {formatTime(slot.time)}
                  </span>
                  <span className="flex items-center gap-2 text-foreground/60">
                    <MapPin className="h-4 w-4" />
                    {slot.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
