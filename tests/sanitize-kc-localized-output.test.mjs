import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/sanitize-knowledge-center-public.mjs', import.meta.url));

test('KC sanitizer governs default, Spanish and Portuguese export paths without touching other sections', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'elim-kc-sanitize-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const output = path.join(temp, 'out');
  const paths = [
    'knowledge-center/index.html',
    'es/knowledge-center/index.html',
    'es/knowledge-center/engineering/airflow-engineering/index.html',
    'es/knowledge-center/engineering/airflow-engineering/__next._full.txt',
    'pt/knowledge-center/engineering/airflow-engineering/index.html',
    'pt/knowledge-center/engineering/airflow-engineering/__next._full.txt',
    'es/api/citation/engineering.json',
    'pt/api/citation/engineering.json',
  ];
  const prohibited = 'Donaldson #ff4444 #FF8C00 #44ff88 #Ff4444';
  for (const rel of paths) {
    const full = path.join(output, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, prohibited, 'utf8');
  }
  const unrelated = path.join(output, 'es/about/leadership/index.html');
  fs.mkdirSync(path.dirname(unrelated), { recursive: true });
  fs.writeFileSync(unrelated, prohibited, 'utf8');

  const run = spawnSync(process.execPath, [script], { cwd: temp, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  for (const rel of paths) {
    const outputText = fs.readFileSync(path.join(output, rel), 'utf8');
    assert.doesNotMatch(outputText, /\bDonaldson\b|#(?:ff4444|ff8c00|44ff88)/i, rel);
    assert.match(outputText, /external manufacturer/, rel);
  }
  assert.equal(fs.readFileSync(unrelated, 'utf8'), prohibited, 'Non-KC routes must not be altered');
});
