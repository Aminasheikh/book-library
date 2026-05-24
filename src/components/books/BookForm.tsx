"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import type { Book, BookStatus } from "@/lib/types";
import { useLibrary } from "@/lib/store";

const statuses: { value: BookStatus; label: string }[] = [
  { value: "wishlist",  label: "Wishlist" },
  { value: "reading",   label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "lent",      label: "Lent out" },
];

type Props = {
  initial?: Book;
  onDone: () => void;
};

export function BookForm({ initial, onDone }: Props) {
  const categories = useLibrary((s) => s.categories);
  const addBook = useLibrary((s) => s.addBook);
  const updateBook = useLibrary((s) => s.updateBook);

  const [title, setTitle]             = useState(initial?.title ?? "");
  const [author, setAuthor]           = useState(initial?.author ?? "");
  const [coverUrl, setCoverUrl]       = useState(initial?.cover_url ?? "");
  const [isbn, setIsbn]               = useState(initial?.isbn ?? "");
  const [categoryId, setCategoryId]   = useState(initial?.category_id ?? "");
  const [status, setStatus]           = useState<BookStatus>(initial?.status ?? "wishlist");
  const [totalPages, setTotalPages]   = useState(initial?.total_pages?.toString() ?? "");
  const [progress, setProgress]       = useState(initial?.progress ?? 0);
  const [rating, setRating]           = useState<number>(initial?.rating ?? 0);
  const [notes, setNotes]             = useState(initial?.notes ?? "");
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState<{ title?: string; author?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!title.trim())  e.title  = "Title is required";
    if (!author.trim()) e.author = "Author is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      author: author.trim(),
      cover_url: coverUrl.trim() || null,
      isbn: isbn.trim() || null,
      category_id: categoryId || null,
      status,
      rating: rating || null,
      progress,
      total_pages: totalPages ? Number(totalPages) : null,
      notes: notes.trim() || null,
    };

    try {
      if (initial) {
        updateBook(initial.id, payload);
        toast.success("Book updated");
      } else {
        addBook(payload);
        toast.success("Book added to your library");
      }
      onDone();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="title" required>Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Midnight Library"
            invalid={!!errors.title}
            autoFocus
          />
          {errors.title && (
            <p className="text-xs text-brand-rose mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="author" required>Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Matt Haig"
            invalid={!!errors.author}
          />
          {errors.author && (
            <p className="text-xs text-brand-rose mt-1">{errors.author}</p>
          )}
        </div>

        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="9780525559474"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input
            id="cover"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg"
          />
          <p className="text-[11px] text-fg-subtle mt-1">
            Tip: Open Library covers work — <code className="text-fg-muted">covers.openlibrary.org/b/isbn/&lt;ISBN&gt;-L.jpg</code>
          </p>
        </div>

        <div>
          <Label htmlFor="pages">Total pages</Label>
          <Input
            id="pages"
            type="number"
            min={0}
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="304"
          />
        </div>

        <div>
          <Label htmlFor="progress">Reading progress</Label>
          <div className="flex items-center gap-3">
            <input
              id="progress"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 accent-brand-violet cursor-pointer"
            />
            <span className="text-sm font-semibold tabular-nums w-12 text-right">
              {progress}%
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label>Your rating</Label>
          <StarRating value={rating} onChange={setRating} size={24} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="notes">Personal notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Favorite quotes, takeaways, who recommended it…"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {initial ? "Save changes" : "Add to library"}
        </Button>
      </div>
    </form>
  );
}
