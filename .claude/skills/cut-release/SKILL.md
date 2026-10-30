---
name: cut-release
description: Prepare and verify a Tautree release — check the milestone is complete, pick the semver version from CHANGELOG [Unreleased] and the merged PRs, tidy the notes for people who self-host (migrations that run on startup, new env vars, Docker changes), rename the section to `## [X.Y.Z] - YYYY-MM-DD` with a fresh [Unreleased] and compare links, bump package.json with `npm version --no-git-tag-version`, run the CI checks and the bundled preflight (version, tag unused, package.json, CHANGELOG lint, notes preview with the release workflow's own awk, CI and milestone on main), then hand over the prep PR → release PR `dev` → `main` (with `Closes #N`) → tag on main sequence and verify the GitHub Release the workflow publishes. Use whenever the user wants to release, tag, ship or publish a version, cut v0.3.0 or an -rc, prepare the changelog for a release, or asks "rilis", "siapin rilis", "bikin tag", "naikin versi", "release notes", "siap rilis belum?".
---

# Cut a release (Tautree)

How releases work here (CONTRIBUTING.md § Releasing is the human version):

1. **Prep PR into `dev`** (`chore/release-X.Y.Z`): CHANGELOG `[Unreleased]` → `[X.Y.Z] - date`,
   compare links, and `package.json` version.
2. **Release PR `dev` → `main`** in the milestone, with `Closes #N` per shipped issue. GitHub
   only closes issues from PRs into the default branch, so this is where they close.
3. **Tag `vX.Y.Z` on `main`** → `.github/workflows/release.yml` runs the full CI, then creates
   the GitHub Release with the `## [X.Y.Z]` section of `CHANGELOG.md` as its notes (`-rc.N` /
   `-beta.N` → pre-release). A stable tag that isn't on `main` fails the workflow.
4. **Sync `main` back into `dev`** and close the milestone.

No image is published: deployments (Coolify) build from source. The tag and `package.json`
must agree; the preflight checks it.

**Who runs git.** This user commits and pushes themselves. Prepare the files, run the checks,
and hand over the exact commands. Open a PR only when asked in that turn, after checking the
branch is committed and pushed. The tag push publishes a release, so it's the user's call: hand
over the command, and only push it yourself if they explicitly ask, naming the tag first.

## Step 1 — Milestone and version

```bash
gh api 'repos/ByHandi/tautree/milestones?state=open' --jq '.[] | "\(.title) open=\(.open_issues) closed=\(.closed_issues)"'
gh issue list --milestone vX.Y.Z --state open
git log --merges --oneline "$(git tag --sort=-v:refname | head -1)"..origin/dev
```

- Every issue in the milestone should have a PR merged into `dev`. Issues stay **open** until
  the release PR merges (that's expected); an issue without a merged PR is a blocker or should
  move to the next milestone. Ask which.
- The milestone counts PRs as well as issues. Its total includes PRs that may have shipped in an
  earlier release, so go by the merged PRs since the last tag, not the milestone total.
- Propose the version from `[Unreleased]` and the merged PRs. On `0.x`: a new feature or
  anything breaking (renamed env var, a migration that changes behavior, a Docker change
  self-hosters must act on) → **minor**; only fixes/security → **patch**. Milestones are named
  after the planned version (`v0.3.0`); if the content says otherwise (a security fix that must
  ship now, as `v0.1.1` did), say so. The version is the user's decision: recommend one with the
  reason and confirm it.
- Risky changes (data migrations, auth, gating) → suggest an `-rc.1` first.

## Step 2 — Release notes and version (prep branch)

```bash
git switch --no-track -c chore/release-X.Y.Z origin/dev
```

The section becomes the public release notes verbatim, so write it for people who use or
self-host Tautree, not for its developers.

1. **Completeness.** Compare `[Unreleased]` with the merged PRs since the last tag and add any
   user-visible change that's missing. Leave out refactors, CI, tooling, and docs for
   contributors (CHANGELOG's own rule). If nothing user-visible shipped, write a short
   paragraph saying so and what the release contains, as `[0.2.0]` does, and ask the user
   before settling on it.
2. **Structure.** [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) headings, in this
   order, only those with entries: `### Added`, `### Changed`, `### Deprecated`, `### Removed`,
   `### Fixed`, `### Security`. One `- ` bullet per change, wrapped at ~100 columns like the rest
   of the file, no blank lines inside a list.
3. **Upgrade notes** go first, in a short paragraph under the heading (see `[0.1.1]`):
   - **Database migrations** run automatically on container start (`entrypoint.sh` →
     `prisma migrate deploy`) and aren't reverted on rollback, so say there is one and to back
     up the database before upgrading.
   - New or renamed environment variables (compare `.env.example`), and whether a rebuild is
     needed (`NEXT_PUBLIC_*` values are baked in at build time).
   - Docker / compose / Node version changes self-hosters must act on.
   - Or: "Upgrading: rebuild the image and redeploy. There are no database migrations, new
     environment variables, or Docker Compose changes."
4. **Rename and reopen.** `## [Unreleased]` → `## [X.Y.Z] - YYYY-MM-DD` (the day you expect to
   tag; the `[0.1.1]` and `[0.2.0]` dates had to be fixed because they weren't), with an empty
   `## [Unreleased]` above it. The heading must be exactly that shape: the workflow's awk
   matches `## [X.Y.Z]` literally and falls back to generated notes otherwise.
5. **Compare links** at the bottom: `[Unreleased]: …/compare/vX.Y.Z...dev` and a new
   `[X.Y.Z]: …/compare/v<last>...vX.Y.Z` line above the previous version's.
6. **Version:** `npm version X.Y.Z --no-git-tag-version` (updates `package.json` and
   `package-lock.json`; creates no commit or tag).

Preview while editing:

```bash
.claude/skills/cut-release/scripts/preflight.sh --preview X.Y.Z
```

It checks the version, the tag, `package.json`, the CHANGELOG heading/date/notes/lint and
compare links, warns about migrations, `.env.example` and Docker changes since the last tag (so
you don't forget an upgrade note), and prints the notes exactly as the GitHub Release will show
them.

## Step 3 — Prove the commit is releasable

The tag re-runs CI, but a red run after the tag leaves a tag on a broken commit. Run what
`.github/workflows/ci.yml` runs:

```bash
npx prettier --check .
npm run typecheck && npm run lint && npm test
npm audit --omit=dev --audit-level=critical
npm run build
docker build --target runner .
```

and validate compose without touching the real `.env`:

```bash
tmp=$(mktemp -d) && cp docker-compose.yml "$tmp"/ && cp .env.example "$tmp"/.env
(cd "$tmp" && docker compose config --quiet && echo compose ok); rm -rf "$tmp"
```

If `npm audit` can't reach the registry, retry once; then report it as not verified (CI runs
it on the tag).

## Step 4 — Hand-off

Give the user the sequence with the real version filled in:

```bash
# prep PR into dev
git add CHANGELOG.md package.json package-lock.json
git commit -m "chore: prepare release vX.Y.Z"
git push -u origin chore/release-X.Y.Z
```

Then, when they ask:

- **Prep PR** → `dev`: title `chore: prepare release vX.Y.Z`, milestone `vX.Y.Z`, body with the
  version reasoning and the notes preview.
- **Release PR** `dev` → `main` (`gh pr create --base main --head dev`): title
  `chore: release vX.Y.Z`, milestone `vX.Y.Z`. Body: user-visible changes, internal changes
  with their PR numbers, upgrade notes, a "Before merging" checklist (prep PR merged, CHANGELOG
  date is the release day, CI green), "After merging" (tag, check the release, sync `main` into
  `dev`, close the milestone), and an **Issues** section with `Closes #N`, one per line, for
  every shipped issue. Check `closingIssuesReferences` afterwards:

  ```bash
  gh pr view <n> --json closingIssuesReferences,mergeStateStatus --jq '[.closingIssuesReferences[].number], .mergeStateStatus'
  ```

  `BEHIND` means `main` has a commit `dev` lacks (the last release PR's merge commit, if `main`
  wasn't synced back): the user clicks **Update branch** or merges `main` into `dev`.

After the release PR is merged, on `main`:

```bash
git switch main && git pull
.claude/skills/cut-release/scripts/preflight.sh X.Y.Z   # must end with READY
git tag vX.Y.Z
git push origin vX.Y.Z                                   # runs the Release workflow
```

The full preflight adds: on `main`, clean tree, HEAD equals `origin/main`, CI passed on that
commit, and no open issues left in the milestone (those weren't in a `Closes` line; close them
by hand or move them). Lightweight tags, like the existing ones.

## Step 5 — After the tag is pushed

```bash
gh run list --workflow release.yml --limit 1
gh run watch <run-id> --exit-status
gh release view vX.Y.Z --json name,isPrerelease,body,url
```

- The release exists, is (not) a pre-release as intended, and its notes match the preview.
- The workflow titles the release with the tag. A descriptive title like `v0.2.0 — Development
workflow` is an edit on GitHub (`gh release edit vX.Y.Z --title …`), only if the user wants it.
- Remind the user to merge `main` back into `dev` and close the milestone, and to redeploy if
  the release needs it.

If something fails:

- **CI job failed** → nothing was published. Fix through PRs (into `dev`, then a release PR),
  then move the tag with the user's OK: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`,
  re-tag the fixed commit on `main`, push again.
- **GitHub Release job failed** → re-run the job from the Actions page (`gh run rerun <id>
--failed`); the tag stays.
- **A release was created by hand** (`gh release create` also creates the tag) → the workflow
  sees it exists and leaves it alone.
- **A bug found after release** → fix forward with a patch version. Don't re-point a published
  tag.

## Report

End with: the version and why, the final release notes, the check results and the preflight
verdict, the exact commands for the user, and, after the tag, what you verified (workflow run,
release, pre-release flag, notes) — plus anything you couldn't check.
