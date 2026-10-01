#!/usr/bin/env bash
# Publishes docs/issues/NN-*.md as GitHub Issues in the current repo.
#
#   bash scripts/create-issues.sh            creates the issues
#   bash scripts/create-issues.sh --dry-run  only shows what it would do
#
# Each file: a first line "# Title", one line "Labels: a, b", and the rest is
# the body. Requires `gh` authenticated and the remote pointing at your fork.
set -euo pipefail

cd "$(dirname "$0")/.."
DRY_RUN="${1:-}"

for file in docs/issues/[0-9][0-9]-*.md; do
  title="$(sed -n '1s/^# //p' "$file")"
  labels="$(sed -n 's/^Labels:[[:space:]]*//p' "$file" | tr -d ' ')"
  body="$(sed '1d; /^Labels:/d' "$file")"

  args=(--title "$title" --body "$body")
  [ -n "$labels" ] && args+=(--label "$labels")

  if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "gh issue create --title \"$title\" --label \"$labels\"   # $file"
  else
    for label in ${labels//,/ }; do
      gh label create "$label" --force >/dev/null 2>&1 || true
    done
    gh issue create "${args[@]}"
  fi
done
