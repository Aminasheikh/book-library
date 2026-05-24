"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLibrary } from "@/lib/store";

export function LendForm({ bookId, onDone }: { bookId: string; onDone: () => void }) {
  const lendBook = useLibrary((s) => s.lendBook);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [dueAt, setDueAt] = useState(
    new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Borrower name is required");
      return;
    }
    setSubmitting(true);
    try {
      lendBook({
        book_id: bookId,
        borrower_name: name.trim(),
        borrower_contact: contact.trim() || null,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        notes: notes.trim() || null,
      });
      toast.success(`Book lent to ${name}`);
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="borrower" required>Borrower name</Label>
        <Input
          id="borrower"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friend's name"
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="contact">Contact (optional)</Label>
        <Input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone"
        />
      </div>
      <div>
        <Label htmlFor="due">Due date</Label>
        <Input
          id="due"
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="lnotes">Notes</Label>
        <Textarea
          id="lnotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any context worth remembering…"
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          leftIcon={<Send className="h-4 w-4" />}
        >
          Lend book
        </Button>
      </div>
    </form>
  );
}
