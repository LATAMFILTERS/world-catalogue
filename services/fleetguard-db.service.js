const db = require('../config/mongo.config');

/**
 * Servicio para guardar datos de Fleetguard en MongoDB
 */

async function saveFleetguardProduct(productData) {
  try {
    const collection = db.get().collection('fleetguard_products');

    const document = {
      sku: productData.sku?.toUpperCase(),
      name: productData.name,
      description: productData.description,
      specifications: productData.specifications || {},
      related_parts: productData.relatedParts || {},
      image_url: productData.imageUrl,
      product_url: productData.productUrl,
      source: 'fleetguard.com',
      scraped_at: new Date(),
      last_updated: new Date(),
    };

    const result = await collection.updateOne(
      { sku: document.sku },
      { $set: document },
      { upsert: true }
    );

    return {
      success: true,
      sku: document.sku,
      upserted: result.upsertedId ? true : false,
      modified: result.modifiedCount > 0,
    };
  } catch (err) {
    console.error(`Error guardando producto ${productData.sku}:`, err.message);
    return {
      success: false,
      sku: productData.sku,
      error: err.message,
    };
  }
}

async function saveFleetguardBatch(products) {
  console.log(`\n📦 Guardando lote de ${products.length} productos en MongoDB...`);
  const results = {
    success: 0,
    failed: 0,
    upserted: 0,
    details: [],
  };

  for (const product of products) {
    try {
      const result = await saveFleetguardProduct(product);
      results.details.push(result);

      if (result.success) {
        results.success++;
        if (result.upserted) results.upserted++;
      } else {
        results.failed++;
      }

      if (results.success % 50 === 0) {
        console.log(`  ✅ ${results.success}/${products.length} productos guardados`);
      }
    } catch (err) {
      console.error(`  ❌ Error en lote:`, err.message);
      results.failed++;
    }
  }

  console.log(`\n✅ Lote completado: ${results.success} exitosos, ${results.failed} fallidos`);
  return results;
}

async function getFleetguardProduct(sku) {
  try {
    const collection = db.get().collection('fleetguard_products');
    return await collection.findOne({ sku: sku.toUpperCase() });
  } catch (err) {
    console.error('Error recuperando producto:', err.message);
    return null;
  }
}

async function getAllFleetguardProducts(filter = {}, limit = 100) {
  try {
    const collection = db.get().collection('fleetguard_products');
    return await collection.find(filter).limit(limit).toArray();
  } catch (err) {
    console.error('Error recuperando productos:', err.message);
    return [];
  }
}

async function getFleetguardStats() {
  try {
    const collection = db.get().collection('fleetguard_products');
    const count = await collection.countDocuments();
    return {
      total_products: count,
      collection: 'fleetguard_products',
      database: 'connected',
    };
  } catch (err) {
    return {
      error: err.message,
      database: 'disconnected',
    };
  }
}

module.exports = {
  saveFleetguardProduct,
  saveFleetguardBatch,
  getFleetguardProduct,
  getAllFleetguardProducts,
  getFleetguardStats,
};
