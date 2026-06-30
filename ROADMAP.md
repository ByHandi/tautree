# 🌳 Tautree — Roadmap v2

Linktree-style SaaS: tiap user punya satu halaman publik (`tautree.com/username`) berisi daftar link, dikelola lewat dashboard pribadi.

> **v1 (MVP) sudah selesai & live di Coolify.** Roadmap ini fokus ke fase pasca-launch: hardening, fitur bernilai langsung, analytics, dan monetisasi. Detail v1 ada di bagian [Arsip v1](#arsip--v1-mvp-selesai) di bawah.

## Tech Stack

| Layer | Pilihan | Status |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript | ✅ |
| UI | shadcn v4 (Base UI + Radix) + Tailwind v4 | ✅ |
| Theme/Toast | next-themes + sonner | ✅ |
| Database | PostgreSQL (host-resident, via Docker Compose) | ✅ |
| ORM | Prisma 7 | ✅ |
| Auth | Auth.js (NextAuth v5, JWT) — Google + magic link | ✅ |
| Testing | Vitest (unit) | ✅ |
| CI | GitHub Actions (typecheck + lint + test) | ✅ |
| Deploy | Coolify (self-hosted, Docker) | ✅ |

## Data Model (saat ini)

```
User   → id, email, username, name, bio, avatarUrl, theme, customTheme(Json), role(USER|ADMIN), suspended
Link   → id, userId, title, url, order, isActive, clicks
Click  → id, linkId, createdAt   # time-series analytics
+ Auth.js: Account, Session, VerificationToken
```

---

## Fase 6 — Production Hardening 🛡️
> De-risk yang udah live. Prioritas tertinggi.

- [x] CI: tambah step `build` (tangkap error RSC sebelum deploy)
- [x] Global `app/error.tsx` + `global-error.tsx` + `not-found.tsx` + dashboard `loading.tsx`
- [x] Refactor logika gating → `isLinkLive` (`lib/links.ts`) + `isProfilePublic` (`lib/profile.ts`), dipakai di page/OG/redirect, + unit test anti-regresi
- [x] `robots.ts` + `sitemap.ts` (`force-dynamic`, profil non-suspended ber-username)
- [ ] Rate limit durable (Postgres/Redis) — **trigger: saat scale > 1 container**
- [ ] Error monitoring (Sentry / log terstruktur) — opsional tapi murah
- [ ] Keputusan: suspended = sembunyi publik (sekarang) **atau** blokir login total?

## Fase 7 — Link Power-ups ⚡
> Nilai langsung kelihatan di halaman publik.

- [x] Auto social icons — `detectPlatform` (`lib/social.ts`) + `SocialIcon` (simple-icons, 17 platform) di tombol publik, fallback globe
- [x] Scheduling link — kolom `startsAt`/`endsAt` (null = tanpa batas), gating di `isLinkLive` + `liveScheduleWhere` (query publik & redirect), datetime-local di dialog (ISO/UTC, timezone-safe), badge Scheduled/Expired di dashboard, unit test
- [x] Tipe link baru: header/divider (grouping) — enum `LinkType` (`LINK`/`HEADER`), `url` nullable, render section label di halaman publik, type selector + badge di dashboard, gating redirect anti header, unit test `parseLinkKind`
- [x] Embed — YouTube/Spotify inline via `LinkType.EMBED` + `lib/embed.ts` (`getEmbed` parse URL→iframe src, id di-sanitasi), render iframe responsif (YT 16:9, Spotify tinggi adaptif) di halaman publik, opsi Embed di dialog + validasi provider, unit test
- [x] Thumbnail/icon kustom per link — kolom `thumbnail` (data URI), resize di client (canvas 128px → WebP), validasi + cap ukuran server (`parseThumbnail`, tolak svg/non-image), upload/preview/remove di dialog, render di tombol publik (override social icon), unit test. Zero-infra (no S3/volume).

## Fase 8 — Analytics & Growth 📈
> Bikin user balik & ngerti performa.

- [x] Analytics lanjut: referrer + device (geo ditunda — perlu geo-IP) — model `ProfileView` (device + referrer host, tanpa IP/UA/cookie), `<ViewTracker>` client beacon kirim `document.referrer` ke `/api/v/[id]`, helper `lib/analytics.ts` (`classifyDevice`/`isBot`/`referrerLabel`) + unit test, dashboard nampilin Views/Top sources/Devices
- [x] Export analytics ke CSV — route `GET /dashboard/analytics/export` (auth, ikut `?from&to` + `resolveRange`), CSV harian (date/views/clicks) via `toCsv` (escape RFC-4180), tombol download di dashboard, unit test
- [x] QR code per halaman profil — generate PNG data URI server-side (`qrcode`, pure-JS, EC level H) untuk URL publik; `<QrCard>` nampilin QR + brand logo di tengah + URL caption, tombol Download PNG composite QR+logo+URL ke canvas client-side (logo & URL ikut ke file)
- [x] Range tanggal custom di dashboard analytics — `resolveRange` (default 30 hari, cap 366, validasi + clamp) + `<AnalyticsRangePicker>` (date-range-picker → URL `?from&to`), semua query (clicks/views/devices/sources) ikut window, series harian dinamis, unit test

## Fase 9 — Monetisasi 💳 (opsional)
> Kalau mau jadiin produk berbayar.

- [ ] Tier berbayar: hapus branding "Made with Tautree", analytics lanjut, link unlimited
- [ ] Billing — Stripe / Lemon Squeezy + webhook → update tier di DB
- [ ] Verifikasi/badge centang
- [ ] Panel admin: lihat tier & status billing per user

## Fase 10 — Custom Domain 🌐 (paling kompleks)
> User pakai domain sendiri (`links.budi.com`).

- [ ] Tambah domain per user + verifikasi kepemilikan via DNS TXT
- [ ] Routing multi-tenant (middleware: map host → username)
- [ ] TLS otomatis (Coolify/Caddy on-demand cert)

---

## Arsip — v1 (MVP, selesai)

<details>
<summary>Fase 0–5 — semua ✅</summary>

- **Fase 0 — Fondasi:** route group dashboard, root layout publik, landing, bersihin template registry.
- **Fase 1 — Data Layer:** Postgres + Prisma 7 (generator `prisma-client`, driver adapter `@prisma/adapter-pg`, config di `prisma.config.ts`), model + migrasi + seed.
- **Fase 2 — Auth & Onboarding:** Auth.js v5 JWT, Google + magic link, adapter Prisma, middleware proteksi, onboarding username real-time. `allowDangerousEmailAccountLinking` aktif di Google (aman, email terverifikasi).
- **Fase 3 — Dashboard CRUD:** list/tambah/edit/hapus link, reorder drag-and-drop (`dnd-kit`), toggle aktif, edit profil.
- **Fase 4 — Halaman Publik:** `/[username]` mobile-first, hanya link aktif & terurut, track klik via `/api/r/[id]`, 404 state, OG image + SEO dinamis. Gating `suspended` di semua jalur (page, OG, redirect).
- **Fase 5 — Polish SaaS:** 6 preset tema **+ custom color** (color picker, palette Json, validasi hex-only), analytics dasar (grafik 30 hari, model `Click`), validasi URL + rate limit, deploy Coolify, **panel admin** (`/admin`: role di DB, list+cari user, suspend, hapus link/user), **admin seed** dari `ADMIN_EMAIL` (idempotent, di entrypoint).
- **Hardening awal:** Vitest (32 unit test untuk validasi keamanan) + CI GitHub Actions.

</details>
