#!/usr/bin/env node
// HERMES — zero-cost newsroom intelligence (no Groq).
//
// Reads the official news/press pages already in the HERMES source registry,
// extracts the dated headlines of the last 7 days (deterministic), and asks the
// local LLM (Ollama, default qwen3:8b) only to judge filtration relevance,
// classify, and write a Spanish summary of that one headline. The verbatim
// headline is kept as the evidence; summaries that introduce numbers absent from
// the headline are rejected. Output = industry_sweep-shaped candidates, so they
// appear in the weekly industry section with ACEPTAR / ELIMINAR.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fetchWithLimits, normalizeHtmlToText, parseRssItems } from './collect-real-sources-core.mjs';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';

const OLLAMA_URL = process.env.HERMES_OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const MODEL = process.env.HERMES_OLLAMA_MODEL || 'qwen3:8b';
const MAX_LLM_CALLS = Math.max(1, Number(process.env.HERMES_NEWSROOM_MAX_ITEMS || 40));
const BUDGET_MS = Math.max(60_000, Number(process.env.HERMES_NEWSROOM_BUDGET_MS || 35 * 60_000));
const DAY_MS = 86_400_000;
const sha = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec';
const DATE_RE = new RegExp('(\\d{4}-\\d{2}-\\d{2}|(?:' + MONTHS + ')\\.? \\d{1,2},? \\d{4}|\\d{1,2} (?:' + MONTHS + ')\\.? \\d{4})', 'g');

// Registry category -> industry-digest domain (labels live in industry-digest.mjs).
const DOMAIN_BY_CATEGORY = {
  filtration_competitor: 'aftermarket_filtration', filtration_manufacturers: 'filter_manufacturing',
  filtration_components: 'filter_manufacturing', filter_media: 'filter_media_materials',
  strategic_supplier: 'filter_manufacturing', suppliers: 'filter_manufacturing',
  regulation: 'environment_regulation', standards: 'standards_testing',
  technical_publication: 'industry_markets', technical_publications: 'industry_markets'
};
const TYPE_BY_DOMAIN = {
  oem_engines_equipment: 'oem_update', aftermarket_filtration: 'competitor_product_update',
  filter_manufacturing: 'supplier_development', filter_media_materials: 'filter_media_development',
  environment_regulation: 'standard_update', standards_testing: 'standard_update', industry_markets: 'technical_bulletin'
};
const FOLDER_BY_DOMAIN = {
  oem_engines_equipment: '12-oems', filter_media_materials: '15-filter-media', filter_manufacturing: '16-suppliers',
  environment_regulation: '04-standards', standards_testing: '04-standards'
};
const domainFor = (category) => (String(category || '').startsWith('oem_') ? 'oem_engines_equipment' : DOMAIN_BY_CATEGORY[category] || 'industry_markets');

const decode = (s) => String(s ?? '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&centerdot;|&middot;/g, '·').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Dated headlines in [now-days, now], cut at the next date marker. */
export function extractDatedHeadlines(text, { now = new Date(), days = 7 } = {}) {
  const plain = decode(text).replace(/\s+/g, ' ');
  const marks = [...plain.matchAll(DATE_RE)].map((m) => ({ index: m.index, raw: m[1], end: m.index + m[0].length, date: Date.parse(m[1]) }));
  const since = now.getTime() - days * DAY_MS; const out = []; const seen = new Set();
  marks.forEach((m, i) => {
    if (Number.isNaN(m.date) || m.date < since || m.date > now.getTime() + DAY_MS) return;
    const stop = Math.min(marks[i + 1]?.index ?? Infinity, m.end + 240);
    const headline = plain.slice(m.end, stop)
      .replace(/^[\s·—–|:,-]*(?:\d{1,2}:\d{2}\s*[A-Z]{2,5}\s*)?(?:press release|news|release|article)?[\s·—–|:,-]*/i, '')
      .replace(/\s*(?:read more|discover|learn more|press releases?)\s*$/i, '').trim();
    const key = headline.slice(0, 60).toLowerCase();
    if (headline.length < 25 || seen.has(key)) return;
    seen.add(key);
    out.push({ published_at: new Date(m.date).toISOString(), headline });
  });
  return out;
}

/** Best article link: an anchor whose text starts like the headline; else the newsroom page. */
export function findArticleLink(html, headline, pageUrl) {
  const start = headline.slice(0, 40).toLowerCase();
  for (const m of String(html).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = decode(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().toLowerCase();
    if (label.length >= 20 && (label.startsWith(start) || start.startsWith(label.slice(0, 40)))) {
      try { const u = new URL(decode(m[1]), pageUrl); if (u.protocol === 'https:') return u.toString(); } catch {}
    }
  }
  return pageUrl;
}

/** Reject summaries that add numbers the headline does not contain. */
export function groundedSummary(headline, llm) {
  const nums = (s) => (String(s).match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.'));
  const allowed = new Set(nums(headline));
  const fields = [llm?.titulo_es, llm?.resumen_es, llm?.por_que_importa, llm?.public_safe_fact];
  if (fields.some((f) => typeof f !== 'string' || f.trim().length < 12)) return false;
  return fields.every((f) => nums(f).every((n) => allowed.has(n)));
}

const RELEVANCE_RULE = 'Relevante = motores, equipos/vehículos nuevos o modificados, combustibles, lubricantes, refrigerantes, hidráulica, filtración, medios filtrantes, materiales, normas, regulación o emisiones. NO relevante = resultados financieros, cotizaciones, nombramientos, premios, eventos, logística o precios.';

async function ollamaJson(system, user, { numPredict, fetchImpl = globalThis.fetch }) {
  const body = { model: MODEL, stream: false, think: false, format: 'json', options: { num_ctx: 4096, num_predict: numPredict, temperature: 0 }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 180_000);
  try {
    const res = await fetchImpl(OLLAMA_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    if (!res.ok) throw new Error(`OLLAMA_HTTP_${res.status}`);
    return JSON.parse((await res.json()).message.content);
  } finally { clearTimeout(timer); }
}

// Step 1: one call judges up to 20 headlines (the slow CPU model only summarises what matters).
async function triage(items, opts) {
  const out = await ollamaJson(`Eres analista de inteligencia para ELIMFILTERS, fabricante de filtros industriales. ${RELEVANCE_RULE} Responde JSON {"relevantes":[números de los titulares relevantes]}.`,
    items.map((it, i) => `${i + 1}. ${it.headline}`).join('\n'), { numPredict: 80, ...opts });
  return new Set((Array.isArray(out?.relevantes) ? out.relevantes : []).map(Number).filter((n) => n >= 1 && n <= items.length).map((n) => n - 1));
}

// Step 2: Spanish summary of one relevant headline, from its own text only.
async function summarize(item, source, opts) {
  return ollamaJson('Eres analista de inteligencia para ELIMFILTERS, fabricante de filtros industriales (aire, combustible, lubricación, hidráulica, refrigeración). Usa SOLO el titular y la descripción dados; no inventes cifras, nombres ni detalles. Responde JSON: {"relevante":true|false,"tecnico":true|false,"titulo_es":"","resumen_es":"1-2 frases en español","por_que_importa":"1 frase sobre qué significa para ELIMFILTERS (ej.: nuevo motor o equipo = cobertura de filtros de aire, aceite, combustible o hidráulicos por investigar; norma nueva = requisito técnico a reflejar). No elogies a la empresa de la noticia.","public_safe_fact":"one neutral English sentence without company names"}. ' + RELEVANCE_RULE + ' tecnico=true solo si describe una tecnología, material, norma o requisito técnico nuevo.',
    JSON.stringify({ fuente: source.name, titular: item.headline, descripcion: item.description || '' }), { numPredict: 260, ...opts });
}

const LOCAL_LLM = { triage, summarize };

export function candidateFrom(item, source, llm, now = new Date()) {
  const domain = source.domain || domainFor(source.category);
  const evidence = source.feed ? 'SECONDARY_VERIFIED' : 'PRIMARY';
  const key = `newsroom-${sha(`${item.url}|${item.headline}`).slice(0, 40)}`;
  const technical = llm.tecnico === true;
  const stamp = now.toISOString();
  return {
    entity_type: 'intelligence_candidate', entity_code: `HERMES_REAL_SWEEP_${domain.toUpperCase()}_${sha(key).slice(0, 12).toUpperCase()}`,
    workflow_status: 'PENDING_REVIEW', candidate_type: TYPE_BY_DOMAIN[domain] || 'technical_bulletin', source_type: source.feed ? 'trade_press_rss' : 'official_newsroom',
    source_url: item.url, source_publisher: source.name, source_title: item.headline, published_at: item.published_at,
    captured_at: stamp, last_verified_at: stamp, confidence: 0.7, evidence_level: evidence, claim_scope: 'SOURCE_REPORTED',
    affected_entities: [String(source.id || domain).toUpperCase()], proposed_action: `Review the official ${source.name} announcement and decide whether it opens catalogue or knowledge work.`,
    proposed_target_folder: FOLDER_BY_DOMAIN[domain] || '14-intelligence', proposed_target_entity: null, deduplication_key: key,
    approval_required: true, approved_by: null, approved_at: null, rejection_reason: null, sync_status: 'NOT_READY', sync_target: [],
    source_hash: sha(item.headline), category: `industry_sweep:${domain}`,
    research_resolution: {
      status: 'VERIFIED', engine: 'LOCAL_LLM', model: MODEL, search_mode: 'OFFICIAL_NEWSROOM_HEADLINE',
      finding_title: item.headline, evidence_url: item.url, published_at: item.published_at,
      technical_facts: [item.headline, item.description].filter(Boolean), relevance: llm.por_que_importa.trim(), public_safe_fact: llm.public_safe_fact.trim(),
      resumen_es: llm.resumen_es.trim(), por_que_importa_es: llm.por_que_importa.trim(), titulo_es: llm.titulo_es.trim(),
      knowledge_action: technical ? 'CREATE_NEW' : 'INTERNAL_ONLY', destination: technical ? 'KNOWLEDGE_CENTER' : 'TECHNICAL_INTELLIGENCE',
      confidence: 0.7, source_type: evidence, evidence_sha256: sha(item.headline), resolved_at: stamp
    }
  };
}

export function newsroomSources(repoDir = process.cwd()) {
  const sources = []; const seen = new Set();
  const add = (s) => { if (s.url && !seen.has(s.url) && /news|press|media|release/i.test(s.url)) { seen.add(s.url); sources.push(s); } };
  const orgs = JSON.parse(fs.readFileSync(path.join(repoDir, 'hermes/config/source-organizations.json'), 'utf8')).organizations || [];
  for (const o of orgs) for (const u of o.monitored_urls || []) add({ id: o.id, name: o.name, category: o.category, url: typeof u === 'string' ? u : u.url });
  try {
    const real = JSON.parse(fs.readFileSync(path.join(repoDir, 'hermes/config/real-sources.json'), 'utf8'));
    for (const s of real.sources || real) add({ id: s.id, name: s.name || s.publisher || s.id, category: s.category, url: s.url });
  } catch {}
  // Trade-press RSS first: structured title/date/link/description, filtration-specific feeds lead.
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(repoDir, 'hermes/config/newsroom-feeds.json'), 'utf8'));
    return [...(cfg.feeds || []).map((f) => ({ ...f, feed: true })), ...sources];
  } catch { return sources; }
}

// Cheap deterministic pre-filter so the slow CPU model only sees plausible filtration intelligence.
export const PLAUSIBLE = /\b(engines?|diesel|gas(?:oline)?|natural gas|hydrogen|fuel|lubric\w*|oil|coolant|hydraulic\w*|filt(?:er|ers|ration|ering)|emission\w*|epa|carb|euro ?[67]|stage v|tier ?4|aftertreatment|dpf|scr|particulate|turbo\w*|compressor\w*|generator\w*|genset\w*|truck\w*|tractor\w*|excavator\w*|loader\w*|dozer\w*|bus(?:es)?|locomotive\w*|vessel\w*|marine|mining|launch\w*|new model|platform|powertrain\w*|recall\w*|standard\w*|iso \d+|sae|regulation\w*|nonwoven\w*|media|synthetic\w*|nanofiber\w*)\b/i;

function itemsFromFeed(xml, source, now) {
  const since = now.getTime() - 7 * DAY_MS;
  return parseRssItems(xml, source.max_items || 80).map((i) => ({
    headline: decode(i.title.replace(/<!\[CDATA\[|\]\]>/g, '')).trim(), description: decode(i.description || '').slice(0, 500),
    published_at: Number.isNaN(Date.parse(i.pubDate)) ? null : new Date(Date.parse(i.pubDate)).toISOString(), url: decode(i.link || source.url).trim()
  })).filter((i) => i.headline.length >= 15 && i.published_at && Date.parse(i.published_at) >= since && /^https:\/\//.test(i.url));
}

export async function runNewsroomIntelligence({ outputDir = resolveRealCandidatesInputDir(), stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', sources = newsroomSources(), now = new Date(), fetchImpl = globalThis.fetch, llm = LOCAL_LLM } = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const started = Date.now(); const overBudget = () => Date.now() - started > BUDGET_MS;
  const summary = { sources: sources.length, fetched: 0, headlines: 0, prefiltered_out: 0, triage_calls: 0, triaged_out: 0, llm_calls: 0, created: 0, irrelevant: 0, ungrounded: 0, existing: 0, errors: [] };
  // Headlines the model already judged irrelevant are not re-sent next run (pruned after 30 days).
  const seenPath = path.resolve(stateRoot, 'newsroom-seen.json');
  let seen = {}; try { seen = JSON.parse(fs.readFileSync(seenPath, 'utf8')); } catch {}
  for (const [k, at] of Object.entries(seen)) if (now.getTime() - Date.parse(at) > 30 * DAY_MS) delete seen[k];
  const saveSeen = () => { fs.mkdirSync(path.dirname(seenPath), { recursive: true }); fs.writeFileSync(seenPath, JSON.stringify(seen)); };

  const queue = [];
  for (const source of sources) {
    if (overBudget()) break;
    const page = await fetchWithLimits({ url: source.url, fetchImpl, timeoutMs: 20_000, maxBytes: source.feed ? 2_000_000 : 800_000 });
    if (!page.ok) { summary.errors.push({ source: source.id, error: page.error || page.status }); continue; }
    summary.fetched += 1;
    const items = source.feed ? itemsFromFeed(page.text, source, now)
      : extractDatedHeadlines(normalizeHtmlToText(page.text), { now }).map((h) => ({ ...h, url: findArticleLink(page.text, h.headline, source.url) }));
    for (const item of items) {
      summary.headlines += 1;
      if (!PLAUSIBLE.test(`${item.headline} ${item.description || ''}`)) { summary.prefiltered_out += 1; continue; }
      const probe = candidateFrom(item, source, { por_que_importa: 'x', public_safe_fact: 'x', resumen_es: 'x', titulo_es: 'x' }, now);
      const file = path.join(outputDir, `${probe.entity_code.toLowerCase()}.json`);
      if (fs.existsSync(file) || seen[probe.deduplication_key]) { summary.existing += 1; continue; }
      queue.push({ item, source, file, key: probe.deduplication_key });
    }
  }

  const unavailable = (error) => /ECONNREFUSED|fetch failed/i.test(error.message);
  for (let i = 0; i < queue.length && !overBudget(); i += 20) {
    const batch = queue.slice(i, i + 20);
    let keep;
    try { summary.triage_calls += 1; keep = await llm.triage(batch.map((q) => q.item), { fetchImpl }); }
    catch (error) { summary.errors.push({ source: 'triage', error: `LLM: ${error.message}` }); if (unavailable(error)) { saveSeen(); return { ...summary, outcome: 'LOCAL_LLM_UNAVAILABLE' }; } continue; }
    batch.forEach((q, j) => { if (!keep.has(j)) { summary.triaged_out += 1; seen[q.key] = now.toISOString(); q.drop = true; } });
  }

  for (const q of queue) {
    if (q.drop || overBudget() || summary.llm_calls >= MAX_LLM_CALLS) continue;
    let answer;
    try { summary.llm_calls += 1; answer = await llm.summarize(q.item, q.source, { fetchImpl }); }
    catch (error) { summary.errors.push({ source: q.source.id, error: `LLM: ${error.message}` }); if (unavailable(error)) break; continue; }
    if (answer?.relevante !== true) { summary.irrelevant += 1; seen[q.key] = now.toISOString(); continue; }
    if (!groundedSummary(`${q.item.headline} ${q.item.description || ''}`, answer)) { summary.ungrounded += 1; continue; }
    const candidate = candidateFrom(q.item, q.source, answer, now);
    const errors = validateCandidate(candidate);
    if (errors.length) { summary.errors.push({ source: q.source.id, error: errors.join('; ') }); continue; }
    fs.writeFileSync(q.file, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
    summary.created += 1;
  }
  saveSeen();
  // Free the ~6 GB the model holds on the 16 GB Lenovo as soon as the run ends (Part Search and PostgreSQL share it).
  if (llm === LOCAL_LLM) { try { await fetchImpl(OLLAMA_URL.replace(/\/api\/chat$/, '/api/generate'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: MODEL, keep_alive: 0 }) }); } catch {} }
  return { ...summary, outcome: 'OK', duration_s: Math.round((Date.now() - started) / 1000) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await runNewsroomIntelligence();
  console.log(`[HERMES newsroom] ${JSON.stringify(result)}`);
}
