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

const filterSchema = new mongoose.Schema({}, { collection: "unified_filters", strict: false });
const Filter = mongoose.model("Filter", filterSchema);

app.get("/", (req, res) => {
  res.json({
    api: "ELIMFILTERS API",
    version: "1.0.0",
    status: "running",
    endpoint: "/api/filters/search/homologous?code=XXXXX",
    example: "https://world-catalogue-production.up.railway.app/api/filters/search/homologous?code=EL82051"
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
