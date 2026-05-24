"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Library,
  History,
  Tags,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/library",   label: "Library",   icon: Library },
  { href: "/borrowing", label: "Borrowing", icon: History },
  { href: "/categories",label: "Categories",icon: Tags },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-4 top-4 bottom-4 w-64 flex-col z-30">
      <div className="glass-strong rounded-3xl flex-1 flex flex-col p-5">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 mb-8 px-2 group focus-ring rounded-lg"
          aria-label="Lumen Library — Dashboard"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-violet via-brand-cyan to-brand-pink blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-brand-violet via-brand-cyan to-brand-pink flex items-center justify-center shadow-glow">
              <BookOpen className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">Lumen</span>
            <span className="text-[10px] text-fg-subtle font-medium uppercase tracking-widest">
              Library
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer focus-ring",
                  active
                    ? "text-fg"
                    : "text-fg-muted hover:text-fg hover:bg-surface/40",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl glass border-brand-violet/40"
                    style={{ background: "linear-gradient(120deg, hsl(var(--grad-from)/0.18), hsl(var(--grad-via)/0.12), hsl(var(--grad-to)/0.18))" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px] relative" strokeWidth={1.75} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer promo */}
        <div className="mt-4 relative overflow-hidden rounded-2xl p-4 border border-border-strong/60">
          <div className="absolute inset-0 bg-mesh opacity-40" aria-hidden="true" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-pink" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-pink">
                Pro tip
              </span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-mono">/</kbd> anywhere to search instantly.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
