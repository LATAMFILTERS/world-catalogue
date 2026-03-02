const express = require("express");
const router = express.Router();
const donaldsonHDController = require("../controllers/donaldson.hd.controller");
const framLDController = require("../controllers/fram.ld.controller");
const importRoutes = require("./import.routes");
const mongoose = require("mongoose");

router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: "Falta parametro q" });
  try {
    const db = mongoose.connection.db;
    const col = db.collection("unified_filters");
    const searchCode = q.trim().toUpperCase();
    const escaped = searchCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tokenRegex = new RegExp("(^|\\|\\s*)" + escaped + "(\\s*\\||$)", "i");
    const filter = await col.findOne({
      $or: [
        { elimfiltersSKU: searchCode },
        { "ELIMFILTERS SKU": searchCode },
        { baseCode: searchCode },
        { "OEM Codes": tokenRegex },
        { "Cross Reference Codes": tokenRegex },
        { oemCodes: searchCode },
        { crossReferenceCodes: searchCode },
        { baldwinCode: searchCode },
        { fleetguardCode: searchCode },
        { mannCode: searchCode },
        { wixCode: searchCode },
      ]
    });
    if (!filter) return res.status(404).json({ success: false, message: "Filtro no encontrado", code: q });
    res.json({ success: true, data: filter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/alternatives", async (req, res) => {
  const { sku } = req.query;
  if (!sku) return res.status(400).json({ success: false, message: "Falta parametro sku" });
  try {
    const db  = mongoose.connection.db;
    const col = db.collection("unified_filters");
    const source = await col.findOne({
      $or: [{ elimfiltersSKU: sku.toUpperCase() }, { "ELIMFILTERS SKU": sku.toUpperCase() }]
    });
    if (!source) return res.status(404).json({ success: false, message: "SKU no encontrado" });
    const thread = source["Thread Size"];
    const od     = source["outer_diameter_mm_numeric"] || source["Outer Diameter (mm)"];
    const height = source["height_mm_numeric"]         || source["Height (mm)"];
    const ftype  = source["filterType"];
    if (!thread || !od || !height) return res.json({ success: true, data: [] });
    const alternatives = await col.find({
      "Thread Size": thread,
      outer_diameter_mm_numeric: parseFloat(od),
      height_mm_numeric: parseFloat(height),
      filterType: ftype,
      elimfiltersSKU: { $ne: sku.toUpperCase() },
      apiReady: true,
    }, {
      projection: {
        elimfiltersSKU: 1, "ELIMFILTERS SKU": 1,
        filterType: 1, images: 1,
        "Height (mm)": 1, "Height (inch)": 1,
        "Outer Diameter (mm)": 1, "Outer Diameter (inch)": 1,
        "Thread Size": 1,
      }
    }).limit(10).toArray();
    res.json({ success: true, data: alternatives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/scraper/donaldson/:code", donaldsonHDController);
router.get("/scraper/fram/:code", framLDController);
router.use(importRoutes);
module.exports = router;
