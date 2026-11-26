"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { AnswersModal } from "@/components/AnswersModal";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/Toast";
import type { Grade, NonTechGradeRow, Society, TechGradeRow } from "@/lib/types";

const GRADE_STYLES: Record<Exclude<Grade, null>, { bg: string; fg: string }> = {
  RED: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  YELLOW: { bg: "var(--accent-soft)", fg: "var(--accent-text)" },
  GREEN: { bg: "var(--success-soft)", fg: "var(--success)" },
};

export default function GradingPage() {
  const { currentUser } = useApp();
  const { showToast } = useToast();
  const [view, setView] = useState<"TECH" | "NON_TECH">("TECH");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [techRows, setTechRows] = useState<TechGradeRow[]>([]);
  const [nonTechRows, setNonTechRows] = useState<NonTechGradeRow[]>([]);
  const [viewing, setViewing] = useState<NonTechGradeRow | null>(null);

  const refresh = useCallback(async () => {
    const [{ societies: s }, { rows: tech }, { rows: nonTech }] = await Promise.all([
      apiFetch<{ societies: Society[] }>("/api/societies"),
      apiFetch<{ rows: TechGradeRow[] }>("/api/grades?type=TECH"),
      apiFetch<{ rows: NonTechGradeRow[] }>("/api/grades?type=NON_TECH"),
    ]);
    setSocieties(s);
    setTechRows(tech.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)));
    setNonTechRows(nonTech);
  }, []);

  useEffect(() => {
    // One-time data fetch on mount/change, not a render-phase setState -- the
    // actual setState calls happen asynchronously after `refresh`'s awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const nonTechSocietyIds = useMemo(
    () => Array.from(new Set(nonTechRows.map((r) => r.societyId))),
    [nonTechRows]
  );

  function societyName(id: string) {
    return societies.find((s) => s.id === id)?.name ?? id;
  }

  async function shortlist(applicationId: number) {
    await apiFetch("/api/grades", { method: "POST", body: { action: "shortlist", applicationId } });
    showToast("Applicant shortlisted!");
    void refresh();
  }

  async function setGrade(applicationId: number, grade: Exclude<Grade, null>) {
    if (!currentUser) return;
    await apiFetch("/api/grades", {
      method: "POST",
      body: { action: "rubric", applicationId, grade, gradedBy: currentUser.id },
    });
    showToast("Grade saved!");
    void refresh();
  }

  async function bulkShortlistGreens(societyId: string) {
    const { shortlistedApplicationIds } = await apiFetch<{ shortlistedApplicationIds: number[] }>(
      "/api/grades",
      { method: "POST", body: { action: "bulkShortlistGreen", societyId } }
    );
    showToast(`Shortlisted ${shortlistedApplicationIds.length} applicant(s)!`);
    void refresh();
  }

  return (
    <div>
      <TopBar title="Grading" />
      <div className="px-4 pt-4">
        <div className="flex gap-2 rounded-full border border-black/5 bg-white p-1.5 shadow-sm">
          {(["TECH", "NON_TECH"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 rounded-full py-2.5 text-xs font-bold transition active:scale-95"
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
          <div className="mt-4 overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-sm">
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
                {techRows.map((row) => {
                  const isShortlisted =
                    row.status === "Shortlisted" || row.status === "Interview_Booked";
                  return (
                    <tr key={row.applicationId} className="border-t border-black/5">
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-navy">{row.studentName}</p>
                        <p className="text-[10px] text-muted">{row.studentRollNo}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted">{societyName(row.societyId)}</td>
                      <td className="px-3 py-2.5 font-bold text-navy">{row.score ?? "—"}</td>
                      <td className="px-3 py-2.5 text-muted">{row.status.replace("_", " ")}</td>
                      <td className="px-3 py-2.5">
                        {isShortlisted ? (
                          <span className="flex items-center gap-1 font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Shortlisted
                          </span>
                        ) : (
                          <button
                            onClick={() => shortlist(row.applicationId)}
                            className="rounded-full bg-navy px-2.5 py-1.5 text-[11px] font-bold text-white transition active:scale-95"
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
                  className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 py-1.5 text-[11px] font-bold text-success transition active:scale-95"
                >
                  <Sparkles className="h-3 w-3" /> Shortlist Greens — {societyName(id)}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-sm">
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
                  {nonTechRows.map((row) => (
                    <tr key={row.applicationId} className="border-t border-black/5">
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-navy">{row.studentName}</p>
                        <p className="text-[10px] text-muted">{row.studentRollNo}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted">{societyName(row.societyId)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setViewing(row)}
                          className="flex items-center gap-1 font-semibold text-accent-text transition hover:brightness-90"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {(["RED", "YELLOW", "GREEN"] as const).map((g) => {
                            const active = row.grade === g;
                            return (
                              <button
                                key={g}
                                onClick={() => setGrade(row.applicationId, g)}
                                className="h-5 w-5 rounded-full border-2 transition active:scale-90"
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
                      <td className="px-3 py-2.5 text-muted">{row.status.replace("_", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {viewing && <AnswersModal row={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
