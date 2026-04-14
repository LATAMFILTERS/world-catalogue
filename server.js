require('dotenv').config();
const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({charset: 'utf-8'}));

// Middleware para encoding UTF-8 en respuestas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Connection pool — reutiliza conexiones en lugar de crear una por request
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {rejectUnauthorized: false},
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('connect', client => {
  client.query("SET client_encoding = 'UTF8'").catch(() => {});
});

function parseRefs(arr){
  if(!arr) return [];
  return arr.map(item => ({
    manufacturer: item.manufacturer || item.brand || 'UNKNOWN',
    code: item.code
  }));
}

function buildFilterData(row){
  return {
    elimfilters_sku: row.sku,
    codigo_base: row.codigo_base,
    filter_type: row.filter_type || null,
    technology: row.technology || null,
    installation_type: row.installation_type || null,
    thread_size: row.thread_size || null,
    height_mm: row.height_mm || null,
    outer_diameter_mm: row.outer_diameter_mm || null,
    gasket_od_mm: row.gasket_od_mm || null,
    gasket_id_mm: row.gasket_id_mm || null,
    iso_test_method: row.iso_test_method || null,
    micron_rating: row.micron_rating || null,
    nominal_efficiency: row.nominal_efficiency || null,
    burst_pressure_psi: row.burst_pressure_psi || null,
    collapse_pressure_psi: row.collapse_pressure_psi || null,
    duty: row.duty || null,
    oem_codes: parseRefs(row.oem_codes),
    competitor_codes: parseRefs(row.competitor_codes),
    equipment_applications: row.equipment_applications || []
  };
}

// ─── Health ────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({status: 'ok', version: '4.0.0'});
});

// ─── Search by part / SKU / OEM / competitor code ─────────────────────────

app.get('/api/filters/search/part', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});

  try {
    let result = await pool.query(
      'SELECT * FROM elimfilters_catalog WHERE codigo_base = $1 LIMIT 1',
      [code]
    );

    if(result.rows.length === 0) {
      result = await pool.query(
        'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
        [code]
      );
    }

    if(result.rows.length === 0) {
      result = await pool.query(
        `SELECT * FROM elimfilters_catalog WHERE
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(oem_codes) elem
            WHERE UPPER(elem->>'code') = $1
               OR UPPER(elem->>'partNumber') = $1
               OR (jsonb_typeof(elem) = 'string' AND UPPER(elem#>>'{}') ~ ('^[^|]+\\|\\s*' || $1 || '$'))
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
            WHERE UPPER(elem->>'code') = $1
          )
        LIMIT 10`,
        [code]
      );
    }

    const filters = result.rows.map(row => buildFilterData(row));
    res.json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Bulk search — POST body: { codes: ["P553004", "BT839", ...] } ─────────

app.post('/api/filters/search/bulk', async (req, res) => {
  const codes = Array.isArray(req.body.codes) ? req.body.codes : [];
  if(codes.length === 0) return res.json({success: false, results: {}});
  if(codes.length > 50) return res.status(400).json({success: false, error: 'Max 50 codes per request'});

  const upper = codes.map(c => String(c).trim().toUpperCase());
  const results = {};

  try {
    // Exact matches on codigo_base / sku
    const byBase = await pool.query(
      `SELECT * FROM elimfilters_catalog WHERE codigo_base = ANY($1) OR sku = ANY($1)`,
      [upper]
    );

    for(const row of byBase.rows){
      const match = upper.find(c => c === row.codigo_base || c === row.sku);
      if(match) results[match] = buildFilterData(row);
    }

    // Remaining codes — search inside oem_codes / competitor_codes
    const remaining = upper.filter(c => !results[c]);
    if(remaining.length > 0){
      const byRef = await pool.query(
        `SELECT * FROM elimfilters_catalog WHERE
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(oem_codes) elem
            WHERE UPPER(elem->>'code') = ANY($1) OR UPPER(elem->>'partNumber') = ANY($1)
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
            WHERE UPPER(elem->>'code') = ANY($1)
          )`,
        [remaining]
      );

      for(const row of byRef.rows){
        const allCodes = [
          ...(row.oem_codes || []).map(o => (o.code || o.partNumber || '').toUpperCase()),
          ...(row.competitor_codes || []).map(c => (c.code || '').toUpperCase())
        ];
        const match = remaining.find(c => allCodes.includes(c));
        if(match && !results[match]) results[match] = buildFilterData(row);
      }
    }

    res.json({success: true, results, found: Object.keys(results).length, total: upper.length});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Cross-reference by competitor brand ──────────────────────────────────
// GET /api/filters/crossref?brand=FLEETGUARD&code=BT839

app.get('/api/filters/crossref', async (req, res) => {
  const brand = (req.query.brand || '').trim().toUpperCase();
  const code  = (req.query.code  || '').trim().toUpperCase();

  if(!brand && !code) return res.json({success: false, filters: []});

  try {
    let query, params;

    if(brand && code){
      query = `SELECT * FROM elimfilters_catalog WHERE
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
          WHERE UPPER(elem->>'manufacturer') = $1
            AND UPPER(elem->>'code') = $2
        ) LIMIT 20`;
      params = [brand, code];
    } else if(brand){
      query = `SELECT * FROM elimfilters_catalog WHERE
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
          WHERE UPPER(elem->>'manufacturer') = $1
        ) LIMIT 50`;
      params = [brand];
    } else {
      query = `SELECT * FROM elimfilters_catalog WHERE
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
          WHERE UPPER(elem->>'code') = $1
        ) LIMIT 10`;
      params = [code];
    }

    const result = await pool.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row));
    res.json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Search by VIN (vehicle model) ────────────────────────────────────────

app.get('/api/filters/search/vin', async (req, res) => {
  const model  = (req.query.model  || '').trim().toUpperCase();
  const engine = (req.query.engine || '').trim().toUpperCase() || null;

  if(!model) return res.json({success: false, filters: []});

  try {
    let query = `SELECT * FROM elimfilters_catalog WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model + '%');

    if(engine){
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';
    const result = await pool.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row));
    res.json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Search by equipment ───────────────────────────────────────────────────

app.get('/api/filters/search/equipment', async (req, res) => {
  const model  = (req.query.model  || '').trim().toUpperCase();
  const type   = (req.query.type   || '').trim().toUpperCase() || null;
  const engine = (req.query.engine || '').trim().toUpperCase() || null;

  if(!model) return res.json({success: false, filters: []});

  try {
    let query = `SELECT * FROM elimfilters_catalog WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model + '%');

    if(type){
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + type + '%');
    }

    if(engine){
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';
    const result = await pool.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row));
    res.json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Search by homologous SKU ──────────────────────────────────────────────

app.get('/api/filters/search/homologous', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});

  try {
    const result = await pool.query(
      'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
      [code]
    );
    const filters = result.rows.map(row => buildFilterData(row));
    res.json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Browse by filter type ─────────────────────────────────────────────────
// GET /api/filters/by-type/oil   or   /api/filters/by-type/air

app.get('/api/filters/by-type/:type', async (req, res) => {
  const type   = req.params.type.trim().toUpperCase();
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  try {
    const result = await pool.query(
      `SELECT * FROM elimfilters_catalog
       WHERE UPPER(filter_type) = $1
       ORDER BY sku
       LIMIT $2 OFFSET $3`,
      [type, limit, offset]
    );
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM elimfilters_catalog WHERE UPPER(filter_type) = $1',
      [type]
    );
    const filters = result.rows.map(row => buildFilterData(row));
    res.json({
      success: true,
      filter_type: type,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
      filters
    });
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Catalog statistics ────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const [total, byType, byDuty, withOem, withCrossref, withEquipment] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM elimfilters_catalog'),
      pool.query(
        `SELECT filter_type, COUNT(*) AS count
         FROM elimfilters_catalog
         GROUP BY filter_type
         ORDER BY count DESC`
      ),
      pool.query(
        `SELECT duty, COUNT(*) AS count
         FROM elimfilters_catalog
         GROUP BY duty
         ORDER BY count DESC`
      ),
      pool.query(
        `SELECT COUNT(*) FROM elimfilters_catalog
         WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0`
      ),
      pool.query(
        `SELECT COUNT(*) FROM elimfilters_catalog
         WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0`
      ),
      pool.query(
        `SELECT COUNT(*) FROM elimfilters_catalog
         WHERE equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0`
      )
    ]);

    res.json({
      success: true,
      total_filters: parseInt(total.rows[0].count),
      by_filter_type: byType.rows.map(r => ({type: r.filter_type, count: parseInt(r.count)})),
      by_duty: byDuty.rows.map(r => ({duty: r.duty, count: parseInt(r.count)})),
      with_oem_codes: parseInt(withOem.rows[0].count),
      with_competitor_codes: parseInt(withCrossref.rows[0].count),
      with_equipment_applications: parseInt(withEquipment.rows[0].count)
    });
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  }
});

// ─── Server ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} — ELIMFILTERS v4.0.0`);
});
