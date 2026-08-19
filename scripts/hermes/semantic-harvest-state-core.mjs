// HERMES — semantic-harvest state.
//
// Deliberately separate from source-baseline-core.mjs. The baseline answers
// "has this page's content hash changed since we last looked" and is
// governed by the approval-gated promotion flow (promote-baseline-core.mjs)
// because it feeds change-detection candidate semantics. This module
// answers a different question entirely — "have we ever extracted useful
// technical intelligence from this source at all" — and is intentionally
// NOT protected by HERMES_BASELINE_APPROVAL_TOKEN: a wrong value here only
// costs coverage (a source gets skipped or re-processed one extra time), it
// can never fabricate or suppress a change signal the way a corrupted
// baseline could. See sync-harvest-state.mjs for how this file is made
// durable across ephemeral GitHub Actions runners.
//
// Pure functions only — no fs access except loadHarvestState/
// saveHarvestState, which take an explicit path so callers (and tests)
// control exactly where reads/writes happen.
import fs from 'node:fs';
import path from 'node:path';

const EMPTY_STATE = Object.freeze({ schema_version: '1.0.0', updated_at: null, sources: {} });

export function loadHarvestState(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (parsed && typeof parsed.sources === 'object' && parsed.sources !== null) return parsed;
    return { ...EMPTY_STATE, sources: {} };
  } catch {
    return { ...EMPTY_STATE, sources: {} };
  }
}

export function saveHarvestState(filePath, state) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

/** True only if this endpoint has a recorded semantic-harvest entry. */
export function hasBeenHarvested(state, endpointId) {
  return Boolean(state?.sources?.[endpointId]);
}

/** Pure — returns a new state object with this endpoint's harvest entry set/updated. */
export function recordHarvest(state, endpointId, { harvestedAt, contentHash }) {
  const existing = state?.sources?.[endpointId] ?? null;
  const entry = {
    endpoint_id: endpointId,
    first_harvested_at: existing?.first_harvested_at ?? harvestedAt,
    last_harvested_at: harvestedAt,
    last_harvested_hash: contentHash,
    harvest_count: (existing?.harvest_count ?? 0) + 1
  };
  return {
    ...state,
    updated_at: harvestedAt,
    sources: { ...(state?.sources ?? {}), [endpointId]: entry }
  };
}
