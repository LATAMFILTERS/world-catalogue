/**
 * terminology-registry.ts
 * ELIMFILTERS Engineering Knowledge Platform — Terminology Registry Shim
 *
 * Phase 5B: This file is now a thin re-export shim.
 * All glossary data lives in knowledge-center-data/glossary-registry.ts
 * following the Phase 5A modular data architecture.
 *
 * This shim maintains 100% backward compatibility — all existing imports
 * from '@/lib/knowledge-center' continue to resolve correctly.
 *
 * Dependency direction (acyclic):
 *   knowledge-center-data/glossary-registry → this shim → components
 */

import type { TerminologyEntry } from './governance';
import { GLOSSARY_REGISTRY } from '@/lib/knowledge-center-data/glossary-registry';

/** Canonical terminology registry. Keyed by TERM-xxx permanent ID. */
export const TERMINOLOGY_REGISTRY: Record<string, TerminologyEntry> = GLOSSARY_REGISTRY;

// ── Registry helpers (backward-compatible) ────────────────────────────────────

/** Resolve a term by its permanent identifier. Returns undefined if not found. */
export function getTerm(id: string): TerminologyEntry | undefined {
  return TERMINOLOGY_REGISTRY[id];
}

/** Return all published terms, sorted alphabetically by term name. */
export function getPublishedTerms(): TerminologyEntry[] {
  return Object.values(TERMINOLOGY_REGISTRY)
    .filter((t) => t.status === 'published')
    .sort((a, b) => a.term.localeCompare(b.term));
}

/** Resolve multiple term IDs to their entries (skips unknown IDs). */
export function resolveTerms(ids: string[]): TerminologyEntry[] {
  return ids.flatMap((id) => {
    const t = TERMINOLOGY_REGISTRY[id];
    return t ? [t] : [];
  });
}
