const { DatabaseService } = require('../db/database.service');
const { EmbeddingService } = require('../embeddings/embedding.service');
const { Logger } = require('../utils/logger');

class VectorSearchService {
    static async searchBySemanticSimilarity(query, limit = 5) {
        try {
            // Generate embedding for the query
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding(query);

            // Search in vector database
            const results = await DatabaseService.getProductsByVector(
                queryEmbedding,
                limit,
                parseFloat(process.env.VECTOR_SEARCH_THRESHOLD || 0.7)
            );

            Logger.debug('Vector search completed', { query: query.substring(0, 50), resultCount: results.length });
            return results;
        } catch (err) {
            Logger.error('Vector search failed', { query, error: err.message });
            // Still return empty but log the failure
            return [];
        }
    }

    static async findSimilarProducts(productSku, limit = 5) {
        try {
            const product = await DatabaseService.getProductBySku(productSku);
            if (!product) {
                Logger.warn('Product not found for similarity search', { sku: productSku });
                return [];
            }

            const embedding = await EmbeddingService.generateProductEmbedding(product);
            const results = await DatabaseService.getProductsByVector(embedding, limit + 1);

            // Filter out the original product
            const similar = results.filter(r => r.sku !== productSku).slice(0, limit);
            Logger.debug('Similar products found', { sku: productSku, count: similar.length });
            return similar;
        } catch (err) {
            Logger.error('Similar products search failed', { sku: productSku, error: err.message });
            return [];
        }
    }

    static async searchProductsHybrid(query, limit = 10) {
        try {
            // Get traditional SQL results
            const sqlResults = await DatabaseService.searchProducts(query, limit);
            Logger.debug('SQL search results', { query: query.substring(0, 50), count: sqlResults.length });

            // Get vector search results
            const vectorResults = await this.searchBySemanticSimilarity(query, limit);

            // Merge and deduplicate
            const merged = {};

            // Add SQL results (higher priority for exact/prefix matches)
            sqlResults.forEach((product, idx) => {
                merged[product.sku] = {
                    ...product,
                    relevanceScore: 1.0 - (idx * 0.1),
                    source: 'sql'
                };
            });

            // Add vector results (if not already present)
            vectorResults.forEach((product, idx) => {
                if (!merged[product.sku]) {
                    merged[product.sku] = {
                        ...product,
                        relevanceScore: (product.similarity || 0.8) * 0.9,
                        source: 'vector'
                    };
                }
            });

            // Sort by relevance score
            const results = Object.values(merged)
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit);

            Logger.info('Hybrid search completed', {
                query: query.substring(0, 50),
                sqlResults: sqlResults.length,
                vectorResults: vectorResults.length,
                totalUnique: Object.keys(merged).length,
                returned: results.length
            });

            return results;
        } catch (err) {
            Logger.error('Hybrid search failed, falling back to SQL', { query, error: err.message });
            // Fallback to SQL search
            return DatabaseService.searchProducts(query, limit);
        }
    }

    static async getClustersForTechnology(technology) {
        try {
            const products = await DatabaseService.getProductsByTechnology(technology, 50);
            if (products.length === 0) {
                Logger.warn('No products found for technology clustering', { technology });
                return [];
            }

            // Generate embeddings for clustering analysis
            const embeddings = await EmbeddingService.generateBatchEmbeddings(
                products.map(p => `${p.type} ${p.description}`)
            );

            Logger.info('Technology clustering completed', { technology, productCount: products.length });

            return {
                technology,
                productCount: products.length,
                embeddings: embeddings.map((e, idx) => ({
                    ...products[idx],
                    embedding: e.embedding
                }))
            };
        } catch (err) {
            Logger.error('Clustering failed', { technology, error: err.message });
            return [];
        }
    }
}

module.exports = { VectorSearchService };
