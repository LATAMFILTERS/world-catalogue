// HERMES — weekly industry-intelligence digest.
//
// Informational only: built from industry-sweep candidates (category
// `industry_sweep:*`) plus zero-cost source-change signals (official pages
// whose content changed; no LLM). Never staged for review, never written to
// catalogue, Knowledge Center, Obsidian or PostgreSQL. Sweep findings use the
// 7 full UTC days before the run date, so consecutive weekly runs never repeat
// an item and never skip a day — no sent-ledger needed.
import fs from 'node:fs';
import path from 'node:path';
import { validateCandidate } from './hermes-core.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

export const DOMAIN_LABELS_ES = {
  oem_engines_equipment: 'Motores y equipos OEM',
  aftermarket_filtration: 'Filtración aftermarket',
  filter_manufacturing: 'Fabricación de filtros',
  filter_media_materials: 'Media filtrante y materiales',
  air_filtration: 'Filtración de aire',
  industrial_air_filtration: 'Aire industrial',
  fuel_filtration: 'Combustibles',
  lubrication_oil: 'Lubricación y aceites',
  hydraulics_fluids: 'Hidráulica y fluidos',
  cooling_thermal: 'Refrigeración',
  ev_new_powertrains: 'EV / H2 y nuevos trenes motrices',
  solids_fluids_science: 'Ciencia de partículas y fluidos',
  standards_testing: 'Normas y ensayos',
  environment_regulation: 'Emisiones y regulación',
  reliability_maintenance: 'Confiabilidad y mantenimiento',
  industry_markets: 'Mercado de filtración',
  industrial_gas_conditioning: 'Acondicionamiento de gases',
  industrial_fluid_conditioning: 'Acondicionamiento de fluidos industriales',
  industrial_water_treatment: 'Tratamiento de agua'
};

export const CATEGORY_LABELS_ES = {
  oem_light_duty: 'OEM livianos', oem_heavy_duty: 'OEM pesados', oem_construction: 'OEM construcción',
  oem_agriculture: 'OEM agrícola', oem_power_generation: 'Generación de energía', oem_marine: 'Marino',
  oem_bus_coach: 'Buses', oem_railway: 'Ferroviario', oem_mining: 'Minería', oem_waste_municipal: 'Municipal',
  filtration_competitor: 'Filtración', filtration_manufacturers: 'Filtración', filtration_components: 'Componentes de filtración',
  filter_media: 'Media filtrante', standards: 'Normas', regulation: 'Regulación y emisiones',
  technical_publication: 'Publicación técnica', technical_publications: 'Publicación técnica',
  strategic_supplier: 'Proveedores', suppliers: 'Proveedores'
};

export const isIndustrySweepCandidate = (c) => String(c?.category || '').startsWith('industry_sweep:');
const isSourceChangeSignal = (c) => c?.change_classification === 'CHANGE_DETECTED_REQUIRES_RESEARCH';
const decodeEntities = (s) => String(s ?? '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');

function readSweepSummary(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function emptyReason(summary) {
  if (!summary) return 'El barrido de industria no se ejecutó o no dejó resumen en esta corrida.';
  const total = Number(summary.total_work) || 0;
  const done = Math.max(0, total - (Number(summary.work_remaining) || 0));
  const cause = summary.quota_exhausted_reason || summary.failures?.[0]?.error || summary.resume_reason || summary.error || null;
  return `Barrido de industria: ${done} de ${total} lotes completados${cause ? ` (${cause})` : ''}.`;
}

export function buildIndustryDigest(candidates, { now = new Date(), sweepSummaryPath = path.resolve('hermes/industry-sweep/last-run.json') } = {}) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end.getTime() - 7 * DAY_MS);
  const items = []; const reviewCandidates = [];
  let noDate = 0; let outOfWindow = 0; let invalid = 0;
  for (const c of candidates.filter(isIndustrySweepCandidate)) {
    if (validateCandidate(c).length) { invalid += 1; continue; }
    const published = Date.parse(c.published_at || '');
    if (Number.isNaN(published)) { noDate += 1; continue; }
    if (published < start.getTime() || published >= end.getTime()) { outOfWindow += 1; continue; }
    const rr = c.research_resolution || {};
    const domainId = c.category.slice('industry_sweep:'.length);
    items.push({
      entity_code: c.entity_code,
      status: c.evidence_level === 'PRIMARY' ? 'VERIFICADO' : 'SEÑAL',
      title: rr.titulo_es || rr.finding_title || c.source_title || c.entity_code,
      company: c.source_publisher,
      date: new Date(published).toISOString().slice(0, 10),
      domain: DOMAIN_LABELS_ES[domainId] || domainId,
      summary: rr.resumen_es || [rr.public_safe_fact, ...(rr.technical_facts || [])].filter(Boolean).join(' '),
      summary_lang: rr.resumen_es ? 'es' : 'en',
      why: rr.por_que_importa_es || rr.relevance || '',
      why_lang: rr.por_que_importa_es ? 'es' : 'en',
      url: rr.evidence_url || c.source_url
    });
    reviewCandidates.push(c); // verified sweep findings can be approved from the email
  }
  // Zero-cost, no-LLM signals: official pages whose content changed since the
  // last harvest. The harvest state keeps a change from repeating next week.
  const seenUrls = new Set(items.map((i) => i.url));
  for (const c of candidates.filter(isSourceChangeSignal)) {
    const captured = Date.parse(c.captured_at || '');
    if (Number.isNaN(captured) || captured < start.getTime() || captured > now.getTime() || seenUrls.has(c.source_url)) continue;
    if (validateCandidate(c).length) { invalid += 1; continue; }
    seenUrls.add(c.source_url);
    const domain = CATEGORY_LABELS_ES[c.category] || String(c.category || 'fuente vigilada').replaceAll('_', ' ');
    items.push({
      status: 'SEÑAL',
      title: `Novedad en ${c.source_publisher}: ${decodeEntities(c.source_title)}`,
      company: c.source_publisher,
      date: new Date(captured).toISOString().slice(0, 10),
      domain,
      summary: 'HERMES detectó contenido nuevo en esta página oficial. Todavía no se investigó qué cambió.',
      summary_lang: 'es',
      why: `Fuente oficial vigilada (${domain}). Abre el enlace para ver la novedad.`,
      why_lang: 'es',
      url: c.source_url
    });
  }
  items.sort((a, b) => (a.status === b.status ? b.date.localeCompare(a.date) : a.status === 'VERIFICADO' ? -1 : 1));
  return {
    window: { start: start.toISOString().slice(0, 10), end: new Date(end.getTime() - DAY_MS).toISOString().slice(0, 10) },
    items,
    review_candidates: reviewCandidates,
    excluded: { no_published_date: noDate, outside_window: outOfWindow, invalid },
    empty_reason: items.length ? null : emptyReason(readSweepSummary(sweepSummaryPath))
  };
}

const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const safeHref = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol) ? u : null; } catch { return null; } };
const en = (lang) => (lang === 'en' ? ' (EN)' : '');

export function renderIndustryDigest(digest, { actionsFor = null } = {}) {
  const title = 'INTELIGENCIA DE INDUSTRIA DE LA SEMANA';
  const note = 'Sección informativa: no pasa por revisión ni modifica catálogo, Knowledge Center, Obsidian ni PostgreSQL.';
  if (!digest) return { text: '', html: '' };
  const period = `Período: ${digest.window.start} a ${digest.window.end}`;
  if (!digest.items.length) {
    const msg = `Sin novedades de industria esta semana. ${digest.empty_reason || ''}`.trim();
    return {
      text: [title, period, msg, ''].join('\n'),
      html: `<h3>Inteligencia de industria de la semana</h3><p style="font-size:12px;color:#666">${esc(period)}</p><p><strong>${esc(msg)}</strong></p>`
    };
  }
  const text = [title, period, note, ''];
  const cards = digest.items.map((i) => {
    text.push(`[${i.status}] ${i.title}`, `${i.company} · ${i.date} · ${i.domain}`, `Resumen${en(i.summary_lang)}: ${i.summary}`, `Por qué importa${en(i.why_lang)}: ${i.why}`, `Fuente: ${i.url}`, '');
    const href = safeHref(i.url);
    const badge = i.status === 'VERIFICADO' ? 'background:#1a7f37;color:#fff' : 'background:#FFF12D;color:#000';
    return `<div style="border:1px solid #ddd;border-radius:8px;padding:14px;margin:12px 0">
      <span style="${badge};font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px">${esc(i.status)}</span>
      <h4 style="margin:8px 0 4px">${esc(i.title)}</h4>
      <div style="font-size:12px;color:#666">${esc(i.company)} · ${esc(i.date)} · ${esc(i.domain)}</div>
      <p><strong>Resumen${en(i.summary_lang)}:</strong> ${esc(i.summary)}</p>
      <p><strong>Por qué importa${en(i.why_lang)}:</strong> ${esc(i.why)}</p>
      <p>${href ? `<a href="${esc(href)}">Ver fuente</a>` : esc(i.url)}</p>
      ${i.entity_code && actionsFor ? actionsFor(i.entity_code) : ''}
    </div>`;
  });
  return {
    text: text.join('\n'),
    html: `<h3>Inteligencia de industria de la semana</h3><p style="font-size:12px;color:#666">${esc(period)} · ${esc(note)}</p>${cards.join('\n')}`
  };
}
