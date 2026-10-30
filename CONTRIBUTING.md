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

Working with an AI coding assistant? [`AGENTS.md`](./AGENTS.md) (imported by [`CLAUDE.md`](./CLAUDE.md)) condenses this guide into rules for agents.

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
npm install               # also installs the git pre-commit hook (husky)
npm run db:migrate        # create schema + run migrations
npm run db:seed           # seed initial data (incl. admin)

# 4. Run
npm run dev               # or: npm run dev:turbo
```

Open [http://localhost:3000](http://localhost:3000). See the [README](./README.md#quick-start-local-dev) for more on env vars and login providers.

## Pre-commit hook

`npm install` sets up a [husky](https://typicode.github.io/husky/) pre-commit hook that runs [lint-staged](https://github.com/lint-staged/lint-staged) on the staged files (config in `package.json`):

- `*.{js,jsx,mjs,ts,tsx}`: `prettier --write`, then `eslint --fix`
- `*.{json,css,md,yml,yaml}`: `prettier --write`
- then `npm run typecheck`, only when the commit touches code, `package.json`, or `tsconfig.json`

Formatting and auto-fixable lint issues are fixed and re-staged automatically; anything else (lint errors, type errors) blocks the commit. CI runs the same checks, so skipping the hook (`git commit --no-verify`) only moves the failure to the PR.

## Complexity limits

Functions are kept small enough to follow at a glance. ESLint enforces both limits (so `npm run lint`, the pre-commit hook, and CI all catch them):

| Rule                           | Max |
| ------------------------------ | --- |
| `complexity` (cyclomatic)      | 15  |
| `sonarjs/cognitive-complexity` | 15  |

When a function grows past a limit, split it into well-named helpers — a pure function for logic that doesn't need component state, a lookup table instead of a ternary chain, a presentational subcomponent (at module level, taking props) for a block of JSX — instead of raising the limit or disabling the rule. `components/ui` (shadcn primitives and the form wrappers built on them) is exempt from `complexity` only, because it counts every prop default and `?.`; cognitive complexity still applies there.

## Before you open a PR

CI (`.github/workflows/ci.yml`) runs on every PR to `dev` and `main`, on pushes to both, and weekly
on Monday 00:00 UTC. It checks formatting, typecheck, lint, tests, a dependency audit, and the
build, and in a separate job validates `docker-compose.yml` and builds the Docker image. Run the
same checks locally first:

```bash
npx prettier --check .
npm run typecheck
npm run lint
npm run test
npm audit --omit=dev --audit-level=critical
npm run build
```

The audit fails CI only on **critical** advisories in production dependencies; high ones are
reported without failing the run. If your change touches dependencies or Docker, also run
`docker build --target runner .`.

The pre-commit hook formats staged files; `npx prettier --write <file>` fixes any file that
`prettier --check` flags.

## Project conventions

- **Next.js 15 App Router** — this repo tracks a fast-moving Next.js. Before touching framework internals, read the relevant guide in `node_modules/next/dist/docs/` (see [`AGENTS.md`](./AGENTS.md)); APIs may differ from older versions.
- **Domain logic lives in `lib/`** — pure, testable functions (links, profile, analytics, social, embed, fonts, button-style, themes, username, admin). New business rules belong here, not in components.
- **Tests** — `lib/` modules have colocated Vitest unit tests. If you add or change domain logic (especially anything touching access control, validation, or gating), add/update tests. Security-sensitive helpers (`isLinkLive`, `isProfilePublic`, thumbnail/embed validation) should stay well-covered.
- **UI components** — shadcn-style components in `components/ui`. Render icons via the `Icon` component (lucide `DynamicIcon`, kebab-case `name`), not per-icon imports. Prefer the existing form wrappers (`InputText`, `InputSelect`, `DatePicker`, …). Add new shadcn components with `npx shadcn@latest add <component>`.
- **Database changes** — edit `prisma/schema.prisma`, then generate a migration with `npm run db:migrate`. **Commit the generated migration** in `prisma/migrations/`. Never edit an already-committed migration.
- **Privacy** — analytics are intentionally IP/cookie/UA-free. Keep it that way; don't introduce tracking that identifies visitors.

## Issue & branch workflow

- **Backlog** — GitHub Issues and milestones are the source of truth for planned work; [`ROADMAP.md`](./ROADMAP.md) summarizes them. Pick an open issue from the current milestone, and open one before starting anything non-trivial.
- **Ticket keys** — every issue gets a sequential `TAUTREE-XX` key (two digits, separate from the GitHub issue number), in the title as `[TAUTREE-XX] type: short description`, where `type` is the Conventional Commit type (e.g. `[TAUTREE-10] feat: vCard "Save contact" button`). The issue templates prefill `[TAUTREE-XX]`; the maintainer replaces `XX` with the next free key when triaging. To find the latest key:

  ```bash
  gh issue list --state all --search 'TAUTREE in:title' --limit 200 --json title --jq '.[].title' | grep -o 'TAUTREE-[0-9][0-9]*' | sort -t- -k2 -n | tail -1
  ```

- **Branches** — branch off `dev` (the integration branch) as `<type>/TAUTREE-XX-short-description`, e.g. `feat/TAUTREE-10-vcard-download` or `fix/TAUTREE-11-embed-height`. A small change without an issue can use `<type>/short-description`. Every development PR (features, fixes, chores, docs) targets `dev`.
- **Where the key goes** — in the issue title, the branch name, and the linked issue on the PR. Commit subjects stay plain Conventional Commits without the key.

## Commit & PR conventions

- **Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`, with an optional scope (`feat(analytics): …`). Write a clear, imperative subject.
- **Releases** — when a milestone is complete, a maintainer opens a release PR `dev` → `main`. `main` only moves through these release PRs (see [Releasing](#releasing)).
- **Keep PRs focused** — one logical change per PR is easier to review.
- **Dependency updates** — [Dependabot](./.github/dependabot.yml) opens one grouped PR per ecosystem (npm, the Dockerfile's Node image, GitHub Actions) each month, targeting `dev`; each npm major update gets its own PR. Some majors are done by hand instead: Node (in `.nvmrc`, the `Dockerfile`, and `@types/node` together), Next.js (with `eslint-config-next`, which must match it), and ESLint (once `eslint-config-next` supports it).
- **Changelog** — add user-visible changes under `## [Unreleased]` in [`CHANGELOG.md`](./CHANGELOG.md) in the same PR. Internal refactors, CI, and tooling changes don't need an entry.
- Fill in the [PR template](./.github/pull_request_template.md) checklist.
- **Link the issue by hand** in the PR's **Development** sidebar. PRs target `dev`, not the default branch, so `Closes #123` in the description doesn't link or auto-close the issue — close it by hand once the PR is merged into `dev`.
- For UI changes, include before/after screenshots.

## Releasing

Maintainers release when every issue in a milestone is done. Versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

1. **Prep PR into `dev`** (`chore/release-X.Y.Z`): in [`CHANGELOG.md`](./CHANGELOG.md), rename
   `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD` (the day you'll tag), add a fresh `[Unreleased]` above
   it, and update the compare links at the bottom. Bump the version with
   `npm version X.Y.Z --no-git-tag-version`.
2. **Release PR `dev` → `main`**, in the milestone, with `Closes #N` on its own line for every
   issue it ships (they close when it merges into `main`).
3. **Tag the merge commit on `main`**, once CI on `main` is green:

   ```bash
   git switch main && git pull
   .claude/skills/cut-release/scripts/preflight.sh X.Y.Z   # read-only checks, must end with READY
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

   The [Release workflow](./.github/workflows/release.yml) runs CI again and creates the GitHub
   Release, with the `## [X.Y.Z]` section of the changelog as its notes. A stable tag must be on
   `main`, or the workflow fails. Tags like `vX.Y.Z-rc.1` or `vX.Y.Z-beta.1` become pre-releases.

4. **Sync `main` back into `dev`** (merge `main` into `dev`), so the next release PR isn't behind,
   and close the milestone.

## Reporting security issues

Please **don't** open a public issue for vulnerabilities — see [`SECURITY.md`](./SECURITY.md) for private disclosure.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE.md).
