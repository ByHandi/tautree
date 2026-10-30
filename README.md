# <img src="./brand/tautree-app-icon.svg" alt="" width="28" align="center"> Tautree

> A self-hostable, open-source Linktree alternative. Every user gets one public page (`/[username]`) with a list of links, managed from a personal dashboard.

<p>
  <a href="./LICENSE.md"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
  <a href="https://github.com/ByHandi/tautree/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ByHandi/tautree/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Prisma%207-4169E1?logo=postgresql&logoColor=white">
  <a href="./README.id.md"><img alt="Bahasa Indonesia" src="https://img.shields.io/badge/lang-Bahasa%20Indonesia-red"></a>
</p>

🇮🇩 **[Baca dalam Bahasa Indonesia →](./README.id.md)** · 🗺️ **[Roadmap →](./ROADMAP.md)**

<p align="center">
  <img src="./screenshots/tautree_landing_page.png" alt="Tautree landing page" width="820">
</p>

---

## Why self-host?

Most link-in-bio tools are closed SaaS: your page, your analytics, and your audience live on someone else's server. Tautree gives you the same product you can run yourself:

- 🔒 **Your data stays yours** — analytics are privacy-friendly by design (no IP, no cookies, no UA fingerprint).
- 🎨 **No forced branding** — it's your instance, your rules.
- 💸 **Zero per-seat cost** — run one container + Postgres for your whole team or community.
- 🧩 **Zero external infra** — thumbnails, QR codes, and OG images are generated in-app (no S3, no third-party image service).

## Features

- **Public page** `/[username]` — mobile-first, active + ordered links only, dynamic OG image + SEO
- **Link power-ups** — drag-and-drop reorder, header/divider grouping, scheduling (live/expired), YouTube/Spotify embeds, custom thumbnails, featured/pinned link
- **Appearance** — 6 preset themes + custom color, font picker, button shape/fill variants
- **Social** — auto-detected icons for 17 platforms, social icon row in the header, share + QR code, opt-in "Save contact" vCard
- **Analytics** — total clicks, 30-day trend, top sources, device breakdown, custom date range, CSV export
- **Admin** — `/admin` panel (list/search users, suspend, delete link/user), admin seeded from `ADMIN_EMAIL`

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="./screenshots/tautree_dashboard.png" alt="Dashboard"><br><sub><b>Dashboard</b></sub></td>
    <td width="50%"><img src="./screenshots/tautree_links.png" alt="Links manager"><br><sub><b>Links — drag-and-drop, scheduling, embeds</b></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./screenshots/tautree_appearance.png" alt="Appearance"><br><sub><b>Appearance — themes, fonts, button variants</b></sub></td>
    <td width="50%"><img src="./screenshots/tautree_analytics.png" alt="Analytics"><br><sub><b>Analytics — trend, sources, device breakdown</b></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./screenshots/tautree_settings.png" alt="Settings"><br><sub><b>Settings</b></sub></td>
    <td width="50%"></td>
  </tr>
</table>

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Base UI + Radix)
- next-themes (dark mode) + Sonner (toast)
- PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Auth.js (NextAuth v5, JWT) — Google OAuth + magic link
- Vitest (unit tests) + GitHub Actions (typecheck + lint + test + build)
- Deploy: Docker / Coolify (self-hosted)

## Quick start (local dev)

Requires **Node 24** and a running **PostgreSQL** instance.

```bash
git clone https://github.com/ByHandi/tautree.git
cd tautree
cp .env.example .env        # then fill in the values below
npm install
npm run db:migrate          # create schema + run migrations
npm run db:seed             # initial seed (includes admin)
npm run dev                 # or: npm run dev:turbo
```

Open [http://localhost:3000](http://localhost:3000).

### Minimum environment

See [`.env.example`](./.env.example) for the fully-documented list. The essentials:

```bash
DATABASE_URL=postgresql://...               # Postgres connection
AUTH_SECRET=...                             # generate with `npx auth secret`
NEXT_PUBLIC_APP_URL=http://localhost:3000   # canonical app URL (no trailing slash)
ADMIN_EMAIL=...                             # this user is seeded as ADMIN
```

Login providers are **optional and additive**:

- **Google OAuth** — enabled when `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` are set.
- **Magic link** — enabled when `EMAIL_SERVER` / `EMAIL_FROM` are set.

Set at least one so you can sign in. The `ADMIN_EMAIL` account is promoted to admin on startup (sign in via magic link for that email).

## Deployment / self-hosting

### Docker Compose

The bundled [`docker-compose.yml`](./docker-compose.yml) runs the app container and expects **PostgreSQL on the host machine** (reached via `host.docker.internal`). Migrations run automatically on startup — `entrypoint.sh` runs `prisma migrate deploy` before launching the server.

```bash
cp .env.example .env
# In .env, point DATABASE_URL at the host, e.g.:
#   DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/tautree?schema=public"
# and set AUTH_TRUST_HOST=true plus a production NEXT_PUBLIC_APP_URL.

docker compose up -d --build
```

> Prefer a fully containerized Postgres? Add a `db` service and point `DATABASE_URL` at `db:5432` instead. The `POSTGRES_*` vars in `.env.example` are ready for that.

### Coolify

Tautree is deployed in production on [Coolify](https://coolify.io):

1. **New Resource → Docker Compose**, point it at this repo.
2. Add the environment variables from `.env.example` (at minimum `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `AUTH_TRUST_HOST=true`, and one login provider).
3. Deploy. Coolify handles TLS; migrations run on container start.

### Production checklist

- [ ] `AUTH_SECRET` set to a strong random value (`npx auth secret`)
- [ ] `AUTH_TRUST_HOST=true` (behind a reverse proxy)
- [ ] `NEXT_PUBLIC_APP_URL` set to your public URL (no trailing slash)
- [ ] At least one login provider configured (Google and/or magic link)
- [ ] `ADMIN_EMAIL` set to your account
- [ ] Database backups scheduled

## Project structure

```
app/
  page.tsx                # public landing page
  [username]/             # public per-user page
  (auth)/login            # sign in
  onboarding/             # pick a username
  (dashboard)/dashboard/  # dashboard (links, analytics, profile, appearance)
  admin/                  # admin panel
  api/                    # auth, r/[id] redirect+click, v/[id] view, qr/[username], vcard/[username], username
components/
  ui/                     # shadcn components + Icon (DynamicIcon) + form wrappers (Input*)
  app-sidebar.tsx · logo.tsx · social-icon.tsx · qr-card.tsx · share-button.tsx
lib/                      # domain logic + unit tests (links, profile, analytics, social,
                          # embed, fonts, button-style, themes, rate-limit, username, vcard, admin)
prisma/                   # schema.prisma + migrations + seed.ts
brand/                    # brand mark assets (SVG)
```

## Scripts

```bash
npm run dev / dev:turbo   # dev server (Turbopack on :turbo)
npm run build / start     # production build & serve
npm run lint              # eslint
npm run typecheck         # tsc --noEmit
npm run format            # prettier
npm run test / test:watch # vitest

npm run db:migrate        # prisma migrate dev
npm run db:seed           # prisma db seed
npm run db:studio         # prisma studio
npm run db:reset          # reset DB + re-run migrations
```

## UI components

shadcn-style components live in `components/ui`. Icons are rendered through the `Icon`
component (lucide `DynamicIcon`, kebab-case `name` prop) rather than per-icon imports.
Ready-made form wrappers are available: `InputText`, `InputTextarea`, `InputNumber`,
`InputSelect`, `InputCombobox`, `InputSwitch`, `InputCheckbox`, `DatePicker`,
`DateRangePicker`, and more.

Add a new component:

```bash
npx shadcn@latest add <component>
```

## Contributing

Issues and PRs are welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, conventions, and the workflow. Please run `npm run lint`, `npm run typecheck`, and `npm run test` before opening a PR — CI enforces all three plus a build.

## Security

Found a vulnerability? Please **don't** open a public issue — see [`SECURITY.md`](./SECURITY.md) for private disclosure.

## License

[MIT](./LICENSE.md) © ByHandi
