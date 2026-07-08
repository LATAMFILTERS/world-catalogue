#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ELIMFILTERS Repository Guardian
# Runs all validation gates before a PR is opened or merged.
#
# Usage:
#   bash scripts/guardian.sh              # full run (includes build)
#   bash scripts/guardian.sh --skip-build # fast run (type-check, lint, validators)
#
# Exit 0 — all checks pass.
# Exit 1 — one or more checks fail.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"
SKIP_BUILD=0
[ "${1:-}" = "--skip-build" ] && SKIP_BUILD=1

FAILED=0
declare -a FAILURES=()

_pass() { printf "  \033[32m✓\033[0m  %s\n" "$1"; }
_fail() { printf "  \033[31m✗\033[0m  %s\n" "$1"; FAILED=1; FAILURES+=("$1"); }
_header() {
  echo ""
  printf "\033[90m══════════════════════════════════════════════════════════\033[0m\n"
  printf "  \033[1m%s\033[0m\n" "$1"
  printf "\033[90m══════════════════════════════════════════════════════════\033[0m\n"
}
_run() {
  local label="$1"; shift
  if "$@" > /tmp/guardian-out.txt 2>&1; then
    _pass "$label"
  else
    _fail "$label"
    tail -15 /tmp/guardian-out.txt | sed 's/^/       /'
  fi
}

# Non-blocking run: prints result but does NOT increment FAILED.
# Use for checks that have known pre-existing issues tracked in a separate PR.
_run_warn() {
  local label="$1"; shift
  if "$@" > /tmp/guardian-out.txt 2>&1; then
    _pass "$label"
  else
    printf "  \033[33m⚠\033[0m  %s \033[90m(non-blocking — see KNOWN_ISSUES.md)\033[0m\n" "$label"
    tail -8 /tmp/guardian-out.txt | sed 's/^/       /'
  fi
}

printf "\033[1m\nELIMFILTERS Repository Guardian\033[0m\n"
echo "  $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

cd "$FRONTEND"

_header "1 · TypeScript"
_run "type-check" npm run type-check --silent

_header "2 · Lint"
# Non-blocking: ESLint package not yet installed (pre-existing).
# Run `npm install --save-dev eslint eslint-config-next` to enable.
_run_warn "lint" npm run lint --silent

_header "3 · Foundation Compliance"
_run "validate:foundation" npx tsx scripts/validate-foundation.ts

_header "4 · Services Integrity"
_run "validate:services" npx tsx scripts/validate-services.ts

_header "5 · Vault / Citation Index"
# Non-blocking: ~20 legacy vault files lack YAML frontmatter (pre-existing, tracked in KNOWN_ISSUES.md).
# Change to _run once vault-hardening PR merges.
_run_warn "validate:vault" node "$ROOT/scripts/build-citation-index.js" --validate

_header "6 · Citation API"
_run "validate:citation-api" node "$ROOT/scripts/generate-citation-api.js" --validate

_header "7 · Knowledge Center Graph Integrity"
_run "validate:kc" npx tsx scripts/validate-kc-integrity.ts

if [ "$SKIP_BUILD" -eq 0 ]; then
  _header "8 · Production Build"
  _run "build" npm run build
fi

echo ""
printf "\033[90m══════════════════════════════════════════════════════════\033[0m\n"
if [ "$FAILED" -eq 0 ]; then
  printf "  \033[32m\033[1mGUARDIAN: PASS ✓\033[0m\n"
else
  printf "  \033[31m\033[1mGUARDIAN: FAIL ✗\033[0m\n"
  echo ""
  echo "  Failed checks:"
  for f in "${FAILURES[@]}"; do printf "    – %s\n" "$f"; done
fi
printf "\033[90m══════════════════════════════════════════════════════════\033[0m\n"
echo ""

exit $FAILED
