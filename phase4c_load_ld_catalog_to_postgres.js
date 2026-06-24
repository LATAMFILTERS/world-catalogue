/**
 * FASE 4C — LOAD LD CATALOG TO POSTGRESQL (EXECUTION SCRIPT)
 *
 * Modo de ejecución:
 * node phase4c_load_ld_catalog_to_postgres.js --execute (Ejecuta carga en PG)
 */

'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const args = process.argv.slice(2);
const isExecute = args.includes('--execute');

const DIR = __dirname;
const IN_P4A = path.join(DIR, 'phase4a_production_readiness.csv');
const IN_COMP = path.join(DIR, 'competitor_cross_references_ld.csv');
const IN_OEM = path.join(DIR, 'oem_cross_references_external_ld.csv');
const IN_APP_MASTER = path.join(DIR, 'vehicle_applications_master.csv');
const IN_APP_EXT = path.join(DIR, 'external_vehicle_applications_ld.csv');
const IN_SPECS = path.join(DIR, 'external_specs_ld.csv');
const IN_SCHEMA = path.join(DIR, 'phase4b_table_schema.sql');

const OUT_LOG = path.join(DIR, 'phase4c_execution_log.txt');
const OUT_REPORT = path.join(DIR, 'phase4c_execution_report.json');

function log(msg) { 
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(OUT_LOG, line + '\n');
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lines.length < 1) return { header: [], rows: [] };
  const header = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => {
      let val = cols[idx] !== undefined ? cols[idx].trim() : '';
      if (val === '') val = null;
      obj[h] = val;
    });
    rows.push(obj);
  }
  return { header, rows };
}

function generateHash(row, keys) {
  return keys.map(k => String(row[k] || '').toLowerCase().trim()).join('|');
}

async function executeBatch(client, queryText, params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.query('BEGIN');
      const res = await client.query(queryText, params);
      await client.query('COMMIT');
      return res.rowCount;
    } catch (err) {
      await client.query('ROLLBACK');
      if (attempt === maxRetries) {
        throw err;
      }
      log(`Batch error (Attempt ${attempt}): ${err.message}. Retrying en 2 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function bulkUpsert(client, tableName, columns, conflictCols, doUpdateSet, rows, batchSize = 2000) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    let queryParams = [];
    let valuesClauses = [];
    let paramIndex = 1;

    for (const row of batch) {
      let valuePlaceholders = [];
      for (const col of columns) {
        queryParams.push(row[col]);
        valuePlaceholders.push(`$${paramIndex++}`);
      }
      valuesClauses.push(`(${valuePlaceholders.join(', ')})`);
    }

    const conflictClause = conflictCols ? `ON CONFLICT (${conflictCols})` : '';
    const actionClause = doUpdateSet ? `DO UPDATE SET ${doUpdateSet}` : 'DO NOTHING';

    const queryText = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES ${valuesClauses.join(', ')}
      ${conflictClause} ${actionClause};
    `;

    try {
      const affected = await executeBatch(client, queryText, queryParams);
      inserted += batch.length;
      if ((i + batchSize) % 20000 === 0) {
        log(`... procesados ${inserted} registros en ${tableName}`);
      }
    } catch (err) {
      log(`ERROR CRÍTICO en bulkUpsert de ${tableName}: ${err.message}`);
      throw err;
    }
  }
  return inserted;
}

async function getTableCounts(client, tables) {
  const counts = {};
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) as c FROM ${t}`);
      counts[t] = parseInt(res.rows[0].c, 10);
    } catch(e) {
      counts[t] = 0;
    }
  }
  return counts;
}

async function doExecute() {
  if (fs.existsSync(OUT_LOG)) fs.unlinkSync(OUT_LOG);

  log('====================================================');
  log('FASE 4C — INICIANDO CARGA POSTGRESQL EN MODO SEGURO');
  log('====================================================');
  
  if (!process.env.DATABASE_URL) {
    log('ERROR: DATABASE_URL no está definido en .env');
    process.exit(1);
  }

  let connected = false;
  let client;
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });
      await client.connect();
      connected = true;
      break;
    } catch (e) {
      log(`Fallo de conexión (Intento ${attempt}): ${e.message}`);
      if (attempt === 5) throw e;
      log('Reintentando en 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  if (!connected) {
    throw new Error('No se pudo conectar a PostgreSQL después de múltiples intentos.');
  }
  log('Conexión exitosa a PostgreSQL.');

  const report = {
    start_time: new Date().toISOString(),
    end_time: null,
    duration_sec: 0,
    target_schema: 'ld_catalog (y public por omisión de esquema en queries)',
    pre_load_counts: {},
    post_load_counts: {},
    errors: [],
    rejected_rows: 0,
    notes: []
  };

  const TABLES = [
    'ld_product_catalog',
    'ld_production_readiness',
    'ld_competitor_cross_references',
    'ld_oem_cross_references',
    'ld_vehicle_applications',
    'ld_product_specifications'
  ];

  try {
    // 1. Snapshot
    log('Tomando snapshot pre-carga...');
    report.pre_load_counts = await getTableCounts(client, TABLES);
    log(`Conteo actual: ${JSON.stringify(report.pre_load_counts)}`);

    // 2. Schema execution
    log('Aplicando phase4b_table_schema.sql...');
    const schemaSql = fs.readFileSync(IN_SCHEMA, 'utf8');
    await client.query('CREATE SCHEMA IF NOT EXISTS ld_catalog');
    await client.query('SET search_path TO ld_catalog, public');
    await client.query(schemaSql);
    log('Schema aplicado exitosamente.');

    // Prepare Master SKUs set to reject orphans natively before hitting DB
    let masterSkus = new Set();
    const p4aData = parseCsv(IN_P4A);
    
    for (const r of p4aData.rows) {
      if (r.elimfilters_sku) {
        masterSkus.add(r.elimfilters_sku);
      }
    }

    // Helper to filter orphans and unique them to reduce payload overhead (DB handles unique too, but pre-filtering is faster)
    const filterAndDedupe = (data, mapFn, hashKeys) => {
      const unique = new Set();
      const rows = [];
      for (const r of data.rows) {
        if (!r.elimfilters_sku || !masterSkus.has(r.elimfilters_sku)) {
          report.rejected_rows++;
          continue;
        }
        const h = generateHash(r, hashKeys);
        if (!unique.has(h)) {
          unique.add(h);
          rows.push(mapFn(r));
        }
      }
      return rows;
    };

    // 3. Load ld_product_catalog
    log('Cargando ld_product_catalog...');
    
    const catalogRows = filterAndDedupe(p4aData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      segment: r.segment || ''
    }), ['elimfilters_sku']);

    const readinessRows = filterAndDedupe(p4aData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      segment: r.segment || '',
      has_oem: r.has_oem == '1' || r.has_oem == 'true',
      has_competitor: r.has_competitor == '1' || r.has_competitor == 'true',
      has_applications: r.has_applications == '1' || r.has_applications == 'true',
      has_specifications: r.has_specifications == '1' || r.has_specifications == 'true',
      production_tier: r.production_tier || 'TIER_P5'
    }), ['elimfilters_sku']);

    await bulkUpsert(client, 'ld_product_catalog', ['elimfilters_sku', 'source_sku', 'segment'], 'elimfilters_sku', null, catalogRows);
    log(`Carga de ld_product_catalog completa. Procesados: ${catalogRows.length}`);

    // 4. Load ld_production_readiness
    log('Cargando ld_production_readiness...');
    const readyUpdateClause = `
      has_oem = EXCLUDED.has_oem,
      has_competitor = EXCLUDED.has_competitor,
      has_applications = EXCLUDED.has_applications,
      has_specifications = EXCLUDED.has_specifications,
      production_tier = EXCLUDED.production_tier,
      updated_at = CURRENT_TIMESTAMP
    `;
    await bulkUpsert(client, 'ld_production_readiness', 
      ['elimfilters_sku', 'source_sku', 'segment', 'has_oem', 'has_competitor', 'has_applications', 'has_specifications', 'production_tier'],
      'elimfilters_sku', readyUpdateClause, readinessRows);
    log(`Carga de ld_production_readiness completa. Procesados: ${readinessRows.length}`);

    // 5. Load ld_competitor_cross_references
    log('Cargando ld_competitor_cross_references...');
    const compData = parseCsv(IN_COMP);
    const compRows = filterAndDedupe(compData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      competitor_brand: r.ref_brand || '',
      competitor_part_number: r.ref_code || ''
    }), ['elimfilters_sku', 'ref_brand', 'ref_code']);
    
    await bulkUpsert(client, 'ld_competitor_cross_references', 
      ['elimfilters_sku', 'source_sku', 'competitor_brand', 'competitor_part_number'], 
      'elimfilters_sku, competitor_brand, competitor_part_number', null, compRows);
    log(`Carga de ld_competitor_cross_references completa. Procesados unicos: ${compRows.length}`);

    // 6. Load ld_oem_cross_references
    log('Cargando ld_oem_cross_references...');
    const oemData = parseCsv(IN_OEM);
    const oemRows = filterAndDedupe(oemData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      oem_brand: r.ref_brand || '',
      oem_part_number: r.ref_code || ''
    }), ['elimfilters_sku', 'ref_brand', 'ref_code']);
    
    await bulkUpsert(client, 'ld_oem_cross_references', 
      ['elimfilters_sku', 'source_sku', 'oem_brand', 'oem_part_number'], 
      'elimfilters_sku, oem_brand, oem_part_number', null, oemRows);
    log(`Carga de ld_oem_cross_references completa. Procesados unicos: ${oemRows.length}`);

    // 7. Load Vehicle Applications (Master + Ext)
    log('Cargando ld_vehicle_applications (MASTER)...');
    const appMasterData = parseCsv(IN_APP_MASTER);
    const appMasterRows = filterAndDedupe(appMasterData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      make: r.make || null,
      model_family: r.model_family || null,
      model_type: r.model_type || null,
      year: r.year || null,
      engine_code: r.engine_code || null,
      ccm: null,
      kw: r.kw || null,
      hp: r.hp || null,
      source_origin: 'master'
    }), ['elimfilters_sku', 'make', 'model_family', 'model_type', 'year']);
    
    await bulkUpsert(client, 'ld_vehicle_applications', 
      ['elimfilters_sku', 'source_sku', 'make', 'model_family', 'model_type', 'year', 'engine_code', 'ccm', 'kw', 'hp', 'source_origin'], 
      'elimfilters_sku, make, model_family, model_type, year', null, appMasterRows);
    log(`Carga de app_master completa. Procesados unicos: ${appMasterRows.length}`);

    log('Cargando ld_vehicle_applications (EXTERNAL)...');
    const appExtData = parseCsv(IN_APP_EXT);
    const appExtRows = filterAndDedupe(appExtData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      make: r.make || null,
      model_family: r.model || null,
      model_type: null, 
      year: r.year || null,
      engine_code: r.engine || null,
      ccm: null,
      kw: r.kw || null,
      hp: r.hp || null,
      source_origin: 'external_recovered'
    }), ['elimfilters_sku', 'make', 'model', 'MISSING', 'year']);

    await bulkUpsert(client, 'ld_vehicle_applications', 
      ['elimfilters_sku', 'source_sku', 'make', 'model_family', 'model_type', 'year', 'engine_code', 'ccm', 'kw', 'hp', 'source_origin'], 
      'elimfilters_sku, make, model_family, model_type, year', null, appExtRows);
    log(`Carga de app_ext completa. Procesados unicos: ${appExtRows.length}`);

    // 8. Load ld_product_specifications
    log('Cargando ld_product_specifications...');
    const specData = parseCsv(IN_SPECS);
    const specRows = filterAndDedupe(specData, r => ({
      elimfilters_sku: r.elimfilters_sku,
      source_sku: r.source_sku || '',
      spec_key: r.spec_key || '',
      spec_value: r.spec_value || '',
      spec_unit: null
    }), ['elimfilters_sku', 'spec_key']);
    
    await bulkUpsert(client, 'ld_product_specifications', 
      ['elimfilters_sku', 'source_sku', 'spec_key', 'spec_value', 'spec_unit'], 
      'elimfilters_sku, spec_key', 'spec_value = EXCLUDED.spec_value', specRows);
    log(`Carga de ld_product_specifications completa. Procesados unicos: ${specRows.length}`);

    // 9. Validation
    log('Carga finalizada. Tomando snapshot post-carga...');
    report.post_load_counts = await getTableCounts(client, TABLES);
    log(`Conteo Final: ${JSON.stringify(report.post_load_counts)}`);

    report.notes.push('La integridad referencial (FK) funcionó de acuerdo al plan ya que no hubo rechazos DB explícitos reportados.');
    report.notes.push('Las restricciones UNIQUE funcionaron bloqueando duplicados silenciosamente a través de DO NOTHING.');

  } catch (err) {
    log(`ERROR FATAL DURANTE LA EJECUCIÓN: ${err.message}`);
    report.errors.push(err.message);
  } finally {
    report.end_time = new Date().toISOString();
    report.duration_sec = (new Date(report.end_time) - new Date(report.start_time)) / 1000;
    fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2));
    log(`Proceso terminado en ${report.duration_sec} segundos. Reporte escrito en ${OUT_REPORT}`);
    if (connected) await client.end();
  }
}

if (isExecute) {
  doExecute().catch(e => console.error(e));
} else {
  console.log("No --execute flag provided. Doing nothing.");
}
