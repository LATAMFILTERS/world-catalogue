'use strict';

const registry = require('../config/hermes-brand-search-engines.json');
const sourceOrganizations = require('../hermes/config/source-organizations.json');

function normalize(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9+]/g, '');
}

function resolveBrandSearchEngines(brand, { market = null, capability = null } = {}) {
  const key = normalize(brand);
  if (!key) return { brand: null, matched: false, engines: [], policy: registry.policy };

  const candidates = (registry.brands || []).filter(entry => {
    const aliases = [entry.id, ...(entry.match || [])].map(normalize);
    return aliases.some(alias => key === alias || key.includes(alias) || alias.includes(key));
  });

  const scored = candidates
    .map(entry => {
      const marketScore = !market || entry.market === 'GLOBAL' || String(entry.market).toUpperCase() === String(market).toUpperCase() ? 1 : 0;
      const engines = (entry.engines || [])
        .filter(engine => !capability || (engine.supports || []).includes(capability))
        .sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99));
      return { entry, marketScore, engines };
    })
    .filter(item => item.engines.length)
    .sort((a, b) => b.marketScore - a.marketScore || Number(a.engines[0].priority || 99) - Number(b.engines[0].priority || 99));

  if (!scored.length) return { brand, matched: false, engines: [], policy: registry.policy };

  const best = scored[0];
  return {
    brand: best.entry.id,
    role: best.entry.role,
    market: best.entry.market,
    matched: true,
    engines: best.engines,
    policy: registry.policy,
  };
}

function findOfficialOemSource(brand, { market = null } = {}) {
  const key = normalize(brand);
  const matches = (sourceOrganizations.organizations || []).filter(entry => {
    if (!entry?.official || !entry?.official_domain) return false;
    const aliases = [entry.id, entry.name, entry.parent_company].filter(Boolean).map(normalize);
    return aliases.some(alias => key === alias || key.includes(alias) || alias.includes(key));
  });

  const ranked = matches
    .map(entry => {
      const region = String(entry.region || '').toUpperCase();
      const marketKey = String(market || '').toUpperCase();
      const marketScore = !marketKey
        ? 1
        : (marketKey === 'US' && /NORTH AMERICA|UNITED STATES/.test(region) ? 2 : 1);
      return { entry, marketScore };
    })
    .sort((a, b) =>
      b.marketScore - a.marketScore ||
      Number(a.entry.priority || 99) - Number(b.entry.priority || 99)
    );

  if (!ranked.length) return null;
  const source = ranked[0].entry;
  return {
    id: source.id,
    name: source.name,
    category: source.category,
    official_domain: source.official_domain,
    status: source.status,
    discovery_required: source.discovery_required === true,
    priority: source.priority ?? null,
  };
}

function buildEquipmentResearchStrategy({ equipmentBrand, market = null } = {}) {
  const oem = findOfficialOemSource(equipmentBrand, { market });
  const aftermarketOrder = [
    { brand: 'DONALDSON', rank: 1, role: 'PRIMARY_BASE_AUTHORITY' },
    { brand: 'FLEETGUARD', rank: 2, role: 'SECONDARY_AFTERMARKET_AUTHORITY' },
    { brand: 'MANN-FILTER', rank: 3, role: 'TERTIARY_AFTERMARKET_AUTHORITY' },
    { brand: 'BALDWIN', rank: 4, role: 'TERTIARY_AFTERMARKET_AUTHORITY' },
    { brand: 'WIX', rank: 5, role: 'SUPPORTING_AFTERMARKET_AUTHORITY' },
    { brand: 'FRAM', rank: 6, role: 'SUPPORTING_AFTERMARKET_AUTHORITY' },
  ].map(item => ({
    ...item,
    route: resolveBrandSearchEngines(item.brand, { market }),
  }));

  return {
    equipment_brand: equipmentBrand || null,
    market,
    phase_order: [
      'OEM_EQUIPMENT_SOURCE',
      'OEM_PART_NUMBERS',
      'DONALDSON',
      'FLEETGUARD',
      'OTHER_AFTERMARKET'
    ],
    stage_1_oem: oem,
    stage_2_aftermarket: aftermarketOrder,
    rules: {
      oem_source_must_be_researched_first: true,
      oem_part_numbers_required_before_aftermarket: true,
      donaldson_first_after_oem: true,
      fleetguard_second_after_oem: true,
      supporting_aftermarket_cannot_override_oem: true,
      cross_reference_alone_does_not_establish_fitment: true,
    },
  };
}

function buildBrandResearchStrategy({ brands = [], market = null, capability = null } = {}) {
  const unique = [...new Set((brands || []).filter(Boolean))];
  const routes = unique.map(brand => ({ requested_brand: brand, ...resolveBrandSearchEngines(brand, { market, capability }) }));
  return {
    market,
    capability,
    routes,
    specialized_engine_first: registry.policy.specialized_engine_first === true,
    generic_web_is_discovery_only: registry.policy.generic_web_is_discovery_only === true,
  };
}

module.exports = {
  registry,
  normalize,
  resolveBrandSearchEngines,
  buildBrandResearchStrategy,
  findOfficialOemSource,
  buildEquipmentResearchStrategy,
};
