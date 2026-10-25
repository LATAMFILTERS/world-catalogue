import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pickHighlights, runAnnexHighlights, annexItems } from '../../scripts/hermes/annex-highlights.mjs';
import { buildIndustryDigest, renderIndustryDigest } from '../../scripts/hermes/industry-digest.mjs';

const now = new Date('2026-10-26T13:00:00Z');
const item = (k, extra = {}) => ({ source: `Maker ${k}`, published_at: '2026-10-22T10:00:00Z', headline: `Headline ${k}`, url: `https://news.example.com/${k}`, ...extra });
const answer = (list) => `Aquí va:\n${JSON.stringify({ destacados: list })}`;
const pick = (n, extra = {}) => ({ n, titulo_es: `Titular ${n}`, dominio: 'oem_engines_equipment', por_que_importa_es: `Importa ${n}`, ...extra });

test('pickHighlights keeps only valid list numbers, no duplicates, max 8, known domains', () => {
  const items = Array.from({ length: 12 }, (_, k) => item(k + 1));
  const out = pickHighlights(items, answer([pick(2), pick(2), pick(99), pick('x'), pick(3, { titulo_es: '' }), pick(4, { dominio: 'invented' }), ...[5, 6, 7, 8, 9, 10, 11, 12].map((n) => pick(n))]));
  assert.equal(out.length, 8);
  assert.deepEqual(out.slice(0, 2).map((h) => [h.url, h.domain]), [['https://news.example.com/2', 'oem_engines_equipment'], ['https://news.example.com/4', 'industry_markets']]);
  assert.deepEqual(pickHighlights(items, 'no json'), []);
  assert.deepEqual(pickHighlights(items, '{"destacados": "nope"}'), []);
});

test('annexItems uses the last 7 days, https only, one per URL', () => {
  const list = annexItems({ items: [item(1), item(1), item(2, { url: 'javascript:alert(1)' }), item(3, { published_at: '2026-10-01T00:00:00Z' })] }, now);
  assert.deepEqual(list.map((i) => i.url), ['https://news.example.com/1']);
});

test('runAnnexHighlights gives the child only numbered titles and Read, writes picks, clears stale picks on failure', async () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-highlights-'));
  fs.writeFileSync(path.join(state, 'newsroom-unreviewed.json'), JSON.stringify({ items: [item(1), item(2)] }));
  let call;
  const ok = await runAnnexHighlights({ stateRoot: state, now, claude: async (prompt, opts) => { call = opts; return { code: 0, out: answer([pick(2)]) }; } });
  assert.deepEqual(ok, { outcome: 'OK', reviewed: 2, highlights: 1 });
  assert.deepEqual(call.toolArgs, ['--tools', 'Read', '--allowedTools', 'Read(./**)']);
  const input = fs.readFileSync(path.join(call.cwd, 'input.json'), 'utf8');
  assert.match(input, /Headline 2/);
  assert.doesNotMatch(input, /https:/); // links never reach the model
  const saved = JSON.parse(fs.readFileSync(path.join(state, 'newsroom-highlights.json'), 'utf8'));
  assert.equal(saved.items[0].url, 'https://news.example.com/2');

  const failed = await runAnnexHighlights({ stateRoot: state, now, claude: async () => ({ code: null, out: '', err: 'TIMEOUT' }) });
  assert.equal(failed.outcome, 'CLAUDE_FAILED');
  assert.equal(fs.existsSync(path.join(state, 'newsroom-highlights.json')), false);
});

test('digest shows highlights above the annex, removes them from it, ignores picks not in this week\'s annex, no buttons', () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-highlights-digest-'));
  const unreviewedPath = path.join(state, 'newsroom-unreviewed.json');
  fs.writeFileSync(unreviewedPath, JSON.stringify({ items: [item(1), item(2)] }));
  fs.writeFileSync(path.join(state, 'newsroom-highlights.json'), JSON.stringify({ items: [
    { url: 'https://news.example.com/2', source: 'Maker 2', date: '2026-10-22', title_es: 'Motor nuevo', domain: 'oem_engines_equipment', why_es: 'Cobertura por investigar.' },
    { url: 'https://news.example.com/old', source: 'X', date: '2026-10-01', title_es: 'Viejo', domain: 'x', why_es: 'x' }
  ] }));
  const d = buildIndustryDigest([], { now, sweepSummaryPath: path.join(state, 'none.json'), unreviewedPath });
  assert.deepEqual(d.highlights.map((h) => [h.title, h.domain]), [['Motor nuevo', 'Motores y equipos OEM']]);
  assert.deepEqual(d.link_annex.flatMap((g) => g.items.map((i) => i.url)), ['https://news.example.com/1']);
  const r = renderIndustryDigest(d, { actionsFor: () => 'ACEPTAR' });
  assert.ok(r.text.indexOf('DESTACADOS DEL ANEXO') < r.text.indexOf('ANEXO: ENLACES SIN REVISAR'));
  assert.match(r.html, /SEÑAL · solo titular[\s\S]*Motor nuevo/);
  assert.doesNotMatch(r.html, /ACEPTAR|Viejo/);
});
