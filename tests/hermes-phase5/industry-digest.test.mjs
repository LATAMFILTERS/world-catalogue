import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildIndustryDigest, renderIndustryDigest } from '../../scripts/hermes/industry-digest.mjs';

const now = new Date('2026-10-26T14:17:00Z'); // Monday run -> window 2026-10-19..2026-10-25
const noSummary = path.join(os.tmpdir(), 'hermes-digest-no-summary.json');

function sweep({ code, published, level = 'PRIMARY', es = true, url = 'https://example.com/news' }) {
  return {
    entity_type: 'intelligence_candidate', entity_code: `HERMES_REAL_SWEEP_OEM_ENGINES_EQUIPMENT_${code}`,
    workflow_status: 'PENDING_REVIEW', candidate_type: 'oem_update', source_type: 'groq_compound_web_search',
    source_url: url, source_publisher: 'Example OEM', source_title: 'New engine platform', published_at: published,
    captured_at: '2026-10-26T14:30:00.000Z', confidence: 0.8, evidence_level: level, claim_scope: 'SOURCE_REPORTED',
    affected_entities: ['ENGINE'], proposed_action: 'Review engine platform coverage.', proposed_target_folder: '12-oems',
    deduplication_key: `industry-sweep-${code}`, approval_required: true, sync_status: 'NOT_READY', source_hash: 'a'.repeat(64),
    category: 'industry_sweep:oem_engines_equipment',
    research_resolution: {
      status: 'VERIFIED', finding_title: `Engine platform ${code}`, evidence_url: url, technical_facts: ['Fact EN.'],
      relevance: 'Relevance EN.', public_safe_fact: 'Public fact EN.',
      ...(es ? { resumen_es: 'Resumen en español.', por_que_importa_es: 'Importa por cobertura.' } : {})
    }
  };
}

test('digest keeps only the 7 full UTC days before the run and labels evidence', () => {
  const d = buildIndustryDigest([
    sweep({ code: 'IN1', published: '2026-10-19T00:00:00Z' }),
    sweep({ code: 'IN2', published: '2026-10-25T23:59:00Z', level: 'SECONDARY_VERIFIED' }),
    sweep({ code: 'OLD', published: '2026-10-18T23:59:00Z' }),
    sweep({ code: 'TODAY', published: '2026-10-26T01:00:00Z' }),
    sweep({ code: 'NODATE', published: null }),
    { ...sweep({ code: 'CAT', published: '2026-10-20' }), category: 'catalogue' }
  ], { now, sweepSummaryPath: noSummary });
  assert.deepEqual(d.window, { start: '2026-10-19', end: '2026-10-25' });
  assert.deepEqual(d.items.map((i) => [i.title, i.status]), [['Engine platform IN1', 'VERIFICADO'], ['Engine platform IN2', 'SEÑAL']]);
  assert.deepEqual(d.excluded, { no_published_date: 1, outside_window: 2, invalid: 0 });
  assert.equal(d.items[0].domain, 'Motores y equipos OEM');
});

test('render uses Spanish fields, marks English fallback and never emits unsafe links', () => {
  const d = buildIndustryDigest([
    sweep({ code: 'ES', published: '2026-10-20' }),
    sweep({ code: 'EN', published: '2026-10-21', es: false, url: 'https://example.com/en' })
  ], { now, sweepSummaryPath: noSummary });
  d.items.push({ ...d.items[0], url: 'javascript:alert(1)' });
  const r = renderIndustryDigest(d);
  assert.match(r.html, /Resumen:<\/strong> Resumen en español\./);
  assert.match(r.html, /Resumen \(EN\):<\/strong> Public fact EN\. Fact EN\./);
  assert.ok(!r.html.includes('href="javascript:'));
  assert.match(r.text, /\[VERIFICADO\] Engine platform EN/);
});

test('empty week says so explicitly with the sweep reason', () => {
  const summaryPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-digest-')), 'last-run.json');
  fs.writeFileSync(summaryPath, JSON.stringify({ total_work: 76, work_remaining: 70, quota_exhausted_reason: 'TPD exhausted' }));
  const r = renderIndustryDigest(buildIndustryDigest([], { now, sweepSummaryPath: summaryPath }));
  assert.match(r.text, /Sin novedades de industria esta semana\. Barrido de industria: 6 de 76 lotes completados \(TPD exhausted\)\./);
  assert.match(renderIndustryDigest(buildIndustryDigest([], { now, sweepSummaryPath: noSummary })).html, /no se ejecutó/);
});

test('zero-cost source-change signals appear as SEÑAL, once per URL, without first harvests', () => {
  const signal = (code, url, extra = {}) => ({
    ...sweep({ code, published: null, url }), category: 'oem_heavy_duty', entity_code: `HERMES_REAL_VOLVO_${code}`,
    workflow_status: 'NEEDS_RESEARCH', confidence: 0.4, source_publisher: 'Volvo Trucks', source_title: 'News &amp; insights &#8211; Volvo',
    captured_at: '2026-10-26T14:00:00.000Z', change_classification: 'CHANGE_DETECTED_REQUIRES_RESEARCH', research_resolution: { status: 'UNRESOLVED' }, ...extra
  });
  const d = buildIndustryDigest([
    signal('A', 'https://www.volvotrucks.com/news'),
    signal('B', 'https://www.volvotrucks.com/news'),
    signal('C', 'https://example.com/first', { change_classification: 'FIRST_SEMANTIC_HARVEST' }),
    signal('D', 'https://example.com/old', { captured_at: '2026-10-10T00:00:00.000Z' })
  ], { now, sweepSummaryPath: noSummary });
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].status, 'SEÑAL');
  assert.equal(d.items[0].title, 'Novedad en Volvo Trucks: News & insights – Volvo');
  assert.equal(d.items[0].domain, 'OEM pesados');
  assert.match(renderIndustryDigest(d).html, /News &amp; insights – Volvo/);
});

test('headlines the local model had no time for are listed as links grouped by source, also on an empty week', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-annex-')), 'newsroom-unreviewed.json');
  fs.writeFileSync(file, JSON.stringify({ items: [
    { source: 'Toyota / Lexus', published_at: '2026-10-22T10:00:00Z', headline: 'Toyota shows new hybrid engine', url: 'https://news.example.com/a' },
    { source: 'Toyota / Lexus', published_at: '2026-10-22T10:00:00Z', headline: 'Duplicate link', url: 'https://news.example.com/a' },
    { source: 'Ford', published_at: '2026-10-24T10:00:00Z', headline: 'Ford &amp; partners update V8', url: 'https://news.example.com/b' },
    { source: 'Ford', published_at: '2026-10-01T10:00:00Z', headline: 'Old item outside the window', url: 'https://news.example.com/c' },
    { source: 'Ford', published_at: '2026-10-24T10:00:00Z', headline: 'Unsafe link', url: 'javascript:alert(1)' }
  ] }));
  const digest = buildIndustryDigest([], { now, sweepSummaryPath: noSummary, unreviewedPath: file });
  assert.deepEqual(digest.link_annex.map((g) => [g.source, g.items.length]), [['Toyota / Lexus', 1], ['Ford', 1]]);
  const out = renderIndustryDigest(digest);
  assert.match(out.text, /Sin novedades de industria/);
  assert.match(out.text, /ANEXO: ENLACES SIN REVISAR\n2 titulares/);
  assert.match(out.html, /<a href="https:\/\/news\.example\.com\/b">Ford &amp; partners update V8<\/a>/);
  assert.doesNotMatch(out.html, /javascript:|Old item/);
  assert.equal(buildIndustryDigest([], { now, sweepSummaryPath: noSummary, unreviewedPath: file + '.missing' }).link_annex.length, 0);
});
