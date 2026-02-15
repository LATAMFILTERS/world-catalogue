const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdf.controller');

// POST /api/pdf/process - Process a PDF file
router.post('/process', pdfController);

module.exports = router;