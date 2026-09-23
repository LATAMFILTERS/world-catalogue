'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const API_BASE = 'https://api.pgfilters.com/catalog/api/v1';
const CORE_PART_TYPES = Object.freeze([
  'Oil Filter',
  'Air Filter',
  'Cabin Air Filter',
  'Fuel Filter',
  'Transmission Filter',
]);

function argValue(name, fallback = null) {
  const prefix = '--' + name + '=';
  const hit = process.argv.find((v) => v.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function slug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let requestDelayMs = 800;
let lastRequestAt = 0;

async function throttle() {
  const wait = Math.max(0, requestDelayMs - (Date.now() - lastRequestAt));
  if (wait) await sleep(wait);
  lastRequestAt = Date.now();
}

async function fetchJson(url, options = {}, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await throttle();
      const response = await fetch(url, {
        ...options,
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'user-agent': 'ELIMFILTERS-HERMES-PremiumGuardGapAudit/1.1',
          ...(options.headers || {}),
        },
      });
      const text = await response.text();
      if (response.status === 429) {
        const retryAfterHeader = Number(response.headers.get('retry-after') || 0);
        const error = new Error(`RATE_LIMITED retry_after_seconds=${retryAfterHeader || 'unknown'}: ${text.slice(0, 500)}`);
        error.code = 'PG_RATE_LIMITED';
        error.retryAfterSeconds = retryAfterHeader || null;
        throw error;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${url}: ${text.slice(0, 500)}`);
      }
      return text ? JSON.parse(text) : {};
    } catch (error) {
      lastError = error;
      if (error.code === 'PG_RATE_LIMITED') throw error;
      if (attempt < attempts) await sleep(600 * attempt);
    }
  }
  throw lastError;
}

async function apiGet(endpoint) {
  return fetchJson(`${API_BASE}/${endpoint}`);
}

async function apiPost(endpoint, payload) {
  return fetchJson(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function addDiscovery(map, partNumber, partType, make) {
  const normalized = normalizeCode(partNumber);
  if (!normalized) return;
  if (!map.has(normalized)) {
    map.set(normalized, {
      premium_guard_code: String(partNumber).trim(),
      normalized_code: normalized,
      part_types: new Set(),
      discovered_makes: new Set(),
    });
  }
  const record = map.get(normalized);
  record.part_types.add(partType);
  if (make?.make_name) record.discovered_makes.add(make.make_name);
}

async function discoverPartType({ partType, fromYear, toYear, makeBatchSize, modelBatchSize, checkpointDir }) {
  const makesPayload = { partType, fromYear, toYear };
  const makesResponse = await apiPost('comparison/makes', makesPayload);
  const makes = makesResponse?.data?.makes || [];
  const discovered = new Map();
  const errors = [];
  const makeBatches = chunks(makes, makeBatchSize);
  let completedBatches = 0;

  for (const makeBatch of makeBatches) {
    const makeIds = makeBatch.map((make) => Number(make.make_id)).filter(Number.isFinite);
    try {
      const modelsResponse = await apiPost('comparison/models', {
        partType,
        fromYear,
        toYear,
        makeIds,
      });
      const models = modelsResponse?.data?.models || [];
      const modelIds = [...new Set(models.map((m) => Number(m.model_id)).filter(Number.isFinite))];

      for (const modelBatch of chunks(modelIds, modelBatchSize)) {
        const partsResponse = await apiPost('comparison/part-numbers', {
          partType,
          fromYear,
          toYear,
          makeIds,
          modelIds: modelBatch,
        });
        const parts = partsResponse?.data?.part_numbers || [];
        for (const item of parts) {
          if (item?.part_number) addDiscovery(discovered, item.part_number, partType, null);
        }
      }
    } catch (error) {
      errors.push({
        make_ids: makeIds,
        make_names: makeBatch.map((make) => make.make_name),
        error: error.message,
      });
      if (error.code === 'PG_RATE_LIMITED') throw error;
      console.warn(`[premium-guard] ${partType}: failed make batch ${completedBatches + 1}/${makeBatches.length}: ${error.message}`);
    }

    completedBatches += 1;
    console.log(
      `[premium-guard] ${partType}: batch ${completedBatches}/${makeBatches.length}; ` +
      `${Math.min(completedBatches * makeBatchSize, makes.length)}/${makes.length} makes scoped; ` +
      `${discovered.size} unique parts`
    );

    fs.mkdirSync(checkpointDir, { recursive: true });
    fs.writeFileSync(
      path.join(checkpointDir, `${slug(partType)}-progress.json`),
      JSON.stringify({
        part_type: partType,
        completed_batches: completedBatches,
        total_batches: makeBatches.length,
        scoped_makes: Math.min(completedBatches * makeBatchSize, makes.length),
        unique_parts: discovered.size,
        errors,
        inventory: [...discovered.values()].map((r) => ({
          ...r,
          part_types: [...r.part_types].sort(),
          discovered_makes: [...r.discovered_makes].sort(),
        })),
      }, null, 2)
    );
  }

  const inventory = [...discovered.values()]
    .map((r) => ({
      ...r,
      part_types: [...r.part_types].sort(),
      discovered_makes: [...r.discovered_makes].sort(),
    }))
    .sort((a, b) => a.normalized_code.localeCompare(b.normalized_code));

  fs.mkdirSync(checkpointDir, { recursive: true });
  fs.writeFileSync(
    path.join(checkpointDir, `${slug(partType)}-inventory.json`),
    JSON.stringify({
      part_type: partType,
      from_year: fromYear,
      to_year: toYear,
      makes: makes.length,
      make_batches: makeBatches.length,
      errors,
      inventory,
    }, null, 2)
  );

  return { partType, makes: makes.length, batches: makeBatches.length, errors, inventory };
}

function addCoverage(map, rawCode, sku, kind, brand = null) {
  const code = normalizeCode(rawCode);
  if (!code) return;
  if (!map.has(code)) map.set(code, []);
  const key = `${sku}|${kind}|${brand || ''}`;
  if (map.get(code).some((m) => m._key === key)) return;
  map.get(code).push({ _key: key, sku, match_kind: kind, brand, raw_code: rawCode });
}

function refsArray(value) {
  return Array.isArray(value) ? value : [];
}

async function loadCoverage(client) {
  const coverage = new Map();
  const catalog = await client.query(
    `SELECT sku, codigo_base, canonical_source_code, oem_codes, competitor_codes
     FROM public.elimfilters_catalog`
  );
  for (const row of catalog.rows) {
    addCoverage(coverage, row.sku, row.sku, 'ELIMFILTERS_SKU');
    addCoverage(coverage, row.codigo_base, row.sku, 'CODIGO_BASE');
    addCoverage(coverage, row.canonical_source_code, row.sku, 'CANONICAL_SOURCE_CODE');
    for (const ref of refsArray(row.oem_codes)) {
      addCoverage(coverage, ref.code || ref.part_number || ref.reference, row.sku, 'PUBLIC_OEM', ref.manufacturer || ref.brand);
    }
    for (const ref of refsArray(row.competitor_codes)) {
      addCoverage(coverage, ref.code || ref.part_number || ref.reference, row.sku, 'PUBLIC_COMPETITOR', ref.manufacturer || ref.brand);
    }
  }

  const competitors = await client.query(
    `SELECT elimfilters_sku, competitor_brand, competitor_part_number
     FROM ld_catalog.ld_competitor_cross_references`
  );
  for (const row of competitors.rows) {
    addCoverage(coverage, row.competitor_part_number, row.elimfilters_sku, 'LD_COMPETITOR', row.competitor_brand);
  }

  const oems = await client.query(
    `SELECT elimfilters_sku, oem_brand, oem_part_number
     FROM ld_catalog.ld_oem_cross_references`
  );
  for (const row of oems.rows) {
    addCoverage(coverage, row.oem_part_number, row.elimfilters_sku, 'LD_OEM', row.oem_brand);
  }

  for (const matches of coverage.values()) {
    for (const match of matches) delete match._key;
  }
  return coverage;
}

function normalizeBrand(value) {
  return normalizeCode(value);
}

function classifyCoverage(matches) {
  const all = Array.isArray(matches) ? matches : [];
  const premiumGuard = all.filter((m) =>
    (m.match_kind === 'PUBLIC_COMPETITOR' || m.match_kind === 'LD_COMPETITOR') &&
    normalizeBrand(m.brand) === 'PREMIUMGUARD'
  );
  const premiumGuardSkus = [...new Set(premiumGuard.map((m) => m.sku))];
  const allSkus = [...new Set(all.map((m) => m.sku))];

  if (premiumGuardSkus.length === 1) return 'COVERED_PG_CONFIRMED';
  if (premiumGuardSkus.length > 1) return 'CONFLICT_PG_MULTI';
  if (allSkus.length > 1) return 'CONFLICT_EXISTING_REFERENCE';
  if (allSkus.length === 1) return 'REFERENCE_CANDIDATE_EXISTING_SKU';
  return 'GAP_NO_DIRECT_REFERENCE';
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function writeCsv(filePath, rows) {
  const columns = ['premium_guard_code','normalized_code','part_types','discovered_makes','status','existing_skus','match_kinds'];
  const lines = [columns.join(',')];
  for (const row of rows) {
    const values = [
      row.premium_guard_code,
      row.normalized_code,
      row.part_types.join('|'),
      row.discovered_makes.join('|'),
      row.status,
      [...new Set((row.matches || []).map((m) => m.sku))].join('|'),
      [...new Set((row.matches || []).map((m) => m.match_kind))].join('|'),
    ];
    lines.push(values.map(csvEscape).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}
async function main() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const fromYear = Number(argValue('from-year', '1940'));
  const toYear = Number(argValue('to-year', '2027'));
  const makeBatchSize = Math.max(1, Math.min(100, Number(argValue('make-batch-size', '50'))));
  const modelBatchSize = Math.max(10, Math.min(1000, Number(argValue('model-batch-size', '500'))));
  requestDelayMs = Math.max(250, Number(argValue('request-delay-ms', '1200')));
  const requestedPartType = argValue('part-type');
  const runAllCore = process.argv.includes('--all-core');
  const reuseInventoryPath = argValue('reuse-inventory');

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseDir = path.resolve(__dirname, '../../elimfilters-vault/91-private-evidence/premium-guard-gap-audit', stamp);
  fs.mkdirSync(baseDir, { recursive: true });

  let partTypes;
  let familyResults;

  if (reuseInventoryPath) {
    const absoluteReusePath = path.resolve(reuseInventoryPath);
    const sourceRows = JSON.parse(fs.readFileSync(absoluteReusePath, 'utf8'));
    if (!Array.isArray(sourceRows)) throw new Error('reuse-inventory must point to an inventory.json array');
    const reusedInventory = sourceRows.map((row) => ({
      premium_guard_code: row.premium_guard_code,
      normalized_code: row.normalized_code || normalizeCode(row.premium_guard_code),
      part_types: Array.isArray(row.part_types) ? row.part_types : [],
      discovered_makes: Array.isArray(row.discovered_makes) ? row.discovered_makes : [],
    }));
    partTypes = [...new Set(reusedInventory.flatMap((row) => row.part_types))].sort();
    familyResults = [{
      partType: partTypes.join(' + ') || 'REUSED_INVENTORY',
      makes: null,
      batches: 0,
      errors: [],
      inventory: reusedInventory,
    }];
    console.log(`[premium-guard] classification-only reuse: ${absoluteReusePath}; ${reusedInventory.length} codes`);
  } else {
    const metadata = await apiGet('comparison/years');
    const available = (metadata?.data?.parttypes || []).map((x) => x.part_typename);
    partTypes = requestedPartType
      ? [requestedPartType]
      : runAllCore
        ? CORE_PART_TYPES.filter((type) => available.includes(type))
        : ['Oil Filter'];

    for (const type of partTypes) {
      if (!available.includes(type)) throw new Error(`Premium Guard comparison API does not expose part type: ${type}`);
    }

    console.log(`[premium-guard] phase 1 discovery: ${partTypes.join(', ')}; years ${fromYear}-${toYear}; makeBatch=${makeBatchSize}; modelBatch=${modelBatchSize}; delayMs=${requestDelayMs}`);
    familyResults = [];
    for (const partType of partTypes) {
      const checkpointDir = path.join(baseDir, 'checkpoints');
      familyResults.push(await discoverPartType({ partType, fromYear, toYear, makeBatchSize, modelBatchSize, checkpointDir }));
    }
  }

  const unified = new Map();
  for (const family of familyResults) {
    for (const item of family.inventory) {
      if (!unified.has(item.normalized_code)) {
        unified.set(item.normalized_code, {
          premium_guard_code: item.premium_guard_code,
          normalized_code: item.normalized_code,
          part_types: new Set(),
          discovered_makes: new Set(),
        });
      }
      const record = unified.get(item.normalized_code);
      item.part_types.forEach((x) => record.part_types.add(x));
      item.discovered_makes.forEach((x) => record.discovered_makes.add(x));
    }
  }

  const client = new Client({ connectionString: databaseUrl, ssl: false });
  await client.connect();
  const coverage = await loadCoverage(client);
  await client.end();

  const rows = [...unified.values()].map((item) => {
    const matches = coverage.get(item.normalized_code) || [];
    return {
      premium_guard_code: item.premium_guard_code,
      normalized_code: item.normalized_code,
      part_types: [...item.part_types].sort(),
      discovered_makes: [...item.discovered_makes].sort(),
      status: classifyCoverage(matches),
      matches,
    };
  }).sort((a, b) => a.normalized_code.localeCompare(b.normalized_code));

  const covered = rows.filter((r) => r.status === 'COVERED_PG_CONFIRMED');
  const resolutionQueue = rows.filter((r) => r.status !== 'COVERED_PG_CONFIRMED');
  const referenceCandidates = rows.filter((r) => r.status === 'REFERENCE_CANDIDATE_EXISTING_SKU');
  const conflicts = rows.filter((r) => r.status.startsWith('CONFLICT_'));
  const gaps = rows.filter((r) => r.status === 'GAP_NO_DIRECT_REFERENCE');
  const discoveryErrors = familyResults.reduce((n, x) => n + x.errors.length, 0);
  const summary = {
    phase: 'PHASE_1_PREMIUM_GUARD_DISCOVERY_AND_GAP_AUDIT',
    status: discoveryErrors === 0 ? 'COMPLETE' : 'INCOMPLETE_FAIL_CLOSED',
    generated_at: new Date().toISOString(),
    source: 'Premium Guard public catalog API',
    source_base: API_BASE,
    catalog_runtime: 'Lenovo Power Search PostgreSQL supplied via DATABASE_URL',
    from_year: fromYear,
    to_year: toYear,
    part_types: partTypes,
    total_unique_premium_guard_codes: rows.length,
    covered_pg_confirmed: covered.length,
    reference_candidate_existing_sku: referenceCandidates.length,
    conflicts: conflicts.length,
    gap_no_direct_reference: gaps.length,
    resolution_queue: resolutionQueue.length,
    discovery_errors: discoveryErrors,
    families: familyResults.map((x) => ({
      part_type: x.partType,
      makes: x.makes,
      batches: x.batches,
      discovered_codes: x.inventory.length,
      errors: x.errors.length,
    })),
    next_phase: 'Resolve GAP codes through Premium Guard product/interchange/application evidence, then FRAM/MANN canonical authority before any catalog write.',
  };

  fs.writeFileSync(path.join(baseDir, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(baseDir, 'inventory.json'), JSON.stringify(rows, null, 2));
  fs.writeFileSync(path.join(baseDir, 'gaps.json'), JSON.stringify(gaps, null, 2));
  fs.writeFileSync(path.join(baseDir, 'covered.json'), JSON.stringify(covered, null, 2));
  fs.writeFileSync(path.join(baseDir, 'reference-candidates.json'), JSON.stringify(referenceCandidates, null, 2));
  fs.writeFileSync(path.join(baseDir, 'conflicts.json'), JSON.stringify(conflicts, null, 2));
  fs.writeFileSync(path.join(baseDir, 'resolution-queue.json'), JSON.stringify(resolutionQueue, null, 2));
  writeCsv(path.join(baseDir, 'gaps.csv'), gaps);
  writeCsv(path.join(baseDir, 'resolution-queue.csv'), resolutionQueue);
  writeCsv(path.join(baseDir, 'inventory.csv'), rows);

  console.log('[premium-guard] SUMMARY ' + JSON.stringify(summary));
  console.log('[premium-guard] REPORT_DIR ' + baseDir);
  if (discoveryErrors > 0) {
    throw new Error(`DISCOVERY_INCOMPLETE errors=${discoveryErrors}; report is partial and must not drive catalog writes`);
  }
}

main().catch((error) => {
  console.error('[premium-guard] FAILED', error.stack || error.message);
  process.exit(1);
});
