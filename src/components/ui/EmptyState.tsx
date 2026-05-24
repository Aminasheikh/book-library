import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center",
        className,
      )}
    >
      {icon && (
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-mesh blur-3xl opacity-60" aria-hidden="true" />
          <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl glass-strong text-brand-violet">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      {description && (
        <p className="text-sm text-fg-muted mt-1.5 max-w-sm text-balance">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
