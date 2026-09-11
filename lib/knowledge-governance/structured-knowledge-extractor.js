'use strict';

const crypto = require('crypto');
const {
  KNOWLEDGE_DOMAINS,
  SHARED_ENGINEERING_TOPICS
} = require('./knowledge-domain-registry');
const {
  createKnowledgeObject,
  validateKnowledgeObject
} = require('./knowledge-object-contract');

const TECHNICAL_KEYWORDS = Object.freeze([
  'filter', 'filtration', 'oil', 'airflow', 'flow', 'pressure', 'micron', 'efficiency',
  'capacity', 'contamin', 'particle', 'dust', 'soot', 'sludge', 'bypass', 'valve',
  'gasket', 'seal', 'media', 'restriction', 'clog', 'temperature', 'viscosity',
  'service interval', 'lifespan', 'HVAC', 'activated carbon', 'odor', 'moisture'
]);

const SHARED_CONCEPT_PATTERNS = Object.freeze({
  'Filtration Efficiency': ['filtration efficiency', 'filter efficiency', 'efficiency'],
  'Micron Rating': ['micron rating', 'microns', 'micron'],
  'Dirt Holding Capacity': ['dirt holding capacity', 'holding capacity', 'contaminant capacity'],
  'Flow Rate': ['flow rate', 'oil flow', 'air flow', 'airflow', 'flow'],
  'Differential Pressure': ['differential pressure', 'pressure differential'],
  'Restriction': ['restriction', 'restricted', 'restrictive', 'clogged'],
  'Bypass': ['bypass valve', 'bypass'],
  'Contaminant Loading': ['contaminant loading', 'contamination', 'contaminants', 'dirt loading', 'dust loading'],
  'Media Saturation': ['media saturation', 'saturated', 'saturation', 'filter loading'],
  'Sealing': ['gasket', 'seal', 'sealing'],
  'Service Life': ['service life', 'lifespan', 'service interval', 'replacement interval'],
  'Installation': ['installation', 'install', 'installed', 'replace the filter'],
  'Failure Analysis': ['failure', 'symptom', 'damage', 'malfunction'],
  'Standards': ['standard', 'specification', 'recommended specification']
});

const COMPONENT_PATTERNS = Object.freeze({
  'Engine Oil Filter': ['oil filter'],
  'Filter Media': ['filter media', 'media'],
  'Bypass Valve': ['bypass valve'],
  'Anti-Drainback Valve': ['anti-drainback valve', 'anti drainback valve'],
  'Center Tube': ['center tube'],
  'Gasket / Seal': ['gasket', 'sealing gasket'],
  'Filter Housing / Can': ['filter housing', 'filter can', 'canister'],
  'Base Plate': ['base plate'],
  'Engine Air Filter': ['engine air filter'],
  'Air Filter Housing': ['air filter housing', 'airbox', 'air box'],
  'Cabin Air Filter': ['cabin air filter'],
  'Activated Carbon Media': ['activated carbon', 'carbon media'],
  'HVAC System': ['HVAC', 'heating and air conditioning', 'ventilation system']
});

const OPERATING_CONDITIONS = Object.freeze({
  'Cold Weather / Low Temperature': ['cold weather', 'cold temperatures', 'low temperatures', 'winter'],
  'High Temperature / Summer Heat': ['summer heat', 'high temperatures', 'heat wave', 'hot weather'],
  'Short Trips': ['short trips', 'short-trip'],
  'Stop-and-Go Driving': ['stop-and-go', 'stop and go'],
  'Dusty Environment': ['dusty', 'dust-heavy', 'high dust'],
  'Heavy Load / Towing': ['heavy load', 'towing'],
  'High RPM': ['high rpm', 'high engine speed'],
  'Extended Service Interval': ['extended drain', 'extended interval', 'longer service interval']
});

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function decodeEntities(value = '') {
  const basic = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&ndash;': '–', '&mdash;': '—', '&micro;': 'µ'
  };
  let text = String(value).replace(/&(nbsp|amp|lt|gt|quot|apos|ndash|mdash|micro);/gi, (m) => basic[m.toLowerCase()] || m);
  text = text.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  return text;
}

function extractArticleFragment(html = '') {
  const source = String(html);
  const marker = '<div class="post-text-hld">';
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const end = source.indexOf('post-bottom', start);
  return source.slice(start + marker.length, end > start ? end : source.length);
}

function htmlToTechnicalText(fragment = '') {
  let text = String(fragment)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/div|\/section)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<[^>]+>/g, ' ');
  text = decodeEntities(text)
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}

function extractArticleText(html = '') {
  return htmlToTechnicalText(extractArticleFragment(html));
}

function extractPostedDate(html = '') {
  const match = /<span class="label">Posted:<\/span>\s*<span class="value">([^<]+)<\/span>/i.exec(String(html));
  if (!match) return null;
  const d = new Date(decodeEntities(match[1]).trim());
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function cleanTitle(title = '') {
  return decodeEntities(String(title)).replace(/\s*\|\s*FRAM\s*$/i, '').trim();
}

function splitSentences(text = '') {
  return String(text)
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 35 && s.length <= 650);
}

function containsAny(text, keywords) {
  const lower = String(text).toLowerCase();
  return keywords.some((k) => lower.includes(String(k).toLowerCase()));
}

function dedupeStrings(values, max = 50) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const normalized = String(value).replace(/\s+/g, ' ').trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
    if (out.length >= max) break;
  }
  return out;
}

function isMarketingSentence(sentence) {
  return /\bFRAM\b|shop now|our filter|our filters|product line|warranty|buy now|premium protection/i.test(sentence);
}

function technicalClaims(sentences) {
  return dedupeStrings(sentences.filter((s) => containsAny(s, TECHNICAL_KEYWORDS) && !isMarketingSentence(s)), 28)
    .map((statement) => ({ statement, claim_scope: 'SOURCE_REPORTED', validation_status: 'awaiting_validation' }));
}

function sentencesByKeywords(sentences, keywords, max = 12) {
  return dedupeStrings(sentences.filter((s) => containsAny(s, keywords) && !isMarketingSentence(s)), max);
}

function inferMetricName(sentence, unit) {
  const s = sentence.toLowerCase();
  if (s.includes('efficien')) return 'Filtration Efficiency';
  if (s.includes('micron')) return 'Micron Rating / Particle Size';
  if (s.includes('bypass') || (unit.toLowerCase() === 'psi' && s.includes('pressure'))) return 'Bypass / Differential Pressure';
  if (s.includes('service') || s.includes('change') || s.includes('replace') || s.includes('lifespan')) return 'Service Interval';
  if (s.includes('temperature') || unit.includes('°')) return 'Temperature';
  if (s.includes('flow')) return 'Flow';
  return 'Source-Reported Technical Value';
}

function extractMetrics(sentences) {
  const metrics = [];
  const re = /\b(\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?)\s*(%|microns?|µm|psi|miles?|months?|years?|hours?|°F|°C|degrees?)\b/gi;
  for (const sentence of sentences) {
    if (isMarketingSentence(sentence)) continue;
    let match;
    while ((match = re.exec(sentence))) {
      metrics.push({
        name: inferMetricName(sentence, match[2]),
        value: match[1],
        unit: match[2],
        statement: sentence,
        validation_status: 'awaiting_validation'
      });
      if (metrics.length >= 24) return metrics;
    }
  }
  return metrics;
}

function extractTechnicalRelationships(sentences) {
  const markers = /\b(can cause|may cause|causes|cause|leads? to|results? in|due to|because|when|if|increases?|decreases?|reduces?|affects?|contributes? to)\b/i;
  return dedupeStrings(sentences.filter((s) => markers.test(s) && containsAny(s, TECHNICAL_KEYWORDS) && !isMarketingSentence(s)), 18)
    .map((statement) => ({
      statement,
      relation_type: /due to|because|cause|lead|result|contribute/i.test(statement) ? 'cause_effect' : 'condition_effect',
      validation_status: 'awaiting_validation'
    }));
}

function extractComponents(text = '') {
  const lower = String(text).toLowerCase();
  return Object.entries(COMPONENT_PATTERNS)
    .filter(([, patterns]) => patterns.some((p) => lower.includes(p.toLowerCase())))
    .map(([name]) => name);
}

function extractOperatingConditions(text = '') {
  const lower = String(text).toLowerCase();
  return Object.entries(OPERATING_CONDITIONS)
    .filter(([, patterns]) => patterns.some((p) => lower.includes(p.toLowerCase())))
    .map(([name]) => name);
}

function extractSharedConcepts(text = '') {
  const lower = String(text).toLowerCase();
  return Object.entries(SHARED_CONCEPT_PATTERNS)
    .filter(([name, patterns]) => SHARED_ENGINEERING_TOPICS.includes(name) && patterns.some((p) => lower.includes(p.toLowerCase())))
    .map(([name]) => name);
}

function buildProcedures(sentences) {
  const procedureKeywords = ['replace', 'remove', 'install', 'check', 'inspect', 'locate', 'tighten', 'clean', 'change', 'verify', 'make sure', 'follow'];
  return sentencesByKeywords(sentences, procedureKeywords, 14).map((instruction, index) => ({
    step: index + 1,
    instruction,
    validation_status: 'awaiting_validation'
  }));
}

function deterministicKnowledgeId(source) {
  return `KO-${source.id.toUpperCase()}-${sha256(source.url).slice(0, 10).toUpperCase()}`;
}

function buildStructuredKnowledgeObject({ source, html, title }) {
  const articleText = extractArticleText(html);
  const sentences = splitSentences(articleText);
  const hasSystem = Array.isArray(source.knowledge_systems) && source.knowledge_systems.length > 0;
  const domain = hasSystem ? source.knowledge_domain : KNOWLEDGE_DOMAINS.SHARED;
  const technologies = hasSystem ? (source.technology_candidates || []) : [];
  const technologyRelation = technologies.length ? source.technology_relation : 'none';
  const sourceHash = sha256(articleText);

  const object = createKnowledgeObject({
    knowledge_object_id: deterministicKnowledgeId(source),
    knowledge_content_type: source.knowledge_content_type,
    title: cleanTitle(title || source.name),
    domain,
    origin_domains: [source.knowledge_domain],
    industries: domain === KNOWLEDGE_DOMAINS.SHARED ? [] : [source.industry],
    systems: domain === KNOWLEDGE_DOMAINS.SHARED ? [] : source.knowledge_systems,
    technologies,
    technology_relation: technologyRelation,
    components: extractComponents(articleText),
    applications: [],
    application_relation: 'candidate',
    problems: sentencesByKeywords(sentences, ['problem', 'clogged', 'dirty', 'contaminated', 'leak', 'low oil pressure', 'restriction', 'odor', 'poor airflow', 'damage'], 12),
    failure_modes: sentencesByKeywords(sentences, ['failure', 'stuck open', 'stuck closed', 'collapsed', 'saturated', 'clogged', 'leak', 'bypass'], 12),
    symptoms: sentencesByKeywords(sentences, ['symptom', 'warning light', 'reduced', 'poor', 'noise', 'smell', 'odor', 'low pressure', 'airflow', 'fuel economy'], 12),
    root_causes: sentencesByKeywords(sentences, ['cause', 'because', 'due to', 'contamination', 'sludge', 'soot', 'wear', 'moisture', 'dust', 'temperature'], 14),
    diagnostic_methods: sentencesByKeywords(sentences, ['check', 'inspect', 'look for', 'diagnos', 'monitor', 'pressure', 'signs'], 12),
    corrective_actions: sentencesByKeywords(sentences, ['replace', 'change', 'clean', 'repair', 'tighten', 'correct filter', 'reinstall'], 12),
    maintenance_procedures: sentencesByKeywords(sentences, ['maintenance', 'service interval', 'replace', 'change', 'inspect', 'installation'], 12),
    procedures: buildProcedures(sentences),
    metrics: extractMetrics(sentences),
    technical_relationships: extractTechnicalRelationships(sentences),
    source_claims: technicalClaims(sentences),
    operating_conditions: extractOperatingConditions(articleText),
    shared_engineering_concepts: extractSharedConcepts(articleText),
    source_evidence: [{
      source_id: source.id,
      source_url: source.url,
      source_publisher: source.name,
      source_hash: sourceHash,
      published_at: extractPostedDate(html),
      evidence_role: 'internal_evidence_only',
      public_brand_reference: false
    }],
    validation_sources: [],
    confidence: 'medium',
    publication_status: 'awaiting_validation',
    public_use_allowed: false
  });

  return {
    object,
    validation: validateKnowledgeObject(object),
    article_text_hash: sourceHash,
    article_text_length: articleText.length,
    sentence_count: sentences.length
  };
}

function aggregateSharedEngineering(objects = []) {
  const evidenceByConcept = new Map();
  for (const object of objects) {
    for (const concept of object.shared_engineering_concepts || []) {
      if (!evidenceByConcept.has(concept)) evidenceByConcept.set(concept, []);
      evidenceByConcept.get(concept).push(object);
    }
  }

  const shared = [];
  for (const [concept, records] of evidenceByConcept.entries()) {
    if (records.length < 2) continue;
    const sourceEvidence = records.flatMap((r) => r.source_evidence || []);
    const relationshipStatements = records.flatMap((r) => r.technical_relationships || []).slice(0, 24);
    const claims = records.flatMap((r) => r.source_claims || []).slice(0, 30);
    const metrics = records.flatMap((r) => r.metrics || []).filter((m) => String(m.statement || '').toLowerCase().includes(concept.toLowerCase().split(' ')[0])).slice(0, 16);

    const object = createKnowledgeObject({
      knowledge_object_id: `KO-SHARED-${sha256(concept).slice(0, 12).toUpperCase()}`,
      knowledge_content_type: 'Shared Engineering Concept',
      title: concept,
      domain: KNOWLEDGE_DOMAINS.SHARED,
      origin_domains: [...new Set(records.flatMap((r) => r.origin_domains || []))],
      industries: [],
      systems: [],
      technologies: [],
      technology_relation: 'none',
      applications: [],
      application_relation: 'candidate',
      metrics,
      technical_relationships: relationshipStatements,
      source_claims: claims,
      shared_engineering_concepts: [concept],
      source_evidence: sourceEvidence,
      validation_sources: [],
      confidence: records.length >= 4 ? 'medium' : 'low',
      publication_status: 'awaiting_validation',
      public_use_allowed: false
    });
    shared.push({ object, validation: validateKnowledgeObject(object), supporting_objects: records.map((r) => r.knowledge_object_id) });
  }
  return shared;
}

module.exports = {
  SHARED_CONCEPT_PATTERNS,
  COMPONENT_PATTERNS,
  extractArticleFragment,
  htmlToTechnicalText,
  extractArticleText,
  extractPostedDate,
  splitSentences,
  extractMetrics,
  extractTechnicalRelationships,
  extractComponents,
  extractOperatingConditions,
  extractSharedConcepts,
  buildStructuredKnowledgeObject,
  aggregateSharedEngineering
};
