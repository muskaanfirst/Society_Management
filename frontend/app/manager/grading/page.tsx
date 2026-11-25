"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { AnswersModal } from "@/components/AnswersModal";
import { societies } from "@/lib/mockData";
import { useApp } from "@/lib/store";
import type { Application, Grade } from "@/lib/types";

const GRADE_STYLES: Record<Exclude<Grade, null>, { bg: string; fg: string }> = {
  RED: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  YELLOW: { bg: "var(--accent-soft)", fg: "var(--accent-text)" },
  GREEN: { bg: "var(--success-soft)", fg: "var(--success)" },
};

export default function GradingPage() {
  const { applications, shortlistApplication, gradeApplication, bulkShortlistGreens } = useApp();
  const [view, setView] = useState<"TECH" | "NON_TECH">("TECH");
  const [viewing, setViewing] = useState<Application | null>(null);

  const techApps = useMemo(
    () =>
      applications
        .filter((a) => a.type === "TECH")
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [applications]
  );

  const nonTechApps = useMemo(
    () => applications.filter((a) => a.type === "NON_TECH"),
    [applications]
  );

  const nonTechSocietyIds = useMemo(
    () => Array.from(new Set(nonTechApps.map((a) => a.societyId))),
    [nonTechApps]
  );

  function societyName(id: string) {
    return societies.find((s) => s.id === id)?.name ?? id;
  }

  return (
    <div>
      <TopBar title="Grading" />
      <div className="px-4 pt-4">
        <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {(["TECH", "NON_TECH"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 rounded-xl py-2.5 text-xs font-bold transition"
              style={{
                backgroundColor: view === v ? "var(--foreground)" : "transparent",
                color: view === v ? "#ffffff" : "var(--muted)",
              }}
            >
              {v === "TECH" ? "Tech View" : "Non-Tech View"}
            </button>
          ))}
        </div>

        {view === "TECH" ? (
          <div className="mt-4 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-surface-2 text-muted">
                  <th className="px-3 py-2.5 font-bold text-navy">Student</th>
                  <th className="px-3 py-2.5 font-bold text-navy">Society</th>
                  <th className="px-3 py-2.5 font-bold text-navy">Score</th>
                  <th className="px-3 py-2.5 font-bold text-navy">Status</th>
                  <th className="px-3 py-2.5 font-bold text-navy">Action</th>
                </tr>
              </thead>
              <tbody>
                {techApps.map((app) => {
                  const isShortlisted =
                    app.status === "Shortlisted" || app.status === "Interview_Booked";
                  return (
                    <tr key={app.id} className="border-t border-slate-100">
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-navy">{app.studentName}</p>
                        <p className="text-[10px] text-muted">{app.studentRollNo}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted">{societyName(app.societyId)}</td>
                      <td className="px-3 py-2.5 font-bold text-navy">{app.score}</td>
                      <td className="px-3 py-2.5 text-muted">{app.status.replace("_", " ")}</td>
                      <td className="px-3 py-2.5">
                        {isShortlisted ? (
                          <span className="flex items-center gap-1 font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Shortlisted
                          </span>
                        ) : (
                          <button
                            onClick={() => shortlistApplication(app.id)}
                            className="rounded-full bg-navy px-2.5 py-1.5 text-[11px] font-bold text-white"
                          >
                            Shortlist
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {nonTechSocietyIds.map((id) => (
                <button
                  key={id}
                  onClick={() => bulkShortlistGreens(id)}
                  className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 py-1.5 text-[11px] font-bold text-success"
                >
                  <Sparkles className="h-3 w-3" /> Shortlist Greens — {societyName(id)}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-surface-2 text-muted">
                    <th className="px-3 py-2.5 font-bold text-navy">Student</th>
                    <th className="px-3 py-2.5 font-bold text-navy">Society</th>
                    <th className="px-3 py-2.5 font-bold text-navy">Response</th>
                    <th className="px-3 py-2.5 font-bold text-navy">Grade</th>
                    <th className="px-3 py-2.5 font-bold text-navy">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {nonTechApps.map((app) => (
                    <tr key={app.id} className="border-t border-slate-100">
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-navy">{app.studentName}</p>
                        <p className="text-[10px] text-muted">{app.studentRollNo}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted">{societyName(app.societyId)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setViewing(app)}
                          className="flex items-center gap-1 font-semibold text-accent-text transition hover:brightness-90"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {(["RED", "YELLOW", "GREEN"] as const).map((g) => {
                            const active = app.grade === g;
                            return (
                              <button
                                key={g}
                                onClick={() => gradeApplication(app.id, g)}
                                className="h-5 w-5 rounded-full border-2 transition"
                                style={{
                                  backgroundColor: active ? GRADE_STYLES[g].fg : "transparent",
                                  borderColor: GRADE_STYLES[g].fg,
                                }}
                                aria-label={g}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted">{app.status.replace("_", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {viewing && <AnswersModal application={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
