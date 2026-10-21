const test = require('node:test');
const assert = require('node:assert/strict');

async function loadIntegrity() {
  return import('../scripts/hermes/weekly-email-integrity.mjs');
}

function pendingFixture(count = 32) {
  return {
    totals: { scanned: count, review_ready: 0, needs_research: count },
    groups: {},
    research_pending: Array.from({ length: count }, (_, i) => ({
      entity_code: `HERMES_PENDING_${String(i + 1).padStart(2, '0')}`,
      source_publisher: 'TEST SOURCE',
      source_url: `https://example.test/${i + 1}`,
      reason: 'RESEARCH_NOT_RESOLVED',
    })),
    duplicates: [],
    invalid: [],
  };
}

test('weekly email contract accepts 32 pending candidates when all 32 are detailed', async () => {
  const { validateWeeklyEmailContract } = await loadIntegrity();
  const result = validateWeeklyEmailContract(pendingFixture(32));
  assert.equal(result.needs_research, 32);
  assert.equal(result.review_ready, 0);
});

test('weekly email contract blocks summary/detail mismatch', async () => {
  const { validateWeeklyEmailContract } = await loadIntegrity();
  const data = pendingFixture(32);
  data.research_pending.pop();
  const assertMismatch = actual => assert.throws(() => validateWeeklyEmailContract(data), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /^HERMES_EMAIL_INTEGRITY: needs_research=32\b/);
    assert.match(error.message, new RegExp(`research_pending contains ${actual}\\b`));
    return true;
  });
  assertMismatch(31);
  data.research_pending.push({ entity_code: 'HERMES_EXTRA_01' }, { entity_code: 'HERMES_EXTRA_02' });
  assertMismatch(33);
});

test('rendered review contract rejects empty queues, omitted review findings and leaked pending candidates', async () => {
  const { validateRenderedWeeklyEmail } = await loadIntegrity();
  const data = pendingFixture(2);
  const body = 'Hallazgos de revisión con fuente documentada, hechos técnicos, relevancia y acción propuesta para evaluación humana. Este cuerpo tiene el contenido suficiente para comprobar la integridad de la presentación.';
  const message = {
    html: `<div>${body} HERMES_REVIEW_01 HERMES_REVIEW_02</div>`,
    text: `${body} HERMES_REVIEW_01 HERMES_REVIEW_02`,
  };
  assert.throws(() => validateRenderedWeeklyEmail(data, message), /review email cannot be rendered when review_ready=0/);

  data.totals.scanned = 4;
  data.totals.review_ready = 2;
  data.groups = { technical_bulletin: [{ entity_code: 'HERMES_REVIEW_01' }, { entity_code: 'HERMES_REVIEW_02' }] };
  assert.equal(validateRenderedWeeklyEmail(data, message).review_ready, 2);
  for (const channel of ['html', 'text']) {
    const omitted = { ...message, [channel]: message[channel].replace('HERMES_REVIEW_02', '') };
    assert.throws(() => validateRenderedWeeklyEmail(data, omitted), /omitted review-ready candidate HERMES_REVIEW_02/);
    const leaked = { ...message, [channel]: `${message[channel]} HERMES_PENDING_01` };
    assert.throws(() => validateRenderedWeeklyEmail(data, leaked), /leaked internal pending candidate HERMES_PENDING_01/);
  }
});
