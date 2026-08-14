import { ProductPlatformEntry } from './master-data-types';
import { EcosystemKey } from './canonical-entity-types';

/**
 * PRODUCT PLATFORM REGISTRY
 *
 * Master registry of Commercial Platforms (DURATECH, MARINECLEAN).
 */
export const PRODUCT_PLATFORM_REGISTRY: Record<EcosystemKey, ProductPlatformEntry> = {} as Record<EcosystemKey, ProductPlatformEntry>;
