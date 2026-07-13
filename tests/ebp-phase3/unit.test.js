'use strict';

// EBP Phase 3 — unit tests for pure functions (no DB, no network).
// Run: node --test tests/ebp-phase3/unit.test.js

const test = require('node:test');
const assert = require('node:assert/strict');

const codes = require('../../ebp/phase3/codes');
const factoryAuth = require('../../ebp/phase3/factory-auth');
const validation = require('../../ebp/phase3/validation');
const dto = require('../../ebp/phase3/dto');
const csrf = require('../../ebp/phase3/csrf');

// ── Batch/Offer code generation ─────────────────────────────────────────────

test('batch codes match MRB-XXXXXX with the ambiguity-free alphabet', async () => {
  const code = await codes.generateUniqueBatchCode(async () => false);
  assert.match(code, codes.BATCH_CODE_FORMAT);
  assert.doesNotMatch(code, /[01OI]/);
});

test('offer codes match OFR-XXXXXX', async () => {
  const code = await codes.generateUniqueOfferCode(async () => false);
  assert.match(code, codes.OFFER_CODE_FORMAT);
});

test('generateUniqueBatchCode retries on collision', async () => {
  let calls = 0;
  const code = await codes.generateUniqueBatchCode(async () => {
    calls += 1;
    return calls <= 2;
  });
  assert.match(code, codes.BATCH_CODE_FORMAT);
  assert.ok(calls >= 3);
});

// ── Factory auth primitives (ADR-0023) ──────────────────────────────────────

test('hashPassword/verifyPassword: correct password verifies, wrong password does not', async () => {
  const hash = await factoryAuth.hashPassword('correct horse battery staple');
  assert.match(hash, /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
  assert.equal(await factoryAuth.verifyPassword('correct horse battery staple', hash), true);
  assert.equal(await factoryAuth.verifyPassword('wrong password', hash), false);
});

test('verifyPassword rejects a malformed stored hash without throwing', async () => {
  assert.equal(await factoryAuth.verifyPassword('anything', 'not-a-valid-hash'), false);
  assert.equal(await factoryAuth.verifyPassword('anything', null), false);
});

test('generateOpaqueToken: raw token is never equal to its own hash, and hash is deterministic', () => {
  const { raw, hash } = factoryAuth.generateOpaqueToken();
  assert.notEqual(raw, hash);
  assert.equal(factoryAuth.hashToken(raw), hash);
});

test('two generated tokens are never equal (cryptographically random)', () => {
  const a = factoryAuth.generateOpaqueToken();
  const b = factoryAuth.generateOpaqueToken();
  assert.notEqual(a.raw, b.raw);
});

// ── CSRF synchronizer token (ADR-0033) ──────────────────────────────────────

test('generateCsrfToken: 64 hex characters (32 random bytes), two calls never equal', () => {
  const a = csrf.generateCsrfToken();
  const b = csrf.generateCsrfToken();
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.match(b, /^[0-9a-f]{64}$/);
  assert.notEqual(a, b);
});

test('csrfTokensMatch: identical tokens match, a single differing character does not', () => {
  const token = csrf.generateCsrfToken();
  assert.equal(csrf.csrfTokensMatch(token, token), true);
  const flipped = `0${token.slice(1)}` === token ? `1${token.slice(1)}` : `0${token.slice(1)}`;
  assert.equal(csrf.csrfTokensMatch(token, flipped), false);
});

test('csrfTokensMatch: never throws on missing, non-string, or length-mismatched input', () => {
  const token = csrf.generateCsrfToken();
  assert.equal(csrf.csrfTokensMatch(token, undefined), false);
  assert.equal(csrf.csrfTokensMatch(undefined, token), false);
  assert.equal(csrf.csrfTokensMatch(token, ''), false);
  assert.equal(csrf.csrfTokensMatch(token, 'short'), false);
  assert.equal(csrf.csrfTokensMatch(token, 123), false);
  assert.equal(csrf.csrfTokensMatch(null, null), false);
});

// ── Batch status state machine ──────────────────────────────────────────────

test('validateBatchTransition accepts DRAFT -> SENT', () => {
  assert.deepEqual(validation.validateBatchTransition('DRAFT', 'SENT'), []);
});

test('validateBatchTransition rejects DRAFT -> CLOSED (must pass through SENT)', () => {
  const errors = validation.validateBatchTransition('DRAFT', 'CLOSED');
  assert.ok(errors.length > 0);
});

test('validateBatchTransition rejects any transition out of CLOSED/CANCELLED (terminal)', () => {
  assert.ok(validation.validateBatchTransition('CLOSED', 'SENT').length > 0);
  assert.ok(validation.validateBatchTransition('CANCELLED', 'SENT').length > 0);
});

test('validateBatchTransition allows OVERDUE -> RESPONDED (late but complete)', () => {
  assert.deepEqual(validation.validateBatchTransition('OVERDUE', 'RESPONDED'), []);
});

// ── Offer status state machine (Phase-3-writable subset only, ADR-0026) ────

test('validateOfferTransition accepts DRAFT -> SUBMITTED', () => {
  assert.deepEqual(validation.validateOfferTransition('DRAFT', 'SUBMITTED'), []);
});

test('validateOfferTransition rejects Phase 3 writing UNDER_REVIEW (Phase 4 only)', () => {
  const errors = validation.validateOfferTransition('SUBMITTED', 'UNDER_REVIEW');
  assert.ok(errors.length > 0);
  assert.match(errors[0], /not-Phase-3-writable|Phase 4/);
});

test('validateOfferTransition rejects Phase 3 writing APPROVED', () => {
  const errors = validation.validateOfferTransition('VALIDATED', 'APPROVED');
  assert.ok(errors.length > 0);
});

test('validateOfferTransition allows DRAFT -> WITHDRAWN and SUBMITTED -> WITHDRAWN', () => {
  assert.deepEqual(validation.validateOfferTransition('DRAFT', 'WITHDRAWN'), []);
  assert.deepEqual(validation.validateOfferTransition('SUBMITTED', 'WITHDRAWN'), []);
});

// ── Payload validators ──────────────────────────────────────────────────────

test('validateBatchPayload requires manufacturer_id, purpose, channel, timezone', () => {
  const errors = validation.validateBatchPayload({});
  assert.ok(errors.includes('manufacturer_id is required'));
  assert.ok(errors.some((e) => e.startsWith('purpose must be')));
  assert.ok(errors.some((e) => e.startsWith('channel must be')));
  assert.ok(errors.includes('timezone is required'));
});

test('validateOfferPayload: fob_price must be a decimal STRING, never a number literal (ADR-0026)', () => {
  const errorsNumber = validation.validateOfferPayload({ fob_price: 12.5, currency: 'USD' });
  assert.ok(errorsNumber.some((e) => e.includes('decimal string')));
  const errorsString = validation.validateOfferPayload({ fob_price: '12.50', currency: 'USD' });
  assert.deepEqual(errorsString, []);
});

test('validateOfferPayload rejects a zero or negative fob_price', () => {
  const errors = validation.validateOfferPayload({ fob_price: '0', currency: 'USD' });
  assert.ok(errors.some((e) => e.includes('greater than 0')));
});

test('validateOfferPayload rejects a non-3-letter currency', () => {
  const errors = validation.validateOfferPayload({ fob_price: '1.00', currency: 'US' });
  assert.ok(errors.some((e) => e.startsWith('currency must be')));
});

test('validateTechnicalFieldPayload requires offered_value only when ANSWERED', () => {
  const answeredMissing = validation.validateTechnicalFieldPayload({ field_name: 'x', completeness_status: 'ANSWERED' });
  assert.ok(answeredMissing.some((e) => e.includes('offered_value is required')));
  const cannotMeet = validation.validateTechnicalFieldPayload({ field_name: 'x', completeness_status: 'CANNOT_MEET' });
  assert.deepEqual(cannotMeet, []);
});

test('validateDocumentUpload enforces the MIME allow-list and 25MB ceiling', () => {
  const badMime = validation.validateDocumentUpload({ mimeType: 'application/x-msdownload', sizeBytes: 100 });
  assert.ok(badMime.some((e) => e.includes('not in the allowed list')));
  const tooBig = validation.validateDocumentUpload({ mimeType: 'application/pdf', sizeBytes: 26214401 });
  assert.ok(tooBig.length > 0);
  const ok = validation.validateDocumentUpload({ mimeType: 'application/pdf', sizeBytes: 1000 });
  assert.deepEqual(ok, []);
});

test('validateFactoryUserPayload requires a valid email, full_name, and known role', () => {
  const errors = validation.validateFactoryUserPayload({ email: 'not-an-email', role: 'SUPERUSER' });
  assert.ok(errors.some((e) => e.startsWith('email must be')));
  assert.ok(errors.some((e) => e.startsWith('role must be')));
  assert.ok(errors.includes('full_name is required'));
});

test('validatePasswordStrength rejects short passwords', () => {
  assert.ok(validation.validatePasswordStrength('short').length > 0);
  assert.deepEqual(validation.validatePasswordStrength('a-strong-enough-password'), []);
});

// ── DTOs (never leak password_hash/token_hash/storage_key) ─────────────────

test('toFactoryUserDTO never includes password_hash or password_algo', () => {
  const result = dto.toFactoryUserDTO({
    id: 'u1',
    manufacturer_id: 'm1',
    email: 'a@b.com',
    full_name: 'A B',
    role: 'MANUFACTURER_ADMIN',
    status: 'ACTIVE',
    password_hash: 'scrypt$deadbeef$deadbeef',
    password_algo: 'SCRYPT',
  });
  assert.equal('password_hash' in result, false);
  assert.equal('password_algo' in result, false);
});

test('toDocumentDTO never includes storage_key (ADR-0027)', () => {
  const result = dto.toDocumentDTO({
    id: 'd1',
    manufacturer_id: 'm1',
    category: 'TECHNICAL_EVIDENCE',
    original_filename: 'spec.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1000,
    sha256_hash: 'abc',
    storage_key: 'm1/d1',
    review_status: 'UNREVIEWED',
  });
  assert.equal('storage_key' in result, false);
});

test('toFactoryBatchDTO strips internal_notes/created_by/identity_mechanism', () => {
  const result = dto.toFactoryBatchDTO({
    id: 'b1',
    batch_code: 'MRB-ABCDEF',
    manufacturer_id: 'm1',
    purpose: 'COMMERCIAL_QUOTATION',
    channel: 'PORTAL',
    status: 'DRAFT',
    internal_notes: 'do not disclose',
    created_by: 'admin-key-session',
    identity_mechanism: 'ADMIN_KEY_SHARED',
  });
  assert.equal('internal_notes' in result, false);
  assert.equal('created_by' in result, false);
  assert.equal('identity_mechanism' in result, false);
  assert.equal(result.batch_code, 'MRB-ABCDEF');
});

test('toInternalBatchDTO handles a null row without throwing', () => {
  assert.equal(dto.toInternalBatchDTO(null), null);
});

// Note: the Excel staging store (ebp/phase3/staging.js) is Postgres-backed
// as of ADR-0030 (correction round, 2026-07-13) — it is no longer a pure
// function testable without a database. Its behavior (single-use consume,
// tenant/batch scoping, survives a fresh connection) is covered in
// regression.test.js instead, against a real Postgres instance.
