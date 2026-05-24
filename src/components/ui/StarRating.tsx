"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 18,
  readOnly,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`Rating: ${value ?? 0} out of 5`}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n === value ? 0 : n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={cn(
              "star rounded-md p-0.5 focus-ring",
              !readOnly && "cursor-pointer hover:scale-110",
              active && "active",
            )}
          >
            <Star
              width={size}
              height={size}
              strokeWidth={1.5}
              fill={active ? "currentColor" : "transparent"}
              className={active ? "text-brand-pink" : "text-fg-subtle"}
            />
          </button>
        );
      })}
    </div>
  );
}
