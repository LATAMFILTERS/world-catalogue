import { CrossReferenceEntry } from './master-data-types';

/**
 * CROSS REFERENCE REGISTRY
 * 
 * Single source of truth for mapping OEM Part IDs to ELIMFILTERS Part Numbers.
 */
export const CROSS_REFERENCE_REGISTRY: Record<string, CrossReferenceEntry> = {};
