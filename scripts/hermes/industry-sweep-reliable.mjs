#!/usr/bin/env node

import process from 'node:process';
import { pathToFileURL } from 'node:url';

// One domain per Compound call prevents oversized requests and makes failures attributable.
process.env.HERMES_SWEEP_DOMAIN_BATCH ||= '1';

const GROQ_ENDPOINT_FRAGMENT = 'api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_RETRIES || 5));
const MIN_GROQ_INTERVAL_MS = Math.max(0, Number(process.env.HERMES_SWEEP_MIN_INTERVAL_MS || 4000));
const DEFAULT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_BACKOFF_MS || 5000));
const MIN_RATE_LIMIT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_MIN_429_BACKOFF_MS || 5000));
const MAX_BACKOFF_MS = Math.max(MIN_RATE_LIMIT_BACKOFF_MS, Number(process.env.HERMES_SWEEP_MAX_BACKOFF_MS || 90000));
const MAX_FINDINGS_PER_DOMAIN = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_FINDINGS_PER_DOMAIN || 3));

const MATRIX_INSTRUCTION = `

HERMES OPERATIONAL SEARCH MATRIX — MANDATORY
For the supplied domain, execute these three lanes using the domain topics as concrete search terms, never merely the macro-domain label:
A. CURRENT_APPLICATIONS — concrete new/revised products, engines, equipment, applications, service parts, fitments, fluids, manufacturing capability or operational changes.
B. TECHNICAL_STANDARDS — concrete material, performance, testing, standards, regulatory or research developments with filtration/asset-protection relevance.
C. ELIMFILTERS_KNOWLEDGE_GAP — for every verified external development, compare against ELIMFILTERS public Knowledge Center/knowledge-system and classify CREATE_NEW, UPDATE_REINFORCE, NO_MATERIAL_CHANGE or INTERNAL_ONLY.
Reject generic marketing, generic homepage changes and vague market commentary. Prefer primary evidence. Do not invent specifications or applications.
OVERRIDE any earlier output-count instruction: return at most ${MAX_FINDINGS_PER_DOMAIN} highest-value material findings for this domain. Returning zero is correct when nothing material is verified.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastGroqRequestAt = 0;

function durationToMs(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
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
    if (Number.isFinite(n)) candidates.push(Math.ceil(unit === 'ms' ? n : unit === 'm' ? n * 60_000 : n * 1000));
  }

  candidates.push(DEFAULT_BACKOFF_MS * (2 ** Math.max(0, attempt - 1)));
  let delay = Math.max(...candidates, DEFAULT_BACKOFF_MS);
  if (status === 429) delay = Math.max(delay, MIN_RATE_LIMIT_BACKOFF_MS);
  return Math.min(MAX_BACKOFF_MS, Math.ceil(delay) + 750);
}

export function applySearchMatrix(init = {}) {
  if (!init?.body) return init;
  try {
    const payload = JSON.parse(String(init.body));
    if (!Array.isArray(payload.messages)) return init;
    let applied = false;
    const messages = payload.messages.map((message) => {
      if (!applied && message?.role === 'system' && typeof message.content === 'string') {
        applied = true;
        return { ...message, content: `${message.content}${MATRIX_INSTRUCTION}` };
      }
      return message;
    });
    if (!applied) return init;
    return { ...init, body: JSON.stringify({ ...payload, messages }) };
  } catch {
    return init;
  }
}

export function createResilientFetch(baseFetch = globalThis.fetch, sleeper = sleep) {
  return async function resilientFetch(url, init) {
    const isGroq = String(url).includes(GROQ_ENDPOINT_FRAGMENT);
    if (!isGroq) return baseFetch(url, init);

    const requestInit = applySearchMatrix(init);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      const sinceLast = Date.now() - lastGroqRequestAt;
      if (sinceLast < MIN_GROQ_INTERVAL_MS) await sleeper(MIN_GROQ_INTERVAL_MS - sinceLast);
      lastGroqRequestAt = Date.now();

      const response = await baseFetch(url, requestInit);
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
  console.log(`[HERMES reliable sweep] matrix=3-lane domain_batch=1 max_findings_per_domain=${MAX_FINDINGS_PER_DOMAIN}`);
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
