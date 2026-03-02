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

router.get("/scraper/donaldson/:code", donaldsonHDController);
router.get("/scraper/fram/:code", framLDController);
router.use(importRoutes);
module.exports = router;
