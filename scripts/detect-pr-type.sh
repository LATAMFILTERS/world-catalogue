#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ELIMFILTERS PR Type Detector
# Prevents PRs from mixing source code with generated artifacts.
#
# PR Type A — Source only:
#   frontend/src/**  scripts/**  elimfilters-vault/**
#   package*.json  tsconfig*  next.config*  *.md  *.yml  *.sh
#
# PR Type B — Generated only:
#   frontend/out/**  frontend/public/api/citation/**
#   frontend/public/sitemap.xml  *.generated.ts
#   CITATION_INDEX.json  elimfilters-vault/00-meta/CITATION_INDEX.json
#
# Exit 0 — PR is pure Type A or pure Type B.
# Exit 1 — PR mixes source and generated (REJECT).
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
  [[ "$f" == frontend/public/api/citation/* ]] && return 0
  [[ "$f" == frontend/public/sitemap.xml ]] && return 0
  [[ "$f" == *.generated.ts ]] && return 0
  [[ "$f" == CITATION_INDEX.json ]] && return 0
  [[ "$f" == elimfilters-vault/00-meta/CITATION_INDEX.json ]] && return 0
  return 1
}

is_source() {
  local f="$1"
  is_generated "$f" && return 1   # generated is never source
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
echo "  Source files:    ${#SOURCE_FILES[@]}"
echo "  Generated files: ${#GENERATED_FILES[@]}"
echo ""

if [ "$HAS_SOURCE" -eq 1 ] && [ "$HAS_GENERATED" -eq 1 ]; then
  echo "  ✗  MIXED PR — source and generated files in same PR."
  echo ""
  echo "  Source examples:"
  for f in "${SOURCE_FILES[@]:0:5}"; do printf "    %s\n" "$f"; done
  echo ""
  echo "  Generated examples:"
  for f in "${GENERATED_FILES[@]:0:5}"; do printf "    %s\n" "$f"; done
  echo ""
  echo "  Split into:"
  echo "    PR Type A — source changes only"
  echo "    PR Type B — generated artifacts only"
  echo ""
  exit 1
elif [ "$HAS_GENERATED" -eq 1 ] && [ "$HAS_SOURCE" -eq 0 ]; then
  echo "  ✓  Type B — Generated output only."
elif [ "$HAS_SOURCE" -eq 1 ] && [ "$HAS_GENERATED" -eq 0 ]; then
  echo "  ✓  Type A — Source only."
else
  echo "  INFO: No classifiable files changed."
fi

echo ""
exit 0
