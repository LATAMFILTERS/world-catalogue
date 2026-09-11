'use strict';

const KNOWLEDGE_DOMAINS = Object.freeze({
  HEAVY_DUTY: 'HEAVY_DUTY_KNOWLEDGE_DOMAIN',
  LIGHT_DUTY: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
  SHARED: 'SHARED_ENGINEERING_KNOWLEDGE'
});

const INDUSTRIES = Object.freeze({
  HEAVY_DUTY: Object.freeze([
    'Agriculture', 'Bus & Coach', 'Construction', 'Manufacturing', 'Marine',
    'Mining', 'Oil & Gas', 'Power Generation', 'Railway', 'Truck Fleets', 'Waste Municipal'
  ]),
  LIGHT_DUTY: Object.freeze(['Automotive'])
});

const SYSTEMS = Object.freeze({
  AIR_INTAKE: 'Air Intake & Airflow Protection Systems',
  FUEL: 'Fuel Cleanliness Protection Systems',
  LUBE: 'Lube/Oil Protection Systems',
  HYDRAULIC: 'Hydraulic Systems Protection',
  COMPRESSED_AIR: 'Compressed Air Systems',
  CABIN_AIR: 'Cabin Air Protection'
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
  MARINECLEAN: 'MARINECLEAN™'
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
    SYSTEMS.CABIN_AIR,
    SYSTEMS.FUEL
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

function isIndustryAllowedForDomain(domain, industry) {
  if (domain === KNOWLEDGE_DOMAINS.SHARED) return industry == null;
  if (domain === KNOWLEDGE_DOMAINS.HEAVY_DUTY) return INDUSTRIES.HEAVY_DUTY.includes(industry);
  if (domain === KNOWLEDGE_DOMAINS.LIGHT_DUTY) return INDUSTRIES.LIGHT_DUTY.includes(industry);
  return false;
}

module.exports = {
  KNOWLEDGE_DOMAINS,
  INDUSTRIES,
  SYSTEMS,
  TECHNOLOGIES,
  DOMAIN_SYSTEMS,
  SHARED_ENGINEERING_TOPICS,
  VALID_TECHNOLOGY_RELATIONS,
  VALID_APPLICATION_RELATIONS,
  isValidDomain,
  isSystemAllowedForDomain,
  isIndustryAllowedForDomain
};
