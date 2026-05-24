import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "violet" | "cyan" | "pink" | "emerald" | "amber" | "rose" | "indigo";

const toneClass: Record<Tone, string> = {
  default: "bg-surface text-fg-muted border-border",
  violet:  "bg-brand-violet/15 text-brand-violet border-brand-violet/30",
  cyan:    "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  pink:    "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
  emerald: "bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30",
  amber:   "bg-brand-amber/15 text-brand-amber border-brand-amber/30",
  rose:    "bg-brand-rose/15 text-brand-rose border-brand-rose/30",
  indigo:  "bg-brand-indigo/15 text-brand-indigo border-brand-indigo/30",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
