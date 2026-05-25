"use client";

/**
 * Supabase repository layer.
 * All CRUD calls live here so the rest of the app can stay agnostic.
 * When Supabase is not configured, these functions are no-ops (return null/[]).
 */

import { createClient, isSupabaseConfigured } from "./client";
import type { Book, BorrowRecord, Category } from "@/lib/types";

const supabase = createClient();

// -------- CATEGORIES --------

export async function fetchCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function insertCategory(c: Pick<Category, "id" | "name" | "color">) {
  if (!supabase) return;
  const { error } = await supabase.from("categories").insert({
    id: c.id,
    name: c.name,
    color: c.color,
  });
  if (error) throw error;
}

export async function updateCategoryRemote(id: string, patch: Partial<Category>) {
  if (!supabase) return;
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteCategoryRemote(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// -------- BOOKS --------

export async function fetchBooks(): Promise<Book[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("added_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertBook(b: Book) {
  if (!supabase) return;
  const { error } = await supabase.from("books").insert({
    id: b.id,
    title: b.title,
    author: b.author,
    cover_url: b.cover_url,
    isbn: b.isbn,
    category_id: b.category_id,
    status: b.status,
    rating: b.rating,
    progress: b.progress,
    total_pages: b.total_pages,
    notes: b.notes,
  });
  if (error) throw error;
}

export async function updateBookRemote(id: string, patch: Partial<Book>) {
  if (!supabase) return;
  // Drop id from patch (immutable) and updated_at (server trigger handles it)
  const { id: _id, updated_at: _u, added_at: _a, ...clean } = patch;
  const { error } = await supabase.from("books").update(clean).eq("id", id);
  if (error) throw error;
}

export async function deleteBookRemote(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
}

// -------- BORROW RECORDS --------

export async function fetchBorrows(): Promise<BorrowRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("borrow_records")
    .select("*")
    .order("lent_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertBorrow(r: BorrowRecord) {
  if (!supabase) return;
  const { error } = await supabase.from("borrow_records").insert({
    id: r.id,
    book_id: r.book_id,
    borrower_name: r.borrower_name,
    borrower_contact: r.borrower_contact,
    due_at: r.due_at,
    notes: r.notes,
  });
  if (error) throw error;
}

export async function markReturnedRemote(id: string, returnedAt: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from("borrow_records")
    .update({ returned_at: returnedAt })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteBorrowRemote(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("borrow_records").delete().eq("id", id);
  if (error) throw error;
}

export { isSupabaseConfigured };
