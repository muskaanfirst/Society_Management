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
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around gap-1 rounded-full bg-foreground p-1.5 shadow-lg shadow-black/20">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-full py-2.5 transition-colors"
              style={{
                backgroundColor: active ? "rgba(255,255,255,0.14)" : "transparent",
              }}
            >
              <Icon
                className="h-5 w-5 transition-colors"
                style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.45)" }}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className="text-[11px] font-semibold transition-colors"
                style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.45)" }}
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
