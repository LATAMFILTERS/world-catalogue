const express = require('express');
const router = express.Router();
const dbService = require('../services/fleetguard-db.service');

/**
 * 🔧 API Routes para Catálogo Fleetguard
 * Base: /api/fleetguard
 */

/**
 * GET /api/fleetguard/product/:sku
 * Obtiene un producto específico por SKU
 * Ejemplo: /api/fleetguard/product/LF14000NN
 */
router.get('/product/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await dbService.getFleetguardProduct(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Producto ${sku} no encontrado`,
        sku: sku,
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/search
 * Busca productos por nombre o especificaciones
 * Query params:
 *   - q: término de búsqueda
 *   - type: tipo de filtro (lube, fuel, air, etc.)
 *   - limit: límite de resultados (default: 20, max: 100)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    const searchLimit = Math.min(parseInt(limit) || 20, 100);

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
      ];
    }

    if (type) {
      filter.specifications = { $elemMatch: { key: 'Filter Type', value: { $regex: type, $options: 'i' } } };
    }

    const products = await dbService.getAllFleetguardProducts(filter, searchLimit);

    res.json({
      success: true,
      query: { q, type, limit: searchLimit },
      results_count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/catalog
 * Obtiene todos los productos del catálogo
 * Query params:
 *   - skip: número de resultados a saltar (para paginación)
 *   - limit: límite de resultados (default: 50, max: 500)
 *   - sort: campo para ordenar (default: sku)
 */
router.get('/catalog', async (req, res) => {
  try {
    const { skip = 0, limit = 50, sort = 'sku' } = req.query;
    const searchLimit = Math.min(parseInt(limit) || 50, 500);
    const searchSkip = parseInt(skip) || 0;

    const collection = require('../config/mongo.config').get().collection('fleetguard_products');
    const products = await collection
      .find({})
      .sort({ [sort]: 1 })
      .skip(searchSkip)
      .limit(searchLimit)
      .toArray();

    const total = await collection.countDocuments();

    res.json({
      success: true,
      pagination: {
        total,
        skip: searchSkip,
        limit: searchLimit,
        pages: Math.ceil(total / searchLimit),
      },
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/stats
 * Obtiene estadísticas del catálogo
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await dbService.getFleetguardStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/filter-types
 * Obtiene tipos de filtros disponibles
 */
router.get('/filter-types', async (req, res) => {
  try {
    const collection = require('../config/mongo.config').get().collection('fleetguard_products');
    const types = await collection.distinct('specifications.Media Type');

    res.json({
      success: true,
      data: {
        filter_types: types.filter(t => t),
        total_types: types.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/cross-reference/:oem_code
 * Busca productos por código OEM
 * Ejemplo: /api/fleetguard/cross-reference/1R1808
 */
router.get('/cross-reference/:oem_code', async (req, res) => {
  try {
    const { oem_code } = req.params;
    const collection = require('../config/mongo.config').get().collection('fleetguard_products');

    const products = await collection.find({
      'oem_cross_reference.oem_code': { $regex: oem_code, $options: 'i' }
    }).toArray();

    res.json({
      success: true,
      search_code: oem_code,
      results_count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/equipment/:equipment_name
 * Busca productos por compatibilidad de equipos
 * Ejemplo: /api/fleetguard/equipment/Freightliner
 */
router.get('/equipment/:equipment_name', async (req, res) => {
  try {
    const { equipment_name } = req.params;
    const collection = require('../config/mongo.config').get().collection('fleetguard_products');

    const products = await collection.find({
      'equipment_compatibility.equipment': { $regex: equipment_name, $options: 'i' }
    }).toArray();

    res.json({
      success: true,
      search_equipment: equipment_name,
      results_count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/fleetguard/maintenance-kit/:kit_sku
 * Busca componentes de un kit de mantenimiento
 * Ejemplo: /api/fleetguard/maintenance-kit/MK11015
 */
router.get('/maintenance-kit/:kit_sku', async (req, res) => {
  try {
    const { kit_sku } = req.params;
    const collection = require('../config/mongo.config').get().collection('fleetguard_products');

    const products = await collection.find({
      'maintenance_kits.maintenance_kit': { $regex: kit_sku, $options: 'i' }
    }).toArray();

    res.json({
      success: true,
      search_kit: kit_sku,
      results_count: products.length,
      data: products.map(p => ({
        sku: p.sku,
        name: p.name,
        maintenance_kits: p.maintenance_kits.filter(k => k.maintenance_kit.includes(kit_sku))
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * POST /api/fleetguard/batch-import
 * Importa un lote de productos (para testing)
 * Body: { products: [...] }
 */
router.post('/batch-import', async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Body debe contener array de productos',
      });
    }

    const results = await dbService.saveFleetguardBatch(products);

    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
