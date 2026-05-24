"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-72 pb-24 lg:pb-8 pt-4 lg:pt-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 lg:pt-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
