const { Pool } = require('pg');

class DatabaseService {
    static pool = null;

    static initialize() {
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
        }
        return this.pool;
    }

    static async checkConnection() {
        const pool = this.initialize();
        await pool.query('SELECT 1');
    }

    static async searchFilters(query, limit = 20) {
        const pool = this.initialize();
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
             LIMIT $3`,
            [query.toUpperCase() + '%', '%' + query + '%', limit]
        );
        return result.rows;
    }

    static async getFilterBySku(sku) {
        const pool = this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    media_type, outer_diameter, inner_diameter, length,
                    efficiency, type, style, competitor_codes, oem_codes,
                    cross_references, applications
             FROM filters
             WHERE UPPER(sku) = $1
             LIMIT 1`,
            [sku.toUpperCase()]
        );
        return result.rows[0] || null;
    }

    static async findCrossReferences(code, limit = 20) {
        const pool = this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    competitor_codes, oem_codes, cross_references
             FROM filters
             WHERE competitor_codes::text ILIKE $1
                OR oem_codes::text ILIKE $1
                OR cross_references::text ILIKE $1
             LIMIT $2`,
            ['%' + code + '%', limit]
        );
        return result.rows;
    }

    static async searchByTechnology(technology, limit = 20) {
        const pool = this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, technology, category, description,
                    media_type, efficiency, type, applications
             FROM filters
             WHERE LOWER(technology) LIKE LOWER($1)
             LIMIT $2`,
            ['%' + technology + '%', limit]
        );
        return result.rows;
    }

    static async searchByCategory(category, limit = 20) {
        const pool = this.initialize();
        const result = await pool.query(
            `SELECT sku, base_code, category, technology, description,
                    type, media_type, applications
             FROM filters
             WHERE LOWER(category) LIKE LOWER($1)
             LIMIT $2`,
            ['%' + category + '%', limit]
        );
        return result.rows;
    }

    static async getFilterStats() {
        const pool = this.initialize();
        const result = await pool.query(
            `SELECT COUNT(*) as total_filters,
                    COUNT(DISTINCT technology) as technologies,
                    COUNT(DISTINCT category) as categories,
                    COUNT(DISTINCT type) as types
             FROM filters`
        );
        return result.rows[0];
    }

    static async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = { DatabaseService };
