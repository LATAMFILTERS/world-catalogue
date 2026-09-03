import type { KCIndustryDetail } from './types';
import { KC_INDUSTRY_DETAILS as LEGACY_INDUSTRY_DETAILS } from './industries-registry';

const SYSTEM_NAME_MAP: Record<string, string> = {
  'Air Intake Protection': 'Air Intake & Airflow Protection',
  'Cabin Air Protection': 'Air Intake & Airflow Protection',
  'Compressed Air Protection': 'Air Intake & Airflow Protection',
};

function canonicalSystems(systems: string[]): string[] {
  return [...new Set(systems.map((system) => SYSTEM_NAME_MAP[system] ?? system))];
}

function canonicalMarineDetail(detail: KCIndustryDetail): KCIndustryDetail {
  return {
    ...detail,
    contaminationEnvironment: detail.contaminationEnvironment
      .replace('IMO compliance requirements for offshore operations', 'application-specific marine operating and environmental requirements'),
    primaryRisks: detail.primaryRisks.map((risk) =>
      risk === 'IMO compliance for vessel filtration systems'
        ? 'Marine regulatory and operating requirements require application-specific verification'
        : risk,
    ),
    keyMetrics: detail.keyMetrics.map((metric) => {
      if (metric.label === 'IMO compliance') {
        return { label: 'Marine operating requirements', value: 'Application-specific verification' };
      }
      if (metric.label === 'MARINECLEAN™') {
        return { label: 'MARINECLEAN™', value: 'Specialized marine solution' };
      }
      return metric;
    }),
    sections: detail.sections.map((section) => {
      if (section.heading === 'IMO Compliance and MARINECLEAN™') {
        return {
          ...section,
          heading: 'Marine Operating Context and MARINECLEAN™',
          body: 'Marine filtration selection must account for the vessel, engine, fuel-handling environment, operating profile, and the regulatory requirements applicable to the specific jurisdiction and service. MARINECLEAN™ is an ELIMFILTERS specialized commercial solution for marine operating environments. Any certification or compliance claim requires verified product- and application-specific evidence before public use.',
        };
      }
      return section;
    }),
  };
}

export const KC_INDUSTRY_DETAILS: Record<string, KCIndustryDetail> = Object.fromEntries(
  Object.entries(LEGACY_INDUSTRY_DETAILS).map(([slug, detail]) => {
    const normalized: KCIndustryDetail = {
      ...detail,
      systems: canonicalSystems(detail.systems),
    };

    return [slug, slug === 'marine' ? canonicalMarineDetail(normalized) : normalized];
  }),
);
