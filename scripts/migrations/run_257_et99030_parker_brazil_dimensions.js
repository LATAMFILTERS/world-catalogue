'use strict';

/**
 * ET99030 (Parker R9030MB): load the dimensions from Parker Brazil's product
 * page for R90-30MB.
 * https://ph.parker.com/br/es/product/racor-spin-on-fuel-filter-br/r90-30mb
 *
 * The page refuses automated reading (403), so the "Especificaciones técnicas"
 * table was copied from it by the operator on 2026-10-12 and is stored whole
 * in the evidence row. Values used:
 *   Valor de filtración (micras)  30                 (already on the row; must match)
 *   Longitud                      160.0              (printed without a unit; the
 *                                                     package is 115 x 115 x 165 mm)
 *   Diámetro exterior             111.5 mm
 *   Tamaño de rosca               1" - 12 UNF - 2B
 *
 * The three OEM codes on the page (Hyundai, Mercedes-Benz, Iveco) are kept in
 * the evidence only; they are not added to the row's crosses here.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const MIGRATION = 'run_257_et99030_parker_brazil_dimensions';
const SKU = 'ET99030';
const BASE = 'R9030MB';
const URL = 'https://ph.parker.com/br/es/product/racor-spin-on-fuel-filter-br/r90-30mb';
const VERIFIED_AT = '2026-10-12T00:00:00.000Z';

// "Especificaciones técnicas" as copied from the page by the operator
const PAGE = {
  'Código OEM': 'Hyundai 11LB-20310BR | Mercedes-Benz A4570920001KZ | Iveco 7147701',
  'Marca': 'Parker',
  'División': 'Parker Brazil - Filtration',
  'Valor de filtración (micras)': '30',
  'Industria': 'Linha pesada Transportes, Caminhões e Ônibus',
  'Longitud': '160.0',
  'Tecnología': 'Filtration',
  'Tamaño de rosca': '1" - 12 UNF - 2B',
  'Incluye': "Gaskets: [1], O'ring [1]",
  'Tipo de productos': 'Elemento de Reposição',
  'Peso (por unidad de medida)': '0.7800',
  'Tipo de pieza': 'Pré Filtro / Separador de água',
  'Material de embalaje': 'Caixa individual - (C x L x A) [mm] 115 x 115 x 165',
  'Aplicación': 'Iveco; Mercedes Benz; Benz',
  'Piezas relacionadas': 'Base Sem Bomba: KR-5030, Base Com Bomba: KR-5025, Copo Transparente: KR-27004CS',
  'Dirección de flujo': 'Normal Flow',
  'Diámetro exterior': '111.5 mm',
  'Cantidad por caja': '6',
};
const HEIGHT_MM = Number(PAGE['Longitud']);
const DIAMETER_MM = parseFloat(PAGE['Diámetro exterior']);
const THREAD = '1-12 UNF-2B';
const MICRON = Number(PAGE['Valor de filtración (micras)']);

(async () => {
  if (HEIGHT_MM !== 160 || DIAMETER_MM !== 111.5 || MICRON !== 30) throw new Error('SELF_CHECK_PAGE_VALUES');

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();

  try {
    await db.query('BEGIN');
    const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU]);
    if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${SKU}`);
    const row = found.rows[0];
    if (row.codigo_base !== BASE) throw new Error(`BASE_CHANGED: found ${row.codigo_base}`);
    if (parseInt(row.micron_rating, 10) !== MICRON) throw new Error(`MICRON_MISMATCH: ${row.micron_rating} vs ${MICRON}`);
    // only fills what is empty: a dimension loaded since the review is not overwritten
    if (row.height_mm !== null || row.outer_diameter_mm !== null || row.thread_size) throw new Error('DIMENSIONS_ALREADY_PRESENT');

    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET height_mm=$2, outer_diameter_mm=$3, thread_size=$4,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{dimension_review}', $5::jsonb)
       WHERE sku=$1
       RETURNING sku, codigo_base, micron_rating, height_mm, outer_diameter_mm, thread_size`,
      [SKU, HEIGHT_MM, DIAMETER_MM, THREAD, JSON.stringify({
        state: 'DIMENSIONS_FROM_PARKER_BRAZIL_PRODUCT_PAGE',
        source_url: URL,
        transcribed_by: 'OPERATOR',
        read_by_automation: false,
        note: 'Parker refuses automated reading (403); the specification table was copied from the page by the operator. "Longitud" is printed without a unit and is taken as millimetres (package 115 x 115 x 165 mm).',
        page_thread: PAGE['Tamaño de rosca'],
        migration: 'run_257',
        reviewed_at: '2026-10-12',
      })]);

    const hash = crypto.createHash('md5').update(`${MIGRATION}|${SKU}|${JSON.stringify(PAGE)}`).digest('hex');
    const ev = await db.query(
      `INSERT INTO public.catalog_codigo_base_evidence
         (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
       VALUES ($1, 'OFFICIAL_PRODUCT_PAGE', 'PARKER', 'PARKER', 'R90-30MB', $2, $3, $4, $5, $6::jsonb)
       ON CONFLICT DO NOTHING`,
      [SKU, BASE, URL, hash, VERIFIED_AT,
        JSON.stringify({ migration: MIGRATION, transcribed_by: 'OPERATOR', read_by_automation: false, specifications: PAGE })]);

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', row: u.rows[0], evidence_rows_added: ev.rowCount,
      transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
