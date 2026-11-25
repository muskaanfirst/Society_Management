"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, ShieldCheck, ArrowRight, Users } from "lucide-react";
import { useApp } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = /^[a-zA-Z0-9._%+-]+@thapar\.edu$/.test(email.trim());

  function handleContinue() {
    if (!isValidEmail) {
      setError("Please enter a valid @thapar.edu email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const user = loginAs("student");
    setTimeout(() => router.push(user.role === "student" ? "/student" : "/manager"), 350);
  }

  function handleBypass(role: "student" | "manager") {
    const user = loginAs(role);
    router.push(role === "student" ? "/student" : "/manager");
    void user;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy shadow-md">
            <Users className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">SocMag</h1>
          <p className="mt-1.5 text-sm text-muted">
            Your gateway to every society on campus.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="h-1.5 w-full bg-accent" />
          <div className="p-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">
              Campus email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                placeholder="yourname@thapar.edu"
                className="w-full rounded-2xl border border-slate-200 bg-surface-2 py-3 pl-10 pr-3 text-sm text-navy placeholder:text-muted/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
            {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-navy transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Lab demo shortcuts
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleBypass("student")}
                className="flex flex-col items-center gap-2.5 rounded-2xl bg-slate-card px-3 py-5 text-center shadow-sm transition hover:brightness-105 active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                  <GraduationCap className="h-5 w-5 text-navy" />
                </span>
                <span className="text-xs font-bold text-white">Login as Student</span>
              </button>
              <button
                onClick={() => handleBypass("manager")}
                className="flex flex-col items-center gap-2.5 rounded-2xl bg-slate-card px-3 py-5 text-center shadow-sm transition hover:brightness-105 active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-navy" />
                </span>
                <span className="text-xs font-bold text-white">Login as Manager</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Prototype build — mock data only, no real authentication.
        </p>
      </div>
    </div>
  );
}
