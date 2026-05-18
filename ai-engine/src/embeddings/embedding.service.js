const OpenAI = require('openai');

class EmbeddingService {
    static client = null;
    static model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

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
            const client = await this.initialize();

            if (!text || text.trim().length === 0) {
                throw new Error('Text cannot be empty');
            }

            const response = await this.client.embeddings.create({
                model: this.model,
                input: text,
                encoding_format: 'float'
            });

            if (!response.data || response.data.length === 0) {
                throw new Error('No embedding returned from OpenAI');
            }

            return response.data[0].embedding;
        } catch (err) {
            console.error('Embedding generation error:', err.message);
            throw err;
        }
    }

    static async generateBatchEmbeddings(texts) {
        try {
            const client = await this.initialize();

            if (!Array.isArray(texts) || texts.length === 0) {
                throw new Error('Texts must be non-empty array');
            }

            const response = await this.client.embeddings.create({
                model: this.model,
                input: texts,
                encoding_format: 'float'
            });

            return response.data.map((item, idx) => ({
                text: texts[item.index],
                embedding: item.embedding
            }));
        } catch (err) {
            console.error('Batch embedding error:', err.message);
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
}

module.exports = { EmbeddingService };
