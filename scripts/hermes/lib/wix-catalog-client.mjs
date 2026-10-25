// Read-only client for the official WIX Filters legacy lookup (www2.wixfilters.com/Lookup), a Mann+Hummel
// North-American catalogue that publishes FRAM -> WIX interchange, product specs and vehicle applications.
// Pages used (all public GET, no session):
//   Exactmatch.aspx?PartNo=<code>        grid gvPL: Manufacturer Part Number | Manufacturer | Wix Part Number (+ PartDetails id)
//   PartDetails.aspx?Part=<detail id>    grid gvpd: Style, Service, Media, Length/Width/Height/O.D./I.D./Thread... "(mm)*"
//   PartApplications.aspx?Part=<wix no>  grid gvPartapps: Make | Model | Year | Engine
// Responses are cached on disk (out/wix-cache, by sha1 of the URL) so retries do not hit the site again.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import axios from 'axios';
import { yearSet } from './ld-fram-base.mjs';

export const WIX_BASE = 'https://www2.wixfilters.com/Lookup/';
const CACHE = path.resolve('out', 'wix-cache');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

export async function wixGet(url, { delayMs = 600, maxAgeDays = 14 } = {}) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${crypto.createHash('sha1').update(url).digest('hex')}.html`);
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < maxAgeDays * 864e5) return { html: fs.readFileSync(file, 'utf8'), cached: true, url };
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await axios.get(url, { validateStatus: () => true, responseType: 'text', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0 ELIMFILTERS-catalogue-evidence' } });
      await sleep(delayMs);
      if (r.status === 200) { const html = String(r.data); fs.writeFileSync(file, html); return { html, cached: false, url }; }
      last = new Error(`HTTP ${r.status}`);
      if (r.status === 403 || r.status === 404) break;
    } catch (e) { last = e; await sleep(delayMs * (attempt + 2)); }
  }
  throw new Error(`WIX_FETCH_FAILED ${url}: ${last?.message}`);
}

function gridRows(html, id) {
  const t = (String(html).match(new RegExp(`<table[^>]*id="${id}"[\\s\\S]*?<\\/table>`, 'i')) || [''])[0];
  return [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((tr) => ({
    raw: tr[1], cells: [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => strip(c[1])) }));
}

// FRAM (or any) code -> interchange rows [{code, manufacturer, wix_part, detail_id}]
export function parseExactMatch(html) {
  return gridRows(html, 'gvPL').slice(1).filter((r) => r.cells.length >= 3).map((r) => ({
    code: r.cells[0], manufacturer: r.cells[1], wix_part: r.cells[2],
    detail_id: (r.raw.match(/PartDetails\.aspx\?Part=(\d+)/i) || [])[1] || null,
  }));
}

// Detail page -> {part_number, style, service, media, specs:{label:{text, mm}}, gaskets:[], principal_application}
export function parsePartDetails(html) {
  const specs = {};
  const add = (label, value) => {
    const k = strip(label).replace(/:$/, '').trim(); if (!k) return;
    const v = strip(value); const mm = (v.match(/\(([\d.]+)\)\s*\*/) || [])[1];
    specs[k] = { text: v, mm: mm != null ? Number(mm) : null };
  };
  for (const r of gridRows(html, 'gvpd')) {
    const cells = r.cells.filter(Boolean);
    if (cells.length >= 2 && /:$/.test(cells[0])) add(cells[0], cells.slice(1).join(' '));
    else for (const c of cells) { const m = /^([A-Za-z.#\/ -]{1,40}):\s*(.*)$/.exec(c); if (m) add(m[1], m[2]); }
  }
  if (!specs['Part Number']) {
    // Fallback: the spec block as plain text ("Part Number: 42844 UPC Number: ... Style: ... Length: 12 (305)* ...").
    const text = strip(String(html).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''));
    const block = (text.match(/Part Number:[\s\S]*?denotes metric/) || [''])[0].replace(/\(\s*\)\*\s*denotes metric$/, '');
    // Label = the last capitalised word(s) before ':' that is a known WIX spec label (values like "Air Filter Panel" are not labels).
    const LABELS = ['Part Number','UPC Number','Style','Service','Type','Media','Length','Width','Height','Outer Diameter','Inner Diameter',
      'O.D.','I.D.','Thread','Thread Size','Ends','Gasket','Gasket O.D.','Gasket I.D.','Anti-Drain Back Valve','By-Pass Valve','Bypass Valve',
      'Relief Valve','Relief Valve Setting','Micron Rating','Efficiency','Burst Pressure','Collapse Pressure','Max Diameter','Seal Type','Color'];
    const re = new RegExp(`(${LABELS.sort((a, b) => b.length - a.length).map((l) => l.replace(/[.*+?^\${}()|[\]\\\/-]/g, '\\$&')).join('|')}):\\s*`, 'g');
    const marks = [...block.matchAll(re)];
    marks.forEach((m, j) => add(m[1], block.slice(m.index + m[0].length, j + 1 < marks.length ? marks[j + 1].index : block.length)));
  }
  const gaskets = gridRows(html, 'gvgaskets').slice(1).map((r) => r.cells).filter((c) => c.length >= 3 && !/No Gaskets/i.test(c.join(' ')));
  const pa = gridRows(html, 'gvPa').map((r) => r.cells.filter(Boolean)).find((c) => /Principle Application/i.test(c[0] || ''));
  const g = (k) => specs[k]?.text || null;
  return { part_number: g('Part Number'), upc: g('UPC Number'), style: g('Style'), service: g('Service'), media: g('Media'),
    specs, gaskets, principal_application: pa ? pa[1] || null : null,
    apps_link_part: (String(html).match(/PartApplications\.aspx\?Part=([A-Za-z0-9-]+)/i) || [])[1] || null };
}

// Applications page -> [{make, model, year_text, years:Set, engine}] (+ paginated flag)
export function parsePartApplications(html) {
  const rows = gridRows(html, 'gvPartapps');
  const head = (rows[0]?.cells || []).map((c) => c.toUpperCase());
  const ix = (n) => head.indexOf(n);
  const apps = rows.slice(1).filter((r) => r.cells.length >= 3 && !/No Part applications/i.test(r.cells.join(' '))).map((r) => {
    const c = r.cells; const year = c[ix('YEAR') >= 0 ? ix('YEAR') : 2] || '';
    return { make: c[ix('MAKE') >= 0 ? ix('MAKE') : 0] || '', model: c[ix('MODEL') >= 0 ? ix('MODEL') : 1] || '', year_text: year,
      years: yearSet(year), engine: c[ix('ENGINE') >= 0 ? ix('ENGINE') : 3] || '' };
  });
  return { apps, paginated: /Page\$\d|__doPostBack\('gvPartapps'/i.test(String(html)) };
}
