"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Send,
  CheckCircle2,
  BookOpen,
  Calendar,
  Hash,
  Tag,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { BookCover } from "@/components/books/BookCover";
import { StatusBadge } from "@/components/books/StatusBadge";
import { BookForm } from "@/components/books/BookForm";
import { LendForm } from "@/components/books/LendForm";
import { useLibrary, useEnrichedBooks } from "@/lib/store";
import { formatDate, formatRelative, isOverdue, initials, hashHue } from "@/lib/utils";

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const books = useEnrichedBooks();
  const allBorrows = useLibrary((s) => s.borrows);
  const updateBook = useLibrary((s) => s.updateBook);
  const deleteBook = useLibrary((s) => s.deleteBook);
  const returnBook = useLibrary((s) => s.returnBook);

  const book = books.find((b) => b.id === id);
  const history = useMemo(
    () =>
      allBorrows
        .filter((r) => r.book_id === id)
        .sort((a, b) => b.lent_at.localeCompare(a.lent_at)),
    [allBorrows, id],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [lendOpen, setLendOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!book) {
    return (
      <AppShell>
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="Book not found"
          description="This book may have been deleted."
          action={
            <Link href="/library">
              <Button variant="primary">Back to library</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  function onProgressChange(v: number) {
    updateBook(book!.id, {
      progress: v,
      status: v >= 100 ? "completed" : v > 0 && book!.status !== "lent" ? "reading" : book!.status,
    });
  }

  function onRate(v: number) {
    updateBook(book!.id, { rating: v });
    if (v) toast.success(`Rated ${v} star${v > 1 ? "s" : ""}`);
  }

  function onDelete() {
    deleteBook(book!.id);
    toast.success("Book removed");
    router.push("/library");
  }

  function onReturn(rid: string) {
    returnBook(rid);
    toast.success("Book marked as returned");
  }

  return (
    <AppShell>
      {/* Back link */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6 cursor-pointer focus-ring rounded px-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cover + actions */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-6 sticky top-4"
          >
            <div className="shelf-3d flex justify-center mb-6">
              <div className="book-3d">
                <BookCover
                  title={book.title}
                  author={book.author}
                  coverUrl={book.cover_url}
                  size="xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {book.status === "lent" ? (
                history[0] && !history[0].returned_at ? (
                  <Button
                    variant="primary"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={() => onReturn(history[0].id)}
                  >
                    Mark as returned
                  </Button>
                ) : null
              ) : (
                <Button
                  variant="primary"
                  leftIcon={<Send className="h-4 w-4" />}
                  onClick={() => setLendOpen(true)}
                >
                  Lend to a friend
                </Button>
              )}
              <Button
                variant="secondary"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => setEditOpen(true)}
              >
                Edit details
              </Button>
              <Button
                variant="ghost"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setConfirmDelete(true)}
                className="text-brand-rose/80 hover:text-brand-rose hover:bg-brand-rose/10"
              >
                Delete book
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card>
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <StatusBadge status={book.status} />
                {book.category && (
                  <Badge tone="violet">
                    <Tag className="h-3 w-3" />
                    {book.category.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                {book.title}
              </h1>
              <p className="text-lg text-fg-muted mt-1">by {book.author}</p>

              <div className="flex items-center gap-6 mt-4 flex-wrap text-sm">
                <div className="flex items-center gap-2 text-fg-muted">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(book.added_at)}
                </div>
                {book.isbn && (
                  <div className="flex items-center gap-2 text-fg-muted">
                    <Hash className="h-4 w-4" />
                    {book.isbn}
                  </div>
                )}
                {book.total_pages && (
                  <div className="flex items-center gap-2 text-fg-muted">
                    <BookOpen className="h-4 w-4" />
                    {book.total_pages} pages
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Progress + Rating */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Reading Progress</CardTitle>
                  <CardDescription>Slide to update.</CardDescription>
                </div>
                <span className="text-2xl font-bold tabular-nums gradient-text">
                  {book.progress}%
                </span>
              </CardHeader>
              <input
                type="range"
                min={0}
                max={100}
                value={book.progress}
                onChange={(e) => onProgressChange(Number(e.target.value))}
                className="w-full accent-brand-violet cursor-pointer"
                aria-label="Reading progress"
              />
              <Progress value={book.progress} className="mt-3" />
              {book.total_pages && (
                <p className="text-xs text-fg-subtle mt-2 tabular-nums">
                  {Math.round((book.progress / 100) * book.total_pages)} of{" "}
                  {book.total_pages} pages read
                </p>
              )}
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Your Rating</CardTitle>
                  <CardDescription>How was it?</CardDescription>
                </div>
              </CardHeader>
              <div className="flex items-center gap-3">
                <StarRating value={book.rating} onChange={onRate} size={28} />
                <span className="text-sm text-fg-muted">
                  {book.rating ? `${book.rating}/5` : "Not rated"}
                </span>
              </div>
              <p className="text-xs text-fg-subtle mt-3">
                Click a star to rate, click again to clear.
              </p>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Personal Notes</CardTitle>
                  <CardDescription>Quotes, takeaways, anything worth remembering.</CardDescription>
                </div>
                <Sparkles className="h-4 w-4 text-brand-pink" />
              </CardHeader>
              {book.notes ? (
                <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">
                  {book.notes}
                </p>
              ) : (
                <button
                  onClick={() => setEditOpen(true)}
                  className="text-sm text-fg-subtle italic hover:text-fg-muted cursor-pointer focus-ring rounded px-1"
                >
                  Click edit to add your notes…
                </button>
              )}
            </Card>
          </motion.div>

          {/* Borrowing history */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Borrowing History</CardTitle>
                  <CardDescription>Every time this book left your shelf.</CardDescription>
                </div>
                <Badge tone="cyan">{history.length} record{history.length !== 1 ? "s" : ""}</Badge>
              </CardHeader>

              {history.length === 0 ? (
                <p className="text-sm text-fg-subtle text-center py-6">
                  This book hasn&apos;t been lent yet.
                </p>
              ) : (
                <ol className="relative pl-6 space-y-5">
                  <span
                    aria-hidden="true"
                    className="absolute left-2 top-1 bottom-1 w-px bg-gradient-to-b from-brand-violet/50 via-brand-cyan/30 to-transparent"
                  />
                  {history.map((r) => {
                    const overdue = isOverdue(r.due_at, r.returned_at);
                    const hue = hashHue(r.borrower_name);
                    return (
                      <li key={r.id} className="relative">
                        <span
                          className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full ring-4 ring-bg"
                          style={{
                            background: r.returned_at
                              ? "#10B981"
                              : overdue
                              ? "#F43F5E"
                              : `hsl(${hue} 70% 55%)`,
                          }}
                          aria-hidden="true"
                        />
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 45%))`,
                            }}
                          >
                            {initials(r.borrower_name)}
                          </div>
                          <span className="font-semibold text-sm">{r.borrower_name}</span>
                          {r.returned_at ? (
                            <Badge tone="emerald">Returned</Badge>
                          ) : overdue ? (
                            <Badge tone="rose">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Overdue
                            </Badge>
                          ) : (
                            <Badge tone="amber">Active</Badge>
                          )}
                          {!r.returned_at && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onReturn(r.id)}
                              className="ml-auto"
                            >
                              Mark returned
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-fg-muted ml-9 space-y-0.5">
                          <p>
                            Lent {formatDate(r.lent_at)}
                            {r.due_at && <> · Due {formatDate(r.due_at)}</>}
                            {r.returned_at && <> · Returned {formatDate(r.returned_at)}</>}
                          </p>
                          {r.borrower_contact && (
                            <p className="text-fg-subtle">{r.borrower_contact}</p>
                          )}
                          {r.notes && <p className="italic text-fg-subtle">&ldquo;{r.notes}&rdquo;</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit book"
        description="Update any detail."
        size="lg"
      >
        <BookForm initial={book} onDone={() => setEditOpen(false)} />
      </Modal>

      {/* Lend modal */}
      <Modal
        open={lendOpen}
        onClose={() => setLendOpen(false)}
        title={`Lend "${book.title}"`}
        description="Track who has it and when it's due back."
      >
        <LendForm bookId={book.id} onDone={() => setLendOpen(false)} />
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this book?"
        description="This will also remove its borrowing history. This action cannot be undone."
        size="sm"
      >
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
            Yes, delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
