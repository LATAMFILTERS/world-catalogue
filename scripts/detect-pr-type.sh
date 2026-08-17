#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ELIMFILTERS PR Type Detector
# Prevents PRs from mixing source code with build-only generated artifacts.
#
# Governed Citation API artifacts are intentionally tracked in Git and may
# accompany their canonical source changes in the same PR. They are protected
# by citation tracking/content/determinism gates instead of this legacy split.
#
# Source / governed tracked content includes:
#   frontend/src/**  scripts/**  elimfilters-vault/**
#   frontend/public/api/citation/**
#   package*.json  tsconfig*  next.config*  *.md  *.yml  *.sh
#
# Build-only generated output includes:
#   frontend/out/**  frontend/public/sitemap.xml  *.generated.ts
#
# Exit 0 — PR does not mix normal changes with build-only generated output.
# Exit 1 — PR mixes normal changes and build-only generated output (REJECT).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

BASE="${1:-main}"

# ── Resolve changed files ─────────────────────────────────────────────────────
# In CI: git diff against the PR base commit.
# Locally: diff against origin/<base>.
if [ -n "${GITHUB_BASE_SHA:-}" ]; then
  CHANGED=$(git diff --name-only "$GITHUB_BASE_SHA"...HEAD 2>/dev/null)
elif git rev-parse --verify "origin/$BASE" >/dev/null 2>&1; then
  CHANGED=$(git diff --name-only "origin/$BASE"...HEAD 2>/dev/null)
else
  echo "  WARN: Cannot resolve base branch '$BASE'. Skipping PR type check."
  exit 0
fi

if [ -z "$CHANGED" ]; then
  echo "  INFO: No changed files detected. Skipping PR type check."
  exit 0
fi

# ── Classifiers ───────────────────────────────────────────────────────────────
is_generated() {
  local f="$1"
  [[ "$f" == frontend/out/* ]] && return 0
  [[ "$f" == frontend/public/sitemap.xml ]] && return 0
  [[ "$f" == *.generated.ts ]] && return 0
  return 1
}

is_source() {
  local f="$1"
  is_generated "$f" && return 1   # build-only generated is never source
  return 0
}

# ── Tally ─────────────────────────────────────────────────────────────────────
HAS_SOURCE=0
HAS_GENERATED=0
SOURCE_FILES=()
GENERATED_FILES=()

while IFS= read -r file; do
  [ -z "$file" ] && continue
  if is_generated "$file"; then
    HAS_GENERATED=1
    GENERATED_FILES+=("$file")
  else
    HAS_SOURCE=1
    SOURCE_FILES+=("$file")
  fi
done <<< "$CHANGED"

# ── Report ────────────────────────────────────────────────────────────────────
echo ""
echo "PR Type Detection"
echo "─────────────────────────────────────────────────────────"
echo "  Source/governed files: ${#SOURCE_FILES[@]}"
echo "  Build-only generated:  ${#GENERATED_FILES[@]}"
echo ""

if [ "$HAS_SOURCE" -eq 1 ] && [ "$HAS_GENERATED" -eq 1 ]; then
  echo "  ✗  MIXED PR — normal/governed files and build-only generated output in same PR."
  echo ""
  echo "  Source/governed examples:"
  for f in "${SOURCE_FILES[@]:0:5}"; do printf "    %s\n" "$f"; done
  echo ""
  echo "  Build-only generated examples:"
  for f in "${GENERATED_FILES[@]:0:5}"; do printf "    %s\n" "$f"; done
  echo ""
  echo "  Remove build-only generated output before merging."
  echo ""
  exit 1
elif [ "$HAS_GENERATED" -eq 1 ] && [ "$HAS_SOURCE" -eq 0 ]; then
  echo "  ✓  Build-only generated output only."
elif [ "$HAS_SOURCE" -eq 1 ] && [ "$HAS_GENERATED" -eq 0 ]; then
  echo "  ✓  Source/governed changes only."
else
  echo "  INFO: No classifiable files changed."
fi

echo ""
exit 0
