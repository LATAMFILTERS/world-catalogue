import { KC_SYSTEMS as LEGACY_KC_SYSTEMS } from './systems-registry';

/**
 * Public Knowledge Center protection-system registry.
 *
 * The historical registry contains a separate cabin-air concept used by earlier
 * Knowledge Graph work. Public entity surfaces expose the current five-system
 * architecture instead. Cabin Air and applicable Compressed Air functions remain
 * inside Air Intake & Airflow Protection.
 */
export const KC_SYSTEMS = LEGACY_KC_SYSTEMS
  .filter((system) => system.slug !== 'cabin-air-protection')
  .map((system) => {
    if (system.slug === 'air-intake-protection') {
      return {
        ...system,
        title: 'Air Intake & Airflow Protection',
        description: 'Coordinated protection across engine air intake, air-cleaner housings, cabin-air filtration and applicable compressed-air drying. These are distinct airflow functions inside one protection system.',
        technologies: ['MACROCORE™', 'INTEKCORE™', 'MICROKAPPA™', 'DRYCORE™'],
        standards: ['ISO 5011', 'ISO 11155-1', 'DIN 71460', 'ISO 8573-1'],
        challenges: ['Silica ingestion', 'Air restriction', 'Housing and seal integrity', 'Cabin air quality', 'Compressed-air moisture control'],
      };
    }

    if (system.slug === 'fuel-cleanliness-protection') {
      return {
        ...system,
        technologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
        description: 'Coordinated diesel-fuel protection across particulate filtration, approved standard non-turbine fuel/water separation and approved FH/FG turbine-style separation.',
      };
    }

    return system;
  });
