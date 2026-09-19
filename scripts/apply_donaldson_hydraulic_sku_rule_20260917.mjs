import fs from 'fs';
let pg;
try { pg = (await import('pg')).default; }
catch { pg = (await import('file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js')).default; }
const { Client } = pg;
const APPLY = process.argv.includes('--apply');
const BASE = 'C:/Work/world-catalogue-hd/scripts';
const PLAN = JSON.parse(fs.readFileSync(BASE + '/donaldson_hydraulic_sku_plan_20260917.json', 'utf8'));
const importLines = fs.readFileSync(BASE + '/donaldson_import_ready.jsonl', 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
const importByBase = new Map(importLines.map(r => [r.codigo_base, r]));
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://catalog_admin@127.0.0.1:5441/catalogo_elimfilters?sslmode=disable';
const qident = s => '"' + String(s).replaceAll('"', '""') + '"';
const hist = /backup|audit|stage|legacy|quarantine|cleanup|candidate|review|conflict|recovered|decision_log/i;
function deepMap(v, map) {
  if (Array.isArray(v)) return v.map(x => deepMap(x, map));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = deepMap(x, map); return o; }
  if (typeof v === 'string' && map.has(v)) return map.get(v);
  return v;
}
const jsonVal = v => v == null ? null : JSON.stringify(v);
const c = new Client({ connectionString: DATABASE_URL });
await c.connect();
try {
  await c.query('BEGIN');
  const db = (await c.query("select id,sku,codigo_base from elimfilters_catalog where sku like 'EH6%'" )).rows;
  const dbByBase = new Map(db.map(r => [r.codigo_base, r]));
  const mappings = [];
  for (const p of PLAN) {
    const cur = dbByBase.get(p.code);
    if (cur && p.sku && cur.sku !== p.sku) mappings.push({ codigo_base: p.code, old_sku: cur.sku, new_sku: p.sku, id: cur.id });
  }  if (new Set(mappings.map(x => x.old_sku)).size !== mappings.length) throw new Error('duplicate old sku mapping');
  if (new Set(mappings.map(x => x.new_sku)).size !== mappings.length) throw new Error('duplicate new sku mapping');
  const movingOld = new Set(mappings.map(x => x.old_sku));
  for (const m of mappings) {
    const owner = db.find(r => r.sku === m.new_sku);
    if (owner && !movingOld.has(owner.sku)) throw new Error('new sku occupied by nonmoving row ' + m.new_sku + ' ' + owner.codigo_base);
  }
  mappings.forEach((m, i) => m.tmp_sku = 'ZZ' + String(9000000 + i));
  const oldToNew = new Map(mappings.map(m => [m.old_sku, m.new_sku]));
  await c.query('create temporary table hyd_sku_map(codigo_base text primary key,old_sku text unique,tmp_sku text unique,new_sku text unique) on commit drop');
  for (const m of mappings) await c.query('insert into hyd_sku_map values($1,$2,$3,$4)', [m.codigo_base, m.old_sku, m.tmp_sku, m.new_sku]);
  await c.query('create table if not exists catalog_hydraulic_sku_remap_backup_20260917(old_sku text primary key,new_sku text,codigo_base text,row_data jsonb,backed_up_at timestamptz default now())');
  await c.query('insert into catalog_hydraulic_sku_remap_backup_20260917(old_sku,new_sku,codigo_base,row_data) select m.old_sku,m.new_sku,m.codigo_base,to_jsonb(e) from hyd_sku_map m join elimfilters_catalog e on e.sku=m.old_sku on conflict(old_sku) do nothing');
  const relSnap = (await c.query("select id,sku,codigo_base,alternatives,enrichment_data from elimfilters_catalog where alternatives is not null or enrichment_data is not null")).rows;
  await c.query('create table if not exists catalog_hydraulic_relation_backup_20260917(id integer primary key,sku text,codigo_base text,alternatives jsonb,enrichment_data jsonb,backed_up_at timestamptz default now())');
  for (const r of relSnap) {
    await c.query('insert into catalog_hydraulic_relation_backup_20260917(id,sku,codigo_base,alternatives,enrichment_data) values($1,$2,$3,$4::jsonb,$5::jsonb) on conflict(id) do nothing', [r.id, r.sku, r.codigo_base, jsonVal(r.alternatives), jsonVal(r.enrichment_data)]);
  }
  const fkCols = (await c.query("select c.conrelid::regclass::text table_name,a.attname column_name from pg_constraint c join unnest(c.conkey) with ordinality ck(attnum,ord) on true join pg_attribute a on a.attrelid=c.conrelid and a.attnum=ck.attnum where c.contype='f' and c.confrelid='elimfilters_catalog'::regclass")).rows;
  const fkSet = new Set(fkCols.map(x => x.table_name + '.' + x.column_name));
  const skuCols = (await c.query("select c.table_name,c.column_name,c.data_type from information_schema.columns c join pg_class pc on pc.relname=c.table_name join pg_namespace pn on pn.oid=pc.relnamespace and pn.nspname=c.table_schema where c.table_schema='public' and pc.relkind='r' and c.column_name ilike '%sku%' and c.data_type in ('text','character varying')")).rows.filter(x => x.table_name !== 'elimfilters_catalog' && !hist.test(x.table_name) && !fkSet.has(x.table_name + '.' + x.column_name));
  let manualTouched = 0;
  for (const col of skuCols) {
    const sql = 'update ' + qident(col.table_name) + ' t set ' + qident(col.column_name) + '=m.tmp_sku from hyd_sku_map m where t.' + qident(col.column_name) + '=m.old_sku';
    manualTouched += (await c.query(sql)).rowCount;
  }  await c.query('update elimfilters_catalog e set sku=m.tmp_sku from hyd_sku_map m where e.sku=m.old_sku');
  await c.query('update elimfilters_catalog e set sku=m.new_sku from hyd_sku_map m where e.sku=m.tmp_sku');
  for (const col of skuCols) {
    const sql = 'update ' + qident(col.table_name) + ' t set ' + qident(col.column_name) + '=m.new_sku from hyd_sku_map m where t.' + qident(col.column_name) + '=m.tmp_sku';
    await c.query(sql);
  }
  for (const m of mappings) {
    await c.query('update elimfilters_catalog set description=replace(description,$1,$2) where codigo_base=$3 and description like $4', [m.old_sku, m.new_sku, m.codigo_base, '%' + m.old_sku + '%']);
  }
  const relRows = (await c.query('select id,sku,alternatives,enrichment_data from elimfilters_catalog where alternatives is not null or enrichment_data is not null')).rows;
  let relationMapped = 0;
  for (const r of relRows) {
    const mappedAlternatives = deepMap(r.alternatives, oldToNew);
    const na = Array.isArray(mappedAlternatives) ? [...new Set(mappedAlternatives)].filter(x => x !== r.sku) : mappedAlternatives;
    const ne = deepMap(r.enrichment_data, oldToNew);
    if (JSON.stringify(na) !== JSON.stringify(r.alternatives) || JSON.stringify(ne) !== JSON.stringify(r.enrichment_data)) {
      await c.query('update elimfilters_catalog set alternatives=$1::jsonb,enrichment_data=$2::jsonb where id=$3', [jsonVal(na), jsonVal(ne), r.id]);
      relationMapped++;
    }
  }
  const missingDbh = PLAN.filter(p => p.code.startsWith('DBH') && p.sku && !dbByBase.has(p.code));
  const colMeta = (await c.query("select column_name,data_type from information_schema.columns where table_name='elimfilters_catalog'")).rows;
  const typeBy = new Map(colMeta.map(x => [x.column_name, x.data_type]));
  const allowed = new Set(colMeta.map(x => x.column_name));
  let inserted = 0;
  for (const p of missingDbh) {
    const src = importByBase.get(p.code);
    if (!src) throw new Error('missing import-ready ' + p.code);
    const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const oemClean = Array.isArray(src.oem_codes) ? src.oem_codes.filter(x => norm(x?.code || x?.reference) !== norm(p.code)) : [];
    const oemSet = new Set(oemClean.map(x => norm(x?.code || x?.reference)).filter(Boolean));
    const competitorClean = Array.isArray(src.competitor_codes) ? src.competitor_codes.filter(x => norm(x?.code || x?.reference) !== norm(p.code) && !oemSet.has(norm(x?.code || x?.reference))) : [];
    const governance = { ...(src.enrichment_data || {}), codigo_base_governance: { primary_manufacturer_verified: true, approved_manufacturer: 'DONALDSON', approved_codigo_base: p.code, approved_source_column: 'DONALDSON_OFFICIAL' } };
    const obj = { ...src, sku: p.sku, description: String(src.description || '').replace(src.sku, p.sku), oem_codes: oemClean, competitor_codes: competitorClean, alternatives: p.alternative_skus || [], equipment_applications: [], enrichment_data: governance };
    const keys = Object.keys(obj).filter(k => allowed.has(k) && !['id','created_at'].includes(k));
    const vals = keys.map(k => ['json','jsonb'].includes(typeBy.get(k)) ? jsonVal(obj[k]) : obj[k]);
    const casts = keys.map((k, i) => '$' + (i + 1) + (['json','jsonb'].includes(typeBy.get(k)) ? '::jsonb' : ''));
    await c.query('insert into elimfilters_catalog(' + keys.map(qident).join(',') + ') values(' + casts.join(',') + ')', vals);
    inserted++;
  }  const existingSkuSet = new Set((await c.query('select sku from elimfilters_catalog')).rows.map(r => r.sku));
  let linkedRows = 0;
  for (const p of PLAN.filter(x => x.sku && x.alternative_skus?.length)) {
    if (!existingSkuSet.has(p.sku)) continue;
    const desired = p.alternative_skus.filter(s => existingSkuSet.has(s) && s !== p.sku);
    const cur = (await c.query('select alternatives,enrichment_data from elimfilters_catalog where sku=$1', [p.sku])).rows[0];
    const arr = Array.isArray(cur?.alternatives) ? cur.alternatives : [];
    const merged = p.classification === 'ALTERNATIVE_PRODUCT' ? [...new Set(desired)] : [...new Set([...arr, ...desired])].filter(x => x !== p.sku);
    let enrich = cur?.enrichment_data || {};
    if (p.classification === 'ALTERNATIVE_PRODUCT') enrich = { ...enrich, donaldson_product_role: 'ALTERNATIVE_PRODUCT', alternative_to_codes: p.alternative_to_codes || [] };
    await c.query('update elimfilters_catalog set alternatives=$1::jsonb,enrichment_data=$2::jsonb where sku=$3', [JSON.stringify(merged), JSON.stringify(enrich), p.sku]);
    linkedRows++;
  }
  let staleLinksRemoved = 0;
  for (const p of missingDbh) {
    const staleSku = importByBase.get(p.code)?.sku;
    if (!staleSku || staleSku === p.sku) continue;
    for (const code of p.alternative_to_codes || []) {
      const rr = (await c.query('select id,sku,alternatives from elimfilters_catalog where codigo_base=$1', [code])).rows[0];
      if (!rr || !Array.isArray(rr.alternatives)) continue;
      const cleaned = [...new Set(rr.alternatives)].filter(x => x !== staleSku && x !== rr.sku);
      if (JSON.stringify(cleaned) !== JSON.stringify(rr.alternatives)) {
        await c.query('update elimfilters_catalog set alternatives=$1::jsonb where id=$2', [JSON.stringify(cleaned), rr.id]);
        staleLinksRemoved++;
      }
    }
  }
  const checks = {};
  checks.remap_total = mappings.length;
  checks.manual_nonfk_touched_phase1 = manualTouched;
  checks.relation_rows_rewritten = relationMapped;
  checks.dbh_inserted = inserted;
  checks.linked_rows = linkedRows;
  checks.stale_links_removed = staleLinksRemoved;
  checks.bad_mappings = Number((await c.query('select count(*) n from hyd_sku_map m left join elimfilters_catalog e on e.codigo_base=m.codigo_base where e.sku is distinct from m.new_sku')).rows[0].n);
  checks.dbh = (await c.query("select sku,codigo_base,alternatives,enrichment_data->>'donaldson_product_role' role from elimfilters_catalog where codigo_base like 'DBH%' order by codigo_base")).rows;
  checks.examples = (await c.query("select sku,codigo_base,alternatives from elimfilters_catalog where codigo_base in ('P170084','P550084','P170312','P570312','P170592','P550592','P580592','P170949','DBH0949') order by codigo_base")).rows;
  checks.duplicate_skus = Number((await c.query('select count(*) n from (select sku from elimfilters_catalog group by sku having count(*)>1)x')).rows[0].n);
  checks.bad_descriptions = Number((await c.query("select count(*) n from hyd_sku_map m join elimfilters_catalog e on e.codigo_base=m.codigo_base where e.description like '%' || m.old_sku || '%'")).rows[0].n);
  checks.dbh_count = Number((await c.query("select count(*) n from elimfilters_catalog where codigo_base like 'DBH%'" )).rows[0].n);
  checks.self_links_in_changed_scope = Number((await c.query("select count(*) n from elimfilters_catalog e where (e.codigo_base like 'DBH%' or exists(select 1 from hyd_sku_map m where m.codigo_base=e.codigo_base)) and jsonb_typeof(coalesce(e.alternatives,'[]'::jsonb))='array' and e.alternatives ? e.sku")).rows[0].n);
  if (checks.bad_mappings || checks.duplicate_skus || checks.bad_descriptions || checks.dbh_count !== 9 || checks.self_links_in_changed_scope) throw new Error('validation failed ' + JSON.stringify(checks));
  if (APPLY) await c.query('COMMIT'); else await c.query('ROLLBACK');
  console.log(JSON.stringify({ mode: APPLY ? 'APPLY_COMMIT' : 'DRY_RUN_ROLLBACK', checks }, null, 2));
} catch (e) {
  try { await c.query('ROLLBACK'); } catch {}
  console.error(e.stack || e);
  process.exitCode = 1;
} finally {
  await c.end();
}
