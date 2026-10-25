import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildIndustryDigest, renderIndustryDigest, headlineCandidates, headlineCode } from '../../scripts/hermes/industry-digest.mjs';
import { applyHeadlineDecision, parseAnswer, runHeadlineResearch } from '../../scripts/hermes/headline-research.mjs';

const require = createRequire(import.meta.url);
const now = new Date('2026-10-26T13:00:00Z');
const item = (k, extra = {}) => ({ source: 'Toyota / Lexus', published_at: '2026-10-22T10:00:00Z', headline: `Headline ${k}`, url: `https://news.example.com/${k}`, ...extra });

function stateWith(items, highlights = []) {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-headlines-'));
  fs.writeFileSync(path.join(state, 'newsroom-unreviewed.json'), JSON.stringify({ items }));
  fs.writeFileSync(path.join(state, 'newsroom-highlights.json'), JSON.stringify({ items: highlights }));
  return state;
}
const digestFor = (state) => buildIndustryDigest([], { now, sweepSummaryPath: path.join(state, 'none.json'), unreviewedPath: path.join(state, 'newsroom-unreviewed.json') });

test('headlines get stable codes and review rows; dashboard render puts actions on highlights and every annex line; email is a summary', () => {
  const state = stateWith([item(1), item(2)], [{ url: 'https://news.example.com/2', source: 'Toyota / Lexus', date: '2026-10-22', title_es: 'Motor nuevo', domain: 'oem_engines_equipment', why_es: 'Cobertura.' }]);
  const d = digestFor(state);
  assert.equal(d.highlights[0].code, headlineCode('https://news.example.com/2'));
  const rows = headlineCandidates(d);
  assert.deepEqual(rows.map((r) => [r.entity_code, r.kind, r.duty, r.approval_required, !!r.highlight]), [
    [headlineCode('https://news.example.com/2'), 'headline', 'LD', true, true],
    [headlineCode('https://news.example.com/1'), 'headline', 'LD', true, false]
  ]);
  const full = renderIndustryDigest(d, { headlineActionsFor: (code) => `[BTN ${code}]`, annexActionsFor: (code) => `[BTN ${code}]` });
  assert.ok(full.html.includes(`[BTN ${headlineCode('https://news.example.com/2')}]`)); // highlight
  assert.ok(full.html.includes(`Headline 1</a> [BTN ${headlineCode('https://news.example.com/1')}]`)); // every annex line
  const summary = renderIndustryDigest(d, { dashboardUrl: 'https://ps.example/hermes/weekly?x=1' });
  assert.match(summary.html, /ABRIR DASHBOARD/);
  assert.match(summary.html, /Motor nuevo/);
  assert.doesNotMatch(summary.html, /BTN|Headline 1/); // the email is a summary; decisions and the annex live on the dashboard
  assert.match(summary.text, /Abrir dashboard: https:\/\/ps\.example\/hermes\/weekly\?x=1/);
  assert.match(renderIndustryDigest(d).html, /Headline 1/); // without signed actions the annex stays inline
});

test('INVESTIGAR / DESCARTAR decisions are recorded and those headlines never come back as unread', () => {
  const state = stateWith([item(1), item(2), item(3)]);
  const row = (k, decision) => ({ candidate_code: headlineCode(`https://news.example.com/${k}`), decision, decided_at: '2026-10-23T09:00:00Z',
    candidate: { entity_code: headlineCode(`https://news.example.com/${k}`), kind: 'headline', url: `https://news.example.com/${k}`, headline: `Headline ${k}`, source: 'Toyota / Lexus', date: '2026-10-22', duty: 'LD' } });
  applyHeadlineDecision(row(1, 'reject'), { stateRoot: state });
  applyHeadlineDecision(row(2, 'research'), { stateRoot: state });
  assert.throws(() => applyHeadlineDecision(row(3, 'approve'), { stateRoot: state }), /unsupported/);
  assert.throws(() => applyHeadlineDecision({ ...row(3, 'reject'), candidate_code: 'HERMES_HEADLINE_OTHER' }, { stateRoot: state }), /mismatch/);
  const saved = JSON.parse(fs.readFileSync(path.join(state, 'headline-decisions.json'), 'utf8'));
  assert.equal(saved.research['https://news.example.com/2'].status, 'QUEUED');
  assert.deepEqual(digestFor(state).link_annex.flatMap((g) => g.items.map((i) => i.url)), ['https://news.example.com/3']);
});

test('parseAnswer accepts only a read article with every field and a non-Google-News source', () => {
  const ok = { leida: true, url_original: 'https://toyota.example/news/x', titulo_es: 'T', resumen_es: 'R', por_que_importa_es: 'P', hecho_publico_en: 'F', tecnico: true };
  assert.equal(parseAnswer(`texto ${JSON.stringify(ok)}`).url, 'https://toyota.example/news/x');
  assert.equal(parseAnswer(JSON.stringify({ ...ok, leida: false })), null);
  assert.equal(parseAnswer(JSON.stringify({ ...ok, url_original: 'https://news.google.com/rss/articles/x' })), null);
  assert.equal(parseAnswer(JSON.stringify({ ...ok, resumen_es: '' })), null);
  assert.equal(parseAnswer('no json'), null);
});

test('an investigated headline becomes a normal card in the week it was requested, with approval buttons', async () => {
  const state = stateWith([item(9, { published_at: '2026-10-10T10:00:00Z' })]);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-headline-out-'));
  fs.writeFileSync(path.join(state, 'headline-decisions.json'), JSON.stringify({ discarded: {}, research: { 'https://news.example.com/9': { code: 'X', headline: 'Toyota shows new hybrid engine', source: 'Toyota / Lexus', date: '2026-10-10', duty: 'LD', requested_at: '2026-10-21T09:00:00.000Z', status: 'QUEUED', attempts: 0 } } }));
  let prompt; let opts;
  const answer = { leida: true, url_original: 'https://toyota.example/news/hybrid', titulo_es: 'Toyota presenta motor híbrido', resumen_es: 'Toyota mostró un motor híbrido nuevo.', por_que_importa_es: 'Nuevo motor: cobertura de filtros por investigar.', hecho_publico_en: 'A maker showed a new hybrid engine.', tecnico: true };
  const res = await runHeadlineResearch({ stateRoot: state, outputDir: out, now, claude: async (p, o) => { prompt = p; opts = o; return { code: 0, out: JSON.stringify(answer) }; } });
  assert.equal(res.results[0].outcome, 'DONE');
  assert.match(prompt, /Toyota shows new hybrid engine/);
  assert.deepEqual(opts.toolArgs, ['--tools', 'WebSearch', 'WebFetch', '--allowedTools', 'WebSearch', 'WebFetch']);
  const [file] = fs.readdirSync(out);
  const candidate = JSON.parse(fs.readFileSync(path.join(out, file), 'utf8'));
  assert.equal(candidate.source_url, 'https://toyota.example/news/hybrid');
  assert.equal(candidate.research_resolution.requested_at, '2026-10-21T09:00:00.000Z');
  const d = buildIndustryDigest([candidate], { now, sweepSummaryPath: path.join(state, 'none.json'), unreviewedPath: path.join(state, 'newsroom-unreviewed.json') });
  assert.deepEqual(d.items.map((i) => [i.title, i.status, i.duty]), [['Toyota presenta motor híbrido', 'SEÑAL', 'LD']]); // published 10-10, requested in window
  assert.equal(d.review_candidates.length, 1);
  assert.equal(d.link_annex.length, 0); // no longer an unread link
  const again = await runHeadlineResearch({ stateRoot: state, outputDir: out, now, claude: async () => { throw new Error('must not run'); } });
  assert.equal(again.outcome, 'NOTHING_QUEUED');
});

test('weekly dashboard: one page, live buttons or decided badges, one-click decisions return to the item; view links cannot record', async () => {
  const express = require('express');
  const store = require('../../lib/hermes-review-store');
  const { signReviewPayload } = require('../../lib/hermes-review-token');
  const { installHermesReviewCenter } = require('../../lib/hermes-review-center');
  const recorded = [];
  const orig = { recordDecision: store.recordDecision, runStatuses: store.runStatuses, getCandidate: store.getCandidate };
  store.recordDecision = async (d) => { recorded.push(d); return d; };
  store.getCandidate = async (code) => (code === 'HERMES_WEEK_123'
    ? { entity_code: code, kind: 'weekly_dashboard', title: 'Dashboard semanal HERMES', period: '2026-10-19 — 2026-10-25', kpis: [{ value: 4, label: 'Noticias' }],
      body_html: '<h2>Noticia A</h2><!--HERMES_ACT:card:HERMES_REAL_SWEEP_A--><li>Titular B <!--HERMES_ACT:headline:HERMES_HEADLINE_BBB--></li><li>Titular C <!--HERMES_ACT:headline:HERMES_HEADLINE_CCC--></li><!--HERMES_ACT:card:HERMES_UNKNOWN-->' }
    : { headline: 'Engine news', source: 'Ford', date: '2026-10-22' });
  store.runStatuses = async () => [
    { candidate_code: 'HERMES_REAL_SWEEP_A', review_status: 'READY', decision: null },
    { candidate_code: 'HERMES_HEADLINE_BBB', review_status: 'READY', decision: null },
    { candidate_code: 'HERMES_HEADLINE_CCC', review_status: 'DECIDED', decision: 'reject' }
  ];
  process.env.HERMES_REVIEW_TOKEN_SECRET = 'test-secret';
  const app = express(); installHermesReviewCenter(app);
  const server = app.listen(0); const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const view = { candidate: 'HERMES_WEEK_123', decision: 'view', run_id: '123', exp };
    const q = (p) => new URLSearchParams({ ...p, exp: String(p.exp), sig: signReviewPayload(p, 'test-secret') });
    const res = await fetch(`${base}/hermes/weekly?${q(view)}`);
    const html = await res.text();
    assert.equal(res.status, 200);
    assert.match(html, /Elimfilters|elimfilters-logo/i);
    assert.match(html, /id="HERMES_REAL_SWEEP_A"[\s\S]*ACEPTAR[\s\S]*REVISAR[\s\S]*ELIMINAR/);
    assert.match(html, /<details class="why"><summary class="mini light">REVISAR<\/summary>[\s\S]*?required/); // REVISAR asks for the reason
    assert.match(html, /id="HERMES_HEADLINE_BBB" class="acts">[\s\S]*INVESTIGAR[\s\S]*DESCARTAR/);
    assert.match(html, /id="HERMES_HEADLINE_CCC" class="done">✓ DESCARTADO/);
    assert.doesNotMatch(html, /HERMES_ACT|HERMES_UNKNOWN/);
    assert.equal((await fetch(`${base}/hermes/weekly?${q({ ...view, candidate: 'HERMES_WEEK_999' })}`)).status, 403);

    const decide = { candidate: 'HERMES_HEADLINE_BBB', decision: 'research', run_id: '123', exp };
    const back = `/hermes/weekly?${q(view)}#HERMES_HEADLINE_BBB`;
    const post = await fetch(`${base}/hermes/review`, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ ...decide, exp: String(exp), sig: signReviewPayload(decide, 'test-secret'), back }) });
    assert.equal(post.status, 303);
    assert.equal(post.headers.get('location'), back);
    const evil = await fetch(`${base}/hermes/review`, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ ...decide, exp: String(exp), sig: signReviewPayload(decide, 'test-secret'), back: 'https://evil.example/' }) });
    assert.equal(evil.status, 202); // unsafe return targets are ignored
    assert.deepEqual(recorded.map((r) => [r.candidateCode, r.decision, r.reason]), [['HERMES_HEADLINE_BBB', 'research', null], ['HERMES_HEADLINE_BBB', 'research', null]]);

    const confirm = await (await fetch(`${base}/hermes/review?${q({ ...decide, decision: 'reject' })}`)).text();
    assert.match(confirm, /Engine news[\s\S]*DESCARTAR/);
    for (const bad of [view, { candidate: 'HERMES_WEEK_123', decision: 'approve', run_id: '123', exp }]) {
      const r = await fetch(`${base}/hermes/review`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ ...bad, exp: String(exp), sig: signReviewPayload(bad, 'test-secret') }) });
      assert.equal(r.status, 403);
    }
    assert.equal(recorded.length, 2);
  } finally {
    server.close(); Object.assign(store, orig); delete process.env.HERMES_REVIEW_TOKEN_SECRET;
  }
});
