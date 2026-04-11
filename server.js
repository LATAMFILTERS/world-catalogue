const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const pgClient = new Client({
  host: process.env.PGHOST || "ballast.proxy.rlwy.net",
  port: process.env.PGPORT || 18263,
  database: process.env.PGDATABASE || "railway",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

pgClient.connect()
  .then(() => console.log("PostgreSQL conectado"))
  .catch(err => { console.error("PG error:", err.message); process.exit(1); });

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

function buildFilterData(row) {
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
    equipment_applications: Array.isArray(row.equipment_applications) ? row.equipment_applications : []
  };
}

app.get("/", (req, res) => {
  res.json({ api: "ELIMFILTERS API", version: "3.2.3", database: "PostgreSQL", status: "running" });
});

app.get("/api/filters/search/homologous", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: "code required" });
    const searchCode = code.trim().toUpperCase();
    const sql = `SELECT * FROM elimfilters_catalog WHERE sku = $1 OR codigo_base = $1 LIMIT 1`;
    const result = await pgClient.query(sql, [searchCode]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, matched_code: searchCode, data: buildFilterData(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/filters/search/vin", async (req, res) => {
  try {
    const { year, model, engine } = req.query;
    if (!model) return res.status(400).json({ success: false, error: "model required" });
    const searchModel = model.trim().toUpperCase();
    const searchYear = year ? year.trim().toUpperCase() : null;
    const searchEngine = engine ? engine.trim().toUpperCase() : null;
    let sql = `SELECT * FROM elimfilters_catalog WHERE equipment_applications IS NOT NULL AND equipment_applications::text ILIKE $1`;
    const params = ["%" + searchModel + "%"];
    if (searchYear) { sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`; params.push("%" + searchYear + "%"); }
    if (searchEngine) { sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`; params.push("%" + searchEngine + "%"); }
    sql += ` LIMIT 10`;
    const result = await pgClient.query(sql, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "No filters found", query: { year, model, engine } });
    const filters = result.rows.map(row => {
      const matched = (row.equipment_applications || []).filter(app => app.model && app.model.toUpperCase().includes(searchModel) && (!searchYear || (app.year && app.year.toUpperCase().includes(searchYear))) && (!searchEngine || (app.engine && app.engine.toUpperCase().includes(searchEngine))));
      return matched.length > 0 ? Object.assign(buildFilterData(row), { matched_applications: matched }) : null;
    }).filter(f => f !== null);
    res.json({ success: true, query: { year, model, engine }, total_matches: filters.length, filters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/filters/search/equipment", async (req, res) => {
  try {
    const { type, model, engine } = req.query;
    if (!model) return res.status(400).json({ success: false, error: "model required" });
    const searchType = type ? type.trim().toUpperCase() : null;
    const searchModel = model.trim().toUpperCase();
    const searchEngine = engine ? engine.trim().toUpperCase() : null;
    let sql = `SELECT * FROM elimfilters_catalog WHERE equipment_applications IS NOT NULL AND equipment_applications::text ILIKE $1`;
    const params = ["%" + searchModel + "%"];
    if (searchType) { sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`; params.push("%" + searchType + "%"); }
    if (searchEngine) { sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`; params.push("%" + searchEngine + "%"); }
    sql += ` LIMIT 10`;
    const result = await pgClient.query(sql, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "No filters found", query: { type, model, engine } });
    const filters = result.rows.map(row => {
      const matched = (row.equipment_applications || []).filter(app => (!searchType || (app.type && app.type.toUpperCase().includes(searchType))) && app.model && app.model.toUpperCase().includes(searchModel) && (!searchEngine || (app.engine && app.engine.toUpperCase().includes(searchEngine))));
      return matched.length > 0 ? Object.assign(buildFilterData(row), { matched_equipment: matched }) : null;
    }).filter(f => f !== null);
    res.json({ success: true, query: { type, model, engine }, total_matches: filters.length, filters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/filters/search/part", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: "code required" });
    const searchCode = code.trim().toUpperCase();
    const sql = `SELECT * FROM elimfilters_catalog WHERE sku ILIKE $1 OR codigo_base ILIKE $1 OR oem_codes::text ILIKE $1 OR competitor_codes::text ILIKE $1 LIMIT 10`;
    const result = await pgClient.query(sql, ["%" + searchCode + "%"]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "No filters found", query: { code: searchCode } });
    const filters = result.rows.map(row => buildFilterData(row));
    res.json({ success: true, query: { code: searchCode }, total_matches: filters.length, filters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("API running on port 8080"));