import fs from 'node:fs';
import path from 'node:path';
import { normalizeManufacturer } from './catalogue-coverage-audit.mjs';

const DEFAULT_ORGS = path.resolve('hermes/config/source-organizations.json');

const SAFE_ALIAS_BY_ORG_ID = Object.freeze({
  baldwin_filters: ['BALDWIN'],
  cummins_filtration: ['FLEETGUARD'],
  fram_group: ['FRAM'],
  hengst: ['HENGST'],
  luber_finer: ['LUBERFINER', 'LUBER FINER', 'CHAMP'],
  sakura_filter: ['SAKURA', 'SAKURA FILTER'],
  ufi_filters: ['UFI', 'UFI FILTERS'],
  ford: ['FORD'],
  gm: ['GENERAL MOTORS', 'GENERAL-MOTORS', 'GM'],
  purolator: ['PUROLATOR'],
});

function rankOrg(org) {
  let score = 0;
  if (org.status === 'ACTIVE') score += 100;
  if (org.enabled === true) score += 50;
  if (org.official === true) score += 25;
  const p = Number(org.priority);
  if (Number.isFinite(p)) score += Math.max(0, 10 - p);
  return score;
}

function keysForOrg(org) {
  const values = [
    org.id?.replace(/_/g, ' '),
    org.name,
    org.parent_company,
    ...(Array.isArray(org.aliases) ? org.aliases : []),
    ...(SAFE_ALIAS_BY_ORG_ID[org.id] || []),
  ];
  return [...new Set(values.map(normalizeManufacturer).filter((v) => v && v.length >= 2))];
}

function collapseEquivalent(matches) {
  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];
  const domains = new Set(matches.map((m) => String(m.official_domain || '').toLowerCase()).filter(Boolean));
  if (domains.size === 1) return [...matches].sort((a,b) => rankOrg(b) - rankOrg(a))[0];
  return null;
}

function conservativeFuzzyCandidates(normalized, organizations) {
  const candidates = [];
  for (const org of organizations || []) {
    for (const key of keysForOrg(org)) {
      // Only allow containment when the shorter side is still highly specific.
      // This prevents generic tokens such as AMERICAN/PARTS/FILTER from mapping
      // unrelated companies merely because a note or corporate name shares a word.
      const shorter = normalized.length <= key.length ? normalized : key;
      const longer = normalized.length <= key.length ? key : normalized;
      if (shorter.length >= 6 && longer.includes(shorter)) {
        candidates.push(org);
        break;
      }
    }
  }
  return [...new Map(candidates.map((org) => [org.id, org])).values()];
}

export function buildManufacturerResolver(organizations) {
  const exact = new Map();
  for (const org of organizations || []) {
    for (const key of keysForOrg(org)) {
      if (!exact.has(key)) exact.set(key, []);
      exact.get(key).push(org);
    }
  }

  return function resolveManufacturer(rawManufacturer) {
    const normalized = normalizeManufacturer(rawManufacturer);
    if (!normalized) return { status: 'UNMAPPED', normalized, organization: null, candidates: [] };

    const direct = exact.get(normalized) || [];
    const equivalent = collapseEquivalent(direct);
    if (equivalent) {
      const isAlias = (SAFE_ALIAS_BY_ORG_ID[equivalent.id] || []).map(normalizeManufacturer).includes(normalized);
      return {
        status: isAlias ? 'SAFE_ALIAS' : (direct.length > 1 ? 'EXACT_EQUIVALENT' : 'EXACT'),
        normalized,
        organization: equivalent,
        candidates: direct,
      };
    }
    if (direct.length > 1) return { status: 'AMBIGUOUS_EXACT', normalized, organization: null, candidates: direct };

    const fuzzy = conservativeFuzzyCandidates(normalized, organizations);
    const fuzzyEquivalent = collapseEquivalent(fuzzy);
    if (fuzzyEquivalent && fuzzy.length === 1) {
      return { status: 'CONSERVATIVE_FUZZY', normalized, organization: fuzzyEquivalent, candidates: fuzzy };
    }

    return {
      status: fuzzy.length ? 'AMBIGUOUS_FUZZY' : 'UNMAPPED',
      normalized,
      organization: null,
      candidates: fuzzy,
    };
  };
}

export function loadManufacturerResolver(file = DEFAULT_ORGS) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const organizations = doc.organizations || [];
  return { organizations, resolveManufacturer: buildManufacturerResolver(organizations) };
}
