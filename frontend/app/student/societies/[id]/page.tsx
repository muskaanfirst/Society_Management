"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { NonTechFormModal } from "@/components/NonTechFormModal";
import { BookInterviewModal } from "@/components/BookInterviewModal";
import { apiFetch, formatTime } from "@/lib/api";
import { pastelBgFor } from "@/components/pastelAccents";
import { useApp } from "@/lib/store";
import type { CampusEvent, InterviewSlot, MyApplication, Society } from "@/lib/types";

export default function SocietyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser } = useApp();
  const [society, setSociety] = useState<Society | null | undefined>(undefined);
  const [myApp, setMyApp] = useState<MyApplication | null>(null);
  const [mySlot, setMySlot] = useState<InterviewSlot | null>(null);
  const [upcoming, setUpcoming] = useState<CampusEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser) return;
    const [{ societies }, { applications }, { events }, { slots }] = await Promise.all([
      apiFetch<{ societies: Society[] }>("/api/societies"),
      apiFetch<{ applications: MyApplication[] }>(`/api/applications?studentId=${currentUser.id}`),
      apiFetch<{ events: CampusEvent[] }>("/api/events"),
      apiFetch<{ slots: InterviewSlot[] }>("/api/slots"),
    ]);
    setSociety(societies.find((s) => s.id === id) ?? null);
    const app = applications.find((a) => a.societyId === id) ?? null;
    setMyApp(app);
    setMySlot(app ? slots.find((s) => s.applicationId === app.id) ?? null : null);
    setUpcoming(events.filter((e) => e.societyId === id).slice(0, 2));
  }, [currentUser, id]);

  useEffect(() => {
    // One-time data fetch on mount/change, not a render-phase setState -- the
    // actual setState calls happen asynchronously after `refresh`'s awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  if (society === undefined) {
    return <div className="p-6 text-sm text-muted">Loading…</div>;
  }

  if (!society) {
    return (
      <div className="p-6 text-sm text-muted">
        Society not found. <Link href="/student/societies" className="font-semibold text-accent-text">Go back</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/5 bg-background/90 px-4 py-3.5 backdrop-blur-md">
        <Link
          href="/student/societies"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-sm font-bold text-navy">{society.name}</p>
      </div>

      <div className="px-4 py-5">
        <div className={`overflow-hidden rounded-3xl shadow-sm ${pastelBgFor(society.id)}`}>
          <div className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <DynamicIcon name={society.icon} className="h-7 w-7 text-navy" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-extrabold text-foreground">{society.name}</h1>
                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {society.type === "TECH" ? "Tech" : "Non-Tech"}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">{society.tagline}</p>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-foreground/60">
                  <Users2 className="h-3.5 w-3.5" />
                  {society.memberCount} members
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">{society.description}</p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
              Upcoming events
            </p>
            <div className="flex flex-col gap-2">
              {upcoming.map((e) => (
                <div key={e.id} className="rounded-2xl border border-black/5 bg-white p-3">
                  <p className="text-sm font-bold text-navy">{e.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
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
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            Application status
          </p>

          {!myApp && society.type === "TECH" && (
            <div>
              <p className="mb-3 text-sm text-muted">
                Complete a short proctored assessment to be considered for {society.name}.
              </p>
              <Link
                href={`/student/societies/${society.id}/assessment`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                <ShieldCheck className="h-4 w-4" /> Take Proctored Assessment
              </Link>
            </div>
          )}

          {!myApp && society.type === "NON_TECH" && (
            <div>
              <p className="mb-3 text-sm text-muted">
                Fill out a short form and optionally attach a work sample to apply to {society.name}.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                <ClipboardList className="h-4 w-4" /> Fill Form &amp; Upload
              </button>
            </div>
          )}

          {myApp && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={myApp.status} />
                {myApp.score !== undefined && (
                  <span className="text-sm font-extrabold text-navy">{myApp.score}/100</span>
                )}
              </div>

              {society.type === "TECH" && myApp.status === "Pending" && (
                <Link
                  href={`/student/societies/${society.id}/assessment`}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <ShieldCheck className="h-4 w-4" /> Resume Proctored Assessment
                </Link>
              )}

              {society.type === "TECH" && myApp.status === "Assessed" && (
                <p className="text-sm text-muted">
                  Your assessment has been scored. Shortlisting decisions are released shortly —
                  check back soon.
                </p>
              )}

              {myApp.status === "Pending" && society.type === "NON_TECH" && (
                <p className="text-sm text-muted">
                  Your application is under review by the {society.name} team.
                </p>
              )}

              {myApp.status === "Shortlisted" && !mySlot && (
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" /> You&apos;ve been shortlisted!
                  </p>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-bold text-white transition"
                  >
                    <CalendarClock className="h-4 w-4" /> Book In-Person Interview
                  </button>
                </div>
              )}

              {mySlot && (
                <div className="rounded-2xl border border-success/30 bg-success-soft p-3">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-success">
                    <Sparkles className="h-4 w-4" /> Interview booked
                  </p>
                  <p className="mt-1 text-sm text-navy/90">
                    {new Date(mySlot.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {formatTime(mySlot.time)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <MapPin className="h-3 w-3" /> {mySlot.venue}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <NonTechFormModal
          societyId={society.id}
          societyName={society.name}
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}
      {showBooking && myApp && (
        <BookInterviewModal
          applicationId={myApp.id}
          onClose={() => setShowBooking(false)}
          onBooked={() => {
            setShowBooking(false);
            void refresh();
          }}
        />
      )}
    </div>
  );
}
