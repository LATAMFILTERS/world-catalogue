const { DatabaseService } = require('../db/database.service');
const { EmbeddingService } = require('../embeddings/embedding.service');
const { Logger } = require('../utils/logger');

class BatchEmbeddingService {
    static async embedAllProducts() {
        try {
            Logger.info('Starting batch embedding of all products');

            const pool = await DatabaseService.initialize();
            const result = await pool.query(
                `SELECT sku, base_code, description, category, technology, type, applications
                 FROM filters
                 WHERE embedding IS NULL
                 LIMIT 1000`
            );

            const products = result.rows;
            if (products.length === 0) {
                Logger.info('All products already embedded');
                return true;
            }

            Logger.info('Products to embed found', { count: products.length });

            const batchSize = 5;
            let embedded = 0;
            let failed = 0;

            for (let i = 0; i < products.length; i += batchSize) {
                const batch = products.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (product) => {
                        try {
                            const text = `${product.sku} ${product.base_code} ${product.description} ${product.category} ${product.technology}`;
                            const embedding = await EmbeddingService.generateEmbedding(text);
                            const stored = await DatabaseService.storeEmbedding(product.sku, embedding);

                            if (stored) {
                                embedded++;
                            } else {
                                failed++;
                            }
                        } catch (err) {
                            failed++;
                            Logger.warn('Failed to embed product', { sku: product.sku, error: err.message });
                        }
                    })
                );

                const progress = Math.min(i + batchSize, products.length);
                Logger.debug('Batch embedding progress', { done: progress, total: products.length });

                if (i + batchSize < products.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            Logger.info('Batch embedding complete', { embedded, failed });
            return true;
        } catch (err) {
            Logger.error('Batch embedding failed', { error: err.message });
            return false;
        }
    }

    static async getEmbeddingStats() {
        try {
            const pool = await DatabaseService.initialize();
            const result = await pool.query(
                `SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as embedded,
                    COUNT(CASE WHEN embedding IS NULL THEN 1 END) as not_embedded
                 FROM filters`
            );
            return result.rows[0];
        } catch (err) {
            Logger.error('Failed to get embedding stats', { error: err.message });
            return null;
        }
    }
}

module.exports = { BatchEmbeddingService };
