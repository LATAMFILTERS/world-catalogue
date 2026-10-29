import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = new URL('./fix-static-html-lang.mjs', import.meta.url);
test('static export uses correct first-response lang without JavaScript', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'elim-aeo-lang-'));
  try {
    for (const prefix of ['es', 'pt']) {
      const dir = path.join(root, prefix, 'industries', 'mining');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'),
        '<!doctype html><html lang="en"><head></head><body><h1>OK</h1></body></html>');
    }
    for (let i = 0; i < 2; i++) {
      const result = spawnSync(process.execPath, [script.pathname, root], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const summary = JSON.parse(result.stdout.trim());
      assert.equal(summary.checked, 2);
      assert.equal(summary.changed, i === 0 ? 2 : 0);
    }
    for (const [prefix, expected] of [['es', 'es'], ['pt', 'pt-BR']]) {
      const html = fs.readFileSync(path.join(root, prefix, 'industries', 'mining', 'index.html'), 'utf8');
      assert.match(html, new RegExp('<html lang="' + expected + '"'));
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
