import { OemPartEntry, OemPartId } from './master-data-types';

/**
 * OEM PART REGISTRY
 * 
 * Master registry mapping OEM parts to their categories and linked cross-references.
 */
export const OEM_PART_REGISTRY: Record<OemPartId, OemPartEntry> = {};
