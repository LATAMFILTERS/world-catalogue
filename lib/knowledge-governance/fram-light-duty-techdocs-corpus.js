'use strict';

const { KNOWLEDGE_DOMAINS, SYSTEMS, TECHNOLOGIES } = require('./knowledge-domain-registry');

const BASE = 'https://www.fram.com/media/wysiwyg/resources/consumer_tech_docs/';

// Consumer/Automotive technical PDFs only. These sources are evidence for LD;
// none of their application values or service thresholds may be inherited by HD.
const SOURCES = Object.freeze([
  ['collapsedcentertubes.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Failure Analysis Guide',['Collapsed element','Differential pressure','Bypass malfunction','Pressure regulation','Contaminant loading'],'candidate'],
  ['lossofoilpumpprime.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Failure Analysis Guide',['Oil pump prime','Post-service low pressure','Cavitation','Diagnostic isolation'],'candidate'],
  ['oilpressurewarninglight.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Failure Analysis Guide',['Oil pressure warning','Anti-drainback','Pressure switch','Pump and strainer diagnosis'],'candidate'],
  ['threevital.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Engineering Reference',['Pressure regulating valve','Filter bypass valve','Anti-drainback valve'],'candidate'],
  ['engineoilfiltering.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Engineering Reference',['Full-flow filtration','Bypass/part-flow filtration','Lubrication architecture'],'candidate'],
  ['fluidfilterrating.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Engineering Reference',['Filter rating','Micron terminology','Efficiency comparison','Test methodology'],'candidate-validation-required'],
  ['standardvsmetric.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Thread compatibility','Metric versus standard thread','Fitment verification','Oil-loss risk'],'candidate'],
  ['framconversiontable.pdf',[],[],'Engineering Reference',['Unit conversion'],'support-only'],
  ['cvboot.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Installation clearance','External interference','Application-specific fitment'],'support-only'],
  ['recall_notice_02052013_for_distribution.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Safety Evidence',['Seal interface','Manufacturing process control','Oil-loss failure chain','Recall scope'],'private-safety-evidence-only'],
  ['framdisclaimer_0.pdf',[],[],'Governance Evidence',['Market scope','Application limitations','Fitment confirmation','Do-not-force installation'],'private-governance-evidence-only'],
  ['chryslerdodgejeep-ph10575-oil-filter-application-change.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Scoped supersession','Vehicle year and engine scope'],'private-application-evidence'],
  ['gm-fram-ph12060-application-change.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Scoped supersession','Vehicle year and engine scope'],'private-application-evidence'],
  ['gm-14l-18l-cartridge-oil-filter-tsb-rev-1.pdf',[SYSTEMS.LUBE],[TECHNOLOGIES.SYNTRAX],'Application Note',['Housing identification','Non-interchangeable cartridge','Configuration verification'],'private-application-evidence']
]);

function buildHermesLightDutyTechDocSources() {
  const seen = new Set();
  return SOURCES.filter((entry) => {
    const url = BASE + entry[0];
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  }).map((entry, index) => ({
    id: `fram_ld_pdf_${String(index + 1).padStart(2, '0')}`,
    name: 'FRAM Consumer Technical Documents',
    organization_id: 'fram_group',
    category: 'technical_publication',
    url: BASE + entry[0],
    source_type: 'pdf',
    enabled: true,
    official: true,
    trust_level: 'medium',
    region: 'North America',
    knowledge_domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industry: 'Automotive',
    knowledge_systems: entry[1],
    technology_candidates: entry[2],
    knowledge_content_type: entry[3],
    knowledge_topics: entry[4],
    disposition: entry[5],
    public_brand_reference: false,
    catalog_auto_update: false,
    technology_relation: entry[2].length ? 'probable' : 'none',
    application_relation: 'candidate',
    cross_domain_inheritance_allowed: false
  }));
}

module.exports = { SOURCES, buildHermesLightDutyTechDocSources };
