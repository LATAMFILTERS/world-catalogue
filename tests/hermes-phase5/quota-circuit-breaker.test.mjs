// HERMES — 2026-08-19 quota/circuit-breaker regression suite, filed against
// GitHub Actions run 32255675070 (HERMES Weekly Intelligence Collection,
// failed 2026-08-19T13:19:42Z). Root causes confirmed directly from that
// run's logs + code inspection, not guessed from symptoms:
//
// 1. "Body is unusable: Body has already been read" — industry-sweep-
//    reliable.mjs's resilientFetch read a 429/5xx response body once
//    internally (to inspect it for TPD/retry details) and then, when
//    retries were exhausted, returned that SAME already-drained Response
//    object to the caller (industry-sweep-compound.mjs's searchBatch),
//    which tried to read the body a second time.
// 2. The retry `for` loop only checked the fatalDailyQuota flag once,
//    before the loop started — not on each iteration — so a call already
//    mid-retry kept retrying even after quota was confirmed exhausted.
// 3. Model-exhaustion state (which model is confirmed TPD-exhausted) was
//    tracked only per-call (a local `fallbackUsed` variable), so every
//    sequential domain batch independently rediscovered "primary is
//    exhausted" through its own full 429 retry cycle before switching to
//    fallback, instead of remembering it for the rest of the run.
// 4. A fatal quota exhaustion surfaced only as a generic thrown Error
//    (fatalDailyQuota's raw message string), with no distinguishable status
//    a caller could key off of.
// 5. Batches never attempted because quota was already exhausted were
//    silently absent from the summary — not counted, not distinguished
//    from a genuine per-batch failure.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createResilientFetch, _resetQuotaStateForTests } from '../../scripts/hermes/industry-sweep-reliable.mjs';
import { runIndustrySweep } from '../../scripts/hermes/industry-sweep-compound.mjs';

// fatalDailyQuota/quotaState/exhaustedModels are deliberately module-scoped
// (run-scoped, not per-call) in industry-sweep-reliable.mjs — see item 3.
// That means every test() below in this file shares that state unless
// explicitly reset first; runReliableSweep() does this reset for every real
// run, so tests exercising createResilientFetch() directly must do it too.
test.beforeEach(() => _resetQuotaStateForTests());

function tpdResponse({ used = 497987, limit = 500000, requested = 4856 } = {}) {
  const bodyText = `Rate limit reached for tokens per day (TPD): Limit ${limit}, Used ${used}, Requested ${requested}. Please try again in 1.2s.`;
  return {
    ok: false,
    status: 429,
    statusText: 'Too Many Requests',
    headers: new Headers({ 'retry-after': '1', 'x-ratelimit-remaining-tokens': '0', 'x-ratelimit-reset-tokens': '1200ms' }),
    text: async () => bodyText
  };
}

function serverErrorResponse(status = 500) {
  return {
    ok: false,
    status,
    statusText: 'Internal Server Error',
    headers: new Headers({}),
    text: async () => 'upstream error, no useful body'
  };
}

function okResponse(content) {
  return {
    ok: true,
    status: 200,
    headers: new Headers({}),
    clone() { return okResponse(content); },
    json: async () => ({ choices: [{ message: { content: JSON.stringify(content) } }] }),
    text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] })
  };
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const noSleep = async () => {};

// ---------------------------------------------------------------------------
// 1) A response drained internally for TPD/retry inspection is still
//    readable exactly once more by the caller after retries are exhausted.
// ---------------------------------------------------------------------------

test('1) a response whose body was already read internally is still readable by the caller after retries are exhausted', async () => {
  // Non-TPD 500s exhaust MAX_RETRIES (default 3) without ever throwing —
  // resilientFetch returns the final response instead, having already read
  // its body once internally via retryDelayMs's body-text inspection.
  let calls = 0;
  const baseFetch = async () => { calls += 1; return serverErrorResponse(500); };
  const resilientFetch = createResilientFetch(baseFetch, noSleep);
  const response = await resilientFetch(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) });
  assert.equal(response.ok, false);
  assert.equal(response.status, 500);
  // This must NOT throw "Body is unusable: Body has already been read".
  const text = await response.text();
  assert.equal(text, 'upstream error, no useful body');
  assert.ok(calls >= 3, 'should have actually retried up to MAX_RETRIES');
});

// ---------------------------------------------------------------------------
// 2/3) Run-scoped circuit breaker: once a model is confirmed TPD-exhausted,
// later calls (simulating later sequential domain batches) neither retry it
// nor rediscover the exhaustion through their own 429 cycle — they either
// skip straight to a non-exhausted fallback, or fail fast with zero HTTP
// calls once the fallback is exhausted too.
// ---------------------------------------------------------------------------

test('2/3) once primary is confirmed TPD-exhausted, the next call skips straight to fallback with no primary retries', async () => {
  const modelsCalled = [];
  const baseFetch = async (url, init) => {
    const model = JSON.parse(init.body).model;
    modelsCalled.push(model);
    if (model === 'groq/compound') return tpdResponse();
    return okResponse({ findings: [] });
  };
  const resilientFetch = createResilientFetch(baseFetch, noSleep);

  // First call: primary is tried, discovered exhausted, falls back, succeeds.
  const first = await resilientFetch(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) });
  assert.equal(first.ok, true);
  const firstPrimaryCalls = modelsCalled.filter((m) => m === 'groq/compound').length;
  assert.equal(firstPrimaryCalls, 1, 'first call should try primary exactly once before falling back');

  modelsCalled.length = 0;
  // Second call (a later, independent domain batch): must go straight to
  // fallback — zero calls to the already-known-exhausted primary model.
  const second = await resilientFetch(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) });
  assert.equal(second.ok, true);
  assert.equal(modelsCalled.filter((m) => m === 'groq/compound').length, 0, 'must not retry a model already known-exhausted this run');
  assert.deepEqual(modelsCalled, ['groq/compound-mini']);
});

test('3b) once BOTH primary and fallback are confirmed exhausted, a later call fails immediately with zero HTTP calls', async () => {
  let httpCalls = 0;
  const baseFetch = async (url, init) => {
    httpCalls += 1;
    const model = JSON.parse(init.body).model;
    return tpdResponse({ used: model === 'groq/compound' ? 497987 : 99998, limit: model === 'groq/compound' ? 500000 : 100000 });
  };
  const resilientFetch = createResilientFetch(baseFetch, noSleep);

  // First call exhausts primary, tries fallback, fallback is ALSO
  // TPD-exhausted -> fatal for the run.
  await assert.rejects(
    () => resilientFetch(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) }),
    (error) => { assert.equal(error.code, 'HERMES_QUOTA_EXHAUSTED'); return true; }
  );
  const callsForFirstAttempt = httpCalls;
  assert.ok(callsForFirstAttempt >= 2, 'first call legitimately needs to discover both primary and fallback are exhausted');

  // A second, later call (next domain batch) must fail immediately —
  // zero additional HTTP calls, no rediscovery.
  await assert.rejects(
    () => resilientFetch(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) }),
    (error) => { assert.equal(error.code, 'HERMES_QUOTA_EXHAUSTED'); return true; }
  );
  assert.equal(httpCalls, callsForFirstAttempt, 'second call must make zero additional HTTP calls once both models are known-exhausted');
});

test('2b) the retry loop itself re-checks fatal exhaustion on every iteration, not only once before the loop', async () => {
  // Step 1, within THIS test: establish real fatal exhaustion (both models)
  // via a first call, exactly like 3b does — this is the run-scoped state
  // the retry loop must respect afterward.
  const exhaustFetch = async (url, init) => {
    const model = JSON.parse(init.body).model;
    return tpdResponse({ used: model === 'groq/compound' ? 497987 : 99999, limit: model === 'groq/compound' ? 500000 : 100000 });
  };
  const resilientFetchA = createResilientFetch(exhaustFetch, noSleep);
  await assert.rejects(() => resilientFetchA(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) }));

  // Step 2: a plain retryable 5xx on a fresh closure sharing the same
  // module-scoped fatalDailyQuota would normally retry MAX_RETRIES times;
  // once fatal exhaustion is already known, the loop must bail on its very
  // first iteration instead of ever calling the network.
  let httpAttempts = 0;
  const resilientFetchB = createResilientFetch(async () => { httpAttempts += 1; return serverErrorResponse(500); }, noSleep);
  await assert.rejects(
    () => resilientFetchB(GROQ_URL, { body: JSON.stringify({ model: 'groq/compound' }) }),
    (error) => { assert.equal(error.code, 'HERMES_QUOTA_EXHAUSTED'); return true; }
  );
  assert.equal(httpAttempts, 0, 'must not make any HTTP call at all once fatal exhaustion is already known this run');
});

// ---------------------------------------------------------------------------
// 4/5) Clean QUOTA_EXHAUSTED status + skipped_due_quota accounting, at the
// runIndustrySweep level (the actual production entry point).
// ---------------------------------------------------------------------------

// NOTE: industry-sweep-compound.mjs reads HERMES_MISSION_PATH into a
// module-level constant at import time (matching this codebase's existing
// pattern for HERMES_SWEEP_DOMAIN_BATCH etc.) — a test cannot override it
// after the module is already imported (as it is, statically, at the top of
// this file), so this test uses the real mission file and computes its
// expectations from its actual domain count rather than a fixed number.
const REAL_DOMAIN_COUNT = JSON.parse(fs.readFileSync(path.resolve('hermes/config/intelligence-mission.json'), 'utf8')).domains.length;

test('4/5) quota exhaustion mid-sweep produces a clean QUOTA_EXHAUSTED-coded error and explicit skipped_due_quota accounting for every un-attempted batch', async () => {
  process.env.HERMES_SWEEP_DOMAIN_BATCH = '1';
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-sweep-quota-'));

  let call = 0;
  const fetchImpl = async (url) => {
    if (!String(url).includes('api.groq.com')) return { ok: true, status: 200, text: async () => 'evidence '.repeat(30) };
    call += 1;
    // First domain succeeds; second domain's Groq call throws a quota-
    // exhausted error, simulating what createResilientFetch would throw.
    if (call === 1) return okResponse({ findings: [] });
    const error = new Error('GROQ_TPD_EXHAUSTED model=groq/compound-mini used=99999/100000 requested=500 retry_ms=1200');
    error.code = 'HERMES_QUOTA_EXHAUSTED';
    throw error;
  };

  const summary = await runIndustrySweep({ apiKey: 'test-key', fetchImpl, outputDir });
  delete process.env.HERMES_SWEEP_DOMAIN_BATCH;

  assert.equal(summary.batches, REAL_DOMAIN_COUNT, 'every domain must be accounted for in the batch total, including never-attempted ones');
  assert.equal(summary.quota_exhausted, true);
  assert.match(summary.quota_exhausted_reason, /GROQ_TPD_EXHAUSTED/);
  // Domain 1 succeeded; domain 2 threw the fatal error; every domain after
  // that was never attempted at all because of it.
  const expectedSkipped = REAL_DOMAIN_COUNT - 1;
  assert.equal(summary.skipped_due_quota, expectedSkipped, '1 batch that itself threw + every remaining never-attempted batch');
  assert.equal(summary.skipped_domains.length, expectedSkipped);
  assert.equal(summary.failed_batches, 0, 'a quota-exhausted batch must never be double-counted as a generic failure');
});

test('4b) runReliableSweep reports operational_status=QUOTA_EXHAUSTED (not a generic thrown error) when zero batches succeeded', async () => {
  const { runReliableSweep } = await import('../../scripts/hermes/industry-sweep-reliable.mjs');
  process.env.HERMES_SWEEP_DOMAIN_BATCH = '1';

  const baseFetch = async () => tpdResponse({ used: 99999, limit: 100000 }); // fallback immediately exhausted too on first call
  let thrown;
  try {
    await runReliableSweep({ baseFetch, sleeper: noSleep });
  } catch (error) {
    thrown = error;
  } finally {
    delete process.env.HERMES_SWEEP_DOMAIN_BATCH;
  }

  assert.ok(thrown, 'must throw when zero batches succeeded');
  assert.equal(thrown.code, 'HERMES_QUOTA_EXHAUSTED');
  assert.equal(thrown.summary.operational_status, 'QUOTA_EXHAUSTED');
  assert.ok(thrown.summary.skipped_due_quota >= 1);
});
