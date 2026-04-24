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
  res.json({status: 'ok', version: '3.3.0'});
});

// Temp: analyze SKU correctness (calculate expected SKU from codigo_base + filter_type)
app.get('/api/analyze/sku-correctness', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        id, sku, filter_type, codigo_base, duty,
        CASE filter_type
          WHEN 'Air Filter'            THEN 'EA1'
          WHEN 'Air Housing'           THEN 'EA2'
          WHEN 'Air Dryer'             THEN 'ED4'
          WHEN 'Hydraulic Filter'      THEN 'EH6'
          WHEN 'Oil Filter'            THEN 'EL8'
          WHEN 'Marine Filter'         THEN 'EM9'
          WHEN 'Fuel/Water Separator'  THEN 'ES9'
          WHEN 'Turbine Filter'        THEN 'ET9'
          WHEN 'Cabin Air Filter'      THEN 'EC1'
          WHEN 'Fuel Filter'           THEN 'EF9'
          WHEN 'Coolant Filter'        THEN 'EW7'
          WHEN 'Kit Filter'            THEN CASE WHEN duty = 'HD' THEN 'EK3' ELSE 'EK5' END
          ELSE NULL
        END AS expected_prefix,
        CASE filter_type
          -- Turbina FH: primeros 4 dígitos
          WHEN 'Turbine Filter' THEN
            (CASE WHEN codigo_base ILIKE '%FH%' THEN 'ET9' ELSE 'ET9' END) ||
            LPAD(SUBSTRING(REGEXP_REPLACE(codigo_base, '[^0-9]', '', 'g'), 1, 4), 4, '0')
          -- Otros: últimos 4 dígitos
          ELSE
            (CASE filter_type
              WHEN 'Air Filter'            THEN 'EA1'
              WHEN 'Air Housing'           THEN 'EA2'
              WHEN 'Air Dryer'             THEN 'ED4'
              WHEN 'Hydraulic Filter'      THEN 'EH6'
              WHEN 'Oil Filter'            THEN 'EL8'
              WHEN 'Marine Filter'         THEN 'EM9'
              WHEN 'Fuel/Water Separator'  THEN 'ES9'
              WHEN 'Cabin Air Filter'      THEN 'EC1'
              WHEN 'Fuel Filter'           THEN 'EF9'
              WHEN 'Coolant Filter'        THEN 'EW7'
              WHEN 'Kit Filter'            THEN CASE WHEN duty = 'HD' THEN 'EK3' ELSE 'EK5' END
              ELSE NULL
            END) || LPAD(RIGHT(REGEXP_REPLACE(codigo_base, '[^0-9]', '', 'g'), 4), 4, '0')
        END AS expected_sku
      FROM elimfilters_catalog
      WHERE filter_type IS NOT NULL AND codigo_base IS NOT NULL
      ORDER BY expected_sku LIMIT 50
    `);
    // Count mismatches
    const mismatches = result.rows.filter(r => r.sku !== r.expected_sku);
    res.json({
      success: true,
      total_checked: result.rows.length,
      mismatches_count: mismatches.length,
      sample_mismatches: mismatches.slice(0, 15)
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: analyze duplicate SKUs + calculate correct SKU for each codigo_base
app.get('/api/analyze/duplicate-skus-with-fix', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const dupes = await client.query(`
      SELECT
        c.sku,
        c.filter_type,
        c.codigo_base,
        c.duty,
        COUNT(*) OVER (PARTITION BY c.sku) as dup_count,
        CASE c.filter_type
          WHEN 'Air Filter'            THEN 'EA1'
          WHEN 'Air Housing'           THEN 'EA2'
          WHEN 'Air Dryer'             THEN 'ED4'
          WHEN 'Hydraulic Filter'      THEN 'EH6'
          WHEN 'Oil Filter'            THEN 'EL8'
          WHEN 'Marine Filter'         THEN 'EM9'
          WHEN 'Fuel/Water Separator'  THEN 'ES9'
          WHEN 'Turbine Filter'        THEN 'ET9'
          WHEN 'Cabin Air Filter'      THEN 'EC1'
          WHEN 'Fuel Filter'           THEN 'EF9'
          WHEN 'Coolant Filter'        THEN 'EW7'
          WHEN 'Kit Filter'            THEN CASE WHEN c.duty = 'HD' THEN 'EK3' ELSE 'EK5' END
          ELSE NULL
        END AS prefix,
        CASE c.filter_type
          WHEN 'Turbine Filter' THEN
            'ET9' || LPAD(SUBSTRING(REGEXP_REPLACE(c.codigo_base, '[^0-9]', '', 'g'), 1, 4), 4, '0')
          ELSE
            (CASE c.filter_type
              WHEN 'Air Filter'            THEN 'EA1'
              WHEN 'Air Housing'           THEN 'EA2'
              WHEN 'Air Dryer'             THEN 'ED4'
              WHEN 'Hydraulic Filter'      THEN 'EH6'
              WHEN 'Oil Filter'            THEN 'EL8'
              WHEN 'Marine Filter'         THEN 'EM9'
              WHEN 'Fuel/Water Separator'  THEN 'ES9'
              WHEN 'Cabin Air Filter'      THEN 'EC1'
              WHEN 'Fuel Filter'           THEN 'EF9'
              WHEN 'Coolant Filter'        THEN 'EW7'
              WHEN 'Kit Filter'            THEN CASE WHEN c.duty = 'HD' THEN 'EK3' ELSE 'EK5' END
              ELSE NULL
            END) || LPAD(RIGHT(REGEXP_REPLACE(c.codigo_base, '[^0-9]', '', 'g'), 4), 4, '0')
        END AS correct_sku
      FROM elimfilters_catalog c
      WHERE c.sku IN (
        SELECT sku FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1
      )
      ORDER BY c.sku, c.codigo_base
      LIMIT 100
    `);
    res.json({ success: true, total: dupes.rows.length, records: dupes.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: find duplicate SKUs
app.get('/api/analyze/duplicate-skus', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const dupes = await client.query(`
      SELECT sku, COUNT(*) as count, ARRAY_AGG(codigo_base) as codigo_bases
      FROM elimfilters_catalog
      GROUP BY sku
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    res.json({ success: true, duplicate_count: dupes.rows.length, duplicates: dupes.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: add UNIQUE constraint to sku column (after deduplicating)
app.get('/api/migrate/fix-sku-unique', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();

    // First, delete duplicate rows (keep only the first occurrence of each SKU)
    await client.query(`
      DELETE FROM elimfilters_catalog
      WHERE id NOT IN (
        SELECT MIN(id) FROM elimfilters_catalog GROUP BY sku
      )
    `);

    // Now add the UNIQUE constraint
    await client.query(`
      ALTER TABLE elimfilters_catalog
      ADD CONSTRAINT sku_unique UNIQUE (sku)
    `);
    res.json({ success: true, message: 'Duplicates removed and UNIQUE constraint added' });
  } catch(e) {
    if (e.message.includes('already exists')) {
      return res.json({ success: true, message: 'Constraint already exists' });
    }
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: create maintenance_kits and kit_components tables
app.get('/api/migrate/create-kit-tables', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_kits (
        kit_sku    VARCHAR(7) PRIMARY KEY,
        name       TEXT NOT NULL,
        equipment_ref TEXT,
        duty       VARCHAR(2) CHECK (duty IN ('HD','LD')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS kit_components (
        kit_sku    VARCHAR(7) REFERENCES maintenance_kits(kit_sku) ON DELETE CASCADE,
        filter_sku VARCHAR(7) REFERENCES elimfilters_catalog(sku),
        PRIMARY KEY (kit_sku, filter_sku)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_kit_components_filter
      ON kit_components(filter_sku)
    `);
    res.json({ success: true, message: 'Tables maintenance_kits and kit_components created' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// POST /api/kits — create a kit from filter SKUs + equipment name
app.post('/api/kits', async (req, res) => {
  const { name, equipment_ref, filter_skus } = req.body;
  if (!name || !Array.isArray(filter_skus) || filter_skus.length === 0)
    return res.status(400).json({ success: false, error: 'name and filter_skus[] required' });

  const client = new Client(dbConfig);
  try {
    await client.connect();

    // Determine duty from the first filter found
    const sample = await client.query(
      'SELECT duty FROM elimfilters_catalog WHERE sku = ANY($1) AND duty IS NOT NULL LIMIT 1',
      [filter_skus]
    );
    const duty = sample.rows[0]?.duty || 'LD';
    const prefix = duty === 'HD' ? 'EK3' : 'EK5';

    // Generate next kit SKU
    const last = await client.query(
      `SELECT kit_sku FROM maintenance_kits WHERE kit_sku LIKE $1 ORDER BY kit_sku DESC LIMIT 1`,
      [prefix + '%']
    );
    const nextNum = last.rows.length
      ? String(parseInt(last.rows[0].kit_sku.slice(3)) + 1).padStart(4, '0')
      : '0001';
    const kit_sku = prefix + nextNum;

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO maintenance_kits (kit_sku, name, equipment_ref, duty) VALUES ($1,$2,$3,$4)',
      [kit_sku, name, equipment_ref || null, duty]
    );
    for (const fsku of filter_skus) {
      await client.query(
        'INSERT INTO kit_components (kit_sku, filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [kit_sku, fsku.toUpperCase()]
      );
    }
    await client.query('COMMIT');

    res.status(201).json({ success: true, kit_sku, duty, name, equipment_ref, filter_skus });
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// GET /api/kits/:kit_sku — full kit details with all component filters
app.get('/api/kits/:kit_sku', async (req, res) => {
  const kit_sku = req.params.kit_sku.trim().toUpperCase();
  const lang = detectLang(req);
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const kit = await client.query(
      'SELECT * FROM maintenance_kits WHERE kit_sku = $1',
      [kit_sku]
    );
    if (!kit.rows.length) return res.status(404).json({ success: false, error: 'Kit not found' });

    const components = await client.query(
      `SELECT c.*, kc.kit_sku
       FROM elimfilters_catalog c
       JOIN kit_components kc ON kc.filter_sku = c.sku
       WHERE kc.kit_sku = $1`,
      [kit_sku]
    );

    res.json({
      success: true,
      kit: {
        kit_sku: kit.rows[0].kit_sku,
        name: kit.rows[0].name,
        equipment_ref: kit.rows[0].equipment_ref,
        duty: kit.rows[0].duty,
        filters: components.rows.map(row => buildFilterData(row, lang))
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// GET /api/filters/kits?sku=XXX — which kits contain this filter
app.get('/api/filters/kits', async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({ success: false, kits: [] });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT mk.kit_sku, mk.name, mk.equipment_ref, mk.duty
       FROM maintenance_kits mk
       JOIN kit_components kc ON kc.kit_sku = mk.kit_sku
       WHERE kc.filter_sku = $1`,
      [sku]
    );
    res.json({ success: true, kits: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: find SKUs for RAV4 2022 kit components
app.get('/api/search/rav4-kit-skus', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const oil = await client.query(`
      SELECT sku, name, thread_size FROM elimfilters_catalog
      WHERE filter_type = 'Oil Filter' AND sub_type = 'Spin-On'
      AND thread_size LIKE '%3/4%' LIMIT 3
    `);
    const air = await client.query(`
      SELECT sku, name, filter_type FROM elimfilters_catalog
      WHERE filter_type = 'Air Filter' AND sub_type = 'Primario'
      LIMIT 3
    `);
    const cabin = await client.query(`
      SELECT sku, name, filter_type FROM elimfilters_catalog
      WHERE filter_type = 'Cabin Air Filter' LIMIT 3
    `);
    res.json({
      oil_filter_candidates: oil.rows,
      air_filter_candidates: air.rows,
      cabin_filter_candidates: cabin.rows
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/filters/alternatives', async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({success: false, alternatives: []});

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const src = await client.query('SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1', [sku]);
    if (!src.rows.length) return res.json({success: true, alternatives: []});

    const f = src.rows[0];
    const params = [sku, f.filter_type, f.sub_type];
    let conditions = `sku != $1 AND filter_type = $2 AND sub_type = $3`;

    if (f.thread_size) {
      conditions += ` AND thread_size = $4`;
      params.push(f.thread_size);
    } else if (f.outer_diameter_mm) {
      conditions += ` AND ABS(COALESCE(outer_diameter_mm,0) - $4) <= 5`;
      params.push(f.outer_diameter_mm);
    } else if (f.height_mm) {
      conditions += ` AND ABS(COALESCE(height_mm,0) - $4) <= 10`;
      params.push(f.height_mm);
    }

    const result = await client.query(
      `SELECT sku, name FROM elimfilters_catalog WHERE ${conditions} LIMIT 6`,
      params
    );
    res.json({success: true, alternatives: result.rows});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
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


// Register new routes
app.use('/api', chatRoutes);
app.use('/webhook', whatsappRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with UTF-8 encoding`);
  console.log(`✅ Chatbot service running`);
  console.log(`✅ WhatsApp webhook listening on /webhook/whatsapp`);
});