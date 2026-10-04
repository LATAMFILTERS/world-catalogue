'use strict';

// Presentation guard only: never promotes a SKU, rewrites references or deletes history.
async function governApplicationPresentation(body, pool) {
  if (!body || typeof body !== 'object') return body;
  const products = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(visit);
    if (value.elimfilters_sku || value.sku || Array.isArray(value.equipment_applications) || Array.isArray(value.vehicle_applications)) products.push(value);
    for (const key of ['results','products','candidates','product','alternatives','related','matches']) visit(value[key]);
  };
  const copy = JSON.parse(JSON.stringify(body));
  visit(copy);
  if (!products.length) return copy;
  const skus = [...new Set(products.map(p => String(p.elimfilters_sku || p.sku)))];
  let rows = [];
  try {
    rows = (await pool.query(`
      SELECT c.sku, cert.certification_state, cert.audited_at,
        c.equipment_applications, c.vehicle_applications,
        EXISTS (SELECT 1 FROM public.catalog_application_evidence e
          WHERE e.sku=c.sku AND e.application_kind='EQUIPMENT' AND e.verified=true
            AND nullif(btrim(e.source_url),'') IS NOT NULL
            AND nullif(btrim(e.evidence_hash),'') IS NOT NULL
            AND e.payload_hash=md5(c.equipment_applications::text)) AS equipment_verified,
        EXISTS (SELECT 1 FROM public.catalog_application_evidence e
          WHERE e.sku=c.sku AND e.application_kind='VEHICLE' AND e.verified=true
            AND nullif(btrim(e.source_url),'') IS NOT NULL
            AND nullif(btrim(e.evidence_hash),'') IS NOT NULL
            AND e.payload_hash=md5(c.vehicle_applications::text)) AS vehicle_verified
      FROM public.elimfilters_catalog c
      LEFT JOIN public.catalog_sku_certification cert ON cert.sku=c.sku
      WHERE c.sku=ANY($1::text[])
    `, [skus])).rows;
  } catch (_) {
    console.error('[application-presentation-guard] evidence lookup unavailable; fitment withheld');
    // A failed evidence lookup must never expose unchecked fitment.
  }
  const bySku = new Map(rows.map(r => [r.sku, r]));
  for (const product of products) {
    const row = bySku.get(String(product.elimfilters_sku || product.sku));
    product.catalog_validation = {
      state: row?.certification_state || 'UNKNOWN',
      audited_at: row?.audited_at || null,
      scope: 'RECORDED_AUDIT_ONLY'
    };
    product.application_validation = {};
    for (const [field, flag] of [['equipment_applications','equipment_verified'],['vehicle_applications','vehicle_verified']]) {
      const payload = Array.isArray(product[field]) ? product[field] : [];
      const verified = Boolean(row?.[flag]) && JSON.stringify(payload) === JSON.stringify(row[field]);
      product.application_validation[field] = {
        state: verified ? 'EVIDENCE_VERIFIED' : 'EVIDENCE_REQUIRED',
        withheld_count: verified ? 0 : payload.length
      };
      if (!verified) product[field] = [];
    }
    product.reference_validation = 'TECHNICAL_REVIEW_REQUIRED';
  }
  copy.reference_safety_status = 'SEARCH_RESULT_ONLY';
  copy.compatibility_validation_required = true;
  return copy;
}

module.exports = { governApplicationPresentation };
