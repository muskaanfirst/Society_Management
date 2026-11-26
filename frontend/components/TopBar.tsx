"use client";

import { useRouter } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { useApp } from "@/lib/store";

export function TopBar({ title }: { title: string }) {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3.5 lg:max-w-5xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy shadow-sm">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-navy">{title}</p>
            {currentUser && (
              <p className="text-[11px] leading-tight text-muted">{currentUser.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-danger-soft hover:text-danger"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
