import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  showLabel,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full rounded-full bg-surface/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-pink transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-fg-subtle mt-1.5">
          <span>{pct}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
