const express = require("express");
const router = express.Router();
const donaldsonHDController = require("../controllers/donaldson.hd.controller");
const framLDController = require("../controllers/fram.ld.controller");
const importRoutes = require("./import.routes");
const pdfRoutes = require("./pdf.routes");

// HD scraper
router.get("/scraper/donaldson/:code", donaldsonHDController);

// LD scraper
router.get("/scraper/fram/:code", framLDController);

// Import routes
router.use(importRoutes);

// PDF processing routes
router.use("/pdf", pdfRoutes);

module.exports = router;