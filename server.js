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

function parseEquipment(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === "string" && item.includes(" | ")) {
      const parts = item.split(" | ");
      return { type: parts[0]?.trim(), year: parts[1]?.trim(), model: parts[2]?.trim(), engine: parts[3]?.trim() };
    }
    return item;
  });
}

app.get("/", (req, res) => {
  res.json({ api: "ELIMFILTERS API", version: "3.2.1", database: "PostgreSQL", status: "running" });
});

app.get("/api/filters/search/homologous", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: "code required" });
    const searchCode = code.trim().toUpperCase();
    const sql = `
      SELECT * FROM elimfilters_catalog
      WHERE sku = $1 OR codigo_base = $1
      UNION ALL
      SELECT * FROM elimfilters_catalog
      WHERE sku != $1 AND (codigo_base IS NULL OR codigo_base != $1)
        AND oem_codes::text ILIKE $2
      LIMIT 1
    `;
    const result = await pgClient.query(sql, [searchCode, "%" + searchCode + "%"]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Not found" });
    const row = result.rows[0];
    const data = {
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
    res.json({ success: true, matched_code: searchCode, data });
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

    let sql = `SELECT sku, equipment_applications FROM elimfilters_catalog WHERE equipment_applications IS NOT NULL AND equipment_applications::text ILIKE $1`;
    const params = ["%" + searchModel + "%"];
    
    if (searchYear) {
      sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push("%" + searchYear + "%");
    }
    if (searchEngine) {
      sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push("%" + searchEngine + "%");
    }
    sql += ` LIMIT 10`;

    const result = await pgClient.query(sql, params);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "No filters found", query: { year, model, engine } });

    const matches = result.rows.map(row => {
      const apps = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
      const matched = apps.filter(app => {
        const modelMatch = app.model && app.model.toUpperCase().includes(searchModel);
        const yearMatch = !searchYear || (app.year && app.year.toUpperCase().includes(searchYear));
        const engineMatch = !searchEngine || (app.engine && app.engine.toUpperCase().includes(searchEngine));
        return modelMatch && yearMatch && engineMatch;
      });
      return { sku: row.sku, matched_applications: matched };
    }).filter(item => item.matched_applications.length > 0);

    res.json({ success: true, query: { year, model, engine }, total_matches: matches.length, filters: matches });
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

    let sql = `SELECT sku, equipment_applications FROM elimfilters_catalog WHERE equipment_applications IS NOT NULL AND equipment_applications::text ILIKE $1`;
    const params = ["%" + searchModel + "%"];
    
    if (searchType) {
      sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push("%" + searchType + "%");
    }
    if (searchEngine) {
      sql += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push("%" + searchEngine + "%");
    }
    sql += ` LIMIT 10`;

    const result = await pgClient.query(sql, params);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "No filters found", query: { type, model, engine } });

    const matches = result.rows.map(row => {
      const apps = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
      const matched = apps.filter(app => {
        const typeMatch = !searchType || (app.type && app.type.toUpperCase().includes(searchType));
        const modelMatch = app.model && app.model.toUpperCase().includes(searchModel);
        const engineMatch = !searchEngine || (app.engine && app.engine.toUpperCase().includes(searchEngine));
        return typeMatch && modelMatch && engineMatch;
      });
      return { sku: row.sku, matched_equipment: matched };
    }).filter(item => item.matched_equipment.length > 0);

    res.json({ success: true, query: { type, model, engine }, total_matches: matches.length, filters: matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("API running on port 8080"));