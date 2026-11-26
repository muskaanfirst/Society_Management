"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { useApp } from "@/lib/store";
import { apiFetch } from "@/lib/api";

export function NonTechFormModal({
  societyId,
  societyName,
  onClose,
  onSubmitted,
}: {
  societyId: string;
  societyName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { currentUser } = useApp();
  const [why, setWhy] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = why.trim().length > 0 && experience.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || !currentUser) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: {
          studentId: currentUser.id,
          societyId,
          formAnswers: [
            { question: `Why do you want to join ${societyName}?`, answer: why.trim() },
            { question: "Relevant experience / portfolio", answer: experience.trim() },
          ],
          portfolioUrl: portfolioUrl.trim() || undefined,
        },
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Apply to ${societyName}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Why do you want to join {societyName}?
          </label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={3}
            placeholder="Tell us in a few sentences…"
            className="w-full resize-none rounded-2xl border border-black/5 bg-surface-2 px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Relevant experience or portfolio
          </label>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={3}
            placeholder="Past work, links, achievements…"
            className="w-full resize-none rounded-2xl border border-black/5 bg-surface-2 px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Portfolio URL (optional)
          </label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://your-portfolio.example.com"
              className="w-full rounded-2xl border border-black/5 bg-surface-2 py-2.5 pl-10 pr-3 text-sm text-navy outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
        {error && <p className="text-xs font-semibold text-danger">{error}</p>}
        <button
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-bold text-white transition disabled:opacity-40"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
        </button>
      </div>
    </Modal>
  );
}
