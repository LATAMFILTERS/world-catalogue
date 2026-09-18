import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const BUILDER = path.join(ROOT, 'product-identity/scripts/build-branding-approval-record.mjs');
const VALIDATOR = path.join(ROOT, 'product-identity/scripts/validate-branding-approval-record.mjs');
const SHA = '4d1085f113a54289268f7e88aaddfec2a16e11a6e467ba95d86efab162b802be';
const AUDIT = 'a'.repeat(64);

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    encoding: 'utf8'
  });
}

test('Branding builds and validates a routine policy-compliant approval record', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'branding-release-'));
  const out = path.join(dir, 'approval-record.json');
  try {
    const built = run(BUILDER, [
      '--sku=EF96776',
      `--sha256=${SHA}`,
      `--audit-bundle-sha256=${AUDIT}`,
      '--approved-on=2026-09-18T18:40:00Z',
      `--out=${out}`
    ]);
    assert.equal(built.status, 0, built.stderr);

    const record = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(record.release_authority, 'branding');
    assert.equal(record.responsible_subagent, 'branding');
    assert.equal(record.approval_method, 'POLICY_COMPLIANT_AUTONOMOUS');
    assert.equal(record.unresolved_findings, 0);
    assert.equal(record.exception_count, 0);

    const validated = run(VALIDATOR, [`--record=${out}`, `--image-sha=${SHA}`]);
    assert.equal(validated.status, 0, validated.stderr);
    assert.equal(JSON.parse(validated.stdout).ok, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test('R2 release validator rejects a Branding record with one unresolved finding', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'branding-release-'));
  const out = path.join(dir, 'approval-record.json');

  try {
    const built = run(BUILDER, [
      '--sku=EF96776',
      `--sha256=${SHA}`,
      `--audit-bundle-sha256=${AUDIT}`,
      '--approved-on=2026-09-18T18:40:00Z',
      `--out=${out}`
    ]);
    assert.equal(built.status, 0, built.stderr);

    const record = JSON.parse(readFileSync(out, 'utf8'));
    record.unresolved_findings = 1;
    writeFileSync(out, JSON.stringify(record, null, 2));

    const validated = run(VALIDATOR, [`--record=${out}`, `--image-sha=${SHA}`]);
    assert.equal(validated.status, 2);
    assert.ok(JSON.parse(validated.stdout).failures.includes('UNRESOLVED_FINDINGS_NONZERO'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test('ET9 routine approval requires mechanical-face proof', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'branding-release-'));
  const out = path.join(dir, 'approval-record.json');

  try {
    const built = run(BUILDER, [
      '--sku=ET90001',
      `--sha256=${SHA}`,
      `--audit-bundle-sha256=${AUDIT}`,
      '--approved-on=2026-09-18T18:40:00Z',
      `--out=${out}`
    ]);
    assert.notEqual(built.status, 0);
    assert.match(built.stderr, /ET9_MECHANICAL_REFERENCE_SHA256_REQUIRED/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the already approved EF96776 legacy record remains valid under the transition rule', () => {
  const record = 'product-identity/approved-masters/EF96776/approval-record.json';
  const validated = run(VALIDATOR, [`--record=${record}`, `--image-sha=${SHA}`]);
  assert.equal(validated.status, 0, validated.stderr);
  assert.equal(JSON.parse(validated.stdout).approval_method, 'LEGACY_EXPLICIT_USER_APPROVAL');
});
