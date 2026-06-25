require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== AUDIT: ELIMFILTERS AI ===\n");

  // Helper to check table existence
  async function tableExists(name) {
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`, [name]);
    return res.rows.length > 0;
  }

  const ai_usage_exists = await tableExists('ai_usage_log');
  const ai_content_exists = await tableExists('ai_content_pages');
  const intel_exists = await tableExists('competitive_intel');
  const events_exists = await tableExists('intelligence_events');

  console.log("1. AI Infrastructure Status:");
  console.log(`   - ai_usage_log: ${ai_usage_exists ? '✅ Ready' : '❌ Missing (Run /api/ai/migrate)'}`);
  console.log(`   - ai_content_pages: ${ai_content_exists ? '✅ Ready' : '❌ Missing (Run /api/ai/migrate)'}`);
  console.log(`   - competitive_intel: ${intel_exists ? '✅ Ready' : '❌ Missing (Run /api/intel/migrate)'}`);
  console.log(`   - intelligence_events: ${events_exists ? '✅ Ready' : '❌ Missing'}\n`);

  if (ai_usage_exists) {
    const monthKey = new Date().toISOString().slice(0, 7);
    const usage = await client.query(`
      SELECT agent, COUNT(*) as calls, 
             SUM(input_tokens) as input_tk, 
             SUM(output_tokens) as output_tk,
             SUM(input_tokens + output_tokens) as total_tk
      FROM ai_usage_log 
      WHERE month_key = $1
      GROUP BY agent ORDER BY total_tk DESC
    `, [monthKey]);
    console.log("2. Monthly AI usage by agent:");
    if (usage.rows.length) console.table(usage.rows);
    else console.log("   No usage logged this month.");

    const totalUsage = await client.query(`SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as used, COUNT(*) as total_calls FROM ai_usage_log WHERE month_key = $1`, [monthKey]);
    const used = parseInt(totalUsage.rows[0].used);
    const BUDGET = 500000;
    console.log(`\n   BUDGET: ${BUDGET.toLocaleString()} tokens | USED: ${used.toLocaleString()} | REMAINING: ${(BUDGET - used).toLocaleString()} (${((used/BUDGET)*100).toFixed(1)}%)\n`);
  }

  if (ai_content_exists) {
    const pages = await client.query(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN published = TRUE THEN 1 ELSE 0 END) as published,
             SUM(CASE WHEN published = FALSE THEN 1 ELSE 0 END) as draft
      FROM ai_content_pages
    `);
    console.log("3. AI Content Pages:");
    console.table(pages.rows);
  }

  if (intel_exists) {
    const intel = await client.query(`
      SELECT brand, category, COUNT(*) as entries, 
             SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_count
      FROM competitive_intel
      GROUP BY brand, category ORDER BY brand, category
    `);
    console.log("\n4. Competitive Intelligence entries:");
    if (intel.rows.length === 0) console.log("   ⚠️  EMPTY — No competitive intelligence data ingested.");
    else console.table(intel.rows);
  }

  console.log("\n5. API Keys Configuration:");
  console.log(`   - GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Configured (Ends with ' + process.env.GROQ_API_KEY.slice(-4) + ')' : '❌ MISSING'}`);
  console.log(`   - INTEL_ADMIN_KEY: ${process.env.INTEL_ADMIN_KEY ? '✅ Configured' : '⚠️ Missing (Using fallback elim2026intel)'}`);

  await client.end();
}

run().catch(console.error);
