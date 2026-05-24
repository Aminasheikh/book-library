export type BookStatus = "reading" | "completed" | "wishlist" | "lent";

export type Book = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  isbn: string | null;
  category_id: string | null;
  status: BookStatus;
  rating: number | null;        // 0–5
  progress: number;             // 0–100
  total_pages: number | null;
  notes: string | null;
  added_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;                // hex
  created_at: string;
};

export type BorrowRecord = {
  id: string;
  book_id: string;
  borrower_name: string;
  borrower_contact: string | null;
  lent_at: string;
  due_at: string | null;
  returned_at: string | null;
  notes: string | null;
};

export type BookWithRelations = Book & {
  category: Category | null;
  active_borrow: BorrowRecord | null;
};
