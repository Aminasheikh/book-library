"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { Book, BorrowRecord, Category } from "@/lib/types";
import { seedBooks, seedCategories, seedBorrows } from "@/lib/seed";
import {
  isSupabaseConfigured,
  fetchBooks,
  fetchCategories,
  fetchBorrows,
  insertBook,
  insertCategory,
  insertBorrow,
  updateBookRemote,
  updateCategoryRemote,
  markReturnedRemote,
  deleteBookRemote,
  deleteCategoryRemote,
  deleteBorrowRemote,
} from "@/lib/supabase/repo";

/* ----------------------------------------------------------------
   Zustand store — single source of truth for the UI.

   When Supabase is configured (NEXT_PUBLIC_DEMO_MODE=false + credentials),
   the store hydrates from Supabase on mount and every mutation is mirrored
   to Supabase in the background (optimistic UI).

   When NOT configured, the store uses LocalStorage persistence with seed data.
   ---------------------------------------------------------------- */

type State = {
  books: Book[];
  categories: Category[];
  borrows: BorrowRecord[];
  hydrated: boolean;
  syncing: boolean;

  // book actions
  addBook: (b: Omit<Book, "id" | "added_at" | "updated_at">) => Book;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  // category actions
  addCategory: (c: Omit<Category, "id" | "created_at">) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // borrow actions
  lendBook: (b: Omit<BorrowRecord, "id" | "lent_at" | "returned_at">) => BorrowRecord;
  returnBook: (recordId: string) => void;
  deleteBorrow: (recordId: string) => void;

  // sync
  syncFromRemote: () => Promise<void>;
  reset: () => void;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Background fire-and-forget — never block the UI. */
function bg(fn: () => Promise<void>, ctx: string) {
  fn().catch((err) => {
    console.error(`[supabase:${ctx}]`, err);
    toast.error(`Couldn't sync ${ctx} to cloud`, {
      description: err?.message ?? "Check your connection.",
    });
  });
}

const initialBooks = isSupabaseConfigured ? [] : seedBooks;
const initialCategories = isSupabaseConfigured ? [] : seedCategories;
const initialBorrows = isSupabaseConfigured ? [] : seedBorrows;

export const useLibrary = create<State>()(
  persist(
    (set, get) => ({
      books: initialBooks,
      categories: initialCategories,
      borrows: initialBorrows,
      hydrated: false,
      syncing: false,

      addBook: (b) => {
        const now = new Date().toISOString();
        const book: Book = { ...b, id: uid(), added_at: now, updated_at: now };
        set((s) => ({ books: [book, ...s.books] }));
        if (isSupabaseConfigured) bg(() => insertBook(book), "new book");
        return book;
      },

      updateBook: (id, patch) => {
        set((s) => ({
          books: s.books.map((b) =>
            b.id === id ? { ...b, ...patch, updated_at: new Date().toISOString() } : b,
          ),
        }));
        if (isSupabaseConfigured) bg(() => updateBookRemote(id, patch), "book update");
      },

      deleteBook: (id) => {
        set((s) => ({
          books: s.books.filter((b) => b.id !== id),
          borrows: s.borrows.filter((r) => r.book_id !== id),
        }));
        if (isSupabaseConfigured) bg(() => deleteBookRemote(id), "book deletion");
      },

      addCategory: (c) => {
        const cat: Category = { ...c, id: uid(), created_at: new Date().toISOString() };
        set((s) => ({ categories: [...s.categories, cat] }));
        if (isSupabaseConfigured) bg(() => insertCategory(cat), "new category");
        return cat;
      },

      updateCategory: (id, patch) => {
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        if (isSupabaseConfigured) bg(() => updateCategoryRemote(id, patch), "category update");
      },

      deleteCategory: (id) => {
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          books: s.books.map((b) => (b.category_id === id ? { ...b, category_id: null } : b)),
        }));
        if (isSupabaseConfigured) bg(() => deleteCategoryRemote(id), "category deletion");
      },

      lendBook: (b) => {
        const rec: BorrowRecord = {
          ...b,
          id: uid(),
          lent_at: new Date().toISOString(),
          returned_at: null,
        };
        set((s) => ({
          borrows: [rec, ...s.borrows],
          books: s.books.map((book) =>
            book.id === b.book_id ? { ...book, status: "lent" } : book,
          ),
        }));
        if (isSupabaseConfigured) {
          bg(() => insertBorrow(rec), "lending record");
          bg(() => updateBookRemote(b.book_id, { status: "lent" }), "book status");
        }
        return rec;
      },

      returnBook: (recordId) => {
        const now = new Date().toISOString();
        const rec = get().borrows.find((r) => r.id === recordId);
        set((s) => ({
          borrows: s.borrows.map((r) =>
            r.id === recordId ? { ...r, returned_at: now } : r,
          ),
          books: rec
            ? s.books.map((b) =>
                b.id === rec.book_id
                  ? { ...b, status: b.progress >= 100 ? "completed" : "reading" }
                  : b,
              )
            : s.books,
        }));
        if (isSupabaseConfigured && rec) {
          bg(() => markReturnedRemote(recordId, now), "return");
          const book = get().books.find((b) => b.id === rec.book_id);
          if (book) bg(() => updateBookRemote(book.id, { status: book.status }), "book status");
        }
      },

      deleteBorrow: (recordId) => {
        set((s) => ({ borrows: s.borrows.filter((r) => r.id !== recordId) }));
        if (isSupabaseConfigured) bg(() => deleteBorrowRemote(recordId), "borrow deletion");
      },

      syncFromRemote: async () => {
        if (!isSupabaseConfigured) return;
        if (get().syncing) return;
        set({ syncing: true });
        try {
          const [books, categories, borrows] = await Promise.all([
            fetchBooks(),
            fetchCategories(),
            fetchBorrows(),
          ]);
          set({ books, categories, borrows, syncing: false });
        } catch (err) {
          console.error("[supabase:sync]", err);
          toast.error("Couldn't load from cloud", {
            description: (err as Error)?.message ?? "Falling back to local data.",
          });
          set({ syncing: false });
        }
      },

      reset: () =>
        set({
          books: seedBooks,
          categories: seedCategories,
          borrows: seedBorrows,
        }),
    }),
    {
      name: "lumen-library-v1",
      storage: createJSONStorage(() => localStorage),
      // Cache last-known state for instant load; SupabaseSync re-fetches fresh.
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/** Derived selector — books joined with category + active borrow. */
export function useEnrichedBooks() {
  const books = useLibrary((s) => s.books);
  const categories = useLibrary((s) => s.categories);
  const borrows = useLibrary((s) => s.borrows);

  return books.map((book) => ({
    ...book,
    category: categories.find((c) => c.id === book.category_id) ?? null,
    active_borrow:
      borrows
        .filter((r) => r.book_id === book.id && !r.returned_at)
        .sort((a, b) => b.lent_at.localeCompare(a.lent_at))[0] ?? null,
  }));
}
