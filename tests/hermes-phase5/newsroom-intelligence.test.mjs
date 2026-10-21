import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractDatedHeadlines, groundedSummary, findArticleLink, runNewsroomIntelligence } from '../../scripts/hermes/newsroom-intelligence.mjs';
import { validateCandidate, isResearchResolved } from '../../scripts/hermes/hermes-core.mjs';

const now = new Date('2026-10-21T12:00:00Z');

test('dated newsroom headlines: last 7 days only, cut at the next date, deduplicated', () => {
  const text = '20 Oct 2026 · Press release Wärtsilä engines selected for two additional inland waterway tugs in Brazil 19 Oct 2026 · Press release Wärtsilä expands its role in Brazilian power plant projects 01 Sep 2026 Old news item that is long enough';
  const h = extractDatedHeadlines(text, { now });
  assert.deepEqual(h.map((x) => x.headline), ['Wärtsilä engines selected for two additional inland waterway tugs in Brazil', 'Wärtsilä expands its role in Brazilian power plant projects']);
  assert.equal(h[0].published_at.slice(0, 10), '2026-10-20');
});

test('summaries that add numbers not in the source are rejected', () => {
  const ok = { titulo_es: 'Motores para remolcadores', resumen_es: 'Se seleccionaron motores para dos remolcadores.', por_que_importa: 'Plataforma marina con cobertura de filtros por investigar.', public_safe_fact: 'Marine engines were selected for river tugs.' };
  assert.equal(groundedSummary('engines selected for 2 tugs', ok), true);
  assert.equal(groundedSummary('engines selected for tugs', { ...ok, resumen_es: 'Se seleccionaron 40 motores de 1500 kW.' }), false);
  assert.equal(groundedSummary('x', { ...ok, titulo_es: '' }), false);
});

test('article link is taken from the matching anchor, else the newsroom page', () => {
  const html = '<a href="/news/tugs-brazil">Wärtsilä engines selected for two additional inland waterway tugs in Brazil</a>';
  assert.equal(findArticleLink(html, 'Wärtsilä engines selected for two additional inland waterway tugs in Brazil', 'https://www.wartsila.com/media'), 'https://www.wartsila.com/news/tugs-brazil');
  assert.equal(findArticleLink('<a href="/x">Other</a>', 'Wärtsilä engines selected for tugs in Brazil today', 'https://www.wartsila.com/media'), 'https://www.wartsila.com/media');
});

test('feed + page run: prefilter, local LLM judgement, valid approvable candidates, no repeats', async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-newsroom-'));
  const rss = `<rss><channel>
    <item><title>New 13-liter diesel engine platform launched for heavy trucks</title><link>https://press.example.com/engine</link><pubDate>Mon, 20 Oct 2026 10:00:00 GMT</pubDate><description>The platform targets 2027 emissions rules.</description></item>
    <item><title>Company appoints new chief marketing officer for Europe</title><link>https://press.example.com/cmo</link><pubDate>Mon, 20 Oct 2026 10:00:00 GMT</pubDate></item>
    <item><title>Diesel quarterly earnings beat expectations again</title><link>https://press.example.com/q3</link><pubDate>Mon, 20 Oct 2026 10:00:00 GMT</pubDate></item>
  </channel></rss>`;
  const fetchImpl = async () => new Response(rss, { status: 200, headers: { 'content-type': 'application/rss+xml' } });
  const summarize = async (item) => (/earnings/.test(item.headline) ? { relevante: false } : {
    relevante: true, tecnico: false, titulo_es: 'Nueva plataforma de motor diésel de 13 litros', resumen_es: 'Se lanzó una plataforma de motor diésel de 13 litros para camiones pesados.',
    por_que_importa: 'Abre cobertura de filtros de aire, aceite y combustible por investigar.', public_safe_fact: 'A new 13-liter diesel engine platform was launched for heavy trucks.'
  });
  const triage = async (items) => new Set(items.map((_, i) => i)); // keep all; summary step judges earnings
  const llm = { triage, summarize };
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-newsroom-state-'));
  const sources = [{ id: 'trade', name: 'Trade Press', domain: 'oem_engines_equipment', url: 'https://press.example.com/feed', feed: true }];
  const r = await runNewsroomIntelligence({ outputDir: out, stateRoot, sources, now, fetchImpl, llm });
  assert.equal(r.prefiltered_out, 1); // CMO appointment never reaches the model
  assert.equal(r.irrelevant, 1);
  assert.equal(r.created, 1);
  const c = JSON.parse(fs.readFileSync(path.join(out, fs.readdirSync(out)[0]), 'utf8'));
  assert.deepEqual(validateCandidate(c), []);
  assert.equal(isResearchResolved(c), true);
  assert.equal(c.evidence_level, 'SECONDARY_VERIFIED');
  assert.equal(c.category, 'industry_sweep:oem_engines_equipment');
  assert.equal(c.research_resolution.engine, 'LOCAL_LLM');
  const again = await runNewsroomIntelligence({ outputDir: out, stateRoot, sources, now, fetchImpl, llm });
  assert.equal(again.existing, 2); // created item + the headline already judged irrelevant
  assert.equal(again.created, 0);
});
