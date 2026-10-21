function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function groupCandidates(groups) {
  if (!groups || typeof groups !== 'object' || Array.isArray(groups)) return [];
  return Object.values(groups).flatMap((value) => asArray(value));
}

function finiteCount(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function validateWeeklyEmailContract(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('HERMES_EMAIL_INTEGRITY: structured weekly report is missing or invalid.');
  }

  const totals = data.totals || {};
  const reviewCandidates = groupCandidates(data.groups);
  const pending = asArray(data.research_pending);
  const duplicates = asArray(data.duplicates);
  const invalid = asArray(data.invalid);

  const expectedReview = finiteCount(totals.review_ready, reviewCandidates.length);
  const expectedPending = finiteCount(totals.needs_research, pending.length);
  const scanned = finiteCount(totals.scanned, reviewCandidates.length + pending.length + duplicates.length + invalid.length);

  if (expectedReview !== reviewCandidates.length) {
    throw new Error(`HERMES_EMAIL_INTEGRITY: review_ready=${expectedReview} but groups contain ${reviewCandidates.length} detailed candidate(s).`);
  }
  if (expectedPending !== pending.length) {
    throw new Error(`HERMES_EMAIL_INTEGRITY: needs_research=${expectedPending} but research_pending contains ${pending.length} queued candidate(s).`);
  }
  if (scanned > 0 && reviewCandidates.length + pending.length + duplicates.length + invalid.length === 0) {
    throw new Error(`HERMES_EMAIL_INTEGRITY: scanned=${scanned} but no detailed queues are present.`);
  }

  for (const item of reviewCandidates) {
    if (!String(item?.entity_code || '').trim()) {
      throw new Error('HERMES_EMAIL_INTEGRITY: review candidate missing entity_code.');
    }
  }
  for (const item of pending) {
    if (!String(item?.entity_code || '').trim()) {
      throw new Error('HERMES_EMAIL_INTEGRITY: research_pending candidate missing entity_code.');
    }
  }

  return {
    scanned,
    review_ready: reviewCandidates.length,
    needs_research: pending.length,
    duplicates: duplicates.length,
    invalid: invalid.length,
  };
}

export function validateRenderedWeeklyEmail(data, message) {
  const counts = validateWeeklyEmailContract(data);
  const html = String(message?.html || '');
  const text = String(message?.text || '');
  const visible = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  if (counts.review_ready < 1) {
    throw new Error('HERMES_EMAIL_INTEGRITY: review email cannot be rendered when review_ready=0.');
  }
  if (visible.length < 120 || text.trim().length < 80) {
    throw new Error('HERMES_EMAIL_INTEGRITY: rendered email body is too small.');
  }

  const reviewCandidates = groupCandidates(data.groups);
  for (const item of reviewCandidates) {
    const code = String(item.entity_code || '').trim();
    if (!html.includes(code) || !text.includes(code)) {
      throw new Error(`HERMES_EMAIL_INTEGRITY: rendered email omitted review-ready candidate ${code}.`);
    }
  }

  // Pending research is an internal queue and must never leak into the review email.
  for (const item of asArray(data.research_pending)) {
    const code = String(item.entity_code || '').trim();
    if (code && (html.includes(code) || text.includes(code))) {
      throw new Error(`HERMES_EMAIL_INTEGRITY: review email leaked internal pending candidate ${code}.`);
    }
  }

  return counts;
}

// SENT/SMTP acceptance/Graph 202 and legacy marker files are not delivery receipts.
// A receipt must identify this cycle, recipient and message, and its evidence source.
export function interpretWeeklyDelivery(record, cycle) {
  const evidence = record?.delivery_evidence;
  const confirmed = Boolean(cycle && record?.cycle === cycle
    && record?.delivery_status === 'DELIVERED'
    && (record.outcome == null || record.outcome === 'SENT')
    && (record.recipient == null || record.recipient === evidence?.recipient)
    && (record.message_id == null || record.message_id === evidence?.message_id)
    && evidence?.cycle === cycle
    && ['provider_delivery_receipt', 'recipient_confirmation', 'recipient_mailbox_observation'].includes(evidence?.source)
    && [evidence?.provider, evidence?.recipient, evidence?.message_id, evidence?.reference]
      .every(value => typeof value === 'string' && value.trim().length > 0)
    && typeof evidence?.delivered_at === 'string' && Number.isFinite(Date.parse(evidence.delivered_at)));
  const notReceived = Boolean(cycle && record?.cycle === cycle && evidence?.cycle === cycle
    && record?.delivery_status === 'NOT_RECEIVED' && evidence?.source === 'recipient_confirmation'
    && (record.recipient == null || record.recipient === evidence.recipient)
    && [evidence?.recipient, evidence?.reference].every(value => typeof value === 'string' && value.trim())
    && typeof evidence?.confirmed_at === 'string' && Number.isFinite(Date.parse(evidence.confirmed_at)));
  return {
    confirmed,
    status: confirmed ? 'DELIVERED' : notReceived ? 'NOT_RECEIVED' : record?.outcome === 'SENT' ? 'SUBMITTED' : 'UNCONFIRMED',
    reason: confirmed ? 'DELIVERY_EVIDENCE_PRESENT' : notReceived ? 'RECIPIENT_CONFIRMED_NOT_RECEIVED' : 'DELIVERY_EVIDENCE_MISSING_OR_INVALID'
  };
}
