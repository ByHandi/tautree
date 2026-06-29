# 🌳 Tautree

Linktree-style SaaS — tiap user punya satu halaman publik (`/[username]`) berisi daftar link, dikelola lewat dashboard pribadi.

Lihat [`ROADMAP.md`](./ROADMAP.md) untuk rencana & progres pengerjaan.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Base UI + Radix)
- next-themes (dark mode) + Sonner (toast)
- Database & Auth: Prisma + Postgres + Auth.js _(menyusul — Fase 1 & 2)_

## Struktur

```
app/
  layout.tsx              # root layout minimal (providers global)
  page.tsx                # landing page publik
  (dashboard)/            # route group — semua halaman ber-sidebar
    layout.tsx            # layout dashboard (sidebar)
    dashboard/page.tsx    # dashboard utama
components/
  app-sidebar.tsx         # navigasi dashboard
  ui/                     # komponen shadcn + form wrapper (Input*)
  providers/              # theme + toast
lib/ hooks/               # util & hooks
```

## Getting Started

```bash
npm install
npm run dev          # atau: npm run dev:turbo
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # dev server
npm run dev:turbo    # dev server (Turbopack)
npm run build        # production build
npm run start        # jalankan hasil build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier
```

## UI Components

Komponen shadcn-style ada di `components/ui`. Tersedia juga wrapper form siap pakai:
`InputText`, `InputTextarea`, `InputNumber`, `InputSelect`, `InputCombobox`,
`InputSwitch`, `InputCheckbox`, `DatePicker`, `DateRangePicker`, dll.

Tambah komponen baru:

```bash
npx shadcn@latest add <component>
```
