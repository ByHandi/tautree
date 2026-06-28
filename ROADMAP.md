# 🌳 Tautree — Roadmap

Linktree-style SaaS: tiap user punya satu halaman publik (`tautree.com/username`) berisi daftar link, dikelola lewat dashboard pribadi.

## Tech Stack

| Layer | Pilihan | Status |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript | ✅ ada |
| UI | shadcn v4 (Base UI + Radix) + Tailwind v4 | ✅ ada |
| Theme/Toast | next-themes + sonner | ✅ ada |
| Database | PostgreSQL (Neon / Supabase free tier) | ⬜ belum |
| ORM | Prisma | ⬜ belum |
| Auth | Auth.js (NextAuth v5) | ⬜ belum |
| Deploy | Vercel | ⬜ belum |

**Keputusan:** Monolith Next.js (FE + API jadi satu). **Tanpa** NestJS & **tanpa** Payload — overkill untuk CRUD user-generated. Bisa diekstrak ke service terpisah nanti kalau backend tumbuh kompleks.

## Data Model

```
User   → id, email, username (unik → slug URL), name, bio, avatarUrl, theme, createdAt
Link   → id, userId, title, url, order, isActive, clicks, createdAt
Click  → id, linkId, createdAt, (opsional: referrer, country)   # analytics, fase lanjut
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

## Fase 2 — Auth & Onboarding
> User bisa daftar, login, dan klaim username.

- [ ] Setup Auth.js (Google + email/magic link)
- [ ] Adapter Prisma untuk Auth.js
- [ ] Middleware proteksi route `/dashboard`
- [ ] Flow onboarding: pilih `username` unik (cek ketersediaan real-time)

## Fase 3 — Dashboard (CRUD Link)
> Inti produk: user kelola link-nya sendiri.

- [ ] Halaman `/dashboard` — list link milik user
- [ ] Tambah / edit / hapus link (pakai komponen `Input*` yang udah ada)
- [ ] Reorder link via drag-and-drop (`dnd-kit`)
- [ ] Toggle aktif/nonaktif per link
- [ ] Edit profil: nama, bio, avatar

## Fase 4 — Halaman Publik
> Yang dilihat dunia.

- [ ] Route `/[username]` — render profil + tombol link (mobile-first)
- [ ] Hanya tampilkan link `isActive`, urut sesuai `order`
- [ ] Track klik (increment `clicks` / insert `Click`)
- [ ] State `404` untuk username tak ada
- [ ] OG image & metadata SEO per halaman

## Fase 5 — Polish SaaS
> Bikin layak jadi produk.

- [ ] Tema/warna kustom per halaman (preset + custom)
- [ ] Analytics dasar (total klik, klik per link, grafik)
- [ ] Rate limiting & validasi URL
- [ ] Deploy ke Vercel + domain
- [ ] (Opsional) Panel admin buat moderasi user

---

## Backlog / Ide Lanjutan
- Verifikasi/badge, link bertema (sosmed icon otomatis)
- Custom domain per user
- Tier berbayar (analytics lanjut, hapus branding)
- Embed (video, musik), scheduling link aktif
