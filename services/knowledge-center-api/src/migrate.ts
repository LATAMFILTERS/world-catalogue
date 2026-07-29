import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/knowledge_center';
const MIGRATIONS_DIR = path.resolve(import.meta.url.replace('file://', ''), '../../migrations');

interface Migration {
  version: string;
  filename: string;
  sql: string;
}

async function ensureMigrationsTable(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS knowledge_center.schema_migrations (
      version text PRIMARY KEY,
      description text,
      executed_at timestamp DEFAULT now(),
      execution_time_ms integer,
      status text DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'ROLLED_BACK'))
    );
  `);
}

async function getMigrations(): Promise<Migration[]> {
  const phaseDir = path.resolve(import.meta.url.replace('file://', ''), '../../..', 'migrations/knowledge-center-phase2');

  if (!fs.existsSync(phaseDir)) {
    console.error(`Migrations directory not found: ${phaseDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(phaseDir)
    .filter(f => f.endsWith('.sql') && !f.startsWith('validate') && !f.startsWith('rollback'))
    .sort();

  return files.map(filename => ({
    version: path.basename(filename, '.sql'),
    filename,
    sql: fs.readFileSync(path.join(phaseDir, filename), 'utf-8'),
  }));
}

async function isAlreadyApplied(client: pg.PoolClient, version: string): Promise<boolean> {
  const result = await client.query(
    'SELECT 1 FROM knowledge_center.schema_migrations WHERE version = $1 AND status = $2',
    [version, 'SUCCESS']
  );
  return result.rowCount! > 0;
}

async function recordMigration(client: pg.PoolClient, version: string, timeMs: number, status: 'SUCCESS' | 'FAILED'): Promise<void> {
  await client.query(
    'INSERT INTO knowledge_center.schema_migrations (version, description, execution_time_ms, status) VALUES ($1, $2, $3, $4)',
    [version, `Phase 2 Migration: ${version}`, timeMs, status]
  );
}

async function migrate(): Promise<void> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const conn = await pool.connect();

  try {
    console.log('Creating schema_migrations table if not exists...');
    await ensureMigrationsTable(conn);

    const migrations = await getMigrations();
    console.log(`Found ${migrations.length} migrations`);

    let appliedCount = 0;
    let skippedCount = 0;

    for (const migration of migrations) {
      const alreadyApplied = await isAlreadyApplied(conn, migration.version);

      if (alreadyApplied) {
        console.log(`⊘ ${migration.version} (already applied)`);
        skippedCount++;
        continue;
      }

      console.log(`⟳ ${migration.version} (applying)...`);
      const startTime = Date.now();

      try {
        await conn.query('BEGIN');
        await conn.query(migration.sql);
        await recordMigration(conn, migration.version, Date.now() - startTime, 'SUCCESS');
        await conn.query('COMMIT');
        console.log(`✓ ${migration.version}`);
        appliedCount++;
      } catch (error) {
        await conn.query('ROLLBACK');
        await recordMigration(conn, migration.version, Date.now() - startTime, 'FAILED');
        console.error(`✗ ${migration.version}: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }

    console.log(`\nMigration Summary:`);
    console.log(`  Applied: ${appliedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Total: ${migrations.length}`);

    conn.release();
    await pool.end();
    process.exit(appliedCount > 0 ? 0 : 1);
  } catch (error) {
    console.error('Migration failed:', error);
    conn.release();
    await pool.end();
    process.exit(1);
  }
}

migrate();
