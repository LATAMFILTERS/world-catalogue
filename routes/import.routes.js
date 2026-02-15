const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/import.controller');

// Multer config (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/import/crossref - Upload CSV file
router.post('/import/crossref', upload.single('file'), importController);

module.exports = router;
