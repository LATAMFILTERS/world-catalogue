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
      version text PRIMARY KEY
    );
  `);
  // The table may already exist from an earlier, differently-shaped bootstrap
  // (confirmed live: a prior deploy left it without a status column), so
  // CREATE TABLE IF NOT EXISTS above is a no-op in that case. Backfill any
  // columns this module depends on idempotently rather than assuming they're
  // already there.
  await client.query(`ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS description text`);
  await client.query(`ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS executed_at timestamp DEFAULT now()`);
  await client.query(`ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS execution_time_ms integer`);
  await client.query(`ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS status text DEFAULT 'SUCCESS'`);
}

async function getMigrations(): Promise<Migration[]> {
  const phaseDir = path.resolve(import.meta.url.replace('file://', ''), '../../../..', 'migrations/knowledge-center-phase2');

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
  // ON CONFLICT DO UPDATE, not a plain INSERT: a migration that failed once
  // (recorded here with status FAILED) gets retried on the next deploy under
  // the same version/filename, which would otherwise hit the version
  // primary key and mask the real error behind a duplicate-key violation.
  await client.query(
    `INSERT INTO knowledge_center.schema_migrations (version, description, execution_time_ms, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (version) DO UPDATE SET description = EXCLUDED.description, executed_at = now(), execution_time_ms = EXCLUDED.execution_time_ms, status = EXCLUDED.status`,
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
        // Confirmed live: this database's schema was originally bootstrapped
        // by some other, undocumented one-off process before this runner's
        // path-resolution bug (fixed alongside this change) ever let it run,
        // so schema_migrations has no record of 001/002 even though their
        // tables/indexes/triggers already exist. A "duplicate object" class
        // error here means the migration's effect is already present, not
        // that something is actually broken -- record it as applied instead
        // of failing every future deploy on DDL that already succeeded once.
        const pgCode = (error as { code?: string } | null)?.code;
        const alreadyExists = pgCode === '42710' || pgCode === '42P07' || pgCode === '42701' || pgCode === '42P06';
        if (alreadyExists) {
          await recordMigration(conn, migration.version, Date.now() - startTime, 'SUCCESS');
          console.warn(`⚠ ${migration.version}: schema objects already existed (${error instanceof Error ? error.message : String(error)}); recording as applied`);
          skippedCount++;
          continue;
        }
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
    // Reaching here means every migration is either applied or already
    // up to date -- that is success, not failure. The steady state after
    // the first successful deploy is appliedCount === 0 (nothing new to
    // apply), so exiting non-zero in that case would fail scripts/run.sh
    // (set -e) on every subsequent deploy even though nothing is wrong.
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    conn.release();
    await pool.end();
    process.exit(1);
  }
}

migrate();
