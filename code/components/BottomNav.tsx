"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around gap-1 rounded-3xl border border-slate-200 bg-white/95 p-1.5 shadow-lg shadow-slate-900/10 backdrop-blur-md">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors"
              style={{
                backgroundColor: active ? "var(--foreground)" : "transparent",
              }}
            >
              <Icon
                className="h-5 w-5 transition-colors"
                style={{ color: active ? "#ffffff" : "#94a3b8" }}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className="text-[11px] font-semibold transition-colors"
                style={{ color: active ? "#ffffff" : "#94a3b8" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
