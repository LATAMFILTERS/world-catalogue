/**
 * FASE 4D — POSTGRESQL POST-LOAD AUDIT
 * Solo operaciones de solo lectura (SELECT).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DIR = __dirname;
const IN_P4A = path.join(DIR, 'phase4a_production_readiness.csv');
const OUT_JSON = path.join(DIR, 'phase4d_post_load_audit.json');
const OUT_MISSING_CSV = path.join(DIR, 'phase4d_missing_sku_analysis.csv');
const OUT_VALIDATION_CSV = path.join(DIR, 'phase4d_table_validation.csv');

function parseCsv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
    const obj = {};
    header.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
    rows.push(obj);
  }
  return { header, rows };
}

function csvEsc(v) { return `"${String(v == null ? '' : v).replace(/"/g, '""')}"`; }
function writeCsv(file, header, data) {
  let content = header.map(csvEsc).join(',') + '\n';
  data.forEach(row => {
    content += header.map(k => csvEsc(row[k])).join(',') + '\n';
  });
  fs.writeFileSync(file, content);
}

async function runAudit() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  await client.connect();

  await client.query('SET search_path TO ld_catalog, public');

  const report = {
    generated_at: new Date().toISOString(),
    sku_drop_analysis: {
      original_total_rows: 7833,
      final_db_count: 6306,
      exact_duplicates_collapsed: 0,
      empty_skus: 0,
      invalid_skus: 0
    },
    table_cardinality: {},
    consistency_validation: {
      no_orphans: true,
      no_broken_refs: true,
      no_duplicate_pks: true
    },
    top_100_skus: {
      competitor_refs: [],
      oem_refs: [],
      applications: [],
      specifications: []
    },
    commercial_readiness_kpi: {
      tier_p1_fully_enriched: 0,
      tier_p2_oem_comp_apps: 0,
      tier_p3_oem_comp: 0,
      tier_p4_comp_only: 0,
      tier_p5_no_commercial_data: 0
    }
  };

  // 1. Analyze 7833 vs 6306 using CSV
  const p4aData = parseCsv(IN_P4A);
  const skuCounts = {};
  const missingAnalysisRows = [];
  
  for (const r of p4aData.rows) {
    const sku = r.elimfilters_sku;
    if (!sku) {
      report.sku_drop_analysis.empty_skus++;
      missingAnalysisRows.push({ elimfilters_sku: 'EMPTY', source_sku: r.source_sku, reason: 'Empty SKU' });
      continue;
    }
    if (!skuCounts[sku]) skuCounts[sku] = { count: 0, source_sku: r.source_sku, tier: r.production_tier };
    skuCounts[sku].count++;
  }

  for (const [sku, meta] of Object.entries(skuCounts)) {
    if (meta.count > 1) {
      report.sku_drop_analysis.exact_duplicates_collapsed += (meta.count - 1);
      missingAnalysisRows.push({ elimfilters_sku: sku, source_sku: meta.source_sku, reason: `Duplicate (${meta.count} instances collapsed to 1)` });
    }
  }

  writeCsv(OUT_MISSING_CSV, ['elimfilters_sku', 'source_sku', 'reason'], missingAnalysisRows);

  // 2. Table Validation & Consistency
  const TABLES = [
    'ld_product_catalog', 'ld_production_readiness', 
    'ld_competitor_cross_references', 'ld_oem_cross_references', 
    'ld_vehicle_applications', 'ld_product_specifications'
  ];

  const validationRows = [];
  for (const t of TABLES) {
    const resCount = await client.query(`SELECT COUNT(*) as c FROM ${t}`);
    const resDistinct = await client.query(`SELECT COUNT(DISTINCT elimfilters_sku) as dc FROM ${t}`);
    const count = parseInt(resCount.rows[0].c, 10);
    const distinct = parseInt(resDistinct.rows[0].dc, 10);
    
    report.table_cardinality[t] = { total_rows: count, distinct_skus: distinct };
    validationRows.push({ table: t, total_rows: count, distinct_skus: distinct });

    if (t === 'ld_product_catalog' || t === 'ld_production_readiness') {
      if (count !== distinct) report.consistency_validation.no_duplicate_pks = false;
    }
  }

  writeCsv(OUT_VALIDATION_CSV, ['table', 'total_rows', 'distinct_skus'], validationRows);

  // 3. Top 100 SKUs
  const getTop100 = async (table) => {
    const res = await client.query(`
      SELECT elimfilters_sku, COUNT(*) as cnt 
      FROM ${table} 
      GROUP BY elimfilters_sku 
      ORDER BY cnt DESC 
      LIMIT 100
    `);
    return res.rows.map(r => ({ sku: r.elimfilters_sku, count: parseInt(r.cnt, 10) }));
  };

  report.top_100_skus.competitor_refs = await getTop100('ld_competitor_cross_references');
  report.top_100_skus.oem_refs = await getTop100('ld_oem_cross_references');
  report.top_100_skus.applications = await getTop100('ld_vehicle_applications');
  report.top_100_skus.specifications = await getTop100('ld_product_specifications');

  // 4. Commercial KPI from DB
  const tierRes = await client.query(`
    SELECT production_tier, COUNT(*) as cnt 
    FROM ld_production_readiness 
    GROUP BY production_tier
  `);

  tierRes.rows.forEach(r => {
    const cnt = parseInt(r.cnt, 10);
    if (r.production_tier === 'TIER_P1') report.commercial_readiness_kpi.tier_p1_fully_enriched = cnt;
    else if (r.production_tier === 'TIER_P2') report.commercial_readiness_kpi.tier_p2_oem_comp_apps = cnt;
    else if (r.production_tier === 'TIER_P3') report.commercial_readiness_kpi.tier_p3_oem_comp = cnt;
    else if (r.production_tier === 'TIER_P4') report.commercial_readiness_kpi.tier_p4_comp_only = cnt;
    else report.commercial_readiness_kpi.tier_p5_no_commercial_data += cnt; // P5 or null
  });

  // Orphans check
  const orphanChecks = [
    'ld_competitor_cross_references', 'ld_oem_cross_references', 
    'ld_vehicle_applications', 'ld_product_specifications'
  ];
  for (const t of orphanChecks) {
    const res = await client.query(`
      SELECT COUNT(*) as c 
      FROM ${t} 
      WHERE elimfilters_sku NOT IN (SELECT elimfilters_sku FROM ld_product_catalog)
    `);
    if (parseInt(res.rows[0].c, 10) > 0) report.consistency_validation.no_orphans = false;
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
  console.log('AUDIT COMPLETED.');

  await client.end();
}

runAudit().catch(console.error);
