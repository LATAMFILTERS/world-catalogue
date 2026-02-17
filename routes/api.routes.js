const express = require("express");
const router = express.Router();
const donaldsonHDController = require("../controllers/donaldson.hd.controller");
const framLDController = require("../controllers/fram.ld.controller");
const importRoutes = require("./import.routes");
const mongoose = require("mongoose");

// Search en unified_filters
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: "Falta parametro q" });

  try {
    const db = mongoose.connection.db;
    const col = db.collection("unified_filters");
    const searchCode = q.trim().toUpperCase();

    const filter = await col.findOne({
      $or: [
        { baseCode: searchCode },
        { elimfiltersSKU: searchCode },
        { oemCodes: searchCode },
        { crossReferenceCodes: { $regex: `^${searchCode}(:|$)`, $options: "i" } }
      ]
    });

    if (!filter) {
      return res.status(404).json({ success: false, message: "Filtro no encontrado", code: q });
    }

    res.json({ success: true, data: filter });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// HD scraper
router.get("/scraper/donaldson/:code", donaldsonHDController);
// LD scraper
router.get("/scraper/fram/:code", framLDController);
// Import routes
router.use(importRoutes);

module.exports = router;
