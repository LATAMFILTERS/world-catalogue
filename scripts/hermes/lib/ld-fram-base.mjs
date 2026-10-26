// Shared helpers for the LD non-European (FRAM base) flows: FRAM base-code resolution for a SKU row and
// normalization of the current vehicle_applications payload for identity matching.
// Used by fram-ld-fetch.mjs (FRAM official catalogue) and wix-fram-ld-fetch.mjs (WIX cross to FRAM).

export const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const last4 = (v) => String(v || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
export const codeOf = (e) => (e && typeof e === 'object' ? e.code || e.part_number || e.reference : e);
export const makerOf = (e) => (e && typeof e === 'object' ? e.manufacturer || e.brand || '' : '');

// FRAM base code, in order: canonical source FRAM; LD canonical identity FRAM ACTIVE; single relational
// source_sku from FRAM_LD_MULTI_REGION; FRAM-shaped codigo_base with the SKU last four digits; exactly one FRAM code
// in competitor/oem codes with the SKU last four digits.
export const FRAM_SHAPE = /^(CA|CF|CH|PH|XG|TG|HM|HP|HPG|PS|CS|FT|FS|FPG|PG|G|C|P)\d{1,6}[A-Z]{0,3}$/;
export function framBase(t) {
  if (/^FRAM$/i.test(t.canonical_source_brand || '') && t.canonical_source_code) return [t.canonical_source_code, 'CANONICAL_SOURCE'];
  if (t.identity_fram) return [t.identity_fram, 'CANONICAL_IDENTITY'];
  if (t.rel_code && Number(t.rel_k) === 1) return [t.rel_code, 'RELATIONAL_SOURCE_SKU'];
  // Most LD SKUs carry the FRAM code as codigo_base (e.g. EA30016 -> CA16). Accepted only with FRAM shape and the
  // SKU's last four digits; the WIX/FRAM lookup must still confirm it as a FRAM part (manufacturer FRAM, exact code).
  if (FRAM_SHAPE.test(norm(t.codigo_base)) && last4(t.codigo_base) === last4(t.sku)) return [t.codigo_base, 'CODIGO_BASE_FRAM_SHAPE'];
  const fram = [...(t.competitor_codes || []), ...(t.oem_codes || [])].filter((e) => /^FRAM\b/i.test(makerOf(e)) && last4(codeOf(e)) === last4(t.sku));
  const distinct = [...new Set(fram.map((e) => norm(codeOf(e))))];
  if (distinct.length === 1) return [codeOf(fram[0]), 'FRAM_COMPETITOR_CODE'];
  return [null, distinct.length > 1 ? 'MULTIPLE_FRAM_CODES' : 'NONE'];
}

// Year range "2005 - 2009" / "2005-2009" / "2005" -> Set of years (max 60).
export function yearSet(text) {
  const years = new Set();
  const range = /((?:19|20)\d{2})\s*[-–]\s*((?:19|20)\d{2})/.exec(String(text || ''));
  if (range) for (let y = Number(range[1]); y <= Number(range[2]) && y - Number(range[1]) < 60; y++) years.add(String(y));
  else { const one = /((?:19|20)\d{2})/.exec(String(text || '')); if (one) years.add(one[1]); }
  return years;
}

// Current payload row -> {make, years:Set, text}
export function currentParts(e) {
  const fam = String(e.model_family || '').trim();
  let year = String(e.year || '').trim();
  let model = String(e.model || '').trim();
  if (!year && /^(19|20)\d{2}$/.test(fam)) year = fam;
  const m = /^((?:19|20)\d{2})\s+(.+)$/.exec(model); if (!year && m) { year = m[1]; model = m[2]; }
  const years = yearSet(`${year} ${e.year_range || ''}`);
  const text = norm([/^(19|20)\d{2}$/.test(fam) ? '' : fam, e.model_type, model].join(' ').replace(/\([^)]*\)/g, ' '));
  return { make: norm(String(e.make || '').replace(/\([^)]*\)/g, ' ')), years, text };
}

// Source application {make, model, years:Set} matches any current row (make prefix, model contained, years overlap when known).
export function matchesCurrent(app, cur) {
  const mk = norm(app.make), md = norm(app.model);
  if (md.length < 2 || !mk) return false;
  return cur.some((c) => (c.make === mk || c.make.startsWith(mk) || mk.startsWith(c.make)) && c.make && c.text.includes(md)
    && (!c.years.size || !app.years.size || [...app.years].some((y) => c.years.has(y))));
}
