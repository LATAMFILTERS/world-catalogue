'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveCatalogDatabaseConfig } = require('../lib/bot-protocol-db');
const {
  buildCrossReferenceNarrative,
  inferTechnology
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
