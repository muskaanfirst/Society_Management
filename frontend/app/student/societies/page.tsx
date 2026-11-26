"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Users2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { DynamicIcon } from "@/components/DynamicIcon";
import { apiFetch } from "@/lib/api";
import { pastelBgFor } from "@/components/pastelAccents";
import { useApp } from "@/lib/store";
import type { Society, SocietyType } from "@/lib/types";

const FILTERS: { label: string; value: SocietyType | "ALL" | "TOP_MATCHES" }[] = [
  { label: "All", value: "ALL" },
  { label: "Tech", value: "TECH" },
  { label: "Non-Tech", value: "NON_TECH" },
  { label: "Top Matches", value: "TOP_MATCHES" },
];

export default function SocietiesPage() {
  const { personaResult } = useApp();
  const [filter, setFilter] = useState<SocietyType | "ALL" | "TOP_MATCHES">("ALL");
  const [societies, setSocieties] = useState<Society[] | null>(null);

  useEffect(() => {
    apiFetch<{ societies: Society[] }>("/api/societies").then((r) => setSocieties(r.societies));
  }, []);

  const filtered = useMemo(() => {
    if (!societies) return [];
    if (filter === "ALL") return societies;
    if (filter === "TOP_MATCHES") {
      if (!personaResult) return [];
      return societies.filter((s) => personaResult.recommendedSocietyIds.includes(s.id));
    }
    return societies.filter((s) => s.type === filter);
  }, [societies, filter, personaResult]);

  return (
    <div>
      <TopBar title="Societies" />
      <div className="px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition active:scale-95"
              style={{
                borderColor: filter === f.value ? "var(--foreground)" : "var(--border)",
                backgroundColor: filter === f.value ? "var(--foreground)" : "transparent",
                color: filter === f.value ? "#ffffff" : "var(--muted)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!societies ? (
          <p className="mt-8 text-center text-sm text-muted">Loading societies…</p>
        ) : filter === "TOP_MATCHES" && !personaResult ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <p className="text-sm font-bold text-navy">No matches yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted">
              Take the onboarding quiz on your Profile to see your top matched societies here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((society) => (
              <Link
                key={society.id}
                href={`/student/societies/${society.id}`}
                className={`flex items-center gap-3.5 rounded-3xl p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] ${pastelBgFor(society.id)}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <DynamicIcon name={society.icon} className="h-6 w-6 text-navy" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{society.name}</p>
                    <span className="shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold text-foreground">
                      {society.type === "TECH" ? "Tech" : "Non-Tech"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-foreground/70">{society.tagline}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground/60">
                    <Users2 className="h-3 w-3" />
                    {society.memberCount} members
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/50" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
