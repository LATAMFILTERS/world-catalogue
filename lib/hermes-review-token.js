'use strict';

const crypto = require('crypto');

const ALLOWED_DECISIONS = new Set(['approve', 'reject', 'research']);

function normalizePayload(payload) {
  const candidate = String(payload.candidate || '').trim();
  const decision = String(payload.decision || '').trim().toLowerCase();
  const runId = String(payload.run_id || payload.runId || '').trim();
  const exp = Number(payload.exp || 0);
  if (!candidate) throw new Error('candidate is required');
  if (!ALLOWED_DECISIONS.has(decision)) throw new Error('invalid decision');
  if (!/^\d+$/.test(runId)) throw new Error('run_id is required');
  if (!Number.isFinite(exp) || exp <= 0) throw new Error('exp is required');
  return { candidate, decision, run_id: runId, exp };
}

function canonical(payload) {
  const p = normalizePayload(payload);
  return `${p.candidate}\n${p.decision}\n${p.run_id}\n${p.exp}`;
}

function signReviewPayload(payload, secret) {
  if (!secret) throw new Error('HERMES_REVIEW_TOKEN_SECRET is required');
  return crypto.createHmac('sha256', secret).update(canonical(payload)).digest('hex');
}

function verifyReviewPayload(payload, signature, secret, nowMs = Date.now()) {
  try {
    if (!signature || !secret) return false;
    const p = normalizePayload(payload);
    if (p.exp * 1000 < nowMs) return false;
    const expected = signReviewPayload(p, secret);
    const left = Buffer.from(expected, 'hex');
    const right = Buffer.from(String(signature), 'hex');
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function buildReviewUrl(baseUrl, payload, secret) {
  const p = normalizePayload(payload);
  const url = new URL(baseUrl);
  url.searchParams.set('candidate', p.candidate);
  url.searchParams.set('decision', p.decision);
  url.searchParams.set('run_id', p.run_id);
  url.searchParams.set('exp', String(p.exp));
  url.searchParams.set('sig', signReviewPayload(p, secret));
  return url.toString();
}

module.exports = { ALLOWED_DECISIONS, signReviewPayload, verifyReviewPayload, buildReviewUrl };
