"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full h-11 rounded-xl bg-surface/60 border border-border pl-4 pr-10 text-sm text-fg appearance-none cursor-pointer",
          "transition-colors duration-200",
          "focus:outline-none focus:border-brand-violet/70 focus:bg-surface focus:ring-2 focus:ring-brand-violet/20",
          invalid && "border-brand-rose/60 focus:border-brand-rose focus:ring-brand-rose/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});
