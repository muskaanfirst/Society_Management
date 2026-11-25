"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { Modal } from "./Modal";
import { useApp } from "@/lib/store";

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
  const { submitNonTechForm } = useApp();
  const [why, setWhy] = useState("");
  const [experience, setExperience] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const canSubmit = why.trim().length > 0 && experience.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    submitNonTechForm(societyId, [
      { question: `Why do you want to join ${societyName}?`, answer: why.trim() },
      { question: "Relevant experience / portfolio", answer: experience.trim() },
      ...(fileName ? [{ question: "Attachment", answer: fileName }] : []),
    ]);
    onSubmitted();
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
            className="w-full resize-none rounded-2xl border border-slate-200 bg-surface-2 px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="w-full resize-none rounded-2xl border border-slate-200 bg-surface-2 px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Upload a sample (optional)
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-surface-2 px-3 py-2.5 text-sm text-muted transition hover:border-accent/60">
            <Paperclip className="h-4 w-4" />
            {fileName ?? "Choose file"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </div>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-1 w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white transition disabled:opacity-40"
        >
          Submit Application
        </button>
      </div>
    </Modal>
  );
}
