"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/lib/store";

interface Question {
  id: string;
  question: string;
  options: string[];
}

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: societyId } = use(params);
  const router = useRouter();
  const { currentUser } = useApp();

  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anti-cheat counters, shown live and submitted with the assessment.
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [focusLossDuration, setFocusLossDuration] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const blurredAt = useRef<number | null>(null);
  const warningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up once on mount: create/resume the application and load questions.
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        const { application } = await apiFetch<{ application: { id: number } }>(
          "/api/applications",
          { method: "POST", body: { studentId: currentUser.id, societyId } }
        );
        const { questions: qs } = await apiFetch<{ questions: Question[] }>("/api/test-questions");
        if (cancelled) return;
        setApplicationId(application.id);
        setQuestions(qs);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to start assessment.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser, societyId]);

  // Anti-cheat listeners: registered once, use refs/functional setState so
  // they never need to be re-attached as state changes.
  useEffect(() => {
    function triggerWarning() {
      setShowWarning(true);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
      warningTimeout.current = setTimeout(() => setShowWarning(false), 4000);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        setTabSwitchCount((n) => n + 1);
        triggerWarning();
      }
    }

    function onBlur() {
      blurredAt.current = Date.now();
    }

    function onFocus() {
      if (blurredAt.current === null) return;
      const elapsedSeconds = Math.round((Date.now() - blurredAt.current) / 1000);
      blurredAt.current = null;
      if (elapsedSeconds > 0) {
        setFocusLossDuration((s) => s + elapsedSeconds);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
    };
  }, []);

  async function handleSubmit() {
    if (!applicationId || !questions) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/test-submit", {
        method: "POST",
        body: {
          applicationId,
          answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
            questionId,
            selectedIndex,
          })),
          tabSwitchCount,
          focusLossDuration,
        },
      });
      router.push(`/student/societies/${societyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assessment.");
      setSubmitting(false);
    }
  }

  if (!questions) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted">
        {error ?? "Loading assessment…"}
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {showWarning && (
        <div className="sticky top-0 z-40 flex items-center gap-2 bg-danger px-4 py-3 text-sm font-bold text-white">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Tab switch detected — this has been logged ({tabSwitchCount} so far).
        </div>
      )}

      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-black/5 bg-background/90 px-4 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ArrowLeft className="h-4 w-4 text-muted" />
          <p className="text-sm font-bold text-navy">Proctored Assessment</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted">
          <ShieldAlert className="h-3.5 w-3.5" /> {tabSwitchCount} switches · {focusLossDuration}s away
        </span>
      </div>

      <div className="px-4 py-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted">
          {answeredCount} of {questions.length} answered
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-navy">
                {i + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((option, optIndex) => {
                  const active = answers[q.id] === optIndex;
                  return (
                    <button
                      key={optIndex}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: optIndex }))}
                      className="flex items-center justify-between rounded-2xl border-2 px-3.5 py-2.5 text-left text-sm font-semibold transition"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        backgroundColor: active ? "var(--accent-soft)" : "var(--surface-2)",
                        color: active ? "var(--accent-text)" : "var(--foreground)",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-xs font-semibold text-danger">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-bold text-white transition disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Submit Assessment"
          )}
        </button>
      </div>
    </div>
  );
}
