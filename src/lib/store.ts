"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Book, BorrowRecord, Category } from "@/lib/types";
import { seedBooks, seedCategories, seedBorrows } from "@/lib/seed";

/* ----------------------------------------------------------------
   Local Zustand store — backs the UI when Supabase isn't configured.
   When Supabase IS configured, the same actions can be swapped for
   remote calls (see hooks/useBooks.ts). For the submission demo this
   gives a fully working app with no setup required.
   ---------------------------------------------------------------- */

type State = {
  books: Book[];
  categories: Category[];
  borrows: BorrowRecord[];
  hydrated: boolean;

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

  reset: () => void;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const useLibrary = create<State>()(
  persist(
    (set, get) => ({
      books: seedBooks,
      categories: seedCategories,
      borrows: seedBorrows,
      hydrated: false,

      addBook: (b) => {
        const now = new Date().toISOString();
        const book: Book = { ...b, id: uid(), added_at: now, updated_at: now };
        set((s) => ({ books: [book, ...s.books] }));
        return book;
      },
      updateBook: (id, patch) =>
        set((s) => ({
          books: s.books.map((b) =>
            b.id === id ? { ...b, ...patch, updated_at: new Date().toISOString() } : b,
          ),
        })),
      deleteBook: (id) =>
        set((s) => ({
          books: s.books.filter((b) => b.id !== id),
          borrows: s.borrows.filter((r) => r.book_id !== id),
        })),

      addCategory: (c) => {
        const cat: Category = { ...c, id: uid(), created_at: new Date().toISOString() };
        set((s) => ({ categories: [...s.categories, cat] }));
        return cat;
      },
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          books: s.books.map((b) => (b.category_id === id ? { ...b, category_id: null } : b)),
        })),

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
        return rec;
      },
      returnBook: (recordId) =>
        set((s) => {
          const rec = s.borrows.find((r) => r.id === recordId);
          return {
            borrows: s.borrows.map((r) =>
              r.id === recordId ? { ...r, returned_at: new Date().toISOString() } : r,
            ),
            books: rec
              ? s.books.map((b) =>
                  b.id === rec.book_id
                    ? { ...b, status: b.progress >= 100 ? "completed" : "reading" }
                    : b,
                )
              : s.books,
          };
        }),
      deleteBorrow: (recordId) =>
        set((s) => ({ borrows: s.borrows.filter((r) => r.id !== recordId) })),

      reset: () =>
        set({ books: seedBooks, categories: seedCategories, borrows: seedBorrows }),
    }),
    {
      name: "lumen-library-v1",
      storage: createJSONStorage(() => localStorage),
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
