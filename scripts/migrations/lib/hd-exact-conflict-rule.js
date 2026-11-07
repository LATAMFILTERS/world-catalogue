'use strict';

/**
 * public.exact_part_conflicts lists every part number held by more than one
 * SKU, whatever the reference type, duty or technical data. The HD
 * certification ledger turned that into a blocker for each SKU involved.
 *
 * A shared reference is NOT treated as an equivalence. It stops blocking only
 * when every SKU holding it is active Heavy Duty, they agree on reference type,
 * filter type, sub type, installation type and thread, height and outer
 * diameter are known and within 3%, and each SKU has its own official Donaldson
 * source row for that code. Anything else (missing data included) stays blocked.
 */

const OFFICIAL_SOURCE = /^DONALDSON_OFFICIAL/i;
const DIM_TOLERANCE = 0.03;

const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const close = (a, b) => Math.abs(a - b) <= DIM_TOLERANCE * Math.max(a, b);

// rows: exact_part_reference rows for ONE part number joined with the catalog
// {sku, duty, catalog_active, reference_type, source, filter_type, sub_type,
//  installation_type, thread_size, height_mm, outer_diameter_mm}
function classifyConflictCode(rows) {
  const bySku = new Map();
  for (const r of rows) {
    if (!bySku.has(r.sku)) bySku.set(r.sku, { r, rows: [] });
    bySku.get(r.sku).rows.push(r);
  }
  const active = [...bySku.values()].filter((s) => s.r.catalog_active === true || s.r.catalog_active === 't');
  if (active.length < 2) return 'STALE_INACTIVE_PARTNER';
  const distinct = (f) => new Set(active.flatMap((s) => s.rows.map(f))).size;
  if (new Set(active.map((s) => s.r.duty)).size > 1 || active.some((s) => s.r.duty !== 'HEAVY_DUTY')) return 'CROSS_DUTY';
  if (distinct((r) => r.reference_type) > 1) return 'TYPE_MISMATCH';
  const same = (f) => new Set(active.map((s) => s.r[f])).size === 1;
  if (!same('filter_type')) return 'FILTER_TYPE_DIFFERS';
  if (!same('sub_type') || !same('installation_type') || !same('thread_size')) return 'SUBTYPE_OR_MOUNT_VARIANT';
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      for (const k of ['height_mm', 'outer_diameter_mm']) {
        const a = num(active[i].r[k]);
        const b = num(active[j].r[k]);
        if (a == null || b == null) return 'DIMENSIONS_MISSING';
        if (!close(a, b)) return 'DIMENSION_VARIANT';
      }
    }
  }
  if (!active.every((s) => s.rows.some((r) => OFFICIAL_SOURCE.test(r.source || '')))) return 'NO_PER_SKU_OFFICIAL_EVIDENCE';
  return 'SHARED_LEGIT';
}

// detailRows: all rows of every conflicting part number. Returns the Set of SKUs
// whose every conflicting code classifies SHARED_LEGIT.
function clearableSkus(detailRows) {
  const byCode = new Map();
  for (const r of detailRows) {
    if (!byCode.has(r.part_number)) byCode.set(r.part_number, []);
    byCode.get(r.part_number).push(r);
  }
  const verdict = new Map(); // sku -> true while all codes legit
  for (const rows of byCode.values()) {
    const legit = classifyConflictCode(rows) === 'SHARED_LEGIT';
    for (const sku of new Set(rows.map((r) => r.sku))) {
      verdict.set(sku, (verdict.get(sku) ?? true) && legit);
    }
  }
  return new Set([...verdict].filter(([, ok]) => ok).map(([sku]) => sku));
}

module.exports = { classifyConflictCode, clearableSkus, DIM_TOLERANCE };
