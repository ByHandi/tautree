#!/usr/bin/env bash
# Read-only release preflight for Tautree. Checks that tagging vX.Y.Z right now would produce the
# release you expect, and previews the GitHub Release notes with the same awk extraction that
# .github/workflows/release.yml uses.
#
#   .claude/skills/cut-release/scripts/preflight.sh --preview 0.3.0   # on the release prep branch:
#        skips the main/clean-tree/CI checks, keeps version, tag, package.json and CHANGELOG
#   .claude/skills/cut-release/scripts/preflight.sh 0.3.0             # on main, before tagging
#
# Exit 0: every check passed (warnings allowed). Exit 1: at least one check failed.
# Changes nothing: no edits, no commits, no tags, no pushes (only `git fetch`).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

preview=false
if [[ "${1:-}" == --preview ]]; then
  preview=true
  shift
fi
[[ $# -eq 1 ]] || {
  echo "usage: $0 [--preview] <version>   e.g. 0.3.0 or 0.3.0-rc.1" >&2
  exit 2
}
version="${1#v}"
tag="v$version"
failed=0
has_gh=false
command -v gh >/dev/null 2>&1 && has_gh=true

ok() { printf '  ok    %s\n' "$1"; }
warn() { printf '  warn  %s\n' "$1"; }
bad() {
  printf '  FAIL  %s\n' "$1"
  failed=1
}

echo "== version $tag"
if [[ "$version" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$ ]]; then
  ok "valid semver"
  core="${version%%-*}"
else
  bad "'$version' is not semver X.Y.Z or X.Y.Z-<pre>"
  exit 1
fi
if [[ "$version" == *-* ]]; then
  ok "pre-release: published as a GitHub pre-release (may be tagged on dev)"
else
  ok "stable: must be tagged on main (the release workflow fails otherwise)"
fi

pkg_version="$(node -p 'require("./package.json").version')"
if [[ "$pkg_version" == "$version" ]]; then
  ok "package.json version is $version"
else
  bad "package.json version is $pkg_version (run: npm version $version --no-git-tag-version)"
fi

echo
echo "== git"
git fetch --quiet --tags origin main dev || bad "git fetch origin failed"
head="$(git rev-parse HEAD)"
if $preview; then
  warn "--preview: main, clean tree and CI checks skipped (run without it on main before tagging)"
else
  branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$branch" == main ]]; then ok "on main"; else bad "on '$branch', tag stable releases on main"; fi
  # Only tracked files matter: the tag points at a commit, untracked files never reach it.
  changed="$(git status --porcelain --untracked-files=no)"
  if [[ -z "$changed" ]]; then
    ok "no uncommitted changes to tracked files"
  else
    bad "uncommitted changes to tracked files (the tag would not include them):"
    while IFS= read -r line; do printf '          %s\n' "$line"; done <<<"$changed"
  fi
  remote="$(git rev-parse origin/main 2>/dev/null || echo none)"
  if [[ "$head" == "$remote" ]]; then
    ok "HEAD is origin/main ($(git rev-parse --short HEAD))"
  elif git merge-base --is-ancestor "$remote" "$head" 2>/dev/null; then
    bad "HEAD is ahead of origin/main: main only moves through the release PR"
  else
    bad "HEAD differs from origin/main: git pull, or you'd tag a commit that isn't on main"
  fi
fi
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then bad "tag $tag already exists locally"; else ok "tag $tag not used locally"; fi
if [[ -n "$(git ls-remote --tags origin "refs/tags/$tag" 2>/dev/null)" ]]; then bad "tag $tag already exists on origin"; else ok "tag $tag not on origin"; fi

last="$(git tag --list 'v*' --sort=-v:refname | head -1)"
if [[ -z "$last" ]]; then
  ok "first release (no earlier v* tags)"
else
  last_v="${last#v}"
  last_core="${last_v%%-*}"
  highest="$(printf '%s\n%s\n' "$core" "$last_core" | sort -V | tail -1)"
  if [[ "$core" != "$last_core" && "$highest" == "$core" ]]; then
    ok "$tag is newer than $last"
  elif [[ "$core" == "$last_core" && "$last_v" == *-* && "$version" != "$last_v" ]]; then
    ok "$tag follows pre-release $last"
  else
    bad "$tag is not newer than the latest tag $last"
  fi
fi

echo
echo "== CHANGELOG.md"
notes="$(mktemp)"
trap 'rm -f "$notes"' EXIT
# Same extraction as the "Create release" step in .github/workflows/release.yml.
awk -v v="$version" '
  index($0, "## [" v "]") == 1 { found = 1; next }
  found && (/^## \[/ || /^\[[^]]+\]: /) { exit }
  found { print }
' CHANGELOG.md >"$notes"
heading="$(grep -m1 -F "## [$version]" CHANGELOG.md || true)"
date_re='^## \[[^]]+\] - ([0-9]{4}-[0-9]{2}-[0-9]{2})$'
if [[ -z "$heading" ]]; then
  bad "no '## [$version] - YYYY-MM-DD' section (rename [Unreleased] to it)"
elif [[ "$heading" == "## [$version] - "* && "$heading" =~ $date_re ]]; then
  ok "section: $heading"
  if [[ "${BASH_REMATCH[1]}" != "$(date +%F)" ]]; then
    warn "date ${BASH_REMATCH[1]} is not today ($(date +%F)): fine if intended, else re-date it in a PR"
  fi
else
  bad "heading '$heading' should be exactly '## [$version] - YYYY-MM-DD'"
fi
if grep -q '[^[:space:]]' "$notes"; then
  ok "release notes non-empty ($(grep -c '^- ' "$notes" || true) bullet entries)"
  # A blank line between two bullets splits the rendered list in two.
  if awk 'prev_blank && /^- / && last_bullet {f=1} /^- /{last_bullet=1} /^#/{last_bullet=0} {prev_blank=($0=="")} END{exit !f}' "$notes"; then
    warn "blank line inside a list: the release page renders it as two lists"
  fi
  long="$(awk 'length > 100' "$notes" | wc -l | tr -d ' ')"
  if [[ "$long" != 0 ]]; then warn "$long line(s) over 100 columns (the file wraps at ~100)"; fi
  order="$(grep -oE '^### (Added|Changed|Deprecated|Removed|Fixed|Security)$' "$notes" | cut -c5- | tr '\n' ' ' || true)"
  expected=""
  for h in Added Changed Deprecated Removed Fixed Security; do
    if grep -q "^### $h\$" "$notes"; then expected+="$h "; fi
  done
  if [[ "$order" != "$expected" ]]; then warn "headings out of Keep a Changelog order: $order"; fi
  if grep -E '^### ' "$notes" | grep -vqE '^### (Added|Changed|Deprecated|Removed|Fixed|Security)$'; then
    warn "non-standard heading(s): $(grep -E '^### ' "$notes" | grep -vE '^### (Added|Changed|Deprecated|Removed|Fixed|Security)$' | tr '\n' ' ')"
  fi
elif [[ -n "$heading" ]]; then
  bad "section [$version] is empty: the release would fall back to generated notes"
fi
if grep -qE '^## \[Unreleased\]' CHANGELOG.md; then
  ok "an [Unreleased] section exists for the next changes"
  unreleased_items="$(awk '/^## \[Unreleased\]/{f=1;next} f&&/^## \[/{exit} f&&/^- /' CHANGELOG.md | wc -l | tr -d ' ')"
  if [[ "$unreleased_items" != 0 ]]; then
    warn "[Unreleased] still has $unreleased_items entries that won't be in $tag"
  fi
else
  warn "no [Unreleased] section above the release (add an empty one for the next changes)"
fi
if grep -qF "[$version]: https://github.com/ByHandi/tautree/compare/" CHANGELOG.md; then
  ok "compare link for [$version]"
else
  warn "no '[$version]: …/compare/<last>...$tag' link at the bottom"
fi
if grep -qF "[Unreleased]: https://github.com/ByHandi/tautree/compare/$tag...dev" CHANGELOG.md; then
  ok "[Unreleased] compares from $tag"
else
  warn "[Unreleased] link should compare $tag...dev"
fi

echo
echo "== upgrade notes (since ${last:-the first commit})"
if [[ -z "$last" ]]; then
  ok "first release: nothing to compare against"
else
  if git diff --quiet "$last" HEAD -- prisma/migrations; then
    ok "no new database migrations"
  else
    warn "new migrations (they run on container start and aren't reverted on rollback): say so, and to back up the database first:"
    git diff --name-only --diff-filter=A "$last" HEAD -- prisma/migrations | grep migration.sql | sed 's/^/          /' || true
  fi
  if git diff --quiet "$last" HEAD -- .env.example; then
    ok ".env.example unchanged"
  else
    warn ".env.example changed: list new or renamed environment variables in the notes"
  fi
  if git diff --quiet "$last" HEAD -- docker-compose.yml Dockerfile entrypoint.sh; then
    ok "Docker setup unchanged"
  else
    warn "docker-compose.yml / Dockerfile / entrypoint.sh changed: say whether self-hosters must act"
  fi
fi

if ! $preview; then
  echo
  echo "== GitHub"
  if ! $has_gh; then
    warn "gh not installed: check CI on main and the milestone by hand"
  else
    ci="$(gh run list --workflow ci.yml --commit "$head" --limit 1 --json status,conclusion --jq '.[0] | "\(.status) \(.conclusion)"' 2>/dev/null || true)"
    case "$ci" in
      "completed success") ok "CI passed on $(git rev-parse --short HEAD)" ;;
      "") warn "no CI run found for $(git rev-parse --short HEAD)" ;;
      completed*) bad "CI on $(git rev-parse --short HEAD) concluded: ${ci#completed }" ;;
      *) warn "CI on $(git rev-parse --short HEAD) is still running: wait for it before tagging" ;;
    esac
    if [[ "$version" != *-* ]]; then
      open="$(gh issue list --milestone "$tag" --state open --json number --jq 'length' 2>/dev/null || echo "?")"
      if [[ "$open" == 0 ]]; then
        ok "milestone $tag has no open issues"
      else
        warn "milestone $tag has $open open issue(s) (or doesn't exist): were they left out of the release PR's Closes?"
      fi
    fi
  fi
fi

echo
echo "== release notes preview (what GitHub will show)"
sed 's/^/  | /' "$notes"

echo
if [[ $failed -eq 0 ]]; then
  echo "READY: $tag can be tagged."
else
  echo "NOT READY: fix the FAIL lines above." >&2
  exit 1
fi
