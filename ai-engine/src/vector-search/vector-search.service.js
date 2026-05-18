const { DatabaseService } = require('../db/database.service');
const { EmbeddingService } = require('../embeddings/embedding.service');

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

            return results;
        } catch (err) {
            console.error('Vector search error:', err.message);
            return [];
        }
    }

    static async findSimilarProducts(productSku, limit = 5) {
        try {
            const product = await DatabaseService.getProductBySku(productSku);
            if (!product) {
                throw new Error(`Product not found: ${productSku}`);
            }

            const embedding = await EmbeddingService.generateProductEmbedding(product);
            const results = await DatabaseService.getProductsByVector(embedding, limit + 1);

            // Filter out the original product
            return results.filter(r => r.sku !== productSku).slice(0, limit);
        } catch (err) {
            console.error('Similar products search error:', err.message);
            return [];
        }
    }

    static async searchProductsHybrid(query, limit = 10) {
        try {
            // Get traditional SQL results
            const sqlResults = await DatabaseService.searchProducts(query, limit);

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
            return Object.values(merged)
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit);
        } catch (err) {
            console.error('Hybrid search error:', err.message);
            // Fallback to SQL search
            return DatabaseService.searchProducts(query, limit);
        }
    }

    static async getClustersForTechnology(technology) {
        try {
            const products = await DatabaseService.getProductsByTechnology(technology, 50);
            if (products.length === 0) return [];

            // Generate embeddings for clustering analysis
            const embeddings = await EmbeddingService.generateBatchEmbeddings(
                products.map(p => `${p.type} ${p.description}`)
            );

            return {
                technology,
                productCount: products.length,
                embeddings: embeddings.map((e, idx) => ({
                    ...products[idx],
                    embedding: e.embedding
                }))
            };
        } catch (err) {
            console.error('Clustering error:', err.message);
            return [];
        }
    }
}

module.exports = { VectorSearchService };
