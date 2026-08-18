#!/usr/bin/env node

import process from 'node:process';
import { pathToFileURL } from 'node:url';

process.env.HERMES_SWEEP_DOMAIN_BATCH ||= '1';

const GROQ_ENDPOINT_FRAGMENT = 'api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_RETRIES || 3));
const MIN_GROQ_INTERVAL_MS = Math.max(0, Number(process.env.HERMES_SWEEP_MIN_INTERVAL_MS || 5000));
const DEFAULT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_BACKOFF_MS || 10000));
const MIN_RATE_LIMIT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_MIN_429_BACKOFF_MS || 10000));
const MAX_FALLBACK_BACKOFF_MS = Math.max(MIN_RATE_LIMIT_BACKOFF_MS, Number(process.env.HERMES_SWEEP_MAX_BACKOFF_MS || 90000));
const MAX_SERVER_WAIT_MS = Math.max(10000, Number(process.env.HERMES_SWEEP_MAX_SERVER_WAIT_MS || 120000));
const QUOTA_CUSHION_MS = Math.max(250, Number(process.env.HERMES_SWEEP_QUOTA_CUSHION_MS || 1500));
const TOKEN_LOW_WATER_RATIO = Math.min(0.5, Math.max(0.01, Number(process.env.HERMES_SWEEP_TOKEN_LOW_WATER_RATIO || 0.12)));
const TOKEN_LOW_WATER_ABSOLUTE = Math.max(1000, Number(process.env.HERMES_SWEEP_TOKEN_LOW_WATER_ABSOLUTE || 12000));
const MAX_FINDINGS_PER_DOMAIN = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_FINDINGS_PER_DOMAIN || 3));

const MATRIX_INSTRUCTION = `\n\nHERMES OPERATIONAL SEARCH MATRIX — MANDATORY\nFor the supplied domain, execute these three lanes using the domain topics as concrete search terms, never merely the macro-domain label:\nA. CURRENT_APPLICATIONS — concrete new/revised products, engines, equipment, applications, service parts, fitments, fluids, manufacturing capability or operational changes.\nB. TECHNICAL_STANDARDS — concrete material, performance, testing, standards, regulatory or research developments with filtration/asset-protection relevance.\nC. ELIMFILTERS_KNOWLEDGE_GAP — for every verified external development, compare against ELIMFILTERS public Knowledge Center/knowledge-system and classify CREATE_NEW, UPDATE_REINFORCE, NO_MATERIAL_CHANGE or INTERNAL_ONLY.\nReject generic marketing, generic homepage changes and vague market commentary. Prefer primary evidence. Do not invent specifications or applications.\nOVERRIDE any earlier output-count instruction: return at most ${MAX_FINDINGS_PER_DOMAIN} highest-value material findings for this domain. Returning zero is correct when nothing material is verified.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastGroqRequestAt = 0;
let quotaState = null;

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

function headerValue(response, name) {
  try {
    return response?.headers?.get?.(name) ?? null;
  } catch {
    return null;
  }
}

function headerNumber(response, name) {
  const value = Number(headerValue(response, name));
  return Number.isFinite(value) ? value : null;
}

function headerMs(response, name, parser = durationToMs) {
  try {
    return parser(headerValue(response, name));
  } catch {
    return null;
  }
}

function captureQuota(response) {
  const limitTokens = headerNumber(response, 'x-ratelimit-limit-tokens');
  const remainingTokens = headerNumber(response, 'x-ratelimit-remaining-tokens');
  const remainingRequests = headerNumber(response, 'x-ratelimit-remaining-requests');
  const resetTokensMs = headerMs(response, 'x-ratelimit-reset-tokens');
  const resetRequestsMs = headerMs(response, 'x-ratelimit-reset-requests');
  quotaState = { limitTokens, remainingTokens, remainingRequests, resetTokensMs, resetRequestsMs };
  return quotaState;
}

function isDailyRequestQuotaExhausted(response) {
  return headerNumber(response, 'x-ratelimit-remaining-requests') === 0;
}

function bodyRetryMs(bodyText) {
  const match = String(bodyText || '').match(/try again in\s+([0-9.]+)\s*(ms|s|m)?/i);
  if (!match) return null;
  const unit = String(match[2] || 's').toLowerCase();
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  return Math.ceil(unit === 'ms' ? n : unit === 'm' ? n * 60_000 : n * 1000);
}

function retryDelayMs(response, bodyText, attempt, status) {
  const retryAfterMs = headerMs(response, 'retry-after', retryAfterToMs);
  const tokenResetMs = headerMs(response, 'x-ratelimit-reset-tokens');
  const messageDelayMs = bodyRetryMs(bodyText);
  const fallback = Math.min(MAX_FALLBACK_BACKOFF_MS, DEFAULT_BACKOFF_MS * (2 ** Math.max(0, attempt - 1)));

  const candidates = [retryAfterMs, messageDelayMs, fallback].filter((value) => Number.isFinite(value) && value >= 0);
  if (status === 429 && Number.isFinite(tokenResetMs) && tokenResetMs >= 0) candidates.push(tokenResetMs);

  let delay = Math.max(...candidates, DEFAULT_BACKOFF_MS);
  if (status === 429) delay = Math.max(delay, MIN_RATE_LIMIT_BACKOFF_MS);
  return Math.ceil(delay) + QUOTA_CUSHION_MS;
}

function tokenThreshold({ limitTokens }) {
  const ratioThreshold = Number.isFinite(limitTokens) ? Math.ceil(limitTokens * TOKEN_LOW_WATER_RATIO) : 0;
  return Math.max(TOKEN_LOW_WATER_ABSOLUTE, ratioThreshold);
}

async function waitForQuotaIfNeeded(sleeper) {
  if (!quotaState) return;
  const { remainingTokens, resetTokensMs, remainingRequests } = quotaState;

  if (remainingRequests === 0) throw new Error('GROQ_RPD_EXHAUSTED');
  if (!Number.isFinite(remainingTokens) || !Number.isFinite(resetTokensMs)) return;

  const threshold = tokenThreshold(quotaState);
  if (remainingTokens > threshold) return;

  const waitMs = Math.max(0, resetTokensMs) + QUOTA_CUSHION_MS;
  if (waitMs > MAX_SERVER_WAIT_MS) {
    throw new Error(`GROQ_TPM_RESET_TOO_LONG_${waitMs}MS`);
  }

  console.warn(`[HERMES sweep] proactive TPM pacing remaining_tokens=${remainingTokens} threshold=${threshold}; waiting ${waitMs}ms before next domain`);
  await sleeper(waitMs);
  quotaState = null;
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
    await waitForQuotaIfNeeded(sleeper);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      const sinceLast = Date.now() - lastGroqRequestAt;
      if (sinceLast < MIN_GROQ_INTERVAL_MS) await sleeper(MIN_GROQ_INTERVAL_MS - sinceLast);
      lastGroqRequestAt = Date.now();

      const response = await baseFetch(url, requestInit);
      captureQuota(response);
      if (response.ok) return response;

      const status = Number(response.status || 0);
      const retryable = status === 429 || status === 408 || status >= 500;
      if (!retryable || attempt === MAX_RETRIES) return response;

      if (status === 429 && isDailyRequestQuotaExhausted(response)) {
        console.error('[HERMES sweep] Groq daily request quota exhausted; not retrying inside this workflow run');
        return response;
      }

      const bodyText = await response.text();
      const delay = retryDelayMs(response, bodyText, attempt, status);
      if (status === 429 && delay > MAX_SERVER_WAIT_MS) {
        console.error(`[HERMES sweep] Groq TPM reset requires ${delay}ms; exceeds workflow wait ceiling ${MAX_SERVER_WAIT_MS}ms, failing this batch instead of burning Actions minutes`);
        return response;
      }

      const tokenResetMs = quotaState?.resetTokensMs;
      console.warn(`[HERMES sweep] Groq HTTP ${status}; retry ${attempt}/${MAX_RETRIES} in ${delay}ms${Number.isFinite(tokenResetMs) ? ` token_reset=${tokenResetMs}ms` : ''}`);
      await sleeper(delay);
      quotaState = null;
    }

    throw new Error('unreachable resilient Groq fetch state');
  };
}

export async function runReliableSweep({ baseFetch = globalThis.fetch, sleeper = sleep } = {}) {
  const { runIndustrySweep } = await import('./industry-sweep-compound.mjs');
  console.log(`[HERMES reliable sweep] matrix=3-lane domain_batch=1 max_findings_per_domain=${MAX_FINDINGS_PER_DOMAIN} scheduler=quota-aware-v2 retries=${MAX_RETRIES}`);
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
