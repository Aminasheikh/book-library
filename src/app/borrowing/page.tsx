"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  History,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookCover } from "@/components/books/BookCover";
import { useLibrary } from "@/lib/store";
import { formatDate, formatRelative, isOverdue, initials, hashHue, daysBetween } from "@/lib/utils";

type FilterStatus = "" | "active" | "overdue" | "returned";

export default function BorrowingPage() {
  const books = useLibrary((s) => s.books);
  const borrows = useLibrary((s) => s.borrows);
  const returnBook = useLibrary((s) => s.returnBook);
  const deleteBorrow = useLibrary((s) => s.deleteBorrow);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("");

  const stats = useMemo(() => {
    const active = borrows.filter((r) => !r.returned_at);
    const overdue = active.filter((r) => isOverdue(r.due_at, r.returned_at));
    return {
      active: active.length,
      overdue: overdue.length,
      returned: borrows.length - active.length,
      total: borrows.length,
    };
  }, [borrows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = borrows;

    if (filter === "active")   list = list.filter((r) => !r.returned_at && !isOverdue(r.due_at, r.returned_at));
    if (filter === "overdue")  list = list.filter((r) => isOverdue(r.due_at, r.returned_at));
    if (filter === "returned") list = list.filter((r) => !!r.returned_at);

    if (q) {
      list = list.filter((r) => {
        const book = books.find((b) => b.id === r.book_id);
        return (
          r.borrower_name.toLowerCase().includes(q) ||
          (book?.title ?? "").toLowerCase().includes(q) ||
          (book?.author ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list.sort((a, b) => b.lent_at.localeCompare(a.lent_at));
  }, [borrows, books, query, filter]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Lending history"
        title={
          <>
            Books on <span className="gradient-text">the move</span>
          </>
        }
        subtitle="Track every book you've lent — past and present."
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="All time"  value={stats.total}    tone="violet" icon={<History className="h-4 w-4" />} />
        <MiniStat label="Active"    value={stats.active}   tone="cyan"   icon={<Clock3 className="h-4 w-4" />} />
        <MiniStat label="Overdue"   value={stats.overdue}  tone="rose"   icon={<AlertTriangle className="h-4 w-4" />} warn={stats.overdue > 0} />
        <MiniStat label="Returned"  value={stats.returned} tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-3 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by person or book…"
            leftIcon={<Search className="h-4 w-4" />}
            type="search"
          />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as FilterStatus)}>
          <option value="">All records</option>
          <option value="active">Currently lent</option>
          <option value="overdue">Overdue only</option>
          <option value="returned">Returned only</option>
        </Select>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<History className="h-7 w-7" />}
          title={borrows.length === 0 ? "No lending history yet" : "No records match"}
          description={
            borrows.length === 0
              ? "When you lend a book to a friend, the record shows up here."
              : "Try changing the filter or search."
          }
          action={
            borrows.length === 0 ? (
              <Link href="/library">
                <Button variant="primary">Browse library</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <ol className="relative space-y-3 pl-1">
          {filtered.map((r, i) => {
            const book = books.find((b) => b.id === r.book_id);
            const overdue = isOverdue(r.due_at, r.returned_at);
            const hue = hashHue(r.borrower_name);
            const durationDays = r.returned_at
              ? daysBetween(r.lent_at, r.returned_at)
              : daysBetween(r.lent_at);
            return (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card className="!p-4">
                  <div className="flex items-start gap-4">
                    {book && (
                      <Link href={`/library/${book.id}`} className="shrink-0 focus-ring rounded-md">
                        <BookCover
                          title={book.title}
                          author={book.author}
                          coverUrl={book.cover_url}
                          size="sm"
                        />
                      </Link>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          {book ? (
                            <Link
                              href={`/library/${book.id}`}
                              className="font-semibold text-sm hover:gradient-text transition-colors"
                            >
                              {book.title}
                            </Link>
                          ) : (
                            <span className="font-semibold text-sm text-fg-subtle italic">
                              Book deleted
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{
                                background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 45%))`,
                              }}
                              aria-hidden="true"
                            >
                              {initials(r.borrower_name)}
                            </div>
                            <span className="text-sm text-fg-muted">{r.borrower_name}</span>
                            {r.borrower_contact && (
                              <span className="text-xs text-fg-subtle hidden sm:inline">
                                · {r.borrower_contact}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {r.returned_at ? (
                            <Badge tone="emerald">
                              <CheckCircle2 className="h-3 w-3" />
                              Returned
                            </Badge>
                          ) : overdue ? (
                            <Badge tone="rose">
                              <AlertTriangle className="h-3 w-3" />
                              {Math.abs(daysBetween(r.due_at!, new Date()))} days overdue
                            </Badge>
                          ) : (
                            <Badge tone="amber">
                              <Clock3 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <Info label="Lent"      value={formatDate(r.lent_at)} />
                        <Info label="Due"       value={r.due_at ? formatDate(r.due_at) : "—"} />
                        <Info
                          label={r.returned_at ? "Returned" : "Duration"}
                          value={
                            r.returned_at
                              ? formatDate(r.returned_at)
                              : `${durationDays} day${durationDays !== 1 ? "s" : ""} out`
                          }
                        />
                      </div>

                      {r.notes && (
                        <p className="mt-3 text-xs italic text-fg-subtle">
                          &ldquo;{r.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                        {!r.returned_at && (
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            onClick={() => {
                              returnBook(r.id);
                              toast.success(`${r.borrower_name} returned the book`);
                            }}
                          >
                            Mark returned
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => {
                            deleteBorrow(r.id);
                            toast.success("Record removed");
                          }}
                          className="text-brand-rose/80 hover:text-brand-rose hover:bg-brand-rose/10 ml-auto"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </ol>
      )}
    </AppShell>
  );
}

function MiniStat({
  label,
  value,
  tone,
  icon,
  warn,
}: {
  label: string;
  value: number;
  tone: "violet" | "cyan" | "rose" | "emerald";
  icon: React.ReactNode;
  warn?: boolean;
}) {
  const colors = {
    violet:  "text-brand-violet",
    cyan:    "text-brand-cyan",
    rose:    "text-brand-rose",
    emerald: "text-brand-emerald",
  };
  return (
    <div className="glass rounded-2xl p-4">
      <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg bg-surface/60 mb-2 ${colors[tone]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-fg-subtle uppercase tracking-wider mt-0.5">
        {label}
        {warn && <span className="ml-1 text-brand-rose">●</span>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className="text-sm font-medium text-fg mt-0.5">{value}</div>
    </div>
  );
}
