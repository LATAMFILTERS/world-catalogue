'use strict';
// A single documented cabin identity. This does not introduce a general OEM fallback.
const CASE_ID = 'FP4436_CABIN_OEM_NUMBERING_20261015';
const MANN_SHA256 = 'ea175532b70ba441ee6222bae1504a9f36350003ab7f632e08f663b39cbc9af8';
const OEM_SHA256 = '98b7a0f80192680623344769ebdb38f197a6cbe059492ac221b753124712defc';
const MANN_URL = 'https://www.mann-filter.com/en/catalog/search-results/product.html/fp4436_mann-filter.html';
const OEM_URL = 'https://shop.mini.co.uk/product/genuine-microfilter-activated-carbon-container-cabin-air-filter-64-31-9-127-516';
function fp4436OemNumberingApproved(row = {}) {
  const g = row.enrichment_data?.codigo_base_governance || {};
  const p = g.approved_cabin_oem_numbering || {};
  return row.id === 31947 && row.sku === 'EC37516' && row.codigo_base === '64319127516'
    && row.duty === 'LIGHT_DUTY' && row.filter_type === 'cabin'
    && row.canonical_source_brand === 'MANN-FILTER' && row.canonical_source_code === 'FP4436'
    && row.canonical_source_status === 'VERIFIED' && row.canonical_source_url === MANN_URL
    && g.origin_group === 'EUROPEAN' && g.approved_manufacturer === 'BMW'
    && g.approved_codigo_base === '64319127516' && g.approved_source_column === 'OEM_CODES'
    && g.primary_manufacturer_verified === true && g.mann_code_collision_verified === true
    && g.collision_canonical_code === 'FP4436' && g.oem_base_verified === true
    && p.case_id === CASE_ID && p.original_sku === 'EA34436'
    && p.mann_sha256 === MANN_SHA256 && p.oem_sha256 === OEM_SHA256
    && p.mann_url === MANN_URL && p.oem_url === OEM_URL;
}
function prepareFp4436PolicyPatch(definition) {
  const marker = 'FP4436_CABIN_OEM_NUMBERING_20261015';
  if (definition.includes(marker)) throw new Error('FP4436_PATCH_ALREADY_PRESENT');
  const anchor = '          IF public.ea33603_oem_preservation_approved(NEW) THEN RETURN NEW; END IF;';
  if (definition.split(anchor).length !== 2) throw new Error('FP4436_POLICY_ANCHOR_NOT_UNIQUE');
  const block = `
          -- ${marker}: exact identity only; preserve every existing rule outside this branch.
          IF public.fp4436_cabin_oem_numbering_approved(NEW)
             AND EXISTS (SELECT 1 FROM ld_catalog.ld_product_catalog p
                         WHERE p.elimfilters_sku='EC34436' AND p.source_sku='CU4436')
             AND NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog c
                             WHERE c.id <> NEW.id AND (c.sku=NEW.sku
                               OR ld_catalog.norm_part(c.codigo_base)='64319127516'
                               OR ld_catalog.norm_part(c.canonical_source_code)='FP4436'))
          THEN RETURN NEW; END IF;`;
  return definition.replace(anchor, anchor + block);
}
module.exports = { CASE_ID, MANN_SHA256, OEM_SHA256, MANN_URL, OEM_URL,
  fp4436OemNumberingApproved, prepareFp4436PolicyPatch };
