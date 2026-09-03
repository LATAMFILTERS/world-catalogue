'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveCatalogDatabaseConfig } = require('../lib/bot-protocol-db');
const {
  buildCrossReferenceNarrative,
  inferTechnology,
  formatCatalogProduct
} = require('../lib/bot-protocol-channel-format');

test('catalog database prefers the dedicated catalog URL', () => {
  const config = resolveCatalogDatabaseConfig({
    CATALOG_DATABASE_URL: 'postgresql://catalog:secret@example/catalogo_elimfilters',
    DATABASE_URL: 'postgresql://other:secret@example/other'
  });

  assert.equal(config.connectionString, 'postgresql://catalog:secret@example/catalogo_elimfilters');
  assert.equal(config.source, 'CATALOG_DATABASE_URL');
});

test('catalog database supports individual PG variables and catalogo_elimfilters default', () => {
  const config = resolveCatalogDatabaseConfig({
    PGHOST: 'db.internal',
    PGUSER: 'elimfilters',
    PGPASSWORD: 'secret'
  });

  assert.equal(config.host, 'db.internal');
  assert.equal(config.database, 'catalogo_elimfilters');
  assert.equal(config.port, 5432);
  assert.equal(config.source, 'PG_COMPONENTS');
});

test('a generic standard non-turbine fuel/water separator falls back to HYDROCORE, not SYNTAPORE', () => {
  assert.equal(inferTechnology({ filter_type: 'Fuel Filter and Water Separator Cartridge', sku: 'ES91424' }), 'HYDROCORE™');
});

test('a plain non-separator fuel filter is SYNTAPORE, not HYDROCORE', () => {
  assert.equal(inferTechnology({ filter_type: 'Primary Diesel Fuel Filter' }), 'SYNTAPORE™');
  assert.equal(inferTechnology({ filter_type: 'fuel' }), 'SYNTAPORE™');
});

test('an FH/FG turbine-style housing infers TURBOCORE', () => {
  assert.equal(inferTechnology({ filter_type: 'Fuel Water Separator', sku: '900FH-RACOR' }), 'TURBOCORE™');
  assert.equal(inferTechnology({ filter_type: 'Fuel Water Separator', sub_type: 'Turbine housing' }), 'TURBOCORE™');
});

test('a 2010/2020/2040 SM/TM/PM turbine element infers TURBOCORE (production data shape)', () => {
  assert.equal(inferTechnology({ filter_type: 'fuel', codigo_base: '2010SM-OR', sku: 'ET92010S' }), 'TURBOCORE™');
  assert.equal(inferTechnology({ filter_type: 'fuel', codigo_base: '2020TM-OR', sku: 'ET92020T' }), 'TURBOCORE™');
  assert.equal(inferTechnology({ filter_type: 'fuel', codigo_base: '2040PM-OR', sku: 'ET92040P' }), 'TURBOCORE™');
});

test('single-word production filter_type values translate instead of leaking English into Spanish', async () => {
  const air = await formatCatalogProduct({ sku: 'EF-AIR-1', filter_type: 'air', technology: 'MACROCORE™' }, { language: 'es' });
  assert.match(air, /Filtro de aire/);
  assert.doesNotMatch(air, /— air\b/i);

  const oil = await formatCatalogProduct({ sku: 'EF-OIL-1', filter_type: 'oil', technology: 'SYNTRAX™' }, { language: 'es' });
  assert.match(oil, /Filtro de aceite/);
  assert.doesNotMatch(oil, /— oil\b/i);
});

test('validated PostgreSQL cross-reference returns a natural English answer with ELIMFILTERS technology', async () => {
  const payload = {
    intent: 'cross_reference_lookup',
    evidence: {
      references: ['RE52987'],
      products: [{
        sku: 'ES91424',
        filter_type: 'fuel filter and water separator cartridge',
        description: 'Designed to remove water and harmful particles from fuel systems in John Deere agricultural and industrial equipment',
        technology: 'HYDROCORE™'
      }]
    }
  };

  const answer = await buildCrossReferenceNarrative(payload, { message: 'Cross reference RE52987' }, 'en');

  assert.match(answer, /RE52987/);
  assert.match(answer, /ES91424/);
  assert.match(answer, /fuel filter and water separator cartridge/i);
  assert.match(answer, /HYDROCORE™/);
  assert.match(answer, /keep the fuel clean/i);
});
