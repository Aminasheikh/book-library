"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, hashHue } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClass: Record<Size, string> = {
  xs: "w-10 h-14",
  sm: "w-16 h-24",
  md: "w-24 h-36",
  lg: "w-36 h-52",
  xl: "w-48 h-72",
};

const textSize: Record<Size, string> = {
  xs: "text-[7px]",
  sm: "text-[9px]",
  md: "text-[11px]",
  lg: "text-sm",
  xl: "text-base",
};

export function BookCover({
  title,
  author,
  coverUrl,
  size = "md",
  className,
  shine = true,
}: {
  title: string;
  author: string;
  coverUrl?: string | null;
  size?: Size;
  className?: string;
  shine?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = coverUrl && !errored;
  const hue = hashHue(title + author);

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden shrink-0 shadow-glass-lg",
        sizeClass[size],
        className,
      )}
      style={{
        boxShadow:
          "inset -2px 0 4px rgba(0,0,0,0.4), inset 2px 0 0 rgba(255,255,255,0.06), 0 12px 24px -8px rgba(0,0,0,0.5)",
      }}
    >
      {/* Spine highlight */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-black/40 to-transparent z-10"
      />

      {showImage ? (
        <Image
          src={coverUrl!}
          alt={`${title} by ${author}`}
          fill
          sizes="200px"
          className="object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col justify-between p-2 text-white"
          style={{
            background: `linear-gradient(135deg,
              hsl(${hue} 70% 35%) 0%,
              hsl(${(hue + 40) % 360} 65% 25%) 50%,
              hsl(${(hue + 80) % 360} 75% 20%) 100%)`,
          }}
        >
          <div
            className={cn(
              "font-bold leading-tight tracking-tight line-clamp-4 drop-shadow",
              textSize[size],
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              "opacity-80 leading-tight line-clamp-2",
              textSize[size],
            )}
            style={{ fontSize: `calc(${textSize[size] === "text-base" ? "1rem" : "0.7rem"})` }}
          >
            {author}
          </div>
        </div>
      )}

      {/* Glass shine overlay */}
      {shine && (
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 45%, transparent 60%)",
          }}
        />
      )}
    </div>
  );
}
