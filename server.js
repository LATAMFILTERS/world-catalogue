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

function extractText(val) {
  if (!val) return null;
  if (typeof val === 'object') return val.en || val.es || Object.values(val)[0] || null;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return p.en || p.es || Object.values(p)[0] || val; } catch { return val; }
  }
  return String(val);
}

function buildFilterData(row){
  return {
    elimfilters_sku: row.sku,
    codigo_base: row.codigo_base,
    filter_type: extractText(row.filter_type),
    filter_subtype: extractText(row.sub_type) || null,
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
    
    const filters = result.rows.map(row => buildFilterData(row));
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
    const filters = result.rows.map(row => buildFilterData(row));
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
    const filters = result.rows.map(row => buildFilterData(row));
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

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
      [code]
    );
    const filters = result.rows.map(row => buildFilterData(row));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

// Temp: populate sub_type for Hydraulic Filters
app.get('/api/migrate/hydraulic-subtype', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(`
      UPDATE elimfilters_catalog
      SET sub_type = CASE
        WHEN thread_size IS NOT NULL THEN 'Spin-On'
        ELSE 'Cartridge'
      END
      WHERE filter_type = 'Hydraulic Filter'
      RETURNING sub_type
    `);
    const summary = {};
    result.rows.forEach(r => { summary[r.sub_type] = (summary[r.sub_type]||0)+1; });
    res.json({success: true, updated: result.rowCount, summary});
  } catch(e) {
    res.status(500).json({success: false, error: e.message});
  } finally {
    await client.end();
  }
});

// Temp: analyze Oil Filter data for sub_type inference
app.get('/api/analyze/oil-subtype', async (req, res) => {
  if (req.query.key !== 'elim2026') return res.status(403).json({error: 'forbidden'});
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const thread = await client.query(`
      SELECT
        CASE WHEN thread_size IS NOT NULL THEN 'has_thread' ELSE 'no_thread' END as thread,
        COUNT(*) as count
      FROM elimfilters_catalog
      WHERE filter_type = 'Oil Filter'
      GROUP BY 1
    `);
    const subtypes = await client.query(`
      SELECT sub_type, COUNT(*) FROM elimfilters_catalog
      WHERE filter_type = 'Oil Filter'
      GROUP BY sub_type ORDER BY COUNT(*) DESC
    `);
    const withThread = await client.query(`
      SELECT sku, codigo_base, thread_size, sub_type, installation_type
      FROM elimfilters_catalog
      WHERE filter_type = 'Oil Filter' AND thread_size IS NOT NULL
      LIMIT 5
    `);
    const noThread = await client.query(`
      SELECT sku, codigo_base, thread_size, sub_type, installation_type, height_mm, outer_diameter_mm
      FROM elimfilters_catalog
      WHERE filter_type = 'Oil Filter' AND thread_size IS NULL
      LIMIT 10
    `);
    res.json({ thread_distribution: thread.rows, existing_subtypes: subtypes.rows, with_thread_sample: withThread.rows, no_thread_sample: noThread.rows });
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