'use strict';

const matrix = require('../config/isuzu-n-series-us-oem-matrix.json');

function norm(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9.]/g, '');
}

function rowsForYear(year) {
  const y = Number(year);
  return [
    ...(matrix.diesel_matrix || []),
    ...(matrix.gas_matrix || [])
  ].filter(row => Number(row.year) === y);
}

function resolveIsuzuNSeriesCustomerQuery({ year, model, engine, fuel } = {}) {
  const y = Number(year);
  if (!Number.isInteger(y)) return { status: 'NEEDS_YEAR', candidates: [] };

  const rows = rowsForYear(y);
  if (!rows.length) return { status: 'OEM_YEAR_NOT_CLOSED', year: y, candidates: [] };

  const modelKey = norm(model);
  const engineKey = norm(engine);
  const fuelKey = norm(fuel);

  const wantsDiesel = /5\.2|4HK|DIESEL/.test(engineKey + fuelKey);
  const wantsGas = /6\.6|L8T|GAS|GASOLINE/.test(engineKey + fuelKey);

  let candidates = rows.flatMap(row => row.models.map(m => ({
    year: row.year,
    model: m,
    fuel: row.fuel,
    engine_displacement: row.engine_displacement,
    engine_family: row.engine_family,
    source_status: row.status
  })));

  if (wantsDiesel) candidates = candidates.filter(c => c.fuel === 'DIESEL');
  if (wantsGas) candidates = candidates.filter(c => c.fuel === 'GASOLINE');

  if (modelKey) {
    const exact = candidates.filter(c => norm(c.model) === modelKey);
    if (exact.length) {
      return { status: 'OEM_IDENTITY_CLOSED', year: y, candidates: exact };
    }

    if (modelKey === 'NPR') {
      if (wantsDiesel) {
        const dieselNprFamily = candidates.filter(c => ['NPR-HD','NPR-XD'].includes(c.model));
        return {
          status: dieselNprFamily.length > 1 ? 'NEEDS_MODEL_VARIANT' : 'OEM_IDENTITY_CLOSED',
          year: y,
          reason: 'PLAIN_NPR_IS_NOT_THE_DIESEL_MODEL_IDENTITY_FOR_THIS_OEM_MATRIX',
          candidates: dieselNprFamily
        };
      }
      const plain = candidates.filter(c => c.model === 'NPR');
      if (plain.length) return { status: 'OEM_IDENTITY_CLOSED', year: y, candidates: plain };
    }
  }

  const nprFamily = candidates.filter(c => c.model.startsWith('NPR'));
  if (nprFamily.length > 1) {
    return { status: 'NEEDS_MODEL_VARIANT', year: y, candidates: nprFamily };
  }
  if (nprFamily.length === 1) {
    return { status: 'OEM_IDENTITY_CLOSED', year: y, candidates: nprFamily };
  }

  return { status: 'NO_OEM_MATCH', year: y, candidates: [] };
}

function aftermarketResearchAllowed(resolution) {
  return resolution?.status === 'OEM_IDENTITY_CLOSED' && resolution.candidates?.length === 1;
}

module.exports = {
  matrix,
  norm,
  rowsForYear,
  resolveIsuzuNSeriesCustomerQuery,
  aftermarketResearchAllowed,
};
