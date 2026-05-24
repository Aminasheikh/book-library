"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  X,
  BookPlus,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookCard } from "@/components/books/BookCard";
import { BookRow } from "@/components/books/BookRow";
import { BookForm } from "@/components/books/BookForm";
import { useLibrary, useEnrichedBooks } from "@/lib/store";
import type { BookStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "grid" | "list";

export default function LibraryPage() {
  const books = useEnrichedBooks();
  const categories = useLibrary((s) => s.categories);
  const hydrated = useLibrary((s) => s.hydrated);

  const [query, setQuery]           = useState("");
  const [category, setCategory]     = useState("");
  const [status, setStatus]         = useState<"" | BookStatus>("");
  const [sort, setSort]             = useState<"recent" | "title" | "author" | "rating">("recent");
  const [view, setView]             = useState<View>("grid");
  const [addOpen, setAddOpen]       = useState(false);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("library-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = books;
    if (q) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.isbn ?? "").toLowerCase().includes(q),
      );
    }
    if (category) list = list.filter((b) => b.category_id === category);
    if (status)   list = list.filter((b) => b.status === status);

    return [...list].sort((a, b) => {
      if (sort === "title")  return a.title.localeCompare(b.title);
      if (sort === "author") return a.author.localeCompare(b.author);
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [books, query, category, status, sort]);

  const activeFiltersCount = [category, status].filter(Boolean).length + (query ? 1 : 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow={`${books.length} ${books.length === 1 ? "book" : "books"} • ${categories.length} categories`}
        title={
          <>
            Your <span className="gradient-text">library</span>
          </>
        }
        subtitle="Search, filter, and organize every book in your collection."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setAddOpen(true)}
          >
            Add Book
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="glass rounded-2xl p-3 mb-6 sticky top-4 z-20">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 min-w-0">
            <Input
              id="library-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN…"
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface/80 text-[10px] font-mono text-fg-subtle border border-border">
                  /
                </kbd>
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | BookStatus)}
            >
              <option value="">All status</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="wishlist">Wishlist</option>
              <option value="lent">Lent out</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="recent">Recent</option>
              <option value="title">A → Z</option>
              <option value="author">By Author</option>
              <option value="rating">Top rated</option>
            </Select>

            <div className="hidden md:flex items-center rounded-xl bg-surface/60 border border-border p-0.5">
              <ToolbarBtn
                active={view === "grid"}
                onClick={() => setView("grid")}
                label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn
                active={view === "list"}
                onClick={() => setView("list")}
                label="List view"
              >
                <ListIcon className="h-4 w-4" />
              </ToolbarBtn>
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-wrap">
            <span className="text-xs text-fg-subtle inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3" />
              {activeFiltersCount} active
            </span>
            <button
              onClick={() => {
                setQuery("");
                setCategory("");
                setStatus("");
              }}
              className="text-xs text-brand-violet hover:text-brand-pink inline-flex items-center gap-1 cursor-pointer focus-ring rounded px-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {!hydrated ? (
        <LibrarySkeleton view={view} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookPlus className="h-7 w-7" />}
          title={query || activeFiltersCount > 0 ? "No books match these filters" : "Your library is empty"}
          description={
            query || activeFiltersCount > 0
              ? "Try clearing filters or searching with different terms."
              : "Start building your personal library by adding your first book."
          }
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setAddOpen(true)}
            >
              Add your first book
            </Button>
          }
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "flex flex-col gap-2"
            }
          >
            {filtered.map((b, i) =>
              view === "grid" ? (
                <BookCard key={b.id} book={b} index={i} />
              ) : (
                <BookRow key={b.id} book={b} index={i} />
              ),
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a new book"
        description="Fill in what you know — you can always edit later."
        size="lg"
      >
        <BookForm onDone={() => setAddOpen(false)} />
      </Modal>
    </AppShell>
  );
}

function ToolbarBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "h-9 w-9 inline-flex items-center justify-center rounded-lg cursor-pointer transition-all focus-ring",
        active ? "bg-surface-strong text-fg shadow-glass" : "text-fg-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function LibrarySkeleton({ view }: { view: View }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-72 rounded-2xl" />
      ))}
    </div>
  );
}
