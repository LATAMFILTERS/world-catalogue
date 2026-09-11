'use strict';

const { KNOWLEDGE_DOMAINS, SYSTEMS, TECHNOLOGIES } = require('./knowledge-domain-registry');

const SOURCE = Object.freeze({
  publisher: 'FRAM',
  domain: 'fram.com',
  source_type: 'external_industry_evidence',
  knowledge_domain: KNOWLEDGE_DOMAINS.HEAVY_DUTY,
  public_brand_reference: false,
  catalog_auto_update: false,
  knowledge_candidate: true
});

const SOURCES = Object.freeze([
  ['ch9549-ford-60l-64l-powerstroke-diesel-filter-design-change-notification.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Housing configuration','Cartridge installation','Adapter compatibility','Sealing'],'candidate'],
  ['cs10145techbulletin-tb10-1-14-002_1.pdf',[SYSTEMS.FUEL],[TECHNOLOGIES.HYDROCORE],'Application Note',['Fuel filter sealing geometry','Housing center tube','Design change versus function'],'candidate'],
  ['cs7715a-cs8629a-information-bulletin.pdf',[SYSTEMS.FUEL],[TECHNOLOGIES.HYDROCORE],'Installation Procedure',['Fuel filter service','Gasket sealing surface','Installation torque','Element saturation'],'candidate'],
  ['cs9970techbulletin-tb10-1-14-001.pdf',[SYSTEMS.FUEL],[TECHNOLOGIES.HYDROCORE],'Application Note',['Fuel filter sealing geometry','Physical profile change','Fit form function'],'candidate'],
  ['cvhd-glossary.pdf',[],[],'Engineering Reference',['Heavy-duty terminology','Maintenance strategies','Fuel terminology','Emissions terminology'],'shared-review-required'],
  ['fram-announces-the-availability-of-radial-seal-replacement-for-the-mack-vision.pdf',[SYSTEMS.AIR_INTAKE],[TECHNOLOGIES.MACROCORE],'Application Note',['Radial seal air filter','Housing compatibility','Heavy-duty air intake'],'candidate'],
  ['fram-hd-j-hook-design-change-bulletin-030813.pdf',[SYSTEMS.LUBE,SYSTEMS.FUEL],[TECHNOLOGIES.SYNTRAX,TECHNOLOGIES.HYDROCORE],'Application Note',['Baseplate design change','Visual difference versus functional equivalence','Fit and function'],'candidate'],
  ['fuel-filter-thread-ring-reconfiguration.pdf',[SYSTEMS.FUEL],[TECHNOLOGIES.HYDROCORE],'Application Note',['Thread ring design','Bowl compatibility','Running design change'],'candidate'],
  ['in-response-to-regulatory-inquiries-regarding-terne-plated-oil-filters.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Regulatory Reference',['Used oil filter handling','Environmental disposal','Regulatory scope'],'support-only-current-law-verification-required'],
  ['lube-and-fuel-filter-design-improvements.pdf',[SYSTEMS.LUBE,SYSTEMS.FUEL],[TECHNOLOGIES.SYNTRAX,TECHNOLOGIES.HYDROCORE],'Engineering Reference',['Fit form function','Profile changes','Thread construction','Drain design','Design equivalence'],'candidate'],
  ['new-fram-fluid-testing.pdf',[SYSTEMS.LUBE,SYSTEMS.FUEL],[TECHNOLOGIES.SYNTRAX,TECHNOLOGIES.HYDROCORE],'Engineering Reference',['Fluid filter testing','Performance validation'],'candidate-validation-required'],
  ['product-change-notification-pr3910.pdf',[SYSTEMS.FUEL],[TECHNOLOGIES.HYDROCORE],'Application Note',['Product change','Fit form function'],'support-only'],
  ['product-improvement-p8264.pdf',[SYSTEMS.FUEL],[TECHNOLOGIES.HYDROCORE],'Application Note',['Product improvement','Application continuity'],'support-only'],
  ['product-improvement-ph3976.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Product improvement','Application continuity'],'support-only'],
  ['product-supersession-ph20.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Supersession','Capacity','Burst strength','Application continuity'],'support-only'],
  ['vehicle-weight-classes.pdf',[],[],'Engineering Reference',['Commercial vehicle weight classes'],'shared-review-required']
]);

const BASE = 'https://www.fram.com/media/wysiwyg/resources/commercial_tech_docs/';

function buildHermesHeavyDutySources() {
  return SOURCES.map((entry, index) => ({
    id: `fram_hd_${String(index + 1).padStart(2, '0')}`,
    name: 'FRAM Commercial Vehicle / Heavy Duty',
    organization_id: 'fram_group',
    category: 'technical_publication',
    url: BASE + entry[0],
    source_type: 'pdf',
    enabled: true,
    official: true,
    trust_level: 'medium',
    region: 'North America',
    knowledge_domain: SOURCE.knowledge_domain,
    industry: 'Truck Fleets',
    industry_scope: ['Truck Fleets','Bus & Coach','Construction','Agriculture','Mining','Power Generation','Waste Municipal'],
    knowledge_systems: entry[1],
    technology_candidates: entry[2],
    knowledge_content_type: entry[3],
    knowledge_topics: entry[4],
    disposition: entry[5],
    public_brand_reference: false,
    catalog_auto_update: false,
    technology_relation: entry[2].length ? 'probable' : 'none',
    application_relation: 'candidate'
  }));
}

module.exports = { SOURCE, SOURCES, buildHermesHeavyDutySources };
