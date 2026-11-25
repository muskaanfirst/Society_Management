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
  const showQuiz =
    ready && currentUser?.role === "student" && !personaResult && !dismissedQuiz;

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

  if (!ready || !currentUser || currentUser.role !== "student") {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 pb-28">{children}</main>
      <BottomNav items={NAV_ITEMS} />
      {showQuiz && (
        <OnboardingQuiz
          onClose={() => setDismissedQuiz(true)}
        />
      )}
    </div>
  );
}
