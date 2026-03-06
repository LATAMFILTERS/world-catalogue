const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');

router.get('/filters/search/homologous', filterController.searchHomologousByCode);
router.get('/filters', filterController.getAllFilters);
router.get('/health', (req, res) => res.json({ status: 'OK' }));

module.exports = router;
