import { ProductPlatformEntry } from './master-data-types';
import { EcosystemKey } from './unified-data';

/**
 * PRODUCT PLATFORM REGISTRY
 * 
 * Master registry of all Commercial Platforms (e.g. DURATECH, MARINECLEAN).
 */
export const PRODUCT_PLATFORM_REGISTRY: Record<EcosystemKey, ProductPlatformEntry> = {} as Record<EcosystemKey, ProductPlatformEntry>;
