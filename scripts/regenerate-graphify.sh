#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v uv >/dev/null 2>&1; then
  echo "[graphify-refresh] uv is not installed"
  exit 1
fi

uv tool install "graphifyy[office,pdf,mcp,anthropic,sql]" --force

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "[graphify-refresh] ANTHROPIC_API_KEY is not configured; skipping semantic regeneration"
  exit 0
fi

export GRAPHIFY_MAX_WORKERS="${GRAPHIFY_MAX_WORKERS:-2}"
export GRAPHIFY_API_TIMEOUT="${GRAPHIFY_API_TIMEOUT:-1200}"
export GRAPHIFY_QUERY_LOG_DISABLE="1"

graphify . --update --backend claude
graphify cluster-only .
graphify label --backend claude

echo "[graphify-refresh] graph regenerated and communities labeled"
