'use strict';
const assert = require('node:assert/strict');
const {buildCaseBoundResolverPreview} = require('./case-bound-resolver-preview');
const crypto = require('node:crypto');
const PRIMARY = "COALESCE(((c.enrichment_data -> 'codigo_base_governance'::text) ->> 'primary_manufacturer_verified'::text)::boolean, false) AS manufacturer_verified";
const literal = s => "'" + s.replace(/'/g, "''") + "'";

// Review candidate only. Does not connect, install DDL, approve evidence or certify.
// Admission survives unrelated edits but fails closed when reviewed authority changes.
function buildReviewedFleetguardResolver(definition, cases) {
  buildCaseBoundResolverPreview(definition, cases.map(c => ({...c, fingerprint:'0'.repeat(32)})));
  for (const c of cases) {
    assert.match(c.evidence_hash || '', /^[a-f0-9]{64}$/);
    const u = new URL(c.source_url);
    assert.equal(u.protocol, 'https:');
    assert.ok(['fleetguard.com','www.fleetguard.com'].includes(u.hostname));
    assert.ok(!u.username && !u.password && !u.search && !u.hash);
    // Exact archived URL is an identity constraint, not proof of its contents.
  }
  const values = cases.map(c => '(' + [c.sku,c.base,c.source_url,c.evidence_hash].map(literal).join(',') + ')').join(',');
  const g = "(c.enrichment_data -> 'codigo_base_governance')";
  const guard = `EXISTS (SELECT 1 FROM (VALUES ${values}) reviewed(sku,base,source_url,evidence_hash)
    WHERE reviewed.sku=c.sku::text AND reviewed.base=c.codigo_base::text
    AND c.catalog_active IS TRUE
    AND c.canonical_source_brand='FLEETGUARD' AND c.canonical_source_status='VERIFIED'
    AND c.canonical_source_code::text=reviewed.base
    AND c.canonical_evidence->>'source_url'=reviewed.source_url
    AND c.canonical_evidence->>'evidence_hash'=reviewed.evidence_hash
    AND ${g}->>'approved_manufacturer'='FLEETGUARD'
    AND ${g}->>'approved_codigo_base'=reviewed.base
    AND ${g}->>'approved_source_column'='COMPETITOR_CODES'
    AND ${g}->'fallback_manufacturer_verified'='true'::jsonb
    AND ${g}->'fallback_commercial_code_verified'='true'::jsonb
    AND ${g}->'donaldson_absence_verified'='true'::jsonb
    AND NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog other
      WHERE other.sku<>c.sku AND ld_catalog.norm_part(other.codigo_base::text)=ld_catalog.norm_part(c.codigo_base::text)))`;
  const sql=definition.trim().replace(/;$/, '').replace(PRIMARY, `(COALESCE(((${g} ->> 'primary_manufacturer_verified')::boolean), false) OR (${guard})) AS manufacturer_verified`);
  return {sql,cases:cases.length,sha256:crypto.createHash('sha256').update(sql).digest('hex')};
}
module.exports={buildReviewedFleetguardResolver};
