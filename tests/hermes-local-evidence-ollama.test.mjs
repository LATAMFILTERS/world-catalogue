import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {interpretLocalEvidence} from '../scripts/hermes/local-evidence-ollama.mjs';

test('local interpreter refuses missing evidence directory', async () => {
  await assert.rejects(interpretLocalEvidence({sku:'EL12345'}, {}, {directory:''}), /LOCAL_EVIDENCE_DIRECTORY_REQUIRED|ENOENT/);
});

test('local interpreter fails closed on invalid source hash', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'hermes-local-'));
  try {
    await writeFile(path.join(dir,'EL12345.json'), JSON.stringify({
      sku:'EL12345',sources:[{url:'https://www.mann-filter.com/example',content:'Sample official document content',sha256:'0'.repeat(64)}]
    }));
    await assert.rejects(
      interpretLocalEvidence({sku:'EL12345'}, {}, {directory:dir,allowedHosts:'mann-filter.com'}),
      /INVALID_EVIDENCE_SOURCE/
    );
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('local interpreter fails closed on unofficial host', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'hermes-local-'));
  const content='Sample evidence, not official';
  try {
    await writeFile(path.join(dir,'EL12345.json'), JSON.stringify({
      sku:'EL12345',sources:[{url:'https://untrusted.example/item',content,sha256:crypto.createHash('sha256').update(content).digest('hex')}]
    }));
    await assert.rejects(
      interpretLocalEvidence({sku:'EL12345'}, {}, {directory:dir,allowedHosts:'mann-filter.com'}),
      /INVALID_EVIDENCE_SOURCE/
    );
  } finally {await rm(dir,{recursive:true,force:true});}
});
