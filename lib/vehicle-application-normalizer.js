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

    const modelMatches = (entry.models || [])
      .flatMap(candidate => [candidate.canonical, ...(candidate.aliases || [])]
        .map(alias => ({ candidate, alias: normalizeAlphaNum(alias) })))
      .filter(({ alias }) => modelKey && (modelKey === alias || modelKey.endsWith(alias) || modelKey.includes(alias)))
      .sort((a, b) => b.alias.length - a.alias.length);

    if (modelMatches.length) {
      return {
        market: entry.market,
        make: entry.make,
        platform: entry.platform,
        model: modelMatches[0].candidate.canonical,
        matched: true,
      };
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
  const displacement = text.match(/\b\d(?:\.\d)?\s*(?:L|LITERS?|LITROS?)\b/);
  if (displacement) return displacement[0].replace(/\s*(?:LITERS?|LITROS?)\b/, 'L').replace(/\s+/g, '');
  const motorDisplacement = text.match(/\b(?:MOTOR|ENGINE)\s+(\d(?:\.\d)?)\b/);
  return motorDisplacement ? `${motorDisplacement[1]}L` : null;
}

function parseVehicleSearchText(value, market = 'US') {
  const text = String(value || '');
  const upper = text.toUpperCase();
  const year = extractYear(text);
  const engine = extractEngine(text);

  const normalizedText = normalizeAlphaNum(upper);
  for (const entry of registry.markets || []) {
    if (String(entry.market || '').toUpperCase() !== String(market || 'US').toUpperCase()) continue;
    const makeAliases = [entry.make, ...(entry.make_aliases || [])];
    const explicitMake = makeAliases.find(alias => upper.includes(String(alias).toUpperCase())) || null;

    const candidates = (entry.models || [])
      .flatMap(candidate => [candidate.canonical, ...(candidate.aliases || [])]
        .map(alias => ({ candidate, alias, key: normalizeAlphaNum(alias) })))
      .filter(({ key }) => normalizedText.includes(key))
      .sort((a, b) => b.key.length - a.key.length);

    if (candidates.length) {
      const best = candidates[0];
      const sameAliasOwners = (registry.markets || [])
        .filter(item => String(item.market || '').toUpperCase() === String(market || 'US').toUpperCase())
        .flatMap(item => (item.models || []).flatMap(candidate => [candidate.canonical, ...(candidate.aliases || [])]
          .map(alias => ({ make: item.make, model: candidate.canonical, key: normalizeAlphaNum(alias) }))))
        .filter(item => item.key === best.key);
      const uniqueModelNamespace = new Set(sameAliasOwners.map(item => `${item.make}:${item.model}`)).size === 1;

      if (explicitMake || uniqueModelNamespace) {
        const resolved = findPlatform({ make: explicitMake || entry.make, model: best.alias, market });
        return { ...resolved, year, engine, raw: text, make_inferred_from_unique_model: !explicitMake };
      }
    }
  }

  return {
    market: String(market || 'US').toUpperCase(),
    make: null,
    platform: null,
    model: null,
    matched: false,
    year,
    engine,
    raw: text,
    make_inferred_from_unique_model: false,
  };
}

module.exports = {
  registry,
  normalizeAlphaNum,
  findPlatform,
  extractYear,
  extractEngine,
  parseVehicleSearchText,
};
