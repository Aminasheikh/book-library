"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { BookCover } from "./BookCover";
import { StatusBadge } from "./StatusBadge";
import { Progress } from "@/components/ui/Progress";
import type { BookWithRelations } from "@/lib/types";

export function BookCard({ book, index = 0 }: { book: BookWithRelations; index?: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/library/${book.id}`}
        className="group block focus-ring rounded-2xl"
        aria-label={`${book.title} by ${book.author}`}
      >
        <div className="glass glass-hover rounded-2xl p-4 h-full flex flex-col">
          <div className="shelf-3d flex justify-center mb-4 pt-2">
            <div className="book-3d">
              <BookCover
                title={book.title}
                author={book.author}
                coverUrl={book.cover_url}
                size="lg"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:gradient-text transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-fg-muted mt-1 line-clamp-1">{book.author}</p>

            <div className="flex items-center justify-between gap-2 mt-3">
              <StatusBadge status={book.status} />
              {book.rating ? (
                <span className="inline-flex items-center gap-0.5 text-xs text-brand-pink font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  {book.rating}
                </span>
              ) : null}
            </div>

            {book.status === "reading" && (
              <div className="mt-3">
                <Progress value={book.progress} />
                <div className="flex justify-between text-[10px] text-fg-subtle mt-1 tabular-nums">
                  <span>{book.progress}% read</span>
                  {book.total_pages ? (
                    <span>
                      {Math.round((book.progress / 100) * book.total_pages)}/
                      {book.total_pages}p
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {book.category && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-muted">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: book.category.color }}
                  />
                  {book.category.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
