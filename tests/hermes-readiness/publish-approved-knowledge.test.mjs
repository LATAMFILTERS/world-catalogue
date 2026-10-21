import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeEligibility, buildCanonicalNote, isNovel, onlyAllowedPaths } from '../../scripts/hermes/publish-approved-knowledge.mjs';

const approved = (rr = {}, extra = {}) => ({
  entity_code: 'HERMES_REAL_SWEEP_FILTER_MEDIA_MATERIALS_AB12', category: 'industry_sweep:filter_media_materials',
  workflow_status: 'APPROVED', approved_by: 'Victor Abreu', approved_at: '2026-10-27T10:00:00Z',
  research_resolution: { status: 'VERIFIED', knowledge_action: 'CREATE_NEW', destination: 'KNOWLEDGE_CENTER',
    finding_title: 'New nanofiber layer for heavy-duty air media', public_safe_fact: 'Nanofiber surface layers are being adopted to raise initial efficiency of heavy-duty air media.', ...rr },
  ...extra
});

test('only approved, verified, NEW knowledge with a neutral public fact is publishable', () => {
  assert.equal(knowledgeEligibility(approved()), null);
  assert.equal(knowledgeEligibility(approved({}, { workflow_status: 'PENDING_REVIEW' })), 'NOT_APPROVED');
  assert.equal(knowledgeEligibility(approved({ knowledge_action: 'UPDATE_REINFORCE' })), 'NOT_NEW_KNOWLEDGE');
  assert.equal(knowledgeEligibility(approved({ destination: 'INTERNAL_ONLY' })), 'INTERNAL_ONLY');
  assert.equal(knowledgeEligibility(approved({ public_safe_fact: 'Donaldson launched a new nanofiber media line.' })), 'NO_PUBLIC_SAFE_FACT');
  assert.equal(knowledgeEligibility(approved({ public_safe_fact: 'Atmus and Ahlstrom expanded synthetic media output.' })), 'NO_PUBLIC_SAFE_FACT');
  assert.equal(knowledgeEligibility(approved({ public_safe_fact: 'See https://example.com for details on media.' })), 'NO_PUBLIC_SAFE_FACT');
});

test('canonical note is public-safe: no URL, competitor, FRAM or evidence id; competitor titles fall back to the fact', () => {
  const note = buildCanonicalNote(approved({ finding_title: 'Donaldson unveils nanofiber media', technical_facts: ['Donaldson reports 99.9% efficiency at https://x'] }), new Date('2026-10-27T12:00:00Z'));
  assert.match(note.id, /^INTEL-[0-9A-F]{12}$/);
  assert.equal(note.relPath, `elimfilters-vault/13-canonical-knowledge/shared-engineering/industry-intelligence/${note.id}.md`);
  assert.ok(!/donaldson|https?:\/\/|\bFRAM\b|EVID-|99\.9/i.test(note.text));
  assert.match(note.text, /^title: "Nanofiber surface layers/m);
  assert.match(note.text, /status: approved\npublication_status: approved|publication_status: approved/);
  const industrial = buildCanonicalNote(approved({}, { category: 'industry_sweep:industrial_water_treatment' }));
  assert.match(industrial.relPath, /industrial-process\/industry-intelligence/);
  assert.match(industrial.text, /domain: "INDUSTRIAL_PROCESS_KNOWLEDGE_DOMAIN"/);
});

test('duplicates of the validated canonical base are not republished', () => {
  const note = buildCanonicalNote(approved());
  assert.equal(isNovel(note, { available: true, matches: [{ id: 'SHARED-X', title: note.title, validated_fact: note.fact }] }), false);
  assert.equal(isNovel(note, { available: true, matches: [] }), true);
  assert.equal(isNovel(note, { available: false, matches: [] }), false); // fail closed
});

test('auto-merge guard only accepts canonical notes and the canonical index', () => {
  assert.equal(onlyAllowedPaths(['elimfilters-vault/13-canonical-knowledge/shared-engineering/industry-intelligence/INTEL-0123456789AB.md', 'frontend/src/generated/canonical-knowledge.json']), true);
  assert.equal(onlyAllowedPaths(['frontend/src/app/page.tsx']), false);
  assert.equal(onlyAllowedPaths([]), false);
});
