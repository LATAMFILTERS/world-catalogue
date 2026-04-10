const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());
app.use(express.json());

const pool = new Pool({
  host:     process.env.PGHOST     || "ballast.proxy.rlwy.net",
  port:     process.env.PGPORT     || 18263,
  database: process.env.PGDATABASE || "railway",
  user:     process.env.PGUSER     || "postgres",
  password: process.env.PGPASSWORD || "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS elimfilters_catalog (
        id SERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        codigo_base TEXT,
        filter_type TEXT,
        technology TEXT,
        installation_type TEXT,
        thread_size TEXT,
        height_mm NUMERIC,
        outer_diameter_mm NUMERIC,
        gasket_od_mm NUMERIC,
        gasket_id_mm NUMERIC,
        iso_test_method TEXT,
        micron_rating NUMERIC,
        nominal_efficiency NUMERIC,
        burst_pressure_psi NUMERIC,
        collapse_pressure_psi NUMERIC,
        duty TEXT,
        oem_codes JSONB DEFAULT '[]',
        competitor_codes JSONB DEFAULT '[]',
        equipment_applications JSONB DEFAULT '[]'
      )
    `);
    const { rows } = await client.query("SELECT COUNT(*) FROM elimfilters_catalog");
    console.log(`PostgreSQL conectado — filas en catalogo: ${rows[0].count}`);
  } catch (err) {
    console.error("Error inicializando DB:", err.message);
  } finally {
    client.release();
  }
}

initDB();

function parseRefs(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === "string" && item.includes(" | ")) {
      const parts = item.split(" | ");
      return { manufacturer: parts[0].trim(), code: parts[1].trim() };
    }
    return item;
  });
}

function parseEquipment(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === "string" && item.includes(" | ")) {
      const parts = item.split(" | ");
      return { machine: parts[0].trim(), year: parts[1]?.trim(), type: parts[2]?.trim(), engine: parts[4]?.trim() };
    }
    return item;
  });
}

app.get("/", (req, res) => {
  res.json({ api: "ELIMFILTERS API", version: "3.2.1", database: "PostgreSQL", status: "running" });
});

app.get("/api/debug", async (req, res) => {
  try {
    const count = await pool.query("SELECT COUNT(*) FROM elimfilters_catalog");
    const sample = await pool.query("SELECT sku, codigo_base, filter_type FROM elimfilters_catalog LIMIT 5");
    res.json({ total_rows: parseInt(count.rows[0].count), sample: sample.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: err.message });
  }
});

async function searchByCode(searchCode) {
  const exactSql = `
    SELECT * FROM elimfilters_catalog
    WHERE sku = $1 OR codigo_base = $1
    LIMIT 1
  `;
  let result = await pool.query(exactSql, [searchCode]);

  if (result.rows.length === 0) {
    const oemSql = `
      SELECT * FROM elimfilters_catalog
      WHERE oem_codes::text ILIKE $1
      LIMIT 1
    `;
    result = await pool.query(oemSql, ["%" + searchCode + "%"]);
  }

  return result.rows[0] || null;
}

function buildResponse(row, searchCode) {
  return {
    elimfilters_sku:       row.sku,
    base_code:             row.codigo_base,
    filter_type:           row.filter_type,
    technology:            row.technology,
    installation_type:     row.installation_type,
    thread_size:           row.thread_size,
    height_mm:             row.height_mm,
    outer_diameter_mm:     row.outer_diameter_mm,
    gasket_od_mm:          row.gasket_od_mm,
    gasket_id_mm:          row.gasket_id_mm,
    iso_test_method:       row.iso_test_method,
    micron_rating:         row.micron_rating,
    nominal_efficiency:    row.nominal_efficiency,
    burst_pressure_psi:    row.burst_pressure_psi,
    collapse_pressure_psi: row.collapse_pressure_psi,
    duty:                  row.duty,
    oem_codes:             parseRefs(row.oem_codes),
    competitor_codes:      parseRefs(row.competitor_codes),
    applications:          parseEquipment(row.equipment_applications)
  };
}

// Acepta GET y POST - Compatible con plugin V6.2
app.all("/api/filters/search", async (req, res) => {
  try {
    const { code, q, search, sku, filter } = req.query || req.body || {};
    const raw = code || q || search || sku || filter;
    if (!raw) return res.status(400).json({ success: false, error: "code required" });
    const searchCode = (raw + "").trim().toUpperCase();

    console.log(`[SEARCH] Input: ${raw} → Búsqueda: ${searchCode}`);

    const row = await searchByCode(searchCode);
    if (!row) {
      console.log(`[SEARCH] No encontrado: ${searchCode}`);
      return res.status(404).json({ success: false, product: null });
    }

    console.log(`[SEARCH] Encontrado: ${row.sku}`);
    const product = buildResponse(row, searchCode);

    // Agregar cross_references para compatibilidad con plugin
    product.cross_references = row.oem_codes || [];

    res.json({ success: true, product });
  } catch (error) {
    console.error(`[SEARCH] Error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/filters/search/homologous", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: "code required" });
    const searchCode = code.trim().toUpperCase();

    const row = await searchByCode(searchCode);
    if (!row) return res.status(404).json({ success: false, error: "Not found" });

    res.json({ success: true, matched_code: searchCode, data: buildResponse(row, searchCode) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("API running on port 8080"));
