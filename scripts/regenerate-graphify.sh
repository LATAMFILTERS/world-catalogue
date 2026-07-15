#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v uv >/dev/null 2>&1; then
  echo "[graphify-refresh] uv is not installed"
  exit 1
fi

uv tool install "graphifyy[office,pdf,mcp,openai,sql]" --force

if [[ -z "${GROQ_API_KEY:-}" ]]; then
  echo "[graphify-refresh] GROQ_API_KEY is not configured; skipping semantic regeneration"
  exit 0
fi

export OPENAI_API_KEY="$GROQ_API_KEY"
export OPENAI_BASE_URL="${GROQ_BASE_URL:-https://api.groq.com/openai/v1}"
export OPENAI_MODEL="${GROQ_MODEL:-llama-3.3-70b-versatile}"
export GRAPHIFY_MAX_WORKERS="${GRAPHIFY_MAX_WORKERS:-2}"
export GRAPHIFY_API_TIMEOUT="${GRAPHIFY_API_TIMEOUT:-1200}"
export GRAPHIFY_MAX_RETRIES="${GRAPHIFY_MAX_RETRIES:-8}"
export GRAPHIFY_QUERY_LOG_DISABLE="1"

graphify . --update --backend openai --model "$OPENAI_MODEL"
graphify cluster-only . --backend openai --model "$OPENAI_MODEL"
graphify label . --backend openai --model "$OPENAI_MODEL"

echo "[graphify-refresh] graph regenerated with Groq model $OPENAI_MODEL and communities labeled"