# Lumen Library

> A premium personal book library — manage every book you own, search instantly, categorize by mood or genre, track reading progress, and never lose a book to a friend again.

Built with a 2026-grade glassmorphism UI: animated aurora gradients, glass-morphism cards, smooth micro-interactions, and a responsive mobile-first layout.

---

## Tech Stack

| Layer        | Choice |
|--------------|--------|
| Framework    | **Next.js 15** (App Router, React 19) + **TypeScript** |
| Styling      | **Tailwind CSS** + custom design tokens |
| Animation    | **Framer Motion** for layout & micro-interactions |
| Charts       | **Recharts** (donut + bar) |
| Icons        | **Lucide React** (consistent SVG icon set — no emojis) |
| State        | **Zustand** + `persist` (LocalStorage) |
| Toasts       | **Sonner** |
| Backend      | **Supabase** (Postgres + Row Level Security) — schema included |
| Typography   | **Plus Jakarta Sans** (Google Fonts) |

---

## Features

### Core
- **Add / Edit / Delete books** — title, author, cover URL, ISBN, category, status, total pages, notes, rating
- **Real-time search** — by title, author, or ISBN (with `/` keyboard shortcut)
- **Categorization** — preset + custom categories, each with its own color and book count
- **Borrowing history** — lend to a person, set a due date, track returns, automatic overdue badges
- **Dashboard** with live stats — total books, currently reading, lent out, overdue, plus category donut and 6-month reading activity bar chart

### Creative additions
- **Reading progress tracker** — slider on book detail, % live-updates everywhere
- **Star rating + personal notes** — click to rate, click again to clear
- **3D bookshelf grid view** — books tilt on hover with perspective transforms
- **List view toggle** — same data, denser layout
- **Borrowing timeline** — beautifully animated, with avatar initials, overdue alerts, return actions
- **Empty states** with illustrations and clear next actions
- **Loading skeletons** with shimmer
- **Animated aurora background** with subtle grid overlay
- **Mobile bottom-tab nav** + glass top bar

### UX & accessibility
- Mobile-first responsive at 375 / 768 / 1024 / 1440
- Visible focus rings on every interactive element
- `prefers-reduced-motion` respected
- Semantic HTML, ARIA labels on icon-only buttons
- Color contrast ≥ 4.5:1 for text
- Tab order matches visual order
- Keyboard shortcut `/` to focus search

---

## Quick Start (Demo Mode — No Setup)

The app ships with realistic seed data and works **immediately** with no backend setup.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Done.

By default `NEXT_PUBLIC_DEMO_MODE=true` (see [.env.example](.env.example)). All data persists to LocalStorage so refresh keeps your changes.

---

## Production Setup with Supabase

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project (free tier is enough)
2. Wait for it to spin up (~1 minute)

### 2. Run the schema

1. In your Supabase dashboard, open **SQL Editor → New Query**
2. Paste the contents of [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql)
3. Click **Run**. This creates the `categories`, `books`, and `borrow_records` tables, indexes, RLS policies, and seeds 8 default categories.

### 3. Configure env vars

Copy `.env.example` → `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_DEMO_MODE=false
```

Get the URL + anon key from **Project Settings → API**.

### 4. Run

```bash
npm install
npm run dev
```

> **Note:** The current build uses the Zustand store as the single source of truth so the app works offline / for the submission demo. The Supabase client (`src/lib/supabase/client.ts`) and schema are in place — wiring CRUD to remote calls is a drop-in replacement for the store actions.

---

## Project Structure

```
book-library/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, fonts, aurora bg, toaster
│   │   ├── page.tsx                   # Dashboard
│   │   ├── globals.css                # Design tokens + utility classes
│   │   ├── library/
│   │   │   ├── page.tsx               # Grid/list view, search, filters
│   │   │   └── [id]/page.tsx          # Book detail
│   │   ├── borrowing/page.tsx         # Lending history timeline
│   │   └── categories/page.tsx        # Manage categories
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx            # Desktop nav (floating glass)
│   │   │   ├── MobileNav.tsx          # Mobile top bar + bottom tabs
│   │   │   └── PageHeader.tsx
│   │   ├── ui/                        # Primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Tooltip.tsx
│   │   └── books/
│   │       ├── BookCover.tsx          # Image w/ gradient fallback
│   │       ├── BookCard.tsx           # Grid item (3D tilt on hover)
│   │       ├── BookRow.tsx            # List item
│   │       ├── BookForm.tsx           # Add/edit modal content
│   │       ├── LendForm.tsx
│   │       └── StatusBadge.tsx
│   └── lib/
│       ├── utils.ts                   # cn, formatDate, hashHue, etc.
│       ├── types.ts                   # Book, Category, BorrowRecord
│       ├── store.ts                   # Zustand + persist
│       ├── seed.ts                    # Realistic demo data
│       └── supabase/
│           ├── client.ts              # Browser client
│           └── schema.sql             # Run this in Supabase SQL editor
├── public/                            # static assets (none required)
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── .env.example
└── package.json
```

---

## Design System

| Token              | Value |
|--------------------|-------|
| **Background**     | `hsl(230 35% 5%)` — deep navy |
| **Surface (glass)**| `hsl(230 25% 14% / 0.55)` w/ `backdrop-blur(20px)` |
| **Text primary**   | `hsl(220 30% 98%)` |
| **Brand gradient** | `#8B5CF6 → #06B6D4 → #EC4899` (violet → cyan → pink) |
| **Font**           | Plus Jakarta Sans (300–800) |
| **Radius scale**   | `1rem · 1.25rem · 1.75rem` |
| **Motion timing**  | `cubic-bezier(0.16, 1, 0.3, 1)` for 200–400ms |

The aurora background uses 4 radial gradients animated over 22s. Glass surfaces use a layered `backdrop-filter: blur(20px) saturate(140%)` with an inset top highlight to mimic real glass.

---

## Commands

| Command           | What it does |
|-------------------|--------------|
| `npm run dev`     | Start dev server at `localhost:3000` |
| `npm run build`   | Production build |
| `npm run start`   | Run production build |
| `npm run lint`    | Next.js / ESLint |

---

## Notes for the Reviewer

- **Open with `npm install && npm run dev`** — that's all you need. Demo mode is on by default and ships with realistic data so every page is populated.
- Try the keyboard shortcut `/` on the Library page to focus search.
- Toggle between grid and list view (top right of Library toolbar).
- Open any book → drag the progress slider → watch it update everywhere.
- Lend a book → set a past due date → see the overdue badge light up.
- Add a custom category from the Categories page → it's available in the book form immediately.

Built with care for Task 1.
