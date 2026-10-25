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
import { BRAND_YELLOW, esc, sectionHeader } from './weekly-email-layout.mjs';

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

// Duty sections for the email, from the category each source already has in the registries.
export const DUTY_ORDER = ['HD', 'LD', 'IND', 'GEN'];
export const DUTY_LABELS_ES = { HD: 'Heavy Duty', LD: 'Light Duty', IND: 'Industrial & Process', GEN: 'Filtración, materiales y normas' };
export function dutyFromCategory(category = '') {
  const c = String(category);
  if (c === 'oem_light_duty') return 'LD';
  if (c.startsWith('oem_')) return 'HD';
  if (c.startsWith('industrial_')) return 'IND';
  return 'GEN';
}
const dutyKey = (v) => String(v || '').toLowerCase().replace(/\s*\(google news\)\s*$/, '').trim();
let dutyIndex = null;
function loadDutyIndex(repoDir = process.cwd()) {
  if (dutyIndex) return dutyIndex;
  dutyIndex = new Map();
  const read = (f) => { try { return JSON.parse(fs.readFileSync(path.join(repoDir, 'hermes/config', f), 'utf8')); } catch { return null; } };
  for (const o of read('source-organizations.json')?.organizations || []) { const d = dutyFromCategory(o.category); dutyIndex.set(dutyKey(o.id), d); dutyIndex.set(dutyKey(o.name), d); }
  for (const f of read('newsroom-feeds.json')?.feeds || []) {
    const d = /^gn_ld_|^automotive_world$/.test(f.id) ? 'LD' : f.domain === 'oem_engines_equipment' ? 'HD' : dutyFromCategory(f.domain);
    dutyIndex.set(dutyKey(f.id), d); dutyIndex.set(dutyKey(f.name), d);
  }
  return dutyIndex;
}
/** Duty of a source by id or name; unknown sources fall back to their domain. */
export function dutyOf({ id, name, domainId = '' } = {}) {
  if (String(domainId).startsWith('industrial_')) return 'IND';
  const idx = loadDutyIndex();
  return idx.get(dutyKey(id)) || idx.get(dutyKey(name)) || (domainId === 'oem_engines_equipment' ? 'HD' : 'GEN');
}

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

// Headlines the local model had no capacity to judge: links only, grouped by source, for a human to skim.
function readLinkAnnex(file, start, now) {
  const data = readSweepSummary(file);
  const groups = new Map(); const urls = new Set();
  for (const i of Array.isArray(data?.items) ? data.items : []) {
    const at = Date.parse(i?.published_at || '');
    if (Number.isNaN(at) || at < start.getTime() || at > now.getTime() || !/^https:\/\//.test(i.url || '') || urls.has(i.url)) continue;
    urls.add(i.url);
    if (!groups.has(i.source)) groups.set(i.source, []);
    groups.get(i.source).push({ title: decodeEntities(i.headline), date: new Date(at).toISOString().slice(0, 10), url: i.url });
  }
  return [...groups].map(([source, items]) => ({ source, items: items.sort((a, b) => b.date.localeCompare(a.date)) }));
}

// Google News titles end in " - Publisher"; compare the headline only.
const storyKey = (t) => decodeEntities(t).replace(/\s+[-–|]\s+[^-–|]{2,60}$/, '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, ' ').trim();

function mergeAnnex(groups, extra) {
  const urls = new Set(groups.flatMap((g) => g.items.map((i) => i.url)));
  for (const i of extra) {
    if (!/^https:\/\//.test(i.url || '') || urls.has(i.url)) continue;
    urls.add(i.url);
    let g = groups.find((x) => x.source === i.source);
    if (!g) groups.push(g = { source: i.source, items: [] });
    g.items.push({ title: i.title, date: i.date, url: i.url });
    g.items.sort((a, b) => b.date.localeCompare(a.date));
  }
  return groups;
}

// Annex headlines Claude flagged as worth a look (annex-highlights.mjs); only those still in this week's annex.
function takeHighlights(file, annex) {
  const inAnnex = new Map(annex.flatMap((g) => g.items.map((i) => [i.url, g])));
  const out = [];
  const picks = readSweepSummary(file)?.items;
  for (const h of Array.isArray(picks) ? picks : []) {
    const g = inAnnex.get(h?.url);
    if (!g || !h.title_es || !h.why_es) continue;
    g.items = g.items.filter((i) => i.url !== h.url); inAnnex.delete(h.url);
    out.push({ duty: dutyOf({ name: h.source, domainId: h.domain }), title: h.title_es, company: h.source, date: h.date, domain: DOMAIN_LABELS_ES[h.domain] || DOMAIN_LABELS_ES.industry_markets, why: h.why_es, url: h.url });
  }
  return { highlights: out, annex: annex.filter((g) => g.items.length).map((g) => ({ ...g, duty: dutyOf({ name: g.source }) })) };
}

export function buildIndustryDigest(candidates, { now = new Date(), sweepSummaryPath = path.resolve('hermes/industry-sweep/last-run.json'), unreviewedPath = path.resolve(process.env.HERMES_STATE_ROOT || 'hermes/state', 'newsroom-unreviewed.json'), highlightsPath = path.join(path.dirname(unreviewedPath), 'newsroom-highlights.json') } = {}) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end.getTime() - 7 * DAY_MS);
  const items = []; const unsummarized = []; const byCode = new Map();
  let noDate = 0; let outOfWindow = 0; let invalid = 0;
  for (const c of candidates.filter(isIndustrySweepCandidate)) {
    if (validateCandidate(c).length) { invalid += 1; continue; }
    const published = Date.parse(c.published_at || '');
    if (Number.isNaN(published)) { noDate += 1; continue; }
    if (published < start.getTime() || published >= end.getTime()) { outOfWindow += 1; continue; }
    const rr = c.research_resolution || {};
    const domainId = c.category.slice('industry_sweep:'.length);
    const url = rr.evidence_url || c.source_url;
    const original = rr.finding_title || c.source_title || c.entity_code;
    const date = new Date(published).toISOString().slice(0, 10);
    // No Spanish summary -> link-only annex entry, never an English card.
    if (!rr.resumen_es?.trim() || !rr.por_que_importa_es?.trim()) { unsummarized.push({ source: c.source_publisher, title: decodeEntities(original), date, url }); continue; }
    byCode.set(c.entity_code, c);
    items.push({
      entity_code: c.entity_code,
      duty: dutyOf({ id: c.affected_entities?.[0], name: c.source_publisher, domainId }),
      status: c.evidence_level === 'PRIMARY' ? 'VERIFICADO' : 'SEÑAL',
      title: rr.titulo_es || original,
      original_title: original,
      company: c.source_publisher,
      date,
      domain: DOMAIN_LABELS_ES[domainId] || domainId,
      summary: rr.resumen_es.trim(),
      why: rr.por_que_importa_es.trim(),
      url
    });
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
      duty: dutyFromCategory(c.category),
      status: 'SEÑAL',
      title: `Novedad en ${c.source_publisher}: ${decodeEntities(c.source_title)}`,
      company: c.source_publisher,
      date: new Date(captured).toISOString().slice(0, 10),
      domain,
      summary: 'HERMES detectó contenido nuevo en esta página oficial. Todavía no se investigó qué cambió.',
      why: `Fuente oficial vigilada (${domain}). Abre el enlace para ver la novedad.`,
      url: c.source_url
    });
  }
  items.sort((a, b) => (a.status === b.status ? b.date.localeCompare(a.date) : a.status === 'VERIFICADO' ? -1 : 1));
  // Same story from the maker's newsroom and a press/Google News copy: keep the first (VERIFICADO sorts first).
  const seenStories = new Set();
  const unique = items.filter((i) => { const k = storyKey(i.original_title || i.title); if (!k) return true; if (seenStories.has(k)) return false; seenStories.add(k); return true; });
  const { highlights, annex } = takeHighlights(highlightsPath, mergeAnnex(readLinkAnnex(unreviewedPath, start, now), unsummarized));
  return {
    window: { start: start.toISOString().slice(0, 10), end: new Date(end.getTime() - DAY_MS).toISOString().slice(0, 10) },
    items: unique,
    highlights,
    review_candidates: unique.filter((i) => byCode.has(i.entity_code)).map((i) => byCode.get(i.entity_code)), // shown cards can be approved from the email
    link_annex: annex,
    excluded: { no_published_date: noDate, outside_window: outOfWindow, invalid },
    empty_reason: unique.length ? null : emptyReason(readSweepSummary(sweepSummaryPath))
  };
}

const safeHref = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol) ? u : null; } catch { return null; } };
const link = (url, label) => { const href = safeHref(url); return href ? `<a href="${esc(href)}" style="color:#111;font-weight:700">${esc(label)}</a>` : esc(url); };
const chip = (text, bg = '#eeeeee', fg = '#333') => `<span style="display:inline-block;background:${bg};color:${fg};font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;margin:0 4px 4px 0">${esc(text)}</span>`;
const STATUS_COLOR = { VERIFICADO: '#1a7f37', 'SEÑAL': BRAND_YELLOW };

const ANNEX_PER_SOURCE = 30;

// Groups by duty in the fixed HD, LD, Industrial, general order; empty duties are skipped.
const byDuty = (list = []) => DUTY_ORDER.map((d) => [d, list.filter((x) => (x.duty || 'GEN') === d)]).filter(([, l]) => l.length);
const dutyBar = (duty, count, unit) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 10px"><tr>
  <td style="background:#111;padding:8px 12px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${BRAND_YELLOW}">${esc(DUTY_LABELS_ES[duty])}</td>
  <td align="right" style="background:#111;padding:8px 12px;font-size:11px;color:#bbb">${count} ${esc(unit)}</td></tr></table>`;
const dutyText = (duty) => `== ${DUTY_LABELS_ES[duty].toUpperCase()} ==`;

function renderLinkAnnex(groups = []) {
  if (!groups.length) return { text: '', html: '' };
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const intro = `${total} titulares que HERMES no alcanzó a resumir esta semana (sin revisar, solo enlaces).`;
  const text = ['', 'ANEXO: ENLACES SIN REVISAR', intro];
  const html = [sectionHeader('Anexo: enlaces sin revisar', intro), '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6"><tr><td style="padding:4px 14px 12px">'];
  for (const [duty, list] of byDuty(groups)) {
    text.push('', dutyText(duty));
    html.push(`<div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#111;border-bottom:2px solid ${BRAND_YELLOW};padding:16px 0 4px">${esc(DUTY_LABELS_ES[duty])}</div>`);
    for (const g of list) {
      const shown = g.items.slice(0, ANNEX_PER_SOURCE); const more = g.items.length - shown.length;
      text.push('', `${g.source} (${g.items.length})`, ...shown.map((i) => `- ${i.date} ${i.title} ${i.url}`), ...(more > 0 ? [`- +${more} más`] : []));
      html.push(`<div style="font-size:12px;font-weight:800;color:#111;padding:12px 0 4px">${esc(g.source)} <span style="color:#888;font-weight:400">(${g.items.length})</span></div><ul style="font-size:12px;line-height:1.5;color:#444;margin:0;padding-left:18px">${shown.map((i) => `<li>${esc(i.date)} · <a href="${esc(i.url)}">${esc(i.title)}</a></li>`).join('')}${more > 0 ? `<li>+${more} más</li>` : ''}</ul>`);
    }
  }
  html.push('</td></tr></table>');
  return { text: text.join('\n'), html: html.join('\n') };
}

function renderHighlights(list = []) {
  if (!list.length) return { text: '', html: '' };
  const intro = 'Elegidos por HERMES entre los titulares sin revisar. SEÑAL: solo se leyó el titular, no la nota. Sin botones: si uno interesa, abre la fuente.';
  const text = ['', 'DESTACADOS DEL ANEXO', intro];
  let k = 0;
  const row = (h) => {
    k += 1;
    text.push('', `[SEÑAL · solo titular] ${h.title}`, `${h.company} · ${h.date} · ${h.domain}`, `Por qué importa: ${h.why}`, `Fuente: ${h.url}`);
    return `<tr><td valign="top" width="34" style="padding:12px 0;border-bottom:1px solid #eee;font-size:20px;font-weight:800;color:#bbb">${String(k).padStart(2, '0')}</td>
      <td valign="top" style="padding:12px 0;border-bottom:1px solid #eee">
        ${chip('SEÑAL · solo titular', BRAND_YELLOW, '#000')}${chip(h.domain)}
        <div style="font-size:15px;font-weight:800;color:#111;padding:2px 0">${esc(h.title)}</div>
        <div style="font-size:12px;color:#777">${esc(h.company)} · ${esc(h.date)}</div>
        <div style="font-size:13px;color:#333;padding-top:6px"><strong>Por qué importa:</strong> ${esc(h.why)}</div>
        <div style="font-size:12px;padding-top:6px">${link(h.url, 'Ver fuente →')}</div>
      </td></tr>`;
  };
  const blocks = byDuty(list).map(([duty, l]) => { text.push('', dutyText(duty)); return `${dutyBar(duty, l.length, l.length === 1 ? 'destacado' : 'destacados')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${l.map(row).join('')}</table>`; });
  return { text: text.join('\n'), html: `${sectionHeader('Destacados del anexo', intro)}${blocks.join('')}` };
}

export function renderIndustryDigest(digest, { actionsFor = null } = {}) {
  if (!digest) return { text: '', html: '' };
  const main = renderDigestBody(digest, actionsFor); const top = renderHighlights(digest.highlights); const annex = renderLinkAnnex(digest.link_annex);
  return { text: main.text + top.text + annex.text, html: main.html + top.html + annex.html };
}

function renderDigestBody(digest, actionsFor) {
  const title = 'INTELIGENCIA DE INDUSTRIA DE LA SEMANA';
  const note = 'Nada se aplica sin tu decisión: ACEPTAR en una noticia técnica abre un PR al Knowledge Center (sin duplicar lo existente) y en un OEM abre investigación de SKU; el catálogo y Part Search no se modifican automáticamente.';
  const period = `Período: ${digest.window.start} a ${digest.window.end}`;
  if (!digest.items.length) {
    const msg = `Sin novedades de industria esta semana. ${digest.empty_reason || ''}`.trim();
    return {
      text: [title, period, msg, ''].join('\n'),
      html: `${sectionHeader('Inteligencia de industria de la semana', period)}<p style="background:#f6f6f6;padding:14px;margin:0"><strong>${esc(msg)}</strong></p>`
    };
  }
  const text = [title, period, note, ''];
  const card = (i) => {
    text.push(`[${i.status}] ${i.title}`, `${i.company} · ${i.date} · ${i.domain}`, `Resumen: ${i.summary}`, `Por qué importa: ${i.why}`, `Fuente: ${i.url}`, '');
    const color = STATUS_COLOR[i.status] || '#999';
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e3e3;border-left:5px solid ${color};margin:0 0 14px"><tr><td style="padding:14px 16px">
      ${chip(i.status, color, i.status === 'VERIFICADO' ? '#fff' : '#000')}${chip(i.domain)}
      <div style="font-size:16px;font-weight:800;color:#111;padding:4px 0 2px">${esc(i.title)}</div>
      <div style="font-size:12px;color:#777">${esc(i.company)} · ${esc(i.date)}</div>
      <p style="margin:10px 0 6px;font-size:14px;color:#222"><strong>Resumen:</strong> ${esc(i.summary)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#222"><strong>Por qué importa:</strong> ${esc(i.why)}</p>
      <div style="font-size:12px">${link(i.url, 'Ver fuente →')}</div>
      ${i.entity_code && actionsFor ? actionsFor(i.entity_code) : ''}
    </td></tr></table>`;
  };
  const blocks = byDuty(digest.items).map(([duty, l]) => { text.push(dutyText(duty), ''); return `${dutyBar(duty, l.length, l.length === 1 ? 'noticia' : 'noticias')}${l.map(card).join('\n')}`; });
  return {
    text: text.join('\n'),
    html: `${sectionHeader('Inteligencia de industria de la semana', `${period} · ${note}`)}${blocks.join('\n')}`
  };
}
