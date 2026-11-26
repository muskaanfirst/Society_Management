"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Lock, MapPin, Settings2, Users2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { DynamicIcon } from "@/components/DynamicIcon";
import { apiFetch, formatTime } from "@/lib/api";
import { pastelBgFor } from "@/components/pastelAccents";
import { useApp } from "@/lib/store";
import type { InterviewSlot, NonTechGradeRow, Society, TechGradeRow } from "@/lib/types";

export default function MySocietyPage() {
  const { currentUser } = useApp();
  const [societies, setSocieties] = useState<Society[] | null>(null);
  const [myApplicationIds, setMyApplicationIds] = useState<Set<number>>(new Set());
  const [applicantCount, setApplicantCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [slotDateFilter, setSlotDateFilter] = useState<string | "ALL">("ALL");

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { societies: allSocieties } = await apiFetch<{ societies: Society[] }>("/api/societies");
      setSocieties(allSocieties);
      const mySociety = allSocieties.find((s) => s.managerId === currentUser.id);
      if (!mySociety) return;

      const { rows } = mySociety.type === "TECH"
        ? await apiFetch<{ rows: TechGradeRow[] }>("/api/grades?type=TECH")
        : await apiFetch<{ rows: NonTechGradeRow[] }>("/api/grades?type=NON_TECH");
      const mine = rows.filter((r) => r.societyId === mySociety.id);
      setApplicantCount(mine.length);
      setShortlistedCount(
        mine.filter((r) => r.status === "Shortlisted" || r.status === "Interview_Booked").length
      );
      setMyApplicationIds(new Set(mine.map((r) => r.applicationId)));

      const { slots: allSlots } = await apiFetch<{ slots: InterviewSlot[] }>("/api/slots");
      setSlots(allSlots);
    })();
  }, [currentUser]);

  if (!currentUser || !societies) {
    return (
      <div>
        <TopBar title="My Society" />
        <p className="mt-8 text-center text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const mySociety = societies.find((s) => s.managerId === currentUser.id);
  const others = societies.filter((s) => s.id !== mySociety?.id);
  const slotDates = Array.from(new Set(slots.map((s) => s.date))).sort();
  const visibleSlots = slots.filter((s) => slotDateFilter === "ALL" || s.date === slotDateFilter);

  return (
    <div>
      <TopBar title="My Society" />
      <div className="px-4 pt-4">
        {mySociety && (
          <>
            <div className={`overflow-hidden rounded-3xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${pastelBgFor(mySociety.id)}`}>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <DynamicIcon name={mySociety.icon} className="h-6 w-6 text-navy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{mySociety.name}</p>
                    <p className="truncate text-xs text-foreground/70">{mySociety.tagline}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-black/10 px-2.5 py-1 text-[10px] font-bold text-foreground">
                    You manage this
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white py-3 shadow-sm">
                    <p className="text-2xl font-extrabold tracking-tight text-navy">{applicantCount}</p>
                    <p className="text-[10px] font-semibold text-muted">Applicants</p>
                  </div>
                  <div className="rounded-2xl bg-white py-3 shadow-sm">
                    <p className="text-2xl font-extrabold tracking-tight text-success">{shortlistedCount}</p>
                    <p className="text-[10px] font-semibold text-muted">Shortlisted</p>
                  </div>
                  <div className="rounded-2xl bg-white py-3 shadow-sm">
                    <p className="text-2xl font-extrabold tracking-tight text-navy">
                      {slots.filter((s) => s.applicationId !== null && myApplicationIds.has(s.applicationId)).length}
                    </p>
                    <p className="text-[10px] font-semibold text-muted">Interviews Booked</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <Settings2 className="h-3.5 w-3.5" /> Interview slots
              </p>

              {slotDates.length > 1 && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSlotDateFilter("ALL")}
                    className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95"
                    style={{
                      backgroundColor: slotDateFilter === "ALL" ? "var(--foreground)" : "var(--surface-2)",
                      color: slotDateFilter === "ALL" ? "#ffffff" : "var(--muted)",
                    }}
                  >
                    All Days
                  </button>
                  {slotDates.map((date) => {
                    const d = new Date(date + "T00:00:00");
                    const active = slotDateFilter === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSlotDateFilter(date)}
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

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {visibleSlots.map((slot) => {
                  const bookedByMe =
                    slot.applicationId !== null && myApplicationIds.has(slot.applicationId);
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-2xl border border-black/5 bg-surface-2 px-3 py-2.5"
                    >
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                          <CalendarClock className="h-3 w-3 text-accent-text" />
                          {new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {formatTime(slot.time)}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                          <MapPin className="h-3 w-3" /> {slot.venue}
                        </p>
                      </div>
                      {slot.status === "booked" ? (
                        <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-bold text-success">
                          {bookedByMe ? "Booked (yours)" : "Booked"}
                        </span>
                      ) : (
                        <span className="rounded-full border border-black/5 bg-white px-2.5 py-1 text-[10px] font-bold text-muted">
                          Available
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-muted">
          All societies
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((society) => (
            <div
              key={society.id}
              className="flex items-center gap-3 rounded-2xl border border-black/5 bg-surface-2 p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <DynamicIcon name={society.icon} className="h-5 w-5 text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy/70">{society.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted">
                  <Users2 className="h-3 w-3" /> {society.memberCount} members
                </p>
              </div>
              <Lock className="h-3.5 w-3.5 shrink-0 text-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
