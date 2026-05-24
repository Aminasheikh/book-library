"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, History, Tags, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/",          label: "Home",  icon: LayoutDashboard },
  { href: "/library",   label: "Books", icon: Library },
  { href: "/borrowing", label: "Lent",  icon: History },
  { href: "/categories",label: "Tags",  icon: Tags },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <>
      {/* Top brand bar on mobile */}
      <header className="lg:hidden sticky top-0 z-40 px-4 pt-4">
        <div className="glass-strong rounded-2xl flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2.5 focus-ring rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-violet via-brand-cyan to-brand-pink flex items-center justify-center shadow-glow">
              <BookOpen className="h-4 w-4 text-white" strokeWidth={2.25} />
            </div>
            <span className="font-bold tracking-tight">Lumen Library</span>
          </Link>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav
        aria-label="Primary"
        className="lg:hidden fixed bottom-3 left-3 right-3 z-40 glass-strong rounded-2xl grid grid-cols-4 p-1.5"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-medium cursor-pointer transition-colors",
                active
                  ? "text-fg bg-surface/70"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon
                className={cn("h-[18px] w-[18px]", active && "text-brand-violet")}
                strokeWidth={1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
