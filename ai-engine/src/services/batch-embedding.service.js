const { DatabaseService } = require('../db/database.service');
const { EmbeddingService } = require('../embeddings/embedding.service');

class BatchEmbeddingService {
    static async embedAllProducts() {
        try {
            console.log('\n⏳ Starting batch embedding of all products...');

            // Get all products without embeddings
            const pool = await DatabaseService.initialize();
            const result = await pool.query(
                `SELECT sku, base_code, description, category, technology, type, applications
                 FROM filters
                 WHERE embedding IS NULL
                 LIMIT 1000`
            );

            const products = result.rows;
            if (products.length === 0) {
                console.log('✓ All products already embedded');
                return true;
            }

            console.log(`  Found ${products.length} products to embed`);

            // Embed in batches (5 at a time to respect rate limits)
            const batchSize = 5;
            let embedded = 0;
            let failed = 0;

            for (let i = 0; i < products.length; i += batchSize) {
                const batch = products.slice(i, i + batchSize);

                // Process batch in parallel
                const results = await Promise.all(
                    batch.map(async (product) => {
                        try {
                            // Generate embedding for product metadata
                            const text = `${product.sku} ${product.base_code} ${product.description} ${product.category} ${product.technology}`;
                            const embedding = await EmbeddingService.generateEmbedding(text);

                            // Store in database
                            const stored = await DatabaseService.storeEmbedding(product.sku, embedding);

                            if (stored) {
                                embedded++;
                                return { success: true, sku: product.sku };
                            } else {
                                failed++;
                                return { success: false, sku: product.sku };
                            }
                        } catch (err) {
                            failed++;
                            console.warn(`  ⚠ Failed to embed ${product.sku}: ${err.message}`);
                            return { success: false, sku: product.sku };
                        }
                    })
                );

                // Log progress
                const progress = Math.min(i + batchSize, products.length);
                console.log(`  ✓ Embedded ${progress}/${products.length} products`);

                // Rate limiting delay (1 second between batches)
                if (i + batchSize < products.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`\n✓ Batch embedding complete: ${embedded} embedded, ${failed} failed`);
            return true;
        } catch (err) {
            console.error('❌ Batch embedding failed:', err.message);
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
            console.error('Failed to get embedding stats:', err.message);
            return null;
        }
    }
}

module.exports = { BatchEmbeddingService };
