"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag, BookOpen } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLibrary } from "@/lib/store";
import type { Category } from "@/lib/types";

const presetColors = [
  "#8B5CF6", "#06B6D4", "#EC4899", "#10B981",
  "#F59E0B", "#6366F1", "#F43F5E", "#A78BFA",
  "#34D399", "#FB7185", "#22D3EE", "#FBBF24",
];

export default function CategoriesPage() {
  const categories = useLibrary((s) => s.categories);
  const books = useLibrary((s) => s.books);
  const addCategory = useLibrary((s) => s.addCategory);
  const updateCategory = useLibrary((s) => s.updateCategory);
  const deleteCategory = useLibrary((s) => s.deleteCategory);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of books) {
      if (b.category_id) m.set(b.category_id, (m.get(b.category_id) ?? 0) + 1);
    }
    return m;
  }, [books]);

  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(presetColors[0]);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setColor(presetColors[Math.floor(Math.random() * presetColors.length)]);
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setColor(c.color);
    setOpen(true);
  }

  function save() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editing) {
      updateCategory(editing.id, { name: name.trim(), color });
      toast.success("Category updated");
    } else {
      addCategory({ name: name.trim(), color });
      toast.success("Category created");
    }
    setOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id);
    toast.success(`Category "${deleteTarget.name}" removed`);
    setDeleteTarget(null);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={`${categories.length} categories`}
        title={
          <>
            Organize with <span className="gradient-text">categories</span>
          </>
        }
        subtitle="Group your books however you want — by genre, mood, project, or whim."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openCreate}
          >
            New Category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-7 w-7" />}
          title="No categories yet"
          description="Categories help you slice your library by genre, mood, or any system you like."
          action={
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Create your first
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c, i) => {
            const count = counts.get(c.id) ?? 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card className="relative overflow-hidden group">
                  <div
                    aria-hidden="true"
                    className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ background: c.color }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${c.color}, ${c.color}80)`,
                          boxShadow: `0 8px 24px -6px ${c.color}80`,
                        }}
                      >
                        <Tag className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(c)}
                          aria-label={`Edit ${c.name}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-surface/60 cursor-pointer focus-ring"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          aria-label={`Delete ${c.name}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-brand-rose/80 hover:text-brand-rose hover:bg-brand-rose/10 cursor-pointer focus-ring"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg leading-tight">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-fg-muted mt-1">
                      <BookOpen className="h-3 w-3" />
                      {count} {count === 1 ? "book" : "books"}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit category" : "New category"}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name" required>Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mystery"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setColor(p)}
                  aria-label={`Color ${p}`}
                  aria-pressed={color === p}
                  className="h-10 rounded-xl border-2 transition-all cursor-pointer focus-ring"
                  style={{
                    background: p,
                    borderColor: color === p ? "#fff" : "transparent",
                    boxShadow: color === p ? `0 0 0 2px ${p}40, 0 0 20px ${p}80` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description={`Books in this category will be uncategorized but not deleted. ${
          deleteTarget ? `${counts.get(deleteTarget.id) ?? 0} book(s) affected.` : ""
        }`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={confirmDelete}>
            Delete category
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
