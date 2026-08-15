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

test('a generic (non-turbine) fuel/water separator falls back to SYNTAPORE, not TURBOCORE', () => {
  // TURBOCORE™ is scoped to "Turbine FH and FG fuel-separation systems" in
  // the canonical registry (frontend/src/lib/canonical-technologies.ts) --
  // a plain spin-on cartridge with no turbine/Racor signal is not that
  // product family, and SYNTAPORE™ ("primary and secondary fuel
  // filtration") is the technology that actually applies to it.
  assert.equal(inferTechnology({ filter_type: 'Fuel Filter and Water Separator Cartridge', sku: 'ES91424' }), 'SYNTAPORE™');
});

test('a Racor-style turbine FH/FG housing still infers TURBOCORE', () => {
  assert.equal(inferTechnology({ filter_type: 'Fuel Water Separator', sku: '900FH-RACOR' }), 'TURBOCORE™');
  assert.equal(inferTechnology({ filter_type: 'Fuel Water Separator', sub_type: 'Turbine housing' }), 'TURBOCORE™');
});

test('a 2010/2020/2040 SM/TM/PM turbine element infers TURBOCORE (production data shape)', () => {
  // The live catalog's filter_type for these rows is the bare word 'fuel',
  // not a descriptive phrase, and the turbine signal lives entirely in
  // codigo_base (e.g. '2010SM-OR'), which has no FG/FH suffix -- this is the
  // exact shape of the 13 real ELIMFILTERS turbine-element SKUs (ET92010S,
  // ET92020T, ET92040P, etc.) verified directly against production.
  assert.equal(inferTechnology({ filter_type: 'fuel', codigo_base: '2010SM-OR', sku: 'ET92010S' }), 'TURBOCORE™');
  assert.equal(inferTechnology({ filter_type: 'fuel', codigo_base: '2020TM-OR', sku: 'ET92020T' }), 'TURBOCORE™');
  assert.equal(inferTechnology({ filter_type: 'fuel', codigo_base: '2040PM-OR', sku: 'ET92040P' }), 'TURBOCORE™');
});

test('single-word production filter_type values translate instead of leaking English into Spanish', () => {
  // Confirmed directly against production (SELECT DISTINCT filter_type FROM
  // elimfilters_catalog): the real column values are bare category words
  // ('air', 'oil', 'fuel', 'hydraulic', 'cabin', 'water'), not descriptive
  // phrases like "Air Filter". A translation table keyed only on the phrase
  // form silently falls back to the raw English word for every one of these
  // -- which is the same mixed-language bug this PR exists to fix.
  const air = formatCatalogProduct({ sku: 'EF-AIR-1', filter_type: 'air', technology: 'MACROCORE™' }, { language: 'es' });
  assert.match(air, /Filtro de aire/);
  assert.doesNotMatch(air, /— air\b/i);

  const oil = formatCatalogProduct({ sku: 'EF-OIL-1', filter_type: 'oil', technology: 'SYNTRAX™' }, { language: 'es' });
  assert.match(oil, /Filtro de aceite/);
  assert.doesNotMatch(oil, /— oil\b/i);
});

test('validated PostgreSQL cross-reference returns a natural English answer with ELIMFILTERS technology', () => {
  const payload = {
    intent: 'cross_reference_lookup',
    evidence: {
      references: ['RE52987'],
      products: [{
        sku: 'ES91424',
        filter_type: 'fuel filter and water separator cartridge',
        description: 'Designed to remove water and harmful particles from fuel systems in John Deere agricultural and industrial equipment',
        technology: 'TURBOCORE™'
      }]
    }
  };

  const answer = buildCrossReferenceNarrative(payload, { message: 'Cross reference RE52987' }, 'en');

  assert.match(answer, /RE52987/);
  assert.match(answer, /ES91424/);
  assert.match(answer, /fuel filter and water separator cartridge/i);
  assert.match(answer, /TURBOCORE™/);
  // The purpose sentence names the specific benefit for this filter's
  // system (fuel cleanliness) instead of the generic "asset protection"
  // phrasing, which is what makes the recommendation feel accurate and
  // convincing rather than boilerplate.
  assert.match(answer, /keep the fuel clean/i);
});
