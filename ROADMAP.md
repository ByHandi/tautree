# 🌳 Tautree — Roadmap

Linktree-style SaaS: tiap user punya satu halaman publik (`tautree.com/username`) berisi daftar link, dikelola lewat dashboard pribadi.

## Tech Stack

| Layer | Pilihan | Status |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript | ✅ ada |
| UI | shadcn v4 (Base UI + Radix) + Tailwind v4 | ✅ ada |
| Theme/Toast | next-themes + sonner | ✅ ada |
| Database | PostgreSQL (host-resident, via Docker Compose) | ✅ ada |
| ORM | Prisma 7 | ✅ ada |
| Auth | Auth.js (NextAuth v5) | ✅ ada |
| Deploy | Coolify (self-hosted, Docker) | ✅ ada |

**Keputusan:** Monolith Next.js (FE + API jadi satu). **Tanpa** NestJS & **tanpa** Payload — overkill untuk CRUD user-generated. Bisa diekstrak ke service terpisah nanti kalau backend tumbuh kompleks.

## Data Model

```
User   → id, email, username (unik → slug URL), name, bio, avatarUrl, theme, createdAt
Link   → id, userId, title, url, order, isActive, clicks, createdAt
Click  → id, linkId, createdAt   # analytics ✅ (tabel click_events; counter links.clicks tetap dipertahankan)
```

**Konvensi DB:** PK pakai `@default(uuid(7))` (time-sortable, index locality bagus). Field/model di Prisma camelCase, tapi kolom & tabel di DB **snake_case** + pluralized (`users`, `links`) via `@map()` / `@@map()`.

---

## Fase 0 — Rapihin Fondasi ✅
> Bersihin sisa template registry & siapkan struktur routing.

- [x] Pindahkan sidebar dari root `app/layout.tsx` → route group `app/(dashboard)/layout.tsx`
- [x] Bikin root layout minimal (tanpa sidebar) untuk halaman publik & landing
- [x] Ganti `app/page.tsx` (demo komponen) → landing page sederhana
- [x] Hapus sisa template registry (`registry.json`, `public/r/*`) bila tak dipakai
- [x] Update `README.md` & `package.json` (`name: tautree`)

## Fase 1 — Data Layer ✅
> Database hidup, model siap dipakai.

- [x] Setup Postgres lokal + `DATABASE_URL` di `.env` (DB `tautree`)
- [x] Install & init Prisma 7, definisikan model `User` & `Link`
- [x] Migrasi pertama (`init`) + Prisma client singleton di `lib/db.ts`
- [x] Seed data dummy buat testing (`prisma/seed.ts`)

**Catatan Prisma 7:** generator baru `prisma-client` (output TS ke `lib/generated/prisma`, di-gitignore), config di `prisma.config.ts` (bukan `url` di schema), dan **wajib driver adapter** `@prisma/adapter-pg` (`new PrismaClient({ adapter })`). Script: `db:migrate`, `db:seed`, `db:studio`, `db:reset`.

## Fase 2 — Auth & Onboarding ✅
> User bisa daftar, login, dan klaim username.

- [x] Setup Auth.js (Google + email/magic link via Nodemailer)
- [x] Adapter Prisma untuk Auth.js (model `Account`/`Session`/`VerificationToken`)
- [x] Middleware proteksi route `/dashboard`
- [x] Flow onboarding: pilih `username` unik (cek ketersediaan real-time)

**Catatan Auth.js v5:** pakai **JWT session** (bukan database session) — magic link tetap jalan (token verifikasi disimpan di DB), tapi middleware bisa otorisasi di Edge tanpa query DB. Split config: `auth.config.ts` (edge-safe, Google) + `auth.ts` (adapter + Nodemailer). Gate username (`→ /onboarding`) dilakukan di **dashboard layout** (server, DB-truthful) karena JWT-nya bisa basi. Provider email kondisional: aktif hanya kalau `EMAIL_SERVER` diisi. Env baru: `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `EMAIL_SERVER`, `EMAIL_FROM`.

## Fase 3 — Dashboard (CRUD Link)
> Inti produk: user kelola link-nya sendiri.

- [x] Halaman `/dashboard` — list link milik user
- [x] Tambah / edit / hapus link (pakai komponen `Input*` yang udah ada)
- [x] Reorder link via drag-and-drop (`dnd-kit`)
- [x] Toggle aktif/nonaktif per link
- [x] Edit profil: nama, bio, avatar (`/dashboard/settings`, avatar via URL)

## Fase 4 — Halaman Publik
> Yang dilihat dunia.

- [x] Route `/[username]` — render profil + tombol link (mobile-first)
- [x] Hanya tampilkan link `isActive`, urut sesuai `order`
- [x] Track klik (increment `clicks` via `/api/r/[id]`)
- [x] State `404` untuk username tak ada (`app/[username]/not-found.tsx`)
- [x] OG image & metadata SEO per halaman (`opengraph-image.tsx` dinamis)

## Fase 5 — Polish SaaS
> Bikin layak jadi produk.

- [x] Tema/warna kustom per halaman — 6 preset + **custom color** (color picker, palette tersimpan di kolom `custom_theme` Json, validasi hex-only) (`/dashboard/appearance`)
- [x] Analytics dasar (total klik, klik per link, grafik harian 30 hari — model `Click`)
- [x] Rate limiting & validasi URL — validasi URL (`lib/links.ts`) + limiter in-memory (`lib/rate-limit.ts`) di `/api/username/check` & redirect klik
- [x] Deploy ke Coolify (self-hosted Docker) + domain
- [x] Custom color per halaman (color picker, 6 field palette, validasi hex)
- [ ] (Opsional) Panel admin buat moderasi user

---

## Backlog / Ide Lanjutan
- Verifikasi/badge, link bertema (sosmed icon otomatis)
- Custom domain per user
- Tier berbayar (analytics lanjut, hapus branding)
- Embed (video, musik), scheduling link aktif
