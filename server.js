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
app.use(express.json({charset: 'utf-8'}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('frontend/out'));
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
  'cooltech': 'cooltech',
  'syntepore': 'syntepore',
  'microkappa': 'microkappa',
  'gasultra': 'gasultra',
  'aquaguard': 'aquaguard',
  'marineclean': 'marineclean',
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
    await client.query("ALTER TABLE elimfilters_catalog ADD CONSTRAINT sku_strict_format CHECK (sku ~ '^[A-Z]{2}[0-9]?[0-9]{4}[A-Z]?$');");

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
    // Fallback: prefix + partial across codes
    if (result.rows.length === 0) {
      result = await searchPool.query(
        `SELECT * FROM elimfilters_catalog
         WHERE UPPER(sku) LIKE $1
            OR UPPER(codigo_base) LIKE $1
            OR UPPER(sku) ILIKE $2
            OR UPPER(codigo_base) ILIKE $2
            OR oem_codes::text ILIKE $2
            OR competitor_codes::text ILIKE $2
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

const PORT = process.env.PORT || 8080;
console.log(`[server] Starting on PORT=${PORT} (env PORT=${process.env.PORT || 'not set'})`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ✅ Listening on port ${PORT}`);
  console.log(`[server] ✅ ELIMFILTERS API ready`);
});