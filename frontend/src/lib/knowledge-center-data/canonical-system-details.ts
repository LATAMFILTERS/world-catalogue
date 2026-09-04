import type { KCSystemDetail } from './types';
import { KC_SYSTEM_DETAILS as LEGACY_SYSTEM_DETAILS } from './systems-registry';

/**
 * Public system-detail layer.
 *
 * Historical detail records remain untouched for audit compatibility. Public
 * pages receive current five-system semantics and application-specific evidence
 * boundaries instead of legacy universal performance claims.
 */
export const KC_SYSTEM_DETAILS: Record<string, KCSystemDetail> = {
  ...LEGACY_SYSTEM_DETAILS,

  'air-intake-protection': {
    slug: 'air-intake-protection',
    failureMechanism: 'Loss of the protected airflow boundary can occur through media overload, damaged housing or seals, incorrect element seating, cabin/HVAC loading, or inadequate compressed-air moisture control. The resulting risk depends on the affected airflow path: engine contamination, reduced HVAC performance, operator exposure, or moisture-related pneumatic-system faults.',
    contaminationTarget: 'Airborne particulate at engine and cabin boundaries, unfiltered-air bypass at housing and sealing interfaces, and moisture in applicable compressed-air drying functions.',
    targetCleanliness: 'Application-specific. Engine intake performance is validated at the product and housing level under applicable air-cleaner test methods; cabin and compressed-air functions use their own applicable requirements and must not inherit one universal system target.',
    keyMetrics: [
      { label: 'Engine-air validation', value: 'Product/housing specific' },
      { label: 'Cabin-air validation', value: 'Application and media specific' },
      { label: 'Housing integrity', value: 'Continuous protected-air boundary' },
      { label: 'Compressed-air drying', value: 'Application and dryer specific' },
    ],
    sections: [
      {
        heading: 'One Airflow Protection System, Multiple Functions',
        body: 'Air Intake & Airflow Protection coordinates engine intake filtration, air-cleaner housings and sealing, cabin-air filtration, and applicable compressed-air drying as distinct functions inside one protection system. MACROCORE™ governs engine air-intake filtration, INTEKCORE™ governs housing and sealing architecture, MICROKAPPA™ governs cabin-air filtration, and DRYCORE™ governs approved air-dryer applications.',
      },
      {
        heading: 'Engine Intake Boundary',
        body: 'Engine protection depends on the complete dirty-air-to-clean-air path rather than the element alone. Media selection, dust capacity, restriction, element retention, housing condition, ducts, clamps and sealing interfaces must remain compatible with the engine airflow requirement and operating environment. Quantitative efficiency, capacity and restriction claims belong to the validated product and installed configuration.',
      },
      {
        heading: 'Cabin Air Is a Function, Not a Separate Protection System',
        body: 'Cabin filtration addresses operator and passenger exposure through the HVAC airflow path. MICROKAPPA™ media configuration is selected around contaminants, airflow demand, pressure-drop limits, housing fit and the intended cabin environment. Cabin-air performance must be validated independently from engine-air performance even though both belong to Air Intake & Airflow Protection.',
      },
      {
        heading: 'Compressed-Air Drying Function',
        body: 'DRYCORE™ supports moisture control in approved pneumatic and air-dryer applications. Dryer condition, compressor duty, purge behavior, downstream moisture evidence and service requirements must be evaluated together. Compressed-air drying remains an airflow-protection function and does not create a sixth ELIMFILTERS protection system.',
      },
    ],
  },

  'fuel-cleanliness-protection': {
    slug: 'fuel-cleanliness-protection',
    failureMechanism: 'Particles and water entering precision diesel-fuel components can contribute to abrasive wear, corrosion, sticking and loss of injection-system control. The protection strategy must therefore address particulate filtration and water management without mixing standard separator and turbine-style architectures.',
    contaminationTarget: 'Diesel-fuel particulate contamination and water contamination upstream of precision pumps, injectors and related fuel-system components.',
    targetCleanliness: 'Application-specific. Particle cleanliness, water limits, filtration performance and service intervals must be tied to the protected fuel system, product configuration and applicable validated evidence rather than assigned as one universal Fuel Cleanliness target.',
    keyMetrics: [
      { label: 'Particulate architecture', value: 'SYNTAPORE™' },
      { label: 'Standard non-turbine separation', value: 'HYDROCORE™' },
      { label: 'FH/FG turbine-style separation', value: 'TURBOCORE™' },
      { label: 'Final selection', value: 'Application-specific validation' },
    ],
    sections: [
      {
        heading: 'Three-Technology Fuel Cleanliness Architecture',
        body: 'Fuel Cleanliness Protection uses three distinct technologies. SYNTAPORE™ controls particulate contamination in approved primary, secondary and cartridge filtration positions. HYDROCORE™ governs approved standard non-turbine spin-on and cartridge fuel/water separator applications. TURBOCORE™ governs applicable FH/FG turbine-style fuel/water separation housings and their dedicated replacement configurations.',
      },
      {
        heading: 'Particulate Control — SYNTAPORE™',
        body: 'Particulate filtration is staged according to the approved fuel-system architecture, flow requirement, contamination exposure and sensitivity of downstream components. Product-level efficiency, contaminant capacity and pressure-drop performance remain tied to the individual validated filter and application.',
      },
      {
        heading: 'Standard Fuel/Water Separation — HYDROCORE™',
        body: 'HYDROCORE™ is restricted to approved standard non-turbine fuel/water separators, including applicable spin-on, cartridge, drain and transparent-bowl configurations. It must not be used as the technology identity for FH or FG turbine-style systems.',
      },
      {
        heading: 'Turbine-Style Separation — TURBOCORE™',
        body: 'TURBOCORE™ is reserved for applicable FH/FG turbine-style fuel/water separation systems and their dedicated replacement architecture, including approved 2010, 2020 and 2040-series configurations. Housing, element, seals, flow path and service condition must be treated as one approved turbine-specific system.',
      },
    ],
  },
};
