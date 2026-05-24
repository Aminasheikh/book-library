"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { BookCover } from "./BookCover";
import { StatusBadge } from "./StatusBadge";
import { Progress } from "@/components/ui/Progress";
import type { BookWithRelations } from "@/lib/types";

export function BookRow({ book, index = 0 }: { book: BookWithRelations; index?: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Link
        href={`/library/${book.id}`}
        className="group block focus-ring rounded-2xl"
      >
        <div className="glass glass-hover rounded-2xl p-3 flex items-center gap-4">
          <BookCover
            title={book.title}
            author={book.author}
            coverUrl={book.cover_url}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:gradient-text transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-fg-muted truncate mt-0.5">{book.author}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-fg-subtle group-hover:text-fg group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={book.status} />
              {book.category && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-muted">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: book.category.color }}
                  />
                  {book.category.name}
                </span>
              )}
              {book.rating ? (
                <span className="inline-flex items-center gap-0.5 text-xs text-brand-pink font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  {book.rating}
                </span>
              ) : null}
              {book.status === "reading" && (
                <span className="text-[11px] text-fg-subtle tabular-nums">
                  {book.progress}% read
                </span>
              )}
            </div>

            {book.status === "reading" && (
              <div className="mt-2 max-w-md">
                <Progress value={book.progress} />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
