#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;

function scoreSize(row) {
  const h = Number(row.height_mm || 0);
  const d = Number(row.outer_diameter_mm || 0);
  return h * d;
}

function nearestIndex(sorted, fraction) {
  if (!sorted.length) return -1;
  return Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * fraction)));
}

function uniquePush(target, seen, row, reason) {
  if (!row || seen.has(row.sku)) return;
  seen.add(row.sku);
  target.push({
    sku: row.sku,
    filter_type: row.filter_type,
    technology: row.technology ?? null,
    height_mm: row.height_mm,
    outer_diameter_mm: row.outer_diameter_mm,
    thread_size: row.thread_size ?? null,
    selection_reason: reason
  });
}

export async function selectSpinOnPilot({
  connectionString = process.env.DATABASE_URL,
  output = 'product-identity/hd-standard/pilots/spin-on-pilot.v1.json',
  poolFactory = (config) => new Pool(config)
} = {}) {
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const pool = poolFactory({
    connectionString,
    application_name: 'product-identity-spinon-pilot-selector',
    options: '-c default_transaction_read_only=on'
  });

  try {
    const result = await pool.query(`
      SELECT sku, filter_type, technology, duty, installation_type, attachment_type, sub_type,
             height_mm, outer_diameter_mm, thread_size
      FROM elimfilters_catalog
      WHERE COALESCE(UPPER(duty), 'HD') NOT LIKE '%LIGHT%'
        AND height_mm IS NOT NULL
        AND outer_diameter_mm IS NOT NULL
        AND thread_size IS NOT NULL
        AND (
          LOWER(COALESCE(installation_type, '')) LIKE '%spin%'
          OR LOWER(COALESCE(attachment_type, '')) LIKE '%spin%'
          OR LOWER(COALESCE(sub_type, '')) LIKE '%spin%'
        )
      ORDER BY sku
    `);

    const rows = result.rows
      .map((row) => ({ ...row, size_score: scoreSize(row) }))
      .sort((a, b) => a.size_score - b.size_score || String(a.sku).localeCompare(String(b.sku)));

    if (rows.length < 10) {
      throw new Error(`Need at least 10 verified HD spin-on SKUs with height, diameter and thread; found ${rows.length}`);
    }

    const selected = [];
    const seen = new Set();
    const quantiles = [0, 0.10, 0.22, 0.35, 0.50, 0.65, 0.78, 0.90, 1.0];

    for (const q of quantiles) {
      uniquePush(selected, seen, rows[nearestIndex(rows, q)], `size_quantile_${Math.round(q * 100)}`);
    }

    const widest = [...rows].sort((a, b) => Number(b.outer_diameter_mm) - Number(a.outer_diameter_mm))[0];
    uniquePush(selected, seen, widest, 'widest_verified_spin_on');

    for (const row of rows) {
      if (selected.length >= 10) break;
      uniquePush(selected, seen, row, 'coverage_fill');
    }

    const pilot = {
      pilot_id: 'HD_SPINON_PILOT_V1',
      status: 'selected_from_world_catalogue',
      source: 'postgresql.elimfilters_catalog',
      selection_rule: '10 verified HD spin-on SKUs spanning the dimensional range; no invented dimensions',
      generated_at: new Date().toISOString(),
      candidate_count: rows.length,
      sku_count: selected.length,
      skus: selected
    };

    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(pilot, null, 2)}\n`);
    return pilot;
  } finally {
    await pool.end();
  }
}

async function main() {
  const pilot = await selectSpinOnPilot();
  console.log(JSON.stringify(pilot, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`[spin-on pilot selector] ${error.message}`);
    process.exit(1);
  });
}
