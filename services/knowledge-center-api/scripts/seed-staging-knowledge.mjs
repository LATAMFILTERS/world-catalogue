#!/usr/bin/env node

/**
 * Staging Knowledge Seed Script
 *
 * Creates a minimal test knowledge record for end-to-end validation.
 * Safe to re-run: skips if record already exists.
 * Clearly marked as staging/test data.
 * Exit code: 0 on success, 1 on failure
 */

import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/knowledge_center';
const STAGING_RECORD_EXTERNAL_ID = 'KC-STAGING-ISO-16889-CLEANLINESS-v1.0';

const testKnowledgeRecord = {
  title: '[STAGING TEST] ISO 16889 Cleanliness Code Interpretation',
  summary: 'A reference guide to understanding ISO 16889 cleanliness codes and their practical implications for equipment protection.',
  recordType: 'STANDARD',
  schemaVersion: '1.0',
  content: {
    staged: true,
    testRecord: true,
    purpose: 'End-to-end validation of knowledge-engine-runtime',
    standard: 'ISO 16889:2015',
    description: 'ISO 16889 defines the test methods and cleanliness code classification system for hydraulic fluids. A cleanliness code such as 16/14/11 represents the maximum particle count in three particle size ranges: > 4µm, > 6µm, and > 14µm particles per milliliter.',
    codeFormat: {
      notation: 'ISO 16889 Code: X/Y/Z',
      x: 'Maximum number of particles > 4µm per mL',
      y: 'Maximum number of particles > 6µm per mL',
      z: 'Maximum number of particles > 14µm per mL',
    },
    commonCodes: {
      '17/15/12': 'Typical new fluid or moderately filtered circuit',
      '16/14/11': 'System-level protection target for bearing reliability',
      '15/13/10': 'Tight control for precision hydraulic systems',
    },
    measuringMethod: 'ISO 4406 automated particle counters measure fluid samples using laser diffraction or light blockage.',
  },
  changeReason: 'STAGING_TEST_RECORD - Safe to delete after validation',
};

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const conn = await pool.connect();

  try {
    // Check if record already exists
    console.log(`Checking for existing record: ${STAGING_RECORD_EXTERNAL_ID}`);
    const existing = await conn.query(
      'SELECT id FROM knowledge_center.knowledge_records WHERE external_id = $1',
      [STAGING_RECORD_EXTERNAL_ID]
    );

    if (existing.rowCount > 0) {
      console.log(`✓ Record already exists (skipping): ${STAGING_RECORD_EXTERNAL_ID}`);
      conn.release();
      await pool.end();
      process.exit(0);
    }

    // Create system actor for staging records
    console.log('Ensuring SYSTEM actor exists...');
    const actorResult = await conn.query(
      `INSERT INTO knowledge_center.actors (actor_type, display_name, is_active)
       VALUES ('SYSTEM', 'STAGING_SEEDER', true)
       ON CONFLICT (actor_type, display_name) DO UPDATE SET is_active = true
       RETURNING id`,
      []
    );
    const systemActorId = actorResult.rows[0].id;

    // Create knowledge record
    console.log(`Creating staging knowledge record...`);
    const recordId = uuidv4();
    const versionId = uuidv4();
    const now = new Date().toISOString();

    await conn.query('BEGIN');

    // Insert record
    await conn.query(
      `INSERT INTO knowledge_center.knowledge_records
       (id, external_id, record_type, lifecycle_status, production_eligible, owner_actor_id, current_version_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [recordId, STAGING_RECORD_EXTERNAL_ID, testKnowledgeRecord.recordType, 'APPROVED', true, systemActorId, versionId, now]
    );

    // Insert version
    const contentHash = Buffer.from(JSON.stringify(testKnowledgeRecord.content)).toString('hex').slice(0, 64);
    await conn.query(
      `INSERT INTO knowledge_center.knowledge_record_versions
       (id, record_id, version_number, schema_version, title, summary, content, content_hash, change_reason, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        versionId,
        recordId,
        1,
        testKnowledgeRecord.schemaVersion,
        testKnowledgeRecord.title,
        testKnowledgeRecord.summary,
        JSON.stringify(testKnowledgeRecord.content),
        contentHash,
        testKnowledgeRecord.changeReason,
        systemActorId,
        now,
      ]
    );

    // Link version to record (already done in insert, but ensure current_version_id is set)
    await conn.query(
      'UPDATE knowledge_center.knowledge_records SET current_version_id = $1 WHERE id = $2',
      [versionId, recordId]
    );

    await conn.query('COMMIT');

    console.log(`✓ Staging knowledge record created`);
    console.log(`  External ID: ${STAGING_RECORD_EXTERNAL_ID}`);
    console.log(`  Record ID: ${recordId}`);
    console.log(`  Version ID: ${versionId}`);
    console.log(`  Status: APPROVED (production_eligible = true)`);
    console.log(`  Purpose: End-to-end validation`);

    conn.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    conn.release();
    await pool.end();
    process.exit(1);
  }
}

seed();
