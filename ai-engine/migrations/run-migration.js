require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting pgvector migration...\n');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'init-pgvector.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute migration
        await client.query(sql);

        console.log('✓ pgvector extension enabled');
        console.log('✓ embedding column added to filters table');
        console.log('✓ HNSW indexes created for vector search');
        console.log('\n✓ Migration completed successfully!');

        // Verify setup
        const verification = await client.query(
            `SELECT
                (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'filters' AND indexname LIKE '%embedding%') as indexes_count,
                (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='filters' AND column_name='embedding')) as has_embedding_column,
                (SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')) as pgvector_enabled
            `
        );

        const result = verification.rows[0];
        console.log('\nVerification:');
        console.log(`  - pgvector enabled: ${result.pgvector_enabled}`);
        console.log(`  - embedding column exists: ${result.has_embedding_column}`);
        console.log(`  - vector indexes created: ${result.indexes_count}`);

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
