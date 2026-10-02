'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const { Client } = require('pg');

process.env.BOT_PROTOCOL_API_KEY = process.env.BOT_PROTOCOL_API_KEY || 'acceptance-local-key';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
delete process.env.GROQ_API_KEY;
delete process.env.REDIS_URL;

const { installBotProtocol } = require('../../lib/install-bot-protocol');

const CASES = [
  {
    id: 'freightliner-cl120-series60',
    message: 'que filtros lleva el Columbia CL120 Freightliner con motor Detroit Diesel S60',
    make: 'FREIGHTLINER',
    model: 'COLUMBIA',
    modelTypes: ['COLUMBIA CL120'],
    yearLike: null,
    engineLike: 'DETROIT',
    expectedSkus: ['EL82100','ES90463','EF96916','EW74685','EA17682','EL82518','EC14226'],
    forbiddenSkus: ['EA31300','EL32102']
  },
  {
    id: 'toyota-rav4-2022',
    message: 'que filtros usa Toyota RAV4 2022 2.5L',
    make: 'TOYOTA',
    model: 'RAV4',
    modelTypes: null,
    yearLike: '22',
    engineLike: null,
    expectedSkus: ['EC31919','EL36006'],
    forbiddenSkus: ['EF34421']
  },
  {
    id: 'hyundai-sonata-2022-oil',
    message: 'que filtro de aceite usa Hyundai Sonata 2022 2.5L',
    make: 'HYUNDAI',
    model: 'SONATA',
    modelTypes: null,
    yearLike: '2022',
    engineLike: '2.5',
    expectedSkus: ['EL32811'],
    forbiddenSkus: ['EL36350']
  },
  {
    id: 'toyota-prius-2zrfxe-oil',
    message: 'que filtro de aceite usa Toyota Prius con motor 2ZRFXE',
    make: 'TOYOTA',
    model: 'PRIUS',
    modelTypes: null,
    yearLike: null,
    engineLike: '2ZRFXE',
    expectedSkus: ['EL34967'],
    forbiddenSkus: ['EL30683','EL50683']
  }
];

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeYear(value) {
  const n = Number(String(value || '').trim());
  if (!Number.isFinite(n)) return null;
  if (n >= 0 && n <= 49) return 2000 + n;
  if (n >= 50 && n <= 99) return 1900 + n;
  return n;
}

function yearValueMatches(value, targetYear) {
  if (!targetYear) return true;
  const target = normalizeYear(targetYear);
  const text = String(value || '').trim();
  if (!text) return false;
  if (/^\d{2,4}$/.test(text)) return normalizeYear(text) === target;
  const range = text.match(/^(\d{2,4})\s*[-/]\s*(\d{2,4})$/);
  if (!range) return false;
  const a = normalizeYear(range[1]);
  const b = normalizeYear(range[2]);
  return Boolean(a && b && target >= Math.min(a,b) && target <= Math.max(a,b));
}

function collectBotSkus(body) {
  const values = new Set();
  for (const product of body?.evidence?.products || []) {
    if (product?.sku) values.add(String(product.sku).toUpperCase());
  }
  for (const product of body?.catalog?.products || []) {
    if (product?.sku) values.add(String(product.sku).toUpperCase());
  }
  const answer = String(body?.answer || '').toUpperCase();
  for (const match of answer.matchAll(/\bE[A-Z]\d{5}\b/g)) values.add(match[0]);
  return [...values].sort();
}

async function queryApplicationRows(db, c) {
  const params = [
    c.make,
    c.model,
    c.modelTypes || null,
    null,
    c.engineLike ? '%' + String(c.engineLike).toUpperCase() + '%' : null
  ];
  const sql = `
    SELECT DISTINCT v.elimfilters_sku AS sku, c.codigo_base, c.filter_type,
           v.make,v.model_family,v.model_type,v.year,v.engine_code
      FROM ld_catalog.ld_vehicle_applications v
      JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
     WHERE upper(coalesce(v.make,'')) = $1
       AND upper(coalesce(v.model_family,'')) = $2
       AND ($3::text[] IS NULL OR upper(coalesce(v.model_type,'')) = ANY($3::text[]))
       AND ($4::text IS NULL OR coalesce(v.year,'') ILIKE $4)
       AND ($5::text IS NULL OR upper(coalesce(v.engine_code,'')) LIKE $5)
     ORDER BY v.elimfilters_sku
  `;
  const rows = (await db.query(sql, params)).rows;
  return c.yearLike ? rows.filter(row => yearValueMatches(row.year, c.yearLike)) : rows;
}

async function assertCanonicalProduct(db, sku) {
  const row = await db.query(
    `SELECT c.sku,c.codigo_base,c.canonical_source_code,c.filter_type,
            c.enrichment_data->'codigo_base_governance'->>'state' AS governance_state,
            c.enrichment_data->'codigo_base_governance'->>'primary_manufacturer_verified' AS manufacturer_verified,
            (SELECT i.canonical_part_number
               FROM ld_catalog.ld_canonical_product_identity i
              WHERE i.elimfilters_sku=c.sku AND i.status='ACTIVE'
              ORDER BY i.updated_at DESC NULLS LAST
              LIMIT 1) AS ld_canonical_part_number
       FROM public.elimfilters_catalog c
      WHERE c.sku=$1`,
    [sku]
  );
  assert.equal(row.rowCount, 1, `${sku}: missing or duplicate canonical product row`);
  return row.rows[0];
}

async function assertResolverAndCache(db, product) {
  const governedCodes = [];
  if (product.ld_canonical_part_number) governedCodes.push(product.ld_canonical_part_number);
  const publicBaseGoverned = product.governance_state === 'CANONICAL_VERIFIED'
    && String(product.manufacturer_verified || '').toLowerCase() === 'true';
  if (publicBaseGoverned) {
    governedCodes.push(product.canonical_source_code || product.codigo_base);
  }

  const codes = [...new Set(governedCodes.map(norm).filter(Boolean))];
  const result = {
    resolver: [],
    cache: [],
    status: codes.length ? 'governed' : 'not_governed'
  };

  if (!codes.length) return result;

  for (const code of codes) {
    const resolver = await db.query(
      `SELECT code,sku,manufacturer,status
         FROM public.v_api_resolver_v7
        WHERE upper(regexp_replace(coalesce(code,''),'[^A-Z0-9]','','g'))=$1
        ORDER BY sku`,
      [code]
    );
    assert.ok(
      resolver.rows.some(r => r.sku === product.sku),
      `${product.sku}: resolver v7 does not point ${code} to canonical SKU`
    );
    assert.ok(
      !resolver.rows.some(r => r.sku !== product.sku && /RESOLVED|CANONICAL/i.test(String(r.status || ''))),
      `${product.sku}: resolver v7 has competing resolved SKU for ${code}`
    );
    result.resolver.push(...resolver.rows);

    const cache = await db.query(
      `SELECT code,sku,manufacturer
         FROM public.crossref_resolved_cache
        WHERE upper(regexp_replace(coalesce(code,''),'[^A-Z0-9]','','g'))=$1
        ORDER BY sku`,
      [code]
    );
    if (cache.rowCount) {
      assert.ok(
        cache.rows.some(r => r.sku === product.sku),
        `${product.sku}: cache has ${code} but not canonical SKU`
      );
      assert.ok(
        !cache.rows.some(r => r.sku !== product.sku),
        `${product.sku}: cache has competing SKU for ${code}`
      );
    }
    result.cache.push(...cache.rows);
  }

  return result;
}

async function startBot() {
  const app = express();
  installBotProtocol(app);
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return { server, baseUrl };
}

async function askBot(baseUrl, c) {
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-bot-protocol-key': process.env.BOT_PROTOCOL_API_KEY
    },
    body: JSON.stringify({
      message: c.message,
      conversation_id: `acceptance-${c.id}-${Date.now()}`,
      channel: 'web'
    })
  });
  const body = await response.json();
  assert.equal(response.status, 200, `${c.id}: bot HTTP ${response.status}`);
  return body;
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL
    || process.env.ELIMFILTERS_DATABASE_URL
    || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db = new Client({ connectionString:url, ssl:{ rejectUnauthorized:false } });
  await db.connect();
  const { server, baseUrl } = await startBot();
  const report = { passed:true, cases:[] };

  try {
    for (const c of CASES) {
      const entry = { id:c.id, message:c.message, expected:c.expectedSkus };
      const appRows = await queryApplicationRows(db, c);
      const appSkus = [...new Set(appRows.map(r => r.sku))].sort();
      entry.postgres_application_skus = appSkus;

      for (const sku of c.expectedSkus) {
        assert.ok(appSkus.includes(sku), `${c.id}: PostgreSQL application graph missing ${sku}`);
      }
      for (const sku of c.forbiddenSkus || []) {
        assert.ok(!appSkus.includes(sku), `${c.id}: PostgreSQL application graph still contains forbidden ${sku}`);
      }

      entry.identity = {};
      entry.resolver = {};
      entry.cache = {};
      for (const sku of c.expectedSkus) {
        const product = await assertCanonicalProduct(db, sku);
        entry.identity[sku] = product;
        const resolved = await assertResolverAndCache(db, product);
        entry.resolver[sku] = { status: resolved.status, rows: resolved.resolver };
        entry.cache[sku] = resolved.cache;
      }

      const body = await askBot(baseUrl, c);
      const botSkus = collectBotSkus(body);
      entry.bot_intent = body.intent;
      entry.bot_skus = botSkus;
      entry.bot_answer = body.answer;

      for (const sku of c.expectedSkus) {
        assert.ok(botSkus.includes(sku), `${c.id}: bot response missing ${sku}; got ${botSkus.join(',')}`);
      }
      for (const sku of c.forbiddenSkus || []) {
        assert.ok(!botSkus.includes(sku), `${c.id}: bot response contains forbidden ${sku}`);
      }

      if (c.id === 'freightliner-cl120-series60') {
        assert.match(String(body.answer || ''), /EL82100/i, 'CL120 answer must include EL82100');
        assert.match(String(body.answer || ''), /EC14226/i, 'CL120 answer must include EC14226 cabin filter');
      }

      entry.status = 'PASS';
      report.cases.push(entry);
      console.log(`PASS ${c.id}: ${botSkus.join(', ')}`);
    }

    console.log(JSON.stringify(report,null,2));
  } catch (error) {
    report.passed = false;
    report.error = error.message;
    console.error(JSON.stringify(report,null,2));
    throw error;
  } finally {
    await new Promise(resolve => server.close(resolve));
    await db.end();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
