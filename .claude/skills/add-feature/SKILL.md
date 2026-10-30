---
name: add-feature
description: Build a feature end to end in this repo (Tautree) the way the codebase already does it — Prisma model + committed migration, pure validation/gating helpers in `lib/` with colocated Vitest tests, `"use server"` actions next to the route (session check, owner-scoped writes, `{ error, ok }` form state, `revalidatePath` incl. the public `/[username]` page), route handlers under `app/api/` (rate limit, privacy-friendly), a server `page.tsx` that selects and serializes data for a client component using `useActionState` + toasts, the `Icon` component and form wrappers, plus CHANGELOG, bilingual docs, and the CI checks. Use whenever the user wants a new capability in the dashboard, the public profile page, the admin panel or the API — "tambah fitur", "bikin halaman baru", "tambah field di link", "tambah setting", "bikin endpoint", link types, profile/appearance options, analytics breakdowns, vCard, custom domains — even if they only describe the database, only the UI, or only the public page.
---

# Add a feature (Tautree: Next.js 15 App Router + Prisma)

A feature here usually crosses five layers. Build them in this order, because each one's
types are the next one's input, and the compiler then tells you what's missing:

1. **Data** — `prisma/schema.prisma` + a committed migration (only if needed)
2. **Domain logic** — pure functions in `lib/` + Vitest tests
3. **Server** — server actions (`actions.ts` next to the route) or route handlers (`app/api/`)
4. **Components** — client components next to the route, shared ones in `components/`
5. **Route** — the server `page.tsx` in `app/`, and the sidebar entry for a new page

Then CHANGELOG, docs, and the checks CI runs.

Before writing, read the closest existing feature end to end and copy its shape:

| Feature      | Domain logic                         | Server                                                  | UI                                                             |
| ------------ | ------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------- |
| Links        | `lib/links.ts` (+ `links.test.ts`)   | `app/(dashboard)/dashboard/links/actions.ts`            | `links/page.tsx` → `links-manager.tsx`, `link-form-dialog.tsx` |
| Social links | `lib/social.ts` (+ test)             | `app/(dashboard)/dashboard/settings/actions.ts`         | `settings/social-links-manager.tsx`                            |
| Analytics    | `lib/analytics.ts` (+ test)          | `app/api/r/[id]`, `app/api/v/[id]`, `analytics/export/` | `analytics/page.tsx`                                           |
| Public page  | `lib/profile.ts`, `lib/themes.ts`, … | —                                                       | `app/[username]/page.tsx`, `opengraph-image.tsx`               |
| Admin        | `lib/admin.ts` (`requireAdmin`)      | `app/admin/actions.ts`                                  | `app/admin/page.tsx`, `admin-users-table.tsx`                  |

This is **not the Next.js you know**: before using a framework API (server actions, route
handlers, `params`, caching, metadata, OG images), read its guide in `node_modules/next/dist/docs/`
and copy how the repo already uses it.

Language rule: all code, comments, error messages, UI copy and docs are English, even when the
user writes to you in Indonesian.

## 0. Pin down the behavior first

State back, briefly, before coding: what is stored (new model or new fields), who sees it (the
owner in the dashboard, visitors on `/[username]`, admins), the validation rules and their
exact messages, any limits (like `SOCIAL_MAX`), and how it behaves on the public page for
suspended users, inactive links and scheduled links. If something is ambiguous and changes the
design (e.g. "featured" = one per user or many? shown in the OG image too?), ask.

Security-sensitive work — anything touching access control, gating (`isLinkLive`,
`isProfilePublic`), user-supplied URLs, thumbnails/embeds, or rate limits — needs a test that
the unsafe case is rejected. Plan that test now. Analytics stay privacy-friendly: no IP
addresses, cookies, or full user agents are stored.

## 1. Data

Edit `prisma/schema.prisma` following the existing models:

- `id String @id @default(uuid(7))`, camelCase fields with `@map("snake_case")`, the table
  name with `@@map("plural_snake")`, `createdAt DateTime @default(now()) @map("created_at")`.
- Per-user data: `userId String @map("user_id")`, a relation with `onDelete: Cascade`, and
  `@@index([userId])`. Ordered lists get `order Int @default(0)` (see `Link`, `SocialLink`).
- A new required column on an existing table needs a default or a backfill, or the migration
  fails on real data.

Then create the migration (needs the local PostgreSQL from `.env`):

```bash
npm run db:migrate -- --name add_thing   # prisma migrate dev; also regenerates the client
```

Read the generated `prisma/migrations/<timestamp>_add_thing/migration.sql` before moving on.
Migrations run automatically on container start (`entrypoint.sh` → `prisma migrate deploy`), so
they hit production data on the next deploy and aren't reverted on rollback. **Never edit a
migration that is already committed**; fix forward with a new one. Update `prisma/seed.ts` if
the seed should create the new data. If no database is available, say so and stop at the
schema change instead of hand-writing the SQL.

The client is generated into `lib/generated/prisma` (gitignored). Import the shared client as
`import { db } from "@/lib/db"`.

## 2. Domain logic (`lib/`)

New rules go in a pure function in the `lib/` module for that resource (new resource → new
file), not in actions or components:

- Validators return a result type instead of throwing, like `lib/links.ts`:
  `{ ok: true; url: string } | { ok: false; reason: string }`. The `reason` is the message the
  user sees, a full sentence in sentence case (`"Only YouTube and Spotify links can be
embedded."`).
- Normalize, then validate (`normalizeUrl` trims, adds `https://`, rejects non-http schemes).
- Export limits as constants (`TITLE_MAX`, `SOCIAL_MAX`, `THUMBNAIL_MAX_CHARS`) so the UI can
  use the same numbers for `maxLength` and hints.
- Gating that the public page, the OG image, and the redirect/view routes must all agree on
  lives in one helper (`isLinkLive`, `isProfilePublic`, `liveScheduleWhere`). Extend it rather
  than repeating the condition.

Add tests to the colocated `lib/<module>.test.ts` (Vitest, `describe`/`it`/`expect`, one
behavior per `it`, plain-English names like `"is dark when the owner is suspended, even if
active"`). Cover the happy path, every validation message, the limits (exactly at and one over),
and the unsafe input being rejected.

## 3. Server

### Server actions (`app/.../<route>/actions.ts`)

Copy `app/(dashboard)/dashboard/links/actions.ts`:

```ts
"use server";

export type ThingFormState = { error?: string; ok?: boolean } | undefined;

export async function createThing(
  _prev: ThingFormState,
  formData: FormData,
): Promise<ThingFormState> {
  const userId = await requireUserId(); // auth() → redirect("/login") when signed out

  const name = validateThingName(String(formData.get("name") ?? ""));
  if (!name.ok) return { error: name.reason };

  try {
    await db.thing.create({ data: { userId, name: name.name } });
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  revalidate();
  return { ok: true };
}
```

- **Check the session in every action**, and never trust an ID from the client: scope writes
  to the owner with `updateMany` / `deleteMany({ where: { id, userId } })` and treat
  `count === 0` as `"Thing not found."`. Admin actions start with `await requireAdmin()`.
- Form actions take `(_prev, formData)` for `useActionState` and return the form state. Simple
  actions (toggle, delete, reorder) take plain arguments and return `void`.
- Validate through the `lib/` helpers; when create and update share fields, parse them in one
  function (`parseLinkForm`).
- `revalidatePath` every page that shows the data: the dashboard page(s) and, when visitors see
  it, the public page `/${username}` (see `updateProfile`).
- Keep each function under the complexity limits (cyclomatic 15, cognitive 15); split out
  helpers like `parseLinkForm` / `requireUserId` instead of raising a limit.

### Route handlers (`app/api/<name>/route.ts`)

For endpoints hit by visitors or by the browser outside a form (redirects, view beacons, QR,
CSV export). Copy `app/api/r/[id]/route.ts`:

- `params` is a promise: `{ params }: { params: Promise<{ id: string }> }` → `await params`.
- Public endpoints apply the same gating as the public page and fail quietly (redirect home, 204) rather than leaking whether something exists.
- Throttle writes per visitor with ``rateLimit(`<name>:${clientIp(req)}:${id}`, { … })`` and
  make analytics writes best-effort (a failed write never blocks the response). Don't store the
  IP.
- Authenticated handlers check `auth()` and return 401 (see `analytics/export/route.ts`).

## 4. Components

- Client components start with `"use client"` and sit next to the route that uses them;
  move one to `components/` only when a second route needs it.
- Forms: `const [state, formAction, isPending] = useActionState<ThingFormState, FormData>(createThing, undefined)`,
  a `useEffect` that toasts (`sonner`) and closes/resets on `state?.ok`, and the error under the
  form as `{state?.error && <p className="text-sm text-destructive">{state.error}</p>}`. Copy
  `link-form-dialog.tsx` (dialog) or `social-links-manager.tsx` (inline form).
- Non-form actions (toggle, delete, reorder) run in `startTransition(async () => …)` from
  `useTransition`; lists keep a local copy for optimistic updates and resync with
  `useEffect(() => setItems(props), [props])` (see `links-manager.tsx`).
- Inputs: the wrappers in `components/ui` (`InputText`, `InputSelect`, `InputSwitch`,
  `DatePicker`, …). Icons: `<Icon name="kebab-case-lucide-name" />` from
  `@/components/ui/icon`. New shadcn primitives: `npx shadcn@latest add <component>`.
- Destructive actions ask for confirmation first, like deleting a link.
- Must work at phone width and in dark mode; reuse the existing tokens (`text-muted-foreground`,
  `bg-muted`, …) instead of new colors. The public page is styled by the user's theme
  (`lib/themes.ts`, `lib/button-style.ts`, `lib/fonts.ts`), so test it with a couple of themes.

## 5. Route

- `page.tsx` is a server component: `auth()` (redirect to `/login`), then a Prisma query with
  an explicit `select` and the owner in `where`. Serialize what a client component can't take
  (`Date` → `toISOString()`), as in `links/page.tsx`.
- Dashboard page layout: `<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">`
  with an `h1` (`text-2xl font-semibold tracking-tight`) and a `text-sm text-muted-foreground`
  description, then the client component.
- A new dashboard page → add it to `navItems` in `components/app-sidebar.tsx` with a lucide
  icon name.
- Public page changes go in `app/[username]/page.tsx` and, if they affect the preview,
  `opengraph-image.tsx`. Both must respect `isProfilePublic` and the link gating.

## 6. Finish

1. `CHANGELOG.md`: a line under `## [Unreleased]` → `### Added` / `### Changed` / `### Fixed` /
   `### Security` for anything user-visible, written for people who use or self-host Tautree.
   Mention a new migration ("runs automatically on startup") or a new environment variable.
2. Docs:
   - New env vars: `.env.example` (with a comment) and the README env section, in **both**
     `README.md` and `README.id.md`.
   - ROADMAP: tick the item in **both** `ROADMAP.md` and `ROADMAP.id.md` if this completes one.
3. Run what CI runs (`.github/workflows/ci.yml` is the source of truth if it has changed):

   ```bash
   npx prettier --check .   # or --write on the files you touched
   npm run typecheck
   npm run lint
   npm test
   npm audit --omit=dev --audit-level=critical
   npm run build
   ```

   Add `docker build --target runner .` if you touched dependencies, the Dockerfile, or
   `entrypoint.sh`.

4. If the database is up (`npm run dev`, or the `dev` entry in `.claude/launch.json`), click
   through the feature in the browser: the dashboard flow, the public page (including a
   suspended user or an inactive/scheduled link if gating changed), phone width, and dark mode.
   If you couldn't, say so.

Don't commit or push; the user commits themselves. End with a short summary: files per layer,
the migration (if any), tests added, check results, what you verified in the browser, and
anything left for the user to decide.
