import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { processDecisions } from '../../scripts/hermes/apply-review-decisions-from-db.mjs';

const require = createRequire(import.meta.url);
const { submitIdentityResearch } = require('../../scripts/hermes/approved-intelligence-to-catalogue.js');

const candidate = (code, type) => ({
  entity_code: code, candidate_type: type, approval_required: true, workflow_status: 'PENDING_REVIEW',
  source_url: 'https://example.test/news', research_resolution: { status: 'VERIFIED', engine: 'GROQ', finding_title: 'New engine platform', evidence_url: 'https://example.test/news', technical_facts: ['Fact.'], relevance: 'Opens HD coverage work.', confidence: 0.8 }
});
const row = (c, decision, reason = null) => ({ candidate_code: c.entity_code, candidate: c, decision, decision_reason: reason, decided_by: 'Victor Abreu' });

test('ACEPTAR on an OEM finding opens OEM research; failed delivery leaves the decision for retry', async () => {
  const cwd = process.cwd();
  process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-apply-')));
  try {
    const oem = candidate('HERMES_REAL_SWEEP_OEM_ENGINES_EQUIPMENT_A1', 'oem_update');
    const std = candidate('HERMES_REAL_SWEEP_STANDARDS_TESTING_B2', 'standard_update');
    const marked = []; const researched = [];
    const ok = await processDecisions({
      fetch: async () => [row(oem, 'approve'), row(std, 'approve'), row(candidate('HERMES_REAL_X_C3', 'oem_update'), 'reject', 'no aplica')],
      mark: async (code) => marked.push(code),
      research: async (approved) => { researched.push(approved.entity_code); return { status: 'accepted' }; }
    });
    assert.deepEqual(ok.map((r) => r.outcome), ['APPLIED', 'APPLIED', 'APPLIED']);
    assert.deepEqual(researched, [oem.entity_code]); // standards finding: no OEM research
    assert.equal(marked.length, 3);
    const approved = JSON.parse(fs.readFileSync(`elimfilters-vault/92-approved-updates/${oem.entity_code}.json`, 'utf8'));
    assert.equal(approved.workflow_status, 'APPROVED');
    assert.equal(approved.approved_by, 'Victor Abreu');

    const retry = await processDecisions({
      fetch: async () => [row(oem, 'approve')],
      mark: async () => { throw new Error('must not mark'); },
      research: async () => ({ status: 'unavailable', error_code: 'hermes_requests_disabled' })
    });
    assert.equal(retry[0].outcome, 'RESEARCH_RETRY');
  } finally { process.chdir(cwd); }
});

test('approved news without exact make/model queues OEM identity research, never a guessed model', async () => {
  const stored = [];
  const out = await submitIdentityResearch({ ...candidate('HERMES_REAL_SWEEP_OEM_ENGINES_EQUIPMENT_D4', 'oem_update'), workflow_status: 'APPROVED' }, {
    upsert: async (gap) => { stored.push(gap); return { persisted: true, gap }; },
    send: async () => ({ status: 'accepted', hermes_research_id: 'R1' }),
    attach: async () => {}
  });
  assert.equal(out.status, 'accepted');
  assert.equal(stored[0].component, 'equipment_configuration_identification');
  assert.ok(!stored[0].equipment.model);
});
