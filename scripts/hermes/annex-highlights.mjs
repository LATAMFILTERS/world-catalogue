// HERMES — "Destacados del anexo" for the Monday email.
//
// The local model cannot summarise every newsroom headline, so the rest land in
// newsroom-unreviewed.json (the email's link annex). Headless Claude Code
// (Victor's plan, no API billing) reads ONLY those titles from one input file and
// picks at most 8 worth Victor's attention. It answers with list numbers, so it
// can never invent a link. Highlights are SEÑAL (headline only, article unread)
// and carry no approval buttons. Any failure leaves the email exactly as before.
import fs from 'node:fs';
import path from 'node:path';
import { runClaude } from './oem-research-runner.mjs';
import { DOMAIN_LABELS_ES, decidedHeadlineUrls } from './industry-digest.mjs';

export const MAX_HIGHLIGHTS = 8;
const DAY_MS = 86_400_000;

const PROMPT = `Eres analista de inteligencia de ELIMFILTERS, fabricante de filtros industriales (aire, combustible, lubricación, hidráulica, refrigeración) para motores y equipos pesados, livianos e industriales.
Lee el archivo input.json de esta carpeta: una lista numerada de titulares de la semana (fuente, fecha, titular). Solo tienes los titulares; no inventes detalles que no estén en ellos.
Elige como máximo ${MAX_HIGHLIGHTS} titulares, los más importantes para ELIMFILTERS: motores o plataformas de equipos nuevos, normas y emisiones, tecnología de filtración o media filtrante, movimientos de fabricantes de filtros, combustibles o fluidos nuevos. Ignora finanzas, eventos, patrocinios, personal y marketing. Si nada vale la pena, devuelve la lista vacía.
Responde SOLO con JSON, sin texto adicional:
{"destacados":[{"n":<número de la lista>,"titulo_es":"titular traducido al español","dominio":"<uno de: ${Object.keys(DOMAIN_LABELS_ES).join(', ')}>","por_que_importa_es":"1 frase: qué significa para ELIMFILTERS"}]}`;

/** Headlines still unreviewed this week (same rules as the email annex). */
export function annexItems(unreviewed, now = new Date(), decided = new Set()) {
  const since = now.getTime() - 7 * DAY_MS; const urls = new Set(decided);
  return (Array.isArray(unreviewed?.items) ? unreviewed.items : []).filter((i) => {
    const at = Date.parse(i?.published_at || '');
    if (Number.isNaN(at) || at < since || at > now.getTime() || !/^https:\/\//.test(i.url || '') || urls.has(i.url)) return false;
    urls.add(i.url); return true;
  });
}

/** Validates the model answer against the numbered list; anything malformed is dropped. */
export function pickHighlights(items, answer) {
  const json = String(answer || '').match(/\{[\s\S]*\}/)?.[0];
  let list; try { list = JSON.parse(json).destacados; } catch { return []; }
  if (!Array.isArray(list)) return [];
  const used = new Set(); const out = [];
  for (const h of list) {
    const item = items[Number(h?.n) - 1];
    const title = String(h?.titulo_es || '').trim(); const why = String(h?.por_que_importa_es || '').trim();
    if (!Number.isInteger(Number(h?.n)) || !item || used.has(item.url) || !title || !why) continue;
    used.add(item.url);
    out.push({ url: item.url, headline: item.headline, source: item.source, date: String(item.published_at).slice(0, 10),
      title_es: title.slice(0, 200), domain: DOMAIN_LABELS_ES[h.dominio] ? h.dominio : 'industry_markets', why_es: why.slice(0, 300) });
    if (out.length === MAX_HIGHLIGHTS) break;
  }
  return out;
}

export async function runAnnexHighlights({ stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', now = new Date(), timeoutMs = 4 * 60_000, claude = runClaude } = {}) {
  const outPath = path.resolve(stateRoot, 'newsroom-highlights.json');
  fs.rmSync(outPath, { force: true }); // never show last week's picks
  let unreviewed = null;
  try { unreviewed = JSON.parse(fs.readFileSync(path.resolve(stateRoot, 'newsroom-unreviewed.json'), 'utf8')); } catch {}
  const items = annexItems(unreviewed, now, decidedHeadlineUrls(stateRoot));
  if (!items.length) return { outcome: 'NOTHING_TO_REVIEW' };
  // The child sees only this folder: one input file, Read as its only tool.
  const work = path.resolve(stateRoot, 'annex-highlights-work');
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, 'input.json'), JSON.stringify(items.map((i, k) => ({ n: k + 1, fuente: i.source, fecha: String(i.published_at).slice(0, 10), titular: i.headline })), null, 1));
  const res = await claude(PROMPT, { cwd: work, timeoutMs, toolArgs: ['--tools', 'Read', '--allowedTools', 'Read(./**)'] });
  if (res.code !== 0) return { outcome: 'CLAUDE_FAILED', error: String(res.err || '').slice(-300) };
  const highlights = pickHighlights(items, res.out);
  fs.writeFileSync(outPath, `${JSON.stringify({ generated_at: now.toISOString(), items: highlights }, null, 2)}\n`);
  return { outcome: 'OK', reviewed: items.length, highlights: highlights.length };
}
