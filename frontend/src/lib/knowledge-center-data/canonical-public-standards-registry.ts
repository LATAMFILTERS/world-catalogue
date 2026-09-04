import type { KCStandard } from './types';
import { KC_STANDARDS as STRUCTURAL_STANDARDS } from './canonical-structural-standards-registry';

/**
 * Standards allowed to participate in the current public Knowledge Center.
 * Historical records remain preserved in the legacy registries for audit history.
 */
export const RETIRED_PUBLIC_STANDARD_SLUGS = new Set([
  'nfpa-t2-14',
]);

export const KC_STANDARDS: KCStandard[] = STRUCTURAL_STANDARDS.filter(
  (standard) => !RETIRED_PUBLIC_STANDARD_SLUGS.has(standard.slug),
);
