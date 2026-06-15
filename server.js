require('dotenv').config();
const express = require('express');
const {Client} = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Prevent unhandled errors from crashing the process
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();

// Healthcheck FIRST — must respond before anything else can fail
app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '3.4.0' }));

app.use(cors());
app.use(express.json({ charset: 'utf-8', limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
const frontendStatic = express.static('frontend/out');
const partSearchStatic = express.static('part-search');
app.use((req, res, next) => {
  const host = req.get('host') || req.hostname || '';
  if (host.includes('part-search')) {
    partSearchStatic(req, res, next);
  } else {
    frontendStatic(req, res, next);
  }
});
app.use(express.static('public'));
app.use(express.static('www'));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: 'info@elimfilters.com',
        pass: process.env.GODADDY_MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'info@elimfilters.com',
      replyTo: email,
      subject: `[Web Contact] ${name} — ${company || 'No company'}`,
      html: `
        <h2 style="color:#000">New contact from elimfilters.com</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%">
          <tr><td><b>Name</b></td><td>${name}</td></tr>
          <tr><td><b>Email</b></td><td>${email}</td></tr>
          <tr><td><b>Phone</b></td><td>${phone || '—'}</td></tr>
          <tr><td><b>Company</b></td><td>${company || '—'}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="background:#f5f5f5;padding:1rem">${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Import routes (with fallback if file is missing)
let knowledgeRoutes;
try {
  knowledgeRoutes = require('./routes/knowledge.routes');
  console.log('[routes] Knowledge routes loaded ✅');
} catch (err) {
  console.error('[routes] Failed to load knowledge routes:', err.message);
  // Create dummy router if knowledge routes fail
  const express = require('express');
  knowledgeRoutes = express.Router();
  knowledgeRoutes.get('/', (req, res) => res.json({ status: 'knowledge-api-unavailable' }));
}

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

const TECH_LOGO_MAP = {
  'syntrax': 'sintrax', 'sintrax': 'sintrax',
  'nanoforce': 'nanoforce',
  'macrocore': 'macrocore',
  'intekcore': 'intekcore',
  'drycore': 'drycore',
  'duratech': 'duratech',
  'syntepore': 'syntepore',
  'microkappa': 'microkappa',
  'marineclean': 'marineclean',
  // Strategic rename: COOLTECH™ → THERMACORE™
  'thermacore': 'thermacore',
  'cooltech': 'thermacore',     // DB legacy alias — elimfilters_catalog still stores COOLTECH™
  // Strategic rename: AQUAGUARD™ → HYDROCORE™
  'hydrocore': 'hydrocore',
  'aquaguard': 'hydrocore',     // DB legacy alias — elimfilters_catalog still stores AQUAGUARD™
  // Inactive placeholders (retained in map, not seeded in KG)
  'gasultra': 'gasultra',
  'blueclean': 'blueclean',
};

function getTechLogo(tech) {
  if (!tech) return null;
  const key = tech.toLowerCase().replace(/[™®\s™]/g, '').trim();
  const mapped = TECH_LOGO_MAP[key];
  return mapped ? `/assets/logo-${mapped}.png` : null;
}

function buildFilterData(row, lang = 'en'){
  return {
    elimfilters_sku: row.sku,
    codigo_base: row.codigo_base,
    description: row.description || extractText(row.sub_type, lang) || null,
    filter_type: extractText(row.filter_type, lang),
    filter_subtype: extractText(row.sub_type, lang) || null,
    technology: row.technology || null,
    technology_logo: getTechLogo(row.technology),
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
    brand_crossrefs: row.brand_crossrefs || {},
    alternatives: row.alternatives || [],
    equipment_applications: row.equipment_applications || []
  };
}

app.get('/api/status', (req, res) => {
  res.json({status: 'ok', version: '3.4.0'});
});

app.get('/api/debug/inspect-codes/:sku', async (req, res) => {
  const sku = req.params.sku.toUpperCase();
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT sku, oem_codes, competitor_codes FROM elimfilters_catalog WHERE sku = $1`,
      [sku]
    );
    res.json(result.rows.length > 0 ? result.rows[0] : {error: 'not found'});
  } catch(e) {
    res.json({ error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/debug/find-code/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT sku, codigo_base,
        oem_codes,
        competitor_codes
       FROM elimfilters_catalog
       WHERE oem_codes::text ILIKE $1
          OR competitor_codes::text ILIKE $1
       LIMIT 10`,
      [`%${code}%`]
    );
    res.json({ code, found: result.rows.length, results: result.rows });
  } catch(e) {
    res.json({ error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/debug/fk', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'elimfilters_catalog'
        AND ccu.column_name = 'sku'
      ORDER BY tc.table_name
    `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
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

// Temp: find SKUs for RAV4 2022 kit components with duty
app.get('/api/search/rav4-kit-skus', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT sku, name, filter_type, sub_type, duty, codigo_base, thread_size
      FROM elimfilters_catalog
      WHERE sku IN ('EL84967','EA19762','EA12377','EC10285')
      ORDER BY sku
    `);
    res.json({ found: result.rows, found_count: result.rows.length });
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
      // Prioriza productos con más datos completos (campos no nulos)
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
               OR UPPER(elem->>'partNumber') = $1
               OR (jsonb_typeof(elem) = 'string' AND UPPER(elem#>>'{}') ~ ('^[^|]+\\|\\s*' || $1 || '$'))
               OR (jsonb_typeof(elem) = 'string' AND UPPER(elem#>>'{}') = $1)
          )
        ORDER BY
          CASE WHEN array_length(COALESCE(alternative_codes, '{}'::jsonb[]), 1) > 0
               THEN 0
               ELSE 1
          END ASC,
          sku ASC
        LIMIT 1`,
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

  // Split model into words; each word must appear in same equipment element (AND)
  const words = model.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return res.json({success: false, filters: []});

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const params = words.map(w => '%' + w + '%');
    const wordConds = words.map((_, i) =>
      `UPPER(CASE WHEN jsonb_typeof(elem)='string' THEN elem#>>'{}'
              ELSE COALESCE(elem->>'equipment', elem->>'machine', elem->>'model', '') END) ILIKE $${i + 1}`
    ).join(' AND ');

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE EXISTS (
                   SELECT 1 FROM jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb)) elem
                   WHERE ${wordConds}
                 )`;

    if (engine) {
      params.push('%' + engine + '%');
      query += ` AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb)) elem
        WHERE UPPER(COALESCE(elem->>'engine','')) ILIKE $${params.length}
      )`;
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

  // Each word in model must appear in the same equipment element (AND, order-independent)
  const words = model.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return res.json({success: false, filters: []});

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");

    const params = words.map(w => '%' + w + '%');
    const wordConds = words.map((_, i) =>
      `UPPER(CASE WHEN jsonb_typeof(elem)='string' THEN elem#>>'{}'
              ELSE COALESCE(elem->>'equipment', elem->>'machine', elem->>'model', '') END) ILIKE $${i + 1}`
    ).join(' AND ');

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE EXISTS (
                   SELECT 1 FROM jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb)) elem
                   WHERE ${wordConds}
                 )`;

    if (type) {
      params.push('%' + type + '%');
      query += ` AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb)) elem
        WHERE UPPER(COALESCE(elem->>'type','')) ILIKE $${params.length}
      )`;
    }

    if (engine) {
      params.push('%' + engine + '%');
      query += ` AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb)) elem
        WHERE UPPER(COALESCE(elem->>'engine','')) ILIKE $${params.length}
      )`;
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


// Temp: consolidate duplicate SKUs (preview consolidation plan)
app.get('/api/migrate/consolidate-skus-preview', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const dupes = await client.query(`
      SELECT sku, ARRAY_AGG(id ORDER BY id) as ids, ARRAY_AGG(codigo_base ORDER BY codigo_base) as codigos,
             ARRAY_AGG(duty ORDER BY duty) as duties
      FROM elimfilters_catalog
      WHERE sku IN (SELECT sku FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1)
      GROUP BY sku
      ORDER BY sku
      LIMIT 50
    `);

    const plan = dupes.rows.map(row => {
      const donaldson = row.codigos.find(c => c && c.match(/^P[0-9]/));
      const fram = row.codigos.find(c => c && !c.match(/^P[0-9]/));
      const primary = donaldson || fram;
      const alternates = row.codigos.filter(c => c !== primary);

      return {
        sku: row.sku,
        keep_id: row.ids[0],
        keep_codigo_base: primary,
        keep_duty: donaldson ? 'HD' : 'LD',
        delete_ids: row.ids.slice(1),
        competitor_codes: alternates.map(c => ({ code: c, manufacturer: '...' }))
      };
    });

    res.json({ success: true, consolidations_count: plan.length, preview: plan });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: apply consolidation (delete duplicates, merge competitor_codes)
app.get('/api/migrate/consolidate-skus-apply', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('BEGIN');

    // Get all groups of duplicates
    const dupes = await client.query(`
      SELECT sku, ARRAY_AGG(id ORDER BY id) as ids, ARRAY_AGG(codigo_base ORDER BY codigo_base) as codigos
      FROM elimfilters_catalog
      WHERE sku IN (SELECT sku FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1)
      GROUP BY sku
    `);

    let consolidated = 0;
    for (const row of dupes.rows) {
      const donaldson = row.codigos.find(c => c && c.match(/^P[0-9]/));
      const fram = row.codigos.find(c => c && !c.match(/^P[0-9]/));
      const primary = donaldson || fram;
      const alternates = row.codigos.filter(c => c !== primary);

      // Update the keeper record with primary codigo_base
      await client.query(
        'UPDATE elimfilters_catalog SET codigo_base = $1, duty = $2 WHERE id = $3',
        [primary, donaldson ? 'HD' : 'LD', row.ids[0]]
      );

      // Merge alternates into competitor_codes
      if (alternates.length > 0) {
        const altCodes = alternates.map(c => ({ code: c, manufacturer: 'Alternative' }));
        await client.query(
          `UPDATE elimfilters_catalog
           SET competitor_codes = COALESCE(competitor_codes, '[]'::jsonb) || $1::jsonb
           WHERE id = $2`,
          [JSON.stringify(altCodes), row.ids[0]]
        );
      }

      // Delete the duplicate records
      for (const del_id of row.ids.slice(1)) {
        await client.query('DELETE FROM elimfilters_catalog WHERE id = $1', [del_id]);
      }
      consolidated++;
    }

    await client.query('COMMIT');
    res.json({ success: true, consolidated_count: consolidated });
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: analyze codigo_base prefixes (Donaldson identification)
app.get('/api/analyze/codigo-base-prefixes', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        SUBSTRING(codigo_base, 1, 3) as prefix,
        COUNT(*) as count,
        ARRAY_AGG(DISTINCT duty ORDER BY duty) as duties,
        ARRAY_AGG(DISTINCT SUBSTRING(codigo_base, 1, 1) ORDER BY SUBSTRING(codigo_base, 1, 1)) as first_char,
        ARRAY_AGG(DISTINCT LEFT(codigo_base, LEAST(5, LENGTH(codigo_base))) ORDER BY LEFT(codigo_base, LEAST(5, LENGTH(codigo_base)))) as sample_codes
      FROM elimfilters_catalog
      WHERE codigo_base IS NOT NULL AND codigo_base != ''
      GROUP BY prefix
      ORDER BY count DESC
    `);
    res.json({ success: true, prefixes: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: add alternative_codes column
app.get('/api/migrate/add-alternative-codes-column', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      ALTER TABLE elimfilters_catalog
      ADD COLUMN IF NOT EXISTS alternative_codes JSONB[] DEFAULT '{}'::jsonb[]
    `);
    res.json({ success: true, message: 'Column alternative_codes added' });
  } catch(e) {
    if (e.message.includes('already exists')) {
      return res.json({ success: true, message: 'Column already exists' });
    }
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Temp: debug EL82100 vs EL81016 comparison
app.get('/api/debug/el82100-vs-el81016', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT id, sku, codigo_base, filter_type, sub_type, duty, technology,
             thread_size, outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency, burst_pressure_psi,
             collapse_pressure_psi, installation_type, oem_codes, competitor_codes,
             alternative_codes, name, description
      FROM elimfilters_catalog
      WHERE sku IN ('EL82100', 'EL81016')
      ORDER BY sku
    `);
    const rows = result.rows;
    const main = rows.find(r => r.sku === 'EL82100');
    const alt  = rows.find(r => r.sku === 'EL81016');
    const nullInMain = main ? Object.entries(main)
      .filter(([k,v]) => v === null && alt && alt[k] !== null)
      .map(([k]) => k) : [];
    res.json({ success: true, records: rows, fields_missing_in_EL82100: nullInMain });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Copia campos faltantes de EL81016 a EL82100 y registra alternativas
app.get('/api/migrate/merge-el82100-sql', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  if (req.query.confirm !== 'yes') return res.json({ error: 'Add ?confirm=yes' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      UPDATE elimfilters_catalog SET
        iso_test_method = COALESCE(iso_test_method, (SELECT iso_test_method FROM elimfilters_catalog WHERE sku='EL81016')),
        burst_pressure_psi = COALESCE(burst_pressure_psi, (SELECT burst_pressure_psi FROM elimfilters_catalog WHERE sku='EL81016')),
        collapse_pressure_psi = COALESCE(collapse_pressure_psi, (SELECT collapse_pressure_psi FROM elimfilters_catalog WHERE sku='EL81016')),
        installation_type = COALESCE(installation_type, (SELECT installation_type FROM elimfilters_catalog WHERE sku='EL81016')),
        oem_codes = (
          SELECT jsonb_agg(DISTINCT v)
          FROM (
            SELECT jsonb_array_elements(oem_codes) as v FROM elimfilters_catalog WHERE sku='EL82100'
            UNION ALL
            SELECT jsonb_array_elements(oem_codes) FROM elimfilters_catalog WHERE sku='EL81016'
          ) t
        ),
        competitor_codes = COALESCE(competitor_codes, (SELECT competitor_codes FROM elimfilters_catalog WHERE sku='EL81016')),
        alternative_codes = ARRAY['"P551016"'::jsonb, '"DBL3998"'::jsonb]
      WHERE sku='EL82100'
    `);
    res.json({ success: true, message: 'EL82100 merged successfully' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/catalog/stats', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const [total, byType, completeness, recent] = await Promise.all([
      client.query(`SELECT COUNT(*) as total FROM elimfilters_catalog`),
      client.query(`
        SELECT filter_type, duty, COUNT(*) as count
        FROM elimfilters_catalog
        GROUP BY filter_type, duty
        ORDER BY count DESC
      `),
      client.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) > 0) as with_oem,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) > 0) as with_competitor,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) > 0) as with_equipment,
          COUNT(*) FILTER (WHERE iso_test_method IS NOT NULL) as with_iso,
          COUNT(*) FILTER (WHERE burst_pressure_psi IS NOT NULL) as with_burst
        FROM elimfilters_catalog
      `),
      client.query(`
        SELECT sku, filter_type, duty,
          jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) as oem_count,
          jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) as comp_count,
          jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) as equip_count
        FROM elimfilters_catalog
        ORDER BY id DESC LIMIT 10
      `)
    ]);
    res.json({
      success: true,
      total_skus: parseInt(total.rows[0].total),
      by_type: byType.rows,
      completeness: completeness.rows[0],
      last_10_inserted: recent.rows
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Merge OEM codes from EL81016 into EL82100
app.get('/api/migrate/merge-oem-codes', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  if (req.query.confirm !== 'yes') return res.json({ error: 'Add ?confirm=yes' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(`
      UPDATE elimfilters_catalog SET
        oem_codes = oem_codes || (SELECT oem_codes FROM elimfilters_catalog WHERE sku='EL81016')
      WHERE sku='EL82100'
    `);
    res.json({ success: true, message: 'OEM codes merged successfully' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Audit: Find incomplete products
app.get('/api/audit/incomplete-products', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        sku, codigo_base,
        CASE WHEN iso_test_method IS NULL THEN 1 ELSE 0 END +
        CASE WHEN burst_pressure_psi IS NULL THEN 1 ELSE 0 END +
        CASE WHEN collapse_pressure_psi IS NULL THEN 1 ELSE 0 END +
        CASE WHEN installation_type IS NULL THEN 1 ELSE 0 END +
        CASE WHEN thread_size IS NULL THEN 1 ELSE 0 END as null_count,
        jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb)) as oem_count,
        jsonb_array_length(COALESCE(alternative_codes, '[]'::jsonb)) as alt_count
      FROM elimfilters_catalog
      WHERE sku LIKE 'EL%'
        AND (iso_test_method IS NULL OR burst_pressure_psi IS NULL
          OR collapse_pressure_psi IS NULL OR installation_type IS NULL)
      ORDER BY null_count DESC, oem_count ASC
      LIMIT 100
    `);
    res.json({ success: true, incomplete_count: result.rows.length, products: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

app.get('/api/migrate/scrape-crossreferences', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});

  res.json({ message: 'Scraper started. Run: npm install puppeteer-extra puppeteer-extra-plugin-stealth && node scrape-crossreferences.js' });
});

// ─── POST /api/import/donaldson ──────────────────────────────────────────────
// Accepts batch of pre-processed rows and upserts into elimfilters_catalog.
// Body: { key: "elim2026", rows: [ { sku, codigo_base, filter_type, ... } ] }
app.post('/api/import/donaldson', async (req, res) => {
  if (req.body.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });

  const client = new Client(dbConfig);
  try {
    await client.connect();
    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      if (!row.sku || !row.codigo_base) { errors++; continue; }
      try {
        const result = await client.query(`
          INSERT INTO elimfilters_catalog (
            sku, codigo_base, description, filter_type, sub_type, technology,
            installation_type, thread_size,
            outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
            iso_test_method, micron_rating, nominal_efficiency,
            burst_pressure_psi, collapse_pressure_psi,
            duty,
            oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
            $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb
          )
          ON CONFLICT (sku) DO UPDATE SET
            codigo_base           = COALESCE(EXCLUDED.codigo_base,           elimfilters_catalog.codigo_base),
            description           = COALESCE(EXCLUDED.description,           elimfilters_catalog.description),
            filter_type           = COALESCE(EXCLUDED.filter_type,           elimfilters_catalog.filter_type),
            sub_type              = COALESCE(EXCLUDED.sub_type,              elimfilters_catalog.sub_type),
            technology            = COALESCE(EXCLUDED.technology,            elimfilters_catalog.technology),
            installation_type     = COALESCE(EXCLUDED.installation_type,     elimfilters_catalog.installation_type),
            thread_size           = COALESCE(EXCLUDED.thread_size,           elimfilters_catalog.thread_size),
            outer_diameter_mm     = COALESCE(EXCLUDED.outer_diameter_mm,     elimfilters_catalog.outer_diameter_mm),
            height_mm             = COALESCE(EXCLUDED.height_mm,             elimfilters_catalog.height_mm),
            gasket_od_mm          = COALESCE(EXCLUDED.gasket_od_mm,          elimfilters_catalog.gasket_od_mm),
            gasket_id_mm          = COALESCE(EXCLUDED.gasket_id_mm,          elimfilters_catalog.gasket_id_mm),
            iso_test_method       = COALESCE(EXCLUDED.iso_test_method,       elimfilters_catalog.iso_test_method),
            micron_rating         = COALESCE(EXCLUDED.micron_rating,         elimfilters_catalog.micron_rating),
            nominal_efficiency    = COALESCE(EXCLUDED.nominal_efficiency,    elimfilters_catalog.nominal_efficiency),
            burst_pressure_psi    = COALESCE(EXCLUDED.burst_pressure_psi,    elimfilters_catalog.burst_pressure_psi),
            collapse_pressure_psi = COALESCE(EXCLUDED.collapse_pressure_psi, elimfilters_catalog.collapse_pressure_psi),
            duty                  = COALESCE(EXCLUDED.duty,                  elimfilters_catalog.duty),
            oem_codes             = COALESCE(EXCLUDED.oem_codes,             elimfilters_catalog.oem_codes),
            competitor_codes      = COALESCE(EXCLUDED.competitor_codes,      elimfilters_catalog.competitor_codes),
            brand_crossrefs       = COALESCE(EXCLUDED.brand_crossrefs,       elimfilters_catalog.brand_crossrefs),
            alternatives          = COALESCE(EXCLUDED.alternatives,          elimfilters_catalog.alternatives),
            equipment_applications = COALESCE(EXCLUDED.equipment_applications, elimfilters_catalog.equipment_applications)
          RETURNING xmax
        `, [
          row.sku, row.codigo_base, row.description || null,
          row.filter_type || null, row.sub_type || null,
          row.technology || null,
          row.installation_type || null, row.thread_size || null,
          row.outer_diameter_mm || null, row.height_mm || null,
          row.gasket_od_mm || null, row.gasket_id_mm || null,
          row.iso_test_method || null, row.micron_rating || null,
          row.nominal_efficiency || null,
          row.burst_pressure_psi || null, row.collapse_pressure_psi || null,
          row.duty || 'HEAVY_DUTY',
          JSON.stringify(row.oem_codes || []),
          JSON.stringify(row.competitor_codes || []),
          JSON.stringify(row.brand_crossrefs || {}),
          JSON.stringify(row.alternatives || []),
          JSON.stringify(row.equipment_applications || [])
        ]);
        // xmax = 0 means insert, otherwise update
        if (result.rows && result.rows[0] && result.rows[0].xmax === '0') inserted++;
        else updated++;
      } catch (rowErr) {
        errors++;
        console.error('[import-err]', row.sku, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, inserted, updated, errors });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/import/existing-skus ───────────────────────────────────────────
// Returns all existing SKUs so the client can avoid collisions.
app.get('/api/import/existing-skus', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT sku FROM elimfilters_catalog ORDER BY sku');
    res.json({ success: true, skus: result.rows.map(r => r.sku) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end();
  }
});

// Register knowledge API for AI agents
try {
  app.use('/api/knowledge', knowledgeRoutes);
  console.log('[middleware] Knowledge API registered ✅');
} catch (err) {
  console.error('[middleware] Failed to register knowledge API:', err.message);
}


// ─── GET /api/migrate/init-db ────────────────────────────────────────────────
// Initializes database schema (tables, views, constraints)
app.get('/api/migrate/init-db', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    
    // 1. Table schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS elimfilters_catalog (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        codigo_base VARCHAR(100),
        description TEXT,
        filter_type VARCHAR(100),
        sub_type VARCHAR(100),
        technology VARCHAR(100),
        installation_type VARCHAR(100),
        thread_size VARCHAR(100),
        outer_diameter_mm NUMERIC,
        height_mm NUMERIC,
        gasket_od_mm NUMERIC,
        gasket_id_mm NUMERIC,
        iso_test_method VARCHAR(100),
        micron_rating NUMERIC,
        nominal_efficiency VARCHAR(100),
        burst_pressure_psi NUMERIC,
        collapse_pressure_psi NUMERIC,
        duty VARCHAR(50),
        oem_codes JSONB,
        competitor_codes JSONB,
        brand_crossrefs JSONB,
        alternatives JSONB,
        equipment_applications JSONB
      );
    `);

    // 2. Constraints
    await client.query('ALTER TABLE elimfilters_catalog DROP CONSTRAINT IF EXISTS sku_strict_format;');
    await client.query("ALTER TABLE elimfilters_catalog ADD CONSTRAINT sku_strict_format CHECK (sku ~ '^[A-Z]{2}[0-9]{4,7}[A-Z]?$');");

    // 3. View
    await client.query(`
      CREATE OR REPLACE VIEW filters AS 
      SELECT 
        sku, codigo_base as base_code, filter_type as category, 
        technology, installation_type as style, thread_size as thread,
        outer_diameter_mm as outer_diameter, height_mm as length,
        iso_test_method as type, 
        oem_codes, competitor_codes, equipment_applications as applications,
        sub_type as description, gasket_od_mm as inner_diameter, nominal_efficiency as efficiency, filter_type as media_type
      FROM elimfilters_catalog;
    `);

    console.log('[migrations] DB initialized successfully!');
    return res.json({ success: true, message: 'Database initialized successfully (tables, views, constraints)' });
  } catch (err) {
    console.error('[migrations] DB INIT ERROR:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/migrate/fix-sku-constraint ─────────────────────────────────────
// Drops and re-adds sku_strict_format constraint with wider regex (no data loss)
app.get('/api/migrate/fix-sku-constraint', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('ALTER TABLE elimfilters_catalog DROP CONSTRAINT IF EXISTS sku_strict_format;');
    await client.query("ALTER TABLE elimfilters_catalog ADD CONSTRAINT sku_strict_format CHECK (sku ~ '^[A-Z]{2}[0-9]{4,7}[A-Z]?$');");
    console.log('[migrations] sku_strict_format constraint updated to allow 4-7 digits');
    return res.json({ success: true, message: 'Constraint updated: now accepts 4-7 digit SKU suffixes' });
  } catch (err) {
    console.error('[migrations] FIX CONSTRAINT ERROR:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/migrate/reset-catalog ──────────────────────────────────────────
// Truncates catalog and ensures new columns exist. Confirms with ?confirm=yes
app.get('/api/migrate/reset-catalog', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  if (req.query.confirm !== 'yes') return res.status(400).json({ error: 'Add ?confirm=yes to proceed' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('TRUNCATE TABLE elimfilters_catalog RESTART IDENTITY;');
    // Add new columns if they don't exist yet (idempotent)
    await client.query(`ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS description TEXT;`);
    await client.query(`ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS brand_crossrefs JSONB;`);
    await client.query(`ALTER TABLE elimfilters_catalog ADD COLUMN IF NOT EXISTS alternatives JSONB;`);
    console.log('[migrations] Catalog reset: truncated + columns ensured');
    return res.json({ success: true, message: 'Catalog truncated and schema updated' });
  } catch (err) {
    console.error('[migrations] RESET ERROR:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ─── GET /api/status ─────────────────────────────────────────────────────────
// Health and version status for deployment verification
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.5.0',
    time: new Date().toISOString()
  });
});

// ── UNIFIED SEARCH (used by public/index.html) ──────────────────────────────
// Pool for high-frequency queries (avoids per-request connect/disconnect)
const { Pool } = require('pg');
const searchPool = new Pool({ ...dbConfig, max: 5, idleTimeoutMillis: 30000 });

// ─── GET /api/catalog/export ──────────────────────────────────────────────────
// Export full catalog as CSV. ?key=elim2026 required.
app.get('/api/catalog/export', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      SELECT sku, codigo_base, description, filter_type, sub_type, technology,
             installation_type, thread_size,
             outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency,
             burst_pressure_psi, collapse_pressure_psi, duty
      FROM elimfilters_catalog
      ORDER BY filter_type, sku
    `);
    const cols = result.fields.map(f => f.name);
    const escape = v => v == null ? '' : String(v).includes(',') || String(v).includes('"') || String(v).includes('\n')
      ? '"' + String(v).replace(/"/g, '""') + '"'
      : String(v);
    const lines = [cols.join(','), ...result.rows.map(r => cols.map(c => escape(r[c])).join(','))];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="elimfilters_catalog.csv"');
    res.send(lines.join('\r\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim().toUpperCase();
  if (q.length < 2) return res.status(400).json({ error: 'min 2 chars', products: [] });
  const lang = detectLang(req);
  try {
    // Exact match first
    let result = await searchPool.query(
      `SELECT * FROM elimfilters_catalog
       WHERE UPPER(sku) = $1 OR UPPER(codigo_base) = $1
       LIMIT 5`,
      [q]
    );
    // Fallback: prefix on SKU/base; exact prefix on OEM/competitor codes (no substring to avoid collisions)
    if (result.rows.length === 0) {
      result = await searchPool.query(
        `SELECT * FROM elimfilters_catalog
         WHERE UPPER(sku) LIKE $1
            OR UPPER(codigo_base) LIKE $1
            OR UPPER(sku) ILIKE $2
            OR UPPER(codigo_base) ILIKE $2
            OR EXISTS (
              SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) elem
              WHERE UPPER(elem->>'code') LIKE $1
                 OR UPPER(elem->>'partNumber') LIKE $1
            )
            OR EXISTS (
              SELECT 1 FROM jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb)) elem
              WHERE UPPER(elem->>'code') LIKE $1
                 OR UPPER(elem->>'partNumber') LIKE $1
                 OR UPPER(elem->>'part_number') LIKE $1
                 OR (jsonb_typeof(elem) = 'string' AND UPPER(elem#>>'{}') LIKE $1)
            )
         ORDER BY CASE WHEN UPPER(sku) LIKE $1 THEN 0 ELSE 1 END, sku
         LIMIT 20`,
        [q + '%', '%' + q + '%']
      );
    }
    const products = result.rows.map(row => ({
      ...buildFilterData(row, lang),
      sku: row.sku  // buildFilterData uses 'elimfilters_sku'; alias for frontend
    }));
    res.json({ products, count: products.length });
  } catch (e) {
    console.error('[api/search]', e.message);
    res.status(500).json({ error: e.message, products: [] });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const r = await searchPool.query(
      `SELECT COUNT(*) AS total, COUNT(DISTINCT technology) AS technologies
       FROM elimfilters_catalog`
    );
    res.json({
      total: parseInt(r.rows[0].total) || 0,
      technologies: parseInt(r.rows[0].technologies) || 0,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// ────────────────────────────────────────────────────────────────────────────

// ─── POST /api/migrate/fill-competitor-codes ─────────────────────────────────
// Receives batches of {sku, competitor_codes} and updates ONLY products where
// competitor_codes is currently NULL or empty AND the new value is non-empty.
// Safe: never overwrites existing populated competitor_codes data.
// Body: { key: "elim2026", rows: [{sku: "EA10006", competitor_codes: [...]}] }
app.post('/api/migrate/fill-competitor-codes', async (req, res) => {
  if (req.body.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });

  const client = new Client(dbConfig);
  try {
    await client.connect();
    let updated = 0, skipped = 0, errors = 0;

    for (const row of rows) {
      if (!row.sku || !Array.isArray(row.competitor_codes) || row.competitor_codes.length === 0) {
        skipped++;
        continue;
      }
      try {
        const result = await client.query(
          `UPDATE elimfilters_catalog
           SET competitor_codes = $2::jsonb
           WHERE sku = $1
             AND (competitor_codes IS NULL
                  OR jsonb_array_length(COALESCE(competitor_codes, '[]'::jsonb)) = 0)`,
          [row.sku, JSON.stringify(row.competitor_codes)]
        );
        if (result.rowCount > 0) updated++;
        else skipped++;
      } catch (e) {
        errors++;
      }
    }

    res.json({ success: true, updated, skipped, errors, total: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.end().catch(() => {});
  }
});

// ── Merge alternatives endpoint ───────────────────────────────────────────
app.post('/api/migrate/merge-alternatives', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const dryRun = req.query.dry === '1';
  const fs   = require('fs');
  const path = require('path');
  const DIR  = path.join(__dirname, 'scripts');

  function keyOem(o) {
    if (typeof o === 'string') return o.trim().toUpperCase();
    const m = (o.manufacturer || o.brand || '').toUpperCase().trim();
    const c = (o.code || o.part_number || '').toUpperCase().trim();
    const k = m + '|' + c;
    return k === '|' ? JSON.stringify(o) : k;
  }
  function keyEq(e) { return (e.equipment||'')+'|'+(e.type||'')+'|'+(e.engine||''); }
  function unionArr(arrays, kfn) {
    const s = new Map();
    for (const a of arrays) for (const x of (a || [])) { const k = kfn(x); if (!s.has(k)) s.set(k, x); }
    return [...s.values()];
  }

  // Build pnToSku + graph from JSON files
  const pnToSku = new Map();
  const graph   = new Map();
  const files = fs.readdirSync(DIR).filter(f => /^donaldson_.*_results\.json$/.test(f)).map(f => path.join(DIR, f));
  for (const f of files) {
    let d; try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    for (const p of d) if (p.sku_elimfilters && p.part_number) pnToSku.set(p.part_number, p.sku_elimfilters);
  }
  for (const f of files) {
    let d; try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    for (const p of d) {
      const sku = p.sku_elimfilters; if (!sku) continue;
      if (!graph.has(sku)) graph.set(sku, new Set());
      for (const a of (p.alternatives || [])) {
        const as = pnToSku.get(a); if (!as || as === sku) continue;
        if (!graph.has(as)) graph.set(as, new Set());
        graph.get(sku).add(as); graph.get(as).add(sku);
      }
    }
  }

  // Connected components
  const visited = new Set(), components = [];
  for (const s of graph.keys()) {
    if (visited.has(s)) continue;
    const comp = [], q = [s]; visited.add(s);
    while (q.length) { const n = q.shift(); comp.push(n); for (const nb of (graph.get(n)||[])) { if (!visited.has(nb)) { visited.add(nb); q.push(nb); } } }
    if (comp.length > 1) components.push(comp);
  }

  const allSkus = [...new Set(components.flat())];
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const ph = allSkus.map((_, i) => '$' + (i + 1)).join(',');
    const { rows } = await client.query(
      `SELECT sku, oem_codes, competitor_codes, equipment_applications FROM elimfilters_catalog WHERE sku IN (${ph})`,
      allSkus
    );
    const bySku = new Map(rows.map(r => [r.sku, r]));
    let totalUpdated = 0, groupsChanged = 0;
    const log = [];

    for (const grp of components) {
      const ms = grp.map(s => bySku.get(s)).filter(Boolean);
      if (ms.length < 2) continue;
      const oemU = unionArr(ms.map(m => m.oem_codes), keyOem);
      const cmpU = unionArr(ms.map(m => m.competitor_codes), keyOem);
      const eqU  = unionArr(ms.map(m => m.equipment_applications), keyEq);
      let gc = false;
      for (const m of ms) {
        const co = (m.oem_codes||[]).length, cc = (m.competitor_codes||[]).length, ce = (m.equipment_applications||[]).length;
        const fo = oemU.length > co ? oemU : (m.oem_codes||[]);
        const fc = cmpU.length > cc ? cmpU : (m.competitor_codes||[]);
        const fe = eqU.length  > ce ? eqU  : (m.equipment_applications||[]);
        if (fo.length <= co && fc.length <= cc && fe.length <= ce) continue;
        if (!dryRun) {
          await client.query(
            'UPDATE elimfilters_catalog SET oem_codes=$1::jsonb,competitor_codes=$2::jsonb,equipment_applications=$3::jsonb WHERE sku=$4',
            [JSON.stringify(fo), JSON.stringify(fc), JSON.stringify(fe), m.sku]
          );
        }
        log.push({ sku: m.sku, oem: `${co}→${fo.length}`, comp: `${cc}→${fc.length}`, equip: `${ce}→${fe.length}` });
        totalUpdated++; gc = true;
      }
      if (gc) groupsChanged++;
    }
    res.json({ success: true, dryRun, groups: components.length, groupsChanged, totalUpdated, sample: log.slice(0, 20) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    await client.end().catch(() => {});
  }
});

// ── Apply competitor matrix endpoint ─────────────────────────────────────────
app.post('/api/migrate/apply-matrix', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const fs   = require('fs');
  const path = require('path');
  const dryRun = req.query.dry === '1';
  const DIR  = path.join(__dirname, 'scripts');

  const FILES = [
    { file: 'coolant_competitor_matrix.json',  prefix: 'EW' },
    { file: 'cabin_competitor_matrix.json',    prefix: 'EC' },
    { file: 'fuel_competitor_matrix.json',     prefix: 'EF' },
    { file: 'airdryer_competitor_matrix.json', prefix: 'ED' },
  ];

  const client = new Client(dbConfig);
  await client.connect();

  let totalUpdated = 0;
  const results = [];

  try {
    for (const { file, prefix } of FILES) {
      const fpath = path.join(DIR, file);
      if (!fs.existsSync(fpath)) { results.push({ file, error: 'not found' }); continue; }
      const matrix = JSON.parse(fs.readFileSync(fpath, 'utf8'));
      const pnums  = Object.keys(matrix).filter(p => matrix[p].length > 0);
      if (!pnums.length) { results.push({ file, updated: 0 }); continue; }

      const ph = pnums.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await client.query(
        `SELECT sku, codigo_base FROM elimfilters_catalog
         WHERE codigo_base IN (${ph}) AND sku LIKE $${pnums.length + 1}
           AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)`,
        [...pnums, `${prefix}%`]
      );

      let updated = 0;
      for (const { sku, codigo_base } of rows) {
        const refs = matrix[codigo_base];
        if (!refs || !refs.length) continue;
        if (!dryRun) {
          await client.query(
            `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
            [JSON.stringify(refs), sku]
          );
        }
        updated++;
      }
      totalUpdated += updated;
      results.push({ file, prefix, updated });
    }
  } finally {
    await client.end();
  }

  res.json({ success: true, dryRun, totalUpdated, results });
});

// ── Apply turbine competitor matrix (ET SKUs with P/T/S micronage suffix) ────
// Creates ET92010P/T/S, ET92020P/T/S, ET92040P/T/S if not present,
// then sets competitor_codes for each micronage variant.
app.post('/api/migrate/apply-turbine-matrix', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const fs   = require('fs');
  const path = require('path');
  const dryRun = req.query.dry === '1';

  const MATRIX_FILE = path.join(__dirname, 'scripts', 'turbine_competitor_matrix.json');
  if (!fs.existsSync(MATRIX_FILE)) {
    return res.status(404).json({ error: 'turbine_competitor_matrix.json not found' });
  }
  const matrix = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));

  // micronage suffix → description label
  const MICRON_LABEL = { P: '30 Micron', T: '10 Micron', S: '2 Micron' };

  // base SKU → P-number mapping (from donaldson_fuel_results.json)
  const BASE_PNUM = {
    ET92010: 'P552010',
    ET92020: 'P552020',
    ET92040: 'P552040',
  };

  const client = new Client(dbConfig);
  await client.connect();

  let created = 0;
  let updated = 0;
  const log = [];

  try {
    for (const [variantSku, refs] of Object.entries(matrix)) {
      // e.g. ET92010P → base=ET92010, suffix=P
      const base   = variantSku.slice(0, -1);
      const suffix = variantSku.slice(-1);
      const micron = MICRON_LABEL[suffix] || suffix;

      // 1. Check if variant already exists
      const existing = await client.query(
        'SELECT sku FROM elimfilters_catalog WHERE sku = $1',
        [variantSku]
      );

      if (existing.rows.length === 0) {
        // 2. Clone from base SKU
        const baseRow = await client.query(
          'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
          [base]
        );
        if (baseRow.rows.length === 0) {
          log.push({ sku: variantSku, action: 'skipped', reason: `base ${base} not found` });
          continue;
        }
        const b = baseRow.rows[0];

        // Build description variants with micronage label injected
        let descEn = b.description_en || b.description || '';
        let descEs = b.description_es || '';
        const micronTag = ` — ${micron} Turbine Element`;
        if (descEn && !descEn.includes('Micron')) descEn = descEn.replace(/\.$/, '') + micronTag + '.';
        if (descEs && !descEs.includes('Micrón')) descEs = descEs.replace(/\.$/, '') + micronTag + '.';

        if (!dryRun) {
          await client.query(
            `INSERT INTO elimfilters_catalog
               (sku, filter_type, sub_type, installation_type, codigo_base,
                duty, description_en, description_es, oem_codes, competitor_codes,
                dimensions, weight, certifications, technology, created_at)
             SELECT
               $1, filter_type, sub_type, installation_type, $2,
               duty, $3, $4, oem_codes, $5::jsonb,
               dimensions, weight, certifications, technology, NOW()
             FROM elimfilters_catalog WHERE sku = $6
             ON CONFLICT (sku) DO NOTHING`,
            [
              variantSku,
              BASE_PNUM[base] || b.codigo_base,
              descEn || null,
              descEs || null,
              JSON.stringify(refs),
              base,
            ]
          );
        }
        created++;
        log.push({ sku: variantSku, action: dryRun ? 'dry-create' : 'created', refs: refs.length });
      } else {
        // 3. Update competitor_codes on existing row
        if (!dryRun) {
          await client.query(
            'UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2',
            [JSON.stringify(refs), variantSku]
          );
        }
        updated++;
        log.push({ sku: variantSku, action: dryRun ? 'dry-update' : 'updated', refs: refs.length });
      }
    }
  } finally {
    await client.end();
  }

  res.json({ success: true, dryRun, created, updated, log });
});

// ─── POST /api/crosslink/fg-don ──────────────────────────────────────────────
// Cross-links Fleetguard ↔ Donaldson in competitor_codes (bidirectional).
// Body: { key: "elim2026", dry_run?: bool, stats_only?: bool }
app.post('/api/crosslink/fg-don', async (req, res) => {
  if (req.body.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const dryRun    = !!req.body.dry_run;
  const statsOnly = !!req.body.stats_only;

  const SQL_PASS_A = `
    SELECT d.sku AS don_sku, d.codigo_base AS don_code,
           fg_pn.value AS fg_code, f.sku AS fg_sku
    FROM elimfilters_catalog d
    CROSS JOIN LATERAL jsonb_array_elements_text(d.brand_crossrefs->'FLEETGUARD') fg_pn(value)
    JOIN elimfilters_catalog f ON upper(trim(f.codigo_base)) = upper(trim(fg_pn.value))
    WHERE d.brand_crossrefs ? 'FLEETGUARD' AND f.sku IS NOT NULL`;

  const SQL_PASS_B = `
    WITH fg_oem AS (
      SELECT f.sku AS fg_sku, f.codigo_base AS fg_code,
             upper(trim(o->>'manufacturer')) AS mfr, upper(trim(o->>'part_number')) AS oem_pn
      FROM elimfilters_catalog f CROSS JOIN LATERAL jsonb_array_elements(f.oem_codes) o
      WHERE jsonb_array_length(f.oem_codes) > 0
    ), don_oem AS (
      SELECT d.sku AS don_sku, d.codigo_base AS don_code,
             upper(trim(o->>'manufacturer')) AS mfr, upper(trim(o->>'part_number')) AS oem_pn
      FROM elimfilters_catalog d CROSS JOIN LATERAL jsonb_array_elements(d.oem_codes) o
      WHERE jsonb_array_length(d.oem_codes) > 0
    )
    SELECT DISTINCT fg.fg_sku, fg.fg_code, don.don_sku, don.don_code,
           fg.mfr AS shared_brand, fg.oem_pn AS shared_code
    FROM fg_oem fg JOIN don_oem don
      ON fg.oem_pn = don.oem_pn AND fg.mfr = don.mfr AND fg.fg_sku <> don.don_sku
    WHERE fg.mfr NOT IN (
      'DONALDSON','FLEETGUARD','CUMMINS FILTRATION','BALDWIN','MANN','WIX',
      'PUROLATOR','FRAM','NAPA','HASTINGS','LUBER-FINER','BOSCH','MAHLE',
      'HENGST','FILTREC','HYDAC','PALL','PARKER'
    )`;

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const rowsA = (await client.query(SQL_PASS_A)).rows;
    const rowsB = (await client.query(SQL_PASS_B)).rows;

    // Deduplicate — Pass A wins
    const pairs = {};
    for (const r of rowsA) {
      pairs[`${r.don_sku}|${r.fg_sku}`] = { ...r, method: 'BRAND_CROSSREF' };
    }
    for (const r of rowsB) {
      const k = `${r.don_sku}|${r.fg_sku}`;
      if (!pairs[k]) pairs[k] = { ...r, method: `SHARED_OEM:${r.shared_brand}:${r.shared_code}` };
    }

    const pairList    = Object.values(pairs);
    const totalFg     = parseInt((await client.query(`SELECT COUNT(*) FROM elimfilters_catalog WHERE sub_type ILIKE '%Fleetguard%'`)).rows[0].count);
    const totalDon    = parseInt((await client.query(`SELECT COUNT(*) FROM elimfilters_catalog WHERE (sub_type NOT ILIKE '%Fleetguard%' OR sub_type IS NULL)`)).rows[0].count);
    const fgMatched   = new Set(pairList.map(p => p.fg_sku)).size;
    const donMatched  = new Set(pairList.map(p => p.don_sku)).size;
    const passA_count = pairList.filter(p => p.method === 'BRAND_CROSSREF').length;
    const passB_count = pairList.length - passA_count;

    const stats = {
      total_fg: totalFg, total_don: totalDon,
      pairs: pairList.length, pass_a: passA_count, pass_b: passB_count,
      fg_matched: fgMatched,  fg_unmatched: totalFg - fgMatched,
      don_matched: donMatched, don_unmatched: totalDon - donMatched,
      fg_match_pct:  totalFg  ? +(fgMatched  / totalFg  * 100).toFixed(1) : 0,
      don_match_pct: totalDon ? +(donMatched / totalDon * 100).toFixed(1) : 0,
    };

    if (statsOnly || dryRun) {
      return res.json({ success: true, dryRun, statsOnly, stats,
        sample: pairList.slice(0, 5).map(p => ({
          don: `${p.don_code} (${p.don_sku})`, fg: `${p.fg_code} (${p.fg_sku})`, method: p.method
        }))
      });
    }

    // Bidirectional update
    let updatedDon = 0, updatedFg = 0;
    const SQL_UPD = `
      UPDATE elimfilters_catalog
      SET competitor_codes = COALESCE(competitor_codes,'[]'::jsonb) || $1::jsonb
      WHERE sku = $2 AND NOT (COALESCE(competitor_codes,'[]'::jsonb) @> $1::jsonb)`;

    for (const p of pairList) {
      const fgEntry  = JSON.stringify([{ brand:'FLEETGUARD', part_number: p.fg_code,  linked_sku: p.fg_sku  }]);
      const donEntry = JSON.stringify([{ brand:'DONALDSON',  part_number: p.don_code, linked_sku: p.don_sku }]);
      const rDon = await client.query(SQL_UPD, [fgEntry,  p.don_sku]);
      const rFg  = await client.query(SQL_UPD, [donEntry, p.fg_sku]);
      if (rDon.rowCount > 0) updatedDon++;
      if (rFg.rowCount  > 0) updatedFg++;
    }

    res.json({ success: true, stats, updated_don: updatedDon, updated_fg: updatedFg });
  } catch (err) {
    console.error('[crosslink/fg-don]', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

// ─── POST /api/catalog/merge-fg-into-don ─────────────────────────────────────
// Merges Fleetguard duplicate records into their Donaldson base record.
// Rule: Donaldson is always the base. A Fleetguard code is a competitor cross-
// reference, not a base code — UNLESS it has no Donaldson equivalent.
//
// For each matched FG↔DON pair:
//   1. Adds FG codigo_base as competitor_code on DON record
//   2. Merges FG oem_codes, equipment_applications, brand_crossrefs into DON
//   3. Deletes the FG duplicate record
// Unmatched FG records (no DON equivalent) are kept as unique FG parts.
//
// Body: { key: "elim2026", dry_run?: bool (default: true for safety) }
app.post('/api/catalog/merge-fg-into-don', async (req, res) => {
  if (req.body.key !== 'elim2026') return res.status(403).json({ error: 'forbidden' });
  const dryRun = req.body.dry_run !== false;

  const client = new Client(dbConfig);
  try {
    await client.connect();

    // Find FG-DON pairs via two methods:
    // A: Donaldson brand_crossrefs['FLEETGUARD'] contains FG codigo_base
    // B: DON competitor_codes already has {brand:'FLEETGUARD', part_number:'LFxxx'} from crosslink run
    const SQL_FIND_PAIRS = `
      SELECT DISTINCT d.sku AS don_sku, d.codigo_base AS don_code,
             f.sku AS fg_sku, f.codigo_base AS fg_code
      FROM elimfilters_catalog d
      CROSS JOIN LATERAL jsonb_array_elements_text(
        COALESCE(d.brand_crossrefs->'FLEETGUARD', '[]'::jsonb)
      ) AS fgref(code)
      JOIN elimfilters_catalog f
        ON UPPER(TRIM(f.codigo_base)) = UPPER(TRIM(fgref.code))
      WHERE d.brand_crossrefs ? 'FLEETGUARD'
        AND d.sku <> f.sku
        AND f.sub_type ILIKE '%Fleetguard%'

      UNION

      SELECT DISTINCT d.sku AS don_sku, d.codigo_base AS don_code,
             f.sku AS fg_sku, f.codigo_base AS fg_code
      FROM elimfilters_catalog d
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(d.competitor_codes,'[]'::jsonb)) AS cc(elem)
      JOIN elimfilters_catalog f
        ON UPPER(TRIM(f.codigo_base)) = UPPER(TRIM(COALESCE(cc.elem->>'part_number', cc.elem->>'code','')))
      WHERE (cc.elem->>'brand' = 'FLEETGUARD' OR cc.elem->>'manufacturer' = 'FLEETGUARD')
        AND d.sku <> f.sku
        AND f.sub_type ILIKE '%Fleetguard%'
    `;

    const pairRows = (await client.query(SQL_FIND_PAIRS)).rows;

    // One FG maps to exactly one DON (first match wins if multiple)
    const fgToDon = {};
    for (const r of pairRows) {
      if (!fgToDon[r.fg_sku]) fgToDon[r.fg_sku] = r;
    }
    const pairList = Object.values(fgToDon);

    const totalFg = parseInt((await client.query(
      `SELECT COUNT(*) FROM elimfilters_catalog WHERE sub_type ILIKE '%Fleetguard%'`
    )).rows[0].count);

    if (dryRun) {
      return res.json({
        success: true, dry_run: true,
        stats: {
          total_fg_records: totalFg,
          pairs_found: pairList.length,
          will_delete: pairList.length,
          will_keep_as_unique_fg: totalFg - pairList.length,
        },
        sample: pairList.slice(0, 30).map(p =>
          `${p.fg_code} (${p.fg_sku}) → ${p.don_code} (${p.don_sku})`
        ),
        note: 'Pass dry_run:false to execute the merge.'
      });
    }

    let merged = 0, deleted = 0, errors = 0;

    for (const pair of pairList) {
      try {
        const [donRes, fgRes] = await Promise.all([
          client.query('SELECT * FROM elimfilters_catalog WHERE sku=$1', [pair.don_sku]),
          client.query('SELECT * FROM elimfilters_catalog WHERE sku=$1', [pair.fg_sku])
        ]);
        if (!donRes.rows[0] || !fgRes.rows[0]) continue;

        const don = donRes.rows[0];
        const fg  = fgRes.rows[0];

        // 1. Competitor codes: replace any legacy {brand,part_number} FG entry
        //    with clean {manufacturer:'FLEETGUARD', code:'LFxxx'} format for search compatibility
        const existingComp = don.competitor_codes || [];
        const cleanedComp = existingComp.filter(c =>
          !((c.brand === 'FLEETGUARD' || c.manufacturer === 'FLEETGUARD') &&
            (c.code === fg.codigo_base || c.part_number === fg.codigo_base))
        );
        cleanedComp.push({ manufacturer: 'FLEETGUARD', code: fg.codigo_base });

        // 2. OEM codes: union by manufacturer+code, normalise keys to {manufacturer, code}
        const donOem = don.oem_codes || [];
        const fgOem  = fg.oem_codes  || [];
        const oemMap = new Map();
        for (const o of donOem) {
          const mfr  = (o.manufacturer || o.brand || '').trim().toUpperCase();
          const code = (o.code || o.part_number || '').trim().toUpperCase();
          if (mfr && code) oemMap.set(`${mfr}|${code}`, { manufacturer: o.manufacturer || o.brand, code: o.code || o.part_number });
        }
        for (const o of fgOem) {
          const mfr  = (o.manufacturer || o.brand || '').trim().toUpperCase();
          const code = (o.code || o.part_number || '').trim().toUpperCase();
          if (mfr && code && !oemMap.has(`${mfr}|${code}`))
            oemMap.set(`${mfr}|${code}`, { manufacturer: o.manufacturer || o.brand, code: o.code || o.part_number });
        }
        const mergedOem = [...oemMap.values()];

        // 3. Equipment: union by JSON fingerprint
        const donEquip = don.equipment_applications || [];
        const fgEquip  = fg.equipment_applications  || [];
        const equipSet = new Set(donEquip.map(e => JSON.stringify(e)));
        const mergedEquip = [...donEquip];
        for (const e of fgEquip) {
          const s = JSON.stringify(e);
          if (!equipSet.has(s)) { mergedEquip.push(e); equipSet.add(s); }
        }

        // 4. brand_crossrefs: merge FG's into DON's, skip self-references
        const donBc = don.brand_crossrefs || {};
        const fgBc  = fg.brand_crossrefs  || {};
        const mergedBc = { ...donBc };
        for (const [brand, codes] of Object.entries(fgBc)) {
          if (brand === 'FLEETGUARD' || brand === 'DONALDSON') continue;
          if (!mergedBc[brand]) mergedBc[brand] = [];
          const existSet = new Set(mergedBc[brand]);
          for (const c of (codes || [])) if (!existSet.has(c)) { mergedBc[brand].push(c); existSet.add(c); }
        }

        // 5. Update the DON record with merged data
        await client.query(`
          UPDATE elimfilters_catalog SET
            competitor_codes       = $1::jsonb,
            oem_codes              = $2::jsonb,
            equipment_applications = $3::jsonb,
            brand_crossrefs        = $4::jsonb
          WHERE sku = $5
        `, [
          JSON.stringify(cleanedComp),
          JSON.stringify(mergedOem),
          JSON.stringify(mergedEquip),
          JSON.stringify(mergedBc),
          pair.don_sku
        ]);

        // 6. Delete the Fleetguard duplicate

        // 5.5 Move FK references before deleting FG

        try {
          await client.query('UPDATE product_element SET sku=$1 WHERE sku=$2', [pair.don_sku, pair.fg_sku]);
        } catch (e) { console.error('[product_element]', e.message); }

        try {
          await client.query('UPDATE product_model SET sku=$1 WHERE sku=$2', [pair.don_sku, pair.fg_sku]);
        } catch (e) { console.error('[product_element]', e.message); }

        await client.query('DELETE FROM elimfilters_catalog WHERE sku=$1', [pair.fg_sku]);

        merged++;
        deleted++;
      } catch (pairErr) {
        console.error(`[merge-fg] ${pair.fg_sku}→${pair.don_sku}:`, pairErr.message);
        errors++;
      }
    }

    res.json({
      success: true, dry_run: false,
      stats: {
        pairs_processed: pairList.length,
        merged, deleted, errors,
        kept_unique_fg: totalFg - pairList.length,
      }
    });
  } catch (err) {
    console.error('[merge-fg-into-don]', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

// ────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;
console.log(`[server] Starting on PORT=${PORT} (env PORT=${process.env.PORT || 'not set'})`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ✅ Listening on port ${PORT}`);
  console.log(`[server] ✅ ELIMFILTERS API ready`);
});




