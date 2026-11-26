"use client";

import { useEffect, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { DynamicIcon } from "@/components/DynamicIcon";
import { apiFetch } from "@/lib/api";
import { pastelBgFor } from "@/components/pastelAccents";
import { useApp } from "@/lib/store";
import type { Society } from "@/lib/types";

export default function ManagerProfilePage() {
  const { currentUser } = useApp();
  const [society, setSociety] = useState<Society | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    apiFetch<{ societies: Society[] }>("/api/societies").then((r) =>
      setSociety(r.societies.find((s) => s.managerId === currentUser.id) ?? null)
    );
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div>
      <TopBar title="Profile" />
      <div className="px-4 pt-4">
        <div className="flex flex-col items-center rounded-3xl border border-black/5 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
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
          <span className="mt-2 flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-text">
            <ShieldCheck className="h-3.5 w-3.5" /> Society Manager
          </span>
        </div>

        {society && (
          <div className={`mt-5 overflow-hidden rounded-3xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${pastelBgFor(society.id)}`}>
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                <DynamicIcon name={society.icon} className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-foreground/60">Managing</p>
                <p className="text-sm font-bold text-foreground">{society.name}</p>
                <p className="text-xs text-foreground/70">{society.tagline}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
