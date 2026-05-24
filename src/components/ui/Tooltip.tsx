"use client";

import { useState, type ReactNode } from "react";

export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap text-xs font-medium px-2.5 py-1.5 rounded-lg glass-strong shadow-glass ${
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
