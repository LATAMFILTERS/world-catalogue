'use strict';

const registry = require('../config/vehicle-platform-normalization.json');

function normalizeAlphaNum(value) {
  return String(value || '')
    .normalize('NFKD')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function findPlatform({ make, model, market = 'US' } = {}) {
  const makeKey = normalizeAlphaNum(make);
  const modelKey = normalizeAlphaNum(model);
  const marketKey = String(market || 'US').toUpperCase();

  for (const entry of registry.markets || []) {
    if (String(entry.market || '').toUpperCase() !== marketKey) continue;

    const makeAliases = [entry.make, ...(entry.make_aliases || [])].map(normalizeAlphaNum);
    const makeMatches = !makeKey || makeAliases.some(alias => makeKey === alias || makeKey.includes(alias));
    if (!makeMatches) continue;

    for (const candidate of entry.models || []) {
      const aliases = [candidate.canonical, ...(candidate.aliases || [])].map(normalizeAlphaNum);
      if (modelKey && aliases.some(alias => modelKey === alias || modelKey.includes(alias))) {
        return {
          market: entry.market,
          make: entry.make,
          platform: entry.platform,
          model: candidate.canonical,
          matched: true,
        };
      }
    }

    if (!modelKey) {
      return {
        market: entry.market,
        make: entry.make,
        platform: entry.platform,
        model: null,
        matched: true,
      };
    }
  }

  return {
    market: marketKey || null,
    make: make || null,
    platform: null,
    model: model || null,
    matched: false,
  };
}

function extractYear(value) {
  const match = String(value || '').match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function extractEngine(value) {
  const text = String(value || '').toUpperCase();
  const code = text.match(/\b4HK1(?:-TC)?\b/);
  if (code) return code[0];
  const displacement = text.match(/\b\d(?:\.\d)?\s*L\b/);
  return displacement ? displacement[0].replace(/\s+/g, '') : null;
}

function parseVehicleSearchText(value, market = 'US') {
  const text = String(value || '');
  const upper = text.toUpperCase();
  const year = extractYear(text);
  const engine = extractEngine(text);

  for (const entry of registry.markets || []) {
    if (String(entry.market || '').toUpperCase() !== String(market || 'US').toUpperCase()) continue;
    const makeAliases = [entry.make, ...(entry.make_aliases || [])];
    const make = makeAliases.find(alias => upper.includes(String(alias).toUpperCase()));
    if (!make) continue;

    for (const candidate of entry.models || []) {
      const aliases = [candidate.canonical, ...(candidate.aliases || [])];
      const model = aliases
        .sort((a, b) => String(b).length - String(a).length)
        .find(alias => normalizeAlphaNum(upper).includes(normalizeAlphaNum(alias)));
      if (model) {
        const resolved = findPlatform({ make, model, market });
        return { ...resolved, year, engine, raw: text };
      }
    }
  }

  return { ...findPlatform({ market }), year, engine, raw: text };
}

module.exports = {
  registry,
  normalizeAlphaNum,
  findPlatform,
  extractYear,
  extractEngine,
  parseVehicleSearchText,
};
