import fs from 'fs';
import pg from 'file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js';

const { Client } = pg;
const APPLY = process.argv.includes('--commit') || process.env.APPLY === '1';
const DB = process.env.DATABASE_URL || 'postgresql://catalog_admin@127.0.0.1:5441/catalogo_elimfilters?sslmode=disable';
const payload = JSON.parse(fs.readFileSync(new URL('./donaldson_lube_materialization_repair_20260917.json', import.meta.url), 'utf8'));
const client = new Client({ connectionString: DB });

const clean = v => {
  const s = String(v ?? '').trim();
  return !s || s === '-' ? null : s;
};
const mm = v => {
  if (!v) return null;
  const s = String(v);
  let m = s.match(/\(([0-9.]+)\s*mm\)/i);
  if (m) return Number(m[1]);
  m = s.match(/([0-9.]+)\s*mm/i);
  if (m) return Number(m[1]);
  m = s.match(/([0-9.]+)\s*inch/i);
  return m ? Number((Number(m[1]) * 25.4).toFixed(3)) : null;
};
const firstNum = v => {
  const m = String(v ?? '').match(/-?[0-9]+(?:\.[0-9]+)?/);
  return m ? m[0] : null;
};
const micron = attrs => {
  const keys = Object.keys(attrs || {});
  for (const k of ['Efficiency 99.5%','Efficiency 99%','Efficiency Beta 1000']) {
    if (attrs?.[k]) {
      const m = String(attrs[k]).match(/([0-9.]+)\s*micron/i);
      if (m) return m[1];
    }
  }
  for (const k of keys) {
    if (/Efficiency/i.test(k)) {
      const m = String(attrs[k]).match(/([0-9.]+)\s*micron/i);
      if (m) return m[1];
    }
  }
  return null;
};
const refsFromRaw = (raw, ownCode) => {
  const seen = new Set(), out = [];
  for (const row of raw || []) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const manufacturer = clean(row[0]), code = clean(row[1]);
    if (!manufacturer || !code || /^Manufacturer Name$/i.test(manufacturer)) continue;
    if (code.toUpperCase() === String(ownCode).toUpperCase()) continue;
    const key = manufacturer.toUpperCase() + '|' + code.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key); out.push({ manufacturer, code });
  }
  return out;
};
const appsFromRaw = raw => {
  const seen = new Set(), out = [];
  for (const row of raw || []) {
    if (!Array.isArray(row) || row.length < 5) continue;
    const equipment = clean(row[0]);
    if (!equipment || /^Equipment$/i.test(equipment)) continue;
    const obj = {
      equipment,
      year: clean(row[1]),
      type: clean(row[2]),
      options: clean(row[3]),
      engine: clean(row[4]),
      engine_option: clean(row[5])
    };
    for (const k of Object.keys(obj)) if (obj[k] == null) delete obj[k];
    const key = JSON.stringify(obj);
    if (!seen.has(key)) { seen.add(key); out.push(obj); }
  }
  return out;
};
const mergeRefs = (a, b) => {
  const out = [], seen = new Set();
  for (const x of [...(Array.isArray(a)?a:[]), ...(Array.isArray(b)?b:[])]) {
    if (!x) continue;
    const manufacturer = clean(x.manufacturer || x.brand) || 'UNKNOWN';
    const code = clean(x.code || x.part_number);
    if (!code) continue;
    const key = manufacturer.toUpperCase() + '|' + code.toUpperCase();
    if (!seen.has(key)) { seen.add(key); out.push({ ...x, manufacturer, code }); }
  }
  return out;
};
const brandMap = refs => {
  const out = {};
  for (const r of refs || []) {
    const b = clean(r.manufacturer || r.brand), c = clean(r.code);
    if (!b || !c) continue;
    if (!out[b]) out[b] = [];
    if (!out[b].includes(c)) out[b].push(c);
  }
  return out;
};
const mergeBrandMaps = (a, b) => {
  const out = { ...(a && typeof a === 'object' && !Array.isArray(a) ? a : {}) };
  for (const [brand, codes] of Object.entries(b || {})) {
    const arr = Array.isArray(out[brand]) ? [...out[brand]] : [];
    for (const c of codes || []) if (!arr.includes(c)) arr.push(c);
    out[brand] = arr;
  }
  return out;
};
async function payloadHash(apps) {
  return (await client.query('select md5($1::jsonb::text) h', [JSON.stringify(apps || [])])).rows[0].h;
}
async function ensureEvidence(sku, apps, sourceUrl, enrichment, label) {
  if (!apps?.length) return enrichment || {};
  const h = await payloadHash(apps);
  const hasEngine = apps.some(x => clean(x.engine || x.engine_model || x.motor));
  for (const kind of (hasEngine ? ['EQUIPMENT','ENGINE'] : ['EQUIPMENT'])) {
    await client.query(
      'insert into catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) values($1,$2,$3,$4,$5,true,now(),$6::jsonb) on conflict (sku,application_kind,payload_hash,evidence_authority) do nothing',
      [sku, kind, h, 'DONALDSON', sourceUrl, JSON.stringify({ closure: label })]
    );
  }
  return {
    ...(enrichment || {}),
    application_governance: {
      policy_version: '2026-08-19-app-v1',
      evidence_recorded: true,
      evidence_authority: 'DONALDSON',
      equipment_verified: true,
      equipment_db_payload_hash: h,
      engine_verified: hasEngine,
      engine_db_payload_hash: hasEngine ? h : null
    }
  };
}
async function exactRef(partNumber, sku, brand='DONALDSON', source='donaldson_lube_materialization_20260917') {
  await client.query(
    'insert into exact_part_reference(reference_type,brand,part_number,sku,source) values($1,$2,$3,$4,$5) on conflict (reference_type,brand,part_number,sku,source) do nothing',
    ['COMPETITOR', String(brand).trim().toUpperCase(), String(partNumber).trim().toUpperCase(), sku, source]
  );
}
function normalizedNewProduct(p) {
  const r = p.record, off = r.official || {}, attrs = off.attributes || {};
  const refs = refsFromRaw(off.cross_references_raw, p.code);
  const apps = appsFromRaw(off.equipment_raw);
  const metric = r.metric || {};
  return {
    sku: p.sku,
    codigo_base: p.code,
    filter_type: 'oil',
    technology: 'SYNTRAX™',
    thread_size: clean(attrs['Thread Size']),
    height_mm: mm(attrs['Length']),
    outer_diameter_mm: mm(attrs['Outer Diameter']),
    inner_diameter_mm: mm(attrs['Inner Diameter']),
    gasket_od_mm: mm(attrs['Gasket OD']),
    gasket_id_mm: mm(attrs['Gasket ID']),
    micron_rating: micron(attrs),
    bypass_valve_psi: firstNum(attrs['Bypass Valve Setting LR'] || attrs['Bypass Valve Setting HR']),
    iso_test_method: clean(attrs['Efficiency Test Std']),
    anti_drainback_valve: clean(attrs['Anti-Drainback Valve']),
    filter_media: clean(attrs['Media Type']),
    competitor_codes: refs,
    oem_codes: [],
    equipment_applications: apps,
    collapse_pressure_psi: firstNum(attrs['Collapse Burst']),
    description: 'ELIMFILTERS® ' + p.sku + ' ' + (off.description || 'LUBE FILTER') + '. SYNTRAX™.',
    enrichment_data: {
      codigo_base_governance: {
        state: 'VERIFIED_PRIMARY',
        policy_version: '2026-08-19-v3.2',
        primary_manufacturer_verified: true,
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: p.code,
        approved_source_column: 'CANONICAL_SOURCE'
      },
      donaldson_lube_materialization: {
        source_status: 'VERIFIED',
        source_url: r.source_url,
        repaired_at: new Date().toISOString()
      }
    },
    specs: attrs,
    duty: 'HEAVY_DUTY',
    image_url: clean(off.image_url),
    donaldson_url: r.source_url,
    sub_type: clean(off.description),
    is_primary: true,
    name: p.sku,
    installation_type: clean(attrs['Style']),
    brand_crossrefs: brandMap(refs),
    alternatives: [],
    unit_packaged_weight_kg: metric.unit_packaged_weight_kg ?? null,
    unit_packaged_volume_m3: metric.unit_packaged_volume_m3 ?? null,
    unit_packaged_length_cm: metric.unit_packaged_length_cm ?? null,
    unit_packaged_width_cm: metric.unit_packaged_width_cm ?? null,
    unit_packaged_height_cm: metric.unit_packaged_height_cm ?? null,
    unit_packaged_length_ft: metric.unit_packaged_length_ft ?? null,
    unit_packaged_width_ft: metric.unit_packaged_width_ft ?? null,
    unit_packaged_height_ft: metric.unit_packaged_height_ft ?? null,
    unit_packaged_weight_lb: metric.unit_packaged_weight_lb ?? null,
    unit_packaged_volume_ft3: metric.unit_packaged_volume_ft3 ?? null,
    packaging_source: 'OFFICIAL_SOURCE_SCRAPE',
    packaging_source_url: r.source_url,
    packaging_validation_status: 'VERIFIED',
    packaging_validated_at: new Date().toISOString(),
    product_length_mm: mm(attrs['Length']),
    product_length_in: attrs['Length'] ? Number((mm(attrs['Length']) / 25.4).toFixed(4)) : null,
    product_dimensions_source: 'OFFICIAL_SOURCE_SCRAPE',
    product_dimensions_validation_status: 'VERIFIED',
    canonical_source_brand: 'DONALDSON',
    canonical_source_code: p.code,
    canonical_source_url: r.source_url,
    canonical_source_status: 'VERIFIED',
    canonical_verified_at: new Date().toISOString(),
    canonical_evidence: { source: 'Donaldson official product page', url: r.source_url },
    duty_source_brand: 'DONALDSON',
    duty_source_url: r.source_url,
    duty_validation_status: 'VERIFIED',
    duty_verified_at: new Date().toISOString(),
    duty_evidence: { category: 'Engine & Vehicle > Lube > Filters' }
  };
}

await client.connect();
try {
  await client.query('BEGIN');
  const cols = (await client.query("select column_name from information_schema.columns where table_schema='public' and table_name='elimfilters_catalog' and is_generated='NEVER'")).rows.map(x => x.column_name);
  const allowed = new Set(cols);
  const jsonCols = new Set(['oem_codes','competitor_codes','equipment_applications','alternative_products','enrichment_data','specs','vehicle_applications','brand_crossrefs','alternatives','canonical_evidence','duty_evidence']);

  const rr = payload.reroute;
  const current = (await client.query('select * from elimfilters_catalog where sku=$1', [rr.from_sku])).rows[0];
  if (!current || current.codigo_base !== rr.code) throw new Error('Reroute source mismatch');
  if ((await client.query('select 1 from elimfilters_catalog where sku=$1', [rr.to_sku])).rowCount) throw new Error('Target EH6 already occupied');
  const roff = rr.record.official || {}, rattrs = roff.attributes || {};
  const rrefs = Array.isArray(current.competitor_codes) ? current.competitor_codes : [];
  const renrich0 = { ...(current.enrichment_data || {}), family_correction: { from: 'EL8/SYNTRAX™', to: 'EH6/NANOFORCE™', reason: roff.description, verified_url: rr.record.source_url, corrected_at: new Date().toISOString() } };
  const renrich = await ensureEvidence(rr.to_sku, current.equipment_applications || [], rr.record.source_url, renrich0, 'DONALDSON_LUBE_TO_HYDRAULIC_2026-09-17');
  await client.query(
    'update elimfilters_catalog set sku=$1,filter_type=$2,technology=$3,thread_size=$4,height_mm=$5,outer_diameter_mm=$6,inner_diameter_mm=$7,micron_rating=$8,iso_test_method=$9,collapse_pressure_psi=$10,description=$11,enrichment_data=$12::jsonb,specs=$13::jsonb,duty=$14,donaldson_url=$15,sub_type=$16,name=$17,installation_type=$18,competitor_codes=$19::jsonb,brand_crossrefs=$20::jsonb,canonical_source_brand=$21,canonical_source_code=$22,canonical_source_url=$23,canonical_source_status=$24,canonical_verified_at=now(),canonical_evidence=$25::jsonb,duty_source_brand=$26,duty_source_url=$27,duty_validation_status=$28,duty_verified_at=now(),duty_evidence=$29::jsonb where sku=$30',
    [
      rr.to_sku,'hydraulic','NANOFORCE™',clean(rattrs['Thread Size']),mm(rattrs['Length']),mm(rattrs['Outer Diameter']),mm(rattrs['Inner Diameter']),micron(rattrs),clean(rattrs['Efficiency Test Std']),firstNum(rattrs['Collapse Burst']),
      'ELIMFILTERS® ' + rr.to_sku + ' HYDRAULIC FILTER, CARTRIDGE. NANOFORCE™.',JSON.stringify(renrich),JSON.stringify(rattrs),'HEAVY_DUTY',rr.record.source_url,roff.description,rr.to_sku,clean(rattrs['Style']),JSON.stringify(rrefs),JSON.stringify(current.brand_crossrefs || {}),
      'DONALDSON',rr.code,rr.record.source_url,'VERIFIED',JSON.stringify({source:'Donaldson official product page',url:rr.record.source_url}),'DONALDSON',rr.record.source_url,'VERIFIED',JSON.stringify({category:'Hydraulic filter identified from Donaldson Lube category cross-classification'}),rr.from_sku
    ]
  );
  for (const ref of refsFromRaw(roff.cross_references_raw, rr.code)) await exactRef(ref.code, rr.to_sku, ref.manufacturer, 'donaldson_official_hydraulic_reroute_20260917');

  const wrongDonaldsonRefs = [
    { sku:'EL81670', code:'P550671' },
    { sku:'EL80319', code:'P553871' },
    { sku:'EL80393', code:'P553871' }
  ];
  for (const x of wrongDonaldsonRefs) {
    const row = (await client.query('select competitor_codes,brand_crossrefs from elimfilters_catalog where sku=$1',[x.sku])).rows[0];
    if (!row) continue;
    const refs = (row.competitor_codes || []).filter(r => !(String(r.manufacturer || r.brand || '').toUpperCase()==='DONALDSON' && String(r.code || '').toUpperCase()===x.code));
    const bm = brandMap(refs);
    await client.query('update elimfilters_catalog set competitor_codes=$1::jsonb,brand_crossrefs=$2::jsonb where sku=$3',[JSON.stringify(refs),JSON.stringify(bm),x.sku]);
  }

  for (const x of payload.equivalent_refs) {
    const row = (await client.query('select * from elimfilters_catalog where sku=$1',[x.sku])).rows[0];
    if (!row) throw new Error('Missing equivalent target ' + x.sku + ' for ' + x.code);
    const don = { manufacturer:'DONALDSON', code:x.code };
    const refs = mergeRefs(row.competitor_codes,[don]);
    const enrich = { ...(row.enrichment_data || {}) };
    const arr = Array.isArray(enrich.donaldson_active_aliases) ? enrich.donaldson_active_aliases : [];
    if (!arr.includes(x.code)) arr.push(x.code);
    enrich.donaldson_active_aliases = arr;
    await client.query('update elimfilters_catalog set competitor_codes=$1::jsonb,brand_crossrefs=$2::jsonb,enrichment_data=$3::jsonb where sku=$4',[JSON.stringify(refs),JSON.stringify(mergeBrandMaps(row.brand_crossrefs,brandMap([don]))),JSON.stringify(enrich),x.sku]);
    await exactRef(x.code,x.sku);
  }

  for (const x of payload.listing_aliases) {
    const row = (await client.query('select enrichment_data from elimfilters_catalog where sku=$1',[x.sku])).rows[0];
    if (!row) throw new Error('Missing alias target ' + x.sku);
    const enrich = { ...(row.enrichment_data || {}) };
    const aliases = Array.isArray(enrich.donaldson_listing_aliases) ? enrich.donaldson_listing_aliases : [];
    if (!aliases.some(a => a.code === x.code)) aliases.push({ code:x.code, canonical_code:x.canonical_code });
    enrich.donaldson_listing_aliases = aliases;
    await client.query('update elimfilters_catalog set enrichment_data=$1::jsonb where sku=$2',[JSON.stringify(enrich),x.sku]);
    await exactRef(x.code,x.sku);
  }

  for (const p of payload.new_products) {
    if ((await client.query('select 1 from elimfilters_catalog where sku=$1 or upper(codigo_base)=upper($2)',[p.sku,p.code])).rowCount) throw new Error('New product already exists ' + p.code + '/' + p.sku);
    let row = normalizedNewProduct(p);
    const apps = row.equipment_applications || [];
    row = { ...row, equipment_applications: [], enrichment_data: row.enrichment_data || {} };
    const keys = Object.keys(row).filter(k => allowed.has(k) && row[k] !== undefined);
    const vals = keys.map(k => jsonCols.has(k) ? JSON.stringify(row[k] ?? null) : row[k]);
    const ph = keys.map((k,i) => '$'+(i+1)+(jsonCols.has(k)?'::jsonb':''));
    await client.query('insert into elimfilters_catalog('+keys.map(k=>'"'+k+'"').join(',')+') values('+ph.join(',')+')',vals);
    if (apps.length) {
      const e = await ensureEvidence(p.sku,apps,p.record.source_url,row.enrichment_data,'DONALDSON_LUBE_MATERIALIZATION_2026-09-17');
      await client.query('update elimfilters_catalog set equipment_applications=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(apps),JSON.stringify(e),p.sku]);
    }
    for (const ref of refsFromRaw(p.record.official?.cross_references_raw,p.code)) await exactRef(ref.code,p.sku,ref.manufacturer,'donaldson_official_lube_20260917');
  }

  const resolutions = [];
  const unresolved = [];
  for (const code of payload.expected_el8_codes) {
    const canonical = await client.query("select sku,codigo_base,technology from elimfilters_catalog where upper(codigo_base)=upper($1) and sku like 'EL8%' limit 1",[code]);
    if (canonical.rowCount) { resolutions.push({code,sku:canonical.rows[0].sku,method:'CANONICAL'}); continue; }
    const exact = await client.query("select e.sku,c.technology from exact_part_reference e join elimfilters_catalog c on c.sku=e.sku where upper(e.part_number)=upper($1) and e.brand='DONALDSON' and e.sku like 'EL8%' order by e.id desc limit 1",[code]);
    if (exact.rowCount) { resolutions.push({code,sku:exact.rows[0].sku,method:'EXACT_REFERENCE'}); continue; }
    unresolved.push(code);
  }
  if (unresolved.length) throw new Error('Unresolved EL8 targets: '+unresolved.join(','));
  const badTech = [];
  for (const r of resolutions) {
    const t = (await client.query('select technology from elimfilters_catalog where sku=$1',[r.sku])).rows[0]?.technology;
    if (t !== 'SYNTRAX™') badTech.push({ ...r, technology:t });
  }
  if (badTech.length) throw new Error('Bad Lube technology mappings: '+JSON.stringify(badTech));

  const hydraulic = (await client.query("select sku,codigo_base,filter_type,technology from elimfilters_catalog where upper(codigo_base)='P173489'")).rows;
  if (hydraulic.length !== 1 || hydraulic[0].sku !== 'EH63489' || hydraulic[0].technology !== 'NANOFORCE™') throw new Error('P173489 reroute validation failed');

  const dupNew = await client.query("select sku,count(*)::int n from elimfilters_catalog where sku=any($1) group by sku having count(*)>1",[payload.new_products.map(x=>x.sku).concat(['EH63489'])]);
  if (dupNew.rowCount) throw new Error('Duplicate new SKUs');

  const summary = {
    mode: APPLY ? 'COMMIT' : 'ROLLBACK',
    lube_category_filter_targets: payload.expected_el8_codes.length + payload.expected_rerouted_codes.length,
    lube_native_el8_targets: payload.expected_el8_codes.length,
    resolved_el8_targets: resolutions.length,
    resolved_canonical: resolutions.filter(x=>x.method==='CANONICAL').length,
    resolved_exact_reference: resolutions.filter(x=>x.method==='EXACT_REFERENCE').length,
    new_el8_products: payload.new_products.map(x=>({code:x.code,sku:x.sku})),
    listing_aliases: payload.listing_aliases,
    hydraulic_reroute: hydraulic[0],
    unresolved: unresolved.length,
    bad_technology: badTech.length
  };
  console.log(JSON.stringify(summary,null,2));
  if (APPLY) await client.query('COMMIT'); else await client.query('ROLLBACK');
} catch (e) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error(e.stack || e);
  process.exitCode = 1;
} finally {
  await client.end();
}
