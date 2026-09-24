'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

function argValue(name, fallback = null) {
  const prefix = '--' + name + '=';
  const hit = process.argv.find((v) => v.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeBrand(value) {
  return normalizeCode(value);
}

function normalizeMake(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/\s*\(USA\).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sha(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableJson(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function buildPreflightFingerprint(queue, dbContext) {
  const canonical = [...dbContext.canonicalIndex.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rows]) => [key, [...rows]
      .map((row) => ({
        elimfilters_sku: row.elimfilters_sku,
        origin_group: row.origin_group,
        canonical_brand: row.canonical_brand,
        canonical_part_number: row.canonical_part_number,
        identity_filter_type: row.identity_filter_type,
        catalog_filter_type: row.catalog_filter_type,
        duty: row.duty,
        technology: row.technology,
        match_source: row.match_source,
      }))
      .sort((a, b) => stableJson(a).localeCompare(stableJson(b)))]);
  const makePolicies = [...dbContext.makePolicies]
    .map((row) => ({ ...row }))
    .sort((a, b) => stableJson(a).localeCompare(stableJson(b)));
  return sha(stableJson({ queue, canonical, makePolicies }));
}

function collisionSignature(results) {
  const material = (results || []).map((row) => ({
    premium_guard_code: normalizeCode(row.premium_guard_code),
    state: row.state,
    target_sku: row.target_sku || null,
    existing_matches: (row.existing_canonical_matches || []).map((match) => ({
      sku: match.elimfilters_sku,
      brand: match.canonical_brand,
      code: match.canonical_part_number,
      source: match.match_source,
    })).sort((a, b) => stableJson(a).localeCompare(stableJson(b))),
    reasons: [...(row.reasons || [])].sort(),
  })).sort((a, b) => a.premium_guard_code.localeCompare(b.premium_guard_code));
  return sha(stableJson(material));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function decodeFlightHtml(html) {
  return String(html || '')
    .replace(/\\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}
function extractSection(decoded, id, nextId = null) {
  const marker = `"id":"${id}"`;
  const start = decoded.indexOf(marker);
  if (start < 0) return '';
  if (!nextId) return decoded.slice(start);
  const endMarker = `"id":"${nextId}"`;
  const end = decoded.indexOf(endMarker, start + marker.length);
  return end >= 0 ? decoded.slice(start, end) : decoded.slice(start);
}

function extractInterchanges(decoded) {
  const section = extractSection(decoded, 'competitors-interchanges', 'applications');
  const out = [];
  const re = /"brand":"([^"]+)","partNumber":"([^"]+)"/g;
  let match;
  while ((match = re.exec(section))) {
    out.push({ brand: match[1], part_number: match[2] });
  }
  return out;
}

function extractApplications(decoded) {
  const section = extractSection(decoded, 'applications');
  const out = [];
  const re = /"year":"([^"]*)","make":"([^"]*)","model":"([^"]*)","engine":"([^"]*)"/g;
  let match;
  while ((match = re.exec(section))) {
    out.push({ year: match[1], make: match[2], model: match[3], engine: match[4] });
  }
  return out;
}

function expectedFilterType(partTypes) {
  const normalized = new Set((partTypes || []).map((x) => String(x).toLowerCase()));
  if (normalized.has('oil filter')) return 'oil';
  if (normalized.has('air filter')) return 'air';
  if (normalized.has('cabin air filter')) return 'cabin';
  if (normalized.has('fuel filter')) return 'fuel';
  return null;
}

function isFramBrand(value) {
  const brand = normalizeBrand(value);
  return brand === 'FRAM' || brand.startsWith('FRAM');
}

function isMannBrand(value) {
  const brand = normalizeBrand(value);
  return brand === 'MANN' || brand === 'MANNFILTER' || brand.startsWith('MANNFILTER');
}

async function fetchProductPage(code, attempts = 4) {
  const url = `https://www.pgfilters.com/product-catalog/product-page/${encodeURIComponent(String(code).toLowerCase())}/`;
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'accept': 'text/html,application/xhtml+xml',
          'user-agent': 'ELIMFILTERS-HERMES-PremiumGuardResolver/1.0',
        },
      });
      const html = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!normalizeCode(html).includes(normalizeCode(code))) throw new Error('PRODUCT_CODE_NOT_PRESENT_IN_PAGE');
      return { url, html, decoded: decodeFlightHtml(html) };
    } catch (error) {
      last = error;
      if (attempt < attempts) await sleep(500 * attempt);
    }
  }
  throw last;
}
async function loadDbContext(client) {
  const identities = await client.query(`
    SELECT
      i.elimfilters_sku,
      i.origin_group,
      i.canonical_brand,
      i.canonical_part_number,
      i.filter_type AS identity_filter_type,
      c.filter_type AS catalog_filter_type,
      c.duty,
      c.technology,
      'CANONICAL_IDENTITY'::text AS match_source
    FROM ld_catalog.ld_canonical_product_identity i
    JOIN public.elimfilters_catalog c ON c.sku=i.elimfilters_sku
    WHERE i.status='ACTIVE'
      AND c.duty='LIGHT_DUTY'
  `);

  const relational = await client.query(`
    SELECT
      r.elimfilters_sku,
      NULL::text AS origin_group,
      r.competitor_brand AS canonical_brand,
      r.competitor_part_number AS canonical_part_number,
      NULL::text AS identity_filter_type,
      c.filter_type AS catalog_filter_type,
      c.duty,
      c.technology,
      'RELATIONAL_COMPETITOR'::text AS match_source
    FROM ld_catalog.ld_competitor_cross_references r
    JOIN public.elimfilters_catalog c ON c.sku=r.elimfilters_sku
    WHERE c.duty='LIGHT_DUTY'
  `);

  const publicRefs = await client.query(`
    SELECT
      c.sku AS elimfilters_sku,
      NULL::text AS origin_group,
      COALESCE(x->>'manufacturer',x->>'brand','') AS canonical_brand,
      COALESCE(x->>'code',x->>'part_number',x->>'reference','') AS canonical_part_number,
      NULL::text AS identity_filter_type,
      c.filter_type AS catalog_filter_type,
      c.duty,
      c.technology,
      'PUBLIC_COMPETITOR'::text AS match_source
    FROM public.elimfilters_catalog c
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.competitor_codes,'[]'::jsonb)) x
    WHERE c.duty='LIGHT_DUTY'
  `);

  const canonicalIndex = new Map();
  const seen = new Set();
  for (const row of [...identities.rows, ...relational.rows, ...publicRefs.rows]) {
    const brandKey = isFramBrand(row.canonical_brand)
      ? 'FRAM'
      : isMannBrand(row.canonical_brand)
        ? 'MANNFILTER'
        : null;
    const codeKey = normalizeCode(row.canonical_part_number);
    if (!brandKey || !codeKey) continue;
    const key = brandKey + '|' + codeKey;
    const unique = key + '|' + row.elimfilters_sku + '|' + row.match_source;
    if (seen.has(unique)) continue;
    seen.add(unique);
    if (!canonicalIndex.has(key)) canonicalIndex.set(key, []);
    canonicalIndex.get(key).push(row);
  }

  const policies = await client.query(`
    SELECT make_key, origin_group, canonical_brand
    FROM ld_catalog.ld_vehicle_make_origin_policy
    WHERE active=true
  `);
  const makePolicies = policies.rows.map((row) => ({
    make_key: normalizeMake(row.make_key),
    origin_group: row.origin_group,
    canonical_brand: row.canonical_brand,
  }));

  return { canonicalIndex, makePolicies };
}

function originForMake(make, makePolicies) {
  const normalized = normalizeMake(make);
  if (!normalized) return null;
  const exact = makePolicies.find((p) => p.make_key === normalized);
  if (exact) return exact;
  return makePolicies.find((p) => normalized.startsWith(p.make_key + ' ')) || null;
}

function canonicalMatches(interchanges, canonicalIndex) {
  const out = [];
  for (const ref of interchanges) {
    const brand = isFramBrand(ref.brand) ? 'FRAM' : isMannBrand(ref.brand) ? 'MANNFILTER' : null;
    if (!brand) continue;
    const key = brand + '|' + normalizeCode(ref.part_number);
    for (const row of canonicalIndex.get(key) || []) {
      out.push({ ...row, interchange_brand: ref.brand, interchange_code: ref.part_number });
    }
  }
  return out;
}

function preferredExistingMatches(matches, expectedType) {
  const sameFamily = matches.filter((m) => {
    const targetType = String(m.catalog_filter_type || m.identity_filter_type || '').toLowerCase();
    return !expectedType || targetType === expectedType;
  });
  for (const source of ['CANONICAL_IDENTITY','RELATIONAL_COMPETITOR','PUBLIC_COMPETITOR']) {
    const rows = sameFamily.filter((m) => m.match_source === source);
    if (rows.length) return { rows, source, sameFamily, ignoredWrongFamily: matches.filter((m) => !sameFamily.includes(m)) };
  }
  return { rows: [], source: null, sameFamily, ignoredWrongFamily: matches.filter((m) => !sameFamily.includes(m)) };
}

function inferOrigin(applications, makePolicies) {
  const mapped = [];
  const unmapped = new Set();
  for (const app of applications) {
    const policy = originForMake(app.make, makePolicies);
    if (policy) mapped.push({ make: app.make, ...policy });
    else if (app.make) unmapped.add(app.make);
  }
  const origins = [...new Set(mapped.map((x) => x.origin_group))];
  return {
    origin_group:
      origins.length === 0 ? 'UNKNOWN' :
      origins.length === 1 ? origins[0] :
      'MIXED',
    mapped_makes: [...new Set(mapped.map((x) => x.make))].sort(),
    unmapped_makes: [...unmapped].sort(),
    expected_brand:
      origins.length === 1
        ? (origins[0] === 'EUROPEAN' ? 'MANN-FILTER' : 'FRAM')
        : null,
  };
}
function resolveOne({ item, interchanges, applications, dbContext, pageUrl, htmlHash }) {
  const expectedType = expectedFilterType(item.part_types);
  const allMatches = canonicalMatches(interchanges, dbContext.canonicalIndex);
  const preferred = preferredExistingMatches(allMatches, expectedType);
  const matches = preferred.rows;
  const uniqueSkus = [...new Set(matches.map((m) => m.elimfilters_sku))];
  const origin = inferOrigin(applications, dbContext.makePolicies);
  const framRefs = [...new Set(interchanges.filter((x) => isFramBrand(x.brand)).map((x) => x.part_number))];
  const mannRefs = [...new Set(interchanges.filter((x) => isMannBrand(x.brand)).map((x) => x.part_number))];

  let state;
  let targetSku = null;
  let canonicalBrand = null;
  let canonicalCode = null;
  let matchedReferenceBrand = null;
  let matchedReferenceCode = null;
  const reasons = [];

  if (uniqueSkus.length > 1) {
    state = 'CONFLICT_EXISTING_REFERENCE';
    reasons.push('MULTIPLE_EXISTING_SAME_FAMILY_SKUS');
    reasons.push('MATCH_SOURCE_' + preferred.source);
  } else if (uniqueSkus.length === 1) {
    const target = matches.find((m) => m.elimfilters_sku === uniqueSkus[0]);
    state = 'ENRICH_EXISTING_READY';
    targetSku = target.elimfilters_sku;
    matchedReferenceBrand = target.canonical_brand;
    matchedReferenceCode = target.canonical_part_number;
    if (target.match_source === 'CANONICAL_IDENTITY') {
      canonicalBrand = target.canonical_brand;
      canonicalCode = target.canonical_part_number;
    }
    reasons.push('EXISTING_' + target.match_source);
  } else if (origin.origin_group === 'MIXED') {
    state = 'MIXED_ORIGIN_REVIEW';
    reasons.push('APPLICATIONS_SPAN_MULTIPLE_ORIGIN_GROUPS');
  } else if (origin.origin_group === 'UNKNOWN') {
    state = 'ORIGIN_EVIDENCE_REQUIRED';
    reasons.push('NO_APPLICATION_MAKE_MATCHED_ORIGIN_POLICY');
  } else if (origin.unmapped_makes.length > 0) {
    state = 'ORIGIN_PARTIAL_REVIEW';
    reasons.push('UNMAPPED_APPLICATION_MAKES_PRESENT');
  } else {
    const refs = origin.origin_group === 'EUROPEAN' ? mannRefs : framRefs;
    canonicalBrand = origin.expected_brand;
    if (refs.length === 1) {
      state = 'CANONICAL_SOURCE_CANDIDATE';
      canonicalCode = refs[0];
      reasons.push('REQUIRES_OFFICIAL_CANONICAL_SOURCE_VERIFICATION');
    } else if (refs.length === 0) {
      state = 'AUTHORITY_REFERENCE_REQUIRED';
      reasons.push(`${origin.expected_brand}_INTERCHANGE_NOT_PRESENT`);
    } else {
      state = 'MULTIPLE_AUTHORITY_REFS_REVIEW';
      reasons.push(`MULTIPLE_${origin.expected_brand}_INTERCHANGES`);
    }
  }

  return {
    premium_guard_code: item.premium_guard_code,
    part_types: item.part_types,
    source_page: pageUrl,
    source_html_sha256: htmlHash,
    interchanges_count: interchanges.length,
    applications_count: applications.length,
    fram_refs: framRefs,
    mann_refs: mannRefs,
    inferred_origin_group: origin.origin_group,
    mapped_makes: origin.mapped_makes,
    unmapped_makes: origin.unmapped_makes,
    expected_canonical_brand: origin.expected_brand,
    existing_canonical_matches: matches,
    existing_reference_matches_all: allMatches,
    preferred_match_source: preferred.source,
    ignored_wrong_family_matches: preferred.ignoredWrongFamily,
    state,
    target_sku: targetSku,
    canonical_brand: canonicalBrand,
    canonical_code: canonicalCode,
    matched_reference_brand: matchedReferenceBrand,
    matched_reference_code: matchedReferenceCode,
    reasons,
  };
}
async function main() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const queuePath = path.resolve(argValue('queue'));
  if (!queuePath || !fs.existsSync(queuePath)) throw new Error('Missing --queue=<resolution-queue.json>');
  const concurrency = Math.max(1, Math.min(6, Number(argValue('concurrency', '4'))));
  const delayMs = Math.max(0, Number(argValue('delay-ms', '200')));
  const limit = Math.max(0, Number(argValue('limit', '0')));
  const resumeCheckpoint = argValue('resume-checkpoint');

  let queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
  if (!Array.isArray(queue)) throw new Error('queue must be a JSON array');
  if (limit > 0) queue = queue.slice(0, limit);

  const phaseKey = argValue('phase-key', argValue('sku')
    ? `PREMIUM_GUARD_SKU:${normalizeCode(argValue('sku'))}`
    : `PREMIUM_GUARD_QUEUE:${sha(queuePath).slice(0, 24)}`);

  const client = new Client({ connectionString: databaseUrl, ssl: false });
  await client.connect();
  await client.query('BEGIN');
  const lockResult = await client.query(
    'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS acquired',
    [phaseKey]
  );
  if (!lockResult.rows[0]?.acquired) {
    await client.query('ROLLBACK');
    await client.end();
    const error = new Error(`PHASE_ALREADY_ACTIVE phase_key=${phaseKey}`);
    error.code = 'PHASE_ALREADY_ACTIVE';
    throw error;
  }

  const dbContext = await loadDbContext(client);
  const preflightFingerprint = buildPreflightFingerprint(queue, dbContext);
  const stateDir = path.resolve(
    __dirname,
    '../../elimfilters-vault/91-private-evidence/premium-guard-gap-resolution/_state'
  );
  fs.mkdirSync(stateDir, { recursive: true });
  const statePath = path.join(stateDir, sha(phaseKey).slice(0, 32) + '.json');

  if (fs.existsSync(statePath)) {
    const prior = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    if (
      prior.preflight_fingerprint === preflightFingerprint &&
      ['COMPLETE', 'BLOCKED_WITH_REASON'].includes(prior.terminal_state)
    ) {
      await client.query('COMMIT');
      await client.end();
      console.log('[premium-guard-resolver] REUSED_PREVIOUS_PREFLIGHT ' + JSON.stringify({
        phase_key: phaseKey,
        preflight_fingerprint: preflightFingerprint,
        terminal_state: prior.terminal_state,
        collision_signature: prior.collision_signature || null,
        state_path: statePath,
      }));
      return;
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.resolve(__dirname, '../../elimfilters-vault/91-private-evidence/premium-guard-gap-resolution', stamp);
  fs.mkdirSync(reportDir, { recursive: true });

  const results = new Array(queue.length);
  const errors = [];
  const queueIndexByCode = new Map(queue.map((item, index) => [normalizeCode(item.premium_guard_code), index]));

  if (resumeCheckpoint) {
    const checkpointPath = path.resolve(resumeCheckpoint);
    if (!fs.existsSync(checkpointPath)) throw new Error('resume-checkpoint not found: ' + checkpointPath);
    const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
    for (const row of checkpoint.results || []) {
      if (!row || row.state === 'FETCH_OR_PARSE_ERROR') continue;
      const index = queueIndexByCode.get(normalizeCode(row.premium_guard_code));
      if (Number.isInteger(index)) results[index] = row;
    }
    console.log(`[premium-guard-resolver] resumed ${results.filter(Boolean).length}/${queue.length} good rows from checkpoint`);
  }

  const pendingIndices = queue.map((_, index) => index).filter((index) => !results[index]);
  let pendingCursor = 0;
  let completed = results.filter(Boolean).length;

  async function worker() {
    while (true) {
      const pendingPosition = pendingCursor++;
      if (pendingPosition >= pendingIndices.length) return;
      const index = pendingIndices[pendingPosition];
      const item = queue[index];
      try {
        if (delayMs) await sleep(delayMs);
        const page = await fetchProductPage(item.premium_guard_code);
        const interchanges = extractInterchanges(page.decoded);
        const applications = extractApplications(page.decoded);
        results[index] = resolveOne({
          item,
          interchanges,
          applications,
          dbContext,
          pageUrl: page.url,
          htmlHash: sha(page.html),
        });
      } catch (error) {
        errors.push({ code: item.premium_guard_code, error: error.message });
        results[index] = {
          premium_guard_code: item.premium_guard_code,
          part_types: item.part_types,
          state: 'FETCH_OR_PARSE_ERROR',
          reasons: [error.message],
        };
      }
      completed += 1;
      if (completed % 25 === 0 || completed === queue.length) {
        const partial = results.filter(Boolean);
        fs.writeFileSync(path.join(reportDir, 'checkpoint.json'), JSON.stringify({
          completed,
          total: queue.length,
          errors,
          results: partial,
        }, null, 2));
        console.log(`[premium-guard-resolver] ${completed}/${queue.length}; errors=${errors.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));

  const finalResults = results.filter(Boolean);
  const counts = {};
  for (const row of finalResults) counts[row.state] = (counts[row.state] || 0) + 1;

  const terminalState = errors.length === 0 ? 'COMPLETE' : 'BLOCKED_WITH_REASON';
  const collisionsHash = collisionSignature(finalResults);
  const summary = {
    phase: 'PHASE_2A_PREMIUM_GUARD_CANONICAL_RESOLUTION',
    status: errors.length === 0 ? 'COMPLETE' : 'INCOMPLETE_FAIL_CLOSED',
    terminal_state: terminalState,
    phase_key: phaseKey,
    preflight_fingerprint: preflightFingerprint,
    collision_signature: collisionsHash,
    generated_at: new Date().toISOString(),
    queue_source: queuePath,
    queue_size: queue.length,
    resolved_rows: finalResults.length,
    errors: errors.length,
    states: counts,
    next_phase: 'Apply ENRICH_EXISTING_READY through catalog-write-gateway; verify CANONICAL_SOURCE_CANDIDATE against official FRAM/MANN before SKU creation.',
  };

  fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(finalResults, null, 2));
  fs.writeFileSync(path.join(reportDir, 'enrich-existing-ready.json'), JSON.stringify(finalResults.filter((r) => r.state === 'ENRICH_EXISTING_READY'), null, 2));
  fs.writeFileSync(path.join(reportDir, 'canonical-source-candidates.json'), JSON.stringify(finalResults.filter((r) => r.state === 'CANONICAL_SOURCE_CANDIDATE'), null, 2));
  fs.writeFileSync(path.join(reportDir, 'review-required.json'), JSON.stringify(finalResults.filter((r) => !['ENRICH_EXISTING_READY','CANONICAL_SOURCE_CANDIDATE'].includes(r.state)), null, 2));

  fs.writeFileSync(statePath, JSON.stringify({ phase_key: phaseKey, preflight_fingerprint: preflightFingerprint, collision_signature: collisionsHash, terminal_state: terminalState, report_dir: reportDir, summary_file: path.join(reportDir, 'summary.json'), results_file: path.join(reportDir, 'results.json'), completed_at: summary.generated_at }, null, 2));

  await client.query('COMMIT');
  await client.end();
  console.log('[premium-guard-resolver] SUMMARY ' + JSON.stringify(summary));
  console.log('[premium-guard-resolver] REPORT_DIR ' + reportDir);
  if (errors.length) throw new Error(`RESOLUTION_INCOMPLETE errors=${errors.length}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[premium-guard-resolver] FAILED', error.stack || error.message);
    process.exit(1);
  });
}

module.exports = { stableJson, buildPreflightFingerprint, collisionSignature };
