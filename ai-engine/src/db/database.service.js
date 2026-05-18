const { Pool } = require('pg');

class DatabaseService {
    static pool = null;

    static async initialize() {
        if (!this.pool) {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
                max: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 8000
            });

            this.pool.on('error', (err) => {
                console.error('DB Pool Error:', err.message);
            });

            await this.checkConnection();
        }
        return this.pool;
    }

    static async checkConnection() {
        const pool = this.pool || await this.initialize();
        await pool.query('SELECT 1');
    }

    // ──────────────────── PRODUCT QUERIES ──────────────────
    static async getAllProducts(limit = 100) {
        const pool = await this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    media_type, outer_diameter, inner_diameter, length,
                    efficiency, type, style, competitor_codes, oem_codes,
                    cross_references, applications
             FROM filters
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    static async getProductBySku(sku) {
        const pool = await this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    media_type, outer_diameter, inner_diameter, length,
                    efficiency, type, style, competitor_codes, oem_codes,
                    cross_references, applications
             FROM filters
             WHERE UPPER(sku) = $1`,
            [sku.toUpperCase()]
        );
        return result.rows[0] || null;
    }

    static async searchProducts(query, limit = 20) {
        const pool = await this.initialize();
        const searchTerm = `%${query}%`;
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    media_type, outer_diameter, inner_diameter, length,
                    efficiency, type, style, competitor_codes, oem_codes,
                    cross_references, applications
             FROM filters
             WHERE UPPER(sku) LIKE $1
                OR UPPER(base_code) LIKE $1
                OR competitor_codes::text ILIKE $2
                OR oem_codes::text ILIKE $2
                OR cross_references::text ILIKE $2
                OR UPPER(category) LIKE $1
             LIMIT $3`,
            [query.toUpperCase() + '%', searchTerm, limit]
        );
        return result.rows;
    }

    // ──────────────────── CROSS-REFERENCE QUERIES ──────────────────
    static async findCrossReferences(code, limit = 20) {
        const pool = await this.initialize();
        const searchTerm = `%${code}%`;
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    competitor_codes, oem_codes, cross_references,
                    applications, type, efficiency
             FROM filters
             WHERE competitor_codes::text ILIKE $1
                OR oem_codes::text ILIKE $1
                OR cross_references::text ILIKE $1
             LIMIT $2`,
            [searchTerm, limit]
        );
        return result.rows;
    }

    // ──────────────────── TECHNOLOGY QUERIES ──────────────────
    static async getProductsByTechnology(technology, limit = 20) {
        const pool = await this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    media_type, efficiency, type, applications
             FROM filters
             WHERE LOWER(technology) LIKE LOWER($1)
             LIMIT $2`,
            [`%${technology}%`, limit]
        );
        return result.rows;
    }

    // ──────────────────── MACHINE COMPATIBILITY QUERIES ──────────────────
    static async getProductsByApplication(machine, limit = 20) {
        const pool = await this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    type, efficiency, applications
             FROM filters
             WHERE applications::text ILIKE $1
             LIMIT $2`,
            [`%${machine}%`, limit]
        );
        return result.rows;
    }

    // ──────────────────── INVENTORY QUERIES ──────────────────
    static async getProductInventory(sku) {
        const pool = await this.initialize();
        const product = await this.getProductBySku(sku);
        if (!product) return null;

        return {
            sku,
            name: product.description,
            available: true,
            stockLevel: 'Available'
        };
    }

    // ──────────────────── STATS QUERIES ──────────────────
    static async getFilterStats() {
        const pool = await this.initialize();
        const result = await pool.query(
            `SELECT COUNT(*) as total_filters,
                    COUNT(DISTINCT technology) as technologies,
                    COUNT(DISTINCT category) as categories,
                    COUNT(DISTINCT type) as types
             FROM filters`
        );
        return result.rows[0];
    }

    // ──────────────────── VECTOR SEARCH SUPPORT ──────────────────
    static async enableVectorSearch() {
        const pool = await this.initialize();
        try {
            await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
            console.log('✓ pgvector extension enabled');
            return true;
        } catch (err) {
            console.warn('⚠ pgvector extension setup:', err.message);
            return false;
        }
    }

    static async getProductsByVector(embedding, limit = 5, threshold = 0.7) {
        const pool = await this.initialize();
        try {
            const result = await pool.query(
                `SELECT sku, base_code, description, technology, category,
                        1 - (embedding <=> $1::vector) as similarity
                 FROM filters
                 WHERE embedding IS NOT NULL
                 AND (1 - (embedding <=> $1::vector)) > $2
                 ORDER BY similarity DESC
                 LIMIT $3`,
                [JSON.stringify(embedding), threshold, limit]
            );
            return result.rows;
        } catch (err) {
            console.warn('Vector search failed:', err.message);
            return [];
        }
    }

    static async storeEmbedding(sku, embedding) {
        const pool = await this.initialize();
        try {
            await pool.query(
                `UPDATE filters
                 SET embedding = $1::vector
                 WHERE UPPER(sku) = $2`,
                [JSON.stringify(embedding), sku.toUpperCase()]
            );
            return true;
        } catch (err) {
            console.warn(`Could not store embedding for ${sku}:`, err.message);
            return false;
        }
    }

    static async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = { DatabaseService };
