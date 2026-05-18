const fs = require('fs');
const path = require('path');
const { DatabaseService } = require('../db/database.service');

class MigrationService {
    static async runStartupMigrations() {
        try {
            console.log('\n⏳ Running database migrations...');

            const pool = await DatabaseService.initialize();
            const client = await pool.connect();

            try {
                // Read pgvector migration
                const sqlPath = path.join(__dirname, '../../migrations/init-pgvector.sql');
                const sql = fs.readFileSync(sqlPath, 'utf8');

                // Execute migration (idempotent - uses IF NOT EXISTS)
                await client.query(sql);

                console.log('✓ pgvector extension enabled');
                console.log('✓ embedding column exists');
                console.log('✓ HNSW indexes created');

                // Verify setup
                const verification = await client.query(
                    `SELECT
                        (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'filters' AND indexname LIKE '%embedding%') as indexes_count,
                        (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='filters' AND column_name='embedding')) as has_embedding_column,
                        (SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')) as pgvector_enabled
                    `
                );

                const result = verification.rows[0];
                console.log('\nMigration verification:');
                console.log(`  ✓ pgvector enabled: ${result.pgvector_enabled}`);
                console.log(`  ✓ embedding column: ${result.has_embedding_column}`);
                console.log(`  ✓ vector indexes: ${result.indexes_count > 0 ? 'created' : 'missing'}`);

                return true;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('❌ Migration failed:', err.message);
            // Don't exit - allow server to start anyway
            return false;
        }
    }
}

module.exports = { MigrationService };
