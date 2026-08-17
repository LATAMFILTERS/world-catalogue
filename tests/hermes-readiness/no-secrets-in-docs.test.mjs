// HERMES operational readiness — hygiene check: none of the operational
// documentation or config files this session added contain anything that
// looks like a real credential. This is a heuristic regression guard, not a
// full secret scanner.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

const FILES_TO_SCAN = [
  'hermes/PHASE5-LITE.md',
  'hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md',
  'hermes/OPERATIONAL-STATUS.md',
  'hermes/MICROSOFT-GRAPH-SETUP.md',
  'hermes/GITHUB-ACTIONS-ACTIVATION.md',
  'hermes/FIRST-RUN-RUNBOOK.md',
  'hermes/config/.env.example'
];

// Known real-credential shapes that must never appear in a committed file.
const CREDENTIAL_PATTERNS = [
  { name: 'GitHub personal access token', pattern: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { name: 'GitHub App/OAuth token', pattern: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: 'AWS access key id', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'generic bearer token assignment', pattern: /Bearer\s+[A-Za-z0-9\-_.]{20,}/ },
  { name: 'a GUID (tenant/client id shape) outside of prose describing where to find one', pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i }
];

for (const relativePath of FILES_TO_SCAN) {
  test(`${relativePath} contains no real-looking credential`, () => {
    const filePath = path.join(REPO_ROOT, relativePath);
    assert.ok(fs.existsSync(filePath), `${relativePath} should exist`);
    const text = fs.readFileSync(filePath, 'utf8');
    for (const { name, pattern } of CREDENTIAL_PATTERNS) {
      assert.doesNotMatch(text, pattern, `${relativePath} appears to contain a ${name}`);
    }
  });
}

test('hermes/config/.env.example only contains placeholder-shaped values (no assigned real secret)', () => {
  const text = fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'config', '.env.example'), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, key, value] = match;
    const looksPlaceholder =
      value === '' ||
      /^(true|false)$/i.test(value) ||
      /^\d+$/.test(value) ||
      /your-.*-here/i.test(value) ||
      /pending/i.test(value) ||
      /^hermes\/config\//.test(value) ||
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
    assert.ok(looksPlaceholder, `${key} in .env.example does not look like a safe placeholder: "${value}"`);
  }
});

test('operational docs never hardcode or guess the HERMES sender mailbox', () => {
  const checklist = fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'OPERATIONAL-ACTIVATION-CHECKLIST.md'), 'utf8');
  assert.match(checklist, /sending mailbox must be a confirmed corporate ELIMFILTERS account/i);
  assert.match(checklist, /supplied through `HERMES_SENDER_EMAIL`/);
  assert.match(checklist, /repository does not record\s+or guess its address/i);

  const setup = fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'MICROSOFT-GRAPH-SETUP.md'), 'utf8');
  assert.match(setup, /No sender address is assumed anywhere in HERMES documentation or code/i);
  assert.match(setup, /HERMES_SENDER_EMAIL/);
});
