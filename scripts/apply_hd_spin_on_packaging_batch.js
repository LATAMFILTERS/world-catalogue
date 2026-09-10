'use strict';

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const {
  policyFromEnv,
  selectCase,
  isProtectedPackaging,
  round,
} = require('./lib/hd_packaging_policy');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const batchArg = args.find((arg) => arg.startsWith('--batch='));
if (!batchArg) {
  console.error('Usage: node scripts/apply_hd_spin_on_packaging_batch.js --batch=<path-to-json> [--apply]');
  process.exit(1);
}

const batchPath = path.resolve(batchArg.slice('--batch='.length));
const POLICY = policyFromEnv();
const PROTECTED_SOURCES = new Set(['PLANT_CONFIRMED', 'MANUFACTURER_DOCUMENTATION']);
const ACCEPTED_EVIDENCE_TYPES = new Set([
  'OFFICIAL_SOURCE_SCRAPE',
  'MANUFACTURER_DOCUMENTATION',
]);

function finitePositive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cartonGrossWeightKg(box, netWeightKg) {
  const gsm = Number(process.env.HD_CORRUGATED_BOARD_GSM || 650);
  const shrinkKg = Number(process.env.HD_SHRINK_WRAP_WEIGHT_KG || 0.05);
  const allowanceKg = Number(process.env.HD_PACKING_ALLOWANCE_WEIGHT_KG || 0.10);
  const l = box.master_carton_length_cm / 100;
  const w = box.master_carton_width_cm / 100;
  const h = box.master_carton_height_cm / 100;
  const surfaceM2 = 2 * ((l * w) + (l * h) + (w * h));
  const boardKg = surfaceM2 * gsm / 1000;
  const tareKg = boardKg + shrinkKg + allowanceKg;
  return {
    board_gsm: gsm,
    board_weight_kg: round(boardKg, 3),
    shrink_weight_kg: round(shrinkKg, 3),
    packing_allowance_weight_kg: round(allowanceKg, 3),
    tare_weight_kg: round(tareKg, 3),
    gross_weight_kg: round(netWeightKg + tareKg, 3),
  };
}

function validateEvidence(row) {
  const evidence = row.evidence_required || {};
  const sourceUrl = String(evidence.source_url || '').trim();
  const sourceType = String(evidence.source_type || '').trim();

  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
    return { ok: false, reason: 'missing/invalid source_url' };
  }
  if (!ACCEPTED_EVIDENCE_TYPES.has(sourceType)) {
    return { ok: false, reason: `unsupported source_type ${sourceType || '(empty)'}` };
  }

  const enriched = {
    unit_packaged_length_cm: finitePositive(evidence.unit_packaged_length_cm),
    unit_packaged_width_cm: finitePositive(evidence.unit_packaged_width_cm),
    unit_packaged_height_cm: finitePositive(evidence.unit_packaged_height_cm),
    unit_packaged_weight_kg: finitePositive(evidence.unit_packaged_weight_kg),
    unit_packaged_volume_m3: finitePositive(evidence.unit_packaged_volume_m3),
  };

  const required = [
    'unit_packaged_length_cm',
    'unit_packaged_width_cm',
    'unit_packaged_height_cm',
    'unit_packaged_weight_kg',
  ];
  const missing = required.filter((field) => !enriched[field]);
  if (missing.length) return { ok: false, reason: `evidence incomplete: ${missing.join(', ')}` };

  return { ok: true, sourceUrl, sourceType, enriched, notes: String(evidence.notes || '').trim() || null };
}

(async () => {
  const payload = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  if (!Array.isArray(payload.rows)) throw new Error('Batch JSON must contain rows[]');

  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const report = {
    batch: path.basename(batchPath),
    family: payload.family || null,
    dry_run: !APPLY,
    processed: 0,
    ready: [],
    skipped_protected: [],
    rejected_evidence: [],
    rejected_policy: [],
    updated: [],
  };

  try {
    await pool.query('BEGIN');

    for (const item of payload.rows) {
      report.processed += 1;
      const dbResult = await pool.query(`
        SELECT
          sku, duty, filter_type, technology,
          unit_packaged_length_cm, unit_packaged_width_cm, unit_packaged_height_cm,
          unit_packaged_weight_kg, unit_packaged_volume_m3,
          units_per_case,
          packaging_type, packaging_source, packaging_validation_status, packaging_notes
        FROM elimfilters_catalog
        WHERE sku = $1
        FOR UPDATE
      `, [item.sku]);

      if (dbResult.rowCount !== 1) {
        report.rejected_evidence.push({ sku: item.sku, reason: 'SKU not found or not unique' });
        continue;
      }

      const current = dbResult.rows[0];
      if (current.duty !== 'HEAVY_DUTY') {
        report.rejected_evidence.push({ sku: item.sku, reason: `duty is ${current.duty}, expected HEAVY_DUTY` });
        continue;
      }

      if (isProtectedPackaging(current) || PROTECTED_SOURCES.has(current.packaging_source)) {
        report.skipped_protected.push({ sku: item.sku, packaging_source: current.packaging_source });
        continue;
      }

      const validation = validateEvidence(item);
      if (!validation.ok) {
        report.rejected_evidence.push({ sku: item.sku, reason: validation.reason });
        continue;
      }

      const candidate = {
        ...current,
        unit_packaged_length_cm: current.unit_packaged_length_cm || validation.enriched.unit_packaged_length_cm,
        unit_packaged_width_cm: current.unit_packaged_width_cm || validation.enriched.unit_packaged_width_cm,
        unit_packaged_height_cm: current.unit_packaged_height_cm || validation.enriched.unit_packaged_height_cm,
        unit_packaged_weight_kg: current.unit_packaged_weight_kg || validation.enriched.unit_packaged_weight_kg,
        unit_packaged_volume_m3: current.unit_packaged_volume_m3 || validation.enriched.unit_packaged_volume_m3,
      };

      const calculation = selectCase(candidate, POLICY);
      if (!calculation.selected) {
        report.rejected_policy.push({ sku: item.sku, reason: calculation.reason, evaluations: calculation.evaluations });
        continue;
      }

      const selected = calculation.selected;
      const box = selected.selected_arrangement;
      const gross = cartonGrossWeightKg(box, selected.estimated_net_weight_kg);
      const proposal = {
        sku: item.sku,
        units_per_case: selected.qty,
        unit_packaged_length_cm: Number(candidate.unit_packaged_length_cm),
        unit_packaged_width_cm: Number(candidate.unit_packaged_width_cm),
        unit_packaged_height_cm: Number(candidate.unit_packaged_height_cm),
        unit_packaged_weight_kg: Number(candidate.unit_packaged_weight_kg),
        unit_packaged_volume_m3: candidate.unit_packaged_volume_m3 ? Number(candidate.unit_packaged_volume_m3) : null,
        master_carton_length_cm: box.master_carton_length_cm,
        master_carton_width_cm: box.master_carton_width_cm,
        master_carton_height_cm: box.master_carton_height_cm,
        master_carton_net_weight_kg: selected.estimated_net_weight_kg,
        master_carton_gross_weight_kg: gross.gross_weight_kg,
        master_carton_volume_m3: box.master_carton_volume_m3,
        selected_grid: box.grid,
        source_url: validation.sourceUrl,
        evidence_source_type: validation.sourceType,
        gross_weight_method: gross,
      };

      report.ready.push(proposal);

      if (APPLY) {
        const note = [
          'HD spin-on packaging enrichment',
          `family=${payload.family || 'unknown'}`,
          `source=${validation.sourceUrl}`,
          `evidence=${validation.sourceType}`,
          `allowed_qty=${POLICY.allowed_case_qty.join('/')}`,
          `selected_grid=${box.grid.join('x')}`,
          `gross_weight_board_gsm=${gross.board_gsm}`,
          'factory confirmation required before production release',
          validation.notes,
        ].filter(Boolean).join('; ');

        await pool.query(`
          UPDATE elimfilters_catalog
          SET
            unit_packaged_length_cm = COALESCE(unit_packaged_length_cm, $1),
            unit_packaged_width_cm = COALESCE(unit_packaged_width_cm, $2),
            unit_packaged_height_cm = COALESCE(unit_packaged_height_cm, $3),
            unit_packaged_weight_kg = COALESCE(unit_packaged_weight_kg, $4),
            unit_packaged_volume_m3 = COALESCE(unit_packaged_volume_m3, $5),
            units_per_case = $6,
            master_carton_length_cm = $7,
            master_carton_width_cm = $8,
            master_carton_height_cm = $9,
            master_carton_net_weight_kg = $10,
            master_carton_gross_weight_kg = $11,
            master_carton_volume_m3 = $12,
            packaging_type = 'HD_SHRINK_WRAPPED_MASTER_CARTON',
            packaging_source = 'OFFICIAL_SOURCE_SCRAPE',
            packaging_source_url = $13,
            packaging_validation_status = 'CALCULATED_PENDING_FACTORY_CONFIRMATION',
            packaging_validated_at = NOW(),
            packaging_notes = CASE
              WHEN COALESCE(packaging_notes, '') = '' THEN $14
              WHEN packaging_notes LIKE '%' || $13 || '%' THEN packaging_notes
              ELSE packaging_notes || ' | ' || $14
            END
          WHERE sku = $15
            AND COALESCE(packaging_source, '') NOT IN ('PLANT_CONFIRMED', 'MANUFACTURER_DOCUMENTATION')
        `, [
          proposal.unit_packaged_length_cm,
          proposal.unit_packaged_width_cm,
          proposal.unit_packaged_height_cm,
          proposal.unit_packaged_weight_kg,
          proposal.unit_packaged_volume_m3,
          proposal.units_per_case,
          proposal.master_carton_length_cm,
          proposal.master_carton_width_cm,
          proposal.master_carton_height_cm,
          proposal.master_carton_net_weight_kg,
          proposal.master_carton_gross_weight_kg,
          proposal.master_carton_volume_m3,
          proposal.source_url,
          note,
          proposal.sku,
        ]);

        report.updated.push(proposal.sku);
      }
    }

    if (APPLY) await pool.query('COMMIT');
    else await pool.query('ROLLBACK');

    report.summary = {
      processed: report.processed,
      ready: report.ready.length,
      skipped_protected: report.skipped_protected.length,
      rejected_evidence: report.rejected_evidence.length,
      rejected_policy: report.rejected_policy.length,
      updated: report.updated.length,
    };
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
