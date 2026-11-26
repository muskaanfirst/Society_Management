"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, ClipboardCheck, UserRound } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/manager/society", label: "My Society", icon: Building2 },
  { href: "/manager/feed", label: "Feed", icon: CalendarDays },
  { href: "/manager/grading", label: "Grading", icon: ClipboardCheck },
  { href: "/manager/profile", label: "Profile", icon: UserRound },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, ready } = useApp();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser.role !== "manager") {
      router.replace("/student");
    }
  }, [ready, currentUser, router]);

  if (!ready || !currentUser || currentUser.role !== "manager") {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 pb-28 lg:max-w-5xl">{children}</main>
      <BottomNav items={NAV_ITEMS} />
    </div>
  );
}
