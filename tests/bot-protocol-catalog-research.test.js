const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCode,
  deriveApplicationIdentity,
  identityIsResearchable,
  researchApplicationToOems,
  candidateMatchesIdentity,
  extractJsonObject
} = require('../lib/bot-protocol-catalog-research');

test('normalizes OEM codes without punctuation', () => {
  assert.equal(normalizeCode(' 2170-7195 '), '21707195');
});

test('derives equipment, engine and year from conversation history', () => {
  const identity = deriveApplicationIdentity('¿Qué filtro recomienda?', {
    history: ['Tengo un Mack Anthem 2022', 'Motor MP8'],
    equipment_tokens: ['MACK', 'MP8']
  });

  assert.equal(identity.manufacturer, 'MACK');
  assert.equal(identity.engine, 'MP8');
  assert.equal(identity.year, 2022);
  assert.match(identity.model, /Anthem/i);
  assert.equal(identityIsResearchable(identity), true);
});

test('rejects a sourced OEM candidate with incompatible year', () => {
  const accepted = candidateMatchesIdentity({
    oem_codes: ['21707195'],
    confidence: 'high',
    manufacturer: 'Mack',
    model: 'Anthem',
    engine: 'MP8',
    year_from: 2016,
    year_to: 2020,
    sources: [{ url: 'https://example.com/manual' }]
  }, {
    manufacturer: 'MACK',
    model: 'Anthem',
    engine: 'MP8',
    year: 2022
  });

  assert.equal(accepted, false);
});

test('extracts strict JSON from fenced model output', () => {
  const parsed = extractJsonObject('```json\n{"status":"not_found","candidates":[]}\n```');
  assert.equal(parsed.status, 'not_found');
});

test('Groq research returns only high-confidence application-consistent OEM codes', async () => {
  const previousKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';

  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify({
            status: 'confirmed',
            missing_data: [],
            candidates: [
              {
                filter_type: 'Engine Oil',
                position: 'full flow',
                oem_codes: ['2170-7195'],
                manufacturer: 'Mack',
                model: 'Anthem',
                engine: 'MP8',
                year_from: 2021,
                year_to: 2024,
                confidence: 'high',
                sources: [{
                  title: 'Official catalog',
                  url: 'https://manufacturer.example/catalog',
                  source_type: 'official_catalog'
                }]
              },
              {
                filter_type: 'Fuel',
                position: 'primary',
                oem_codes: ['BAD-001'],
                manufacturer: 'Mack',
                model: 'Anthem',
                engine: 'MP7',
                year_from: 2021,
                year_to: 2024,
                confidence: 'high',
                sources: [{
                  title: 'Wrong engine',
                  url: 'https://manufacturer.example/wrong',
                  source_type: 'official_catalog'
                }]
              }
            ]
          })
        }
      }]
    })
  });

  try {
    const result = await researchApplicationToOems({
      message: '¿Qué filtro recomienda?',
      context: {
        history: ['Mack Anthem 2022', 'Motor MP8'],
        equipment_tokens: ['MACK', 'MP8']
      },
      fetchImpl
    });

    assert.equal(result.status, 'confirmed');
    assert.deepEqual(result.oem_codes, ['21707195']);
    assert.equal(result.candidates.length, 1);
    assert.equal(result.sources.length, 1);
  } finally {
    if (previousKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousKey;
  }
});

test('does not call Groq when equipment identity is incomplete', async () => {
  let called = false;
  const result = await researchApplicationToOems({
    message: 'Necesito un filtro',
    context: {},
    fetchImpl: async () => {
      called = true;
      throw new Error('should not run');
    }
  });

  assert.equal(called, false);
  assert.equal(result.status, 'needs_more_data');
});
