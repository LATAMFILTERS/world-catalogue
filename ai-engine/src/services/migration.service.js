const fs = require('fs');
const path = require('path');
const { DatabaseService } = require('../db/database.service');
const { Logger } = require('../utils/logger');

class MigrationService {
    static async runStartupMigrations() {
        try {
            Logger.info('Running database migrations');

            const pool = await DatabaseService.initialize();
            const client = await pool.connect();

            try {
                const sqlPath = path.join(__dirname, '../../migrations/init-pgvector.sql');
                const sql = fs.readFileSync(sqlPath, 'utf8');

                await client.query(sql);

                Logger.info('Migrations applied', {
                    migration: 'init-pgvector.sql'
                });

                const verification = await client.query(
                    `SELECT
                        (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'filters' AND indexname LIKE '%embedding%') as indexes_count,
                        (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='filters' AND column_name='embedding')) as has_embedding_column,
                        (SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')) as pgvector_enabled
                    `
                );

                const result = verification.rows[0];
                Logger.info('Migration verification', {
                    pgvector: result.pgvector_enabled,
                    embeddingColumn: result.has_embedding_column,
                    indexes: result.indexes_count > 0 ? 'created' : 'missing'
                });

                return true;
            } finally {
                client.release();
            }
        } catch (err) {
            Logger.error('Migration failed', { error: err.message });
            return false;
        }
    }
}

module.exports = { MigrationService };
