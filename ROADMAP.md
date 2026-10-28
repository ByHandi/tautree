# <img src="./brand/tautree-app-icon.svg" alt="" width="28" align="center"> Tautree — Roadmap v2

🇮🇩 **[Baca dalam Bahasa Indonesia →](./ROADMAP.id.md)** · 📖 **[README →](./README.md)**

Linktree-style app: every user gets one public page (`your-domain.com/username`) with a list of links, managed from a personal dashboard.

> **v1 (MVP) is done & live on Coolify.** This roadmap focuses on the post-launch phases: hardening, high-value features, analytics, and monetization. The v1 details are in the [v1 Archive](#archive--v1-mvp-done) at the bottom.

## Tech Stack

| Layer       | Choice                                           | Status |
| ----------- | ------------------------------------------------ | ------ |
| Framework   | Next.js 15 (App Router) + TypeScript             | ✅     |
| UI          | shadcn v4 (Base UI + Radix) + Tailwind v4        | ✅     |
| Theme/Toast | next-themes + sonner                             | ✅     |
| Database    | PostgreSQL (host-resident, via Docker Compose)   | ✅     |
| ORM         | Prisma 7                                         | ✅     |
| Auth        | Auth.js (NextAuth v5, JWT) — Google + magic link | ✅     |
| Testing     | Vitest (unit)                                    | ✅     |
| CI          | GitHub Actions (typecheck + lint + test + build) | ✅     |
| Deploy      | Coolify (self-hosted, Docker)                    | ✅     |

## Data Model (current)

```
User        → id, email, username, name, bio, avatarUrl, theme, customTheme(Json),
              buttonShape, buttonFill, font, role(USER|ADMIN), suspended
Link        → id, userId, type(LINK|HEADER|EMBED), title, url?, thumbnail?, featured,
              order, isActive, clicks, startsAt?, endsAt?
SocialLink  → id, userId, url, order                     # social icon row in the header
Click       → id, linkId, createdAt                       # per-click time-series
ProfileView → id, userId, device, referrer?, createdAt    # privacy-friendly view log (no IP/cookie)
+ Auth.js: Account, Session, VerificationToken
```

---

## Phase 6 — Production Hardening 🛡️

> De-risk what's already live. Highest priority.

- [x] CI: add a `build` step (catch RSC errors before deploy)
- [x] Global `app/error.tsx` + `global-error.tsx` + `not-found.tsx` + dashboard `loading.tsx`
- [x] Refactor gating logic → `isLinkLive` (`lib/links.ts`) + `isProfilePublic` (`lib/profile.ts`), used across page/OG/redirect, + regression unit tests
- [x] `robots.ts` + `sitemap.ts` (`force-dynamic`, non-suspended profiles with a username)
- [ ] Durable rate limiting (Postgres/Redis) — **trigger: when scaling beyond 1 container**
- [ ] Error monitoring (Sentry / structured logs) — optional but cheap
- [ ] Decision: suspended = hidden from public (current) **or** block login entirely?

## Phase 7 — Link Power-ups ⚡

> Value visible directly on the public page.

- [x] Auto social icons — `detectPlatform` (`lib/social.ts`) + `SocialIcon` (simple-icons, 17 platforms) on public buttons, globe fallback
- [x] Link scheduling — `startsAt`/`endsAt` columns (null = no bound), gated in `isLinkLive` + `liveScheduleWhere` (public query & redirect), datetime-local in the dialog (ISO/UTC, timezone-safe), Scheduled/Expired badges in the dashboard, unit tests
- [x] New link types: header/divider (grouping) — `LinkType` enum (`LINK`/`HEADER`), nullable `url`, section labels rendered on the public page, type selector + badge in the dashboard, redirect gating against headers, `parseLinkKind` unit tests
- [x] Embed — inline YouTube/Spotify via `LinkType.EMBED` + `lib/embed.ts` (`getEmbed` parses URL→iframe src, id sanitized), responsive iframe render (YT 16:9, Spotify adaptive height) on the public page, Embed option in the dialog + provider validation, unit tests
- [x] Custom per-link thumbnail/icon — `thumbnail` column (data URI), client-side resize (canvas 128px → WebP), server-side validation + size cap (`parseThumbnail`, rejects svg/non-image), upload/preview/remove in the dialog, rendered on public buttons (overrides the social icon), unit tests. Zero-infra (no S3/volume).

## Phase 8 — Analytics & Growth 📈

> Bring users back and help them understand performance.

- [x] Advanced analytics: referrer + device (geo deferred — needs geo-IP) — `ProfileView` model (device + referrer host, no IP/UA/cookie), `<ViewTracker>` client beacon sends `document.referrer` to `/api/v/[id]`, `lib/analytics.ts` helpers (`classifyDevice`/`isBot`/`referrerLabel`) + unit tests, dashboard shows Views/Top sources/Devices
- [x] CSV analytics export — `GET /dashboard/analytics/export` route (auth, honors `?from&to` + `resolveRange`), daily CSV (date/views/clicks) via `toCsv` (RFC-4180 escaping), download button in the dashboard, unit tests
- [x] Per-profile QR code — server-side PNG data URI generation (`qrcode`, pure-JS, EC level H) for the public URL; `<QrCard>` shows the QR + brand logo in the center + URL caption, Download PNG button composites QR+logo+URL onto a client-side canvas (logo & URL included in the file)
- [x] Custom date range in the analytics dashboard — `resolveRange` (default 30 days, cap 366, validation + clamp) + `<AnalyticsRangePicker>` (date-range-picker → URL `?from&to`), all queries (clicks/views/devices/sources) follow the window, dynamic daily series, unit tests

## Phase 9 — Monetization 💳 (optional)

> If you want to turn it into a paid product.

- [ ] Paid tier: remove "Made with Tautree" branding, advanced analytics, unlimited links
- [ ] Billing — Stripe / Lemon Squeezy + webhook → update tier in the DB
- [ ] Verification/checkmark badge
- [ ] Admin panel: view tier & billing status per user

## Phase 10 — Custom Domain 🌐 (most complex)

> Users bring their own domain (`links.budi.com`).

- [ ] Add a domain per user + verify ownership via DNS TXT
- [ ] Multi-tenant routing (middleware: map host → username)
- [ ] Automatic TLS (Coolify/Caddy on-demand cert)

## Phase 11 — Public Page Enhancements 🎨

> Make the public page more expressive and "yours." All value is visible directly to visitors. ⭐ = priority recommendation (high impact/effort ratio).

**Visual / polish**

- [x] ⭐ Button style variants — `buttonShape`/`buttonFill` columns on User, `lib/button-style.ts` (`linkButtonAppearance` → inline style, validation + defaults), Shape/Fill selectors + live preview in Appearance, applied to buttons & embeds on the public page, unit tests
- [x] Font picker — `font` column on User, `lib/fonts.ts` (`fontStack`/`parseFont`, 4 options: Sans/Serif/Mono/Rounded via CSS stacks — zero extra web fonts), selector + live preview in Appearance, applied to the public page `<main>`, unit tests
- [ ] Cover/banner image — header behind the avatar; **reuse the client-resize pattern from thumbnails**. _(medium)_

**Link content**

- [x] Social icon row — `SocialLink` model (url + order, cap `SOCIAL_MAX`=8), add/remove manager on the Profile page, icons derived via `detectPlatform`/`SocialIcon`, icon row rendered in the public header (opens a new tab, doesn't track clicks)
- [x] Featured/pinned link — `featured` column on Link (LINK only), checkbox in the dialog + star in the dashboard, pinned to the top of the public page as a hero card (larger padding/text/icon), the rest stay ordered + grouped
- [ ] vCard "Save contact" — `.vcf` download button to the phone; a personal-brand differentiator, zero infra. _(small–medium)_

**Growth / interaction**

- [x] ⭐ Share + QR on the public page — `<ShareButton>` (copy link / native share / QR) in the profile corner; QR via the on-demand route `GET /api/qr/[username]` (cached 1 day, doesn't bloat the HTML), a fresh QR is fetched when the dialog opens
- [ ] Email capture / "Subscribe" — collect visitor emails (lead-gen); needs a model + storage + privacy considerations. _(medium, high value)_

## Phase 12 — Development Workflow 🧰

> Align the dev workflow with [Ostra](https://github.com/ByHandi/ostra): process rules enforced by tooling, not just written down. Each item is a GitHub issue, grouped into version milestones.

**[v0.2.0](https://github.com/ByHandi/tautree/milestone/1) — Development Workflow & Quality Gates**

- [x] Branch model — `dev` is the integration branch; every development PR targets `dev`, and when a milestone is complete a release PR merges `dev` → `main`. Documented in CONTRIBUTING.md; CI runs on PRs to `dev` and `main` — [#10](https://github.com/ByHandi/tautree/issues/10)
- [x] `TAUTREE-XX` issue keys + branch naming (`feat/TAUTREE-XX-…`), PRs linked to their issue by hand (Development sidebar; `Closes #N` doesn't work on PRs into `dev`), GitHub Issues as the backlog — [#11](https://github.com/ByHandi/tautree/issues/11)
- [x] `CHANGELOG.md` (Keep a Changelog + SemVer, `[Unreleased]` section, backfill `0.1.0`) — [#12](https://github.com/ByHandi/tautree/issues/12)
- [x] Align the Node version in CONTRIBUTING.md, READMEs and the bug report template with CI/Docker (24) — [#21](https://github.com/ByHandi/tautree/issues/21)
- [x] husky + lint-staged pre-commit hook (Prettier, `eslint --fix`, typecheck) — [#13](https://github.com/ByHandi/tautree/issues/13)
- [x] Complexity limits in ESLint: cyclomatic 15 + `sonarjs/cognitive-complexity` 15 — [#14](https://github.com/ByHandi/tautree/issues/14)
- [ ] CI hardening: read-only permissions, `prettier --check`, `npm audit`, weekly schedule, Docker/compose validation — [#17](https://github.com/ByHandi/tautree/issues/17)
- [ ] Full `AGENTS.md` (task discovery, git policy, feature layer order, conventions, verification) + `CLAUDE.md` importing it — [#15](https://github.com/ByHandi/tautree/issues/15)
- [ ] Feature request template as a mini-PRD (backend design, UI flow, acceptance criteria checklist) — [#16](https://github.com/ByHandi/tautree/issues/16)

**[v0.3.0](https://github.com/ByHandi/tautree/milestone/2) — Release Automation & Maintenance**

- [ ] Release workflow: release PR `dev` → `main` merged → tag `vX.Y.Z` on `main` → CI → GitHub Release with notes from CHANGELOG (GHCR image optional) — [#18](https://github.com/ByHandi/tautree/issues/18)
- [ ] Dependabot: monthly, one grouped PR per ecosystem (npm, docker, compose, actions) — [#19](https://github.com/ByHandi/tautree/issues/19)
- [ ] Project Claude skills (`add-feature`, `cut-release`) + `.claude/launch.json` — [#20](https://github.com/ByHandi/tautree/issues/20)

---

## Archive — v1 (MVP, done)

<details>
<summary>Phases 0–5 — all ✅</summary>

- **Phase 0 — Foundation:** dashboard route group, public root layout, landing page, cleaned-up template registry.
- **Phase 1 — Data Layer:** Postgres + Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg` driver adapter, config in `prisma.config.ts`), models + migrations + seed.
- **Phase 2 — Auth & Onboarding:** Auth.js v5 JWT, Google + magic link, Prisma adapter, protection middleware, real-time username onboarding. `allowDangerousEmailAccountLinking` enabled for Google (safe, verified emails).
- **Phase 3 — Dashboard CRUD:** list/add/edit/delete links, drag-and-drop reorder (`dnd-kit`), active toggle, profile edit.
- **Phase 4 — Public Page:** `/[username]` mobile-first, active + ordered links only, click tracking via `/api/r/[id]`, 404 state, dynamic OG image + SEO. `suspended` gating on every path (page, OG, redirect).
- **Phase 5 — SaaS Polish:** 6 preset themes **+ custom color** (color picker, Json palette, hex-only validation), basic analytics (30-day chart, `Click` model), URL validation + rate limiting, Coolify deploy, **admin panel** (`/admin`: role in the DB, list+search users, suspend, delete link/user), **admin seed** from `ADMIN_EMAIL` (idempotent, at entrypoint).
- **Early hardening:** Vitest (32 security-validation unit tests) + GitHub Actions CI.

</details>
