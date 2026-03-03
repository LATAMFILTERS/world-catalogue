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

    // ── Regex para campos planos pipe-separated (OEM Codes / Cross Reference Codes)
    // Formato: "BRAND CODE1, CODE2 | BRAND2 CODE3"
    // Busca el código como token independiente
    const tokenRegex = new RegExp(
      "(^|[|,]\\s*)[A-Z0-9 ._/-]*\\b" + escaped + "\\b",
      "i"
    );

    // ── Regex para campos rich (crossRefRich / oemCodesRich)
    // Formato: "Brand##CODE | Brand##CODE"
    // Busca ##CODE exacto
    const richRegex = new RegExp(
      "##" + escaped + "(\\s*\\||$)",
      "i"
    );

    const filter = await col.findOne({
      $or: [
        // ── Búsqueda por SKU ELIMFILTERS
        { elimfiltersSKU: searchCode },
        { "ELIMFILTERS SKU": searchCode },

        // ── Búsqueda por códigos de referencia conocidos
        { baseCode: searchCode },
        { baldwinCode: searchCode },
        { fleetguardCode: searchCode },
        { mannCode: searchCode },
        { wixCode: searchCode },

        // ── Búsqueda en campos ricos (PRIORIDAD - formato Marca##Codigo)
        { crossRefRich: richRegex },
        { oemCodesRich: richRegex },

        // ── Búsqueda en campos planos (fallback)
        { "OEM Codes": tokenRegex },
        { "Cross Reference Codes": tokenRegex },
        { oemCodes: searchCode },
        { crossReferenceCodes: searchCode },
      ]
    });

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: "Filtro no encontrado",
        code: q
      });
    }

    res.json({ success: true, data: filter });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/alternatives", async (req, res) => {
  const { sku } = req.query;
  if (!sku) return res.status(400).json({ success: false, message: "Falta parametro sku" });

  try {
    const db = mongoose.connection.db;
    const col = db.collection("unified_filters");

    const source = await col.findOne({
      $or: [
        { elimfiltersSKU: sku.toUpperCase() },
        { "ELIMFILTERS SKU": sku.toUpperCase() }
      ]
    });

    if (!source) return res.status(404).json({ success: false, message: "SKU no encontrado" });

    const thread = source["Thread Size"];
    const od     = source["outer_diameter_mm_numeric"] || source["Outer Diameter (mm)"];
    const height = source["height_mm_numeric"]         || source["Height (mm)"];
    const ftype  = source["filterType"];

    if (!thread || !od || !height) return res.json({ success: true, data: [] });

    const odVal = parseFloat(od);
    const htVal = parseFloat(height);

    const alternatives = await col.find({
      "Thread Size": thread,
      outer_diameter_mm_numeric: { $gte: odVal - 2, $lte: odVal + 2 },
      height_mm_numeric:         { $gte: htVal - 2, $lte: htVal + 2 },
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
