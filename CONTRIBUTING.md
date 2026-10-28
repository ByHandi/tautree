# Contributing to Tautree

Thanks for your interest in improving Tautree! This guide covers how to set up the
project, the conventions we follow, and how to get a change merged.

🇮🇩 Boleh buka issue/PR dalam Bahasa Indonesia atau Inggris — keduanya diterima.

## Ways to contribute

- 🐛 **Report bugs** — use the [bug report template](./.github/ISSUE_TEMPLATE/bug_report.yml).
- ✨ **Request features** — check the [ROADMAP](./ROADMAP.md) and open issues first, then use the [feature template](./.github/ISSUE_TEMPLATE/feature_request.yml).
- 🔧 **Send a PR** — bug fixes, features, docs, or tests are all welcome.
- 💬 **Discuss** — questions and ideas go in [Discussions](https://github.com/ByHandi/tautree/discussions).

For anything non-trivial, please open an issue to discuss before you build it — it saves everyone a round-trip.

By participating, you're expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development setup

Requires **Node 24** and a running **PostgreSQL** instance.

```bash
# 1. Fork, then clone your fork
git clone https://github.com/<you>/tautree.git
cd tautree

# 2. Environment
cp .env.example .env      # set DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL,
                          # ADMIN_EMAIL, and at least one login provider

# 3. Install + database
npm install
npm run db:migrate        # create schema + run migrations
npm run db:seed           # seed initial data (incl. admin)

# 4. Run
npm run dev               # or: npm run dev:turbo
```

Open [http://localhost:3000](http://localhost:3000). See the [README](./README.md#quick-start-local-dev) for more on env vars and login providers.

## Before you open a PR

CI runs typecheck, lint, test, **and** build — all four must pass. Run them locally first:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm run format` (Prettier) keeps formatting consistent — run it before committing.

## Project conventions

- **Next.js 15 App Router** — this repo tracks a fast-moving Next.js. Before touching framework internals, read the relevant guide in `node_modules/next/dist/docs/` (see [`AGENTS.md`](./AGENTS.md)); APIs may differ from older versions.
- **Domain logic lives in `lib/`** — pure, testable functions (links, profile, analytics, social, embed, fonts, button-style, themes, username, admin). New business rules belong here, not in components.
- **Tests** — `lib/` modules have colocated Vitest unit tests. If you add or change domain logic (especially anything touching access control, validation, or gating), add/update tests. Security-sensitive helpers (`isLinkLive`, `isProfilePublic`, thumbnail/embed validation) should stay well-covered.
- **UI components** — shadcn-style components in `components/ui`. Render icons via the `Icon` component (lucide `DynamicIcon`, kebab-case `name`), not per-icon imports. Prefer the existing form wrappers (`InputText`, `InputSelect`, `DatePicker`, …). Add new shadcn components with `npx shadcn@latest add <component>`.
- **Database changes** — edit `prisma/schema.prisma`, then generate a migration with `npm run db:migrate`. **Commit the generated migration** in `prisma/migrations/`. Never edit an already-committed migration.
- **Privacy** — analytics are intentionally IP/cookie/UA-free. Keep it that way; don't introduce tracking that identifies visitors.

## Commit & PR conventions

- **Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Write a clear, imperative subject.
- **Branch** off `dev` (the integration branch); every development PR (features, fixes, chores, docs) targets `dev`.
- **Releases** — when a milestone is complete, a maintainer opens a release PR `dev` → `main`. `main` only moves through these release PRs.
- **Keep PRs focused** — one logical change per PR is easier to review.
- Fill in the [PR template](./.github/pull_request_template.md) checklist.
- **Link the issue by hand** in the PR's **Development** sidebar. PRs target `dev`, not the default branch, so `Closes #123` in the description doesn't link or auto-close the issue — close it by hand once the PR is merged into `dev`.
- For UI changes, include before/after screenshots.

## Reporting security issues

Please **don't** open a public issue for vulnerabilities — see [`SECURITY.md`](./SECURITY.md) for private disclosure.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE.md).
