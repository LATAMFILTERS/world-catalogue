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


// Temp: create validation trigger for new INSERTs
app.get('/api/migrate/add-insert-trigger', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();

    await client.query(`
      CREATE OR REPLACE FUNCTION validate_filter_insert()
      RETURNS TRIGGER AS $$
      DECLARE
        inferred_type TEXT := NULL;
        expected_prefix TEXT;
      BEGIN
        -- 1. Duty vs codigo_base format
        IF NEW.duty = 'HD' AND NEW.codigo_base !~ '^P[0-9]+$' THEN
          RAISE EXCEPTION 'HD filter requires Donaldson codigo_base (P + digits), got: %', NEW.codigo_base;
        END IF;
        IF NEW.duty = 'LD' AND NEW.codigo_base ~ '^P[0-9]+$' THEN
          RAISE EXCEPTION 'LD filter cannot use Donaldson codigo_base format, got: %', NEW.codigo_base;
        END IF;

        -- 2. Spec-based filter_type inference (primary validation)
        IF NEW.micron_rating IS NOT NULL AND NEW.iso_test_method IS NOT NULL THEN
          inferred_type := 'Hydraulic Filter';
        ELSIF NEW.technology ILIKE '%SYNTRAX%' THEN
          inferred_type := 'Oil Filter';
        ELSIF NEW.technology ILIKE '%NANOFORCE%' OR NEW.technology ILIKE '%NANOTEK%' THEN
          inferred_type := 'Air Filter';
        END IF;

        IF inferred_type IS NOT NULL AND inferred_type != NEW.filter_type THEN
          RAISE EXCEPTION 'Spec mismatch: technical specs indicate "%" but filter_type is "%"',
            inferred_type, NEW.filter_type;
        END IF;

        -- 3. Required fields per filter_type
        IF NEW.filter_type = 'Hydraulic Filter' AND NEW.micron_rating IS NULL THEN
          RAISE EXCEPTION 'Hydraulic Filter requires micron_rating';
        END IF;
        IF NEW.sub_type = 'Spin-On' AND NEW.filter_type IN ('Oil Filter','Fuel Filter','Coolant Filter','Air Dryer','Fuel/Water Separator') AND NEW.thread_size IS NULL THEN
          RAISE EXCEPTION '% Spin-On requires thread_size', NEW.filter_type;
        END IF;

        -- 4. SKU prefix as last resort
        expected_prefix := CASE NEW.filter_type
          WHEN 'Air Filter'           THEN 'EA1'
          WHEN 'Air Housing'          THEN 'EA2'
          WHEN 'Air Dryer'            THEN 'ED4'
          WHEN 'Hydraulic Filter'     THEN 'EH6'
          WHEN 'Kit Filter'           THEN CASE WHEN NEW.duty = 'HD' THEN 'EK3' ELSE 'EK5' END
          WHEN 'Oil Filter'           THEN 'EL8'
          WHEN 'Marine Filter'        THEN 'EM9'
          WHEN 'Fuel/Water Separator' THEN 'ES9'
          WHEN 'Turbine Filter'       THEN 'ET9'
          WHEN 'Cabin Air Filter'     THEN 'EC1'
          WHEN 'Fuel Filter'          THEN 'EF9'
          WHEN 'Coolant Filter'       THEN 'EW7'
          ELSE NULL
        END;

        IF expected_prefix IS NOT NULL AND LEFT(NEW.sku, 3) != expected_prefix THEN
          RAISE EXCEPTION 'SKU prefix mismatch: filter_type "%" requires prefix "%" but got "%" — check specs first',
            NEW.filter_type, expected_prefix, LEFT(NEW.sku, 3);
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`DROP TRIGGER IF EXISTS trg_validate_filter ON elimfilters_catalog`);
    await client.query(`
      CREATE TRIGGER trg_validate_filter
      BEFORE INSERT ON elimfilters_catalog
      FOR EACH ROW EXECUTE FUNCTION validate_filter_insert();
    `);

    res.json({ success: true, message: 'Trigger trg_validate_filter created with spec-based validation' });
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