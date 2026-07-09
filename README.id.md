# 🌳 Tautree

> Alternatif Linktree yang open-source & bisa di-self-host. Tiap user punya satu halaman publik (`/[username]`) berisi daftar link, dikelola lewat dashboard pribadi.

<p>
  <a href="./LICENSE.md"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
  <a href="https://github.com/ByHandi/tautree/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ByHandi/tautree/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Prisma%207-4169E1?logo=postgresql&logoColor=white">
  <a href="./README.md"><img alt="English" src="https://img.shields.io/badge/lang-English-blue"></a>
</p>

🇬🇧 **[Read in English →](./README.md)**  ·  🗺️ **[Roadmap →](./ROADMAP.md)**

<p align="center">
  <img src="./screenshots/tautree_landing_page.png" alt="Landing page Tautree" width="820">
</p>

---

## Kenapa self-host?

Kebanyakan tool link-in-bio itu SaaS tertutup: halaman, analytics, dan audiens lo nyimpen di server orang lain. Tautree ngasih produk yang sama tapi bisa lo jalanin sendiri:

- 🔒 **Data tetap milik lo** — analytics privacy-friendly by design (tanpa IP, tanpa cookie, tanpa fingerprint UA).
- 🎨 **Tanpa branding paksaan** — instance lo, aturan lo.
- 💸 **Tanpa biaya per-seat** — cukup satu container + Postgres buat seluruh tim/komunitas.
- 🧩 **Zero infra eksternal** — thumbnail, QR code, dan OG image di-generate di dalam app (no S3, no layanan gambar pihak ketiga).

## Fitur

- **Halaman publik** `/[username]` — mobile-first, hanya link aktif & terurut, OG image + SEO dinamis
- **Link power-ups** — reorder drag-and-drop, header/divider, scheduling (live/expired), embed YouTube/Spotify, thumbnail kustom, featured/pinned link
- **Tampilan** — 6 tema preset + custom color, font picker, button shape/fill
- **Social** — auto-detect ikon 17 platform, social icon row di header, share + QR code
- **Analytics** — total clicks, tren 30 hari, top sources, device breakdown, custom date range, export CSV
- **Admin** — panel `/admin` (list/cari user, suspend, hapus link/user), seed admin dari `ADMIN_EMAIL`

## Screenshot

<table>
  <tr>
    <td width="50%"><img src="./screenshots/tautree_dashboard.png" alt="Dashboard"><br><sub><b>Dashboard</b></sub></td>
    <td width="50%"><img src="./screenshots/tautree_links.png" alt="Manajemen link"><br><sub><b>Link — drag-and-drop, scheduling, embed</b></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./screenshots/tautree_appearance.png" alt="Tampilan"><br><sub><b>Tampilan — tema, font, varian tombol</b></sub></td>
    <td width="50%"><img src="./screenshots/tautree_analytics.png" alt="Analytics"><br><sub><b>Analytics — tren, sumber, device breakdown</b></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./screenshots/tautree_settings.png" alt="Pengaturan"><br><sub><b>Pengaturan</b></sub></td>
    <td width="50%"></td>
  </tr>
</table>

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Base UI + Radix)
- next-themes (dark mode) + Sonner (toast)
- PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Auth.js (NextAuth v5, JWT) — Google OAuth + magic link
- Vitest (unit test) + GitHub Actions (typecheck + lint + test + build)
- Deploy: Docker / Coolify (self-hosted)

## Mulai cepat (dev lokal)

Butuh **Node 20+** dan **PostgreSQL** yang jalan.

```bash
git clone https://github.com/ByHandi/tautree.git
cd tautree
cp .env.example .env        # lalu isi nilai di bawah
npm install
npm run db:migrate          # buat schema + jalankan migrasi
npm run db:seed             # seed awal (termasuk admin)
npm run dev                 # atau: npm run dev:turbo
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment minimum

Lihat [`.env.example`](./.env.example) untuk daftar lengkap yang terdokumentasi. Yang wajib:

```bash
DATABASE_URL=postgresql://...               # koneksi Postgres
AUTH_SECRET=...                             # generate: `npx auth secret`
NEXT_PUBLIC_APP_URL=http://localhost:3000   # URL kanonik app (tanpa trailing slash)
ADMIN_EMAIL=...                             # user ini di-seed jadi ADMIN
```

Provider login bersifat **opsional & aditif**:
- **Google OAuth** — aktif kalau `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` diset.
- **Magic link** — aktif kalau `EMAIL_SERVER` / `EMAIL_FROM` diset.

Set minimal salah satu biar bisa login. Akun `ADMIN_EMAIL` otomatis dipromosikan jadi admin saat startup (login lewat magic link untuk email itu).

## Deployment / self-hosting

### Docker Compose

[`docker-compose.yml`](./docker-compose.yml) yang disediakan menjalankan container app dan mengharapkan **PostgreSQL di host machine** (diakses via `host.docker.internal`). Migrasi jalan otomatis saat startup — `entrypoint.sh` menjalankan `prisma migrate deploy` sebelum server nyala.

```bash
cp .env.example .env
# Di .env, arahkan DATABASE_URL ke host, contoh:
#   DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/tautree?schema=public"
# lalu set AUTH_TRUST_HOST=true dan NEXT_PUBLIC_APP_URL produksi.

docker compose up -d --build
```

> Mau Postgres full di container? Tambah service `db` dan arahkan `DATABASE_URL` ke `db:5432`. Variabel `POSTGRES_*` di `.env.example` sudah siap buat itu.

### Coolify

Tautree berjalan di produksi lewat [Coolify](https://coolify.io):

1. **New Resource → Docker Compose**, arahkan ke repo ini.
2. Tambahkan environment variable dari `.env.example` (minimal `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `AUTH_TRUST_HOST=true`, dan satu provider login).
3. Deploy. Coolify mengurus TLS; migrasi jalan saat container start.

### Checklist produksi

- [ ] `AUTH_SECRET` diisi nilai acak yang kuat (`npx auth secret`)
- [ ] `AUTH_TRUST_HOST=true` (di belakang reverse proxy)
- [ ] `NEXT_PUBLIC_APP_URL` diisi URL publik lo (tanpa trailing slash)
- [ ] Minimal satu provider login dikonfigurasi (Google dan/atau magic link)
- [ ] `ADMIN_EMAIL` diisi akun lo
- [ ] Backup database dijadwalkan

## Struktur proyek

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

## Komponen UI

Komponen shadcn-style ada di `components/ui`. Ikon dipanggil lewat komponen `Icon` (lucide
`DynamicIcon`, prop `name` kebab-case), bukan import per-ikon. Tersedia juga wrapper form
siap pakai: `InputText`, `InputTextarea`, `InputNumber`, `InputSelect`, `InputCombobox`,
`InputSwitch`, `InputCheckbox`, `DatePicker`, `DateRangePicker`, dll.

Tambah komponen baru:

```bash
npx shadcn@latest add <component>
```

## Kontribusi

Issue & PR sangat diterima — lihat [`CONTRIBUTING.md`](./CONTRIBUTING.md) untuk setup, konvensi, dan alur kerjanya. Jalankan `npm run lint`, `npm run typecheck`, dan `npm run test` sebelum buka PR — CI mewajibkan ketiganya plus build.

## Keamanan

Nemu celah keamanan? **Jangan** buka issue publik — lihat [`SECURITY.md`](./SECURITY.md) untuk disclosure privat.

## Lisensi

[MIT](./LICENSE.md) © ByHandi
