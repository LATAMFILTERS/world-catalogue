'use strict';

/**
 * Carga UNICA de datos de empaque de Dai (VOOLCO) en la ficha interna del SKU.
 * Fuente: data/dai/packaging-voolco-rfq-ve-20261102.json (extraido del xlsx de Dai; sha256 dentro del JSON).
 * Tabla nueva catalog_packaging (no toca elimfilters_catalog, precios, login ni aislamiento por distribuidor).
 * Inamovible: trigger bloquea UPDATE/DELETE salvo que la sesion declare la fuente del cambio
 * (SET LOCAL elim.packaging_change_source = '<archivo de Dai>'); cada cambio queda en catalog_packaging_changes.
 * Solo se cargan estados COMPLETO / PARCIAL / SIN_DATOS. Los CONFLICTO NO se cargan hasta decision del operador.
 * Dry-run por defecto (ROLLBACK). --execute confirma. Sin DATABASE_URL solo valida el JSON.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const doc = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/dai/packaging-voolco-rfq-ve-20261102.json'), 'utf8'));
const LOADABLE = new Set(['COMPLETO', 'PARCIAL', 'SIN_DATOS']);
const FIELDS = ['pcs_per_box', 'gross_kg_per_box', 'net_kg_per_box', 'box_length_cm', 'box_width_cm', 'box_height_cm', 'cbm_per_box', 'cbm_per_unit', 'moq_pcs'];

const DDL = `
CREATE TABLE IF NOT EXISTS catalog_packaging (
  sku TEXT PRIMARY KEY,
  supplier TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('COMPLETO','PARCIAL','SIN_DATOS')),
  codigo_base TEXT,
  pcs_per_box INT, gross_kg_per_box NUMERIC, net_kg_per_box NUMERIC,
  box_length_cm NUMERIC, box_width_cm NUMERIC, box_height_cm NUMERIC,
  cbm_per_box NUMERIC, cbm_per_unit NUMERIC, moq_pcs INT,
  source_file TEXT NOT NULL, source_sha256 TEXT NOT NULL, source_sheet TEXT, source_row INT,
  notes TEXT, loaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS catalog_packaging_changes (
  id BIGSERIAL PRIMARY KEY, sku TEXT NOT NULL, op TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(), source_file TEXT NOT NULL,
  old_row JSONB, new_row JSONB
);
CREATE OR REPLACE FUNCTION catalog_packaging_guard() RETURNS trigger AS $$
DECLARE src TEXT := current_setting('elim.packaging_change_source', true);
BEGIN
  IF src IS NULL OR src = '' THEN
    RAISE EXCEPTION 'catalog_packaging es inamovible: solo cambia con un dato nuevo de Dai (declarar elim.packaging_change_source)';
  END IF;
  IF TG_OP = 'DELETE' THEN
    INSERT INTO catalog_packaging_changes(sku, op, source_file, old_row) VALUES (OLD.sku, TG_OP, src, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  INSERT INTO catalog_packaging_changes(sku, op, source_file, old_row, new_row) VALUES (OLD.sku, TG_OP, src, to_jsonb(OLD), to_jsonb(NEW));
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS catalog_packaging_guard_trg ON catalog_packaging;
CREATE TRIGGER catalog_packaging_guard_trg BEFORE UPDATE OR DELETE ON catalog_packaging
  FOR EACH ROW EXECUTE FUNCTION catalog_packaging_guard();`;

function validate(items) {
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.sku)) throw new Error(`SKU duplicado ${it.sku}`);
    seen.add(it.sku);
    if (it.status === 'SIN_DATOS') {
      if (FIELDS.some((f) => it[f] != null)) throw new Error(`${it.sku}: SIN_DATOS no puede traer valores`);
      continue;
    }
    if (!LOADABLE.has(it.status)) continue;
    for (const f of ['pcs_per_box', 'box_length_cm', 'box_width_cm', 'box_height_cm', 'cbm_per_box', 'cbm_per_unit']) {
      if (!(it[f] > 0)) throw new Error(`${it.sku}: falta ${f}`);
    }
    const cbm = (it.box_length_cm * it.box_width_cm * it.box_height_cm) / 1e6;
    if (Math.abs(cbm - it.cbm_per_box) > 1e-5) throw new Error(`${it.sku}: CBM no cuadra con medidas`);
    const hasW = it.gross_kg_per_box != null && it.net_kg_per_box != null;
    if ((it.status === 'COMPLETO') !== hasW) throw new Error(`${it.sku}: estado ${it.status} incoherente con pesos`);
  }
}

(async () => {
  validate(doc.items);
  const load = doc.items.filter((i) => LOADABLE.has(i.status));
  const held = doc.items.filter((i) => !LOADABLE.has(i.status));
  const count = (s) => doc.items.filter((i) => i.status === s).length;
  console.log(`JSON valido: ${doc.items.length} SKU | COMPLETO ${count('COMPLETO')} | PARCIAL ${count('PARCIAL')} | SIN_DATOS ${count('SIN_DATOS')} | CONFLICTO (no se carga) ${held.length}: ${held.map((h) => h.sku).join(', ')}`);
  if (!process.env.DATABASE_URL) { console.log('Sin DATABASE_URL: solo validacion.'); return; }

  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    await c.query('BEGIN');
    await c.query(DDL);
    const skus = load.map((i) => i.sku);
    const cat = await c.query('SELECT sku, codigo_base FROM elimfilters_catalog WHERE sku = ANY($1)', [skus]);
    const base = new Map(cat.rows.map((r) => [r.sku, r.codigo_base]));
    const missing = skus.filter((s) => !base.has(s));
    if (missing.length) throw new Error(`SKU no existen en el catalogo (STOP_REVIEW): ${missing.join(', ')}`);
    for (const it of load) {
      await c.query(
        `INSERT INTO catalog_packaging (sku, supplier, status, codigo_base, ${FIELDS.join(', ')}, source_file, source_sha256, source_sheet, source_row, notes)
         VALUES ($1,$2,$3,$4,${FIELDS.map((_, k) => `$${k + 5}`).join(',')},$${FIELDS.length + 5},$${FIELDS.length + 6},$${FIELDS.length + 7},$${FIELDS.length + 8},$${FIELDS.length + 9})
         ON CONFLICT (sku) DO NOTHING`,
        [it.sku, doc.supplier, it.status, base.get(it.sku), ...FIELDS.map((f) => it[f] ?? null), doc.source_file, doc.source_sha256, it.source_sheet, it.source_row, it.notes || null],
      );
    }
    const r = await c.query('SELECT status, count(*) FROM catalog_packaging GROUP BY 1 ORDER BY 1');
    console.table(r.rows);
    await c.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(APPLY ? 'COMMIT' : 'DRY-RUN (ROLLBACK). Usar --execute para confirmar.');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    await c.end();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
