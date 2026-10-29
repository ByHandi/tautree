# Changelog

All notable changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Add user-visible changes under `## [Unreleased]` in the same PR that makes them (PRs target `dev`).
Leave out internal refactors, CI, and tooling changes.

When a milestone is complete, release it:

1. On `dev`, rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD` and add a fresh `[Unreleased]` above it.
2. Merge the release PR `dev` → `main`.
3. Push the tag `vX.Y.Z` on `main`. The GitHub Release notes are that version's section.

## [Unreleased]

## [0.1.1] - 2026-10-29

Security patch. Upgrading: rebuild the image and redeploy. There are no database migrations, new
environment variables, or Docker Compose changes.

### Changed

- Local development now requires Node 24, matching CI and the Docker image (the docs previously
  said Node 20+).

### Security

- Upgraded Next.js from 15.5.19 to 15.5.28, fixing critical advisories including remote code
  execution in the Image Optimization API, server-side request forgery in Server Actions, and
  cache poisoning of SSG/ISR pages. Rebuild and redeploy self-hosted instances.
- Updated vulnerable transitive dependencies (including `proxy-addr`, `fast-uri`, `ip-address`,
  and `sharp`) and Prisma to 7.10.1.
- Known remaining advisories: `@auth/core` (Auth.js) and `nodemailer` 7, which `next-auth` still
  requires (no upstream fix yet), and the PostCSS copy bundled with Next.js 15 (used only at build
  time on the project's own CSS; fixed in Next.js 16).

## [0.1.0] - 2026-07-09

First public, open-source release: a self-hostable Linktree alternative where every user gets one
public page (`your-domain.com/username`) managed from a personal dashboard.

### Added

- Public profile page `/[username]`: mobile-first, shows only active links in the user's order,
  dynamic Open Graph image and SEO metadata, 404 page for unknown usernames.
- Sign-in with Auth.js v5 (Google OAuth and email magic link), username onboarding with a live
  availability check, and profile editing (name, bio, avatar).
- Link management in the dashboard: create, edit, delete, active toggle, and drag-and-drop
  reordering.
- Link types: regular links, headers/dividers to group links into sections, and inline YouTube
  and Spotify embeds.
- Link scheduling with optional start and end dates; scheduled and expired links are hidden from
  the public page and their redirects.
- Custom link thumbnails (downscaled in the browser, validated and size-capped on the server) and
  a featured link pinned to the top of the public page.
- Automatic social platform icons on link buttons (17 platforms) and a social icon row in the
  profile header.
- Appearance settings: 6 preset themes plus a custom color palette, font picker (Sans, Serif, Mono,
  Rounded), and button shape and fill variants, all with a live preview.
- Share button on the public page (copy link, native share, QR code) and a downloadable profile
  QR code in the dashboard.
- Analytics: total clicks, 30-day click trend, profile views with top sources and device
  breakdown, custom date range, and CSV export. Tracking is privacy-friendly: no IP addresses,
  cookies, or user-agent fingerprints are stored.
- Admin panel at `/admin`: list and search users, suspend users, delete links and users. The
  first admin is seeded from `ADMIN_EMAIL`. Suspended profiles are hidden from the public page,
  Open Graph image, and link redirects.
- `robots.txt` and `sitemap.xml` listing public, non-suspended profiles.
- Self-hosting with Docker (multi-stage build, standalone output) and Docker Compose against a
  host-resident PostgreSQL; database migrations and the admin seed run on container startup.
  Configured through `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, the Google and email
  provider variables, and `ADMIN_EMAIL` (see `.env.example`).

### Security

- Rate limiting on the click redirect, profile view, and username availability endpoints (in
  memory, per container).
- URL validation for links and hex-only validation for custom theme colors; thumbnails reject SVG
  and non-image data.

[Unreleased]: https://github.com/ByHandi/tautree/compare/v0.1.1...dev
[0.1.1]: https://github.com/ByHandi/tautree/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ByHandi/tautree/releases/tag/v0.1.0
