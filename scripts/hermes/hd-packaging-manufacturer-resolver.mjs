import fs from 'node:fs';
import path from 'node:path';
import { normalizeManufacturer } from './catalogue-coverage-audit.mjs';

const DEFAULT_ORGS = path.resolve('hermes/config/source-organizations.json');

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
  ];
  const note = String(org.notes || '');
  for (const token of note.split(/[\/,;()|]+/)) values.push(token);
  return [...new Set(values.map(normalizeManufacturer).filter((v) => v && v.length >= 2))];
}

function collapseEquivalent(matches) {
  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];
  const domains = new Set(matches.map((m) => String(m.official_domain || '').toLowerCase()).filter(Boolean));
  if (domains.size === 1) return [...matches].sort((a,b) => rankOrg(b) - rankOrg(a))[0];
  return null;
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
    if (equivalent) return { status: direct.length > 1 ? 'EXACT_EQUIVALENT' : 'EXACT', normalized, organization: equivalent, candidates: direct };
    if (direct.length > 1) return { status: 'AMBIGUOUS_EXACT', normalized, organization: null, candidates: direct };

    const tokens = normalized.split(' ').filter((t) => t.length >= 3);
    const fuzzy = [];
    for (const org of organizations || []) {
      const orgKeys = keysForOrg(org);
      if (orgKeys.some((key) => key === normalized || key.includes(normalized) || normalized.includes(key) || tokens.some((t) => key.split(' ').includes(t)))) fuzzy.push(org);
    }
    const unique = [...new Map(fuzzy.map((o) => [o.id, o])).values()];
    const fuzzyEquivalent = collapseEquivalent(unique);
    if (fuzzyEquivalent && unique.length <= 3) return { status: 'FUZZY_EQUIVALENT', normalized, organization: fuzzyEquivalent, candidates: unique };
    return { status: unique.length ? 'AMBIGUOUS_FUZZY' : 'UNMAPPED', normalized, organization: null, candidates: unique };
  };
}

export function loadManufacturerResolver(file = DEFAULT_ORGS) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const organizations = doc.organizations || [];
  return { organizations, resolveManufacturer: buildManufacturerResolver(organizations) };
}
