"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, CalendarDays, Ticket, UserRound } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { OnboardingQuiz } from "@/components/OnboardingQuiz";
import { useApp } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/student/societies", label: "Societies", icon: Compass },
  { href: "/student/feed", label: "Feed", icon: CalendarDays },
  { href: "/student/slots", label: "Slots", icon: Ticket },
  { href: "/student/profile", label: "Profile", icon: UserRound },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, personaResult, ready } = useApp();
  const [dismissedQuiz, setDismissedQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser.role !== "student") {
      router.replace("/manager");
    }
  }, [ready, currentUser, router]);

  useEffect(() => {
    // Only decides whether to POP THE QUIZ OPEN for a student who hasn't
    // taken it yet. Once open, it must stay open through its own "computing"
    // and "result" steps even after personaResult gets saved mid-flow --
    // deriving showQuiz straight from `!personaResult` would unmount the
    // modal the instant the result lands, before the result screen ever paints.
    if (ready && currentUser?.role === "student" && !personaResult && !dismissedQuiz) {
      // One-time latch sync from async state (store hydration + the first
      // render where personaResult is known), not a derived render value --
      // same documented exception as the hydration effect in lib/store.tsx.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowQuiz(true);
    }
  }, [ready, currentUser, personaResult, dismissedQuiz]);

  if (!ready || !currentUser || currentUser.role !== "student") {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 pb-28 lg:max-w-5xl">{children}</main>
      <BottomNav items={NAV_ITEMS} />
      {showQuiz && (
        <OnboardingQuiz
          onClose={() => {
            setShowQuiz(false);
            setDismissedQuiz(true);
          }}
        />
      )}
    </div>
  );
}
