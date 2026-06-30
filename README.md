# 🌳 Tautree

Linktree-style SaaS — tiap user punya satu halaman publik (`/[username]`) berisi daftar link, dikelola lewat dashboard pribadi. **v1 sudah live** (self-hosted di Coolify).

Lihat [`ROADMAP.md`](./ROADMAP.md) untuk rencana & progres pengerjaan.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Base UI + Radix)
- next-themes (dark mode) + Sonner (toast)
- PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Auth.js (NextAuth v5, JWT) — Google OAuth + magic link
- Vitest (unit test) + GitHub Actions (typecheck + lint + test + build)
- Deploy: Coolify (Docker)

## Fitur

- **Halaman publik** `/[username]` — mobile-first, hanya link aktif & terurut, OG image + SEO dinamis
- **Link power-ups** — reorder drag-and-drop, header/divider, scheduling (live/expired), embed YouTube/Spotify, thumbnail kustom, featured/pinned link
- **Tampilan** — 6 tema preset + custom color, font picker, button shape/fill
- **Social** — auto-detect ikon 17 platform, social icon row di header, share + QR code
- **Analytics** — total clicks, tren 30 hari, top sources, device breakdown, custom date range, export CSV
- **Admin** — panel `/admin` (list/cari user, suspend, hapus link/user), seed admin dari `ADMIN_EMAIL`

## Struktur

```
app/
  page.tsx                # landing page publik
  [username]/             # halaman publik per user
  (auth)/login            # sign in
  onboarding/             # pilih username
  (dashboard)/dashboard/  # dashboard (links, analytics, profile, appearance)
  admin/                  # panel admin
  api/                    # auth, r/[id] redirect+klik, v/[id] view, qr/[username], username
components/
  ui/                     # komponen shadcn + Icon (DynamicIcon) + form wrapper (Input*)
  app-sidebar.tsx · logo.tsx · social-icon.tsx · qr-card.tsx · share-button.tsx
lib/                      # logika domain + unit test (links, profile, analytics, social,
                          # embed, fonts, button-style, themes, rate-limit, username, admin)
prisma/                   # schema.prisma + migrations + seed.ts
brand/                    # aset brand mark (SVG)
```

## Getting Started

Butuh PostgreSQL yang jalan. Set env (lihat `auth.ts` / `lib/db.ts` untuk yang dipakai):

```bash
DATABASE_URL=postgresql://...               # koneksi Postgres
AUTH_SECRET=...                             # `npx auth secret`
AUTH_GOOGLE_ID=... AUTH_GOOGLE_SECRET=...   # Google OAuth (opsional)
EMAIL_SERVER=smtp://...  EMAIL_FROM=...     # magic link via SMTP (opsional)
ADMIN_EMAIL=...                             # user ini di-seed jadi ADMIN
```

> Provider login bersifat opsional & aditif: Google aktif kalau `AUTH_GOOGLE_*` diset,
> magic link aktif kalau `EMAIL_SERVER`/`EMAIL_FROM` diset.

```bash
npm install
npm run db:migrate   # buat schema + jalankan migrasi
npm run db:seed      # seed awal (termasuk admin)
npm run dev          # atau: npm run dev:turbo
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev / dev:turbo   # dev server (Turbopack di :turbo)
npm run build / start     # production build & serve
npm run lint              # eslint
npm run typecheck         # tsc --noEmit
npm run format            # prettier
npm run test / test:watch # vitest

npm run db:migrate        # prisma migrate dev
npm run db:seed           # prisma db seed
npm run db:studio         # prisma studio
npm run db:reset          # reset DB + migrasi ulang
```

## UI Components

Komponen shadcn-style ada di `components/ui`. Ikon dipanggil lewat komponen `Icon` (lucide
`DynamicIcon`, prop `name` kebab-case), bukan import per-ikon. Tersedia juga wrapper form
siap pakai: `InputText`, `InputTextarea`, `InputNumber`, `InputSelect`, `InputCombobox`,
`InputSwitch`, `InputCheckbox`, `DatePicker`, `DateRangePicker`, dll.

Tambah komponen baru:

```bash
npx shadcn@latest add <component>
```
