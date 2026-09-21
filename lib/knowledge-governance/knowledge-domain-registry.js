'use strict';

const KNOWLEDGE_DOMAINS = Object.freeze({
  HEAVY_DUTY: 'HEAVY_DUTY_KNOWLEDGE_DOMAIN',
  LIGHT_DUTY: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
  INDUSTRIAL_PROCESS: 'INDUSTRIAL_PROCESS_KNOWLEDGE_DOMAIN',
  SHARED: 'SHARED_ENGINEERING_KNOWLEDGE'
});

const INDUSTRIES = Object.freeze({
  HEAVY_DUTY: Object.freeze([
    'Agriculture', 'Bus & Coach', 'Construction', 'Manufacturing', 'Marine',
    'Mining', 'Oil & Gas', 'Power Generation', 'Railway', 'Truck Fleets', 'Waste Municipal'
  ]),
  LIGHT_DUTY: Object.freeze(['Automotive']),
  INDUSTRIAL_PROCESS: Object.freeze(['Manufacturing', 'Oil & Gas', 'Power Generation'])
});

const SYSTEMS = Object.freeze({
  AIR_INTAKE: 'Air Intake & Airflow Protection Systems',
  FUEL: 'Fuel Cleanliness Protection Systems',
  LUBE: 'Lube/Oil Protection Systems',
  HYDRAULIC: 'Hydraulic Systems Protection',
  COMPRESSED_AIR: 'Compressed Air Systems',
  INDUSTRIAL_PROCESS: 'Industrial & Process'
});

const PLATFORMS = Object.freeze({
  AEREMIS: 'AEREMIS™',
  PARTION: 'PARTION™',
  COALVEX: 'COALVEX™',
  FLUREXIS: 'FLUREXIS™',
  AQUVEXIS: 'AQUVEXIS™'
});

const TECHNOLOGIES = Object.freeze({
  MACROCORE: 'MACROCORE™',
  MICROKAPPA: 'MICROKAPPA™',
  SYNTRAX: 'SYNTRAX™',
  HYDROCORE: 'HYDROCORE™',
  HYDROCORE_SERIES: 'HYDROCORE/SERIES™',
  NANOFORCE: 'NANOFORCE™',
  DRYCORE: 'DRYCORE™',
  INTEKCORE: 'INTEKCORE™',
  THERMACORE: 'THERMACORE™',
  DURACTECH: 'DURACTECH™',
  MARINECLEAN: 'MARINECLEAN™',
  HE_CRIVA: 'HE-CRIVA™',
  MA_TREA: 'MA-TREA™',
  FUMEVRA: 'FUMEVRA™',
  COALERIS: 'COALERIS™',
  HYLTRIS: 'HYLTRIS™',
  LUBREVA: 'LUBREVA™',
  DEWATIS: 'DEWATIS™',
  OILREVEX: 'OILREVEX™',
  ADSOVEX: 'ADSOVEX™',
  MEMBRAVEX: 'MEMBRAVEX™',
  IONVEXA: 'IONVEXA™'
});

const DOMAIN_SYSTEMS = Object.freeze({
  [KNOWLEDGE_DOMAINS.HEAVY_DUTY]: Object.freeze([
    SYSTEMS.AIR_INTAKE,
    SYSTEMS.FUEL,
    SYSTEMS.LUBE,
    SYSTEMS.HYDRAULIC,
    SYSTEMS.COMPRESSED_AIR
  ]),
  [KNOWLEDGE_DOMAINS.LIGHT_DUTY]: Object.freeze([
    SYSTEMS.LUBE,
    SYSTEMS.AIR_INTAKE,
    SYSTEMS.FUEL
  ]),
  [KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS]: Object.freeze([
    SYSTEMS.INDUSTRIAL_PROCESS
  ])
});

const DOMAIN_PLATFORMS = Object.freeze({
  [KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS]: Object.freeze(Object.values(PLATFORMS))
});

// Branded Industrial & Process technology ownership. Descriptive treatment
// families (for example General Air Filtration or Gas-Liquid Separation)
// intentionally remain outside TECHNOLOGIES and are routed without a
// confirmed branded-technology relation.
const PLATFORM_TECHNOLOGIES = Object.freeze({
  [PLATFORMS.AEREMIS]: Object.freeze([
    TECHNOLOGIES.HE_CRIVA,
    TECHNOLOGIES.MA_TREA
  ]),
  [PLATFORMS.PARTION]: Object.freeze([
    TECHNOLOGIES.FUMEVRA
  ]),
  [PLATFORMS.COALVEX]: Object.freeze([
    TECHNOLOGIES.COALERIS
  ]),
  [PLATFORMS.FLUREXIS]: Object.freeze([
    TECHNOLOGIES.HYLTRIS,
    TECHNOLOGIES.LUBREVA,
    TECHNOLOGIES.DEWATIS,
    TECHNOLOGIES.OILREVEX
  ]),
  [PLATFORMS.AQUVEXIS]: Object.freeze([
    TECHNOLOGIES.ADSOVEX,
    TECHNOLOGIES.MEMBRAVEX,
    TECHNOLOGIES.IONVEXA
  ])
});

const SHARED_ENGINEERING_TOPICS = Object.freeze([
  'Filtration Efficiency',
  'Micron Rating',
  'Beta Ratio',
  'Dirt Holding Capacity',
  'Flow Rate',
  'Differential Pressure',
  'Restriction',
  'Bypass',
  'Contaminant Loading',
  'Media Saturation',
  'Sealing',
  'Service Life',
  'Installation',
  'Failure Analysis',
  'Standards'
]);

const VALID_TECHNOLOGY_RELATIONS = Object.freeze(['confirmed', 'probable', 'none']);
const VALID_APPLICATION_RELATIONS = Object.freeze(['verified', 'candidate', 'rejected']);

function isValidDomain(domain) {
  return Object.values(KNOWLEDGE_DOMAINS).includes(domain);
}

function isSystemAllowedForDomain(domain, system) {
  if (domain === KNOWLEDGE_DOMAINS.SHARED) return true;
  return Array.isArray(DOMAIN_SYSTEMS[domain]) && DOMAIN_SYSTEMS[domain].includes(system);
}

function isPlatformAllowedForDomain(domain, platform) {
  if (platform == null) return true;
  if (domain === KNOWLEDGE_DOMAINS.SHARED) return true;
  return Array.isArray(DOMAIN_PLATFORMS[domain]) && DOMAIN_PLATFORMS[domain].includes(platform);
}

function isIndustryAllowedForDomain(domain, industry) {
  if (domain === KNOWLEDGE_DOMAINS.SHARED) return industry == null;
  if (domain === KNOWLEDGE_DOMAINS.HEAVY_DUTY) return INDUSTRIES.HEAVY_DUTY.includes(industry);
  if (domain === KNOWLEDGE_DOMAINS.LIGHT_DUTY) return INDUSTRIES.LIGHT_DUTY.includes(industry);
  if (domain === KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS) return INDUSTRIES.INDUSTRIAL_PROCESS.includes(industry);
  return false;
}

function isTechnologyAllowedForPlatform(platform, technology) {
  if (platform == null || technology == null) return true;
  return Array.isArray(PLATFORM_TECHNOLOGIES[platform])
    && PLATFORM_TECHNOLOGIES[platform].includes(technology);
}

module.exports = {
  KNOWLEDGE_DOMAINS,
  INDUSTRIES,
  SYSTEMS,
  PLATFORMS,
  TECHNOLOGIES,
  DOMAIN_SYSTEMS,
  DOMAIN_PLATFORMS,
  PLATFORM_TECHNOLOGIES,
  SHARED_ENGINEERING_TOPICS,
  VALID_TECHNOLOGY_RELATIONS,
  VALID_APPLICATION_RELATIONS,
  isValidDomain,
  isSystemAllowedForDomain,
  isPlatformAllowedForDomain,
  isIndustryAllowedForDomain,
  isTechnologyAllowedForPlatform
};
