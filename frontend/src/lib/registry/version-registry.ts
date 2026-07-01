/**
 * version-registry.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Version Registry — cross-registry version timeline aggregation.
 * Provides a unified view of all published entity versions across all
 * governed registries. Enables version traversal, changelog queries,
 * and temporal consistency verification.
 *
 * Constitutional basis: Every governed entity carries a versionHistory record.
 * The Version Registry aggregates these into a single queryable timeline.
 */

import type { VersionRegistryEntry } from './registry-types';
import { ENGINEERING_PRINCIPLES } from './engineering-principles';
import { TECHNOLOGY_ARCHITECTURES } from './technology-architectures';
import { STANDARDS_REGISTRY } from './standards-registry';
import { FAILURE_MODES_REGISTRY } from './failure-modes-registry';
import { CONTAMINATION_REGISTRY } from './contamination-registry';
import { PROTECTION_MEDIA_REGISTRY } from './protection-media-registry';

// ── Version Timeline — aggregated on demand ──────────────────────────────────

function aggregateVersionTimeline(): VersionRegistryEntry[] {
  const entries: VersionRegistryEntry[] = [];
  let seq = 0;

  const addVersions = (
    records: Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    entityType: string
  ) => {
    for (const record of Object.values(records)) {
      for (const v of record.versionHistory) {
        seq += 1;
        entries.push({
          entryId: `VER-${String(seq).padStart(4, '0')}`,
          entityId: record.id,
          entityType,
          version: v.version,
          publishedDate: v.publishedDate,
          approvedBy: v.approvedBy,
          changeNote: v.changeNote,
          edrRef: v.edrRef,
        });
      }
    }
  };

  addVersions(
    ENGINEERING_PRINCIPLES as unknown as Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    'ENGINEERING_PRINCIPLE'
  );
  addVersions(
    TECHNOLOGY_ARCHITECTURES as unknown as Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    'TECHNOLOGY_ARCHITECTURE'
  );
  addVersions(
    STANDARDS_REGISTRY as unknown as Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    'STANDARD'
  );
  addVersions(
    FAILURE_MODES_REGISTRY as unknown as Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    'FAILURE_MODE'
  );
  addVersions(
    CONTAMINATION_REGISTRY as unknown as Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    'CONTAMINATION'
  );
  addVersions(
    PROTECTION_MEDIA_REGISTRY as unknown as Record<string, { id: string; versionHistory: readonly { version: string; publishedDate: string; approvedBy: string; changeNote: string; edrRef?: string }[] }>,
    'PROTECTION_MEDIA'
  );

  return entries.sort((a, b) =>
    a.publishedDate.localeCompare(b.publishedDate) || a.entityId.localeCompare(b.entityId)
  );
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the complete version timeline across all registries, sorted by date.
 * Computed at call time from the live registry data — always current.
 */
export function getVersionTimeline(): VersionRegistryEntry[] {
  return aggregateVersionTimeline();
}

/**
 * Returns all version entries for a specific entity.
 */
export function getEntityVersionHistory(entityId: string): VersionRegistryEntry[] {
  return aggregateVersionTimeline().filter((e) => e.entityId === entityId);
}

/**
 * Returns all version entries published on a specific date (ISO 8601: YYYY-MM-DD).
 */
export function getVersionsByDate(date: string): VersionRegistryEntry[] {
  return aggregateVersionTimeline().filter((e) => e.publishedDate === date);
}

/**
 * Returns all version entries for a given entity type.
 */
export function getVersionsByEntityType(entityType: string): VersionRegistryEntry[] {
  return aggregateVersionTimeline().filter((e) => e.entityType === entityType);
}

/**
 * Returns version entries governed by a specific EDR.
 */
export function getVersionsByEdr(edrRef: string): VersionRegistryEntry[] {
  return aggregateVersionTimeline().filter(
    (e) => e.edrRef && e.edrRef.startsWith(edrRef)
  );
}

/**
 * Returns a summary of the version timeline.
 */
export function getVersionSummary(): {
  totalVersionEntries: number;
  entityTypeBreakdown: Record<string, number>;
  dateRange: { earliest: string; latest: string };
  entitiesWithMultipleVersions: string[];
} {
  const timeline = aggregateVersionTimeline();
  const breakdown: Record<string, number> = {};
  for (const e of timeline) {
    breakdown[e.entityType] = (breakdown[e.entityType] ?? 0) + 1;
  }

  const dates = timeline.map((e) => e.publishedDate).sort();

  const entityVersionCounts: Record<string, number> = {};
  for (const e of timeline) {
    entityVersionCounts[e.entityId] = (entityVersionCounts[e.entityId] ?? 0) + 1;
  }
  const multiVersion = Object.entries(entityVersionCounts)
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  return {
    totalVersionEntries: timeline.length,
    entityTypeBreakdown: breakdown,
    dateRange: {
      earliest: dates[0] ?? 'none',
      latest: dates[dates.length - 1] ?? 'none',
    },
    entitiesWithMultipleVersions: multiVersion,
  };
}
