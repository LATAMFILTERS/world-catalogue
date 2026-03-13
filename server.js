const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const dbConfig = require('./config/mongo.config');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
dbConfig.init()
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// Import Fleetguard routes
const fleetguardRoutes = require('./routes/fleetguard.routes');
app.use('/api/fleetguard', fleetguardRoutes);

const filterSchema = new mongoose.Schema({}, { collection: "unified_filters", strict: false });
const Filter = mongoose.model("Filter", filterSchema);

app.get("/", (req, res) => {
  res.json({
    api: "World Catalogue API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      elimfilters: "/api/filters/search/homologous?code=XXXXX",
      fleetguard: "/api/fleetguard/catalog"
    },
    examples: {
      elimfilters: "https://world-catalogue-production.up.railway.app/api/filters/search/homologous?code=EL82051",
      fleetguard: "https://world-catalogue-production.up.railway.app/api/fleetguard/product/LF14000NN"
    }
  });
});

app.get("/api/filters/search/homologous", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: "code required" });
    
    const searchCode = code.toUpperCase();
    const filter = await Filter.findOne({
      $or: [
        { "ELIMFILTERS SKU": searchCode },
        { "OEM Codes": { $regex: searchCode, $options: "i" } },
        { "Cross Reference Codes": { $regex: searchCode, $options: "i" } }
      ]
    });
    
    if (!filter) return res.status(404).json({ success: false, error: "Not found" });
    
    res.json({
      success: true,
      matched_code: searchCode,
      data: filter
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(8080, () => console.log("API running on port 8080"));
