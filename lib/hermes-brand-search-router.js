'use strict';

const registry = require('../config/hermes-brand-search-engines.json');

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
};
