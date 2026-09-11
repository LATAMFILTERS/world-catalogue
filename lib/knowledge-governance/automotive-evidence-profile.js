'use strict';

const crypto = require('crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function decodeEntities(value = '') {
  const map = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&apos;': "'", '&ndash;': '–', '&mdash;': '—', '&micro;': 'µ'
  };
  let text = String(value).replace(/&(nbsp|amp|lt|gt|quot|apos|ndash|mdash|micro);/gi, (m) => map[m.toLowerCase()] || m);
  text = text.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  return text;
}

function extractArticleText(html = '') {
  const source = String(html);
  const marker = '<div class="post-text-hld">';
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const end = source.indexOf('post-bottom', start);
  let text = source.slice(start + marker.length, end > start ? end : source.length)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/div|\/section)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(text).replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function splitSentences(text = '') {
  return String(text).replace(/\n+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => s.length >= 25 && s.length <= 700);
}

function postedAt(html = '') {
  const match = /<span class="label">Posted:<\/span>\s*<span class="value">([^<]+)<\/span>/i.exec(String(html));
  if (!match) return null;
  const date = new Date(decodeEntities(match[1]).trim());
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function titleFromHtml(html = '', fallback = '') {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(String(html));
  return decodeEntities(match?.[1] || fallback).replace(/\s*\|\s*FRAM\s*$/i, '').trim();
}

function inferMetricName(sentence, unit) {
  const s = sentence.toLowerCase();
  if (s.includes('efficien')) return 'Filtration Efficiency';
  if (s.includes('micron')) return 'Particle Size / Micron Rating';
  if (s.includes('bypass') || (String(unit).toLowerCase() === 'psi' && s.includes('pressure'))) return 'Pressure / Bypass Setting';
  if (s.includes('service') || s.includes('change') || s.includes('replace') || s.includes('lifespan')) return 'Service Interval';
  if (s.includes('temperature') || String(unit).includes('°')) return 'Temperature';
  if (s.includes('flow')) return 'Flow';
  return 'Source-Reported Technical Value';
}

function extractMetricSignals(sentences, sourceId) {
  const out = [];
  const seen = new Set();
  const re = /\b(\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?)\s*(%|microns?|µm|psi|miles?|months?|years?|hours?|°F|°C|degrees?)\b/gi;
  for (const sentence of sentences) {
    if (/\bFRAM\b|warranty|shop now|buy now/i.test(sentence)) continue;
    let match;
    while ((match = re.exec(sentence))) {
      const key = `${match[1]}|${match[2]}|${sha256(sentence)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        name: inferMetricName(sentence, match[2]),
        value: match[1],
        unit: match[2],
        source_id: sourceId,
        evidence_hash: sha256(sentence),
        validation_status: 'awaiting_validation'
      });
      if (out.length >= 20) return out;
    }
  }
  return out;
}

function keywordSignals(text = '') {
  const lower = String(text).toLowerCase();
  const patterns = {
    components: {
      'Engine Oil Filter': ['oil filter'], 'Filter Media': ['filter media'], 'Bypass Valve': ['bypass valve'],
      'Anti-Drainback Valve': ['anti-drainback valve','anti drainback valve'], 'Center Tube': ['center tube'],
      'Gasket / Seal': ['gasket','sealing gasket'], 'Engine Air Filter': ['engine air filter'],
      'Air Filter Housing': ['air filter housing','air box','airbox'], 'Cabin Air Filter': ['cabin air filter'],
      'Activated Carbon Media': ['activated carbon','carbon media'], 'HVAC System': ['hvac','ventilation system']
    },
    operating_conditions: {
      'Cold Weather / Low Temperature': ['cold weather','cold temperature','winter'],
      'High Temperature / Summer Heat': ['summer heat','high temperature','hot weather','heat wave'],
      'Short Trips': ['short trips','short-trip'], 'Stop-and-Go Driving': ['stop-and-go','stop and go'],
      'Dusty Environment': ['dusty','high dust'], 'Heavy Load / Towing': ['heavy load','towing'],
      'High RPM': ['high rpm'], 'Extended Service Interval': ['extended drain','extended interval','longer service interval']
    },
    concepts: {
      'Filtration Efficiency': ['filtration efficiency','filter efficiency'], 'Micron Rating': ['micron rating','micron'],
      'Dirt Holding Capacity': ['dirt holding capacity','holding capacity'], 'Flow Rate': ['flow rate','oil flow','airflow'],
      'Differential Pressure': ['differential pressure','pressure differential'], 'Restriction': ['restriction','restricted','clogged'],
      'Bypass': ['bypass valve','bypass'], 'Contaminant Loading': ['contaminant loading','contamination','contaminants','dust loading'],
      'Media Saturation': ['media saturation','saturated','saturation'], 'Sealing': ['gasket','seal','sealing'],
      'Service Life': ['service life','lifespan','service interval'], 'Installation': ['installation','install'],
      'Failure Analysis': ['failure','symptom','damage'], 'Standards': ['standard','specification']
    }
  };
  const resolve = (group) => Object.entries(group).filter(([, terms]) => terms.some((term) => lower.includes(term))).map(([label]) => label);
  return {
    components: resolve(patterns.components),
    operating_conditions: resolve(patterns.operating_conditions),
    shared_engineering_concepts: resolve(patterns.concepts)
  };
}

function buildEvidenceProfile({ source, html }) {
  const text = extractArticleText(html);
  if (!text) throw new Error(`No article body extracted for ${source.id}`);
  const sentences = splitSentences(text);
  const signals = keywordSignals(text);
  return {
    schema_version: '1.0.0',
    source_id: source.id,
    source_url: source.url,
    source_publisher: source.name,
    knowledge_domain: source.knowledge_domain,
    industry: source.industry,
    knowledge_systems: source.knowledge_systems || [],
    knowledge_content_type: source.knowledge_content_type,
    technology_candidates: source.technology_candidates || [],
    technology_relation: source.technology_relation,
    application_relation: source.application_relation,
    title: titleFromHtml(html, source.name),
    published_at: postedAt(html),
    source_hash: sha256(text),
    article_text_length: text.length,
    sentence_count: sentences.length,
    metrics: extractMetricSignals(sentences, source.id),
    ...signals,
    evidence_text_retained: false,
    public_brand_reference: false,
    catalog_auto_update: false,
    validation_status: 'awaiting_validation'
  };
}

module.exports = {
  extractArticleText,
  splitSentences,
  buildEvidenceProfile
};
