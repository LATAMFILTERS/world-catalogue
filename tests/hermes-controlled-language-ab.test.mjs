import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {boundedExcerpt} from '../scripts/hermes/local-evidence-ollama.mjs';

const script = new URL('../scripts/hermes/controlled-language-ab.mjs', import.meta.url).pathname;
const baselineCommit = 'db8b8ea9905b50782dfd8d5b915c6ad5e939523d';
const haveBaseline = spawnSync('git', ['cat-file', '-e', baselineCommit + '^{commit}']).status === 0;

// Many generic lines match the English keyword filter and consume the 1150-char prompt budget
// before the product row, which carries the target code.
const boilerplate = Array.from({length: 40}, () => 'Les applications sont fournies pour votre commodite.').join(' ');
const row = 'P780006 #P780006 FILTRE A AIR, PRIMAIRE ARRONDI.';

async function bundleDir(sku, url, content) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ab-test-'));
  const sha256 = crypto.createHash('sha256').update(content).digest('hex');
  await writeFile(path.join(dir, sku + '.json'), JSON.stringify({sku, sources: [{url, content, sha256}]}));
  return dir;
}
function run(dir, ...args) {
  const r = spawnSync('node', [script, dir, ...args], {encoding: 'utf8', env: {...process.env, HERMES_OFFICIAL_SOURCE_HOSTS: 'donaldson.com'}});
  return {status: r.status, stderr: r.stderr, lines: r.stdout.split('\n').filter(Boolean).map(l => JSON.parse(l))};
}

test('excerpt selection depends on the target code', () => {
  const text = boilerplate + ' ' + row;
  assert.equal(boundedExcerpt(text, '').includes('P780006'), false);
  assert.equal(boundedExcerpt(text, 'P780006').includes('P780006'), true);
});

test('A/B blocks a SKU whose prompt excerpt would not contain the inferred code', {skip: !haveBaseline}, async () => {
  const dir = await bundleDir('EA10006', 'https://shop.donaldson.com/store/search?Ntt=P780006', boilerplate + ' ' + row);
  try {
    const r = run(dir, 'EA10006');
    assert.equal(r.status, 1);
    assert.equal(r.lines.length, 1);
    assert.deepEqual(
      {error: r.lines[0].error, code: r.lines[0].source_candidate_code, assessment: r.lines[0].assessment},
      {error: 'CODE_NOT_IN_PROMPT_EXCERPT', code: 'P780006', assessment: 'BLOCKED'});
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('explicit SKU=CODE overrides inference', {skip: !haveBaseline}, async () => {
  const dir = await bundleDir('EA10006', 'https://shop.donaldson.com/store/search', boilerplate + ' ' + row);
  try {
    const r = run(dir, 'EA10006=P780006');
    assert.equal(r.lines[0].error, 'CODE_NOT_IN_PROMPT_EXCERPT');
    assert.equal(r.lines[0].source_candidate_code, 'P780006');
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('A/B blocks when no target code can be determined', {skip: !haveBaseline}, async () => {
  const dir = await bundleDir('EA10006', 'https://shop.donaldson.com/store/search', row);
  try {
    const r = run(dir, 'EA10006');
    assert.equal(r.status, 1);
    assert.equal(r.lines[0].error, 'SOURCE_CANDIDATE_CODE_UNRESOLVED');
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('A/B still records a missing bundle as BLOCKED', {skip: !haveBaseline}, async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ab-test-'));
  try {
    const r = run(dir, 'EA10006');
    assert.equal(r.status, 1);
    assert.equal(r.lines.length, 4);
    assert.ok(r.lines.every(l => l.assessment === 'BLOCKED' && l.error === 'ENOENT'));
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('A/B rejects malformed SKU=CODE arguments', {skip: !haveBaseline}, async () => {
  const r = spawnSync('node', [script, os.tmpdir(), 'EA10006=P1;rm'], {encoding: 'utf8', env: {...process.env, HERMES_OFFICIAL_SOURCE_HOSTS: 'donaldson.com'}});
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Usage/);
});
