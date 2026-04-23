require('dotenv').config();
const express = require('express');
const {Client} = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({charset: 'utf-8'}));
app.use(express.urlencoded({ extended: false })); // Twilio sends form-urlencoded
app.use(express.static('www')); // Serve static files from public/

// Import new routes
const chatRoutes = require('./routes/chat.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

// Middleware para encoding UTF-8 — solo rutas API, no archivos estáticos ni webhook
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: 'ballast.proxy.rlwy.net',
      port: 18263,
      database: 'railway',
      user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      client_encoding: 'UTF8',
      ssl: { rejectUnauthorized: false }
    };

function parseRefs(arr){
  if(!arr) return [];
  return arr.map(item => ({
    manufacturer: item.manufacturer || item.brand || 'UNKNOWN',
    code: item.code
  }));
}

function detectLang(req) {
  const langs = (req.headers['accept-language'] || '').toLowerCase()
    .split(',').map(l => l.split(';')[0].trim());
  return langs.some(l => l.startsWith('es')) ? 'es' : 'en';
}

function extractText(val, lang = 'en') {
  if (!val) return null;
  if (typeof val === 'object') return val[lang] || val.en || val.es || Object.values(val)[0] || null;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return p[lang] || p.en || p.es || Object.values(p)[0] || val; } catch { return val; }
  }
  return String(val);
}

function buildFilterData(row, lang = 'en'){
  return {
    elimfilters_sku: row.sku,
    codigo_base: row.codigo_base,
    description: extractText(row.description, lang),
    filter_type: extractText(row.filter_type, lang),
    filter_subtype: extractText(row.sub_type, lang) || null,
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

app.get('/api/status', (req, res) => {
  res.json({status: 'ok', version: '3.2.6'});
});

app.get('/api/filters/search/part', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    let result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE codigo_base = $1 LIMIT 1',
      [code]
    );

    if(result.rows.length === 0) {
      result = await client.query(
        'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
        [code]
      );
    }

    if(result.rows.length === 0) {
      // Búsqueda exacta en oem_codes y competitor_codes (formato {code/partNumber})
      result = await client.query(
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

    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/vin', async (req, res) => {
  const model = (req.query.model || '').trim().toUpperCase();
  const engine = req.query.engine ? req.query.engine.trim().toUpperCase() : null;

  if(!model) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model + '%');

    if(engine) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';

    const result = await client.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/equipment', async (req, res) => {
  const model = (req.query.model || '').trim().toUpperCase();
  const type = req.query.type ? req.query.type.trim().toUpperCase() : null;
  const engine = req.query.engine ? req.query.engine.trim().toUpperCase() : null;

  if(!model) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model + '%');

    if(type) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + type + '%');
    }

    if(engine) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';

    const result = await client.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

app.get('/api/filters/search/homologous', async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
      [code]
    );
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

// Temp: fix non-compliant SKU prefixes + add DB constraints
app.get('/api/migrate/fix-skus', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const renamed = {};

    const fixes = [
      { filter_type: 'Air Dryer',            old_like: 'EA1%', new_prefix: 'ED4' },
      { filter_type: 'Air Housing',           old_like: null,   new_prefix: 'EA2' },
      { filter_type: 'Coolant Filter',        old_like: 'EC1%', new_prefix: 'EW7' },
      { filter_type: 'Fuel Filter',           old_like: 'EL8%', new_prefix: 'EF9' },
      { filter_type: 'Fuel/Water Separator',  old_like: 'EF9%', new_prefix: 'ES9' },
      { filter_type: 'Oil Filter',            old_like: null,   new_prefix: 'EL8' },
      { filter_type: 'Turbina',               old_like: 'EF9%', new_prefix: 'ET9' },
    ];

    for (const f of fixes) {
      let where = `filter_type = $1 AND sku NOT LIKE '${f.new_prefix}%' AND LENGTH(sku) = 7`;
      const params = [f.filter_type];
      if (f.old_like) { where += ` AND sku LIKE $2`; params.push(f.old_like); }
      const r = await client.query(
        `UPDATE elimfilters_catalog SET sku = $${params.length + 1} || RIGHT(sku, 4) WHERE ${where} RETURNING sku`,
        [...params, f.new_prefix]
      );
      renamed[f.filter_type] = r.rowCount;
    }

    // filter_type CHECK constraint
    await client.query(`ALTER TABLE elimfilters_catalog DROP CONSTRAINT IF EXISTS chk_filter_type`);
    await client.query(`
      ALTER TABLE elimfilters_catalog ADD CONSTRAINT chk_filter_type
      CHECK (filter_type IN (
        'Air Dryer','Air Filter','Air Housing','Cabin Air Filter',
        'Coolant Filter','Fuel Filter','Fuel/Water Separator',
        'Hydraulic Filter','Kit Filter','Marine Filter','Oil Filter','Turbina'
      ))
    `);

    // SKU prefix + filter_type constraint (only for 7-char SKUs)
    await client.query(`ALTER TABLE elimfilters_catalog DROP CONSTRAINT IF EXISTS chk_sku_prefix`);
    await client.query(`
      ALTER TABLE elimfilters_catalog ADD CONSTRAINT chk_sku_prefix
      CHECK (LENGTH(sku) != 7 OR (
        (filter_type = 'Air Filter'           AND sku LIKE 'EA1%') OR
        (filter_type = 'Air Dryer'            AND sku LIKE 'ED4%') OR
        (filter_type = 'Air Housing'          AND sku LIKE 'EA2%') OR
        (filter_type = 'Hydraulic Filter'     AND sku LIKE 'EH6%') OR
        (filter_type = 'Oil Filter'           AND sku LIKE 'EL8%') OR
        (filter_type = 'Cabin Air Filter'     AND sku LIKE 'EC1%') OR
        (filter_type = 'Coolant Filter'       AND sku LIKE 'EW7%') OR
        (filter_type = 'Fuel Filter'          AND sku LIKE 'EF9%') OR
        (filter_type = 'Fuel/Water Separator' AND sku LIKE 'ES9%') OR
        (filter_type = 'Turbina'              AND sku LIKE 'ET9%') OR
        (filter_type = 'Marine Filter'        AND sku LIKE 'EM9%') OR
        (filter_type = 'Kit Filter'           AND (sku LIKE 'EK5%' OR sku LIKE 'EK3%'))
      ))
    `);

    // Show remaining 8-char SKUs for review
    const eightChar = await client.query(
      `SELECT sku, filter_type, codigo_base FROM elimfilters_catalog WHERE LENGTH(sku) = 8 LIMIT 20`
    );

    res.json({ success: true, renamed, constraints: 'added', eight_char_skus: eightChar.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: analyze SKU format compliance against new standard
app.get('/api/analyze/sku-compliance', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();

    // Check SKU length
    const lengthCheck = await client.query(`
      SELECT LENGTH(sku) as len, COUNT(*) as count
      FROM elimfilters_catalog
      GROUP BY LENGTH(sku) ORDER BY count DESC
    `);

    // Check prefix vs filter_type compliance
    const prefixCheck = await client.query(`
      SELECT filter_type, LEFT(sku,3) as prefix, COUNT(*) as count,
        CASE
          WHEN filter_type = 'Air Filter'           AND sku LIKE 'EA1%' THEN true
          WHEN filter_type = 'Air Dryer'            AND sku LIKE 'ED4%' THEN true
          WHEN filter_type = 'Air Housing'          AND sku LIKE 'EA2%' THEN true
          WHEN filter_type = 'Hydraulic Filter'     AND sku LIKE 'EH6%' THEN true
          WHEN filter_type = 'Oil Filter'           AND sku LIKE 'EL8%' THEN true
          WHEN filter_type = 'Cabin Air Filter'     AND sku LIKE 'EC1%' THEN true
          WHEN filter_type = 'Coolant Filter'       AND sku LIKE 'EW7%' THEN true
          WHEN filter_type = 'Fuel Filter'          AND sku LIKE 'EF9%' THEN true
          WHEN filter_type = 'Fuel/Water Separator' AND sku LIKE 'ES9%' THEN true
          WHEN filter_type = 'Turbina'              AND sku LIKE 'ET9%' THEN true
          WHEN filter_type = 'Marine Filter'        AND sku LIKE 'EM9%' THEN true
          WHEN filter_type = 'Kit Filter'           AND sku LIKE 'EK5%' THEN true
          WHEN filter_type = 'Kit Filter'           AND sku LIKE 'EK3%' THEN true
          ELSE false
        END as compliant
      FROM elimfilters_catalog
      GROUP BY filter_type, LEFT(sku,3), compliant
      ORDER BY filter_type, compliant DESC, count DESC
    `);

    const compliant = prefixCheck.rows.filter(r => r.compliant).reduce((s,r) => s + parseInt(r.count), 0);
    const nonCompliant = prefixCheck.rows.filter(r => !r.compliant).reduce((s,r) => s + parseInt(r.count), 0);

    res.json({
      sku_lengths: lengthCheck.rows,
      prefix_compliance: prefixCheck.rows,
      summary: { compliant, non_compliant: nonCompliant, total: compliant + nonCompliant }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Register new routes
app.use('/api', chatRoutes);
app.use('/webhook', whatsappRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with UTF-8 encoding`);
  console.log(`✅ Chatbot service running`);
  console.log(`✅ WhatsApp webhook listening on /webhook/whatsapp`);
});