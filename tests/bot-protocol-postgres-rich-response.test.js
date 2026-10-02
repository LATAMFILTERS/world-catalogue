'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveCatalogDatabaseConfig } = require('../lib/bot-protocol-db');
const {
  buildCrossReferenceNarrative,
  inferTechnology,
  formatCatalogProduct,
  formatForChannel
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

test('application lookup renders DRYCORE as an air-dryer filter, not engine air', async () => {
  const line = await formatCatalogProduct({
    sku: 'ED47747',
    filter_type: 'air',
    technology: 'DRYCORE™',
    validated_applications: [{
      make: 'FREIGHTLINER',
      model_family: 'COLUMBIA CL120',
      engine_code: 'DETROIT DIESEL'
    }]
  }, {
    language: 'es',
    applicationLookup: true,
    equipment: { brand: 'FREIGHTLINER', model: 'COLUMBIA CL120', engine: 'DETROIT DIESEL' }
  });

  assert.match(line, /^• ED47747 — Filtro secador de aire/m);
  assert.match(line, /Tecnología: DRYCORE™/);
  assert.doesNotMatch(line, /^• ED47747 — Filtro de aire/m);
});

test('application lookup shows ELIMFILTERS SKU without codigo_base and keeps validated vehicle engine year', async () => {
  const line = await formatCatalogProduct({
    sku: 'EA37063',
    codigo_base: '7063',
    filter_type: 'air',
    technology: 'MACROCORE™',
    oem_codes: ['TOYOTA 17801-0T060', 'TOYOTA 17801-77050'],
    validated_applications: [{
      make: 'TOYOTA',
      model_family: 'RAV4',
      model_type: 'RAV4',
      year: '2022',
      engine_code: 'A25A-FKS'
    }]
  }, {
    language: 'es',
    applicationLookup: true,
    equipment: { brand: 'TOYOTA', model: 'RAV4', year: 2022 }
  });

  assert.match(line, /^• EA37063 — Filtro de aire/m);
  assert.doesNotMatch(line, /EA37063 \/ 7063/);
  assert.match(line, /Tecnología: MACROCORE™/);
  assert.doesNotMatch(line, /Aplicación:/);
  assert.doesNotMatch(line, /Descripción:/);
  assert.match(line, /Motor: A25A-FKS/);
  assert.match(line, /Año: 2022/);
  assert.match(line, /OEM: TOYOTA 17801-0T060, 17801-77050/);
  assert.ok(line.indexOf('Tecnología: MACROCORE™') < line.indexOf('Motor: A25A-FKS'));
  assert.ok(line.indexOf('Motor: A25A-FKS') < line.indexOf('Año: 2022'));
  assert.ok(line.indexOf('Año: 2022') < line.indexOf('OEM: TOYOTA 17801-0T060, 17801-77050'));
});

test('application year display expands two-digit years and normalizes reversed ranges', async () => {
  const rangeLine = await formatCatalogProduct({
    sku: 'EA37063',
    filter_type: 'air',
    technology: 'MACROCORE™',
    validated_applications: [{
      make: 'TOYOTA',
      model_family: 'RAV4',
      year: '25-19',
      engine_code: 'L4-2.5L'
    }]
  }, {
    language: 'es',
    applicationLookup: true
  });

  const singleYearLine = await formatCatalogProduct({
    sku: 'EC31919',
    filter_type: 'cabin',
    technology: 'MICROKAPPA™',
    validated_applications: [{
      make: 'TOYOTA',
      model_family: 'RAV4',
      year: '22',
      engine_code: '2.5L GASOLINE'
    }]
  }, {
    language: 'es',
    applicationLookup: true
  });

  assert.match(rangeLine, /Año: 2019–2025/);
  assert.doesNotMatch(rangeLine, /Año: 25-19/);
  assert.match(singleYearLine, /Año: 2022/);
  assert.doesNotMatch(singleYearLine, /Año: 22\b/);
});

test('application lookup response stays compact and omits promotional closing', async () => {
  const formatted = await formatForChannel({
    intent: 'application_lookup',
    answer: 'fallback',
    state: {
      equipment: { brand: 'TOYOTA', model: 'RAV4', year: 2022 }
    },
    evidence: {
      products: [{
        sku: 'EA37063',
        filter_type: 'air',
        technology: 'MACROCORE™',
        description: 'Long description that should not appear in the initial application response.',
        oem_codes: ['TOYOTA 17801-0T060', 'TOYOTA 17801-77050'],
        validated_applications: [{
          make: 'TOYOTA',
          model_family: 'RAV4',
          year: '2022',
          engine_code: 'L4-2.5L'
        }]
      }]
    }
  }, {
    message: 'que filtros usa la rav4 2022',
    lang: 'es',
    channel: 'api'
  });

  assert.match(formatted.answer, /^Para tu TOYOTA RAV4 2022:/);
  assert.match(formatted.answer, /• EA37063 — Filtro de aire/);
  assert.match(formatted.answer, /Tecnología: MACROCORE™/);
  assert.doesNotMatch(formatted.answer, /Aplicación:/);
  assert.doesNotMatch(formatted.answer, /Descripción:/);
  assert.doesNotMatch(formatted.answer, /Elegí ELIMFILTERS:/);
  assert.match(formatted.answer, /OEM: TOYOTA 17801-0T060, 17801-77050/);
});

test('application lookup appends governed conflict clarification without publishing conflicted candidates', async () => {
  const formatted = await formatForChannel({
    intent: 'application_lookup',
    answer: 'fallback',
    state: {
      equipment: {
        brand: 'FREIGHTLINER',
        model: 'COLUMBIA CL120',
        engine: 'DETROIT DIESEL'
      }
    },
    evidence: {
      products: [{
        sku: 'EA17682',
        filter_type: 'air',
        technology: 'MACROCORE™',
        validated_applications: [{
          make: 'FREIGHTLINER',
          model_family: 'COLUMBIA CL120',
          engine_code: 'DETROIT DIESEL'
        }]
      }],
      application_conflicts: [{
        system: 'air_dryer',
        service_role: 'air_dryer',
        products: [
          { sku: 'ED47747' },
          { sku: 'ED47750' }
        ]
      }]
    }
  }, {
    message: 'para un freightliner columbia cl120 motor detroit diesel',
    lang: 'es',
    channel: 'api'
  });

  assert.match(formatted.answer, /• EA17682 — Filtro de aire/);
  assert.doesNotMatch(formatted.answer, /ED47747|ED47750/);
  assert.match(formatted.answer, /misma posición de servicio en: secador de aire/i);
  assert.match(formatted.answer, /configuración exacta/i);
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
