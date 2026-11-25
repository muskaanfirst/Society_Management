"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "./Modal";
import { useApp } from "@/lib/store";
import type { PersonaResult } from "@/lib/types";

const INTERESTS = [
  { id: "coding", label: "Coding", tag: "builder" },
  { id: "hardware", label: "Robotics & Hardware", tag: "builder" },
  { id: "design", label: "Design", tag: "creative" },
  { id: "writing", label: "Writing", tag: "storyteller" },
  { id: "speaking", label: "Public Speaking", tag: "storyteller" },
  { id: "acting", label: "Acting & Performing", tag: "creative" },
  { id: "impact", label: "Social Impact", tag: "changemaker" },
  { id: "startups", label: "Business & Startups", tag: "changemaker" },
];

const SKILLS = [
  "Problem Solving",
  "Creativity",
  "Leadership",
  "Communication",
  "Technical / Programming",
  "Visual Design",
];

const ARCHETYPES: Record<
  string,
  { name: string; description: string; societyIds: string[] }
> = {
  builder: {
    name: "The Builder",
    description:
      "You think in systems and love shipping things that work. You'd thrive in a hands-on technical team.",
    societyIds: ["soc-codecell", "soc-robotics", "soc-designwing"],
  },
  storyteller: {
    name: "The Storyteller",
    description:
      "You communicate ideas that move people — through words, voice, or the stage.",
    societyIds: ["soc-litsoc", "soc-dramatics"],
  },
  changemaker: {
    name: "The Changemaker",
    description:
      "You're driven by impact and enjoy turning ideas into ventures that help people.",
    societyIds: ["soc-enactus"],
  },
  creative: {
    name: "The Creative",
    description:
      "You bring visual and expressive flair to everything you touch, from pixels to performance.",
    societyIds: ["soc-designwing", "soc-dramatics"],
  },
};

export function OnboardingQuiz({ onClose }: { onClose: () => void }) {
  const { saveQuizResult } = useApp();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [result, setResult] = useState<PersonaResult | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function computeResult() {
    const tagCounts: Record<string, number> = {};
    for (const id of interests) {
      const tag = INTERESTS.find((i) => i.id === id)?.tag;
      if (tag) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
    const topTag =
      Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "builder";
    const archetype = ARCHETYPES[topTag];
    const matchScore = Math.min(
      98,
      60 + interests.length * 4 + skills.length * 3
    );
    const finalResult: PersonaResult = {
      archetype: archetype.name,
      description: archetype.description,
      topSkills: skills.slice(0, 4),
      matchScore,
      recommendedSocietyIds: archetype.societyIds,
    };
    setResult(finalResult);
    saveQuizResult(finalResult);
    setStep(2);
  }

  return (
    <Modal title="Onboarding Quiz" onClose={onClose}>
      {step === 0 && (
        <div>
          <p className="mb-4 text-sm text-muted">
            What are you most interested in? Pick as many as you like.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map((i) => {
              const active = interests.includes(i.id);
              return (
                <button
                  key={i.id}
                  onClick={() => toggle(interests, setInterests, i.id)}
                  className="rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    backgroundColor: active ? "var(--accent-soft)" : "var(--surface-2)",
                    color: active ? "var(--accent-text)" : "var(--foreground)",
                  }}
                >
                  {i.label}
                </button>
              );
            })}
          </div>
          <button
            disabled={interests.length === 0}
            onClick={() => setStep(1)}
            className="mt-5 w-full rounded-2xl bg-accent py-3 text-sm font-bold text-navy transition disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="mb-4 text-sm text-muted">
            Which of these describe your strengths?
          </p>
          <div className="flex flex-col gap-2">
            {SKILLS.map((s) => {
              const active = skills.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggle(skills, setSkills, s)}
                  className="flex items-center justify-between rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    backgroundColor: active ? "var(--accent-soft)" : "var(--surface-2)",
                    color: active ? "var(--accent-text)" : "var(--foreground)",
                  }}
                >
                  {s}
                  {active && <Sparkles className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          <button
            disabled={skills.length === 0}
            onClick={computeResult}
            className="mt-5 w-full rounded-2xl bg-accent py-3 text-sm font-bold text-navy transition disabled:opacity-40"
          >
            See my persona match
          </button>
        </div>
      )}

      {step === 2 && result && (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
            <Sparkles className="h-8 w-8 text-navy" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Your persona match
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-navy">{result.archetype}</h3>
          <p className="mt-2 text-sm text-muted">{result.description}</p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-surface-2 py-3">
            <p className="text-2xl font-extrabold text-navy">{result.matchScore}%</p>
            <p className="text-xs text-muted">match confidence</p>
          </div>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-accent py-3 text-sm font-bold text-navy transition"
          >
            Explore recommended societies
          </button>
        </div>
      )}
    </Modal>
  );
}
