const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://elimfilters_db_admin:Elim2026@cluster0.dll4jew.mongodb.net/ELIMFILTERS_DB?appName=Cluster0&retryWrites=true&w=majority";

mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

// Two collections, both with flexible schema
const schemaOpts = { strict: false };
const FilterNew     = mongoose.model("FilterNew",     new mongoose.Schema({}, { ...schemaOpts, collection: "filters" }));
const FilterUnified = mongoose.model("FilterUnified", new mongoose.Schema({}, { ...schemaOpts, collection: "unified_filters" }));

app.get("/", (req, res) => {
  res.json({
    api: "ELIMFILTERS API",
    version: "2.0.0",
    status: "running",
    endpoint: "/api/filters/search/homologous?code=XXXXX",
    example: "https://world-catalogue-production.up.railway.app/api/filters/search/homologous?code=EL81005"
  });
});

app.get("/api/filters/search/homologous", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: "code required" });

    const searchCode = code.trim().toUpperCase();

    // Query covering both schemas
    const query = {
      $or: [
        // New schema (filters collection) - lowercase underscore fields
        { elimfilters_sku: searchCode },
        { base_code: searchCode },
        { "oem_codes.code": searchCode },
        { "competitor_codes.code": searchCode },
        // Old/turbine schema (unified_filters) - fields with spaces
        { "ELIMFILTERS SKU": searchCode },
        { sourcePart: searchCode },
        { "crossRefRich": { $regex: searchCode, $options: "i" } },
        { "oemCodesRich":  { $regex: searchCode, $options: "i" } }
      ]
    };

    // Search both collections in parallel
    const [filterNew, filterUnified] = await Promise.all([
      FilterNew.findOne(query).lean(),
      FilterUnified.findOne(query).lean()
    ]);

    const result = filterNew || filterUnified;

    if (!result) return res.status(404).json({ success: false, error: "Not found" });

    res.json({ success: true, matched_code: searchCode, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/filters", async (req, res) => {
  try {
    const [a, b] = await Promise.all([
      FilterNew.find({}, { elimfilters_sku: 1, "ELIMFILTERS SKU": 1, filter_type: 1 }).limit(10).lean(),
      FilterUnified.find({}, { "ELIMFILTERS SKU": 1, filterType: 1 }).limit(10).lean()
    ]);
    res.json({ success: true, data: [...a, ...b] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(8080, () => console.log("API running on port 8080"));
