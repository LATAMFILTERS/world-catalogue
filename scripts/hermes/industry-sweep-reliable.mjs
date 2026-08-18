#!/usr/bin/env node

import process from 'node:process';
import { pathToFileURL } from 'node:url';

// Keep each Groq Compound request small enough to avoid 413 errors.
process.env.HERMES_SWEEP_DOMAIN_BATCH ||= '1';

const GROQ_ENDPOINT_FRAGMENT = 'api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_RETRIES || 5));
const MIN_GROQ_INTERVAL_MS = Math.max(0, Number(process.env.HERMES_SWEEP_MIN_INTERVAL_MS || 1800));
const DEFAULT_BACKOFF_MS = Math.max(500, Number(process.env.HERMES_SWEEP_BACKOFF_MS || 2500));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastGroqRequestAt = 0;

function retryDelayMs(response, bodyText, attempt) {
  const header = response?.headers?.get?.('retry-after');
  const headerSeconds = Number(header);
  if (Number.isFinite(headerSeconds) && headerSeconds >= 0) return Math.ceil(headerSeconds * 1000) + 500;

  const match = String(bodyText || '').match(/try again in\s+([0-9.]+)s/i);
  if (match) return Math.ceil(Number(match[1]) * 1000) + 500;

  return Math.min(30000, DEFAULT_BACKOFF_MS * (2 ** Math.max(0, attempt - 1)));
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
      const delay = retryDelayMs(response, bodyText, attempt);
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
