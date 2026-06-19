require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("1. Creando tabla: competitive_intel...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS competitive_intel (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      source_type TEXT NOT NULL,   -- 'notebooklm' | 'manual' | 'pdf' | 'web'
      brand TEXT,                  -- 'donaldson' | 'fleetguard' | 'mann' | 'wix' | 'baldwin' | 'general'
      category TEXT NOT NULL,      -- 'product_update' | 'pricing' | 'standard' | 'market' | 'technical'
      title TEXT NOT NULL,
      summary TEXT NOT NULL,       -- Structured summary for Hermes
      raw_content TEXT,            -- Full source text
      source_url TEXT,
      active BOOLEAN DEFAULT TRUE,
      priority INTEGER DEFAULT 5   -- 1=highest, 10=lowest
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_intel_brand ON competitive_intel(brand);
    CREATE INDEX IF NOT EXISTS idx_intel_category ON competitive_intel(category);
    CREATE INDEX IF NOT EXISTS idx_intel_active ON competitive_intel(active);
  `);

  console.log("2. Creando tabla: intelligence_events...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS intelligence_events (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      distributor TEXT,
      customer TEXT,
      country TEXT,
      industry TEXT,
      equipment_make TEXT,
      equipment_model TEXT,
      equipment_id TEXT,
      part_number TEXT,
      technology TEXT,
      event_type TEXT,
      quantity INTEGER,
      operating_hours INTEGER
    )
  `);

  console.log("✅ Migración completada exitosamente.");
  await client.end();
}

run().catch(console.error);
