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
  assert.throws(() => validateWeeklyEmailContract(data), /needs_research=32.*31 detailed/);
});

test('rendered email contract blocks omitted pending candidates', async () => {
  const { validateRenderedWeeklyEmail } = await loadIntegrity();
  const data = pendingFixture(2);
  const message = {
    html: '<div>Requiere más investigación HERMES_PENDING_01 con información suficiente para superar la validación básica del cuerpo del correo y permitir verificar integridad.</div>',
    text: 'Requiere más investigación HERMES_PENDING_01 con información suficiente para superar la validación básica del cuerpo del correo y permitir verificar integridad.',
  };
  assert.throws(() => validateRenderedWeeklyEmail(data, message), /omitted detailed candidate HERMES_PENDING_02/);
});
