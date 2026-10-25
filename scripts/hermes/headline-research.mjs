// HERMES — INVESTIGAR / DESCARTAR on unread headlines (email highlights and the annex page).
//
// DESCARTAR: the headline never shows again. INVESTIGAR: headless Claude Code
// (Victor's plan, no API billing) finds and reads the original article and the
// result becomes a normal card, with ACEPTAR / REVISAR / ELIMINAR, in the next
// weekly email. Nothing reaches the Knowledge Center or the catalogue from here:
// the card still needs Victor's ACEPTAR. State: headline-decisions.json.
import fs from 'node:fs';
import path from 'node:path';
import { runClaude } from './oem-research-runner.mjs';
import { candidateFrom } from './newsroom-intelligence.mjs';
import { resolveRealCandidatesInputDir, validateCandidate } from './hermes-core.mjs';
import { readHeadlineDecisions, headlineDecisionsPath } from './industry-digest.mjs';

export const PER_RUN = 3;
const DOMAIN_BY_DUTY = { HD: 'oem_engines_equipment', LD: 'oem_engines_equipment', IND: 'industry_markets', GEN: 'industry_markets' };

function save(stateRoot, data) {
  const file = headlineDecisionsPath(stateRoot);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(data, null, 2)}\n`); fs.renameSync(`${file}.tmp`, file);
}

/** Applies one DB decision row on a HERMES_HEADLINE_* code. Idempotent. */
export function applyHeadlineDecision(row, { stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state' } = {}) {
  const c = row.candidate || {};
  const decision = String(row.decision || '').toLowerCase();
  if (c.entity_code !== row.candidate_code || c.kind !== 'headline' || !/^https:\/\//.test(c.url || '')) throw new Error(`review snapshot mismatch for ${row.candidate_code}`);
  if (!['research', 'reject'].includes(decision)) throw new Error(`unsupported headline decision ${decision}`);
  const data = readHeadlineDecisions(stateRoot);
  const at = new Date(row.decided_at || Date.now()).toISOString();
  if (decision === 'reject') data.discarded[c.url] = { code: c.entity_code, at };
  else data.research[c.url] ||= { code: c.entity_code, headline: c.headline, title_es: c.title_es || null, source: c.source, date: c.date, duty: c.duty, requested_at: at, reason: String(row.decision_reason || '').trim() || null, status: 'QUEUED', attempts: 0 };
  save(stateRoot, data);
  return { candidate: row.candidate_code, decision, outcome: 'APPLIED' };
}

export function buildPrompt(entry, url) {
  return `Eres analista de inteligencia de ELIMFILTERS, fabricante de filtros industriales (aire, combustible, lubricación, hidráulica, refrigeración).
Victor pidió investigar este titular:
- Titular: ${entry.headline}
- Fuente: ${entry.source} · ${entry.date}
- Enlace: ${url}
El enlace puede ser una redirección de Google News: si no abre la nota, busca el titular en la web y abre la nota original. Lee la nota completa.
Usa SOLO lo que dice la nota; no inventes cifras, nombres ni detalles. Si no puedes leer la nota, responde "leida": false.
Responde SOLO con JSON, sin texto adicional:
{"leida":true,"url_original":"https://...","titulo_es":"","resumen_es":"2-3 frases con los hechos de la nota","por_que_importa_es":"1 frase: qué significa para ELIMFILTERS","hecho_publico_en":"one neutral English sentence without company names","tecnico":true|false}`;
}

/** Validates the model answer; returns the llm-shaped object candidateFrom expects, or null. */
export function parseAnswer(out) {
  let a; try { a = JSON.parse(String(out || '').match(/\{[\s\S]*\}/)?.[0]); } catch { return null; }
  if (a?.leida !== true || !/^https:\/\//.test(a.url_original || '') || /news\.google\.com/.test(a.url_original)) return null;
  const s = (v, n) => String(v || '').trim().slice(0, n);
  const out2 = { url: a.url_original, titulo_es: s(a.titulo_es, 200), resumen_es: s(a.resumen_es, 700), por_que_importa: s(a.por_que_importa_es, 300), public_safe_fact: s(a.hecho_publico_en, 300), tecnico: a.tecnico === true };
  return out2.titulo_es && out2.resumen_es && out2.por_que_importa && out2.public_safe_fact ? out2 : null;
}

export async function runHeadlineResearch({ stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', outputDir = resolveRealCandidatesInputDir(), now = new Date(), claude = runClaude, perRun = PER_RUN } = {}) {
  const data = readHeadlineDecisions(stateRoot);
  const todo = Object.entries(data.research).filter(([, e]) => e.status === 'QUEUED' && (e.attempts || 0) < 2).slice(0, perRun);
  if (!todo.length) return { outcome: 'NOTHING_QUEUED' };
  const work = path.resolve(stateRoot, 'headline-research-work'); fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(path.resolve(outputDir), { recursive: true });
  const results = [];
  for (const [url, entry] of todo) {
    entry.attempts = (entry.attempts || 0) + 1;
    const res = await claude(buildPrompt(entry, url), { cwd: work, timeoutMs: 5 * 60_000, toolArgs: ['--tools', 'WebSearch', 'WebFetch', '--allowedTools', 'WebSearch', 'WebFetch'] });
    const llm = res.code === 0 ? parseAnswer(res.out) : null;
    if (!llm) { if (entry.attempts >= 2) entry.status = 'UNREADABLE'; results.push({ url, outcome: entry.status === 'UNREADABLE' ? 'UNREADABLE' : 'RETRY' }); save(stateRoot, data); continue; }
    const candidate = candidateFrom({ url: llm.url, headline: entry.headline, published_at: new Date(`${entry.date}T12:00:00Z`).toISOString() },
      { name: entry.source, domain: DOMAIN_BY_DUTY[entry.duty] || 'industry_markets', feed: true }, llm, now);
    Object.assign(candidate.research_resolution, { engine: 'CLAUDE_CODE', search_mode: 'HEADLINE_INVESTIGATION', requested_at: entry.requested_at, requested_headline_url: url, victor_instruction: entry.reason });
    const errors = validateCandidate(candidate);
    if (errors.length) { entry.status = 'INVALID'; entry.error = errors.join('; ').slice(0, 300); results.push({ url, outcome: 'INVALID' }); save(stateRoot, data); continue; }
    fs.writeFileSync(path.resolve(outputDir, `${candidate.entity_code.toLowerCase()}.json`), `${JSON.stringify(candidate, null, 2)}\n`);
    entry.status = 'DONE'; entry.candidate = candidate.entity_code;
    results.push({ url, outcome: 'DONE', candidate: candidate.entity_code });
    save(stateRoot, data);
  }
  return { outcome: 'OK', results };
}
