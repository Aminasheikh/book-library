import { Badge } from "@/components/ui/Badge";
import type { BookStatus } from "@/lib/types";

const config: Record<BookStatus, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  reading:   { label: "Reading",   tone: "violet" },
  completed: { label: "Completed", tone: "emerald" },
  wishlist:  { label: "Wishlist",  tone: "cyan" },
  lent:      { label: "Lent out",  tone: "amber" },
};

export function StatusBadge({ status }: { status: BookStatus }) {
  const { label, tone } = config[status];
  return (
    <Badge tone={tone}>
      <span className="h-1.5 w-1.5 rounded-full bg-current status-dot" />
      {label}
    </Badge>
  );
}
