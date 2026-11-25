"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCcw, Sparkles, Hash } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { OnboardingQuiz } from "@/components/OnboardingQuiz";
import { DynamicIcon } from "@/components/DynamicIcon";
import { societies } from "@/lib/mockData";
import { useApp } from "@/lib/store";

export default function ProfilePage() {
  const { currentUser, personaResult } = useApp();
  const [showQuiz, setShowQuiz] = useState(false);

  if (!currentUser) return null;

  return (
    <div>
      <TopBar title="Profile" />
      <div className="px-4 pt-4">
        <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-extrabold text-white">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <h1 className="mt-3 text-lg font-extrabold text-navy">{currentUser.name}</h1>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Mail className="h-3.5 w-3.5" /> {currentUser.email}
          </p>
          {currentUser.rollNo && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Hash className="h-3.5 w-3.5" /> {currentUser.rollNo}
            </p>
          )}
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl bg-slate-card shadow-sm">
          <div className="h-1.5 w-full bg-accent" />
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                Persona Match
              </p>
              <button
                onClick={() => setShowQuiz(true)}
                className="flex items-center gap-1 text-xs font-bold text-white"
              >
                <RefreshCcw className="h-3 w-3" /> Retake
              </button>
            </div>

            {personaResult ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <Sparkles className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-white">{personaResult.archetype}</p>
                    <p className="text-xs text-white/70">{personaResult.matchScore}% match confidence</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                  {personaResult.description}
                </p>

                {personaResult.topSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {personaResult.topSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-white/70">
                  Recommended for you
                </p>
                <div className="flex flex-col gap-2">
                  {personaResult.recommendedSocietyIds.map((id) => {
                    const s = societies.find((soc) => soc.id === id);
                    if (!s) return null;
                    return (
                      <Link
                        key={id}
                        href={`/student/societies/${id}`}
                        className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 shadow-sm transition hover:brightness-95"
                      >
                        <DynamicIcon name={s.icon} className="h-4 w-4 text-navy" />
                        <span className="text-sm font-semibold text-navy">{s.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-navy"
              >
                Take the Onboarding Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {showQuiz && <OnboardingQuiz onClose={() => setShowQuiz(false)} />}
    </div>
  );
}
