import Link from "next/link";
import { BookX } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <AppShell>
      <EmptyState
        icon={<BookX className="h-7 w-7" />}
        title="Page not found"
        description="That page seems to have wandered off the shelf."
        action={
          <Link href="/">
            <Button variant="primary">Back to dashboard</Button>
          </Link>
        }
      />
    </AppShell>
  );
}
