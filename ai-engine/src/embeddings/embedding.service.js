const OpenAI = require('openai');
const { EmbeddingCacheService } = require('../services/embedding-cache.service');
const { Logger } = require('../utils/logger');

class EmbeddingService {
    static client = null;
    static model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    static useCaching = process.env.EMBEDDING_CACHE_ENABLED !== 'false';

    static async initialize() {
        if (!this.client) {
            this.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
        return this.client;
    }

    static async generateEmbedding(text) {
        try {
            if (!text || text.trim().length === 0) {
                throw new Error('Text cannot be empty');
            }

            // Check cache first
            if (this.useCaching) {
                const cached = EmbeddingCacheService.get(text);
                if (cached) {
                    return cached;
                }
            }

            const client = await this.initialize();

            const response = await this.client.embeddings.create({
                model: this.model,
                input: text,
                encoding_format: 'float'
            });

            if (!response.data || response.data.length === 0) {
                throw new Error('No embedding returned from OpenAI');
            }

            const embedding = response.data[0].embedding;

            // Cache the result
            if (this.useCaching) {
                EmbeddingCacheService.set(text, embedding);
            }

            return embedding;
        } catch (err) {
            Logger.error('Embedding generation error', { error: err.message });
            throw err;
        }
    }

    static async generateBatchEmbeddings(texts) {
        try {
            if (!Array.isArray(texts) || texts.length === 0) {
                throw new Error('Texts must be non-empty array');
            }

            const client = await this.initialize();

            const response = await this.client.embeddings.create({
                model: this.model,
                input: texts,
                encoding_format: 'float'
            });

            const results = response.data.map((item, idx) => ({
                text: texts[item.index],
                embedding: item.embedding
            }));

            // Cache batch results
            if (this.useCaching) {
                results.forEach(r => {
                    EmbeddingCacheService.set(r.text, r.embedding);
                });
            }

            return results;
        } catch (err) {
            Logger.error('Batch embedding error', { error: err.message });
            throw err;
        }
    }

    static async generateProductEmbedding(product) {
        const textComponents = [
            product.sku,
            product.base_code,
            product.description || '',
            product.category || '',
            product.technology || '',
            product.type || '',
            (product.applications || []).join(', ')
        ].filter(Boolean).join(' | ');

        return this.generateEmbedding(textComponents);
    }

    static async generateQueryEmbedding(query) {
        return this.generateEmbedding(query);
    }

    static getCacheStats() {
        return EmbeddingCacheService.getStats();
    }

    static clearCache() {
        EmbeddingCacheService.clear();
    }
}

module.exports = { EmbeddingService };
