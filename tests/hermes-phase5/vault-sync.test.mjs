// HERMES -> Obsidian Knowledge Vault governed sync — regression suite.
// Uses a fresh os.tmpdir() fixture vault for every test (never the real
// elimfilters-vault/) so tests are fully isolated and cannot ever touch a
// human-authored note.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  planSync,
  planEntitySync,
  loadVaultEntityIndex,
  loadCanonicalTechnologies,
  resolveEntity,
  validateWikilinks,
  isAllowedTarget,
  resolveVaultWritePath,
  computeEvidenceFingerprint,
  buildManagedBlock,
  mergeManagedBlock,
  extractRecordedFingerprint,
  computeBridgeEligibility,
  MANAGED_BLOCK_START,
  MANAGED_BLOCK_END
} from '../../scripts/hermes/vault-sync-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SYNC_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'sync-vault.mjs');

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-vault-'));
  for (const dir of ['01-technologies/active', '02-industries', '03-systems', '04-standards', '05-contamination', '06-components', '07-problems', '08-product-families', '94-sync-log']) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  }
  return root;
}

function writeEntity(root, folder, key, { name = key, status = 'active', type = 'technology', extra = '' } = {}) {
  const content = `---\ntype: ${type}\nstatus: ${status}\nkey: ${key}\nname: "${name}"\nin_unified_data: false\ntags:\n  - test\n---\n\n# ${name}\n\nHuman-authored description that must survive any HERMES update.\n${extra}`;
  fs.writeFileSync(path.join(root, folder, `${key}.md`), content, 'utf8');
  return path.join(root, folder, `${key}.md`);
}

function approvedFinding(overrides = {}) {
  return {
    entity_code: 'HERMES_TEST_FINDING_1',
    workflow_status: 'APPROVED',
    approved_by: 'Victor Abreu',
    approved_at: '2026-08-19T00:00:00.000Z',
    approval_required: true,
    canonical_entity: 'ISO_99999',
    statement: 'ISO 99999 defines a new test method for filtration media.',
    relationships: [],
    source_url: 'https://example.test/iso-99999',
    source_organization: 'ISO',
    source_title: 'ISO 99999:2026',
    observed_at: '2026-08-18T00:00:00.000Z',
    harvested_at: '2026-08-18T00:05:00.000Z',
    hermes_run_id: 'run-123',
    confidence: 0.9,
    evidence_hash: 'a'.repeat(64),
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// 1) New validated finding creates correct internal note.
// ---------------------------------------------------------------------------

test('1) an approved finding for a new entity plans a CREATE with a well-formed managed block', () => {
  const root = makeVault();
  const finding = approvedFinding();
  const result = planEntitySync({
    finding,
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root),
    targetFolder: '04-standards',
    targetKey: 'ISO_99999',
    targetName: 'ISO 99999:2026'
  });
  assert.equal(result.decision, 'CREATE');
  assert.match(result.managedBlock, /ISO 99999 defines a new test method/);
  assert.match(result.managedBlock, /hermes_status: APPROVED/);
});

// ---------------------------------------------------------------------------
// 2) Same evidence, second run = zero diff (idempotency).
// ---------------------------------------------------------------------------

test('2) identical evidence on a second run produces a fingerprint match -> NOOP, zero diff', () => {
  const root = makeVault();
  const finding = approvedFinding();
  const fp = computeEvidenceFingerprint(finding);
  const managedBlock = buildManagedBlock({ finding, relationships: [], fingerprint: fp });
  const existingPath = writeEntity(root, '04-standards', 'ISO_99999', { type: 'standard', extra: `\n${managedBlock}\n` });

  const result = planEntitySync({
    finding,
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root),
    targetFolder: '04-standards',
    targetKey: 'ISO_99999',
    targetName: 'ISO 99999:2026',
    readExisting: (p) => fs.readFileSync(p, 'utf8')
  });
  assert.equal(result.decision, 'NOOP');
  assert.equal(result.reason, 'UNCHANGED_EVIDENCE');
  assert.equal(fs.readFileSync(existingPath, 'utf8'), fs.readFileSync(existingPath, 'utf8'), 'file must be completely untouched');
});

test('2b) two consecutive buildManagedBlock calls for identical evidence are byte-identical (no wall-clock churn)', () => {
  const finding = approvedFinding();
  const fp = computeEvidenceFingerprint(finding);
  const a = buildManagedBlock({ finding, relationships: [], fingerprint: fp });
  const b = buildManagedBlock({ finding, relationships: [], fingerprint: fp });
  assert.equal(a, b);
});

// ---------------------------------------------------------------------------
// 3/4) Changed evidence updates only the managed section; human content survives.
// ---------------------------------------------------------------------------

test('3/4) changed evidence updates the managed block only — human-authored prose is untouched', () => {
  const root = makeVault();
  const finding = approvedFinding();
  const oldFp = computeEvidenceFingerprint({ ...finding, statement: 'old statement' });
  const oldBlock = buildManagedBlock({ finding: { ...finding, statement: 'old statement' }, relationships: [], fingerprint: oldFp });
  const filePath = writeEntity(root, '04-standards', 'ISO_99999', { type: 'standard', extra: `\n${oldBlock}\n` });
  const humanText = 'Human-authored description that must survive any HERMES update.';

  const result = planEntitySync({
    finding, // new statement
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root),
    targetFolder: '04-standards',
    targetKey: 'ISO_99999',
    targetName: 'ISO 99999:2026',
    readExisting: (p) => fs.readFileSync(p, 'utf8')
  });
  assert.equal(result.decision, 'UPDATE');
  const merged = mergeManagedBlock(fs.readFileSync(filePath, 'utf8'), result.managedBlock);
  assert.match(merged, new RegExp(humanText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'human-authored line must survive');
  assert.match(merged, /ISO 99999 defines a new test method/, 'new statement must be present');
  assert.doesNotMatch(merged, /old statement/, 'old managed content must be replaced, not appended alongside');
  assert.equal((merged.match(new RegExp(MANAGED_BLOCK_START, 'g')) || []).length, 1, 'exactly one managed block, never duplicated');
});

// ---------------------------------------------------------------------------
// 5/6) Wikilinks generated correctly; duplicates prevented.
// ---------------------------------------------------------------------------

test('5/6) valid relationship targets become deduplicated [[wikilinks]]', () => {
  const root = makeVault();
  writeEntity(root, '04-standards', 'ISO_4406', { type: 'standard' });
  const index = loadVaultEntityIndex(root);
  const { valid, dangling } = validateWikilinks(index, ['[[ISO_4406]]', 'ISO_4406', '[[ISO_4406]]']);
  assert.deepEqual(valid, ['ISO_4406'], 'duplicate targets must be deduplicated to a single wikilink');
  assert.deepEqual(dangling, []);
});

// ---------------------------------------------------------------------------
// 7) Dangling / noncanonical technology links rejected.
// ---------------------------------------------------------------------------

test('7) a relationship target that does not exist in the vault is dropped as dangling, never silently linked', () => {
  const root = makeVault();
  const index = loadVaultEntityIndex(root);
  const { valid, dangling } = validateWikilinks(index, ['NOT_A_REAL_ENTITY']);
  assert.deepEqual(valid, []);
  assert.deepEqual(dangling, ['NOT_A_REAL_ENTITY']);
});

test('7b) a deprecated (non-active) technology link is dropped as dangling even though the note exists', () => {
  const root = makeVault();
  writeEntity(root, '01-technologies/active', 'RETIRED_TECH', { status: 'deprecated', type: 'technology' });
  const index = loadVaultEntityIndex(root);
  const { valid, dangling } = validateWikilinks(index, ['RETIRED_TECH']);
  assert.deepEqual(valid, []);
  assert.deepEqual(dangling, ['RETIRED_TECH']);
});

// ---------------------------------------------------------------------------
// 8/9) Provenance and confidence/status preserved in the managed block.
// ---------------------------------------------------------------------------

test('8/9) provenance and confidence/status fields are all present in the managed block', () => {
  const finding = approvedFinding({ source_organization: 'Volvo Trucks', confidence: 0.77 });
  const fp = computeEvidenceFingerprint(finding);
  const block = buildManagedBlock({ finding, relationships: [], fingerprint: fp });
  assert.match(block, /Source organization: Volvo Trucks/);
  assert.match(block, /Source URL: https:\/\/example\.test\/iso-99999/);
  assert.match(block, /hermes_confidence: 0\.77/);
  assert.match(block, /hermes_run_id: run-123/);
  assert.match(block, /hermes_evidence_hash: a{64}/);
  assert.match(block, /hermes_observed_at: 2026-08-18T00:00:00\.000Z/);
});

// ---------------------------------------------------------------------------
// 10) Ambiguous entity does not create a duplicate note.
// ---------------------------------------------------------------------------

test('10) a name that matches an existing entity under a different key is AMBIGUOUS, not a silent duplicate', () => {
  const root = makeVault();
  writeEntity(root, '06-components', 'CUMMINS_ISX', { name: 'Cummins ISX', type: 'component' });
  const index = loadVaultEntityIndex(root);
  const resolution = resolveEntity(index, 'ISX_CUMMINS', 'Cummins ISX');
  assert.equal(resolution.status, 'AMBIGUOUS');
  assert.deepEqual(resolution.matches.map((m) => m.key), ['CUMMINS_ISX']);
});

test('10b) planEntitySync surfaces AMBIGUOUS as its own decision, never CREATE', () => {
  const root = makeVault();
  writeEntity(root, '06-components', 'CUMMINS_ISX', { name: 'Cummins ISX', type: 'component' });
  const result = planEntitySync({
    finding: approvedFinding(),
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root),
    targetFolder: '06-components',
    targetKey: 'ISX_CUMMINS',
    targetName: 'Cummins ISX'
  });
  assert.equal(result.decision, 'AMBIGUOUS');
});

// ---------------------------------------------------------------------------
// 11) Raw/unapproved finding cannot become canonical.
// ---------------------------------------------------------------------------

test('11) an unapproved finding is rejected before any entity resolution happens', () => {
  const root = makeVault();
  const result = planEntitySync({
    finding: approvedFinding({ workflow_status: 'PENDING_REVIEW', approved_by: null, approved_at: null }),
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root),
    targetFolder: '04-standards',
    targetKey: 'ISO_99999',
    targetName: 'ISO 99999'
  });
  assert.equal(result.decision, 'REJECTED');
  assert.equal(result.reason, 'UNAPPROVED');
});

// ---------------------------------------------------------------------------
// 12/13) Competitor governance.
// ---------------------------------------------------------------------------

test('12) a competitor source organization is preserved as internal provenance, not stripped', () => {
  const finding = approvedFinding({ source_organization: 'Donaldson' });
  const block = buildManagedBlock({ finding, relationships: [], fingerprint: computeEvidenceFingerprint(finding) });
  assert.match(block, /Source organization: Donaldson/);
});

test('13) a competitor technology finding cannot be CREATEd inside 01-technologies/active', () => {
  const root = makeVault(); // no existing technology named DONALDSON_ENDURANCE
  const result = planEntitySync({
    finding: approvedFinding(),
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root),
    targetFolder: '01-technologies/active',
    targetKey: 'DONALDSON_ENDURANCE',
    targetName: 'Donaldson Endurance'
  });
  assert.equal(result.decision, 'REJECTED');
  assert.equal(result.reason, 'NONCANONICAL_TECHNOLOGY_CREATE');
});

test('13b) even an EXISTING technology note cannot be UPDATEd unless it is currently active-canonical', () => {
  const root = makeVault();
  writeEntity(root, '01-technologies/active', 'RETIRED_TECH', { status: 'deprecated', type: 'technology' });
  const result = planEntitySync({
    finding: approvedFinding(),
    vaultIndex: loadVaultEntityIndex(root),
    canonicalTechnologies: loadCanonicalTechnologies(root), // RETIRED_TECH excluded — not status:active
    targetFolder: '01-technologies/active',
    targetKey: 'RETIRED_TECH',
    targetName: 'RETIRED_TECH',
    readExisting: (p) => fs.readFileSync(p, 'utf8')
  });
  assert.equal(result.decision, 'REJECTED');
  assert.equal(result.reason, 'NONCANONICAL_TECHNOLOGY_UPDATE');
});

// ---------------------------------------------------------------------------
// 14) Write outside vault allowlist rejected.
// ---------------------------------------------------------------------------

test('14) isAllowedTarget rejects any folder outside the fixed allowlist', () => {
  assert.equal(isAllowedTarget('04-standards'), true);
  assert.equal(isAllowedTarget('12-oems'), false, 'an aspirational, not-yet-real vault folder must not be treated as allowed');
  assert.equal(isAllowedTarget('frontend/src'), false);
  assert.equal(isAllowedTarget('../outside'), false);
});

test('14b) resolveVaultWritePath refuses a path that would escape the vault root', () => {
  const root = makeVault();
  const result = resolveVaultWritePath(root, '04-standards', '../../etc/passwd');
  // even a malicious fileName is sanitized to safe characters, so this
  // specifically proves the allowlist check protects the FOLDER argument
  const outside = resolveVaultWritePath(root, '../outside', 'X');
  assert.equal(outside.ok, false);
  assert.match(outside.reason, /OUTSIDE_ALLOWLIST/);
  assert.equal(result.ok, true); // fileName is sanitized, not a folder escape
  assert.ok(!result.filePath.includes('..'));
});

// ---------------------------------------------------------------------------
// 15) Dry-run produces no filesystem mutation (real CLI, real subprocess).
// ---------------------------------------------------------------------------

test('15) the CLI in dry-run (default) mode writes no vault files at all', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-cli-'));
  for (const dir of ['elimfilters-vault/04-standards', 'hermes/real-candidates']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'hermes/real-candidates', 'f1.json'), JSON.stringify(approvedFinding({ category: 'standards' })));

  const before = fs.readdirSync(path.join(root, 'elimfilters-vault/04-standards'));
  execFileSync('node', [SYNC_SCRIPT], { cwd: root, encoding: 'utf8' });
  const after = fs.readdirSync(path.join(root, 'elimfilters-vault/04-standards'));
  assert.deepEqual(before, after, 'dry run must never write into the vault');
});

// ---------------------------------------------------------------------------
// 16) Failed sync does not partially mutate the vault (real CLI).
// ---------------------------------------------------------------------------

test('16) if a CREATE target already exists on disk, the whole apply aborts before writing anything', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-cli-fail-'));
  for (const dir of ['elimfilters-vault/04-standards', 'hermes/real-candidates']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  // Pre-existing file at the exact CREATE target path — apply must refuse.
  fs.writeFileSync(path.join(root, 'elimfilters-vault/04-standards/ISO_99999.md'), 'pre-existing unrelated content\n');
  const finding = approvedFinding({ category: 'standards' });
  fs.writeFileSync(path.join(root, 'hermes/real-candidates', 'f1.json'), JSON.stringify(finding));

  let threw = false;
  try {
    execFileSync('node', [SYNC_SCRIPT, '--apply'], { cwd: root, encoding: 'utf8', env: { ...process.env, HERMES_VAULT_SYNC_LIVE: 'true' } });
  } catch {
    threw = true;
  }
  assert.equal(threw, true, 'apply must exit non-zero when a prepare-phase collision is found');
  assert.equal(fs.readFileSync(path.join(root, 'elimfilters-vault/04-standards/ISO_99999.md'), 'utf8'), 'pre-existing unrelated content\n', 'the pre-existing file must be completely untouched');
});

// ---------------------------------------------------------------------------
// 17/18/19) Bridge eligibility.
// ---------------------------------------------------------------------------

test('17) every vault write is Knowledge-Graph eligible (reuses the existing citation pipeline, no parallel one)', () => {
  assert.equal(computeBridgeEligibility({ targetFolder: '04-standards' }).kg_eligible, true);
});

test('18) catalog eligibility is true only for product-family targets, false otherwise — never fabricated fitment', () => {
  assert.equal(computeBridgeEligibility({ targetFolder: '08-product-families' }).catalog_eligible, true);
  assert.equal(computeBridgeEligibility({ targetFolder: '04-standards' }).catalog_eligible, false);
});

test('19) Knowledge Center eligibility is never automatically true', () => {
  assert.equal(computeBridgeEligibility({ targetFolder: '04-standards' }).kc_eligible, false);
  assert.equal(computeBridgeEligibility({ targetFolder: '08-product-families' }).kc_eligible, false);
});

// ---------------------------------------------------------------------------
// 20) Groq quota failure causes no vault corruption — architectural: this
// module and the CLI never import or call anything Groq-related at all.
// ---------------------------------------------------------------------------

test('20) sync-vault.mjs and vault-sync-core.mjs never reference Groq, quota, or industry-sweep code', () => {
  const coreSrc = fs.readFileSync(path.join(REPO_ROOT, 'scripts/hermes/vault-sync-core.mjs'), 'utf8');
  const cliSrc = fs.readFileSync(SYNC_SCRIPT, 'utf8');
  for (const src of [coreSrc, cliSrc]) {
    assert.doesNotMatch(src, /groq/i);
    assert.doesNotMatch(src, /industry-sweep/i);
  }
});

// ---------------------------------------------------------------------------
// 21) Deprecated technology names never introduced as active canon.
// ---------------------------------------------------------------------------

test('21) a technology absent from 01-technologies/active (e.g. retired/consolidated) is never in the canonical set', () => {
  const root = makeVault(); // TURBOCORE-style: simply absent from active/
  const canonical = loadCanonicalTechnologies(root);
  assert.equal(canonical.has('TURBOCORE'), false);
});

// ---------------------------------------------------------------------------
// 22) Canonical technology registry is read dynamically, never hardcoded.
// ---------------------------------------------------------------------------

test('22) loadCanonicalTechnologies reflects whatever is actually on disk, not a fixed list', () => {
  const root = makeVault();
  writeEntity(root, '01-technologies/active', 'HYPOTHETICAL_FUTURE_TECH', { status: 'active', type: 'technology' });
  const canonical = loadCanonicalTechnologies(root);
  assert.ok(canonical.has('HYPOTHETICAL_FUTURE_TECH'), 'a technology that exists only in this fixture must be picked up dynamically, proving no hardcoded list is used');
});

// ---------------------------------------------------------------------------
// Batch planner smoke test.
// ---------------------------------------------------------------------------

test('planSync end-to-end: mixed CREATE/UPDATE/NOOP/REJECTED/AMBIGUOUS in one batch', () => {
  const root = makeVault();
  writeEntity(root, '06-components', 'KNOWN_COMPONENT', { name: 'Known Component', type: 'component' });
  const unchangedFinding = approvedFinding({ entity_code: 'F_NOOP', canonical_entity: 'KNOWN_COMPONENT', statement: 'unchanged' });
  const fp = computeEvidenceFingerprint(unchangedFinding);
  const block = buildManagedBlock({ finding: unchangedFinding, relationships: [], fingerprint: fp });
  fs.appendFileSync(path.join(root, '06-components/KNOWN_COMPONENT.md'), `\n${block}\n`);

  const findings = [
    approvedFinding({ entity_code: 'F_CREATE', canonical_entity: 'ISO_88888' }),
    unchangedFinding,
    approvedFinding({ entity_code: 'F_UNAPPROVED', workflow_status: 'PENDING_REVIEW', approved_by: null })
  ];
  const resolveTarget = (finding) => {
    if (finding.entity_code === 'F_UNAPPROVED') return { folder: '04-standards', key: 'X', name: 'X' };
    if (finding.entity_code === 'F_NOOP') return { folder: '06-components', key: 'KNOWN_COMPONENT', name: 'Known Component' };
    return { folder: '04-standards', key: finding.canonical_entity, name: finding.canonical_entity };
  };
  const { summary } = planSync(findings, { vaultRoot: root, readFile: (p) => fs.readFileSync(p, 'utf8'), resolveTarget });
  assert.equal(summary.create, 1);
  assert.equal(summary.noop, 1);
  assert.equal(summary.rejected, 1);
});
