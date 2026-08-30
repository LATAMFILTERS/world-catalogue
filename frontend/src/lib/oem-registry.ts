import { OemEntry, OemId } from './master-data-types';

/**
 * OEM REGISTRY
 *
 * Master registry for all Original Equipment Manufacturers (OEMs).
 * No hardcoded product pages. This is purely metadata for relationship mapping.
 */
export const OEM_REGISTRY: Record<OemId, OemEntry> = {
  DONALDSON: {
    id: 'DONALDSON',
    name: 'Donaldson Company, Inc.',
    category: 'Filtration Manufacturer',
    country: 'USA',
    status: 'ACTIVE',
    productCategories: ['air', 'fuel', 'hydraulic', 'oil', 'cabin', 'fuel-water-separator', 'air-dryer', 'coolant'],
    documentationStatus: 'PARTIAL',
  },
  MANN: {
    id: 'MANN',
    name: 'MANN+HUMMEL (MANN-FILTER)',
    category: 'Filtration Manufacturer',
    country: 'Germany',
    status: 'ACTIVE',
    productCategories: ['air', 'fuel', 'oil', 'air-dryer'],
    documentationStatus: 'PARTIAL',
  },
  FLEETGUARD: {
    id: 'FLEETGUARD',
    name: 'Fleetguard (Cummins Filtration / Atmus Filtration Technologies)',
    category: 'Filtration Manufacturer',
    country: 'USA',
    status: 'ACTIVE',
    productCategories: ['air-dryer', 'fuel-water-separator', 'fuel-housing'],
    documentationStatus: 'PARTIAL',
  },
};
