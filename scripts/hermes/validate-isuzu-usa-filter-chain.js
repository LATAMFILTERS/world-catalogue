'use strict';
// Read-only validation of Isuzu USA filter applications with ONE criterion:
// Isuzu USA vehicle (phase 1) -> Isuzu OEM number (phase 2) -> Donaldson/Fleetguard base (phase 3)
// -> ELIMFILTERS SKU that exists in the official catalog with that same codigo_base.
// Usage: node validate-isuzu-usa-filter-chain.js <official-catalog-bases.json>
// (bases file = [{sku, codigo_base}] exported read-only from the official DB).
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '../../config/vehicle-platform-closure/');
const p1 = require(D + 'isuzu-us-diesel-phase1-universe.json');
const p2 = require(D + 'isuzu-us-diesel-phase2-oen.json');
const p3 = require(D + 'isuzu-us-diesel-phase3-aftermarket.json');
const ledger = require('../../hermes/reports/isuzu-v160-decision-ledger.json').rows;
const bases = new Map(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).map((r) => [r.sku, r.codigo_base]));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const blocks = Object.fromEntries(p1.year_blocks.map((b) => [b.block_id, b]));
const res = Object.fromEntries(p3.resolution_rows.map((r) => [r.phase2_row_id, r]));
const POS = { EL: 'LUBE', EA: 'AIR', EF: 'FUEL', ES: 'FUEL' };

// 1. Official chain, one row per model + year + position + OEM row.
const chain = [];
for (const o of p2.oen_rows) {
  for (const bind of o.binds_to_phase1 || []) {
    const m = bind.match(/^([^()]+?)(?:\((\d{4})(?:-(\d{4}))?(?: only)?\))?$/);
    const b = blocks[m[1]];
    if (!b) continue;
    const years = m[2] ? b.model_years.filter((y) => y >= +m[2] && y <= +(m[3] || m[2])) : b.model_years;
    const r = res[o.row_id] || {};
    for (const model of b.models) for (const year of years) {
      const sku = r.elimfilters_existing_sku || null;
      const liveBase = sku ? bases.get(sku) : undefined;
      let status, reason;
      if (!r.decision_status) { status = 'BLOQUEADA'; reason = 'SIN_RESOLUCION_FASE3'; }
      else if (r.decision_status === 'VERIFIED_BASE') {
        if (!sku) { status = 'BLOQUEADA'; reason = 'BASE_VERIFICADA_SIN_SKU'; }
        else if (liveBase === undefined) { status = 'DEBIL'; reason = 'SKU_NO_EXISTE_EN_BASE_OFICIAL'; }
        else if (norm(liveBase) !== norm(r.base_source_part)) { status = 'BLOQUEADA'; reason = `CODIGO_BASE_DISTINTO:${liveBase}`; }
        else { status = 'VALIDADA'; reason = 'CADENA_OFICIAL_COMPLETA'; }
      } else if (r.decision_status === 'PARTIAL') { status = 'DEBIL'; reason = 'FASE3_PARTIAL'; }
      else { status = 'BLOQUEADA'; reason = 'FASE3_' + r.decision_status; }
      chain.push({ model, engine: b.engine_code, year, position: o.filter_position, isuzu_oem: (o.isuzu_oe_oen || []).join(' '),
        base: r.base_source_part ? `${r.base_source_brand} ${r.base_source_part}` : null, sku, status, reason,
        evidence_url: r.donaldson_source || r.fleetguard_source || null, phase2_row: o.row_id });
    }
  }
}
// 2. Phase-2 unresolved positions and phase-3 blocked scopes (no Isuzu OEM published).
const blocked = [...p2.unresolved_positions.map((u) => ({ scope: u.scope, positions: u.position, status: 'BLOQUEADA', reason: 'ISUZU_NO_PUBLICA_OEM' })),
  ...p3.blocked_oem_rows.map((b) => ({ scope: b.phase2_unresolved_scope || b.row_id, positions: b.filter_position, status: 'BLOQUEADA', reason: b.decision_status }))];
// 3. v160 ledger tuples checked against the chain.
const inChain = (r) => chain.find((c) => c.model === r.model && c.year === r.year && c.sku === (r.target_sku || r.sku) && c.position.startsWith(POS[(r.target_sku || r.sku).slice(0, 2)] || '?'));
const v160 = ledger.map((r) => {
  const c = inChain(r);
  return { id: r.id, model: r.model, engine: r.engine, year: r.year, sku: r.target_sku || r.sku, ledger_decision: r.decision,
    status: c ? c.status : 'FUERA_DE_CADENA_OFICIAL', reason: c ? c.reason : `AUTORIDAD:${r.implemented_evidence?.authority || r.evidence_authority || 'NINGUNA'}` };
});
const tally = (xs) => xs.reduce((a, x) => ((a[x.status] = (a[x.status] || 0) + 1), a), {});
const out = { generated_at: new Date().toISOString(), criterion: 'ISUZU_USA_PHASE1 -> ISUZU_OEM_PHASE2 -> DONALDSON/FLEETGUARD_BASE_PHASE3 -> SKU_WITH_SAME_BASE_IN_OFFICIAL_DB',
  chain_summary: tally(chain), v160_summary: tally(v160), chain, blocked_scopes: blocked, v160 };
fs.writeFileSync(path.join(__dirname, '../../hermes/reports/isuzu-usa-filter-validation.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ chain_summary: out.chain_summary, v160_summary: out.v160_summary }, null, 1));
