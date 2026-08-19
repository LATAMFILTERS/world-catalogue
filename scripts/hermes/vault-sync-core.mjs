// HERMES -> Obsidian Knowledge Vault governed sync — planning layer.
//
// This module is deliberately a PLANNER, not a writer: every function here
// is pure/read-only given an injected vault snapshot, so the exact same
// logic drives both `--dry-run` (report only) and `--apply` (the caller
// applies the plan). It does not replace the existing approval pipeline
// (scripts/hermes/publish-approved-candidate.mjs, update-existing-note.mjs)
// — it decides WHETHER and WHERE a sync should happen, reusing those
// scripts' governance (APPROVED + Victor's sign-off required, managed-block
// convention, refuse-to-overwrite-unmanaged-content) rather than
// duplicating it.
//
// Authority boundary: this module NEVER treats a raw/unapproved HERMES
// finding as canonical. A finding only reaches CREATE/UPDATE here if the
// caller has already verified workflow_status === 'APPROVED' with Victor's
// sign-off (see planEntitySync's `assumeApproved` contract below) — the
// planner itself additionally refuses to ever target 01-technologies/ with
// a CREATE (a new technology can never be auto-created; only an existing,
// already-canonical technology note may be updated).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// The vault's actual current top-level categories (see elimfilters-vault/
// README.md and 00-meta/_SCHEMA-REFERENCE.md) plus the existing internal
// intelligence/audit log location already used by
// collect-real-sources-core.mjs and publish-approved-candidate.mjs
// (elimfilters-vault/94-sync-log). This is NOT the same as the older,
// partly-aspirational `governedFolders` list inside publish-approved-
// candidate.mjs/update-existing-note.mjs, several of whose entries
// (12-oems, 13-equipment, 14-intelligence, 15-filter-media, 16-suppliers,
// 17-technology-watch) do not exist as real vault directories yet — this
// list is scoped to what the vault actually has today, deliberately
// narrower, and is not weakened by widening it.
export const WRITE_ALLOWLIST = Object.freeze([
  '01-technologies/active',
  '02-industries',
  '03-systems',
  '04-standards',
  '05-contamination',
  '06-components',
  '07-problems',
  '08-product-families',
  '94-sync-log'
]);

export function isAllowedTarget(relativeFolder) {
  const normalized = String(relativeFolder || '').replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
  return WRITE_ALLOWLIST.some((allowed) => normalized === allowed || normalized.startsWith(`${allowed}/`));
}

/** Resolves a target path and refuses anything that would escape the vault root or the allowlist. */
export function resolveVaultWritePath(vaultRoot, relativeFolder, fileName) {
  if (!isAllowedTarget(relativeFolder)) {
    return { ok: false, reason: `OUTSIDE_ALLOWLIST: ${relativeFolder}` };
  }
  const dir = path.resolve(vaultRoot, relativeFolder);
  const resolvedRoot = path.resolve(vaultRoot);
  if (dir !== resolvedRoot && !dir.startsWith(resolvedRoot + path.sep)) {
    return { ok: false, reason: `ESCAPES_VAULT: ${relativeFolder}` };
  }
  const safeFile = String(fileName).replace(/[^A-Za-z0-9_-]/g, '_');
  return { ok: true, dir, filePath: path.join(dir, `${safeFile}.md`), safeFile };
}

// --- Frontmatter parsing (minimal, matches this vault's existing style: a
// leading `---` YAML block, `key: value` and `key:\n  - "[[X]]"` list
// forms only — never a full YAML parser, same restraint as
// build-citation-index.js's own parser for this repo). ---
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const data = {};
  let currentKey = null;
  for (const line of lines) {
    const listItem = /^\s*-\s*(.+)$/.exec(line);
    if (listItem && currentKey) {
      (data[currentKey] ||= []).push(listItem[1].trim().replace(/^"|"$/g, ''));
      continue;
    }
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();
      if (value === '') { data[currentKey] = undefined; continue; }
      data[currentKey] = value.replace(/^"|"$/g, '');
    }
  }
  return data;
}

function extractWikilinkKey(value) {
  const match = /^\[\[([^\]|]+)/.exec(String(value || '').trim());
  return match ? match[1].trim() : null;
}

/**
 * Builds an index of every entity currently in the vault's allowlisted
 * folders: key, name, status, type, file path. Used for entity resolution
 * (never create a duplicate of an existing entity) and for validating that
 * a generated wikilink resolves to something real and non-deprecated.
 */
export function loadVaultEntityIndex(vaultRoot, { readFile = (p) => fs.readFileSync(p, 'utf8'), listFiles } = {}) {
  const index = { byKey: new Map(), byNormalizedName: new Map() };
  const folders = WRITE_ALLOWLIST.filter((f) => f !== '94-sync-log');
  for (const folder of folders) {
    const dir = path.resolve(vaultRoot, folder);
    let files;
    try {
      files = listFiles ? listFiles(dir) : fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const file of files) {
      const filePath = path.join(dir, file);
      let raw;
      try { raw = readFile(filePath); } catch { continue; }
      const fm = parseFrontmatter(raw);
      if (!fm.key) continue;
      const entry = {
        key: fm.key,
        name: fm.name || fm.key,
        type: fm.type || null,
        status: fm.status || fm.tech_status || null,
        folder,
        filePath
      };
      index.byKey.set(fm.key, entry);
      index.byNormalizedName.set(normalizeForMatch(fm.name || fm.key), entry);
    }
  }
  return index;
}

function normalizeForMatch(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[™®©]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Dynamic canonical-technology set — read from 01-technologies/active/*.md
 * `key:` values at call time, never hardcoded. Deprecated/retired
 * technologies (living under a different status, e.g. 01-technologies with
 * tech_status: deprecated, or absent from active/ entirely after retirement
 * like TURBOCORE) are never included just by virtue of appearing somewhere
 * in the vault's history.
 */
export function loadCanonicalTechnologies(vaultRoot, opts = {}) {
  const index = loadVaultEntityIndex(vaultRoot, opts);
  const canonical = new Set();
  for (const [key, entry] of index.byKey) {
    if (entry.folder === '01-technologies/active' && (entry.status === 'active' || entry.status === undefined)) {
      canonical.add(key);
    }
  }
  return canonical;
}

/**
 * Entity resolution: does a candidate key/name already exist in the vault?
 * Exact key match wins outright. A normalized-name match that does NOT
 * also match the same key is reported AMBIGUOUS rather than silently
 * treated as the same entity or silently treated as new — this is what
 * stops "Cummins ISX" / "ISX Cummins" / "Cummins-ISX" from ever becoming
 * three notes without a human deciding they really are the same thing.
 */
export function resolveEntity(index, candidateKey, candidateName) {
  if (candidateKey && index.byKey.has(candidateKey)) {
    return { status: 'FOUND', entry: index.byKey.get(candidateKey) };
  }
  const normalized = normalizeForMatch(candidateName || candidateKey);
  const byName = index.byNormalizedName.get(normalized);
  if (byName) {
    return { status: 'AMBIGUOUS', reason: 'NAME_MATCHES_DIFFERENT_KEY', matches: [byName] };
  }
  return { status: 'NOT_FOUND' };
}

/**
 * Validates a proposed set of [[KEY]] relationship targets against the
 * vault index. Every target must already exist and must not be a
 * deprecated/retired technology. Returns { valid, dangling } — callers
 * must drop `dangling` entries rather than write them (never a silent
 * dangling link, per the mission's explicit rule).
 */
export function validateWikilinks(index, targets) {
  const valid = [];
  const dangling = [];
  const seen = new Set();
  for (const target of targets || []) {
    const key = extractWikilinkKey(target) || target;
    if (seen.has(key)) continue; // duplicate target — silently deduped, never a repeated wikilink
    seen.add(key);
    const entry = index.byKey.get(key);
    if (!entry) { dangling.push(key); continue; }
    if (entry.folder === '01-technologies/active' && entry.status && entry.status !== 'active') { dangling.push(key); continue; }
    valid.push(key);
  }
  return { valid, dangling };
}

// Bridge eligibility: reuses the EXISTING Knowledge Graph pipeline
// (scripts/build-citation-index.js already scans every allowlisted vault
// folder) rather than building a parallel ingestion path — anything
// CREATE/UPDATE writes into the vault is automatically KG-visible on the
// next citation-index build with zero new code. Catalog/Knowledge Center
// eligibility are separate, narrower, and both default closed: catalog
// eligibility requires evidence-appropriate application/fitment data this
// pass does not yet produce (08-product-families is not a CREATE/UPDATE
// target here), and Knowledge Center eligibility is never auto-true —
// publication is explicitly a separate governed action (item 18).
export function computeBridgeEligibility({ targetFolder }) {
  return {
    kg_eligible: true,
    catalog_eligible: targetFolder === '08-product-families',
    kc_eligible: false
  };
}

/**
 * The evidence fingerprint is the idempotency key: it hashes only the
 * SEMANTIC content of a finding (statement, relationships, source
 * identity, evidence hash) — never a sync-time wall-clock value. Two syncs
 * of identical evidence produce the identical fingerprint, which is what
 * makes "unchanged evidence -> zero diff" actually enforceable rather than
 * merely intended.
 */
export function computeEvidenceFingerprint(finding) {
  const canonical = {
    canonical_entity: finding.canonical_entity || finding.entity_code || null,
    statement: finding.statement || finding.source_title || null,
    relationships: [...(finding.relationships || [])].sort(),
    source_url: finding.source_url || null,
    source_organization: finding.source_organization || finding.source_publisher || null,
    evidence_hash: finding.evidence_hash || finding.source_hash || null,
    confidence: finding.confidence ?? null
  };
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export const MANAGED_BLOCK_START = '<!-- HERMES MANAGED UPDATE START -->';
export const MANAGED_BLOCK_END = '<!-- HERMES MANAGED UPDATE END -->';

/**
 * Builds the deterministic HERMES-managed block. Every field is either
 * static (marker text) or derived from the evidence itself (observed_at,
 * harvested_at, run_id, confidence, source identity, fingerprint) — never
 * "now" at sync time — so re-running with byte-identical evidence produces
 * a byte-identical block, satisfying idempotency (item 14).
 */
export function buildManagedBlock({ finding, relationships = [], fingerprint }) {
  const lines = [
    MANAGED_BLOCK_START,
    '## HERMES intelligence (managed — do not edit by hand)',
    '',
    `- hermes_managed: true`,
    `- hermes_status: ${finding.approval_status || finding.workflow_status || 'PENDING_REVIEW'}`,
    `- hermes_confidence: ${finding.confidence ?? 'unknown'}`,
    `- hermes_run_id: ${finding.hermes_run_id || finding.run_id || 'unknown'}`,
    `- hermes_evidence_hash: ${finding.evidence_hash || finding.source_hash || 'unknown'}`,
    `- hermes_fingerprint: ${fingerprint}`,
    `- hermes_observed_at: ${finding.observed_at || finding.captured_at || 'unknown'}`,
    `- hermes_harvested_at: ${finding.harvested_at || finding.captured_at || 'unknown'}`,
    '',
    '### Provenance',
    '',
    `- Source organization: ${finding.source_organization || finding.source_publisher || 'unknown'}`,
    `- Source title: ${finding.source_title || 'unknown'}`,
    `- Source URL: ${finding.source_url || 'unknown'}`,
    '',
    '### Statement',
    '',
    finding.statement || finding.proposed_action || '(no statement provided)',
    ''
  ];
  if (relationships.length) {
    lines.push('### Relationships', '', ...relationships.map((key) => `- [[${key}]]`), '');
  }
  lines.push(MANAGED_BLOCK_END);
  return lines.join('\n');
}

/** Merges a managed block into existing note content — same replace-between-markers-or-append logic as update-existing-note.mjs, factored out so both the planner and that script share one implementation. */
export function mergeManagedBlock(original, managedBlock) {
  const start = original.indexOf(MANAGED_BLOCK_START);
  const end = original.indexOf(MANAGED_BLOCK_END);
  if (start >= 0 && end >= start) {
    return original.slice(0, start) + managedBlock + original.slice(end + MANAGED_BLOCK_END.length);
  }
  return `${original.trimEnd()}\n\n${managedBlock}\n`;
}

/** Reads the fingerprint already recorded in an existing note's managed block, if any — the previous run's idempotency key. */
export function extractRecordedFingerprint(noteContent) {
  const match = /hermes_fingerprint:\s*([a-f0-9]{8,64})/.exec(noteContent || '');
  return match ? match[1] : null;
}

/**
 * Decides what should happen for one finding, given the current vault
 * state. Pure — makes no filesystem writes. `assumeApproved` must be
 * pre-verified by the caller (workflow_status === 'APPROVED', Victor's
 * sign-off present) — this function additionally re-checks it defensively
 * so a caller bug can never smuggle an unapproved finding through.
 */
export function planEntitySync({ finding, vaultIndex, canonicalTechnologies, targetFolder, targetKey, targetName, readExisting }) {
  const approved = finding.workflow_status === 'APPROVED' && finding.approved_by && finding.approval_required === true;
  if (!approved) {
    return { decision: 'REJECTED', reason: 'UNAPPROVED', finding_id: finding.entity_code || finding.finding_id };
  }

  if (!isAllowedTarget(targetFolder)) {
    return { decision: 'REJECTED', reason: 'OUTSIDE_ALLOWLIST', finding_id: finding.entity_code, targetFolder };
  }

  const resolution = resolveEntity(vaultIndex, targetKey, targetName);
  if (resolution.status === 'AMBIGUOUS') {
    return { decision: 'AMBIGUOUS', finding_id: finding.entity_code, matches: resolution.matches.map((m) => m.key), reason: resolution.reason };
  }

  const isTechnologyFolder = targetFolder === '01-technologies/active';
  if (resolution.status === 'NOT_FOUND') {
    if (isTechnologyFolder) {
      // A brand-new technology can never be auto-created — only an
      // already-canonical one may ever be updated. This check is
      // independent of (and in addition to) the general allowlist check.
      return { decision: 'REJECTED', reason: 'NONCANONICAL_TECHNOLOGY_CREATE', finding_id: finding.entity_code, targetKey };
    }
    const { valid, dangling } = validateWikilinks(vaultIndex, finding.relationships || []);
    const fingerprint = computeEvidenceFingerprint(finding);
    return {
      decision: 'CREATE',
      finding_id: finding.entity_code,
      targetFolder,
      targetKey,
      relationships: valid,
      danglingRejected: dangling,
      fingerprint,
      managedBlock: buildManagedBlock({ finding, relationships: valid, fingerprint }),
      ...computeBridgeEligibility({ targetFolder })
    };
  }

  // FOUND — existing entity. Technology folder: only allowed if it's
  // already an active canonical technology (dynamic check, no hardcoded list).
  if (isTechnologyFolder && !canonicalTechnologies.has(resolution.entry.key)) {
    return { decision: 'REJECTED', reason: 'NONCANONICAL_TECHNOLOGY_UPDATE', finding_id: finding.entity_code, targetKey };
  }

  const { valid, dangling } = validateWikilinks(vaultIndex, finding.relationships || []);
  const fingerprint = computeEvidenceFingerprint(finding);
  const existingContent = readExisting ? readExisting(resolution.entry.filePath) : null;
  const recordedFingerprint = extractRecordedFingerprint(existingContent);
  if (recordedFingerprint === fingerprint) {
    return { decision: 'NOOP', reason: 'UNCHANGED_EVIDENCE', finding_id: finding.entity_code, targetPath: resolution.entry.filePath };
  }

  return {
    decision: 'UPDATE',
    finding_id: finding.entity_code,
    targetPath: resolution.entry.filePath,
    relationships: valid,
    danglingRejected: dangling,
    fingerprint,
    previousFingerprint: recordedFingerprint,
    managedBlock: buildManagedBlock({ finding, relationships: valid, fingerprint }),
    ...computeBridgeEligibility({ targetFolder })
  };
}

/** Batch planner — the dry-run/apply entry point. */
export function planSync(findings, { vaultRoot, readFile, listFiles, resolveTarget }) {
  const vaultIndex = loadVaultEntityIndex(vaultRoot, { readFile, listFiles });
  const canonicalTechnologies = loadCanonicalTechnologies(vaultRoot, { readFile, listFiles });
  const plans = findings.map((finding) => {
    const target = resolveTarget(finding);
    if (!target) return { decision: 'REJECTED', reason: 'NO_TARGET_MAPPING', finding_id: finding.entity_code };
    return planEntitySync({
      finding,
      vaultIndex,
      canonicalTechnologies,
      targetFolder: target.folder,
      targetKey: target.key,
      targetName: target.name,
      readExisting: readFile
    });
  });
  return {
    plans,
    summary: {
      create: plans.filter((p) => p.decision === 'CREATE').length,
      update: plans.filter((p) => p.decision === 'UPDATE').length,
      noop: plans.filter((p) => p.decision === 'NOOP').length,
      ambiguous: plans.filter((p) => p.decision === 'AMBIGUOUS').length,
      rejected: plans.filter((p) => p.decision === 'REJECTED').length
    }
  };
}
