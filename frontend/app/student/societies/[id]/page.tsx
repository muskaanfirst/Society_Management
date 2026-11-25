"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { NonTechFormModal } from "@/components/NonTechFormModal";
import { BookInterviewModal } from "@/components/BookInterviewModal";
import { events, societies } from "@/lib/mockData";
import { useApp } from "@/lib/store";

export default function SocietyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const society = societies.find((s) => s.id === id);
  const { currentUser, applications, interviewSlots, submitTechAssessment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [assessing, setAssessing] = useState(false);

  if (!society) {
    return (
      <div className="p-6 text-sm text-muted">
        Society not found. <Link href="/student/societies" className="font-semibold text-accent-text">Go back</Link>
      </div>
    );
  }

  const myApp = applications.find(
    (a) => a.studentId === currentUser?.id && a.societyId === society.id
  );
  const mySlot = myApp ? interviewSlots.find((s) => s.applicationId === myApp.id) : null;
  const upcoming = events
    .filter((e) => e.societyId === society.id)
    .slice(0, 2);

  function runAssessment() {
    setAssessing(true);
    setTimeout(() => {
      submitTechAssessment(society!.id);
      setAssessing(false);
    }, 1400);
  }

  return (
    <div>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-background/90 px-4 py-3.5 backdrop-blur-md">
        <Link
          href="/student/societies"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-sm font-bold text-navy">{society.name}</p>
      </div>

      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-3xl bg-slate-card shadow-sm">
          <div className="h-1.5 w-full bg-accent" />
          <div className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <DynamicIcon name={society.icon} className="h-7 w-7 text-navy" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-extrabold text-white">{society.name}</h1>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                    {society.type === "TECH" ? "Tech" : "Non-Tech"}
                  </span>
                </div>
                <p className="text-sm text-white/80">{society.tagline}</p>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-white/70">
                  <Users2 className="h-3.5 w-3.5" />
                  {society.memberCount} members
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/90">{society.description}</p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
              Upcoming events
            </p>
            <div className="flex flex-col gap-2">
              {upcoming.map((e) => (
                <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-bold text-navy">{e.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {new Date(e.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {e.time}
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

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            Application status
          </p>

          {!myApp && society.type === "TECH" && (
            <div>
              <p className="mb-3 text-sm text-muted">
                Complete a short proctored assessment to be considered for {society.name}.
              </p>
              <button
                onClick={runAssessment}
                disabled={assessing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-navy transition disabled:opacity-70"
              >
                {assessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Running assessment…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Take Proctored Assessment
                  </>
                )}
              </button>
            </div>
          )}

          {!myApp && society.type === "NON_TECH" && (
            <div>
              <p className="mb-3 text-sm text-muted">
                Fill out a short form and optionally attach a work sample to apply to {society.name}.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-navy transition"
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

              {myApp.type === "TECH" && myApp.status === "Assessed" && (
                <p className="text-sm text-muted">
                  Your assessment has been scored. Shortlisting decisions are released shortly —
                  check back soon.
                </p>
              )}

              {myApp.status === "Pending" && (
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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-3 text-sm font-bold text-white transition"
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
                    · {mySlot.time}
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
          onSubmitted={() => setShowForm(false)}
        />
      )}
      {showBooking && myApp && (
        <BookInterviewModal
          applicationId={myApp.id}
          onClose={() => setShowBooking(false)}
          onBooked={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
