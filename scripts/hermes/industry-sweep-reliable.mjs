#!/usr/bin/env node

import process from 'node:process';
import { pathToFileURL } from 'node:url';

// Keep each Groq Compound request small enough to avoid 413 errors.
process.env.HERMES_SWEEP_DOMAIN_BATCH ||= '1';

const GROQ_ENDPOINT_FRAGMENT = 'api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_RETRIES || 5));
const MIN_GROQ_INTERVAL_MS = Math.max(0, Number(process.env.HERMES_SWEEP_MIN_INTERVAL_MS || 4000));
const DEFAULT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_BACKOFF_MS || 5000));
const MIN_RATE_LIMIT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_MIN_429_BACKOFF_MS || 5000));
const MAX_BACKOFF_MS = Math.max(MIN_RATE_LIMIT_BACKOFF_MS, Number(process.env.HERMES_SWEEP_MAX_BACKOFF_MS || 90000));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastGroqRequestAt = 0;

function durationToMs(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;

  // Groq reset headers may be durations such as 1.25s, 2m3.5s, 1m or 250ms.
  let total = 0;
  let matched = false;
  const regex = /([0-9]+(?:\.[0-9]+)?)\s*(ms|h|m|s)/g;
  for (const match of raw.matchAll(regex)) {
    matched = true;
    const n = Number(match[1]);
    if (match[2] === 'ms') total += n;
    else if (match[2] === 's') total += n * 1000;
    else if (match[2] === 'm') total += n * 60_000;
    else if (match[2] === 'h') total += n * 3_600_000;
  }
  return matched && Number.isFinite(total) ? Math.ceil(total) : null;
}

function retryAfterToMs(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);

  const dateMs = Date.parse(raw);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());
  return durationToMs(raw);
}

function headerMs(response, name, parser = durationToMs) {
  try {
    return parser(response?.headers?.get?.(name));
  } catch {
    return null;
  }
}

function retryDelayMs(response, bodyText, attempt, status) {
  const candidates = [
    headerMs(response, 'retry-after', retryAfterToMs),
    headerMs(response, 'x-ratelimit-reset-tokens'),
    headerMs(response, 'x-ratelimit-reset-requests')
  ].filter((value) => Number.isFinite(value) && value >= 0);

  const bodyMatch = String(bodyText || '').match(/try again in\s+([0-9.]+)\s*(ms|s|m)?/i);
  if (bodyMatch) {
    const unit = String(bodyMatch[2] || 's').toLowerCase();
    const n = Number(bodyMatch[1]);
    if (Number.isFinite(n)) {
      const bodyMs = unit === 'ms' ? n : unit === 'm' ? n * 60_000 : n * 1000;
      candidates.push(Math.ceil(bodyMs));
    }
  }

  const exponential = DEFAULT_BACKOFF_MS * (2 ** Math.max(0, attempt - 1));
  candidates.push(exponential);

  let delay = Math.max(...candidates, DEFAULT_BACKOFF_MS);
  if (status === 429) delay = Math.max(delay, MIN_RATE_LIMIT_BACKOFF_MS);

  // Small cushion so the retry happens after the advertised reset, not exactly on its boundary.
  return Math.min(MAX_BACKOFF_MS, Math.ceil(delay) + 750);
}

export function createResilientFetch(baseFetch = globalThis.fetch, sleeper = sleep) {
  return async function resilientFetch(url, init) {
    const isGroq = String(url).includes(GROQ_ENDPOINT_FRAGMENT);
    if (!isGroq) return baseFetch(url, init);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      const sinceLast = Date.now() - lastGroqRequestAt;
      if (sinceLast < MIN_GROQ_INTERVAL_MS) await sleeper(MIN_GROQ_INTERVAL_MS - sinceLast);
      lastGroqRequestAt = Date.now();

      const response = await baseFetch(url, init);
      if (response.ok) return response;

      const status = Number(response.status || 0);
      const retryable = status === 429 || status === 408 || status >= 500;
      if (!retryable || attempt === MAX_RETRIES) return response;

      const bodyText = await response.text();
      const delay = retryDelayMs(response, bodyText, attempt, status);
      console.warn(`[HERMES sweep] Groq HTTP ${status}; retry ${attempt}/${MAX_RETRIES} in ${delay}ms`);
      await sleeper(delay);
    }

    throw new Error('unreachable resilient Groq fetch state');
  };
}

export async function runReliableSweep({ baseFetch = globalThis.fetch, sleeper = sleep } = {}) {
  const { runIndustrySweep } = await import('./industry-sweep-compound.mjs');
  const summary = await runIndustrySweep({ fetchImpl: createResilientFetch(baseFetch, sleeper) });

  const successfulBatches = Math.max(0, Number(summary.batches || 0) - Number(summary.failed_batches || 0));
  const operationalSuccess = !summary.error && Number(summary.failed_batches || 0) === 0 && successfulBatches > 0;

  console.log(`[HERMES reliable sweep] successful_batches=${successfulBatches}/${summary.batches} failed_batches=${summary.failed_batches || 0}`);
  if (!operationalSuccess) {
    const reason = summary.error || `SWEEP_INCOMPLETE_${summary.failed_batches || 0}_FAILED_BATCHES`;
    const error = new Error(reason);
    error.summary = summary;
    throw error;
  }

  return summary;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  try {
    const summary = await runReliableSweep();
    console.log(`[HERMES reliable sweep] SUCCESS domains=${summary.domains} batches=${summary.batches} findings=${summary.findings_seen} created=${summary.created}`);
  } catch (error) {
    console.error(`[HERMES reliable sweep] FAILURE ${String(error?.message || error)}`);
    if (error?.summary?.failures?.length) {
      for (const failure of error.summary.failures) console.error(`[HERMES reliable sweep] failed domains=${failure.domains.join(',')} error=${failure.error}`);
    }
    process.exitCode = 1;
  }
}
