-- ============================================================
-- Lumen Library — Supabase Schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- Enable UUID generation (Supabase usually has this on by default)
create extension if not exists "pgcrypto";

-- ----------------------------
-- CATEGORIES
-- ----------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text not null default '#8B5CF6',
  created_at  timestamptz not null default now()
);

-- ----------------------------
-- BOOKS
-- ----------------------------
create table if not exists public.books (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  author       text not null,
  cover_url    text,
  isbn         text,
  category_id  uuid references public.categories(id) on delete set null,
  status       text not null default 'wishlist'
               check (status in ('reading','completed','wishlist','lent')),
  rating       int  check (rating >= 0 and rating <= 5),
  progress     int  not null default 0 check (progress between 0 and 100),
  total_pages  int,
  notes        text,
  added_at     timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists books_title_idx    on public.books (lower(title));
create index if not exists books_author_idx   on public.books (lower(author));
create index if not exists books_status_idx   on public.books (status);
create index if not exists books_category_idx on public.books (category_id);

-- Keep updated_at fresh
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.tg_set_updated_at();

-- ----------------------------
-- BORROWING HISTORY
-- ----------------------------
create table if not exists public.borrow_records (
  id                uuid primary key default gen_random_uuid(),
  book_id           uuid not null references public.books(id) on delete cascade,
  borrower_name     text not null,
  borrower_contact  text,
  lent_at           timestamptz not null default now(),
  due_at            timestamptz,
  returned_at       timestamptz,
  notes             text
);

create index if not exists borrow_book_idx    on public.borrow_records (book_id);
create index if not exists borrow_active_idx  on public.borrow_records (returned_at) where returned_at is null;

-- ----------------------------
-- ROW LEVEL SECURITY
-- (Single-user / local demo: allow anon full access.
--  For multi-user, replace `using (true)` with auth.uid() checks.)
-- ----------------------------
alter table public.categories     enable row level security;
alter table public.books          enable row level security;
alter table public.borrow_records enable row level security;

create policy "anon all categories"     on public.categories     for all using (true) with check (true);
create policy "anon all books"          on public.books          for all using (true) with check (true);
create policy "anon all borrow_records" on public.borrow_records for all using (true) with check (true);

-- ----------------------------
-- SEED CATEGORIES
-- ----------------------------
insert into public.categories (name, color) values
  ('Fiction',       '#8B5CF6'),
  ('Non-fiction',   '#06B6D4'),
  ('Science',       '#10B981'),
  ('Biography',     '#F59E0B'),
  ('Self-help',     '#EC4899'),
  ('Technology',    '#6366F1'),
  ('History',       '#F43F5E'),
  ('Poetry',        '#A78BFA')
on conflict (name) do nothing;
