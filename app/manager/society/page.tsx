"use client";

import { useState } from "react";
import { CalendarClock, Lock, MapPin, Settings2, Users2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { DynamicIcon } from "@/components/DynamicIcon";
import { AVAILABLE_INTERVIEW_SLOTS } from "@/lib/slots";
import { societies } from "@/lib/mockData";
import { useApp } from "@/lib/store";

export default function MySocietyPage() {
  const { currentUser, applications, interviewSlots } = useApp();
  const [openSlots, setOpenSlots] = useState<Record<number, boolean>>({});

  const mySociety = societies.find((s) => s.id === currentUser?.societyId);
  const others = societies.filter((s) => s.id !== currentUser?.societyId);

  const mySocietyApps = mySociety
    ? applications.filter((a) => a.societyId === mySociety.id)
    : [];
  const mySocietySlots = mySociety
    ? interviewSlots.filter((s) => s.societyId === mySociety.id)
    : [];

  const shortlistedCount = mySocietyApps.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interview_Booked"
  ).length;

  return (
    <div>
      <TopBar title="My Society" />
      <div className="px-4 pt-4">
        {mySociety && (
          <>
            <div className="overflow-hidden rounded-3xl bg-slate-card shadow-sm">
              <div className="h-1.5 w-full bg-accent" />
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <DynamicIcon name={mySociety.icon} className="h-6 w-6 text-navy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{mySociety.name}</p>
                    <p className="truncate text-xs text-white/75">{mySociety.tagline}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">
                    You manage this
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white py-2.5 shadow-sm">
                    <p className="text-lg font-extrabold text-navy">{mySocietyApps.length}</p>
                    <p className="text-[10px] font-semibold text-muted">Applicants</p>
                  </div>
                  <div className="rounded-2xl bg-white py-2.5 shadow-sm">
                    <p className="text-lg font-extrabold text-success">{shortlistedCount}</p>
                    <p className="text-[10px] font-semibold text-muted">Shortlisted</p>
                  </div>
                  <div className="rounded-2xl bg-white py-2.5 shadow-sm">
                    <p className="text-lg font-extrabold text-navy">{mySocietySlots.length}</p>
                    <p className="text-[10px] font-semibold text-muted">Interviews Booked</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <Settings2 className="h-3.5 w-3.5" /> Interview slot management
              </p>
              <div className="flex flex-col gap-2">
                {AVAILABLE_INTERVIEW_SLOTS.map((slot, i) => {
                  const bookedBy = mySocietySlots.find(
                    (s) => s.date === slot.date && s.time === slot.time
                  );
                  const closed = openSlots[i] === false;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-surface-2 px-3 py-2.5"
                    >
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                          <CalendarClock className="h-3 w-3 text-accent-text" />
                          {new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {slot.time}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                          <MapPin className="h-3 w-3" /> {slot.venue}
                        </p>
                      </div>
                      {bookedBy ? (
                        <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-bold text-success">
                          Booked
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setOpenSlots((s) => ({ ...s, [i]: closed ? true : false }))
                          }
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold transition"
                          style={{
                            backgroundColor: closed ? "var(--surface-2)" : "var(--accent-soft)",
                            color: closed ? "var(--muted)" : "var(--accent-text)",
                          }}
                        >
                          {closed ? "Closed" : "Open"}
                        </button>
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
        <div className="flex flex-col gap-2">
          {others.map((society) => (
            <div
              key={society.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface-2 p-3.5"
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
