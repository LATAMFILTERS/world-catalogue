import { OemEntry, OemId } from './master-data-types';

/**
 * OEM REGISTRY
 * 
 * Master registry for all Original Equipment Manufacturers (OEMs).
 * No hardcoded product pages. This is purely metadata for relationship mapping.
 */
export const OEM_REGISTRY: Record<OemId, OemEntry> = {};
