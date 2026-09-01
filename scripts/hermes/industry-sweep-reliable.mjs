#!/usr/bin/env node

import process from 'node:process';
import { pathToFileURL } from 'node:url';

process.env.HERMES_SWEEP_DOMAIN_BATCH ||= '1';

const GROQ_ENDPOINT_FRAGMENT = 'api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_RETRIES || 3));
// Groq's on-demand tier caps groq/compound at 30,000 tokens per minute
// (TPM). Each domain's 3-lane matrix call has run 8,000-19,000+ tokens in
// observed production runs, so the old 5s floor allowed 3-4 requests within
// a rolling minute — comfortably over the TPM cap on its own, before any
// retry even fires. That produced a 429 storm on 2026-08-24 (13/15 domain
// batches failed, and the run still burned 492,474 of the 500,000 daily
// token budget retrying into the wall) rather than a slow, reliable sweep.
// One request per ~70s keeps every domain's real usage under the per-minute
// cap with headroom, even for the largest observed calls.
const MIN_GROQ_INTERVAL_MS = Math.max(0, Number(process.env.HERMES_SWEEP_MIN_INTERVAL_MS || 70000));
const DEFAULT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_BACKOFF_MS || 10000));
const MIN_RATE_LIMIT_BACKOFF_MS = Math.max(1000, Number(process.env.HERMES_SWEEP_MIN_429_BACKOFF_MS || 10000));
const MAX_FALLBACK_BACKOFF_MS = Math.max(MIN_RATE_LIMIT_BACKOFF_MS, Number(process.env.HERMES_SWEEP_MAX_BACKOFF_MS || 90000));
const MAX_SERVER_WAIT_MS = Math.max(10000, Number(process.env.HERMES_SWEEP_MAX_SERVER_WAIT_MS || 120000));
const QUOTA_CUSHION_MS = Math.max(250, Number(process.env.HERMES_SWEEP_QUOTA_CUSHION_MS || 1500));
const TOKEN_LOW_WATER_RATIO = Math.min(0.5, Math.max(0.01, Number(process.env.HERMES_SWEEP_TOKEN_LOW_WATER_RATIO || 0.12)));
const TOKEN_LOW_WATER_ABSOLUTE = Math.max(1000, Number(process.env.HERMES_SWEEP_TOKEN_LOW_WATER_ABSOLUTE || 12000));
const MAX_FINDINGS_PER_DOMAIN = Math.max(1, Number(process.env.HERMES_SWEEP_MAX_FINDINGS_PER_DOMAIN || 3));
const PRIMARY_MODEL = process.env.HERMES_GROQ_MODEL || 'groq/compound';
const FALLBACK_MODEL = process.env.HERMES_GROQ_FALLBACK_MODEL || 'groq/compound-mini';
const ENABLE_TPD_FALLBACK = String(process.env.HERMES_GROQ_TPD_FALLBACK || 'true').toLowerCase() !== 'false';
const MAX_DEGRADED_EMPTY_BATCHES = Math.max(0, Number(process.env.HERMES_SWEEP_MAX_DEGRADED_EMPTY_BATCHES || 1));

const MATRIX_INSTRUCTION = `\n\nHERMES OPERATIONAL SEARCH MATRIX — MANDATORY\nFor the supplied domain, execute these three lanes using the domain topics as concrete search terms, never merely the macro-domain label:\nA. CURRENT_APPLICATIONS — concrete new/revised products, engines, equipment, applications, service parts, fitments, fluids, manufacturing capability or operational changes.\nB. TECHNICAL_STANDARDS — concrete material, performance, testing, standards, regulatory or research developments with filtration/asset-protection relevance.\nC. ELIMFILTERS_KNOWLEDGE_GAP — for every verified external development, compare against ELIMFILTERS public Knowledge Center/knowledge-system and classify CREATE_NEW, UPDATE_REINFORCE, NO_MATERIAL_CHANGE or INTERNAL_ONLY.\nReject generic marketing, generic homepage changes and vague market commentary. Prefer primary evidence. Do not invent specifications or applications.\nOVERRIDE any earlier output-count instruction: return at most ${MAX_FINDINGS_PER_DOMAIN} highest-value material findings for this domain. Returning zero is correct when nothing material is verified.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastGroqRequestAt = 0;
let quotaState = null;
let fatalDailyQuota = null;
// Run-scoped circuit breaker: once a specific model is confirmed
// TPD-exhausted anywhere in this run, every later call (any domain, any
// batch) must know that immediately rather than independently rediscovering
// it through its own 429 retry cycle first.
let exhaustedModels = new Set();

// Test-only reset of the run-scoped state above. runReliableSweep() resets
// the same state on every real invocation (a fresh process is one run); a
// test file that exercises createResilientFetch() directly, without going
// through runReliableSweep(), needs an explicit way back to a clean slate
// between cases since the state is deliberately module-scoped (not
// per-call) for the rest of the process's lifetime.
export function _resetQuotaStateForTests() {
  fatalDailyQuota = null;
  quotaState = null;
  exhaustedModels = new Set();
  // Also module-scoped, and just as much a leak between test cases as the
  // three above — omitting it let one test's pacing clock bleed into the
  // next, which only stayed invisible while MIN_GROQ_INTERVAL_MS was small
  // enough that a leftover pacing wait never crossed a test's backoff-size
  // threshold assertions.
  lastGroqRequestAt = 0;
}

function quotaExhaustedError(message) {
  const error = new Error(message);
  error.code = 'HERMES_QUOTA_EXHAUSTED';
  return error;
}

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
  try { return response?.headers?.get?.(name) ?? null; } catch { return null; }
}

function headerNumber(response, name) {
  const raw = headerValue(response, name);
  // A missing header must read as "unknown" (null), never as the number
  // zero — Number(null) is 0, which would otherwise make any Groq response
  // that simply omits this header look identical to "0 remaining", falsely
  // tripping GROQ_RPD_EXHAUSTED for a response that said nothing about
  // request-quota at all.
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function headerMs(response, name, parser = durationToMs) {
  try { return parser(headerValue(response, name)); } catch { return null; }
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

function isTpdLimit(bodyText) {
  const text = String(bodyText || '');
  return /tokens per day\s*\(TPD\)/i.test(text) || /\bTPD\b/i.test(text) && /rate limit/i.test(text);
}

function tpdDetails(bodyText) {
  const text = String(bodyText || '');
  const limit = Number(text.match(/Limit\s+([0-9]+)/i)?.[1]);
  const used = Number(text.match(/Used\s+([0-9]+)/i)?.[1]);
  const requested = Number(text.match(/Requested\s+([0-9]+)/i)?.[1]);
  return {
    limit: Number.isFinite(limit) ? limit : null,
    used: Number.isFinite(used) ? used : null,
    requested: Number.isFinite(requested) ? requested : null,
    retryMs: bodyRetryMs(text)
  };
}

function withModel(init, model) {
  if (!init?.body) return init;
  try {
    const payload = JSON.parse(String(init.body));
    return { ...init, body: JSON.stringify({ ...payload, model }) };
  } catch {
    return init;
  }
}

function currentModel(init) {
  try { return JSON.parse(String(init?.body || '{}')).model || PRIMARY_MODEL; } catch { return PRIMARY_MODEL; }
}

async function groqResponseHasContent(response) {
  if (!response?.ok || typeof response.clone !== 'function') return true;
  try {
    const payload = await response.clone().json();
    const content = payload?.choices?.[0]?.message?.content;
    return typeof content === 'string' && content.trim().length > 0;
  } catch {
    return false;
  }
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
  if (fatalDailyQuota) throw quotaExhaustedError(fatalDailyQuota);
  if (!quotaState) return;
  const { remainingTokens, resetTokensMs, remainingRequests } = quotaState;
  if (remainingRequests === 0) {
    fatalDailyQuota = fatalDailyQuota || 'GROQ_RPD_EXHAUSTED';
    throw quotaExhaustedError('GROQ_RPD_EXHAUSTED');
  }
  if (!Number.isFinite(remainingTokens) || !Number.isFinite(resetTokensMs)) return;
  const threshold = tokenThreshold(quotaState);
  if (remainingTokens > threshold) return;
  const waitMs = Math.max(0, resetTokensMs) + QUOTA_CUSHION_MS;
  if (waitMs > MAX_SERVER_WAIT_MS) throw new Error(`GROQ_TPM_RESET_TOO_LONG_${waitMs}MS`);
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

// A Groq response's body can only ever be read once. When this module has
// already consumed it (via response.text() below, to inspect a 429/5xx body
// for TPD/retry details) and then still needs to return that response to
// the caller — because retries were exhausted, not because it succeeded —
// the caller's own attempt to read the body again would throw "Body is
// unusable: Body has already been read". Returning a fresh Response built
// from the already-captured text keeps the status/headers intact while
// making the body readable exactly once more, for the caller.
function replayableResponse(response, bodyText) {
  try {
    return new Response(bodyText, { status: response.status, statusText: response.statusText, headers: response.headers });
  } catch {
    return response;
  }
}

/**
 * If `model` is already known-exhausted this run, returns the model this
 * call should actually use instead (falling back, or throwing fatally if
 * the fallback is exhausted too) WITHOUT spending a real HTTP round-trip to
 * rediscover what an earlier domain/batch already proved.
 */
function resolveModelForExhaustion(requestInit, model, fallbackUsed) {
  if (!exhaustedModels.has(model)) return { requestInit, model, fallbackUsed };
  if (model === PRIMARY_MODEL && ENABLE_TPD_FALLBACK && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL && !exhaustedModels.has(FALLBACK_MODEL)) {
    console.warn(`[HERMES sweep] primary ${PRIMARY_MODEL} already known TPD-exhausted this run; using ${FALLBACK_MODEL} without retrying primary`);
    return { requestInit: withModel(requestInit, FALLBACK_MODEL), model: FALLBACK_MODEL, fallbackUsed: true };
  }
  throw quotaExhaustedError(fatalDailyQuota || `GROQ_TPD_EXHAUSTED model=${model} (already known-exhausted this run)`);
}

export function createResilientFetch(baseFetch = globalThis.fetch, sleeper = sleep) {
  return async function resilientFetch(url, init) {
    const isGroq = String(url).includes(GROQ_ENDPOINT_FRAGMENT);
    if (!isGroq) return baseFetch(url, init);
    if (fatalDailyQuota) throw quotaExhaustedError(fatalDailyQuota);

    let requestInit = applySearchMatrix(init);
    let model = currentModel(requestInit);
    let fallbackUsed = model === FALLBACK_MODEL;
    ({ requestInit, model, fallbackUsed } = resolveModelForExhaustion(requestInit, model, fallbackUsed));
    await waitForQuotaIfNeeded(sleeper);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      // Re-checked every iteration, not just once before the loop: another
      // call earlier in this same sequential sweep may have confirmed fatal
      // exhaustion while THIS call was already mid-retry-loop.
      if (fatalDailyQuota) throw quotaExhaustedError(fatalDailyQuota);

      const sinceLast = Date.now() - lastGroqRequestAt;
      if (sinceLast < MIN_GROQ_INTERVAL_MS) await sleeper(MIN_GROQ_INTERVAL_MS - sinceLast);
      lastGroqRequestAt = Date.now();

      const response = await baseFetch(url, requestInit);
      captureQuota(response);

      if (response.ok) {
        const hasContent = await groqResponseHasContent(response);
        if (hasContent) return response;
        if (attempt === MAX_RETRIES) {
          console.error(`[HERMES sweep] Groq HTTP 200 returned empty content after ${MAX_RETRIES} attempt(s) model=${model}`);
          return response;
        }
        const delay = Math.min(MAX_FALLBACK_BACKOFF_MS, DEFAULT_BACKOFF_MS * (2 ** Math.max(0, attempt - 1))) + QUOTA_CUSHION_MS;
        console.warn(`[HERMES sweep] Groq HTTP 200 returned empty content; retry ${attempt}/${MAX_RETRIES} in ${delay}ms model=${model}`);
        await sleeper(delay);
        quotaState = null;
        continue;
      }

      const status = Number(response.status || 0);
      const retryable = status === 429 || status === 408 || status >= 500;
      if (!retryable) return response;

      const bodyText = await response.text();

      if (status === 429 && isTpdLimit(bodyText)) {
        const details = tpdDetails(bodyText);
        // Recorded immediately and unconditionally: this model is exhausted
        // for the rest of the run regardless of whether THIS call can still
        // limp along on a fallback.
        exhaustedModels.add(model);

        if (ENABLE_TPD_FALLBACK && !fallbackUsed && model === PRIMARY_MODEL && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL && !exhaustedModels.has(FALLBACK_MODEL)) {
          console.warn(`[HERMES sweep] primary Compound underlying TPD exhausted used=${details.used ?? 'unknown'}/${details.limit ?? 'unknown'} requested=${details.requested ?? 'unknown'}; switching this domain to ${FALLBACK_MODEL}`);
          requestInit = withModel(requestInit, FALLBACK_MODEL);
          model = FALLBACK_MODEL;
          fallbackUsed = true;
          quotaState = null;
          attempt = 0;
          continue;
        }

        fatalDailyQuota = `GROQ_TPD_EXHAUSTED model=${model} used=${details.used ?? 'unknown'} limit=${details.limit ?? 'unknown'} requested=${details.requested ?? 'unknown'} retry_ms=${details.retryMs ?? 'unknown'}`;
        console.error(`[HERMES sweep] ${fatalDailyQuota}; stopping further Groq requests in this sweep`);
        throw quotaExhaustedError(fatalDailyQuota);
      }

      if (attempt === MAX_RETRIES) return replayableResponse(response, bodyText);

      if (status === 429 && isDailyRequestQuotaExhausted(response)) {
        fatalDailyQuota = 'GROQ_RPD_EXHAUSTED';
        console.error('[HERMES sweep] Groq daily request quota exhausted; stopping further Groq requests in this sweep');
        throw quotaExhaustedError(fatalDailyQuota);
      }

      const delay = retryDelayMs(response, bodyText, attempt, status);
      if (status === 429 && delay > MAX_SERVER_WAIT_MS) {
        console.error(`[HERMES sweep] Groq recovery requires ${delay}ms; exceeds workflow wait ceiling ${MAX_SERVER_WAIT_MS}ms`);
        return replayableResponse(response, bodyText);
      }

      const tokenResetMs = quotaState?.resetTokensMs;
      console.warn(`[HERMES sweep] Groq HTTP ${status}; retry ${attempt}/${MAX_RETRIES} in ${delay}ms model=${model}${Number.isFinite(tokenResetMs) ? ` token_reset=${tokenResetMs}ms` : ''}`);
      await sleeper(delay);
      quotaState = null;
    }

    throw new Error('unreachable resilient Groq fetch state');
  };
}

export async function runReliableSweep({ baseFetch = globalThis.fetch, sleeper = sleep } = {}) {
  fatalDailyQuota = null;
  quotaState = null;
  exhaustedModels = new Set();
  const { runIndustrySweep } = await import('./industry-sweep-compound.mjs');
  console.log(`[HERMES reliable sweep] matrix=3-lane domain_batch=1 max_findings_per_domain=${MAX_FINDINGS_PER_DOMAIN} scheduler=quota-aware-v4 retries=${MAX_RETRIES} fallback=${FALLBACK_MODEL}`);
  const summary = await runIndustrySweep({ fetchImpl: createResilientFetch(baseFetch, sleeper) });

  const failedBatches = Number(summary.failed_batches || 0);
  const skippedDueQuota = Number(summary.skipped_due_quota || 0);
  const successfulBatches = Math.max(0, Number(summary.batches || 0) - failedBatches - skippedDueQuota);
  const emptyOnlyFailures = failedBatches > 0 && failedBatches <= MAX_DEGRADED_EMPTY_BATCHES && Array.isArray(summary.failures) && summary.failures.length === failedBatches && summary.failures.every((failure) => /Groq returned no content/i.test(String(failure?.error || '')));
  const strictSuccess = !summary.error && !fatalDailyQuota && !summary.quota_exhausted && failedBatches === 0 && successfulBatches > 0;
  const degradedSuccess = !summary.error && !fatalDailyQuota && !summary.quota_exhausted && successfulBatches > 0 && emptyOnlyFailures;

  console.log(`[HERMES reliable sweep] successful_batches=${successfulBatches}/${summary.batches} failed_batches=${failedBatches} skipped_due_quota=${skippedDueQuota}`);

  // A clean, unambiguous terminal status a caller can key off of directly —
  // never a generic thrown Error alone, and never a silent partial result.
  if (summary.quota_exhausted || fatalDailyQuota) {
    summary.operational_status = 'QUOTA_EXHAUSTED';
    const reason = summary.quota_exhausted_reason || fatalDailyQuota;
    console.error(`[HERMES reliable sweep] QUOTA_EXHAUSTED reason=${reason} successful_batches=${successfulBatches}/${summary.batches} skipped_due_quota=${skippedDueQuota}`);
    if (successfulBatches > 0) {
      // Quota ran out partway through — preserve whatever legitimate
      // intelligence was already gathered for report/review, same spirit
      // as the existing DEGRADED path, rather than discarding it.
      return summary;
    }
    const error = quotaExhaustedError(reason);
    error.summary = summary;
    throw error;
  }

  if (degradedSuccess) {
    summary.operational_status = 'DEGRADED';
    summary.unresolved_domains = summary.failures.flatMap((failure) => failure.domains || []);
    console.warn(`[HERMES reliable sweep] DEGRADED unresolved_domains=${summary.unresolved_domains.join(',')} reason=EMPTY_GROQ_RESPONSE_AFTER_RETRIES; preserving successful intelligence for report/review`);
    return summary;
  }

  if (!strictSuccess) {
    const reason = summary.error || `SWEEP_INCOMPLETE_${failedBatches}_FAILED_BATCHES`;
    const error = new Error(reason);
    error.summary = summary;
    throw error;
  }

  summary.operational_status = 'SUCCESS';
  return summary;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  try {
    const summary = await runReliableSweep();
    console.log(`[HERMES reliable sweep] ${summary.operational_status || 'SUCCESS'} domains=${summary.domains} batches=${summary.batches} findings=${summary.findings_seen} created=${summary.created}`);
    if (summary.operational_status === 'QUOTA_EXHAUSTED') {
      console.warn(`[HERMES reliable sweep] skipped_due_quota=${summary.skipped_due_quota || 0} domains=${(summary.skipped_domains || []).join(',')}`);
    }
  } catch (error) {
    console.error(`[HERMES reliable sweep] FAILURE ${String(error?.message || error)}`);
    if (error?.code === 'HERMES_QUOTA_EXHAUSTED') {
      console.error(`[HERMES reliable sweep] operational_status=QUOTA_EXHAUSTED skipped_due_quota=${error?.summary?.skipped_due_quota || 0}`);
    }
    if (error?.summary?.failures?.length) {
      for (const failure of error.summary.failures.slice(0, 3)) console.error(`[HERMES reliable sweep] failed domains=${failure.domains.join(',')} error=${failure.error}`);
      if (error.summary.failures.length > 3) console.error(`[HERMES reliable sweep] ${error.summary.failures.length - 3} additional failed batch(es) suppressed from log`);
    }
    process.exitCode = 1;
  }
}
