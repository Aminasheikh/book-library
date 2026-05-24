"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpenCheck,
  BookMarked,
  Clock3,
  AlertTriangle,
  Plus,
  Sparkles,
  Library as LibraryIcon,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookCover } from "@/components/books/BookCover";
import { StatusBadge } from "@/components/books/StatusBadge";
import { useLibrary, useEnrichedBooks } from "@/lib/store";
import { formatDate, formatRelative, isOverdue, initials, hashHue } from "@/lib/utils";

export default function DashboardPage() {
  const books = useEnrichedBooks();
  const categories = useLibrary((s) => s.categories);
  const borrows = useLibrary((s) => s.borrows);

  const stats = useMemo(() => {
    const reading = books.filter((b) => b.status === "reading").length;
    const completed = books.filter((b) => b.status === "completed").length;
    const lent = books.filter((b) => b.status === "lent").length;
    const overdue = borrows.filter((r) =>
      isOverdue(r.due_at, r.returned_at),
    ).length;
    const totalPages = books.reduce(
      (sum, b) => sum + Math.round(((b.total_pages ?? 0) * b.progress) / 100),
      0,
    );
    return { total: books.length, reading, completed, lent, overdue, totalPages };
  }, [books, borrows]);

  const categoryData = useMemo(
    () =>
      categories
        .map((c) => ({
          name: c.name,
          value: books.filter((b) => b.category_id === c.id).length,
          color: c.color,
        }))
        .filter((d) => d.value > 0),
    [categories, books],
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: string; added: number; completed: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      months.push({
        month: d.toLocaleString("en", { month: "short" }),
        added: books.filter(
          (b) => new Date(b.added_at) >= d && new Date(b.added_at) < next,
        ).length,
        completed: books.filter(
          (b) =>
            b.status === "completed" &&
            new Date(b.updated_at) >= d &&
            new Date(b.updated_at) < next,
        ).length,
      });
    }
    return months;
  }, [books]);

  const currentlyReading = books
    .filter((b) => b.status === "reading")
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 3);

  const recentActivity = [...borrows]
    .sort((a, b) => b.lent_at.localeCompare(a.lent_at))
    .slice(0, 5);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Welcome back"
        title={
          <>
            Your reading <span className="gradient-text">universe</span>
          </>
        }
        subtitle="A snapshot of every book you own, are reading, or have lent out."
        actions={
          <Link href="/library">
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Add Book
            </Button>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          tone="violet"
          icon={<LibraryIcon className="h-5 w-5" />}
          label="Total Books"
          value={stats.total}
          hint={`${stats.totalPages.toLocaleString()} pages read`}
        />
        <StatCard
          tone="cyan"
          icon={<BookOpenCheck className="h-5 w-5" />}
          label="Currently Reading"
          value={stats.reading}
          hint={stats.completed > 0 ? `${stats.completed} completed` : "Start a new one"}
        />
        <StatCard
          tone="amber"
          icon={<BookMarked className="h-5 w-5" />}
          label="Lent Out"
          value={stats.lent}
          hint="Track returns below"
        />
        <StatCard
          tone="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Overdue"
          value={stats.overdue}
          hint={stats.overdue > 0 ? "Needs attention" : "All caught up"}
          warn={stats.overdue > 0}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Category distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Library Composition</CardTitle>
              <CardDescription>How your books split across categories.</CardDescription>
            </div>
            <Badge tone="violet">
              <Sparkles className="h-3 w-3" />
              {categoryData.length} categories
            </Badge>
          </CardHeader>

          {categoryData.length === 0 ? (
            <EmptyState
              title="No data yet"
              description="Add books and assign categories to see your library mix."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="hsl(var(--bg))"
                      strokeWidth={3}
                    >
                      {categoryData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        background: "hsl(var(--surface-strong))",
                        border: "1px solid hsl(var(--border-strong))",
                        borderRadius: "12px",
                        color: "hsl(var(--fg))",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {categoryData.map((d) => {
                  const pct = Math.round((d.value / stats.total) * 100);
                  return (
                    <li
                      key={d.name}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-surface/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            background: d.color,
                            boxShadow: `0 0 8px ${d.color}80`,
                          }}
                        />
                        <span className="text-sm font-medium truncate">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-fg-subtle tabular-nums">{pct}%</span>
                        <span className="text-sm font-semibold tabular-nums w-6 text-right">
                          {d.value}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>

        {/* Activity bar */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Reading Activity</CardTitle>
              <CardDescription>Books added vs. completed.</CardDescription>
            </div>
            <Badge tone="cyan">
              <TrendingUp className="h-3 w-3" />
              6 mo
            </Badge>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(var(--fg-subtle))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--fg-subtle))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RTooltip
                  cursor={{ fill: "hsl(var(--surface) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--surface-strong))",
                    border: "1px solid hsl(var(--border-strong))",
                    borderRadius: "12px",
                    color: "hsl(var(--fg))",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="added" fill="url(#addedGrad)" radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar
                  dataKey="completed"
                  fill="url(#completedGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Currently reading + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Currently Reading</CardTitle>
              <CardDescription>Pick up where you left off.</CardDescription>
            </div>
            <Link href="/library?status=reading">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                View all
              </Button>
            </Link>
          </CardHeader>

          {currentlyReading.length === 0 ? (
            <EmptyState
              icon={<BookOpenCheck className="h-7 w-7" />}
              title="No books in progress"
              description="Mark a book as reading to track its progress here."
              action={
                <Link href="/library">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                    Browse library
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {currentlyReading.map((b, i) => (
                <motion.li
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={`/library/${b.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface/40 transition-colors cursor-pointer focus-ring group"
                  >
                    <BookCover
                      title={b.title}
                      author={b.author}
                      coverUrl={b.cover_url}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h4 className="font-semibold text-sm truncate group-hover:gradient-text transition-colors">
                          {b.title}
                        </h4>
                        <span className="text-xs text-fg-subtle tabular-nums shrink-0">
                          {b.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-fg-muted mb-2 truncate">{b.author}</p>
                      <Progress value={b.progress} />
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Lending timeline.</CardDescription>
            </div>
          </CardHeader>

          {recentActivity.length === 0 ? (
            <EmptyState
              icon={<Clock3 className="h-7 w-7" />}
              title="No activity yet"
              description="Lend a book to start a borrowing timeline."
            />
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((r) => {
                const book = books.find((b) => b.id === r.book_id);
                const overdue = isOverdue(r.due_at, r.returned_at);
                const hue = hashHue(r.borrower_name);
                return (
                  <li key={r.id} className="flex gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 45%))`,
                      }}
                      aria-hidden="true"
                    >
                      {initials(r.borrower_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-tight">
                        <span className="font-semibold">{r.borrower_name}</span>
                        <span className="text-fg-muted">
                          {" "}
                          {r.returned_at ? "returned" : "borrowed"}{" "}
                        </span>
                        <span className="font-medium">{book?.title ?? "a book"}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-fg-subtle">
                          {formatRelative(r.returned_at ?? r.lent_at)}
                        </span>
                        {overdue && (
                          <Badge tone="rose">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Overdue
                          </Badge>
                        )}
                        {r.returned_at && (
                          <Badge tone="emerald">Returned</Badge>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  tone,
  icon,
  label,
  value,
  hint,
  warn,
}: {
  tone: "violet" | "cyan" | "amber" | "rose";
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  warn?: boolean;
}) {
  const toneMap = {
    violet: "from-brand-violet/30 to-brand-violet/0 text-brand-violet",
    cyan:   "from-brand-cyan/30 to-brand-cyan/0 text-brand-cyan",
    amber:  "from-brand-amber/30 to-brand-amber/0 text-brand-amber",
    rose:   "from-brand-rose/30 to-brand-rose/0 text-brand-rose",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className={`absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl bg-gradient-radial ${toneMap[tone]} opacity-60`}
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div
              className={`h-10 w-10 rounded-xl glass flex items-center justify-center ${toneMap[
                tone
              ]
                .split(" ")
                .pop()}`}
            >
              {icon}
            </div>
            {warn && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-rose">
                Action
              </span>
            )}
          </div>
          <div className="text-3xl font-bold tabular-nums tracking-tight">{value}</div>
          <div className="text-xs text-fg-subtle uppercase tracking-wider font-medium mt-1">
            {label}
          </div>
          {hint && <div className="text-xs text-fg-muted mt-2">{hint}</div>}
        </div>
      </Card>
    </motion.div>
  );
}
