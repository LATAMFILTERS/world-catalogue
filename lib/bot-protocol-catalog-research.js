const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_COMPOUND_MODEL || 'groq/compound';
const REQUEST_TIMEOUT_MS = Math.max(5000, Number(process.env.GROQ_RESEARCH_TIMEOUT_MS || 30000));

function normalizeCode(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function conversationText(message, context = {}) {
  const history = Array.isArray(context.history) ? context.history.join('\n') : '';
  return `${history}\n${String(message || '')}`.trim();
}

function extractYear(text) {
  const years = String(text || '').match(/\b(?:19|20)\d{2}\b/g) || [];
  return years.length ? Number(years[years.length - 1]) : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function deriveApplicationIdentity(message, context = {}, diagnostic = {}) {
  const text = conversationText(message, context);
  const supplied = context.equipment && typeof context.equipment === 'object' ? context.equipment : {};
  const tokens = unique([
    ...(Array.isArray(diagnostic.equipment_tokens) ? diagnostic.equipment_tokens : []),
    ...(Array.isArray(context.equipment_tokens) ? context.equipment_tokens : [])
  ]);

  const knownManufacturers = [
    'MACK', 'VOLVO', 'FREIGHTLINER', 'KENWORTH', 'PETERBILT', 'INTERNATIONAL',
    'CATERPILLAR', 'JOHN DEERE', 'KOMATSU', 'HITACHI', 'CASE', 'NEW HOLLAND',
    'CUMMINS', 'DETROIT', 'SCANIA', 'MAN', 'MERCEDES-BENZ', 'ISUZU', 'HINO'
  ];
  const manufacturer = supplied.manufacturer || knownManufacturers.find(name =>
    new RegExp(`\\b${name.replace(/[ -]/g, '[ -]?')}\\b`, 'i').test(text)
  ) || tokens.find(token => knownManufacturers.includes(String(token).toUpperCase())) || null;

  const enginePatterns = [
    /\b(MP\d{1,2})\b/i,
    /\b(D13|D11|D16)\b/i,
    /\b(DD\d{1,2})\b/i,
    /\b(SERIES\s*60)\b/i,
    /\b(ISX\d*|X15|L9|B6\.7)\b/i,
    /\b(C\d{1,2}(?:\.\d)?)\b/i,
    /\b(POWERTECH\s*[A-Z0-9.-]*)\b/i
  ];
  let engine = supplied.engine || context.engine || null;
  if (!engine) {
    for (const pattern of enginePatterns) {
      const match = text.match(pattern);
      if (match) {
        engine = match[1].replace(/\s+/g, ' ').toUpperCase();
        break;
      }
    }
  }

  const year = Number(supplied.year || context.year || extractYear(text)) || null;
  const model = supplied.model || context.model || (() => {
    if (!manufacturer) return null;
    const escaped = manufacturer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\ /g, '\\s*');
    const match = text.match(new RegExp(`${escaped}\\s+([A-Z0-9][A-Z0-9 .-]{1,30})`, 'i'));
    if (!match) return null;
    return match[1]
      .split(/(?:\?|,|;|\n|\bcon\b|\bmotor\b|\baño\b|\bano\b)/i)[0]
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 40) || null;
  })();

  return {
    manufacturer: manufacturer ? String(manufacturer).toUpperCase() : null,
    model: model ? String(model).trim() : null,
    engine: engine ? String(engine).trim().toUpperCase() : null,
    year,
    raw_context: text.slice(-4000)
  };
}

function identityIsResearchable(identity = {}) {
  return Boolean(identity.manufacturer && identity.model && (identity.engine || identity.year));
}

function extractJsonObject(content) {
  const value = String(content || '').trim();
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_) {
    const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced?.[1] || value.slice(value.indexOf('{'), value.lastIndexOf('}') + 1);
    if (!candidate) return null;
    try {
      return JSON.parse(candidate);
    } catch (_) {
      return null;
    }
  }
}

function normalizeCandidate(candidate = {}) {
  const sources = Array.isArray(candidate.sources) ? candidate.sources : [];
  const oemCodes = unique((Array.isArray(candidate.oem_codes) ? candidate.oem_codes : [])
    .map(normalizeCode)
    .filter(code => code.length >= 4));

  return {
    filter_type: String(candidate.filter_type || '').trim() || null,
    position: String(candidate.position || '').trim() || null,
    oem_codes: oemCodes,
    manufacturer: String(candidate.manufacturer || '').trim() || null,
    model: String(candidate.model || '').trim() || null,
    engine: String(candidate.engine || '').trim() || null,
    year_from: Number(candidate.year_from) || null,
    year_to: Number(candidate.year_to) || null,
    confidence: String(candidate.confidence || '').toLowerCase(),
    sources: sources.map(source => ({
      title: String(source?.title || '').trim() || null,
      url: String(source?.url || '').trim() || null,
      source_type: String(source?.source_type || '').trim() || null
    })).filter(source => source.url)
  };
}

function candidateMatchesIdentity(candidate, identity) {
  if (!candidate.oem_codes.length || candidate.confidence !== 'high') return false;
  if (!candidate.sources.length) return false;

  const manufacturer = normalizeCode(candidate.manufacturer);
  const requestedManufacturer = normalizeCode(identity.manufacturer);
  if (manufacturer && requestedManufacturer && manufacturer !== requestedManufacturer) return false;

  if (identity.engine && candidate.engine) {
    const requestedEngine = normalizeCode(identity.engine);
    const candidateEngine = normalizeCode(candidate.engine);
    if (requestedEngine && candidateEngine && requestedEngine !== candidateEngine) return false;
  }

  if (identity.year) {
    if (candidate.year_from && identity.year < candidate.year_from) return false;
    if (candidate.year_to && identity.year > candidate.year_to) return false;
  }

  return true;
}

function buildResearchPrompt(identity) {
  return `You are the external technical research layer for ELIMFILTERS.\n\nResearch the OEM filtration references for this exact equipment application:\n- Manufacturer: ${identity.manufacturer}\n- Model: ${identity.model}\n- Engine: ${identity.engine || 'not provided'}\n- Year: ${identity.year || 'not provided'}\n\nRules:\n1. Search official manufacturer manuals, official OEM parts catalogs, official service documentation, or reputable technical catalogs.\n2. Do not use marketplace listings, forums, blogs, or unsourced snippets as final evidence.\n3. Keep year, engine and model variants separate. Do not merge incompatible configurations.\n4. Return only OEM filter codes that are explicitly associated with the requested application.\n5. Include all relevant filter positions when confirmed: engine oil, fuel primary, fuel secondary, fuel/water separator, air primary, air safety, coolant, hydraulic, transmission and cabin.\n6. If the application is ambiguous, return status "needs_more_data" and identify the missing discriminator such as VIN, serial number, engine family or production range.\n7. Never generate or infer an ELIMFILTERS SKU.\n\nReturn strict JSON only in this shape:\n{\n  "status": "confirmed|needs_more_data|not_found",\n  "missing_data": [],\n  "candidates": [\n    {\n      "filter_type": "",\n      "position": "",\n      "oem_codes": [""],\n      "manufacturer": "",\n      "model": "",\n      "engine": "",\n      "year_from": null,\n      "year_to": null,\n      "confidence": "high|medium|low",\n      "sources": [{"title":"","url":"","source_type":"official_manual|official_catalog|technical_catalog"}]\n    }\n  ]\n}`;
}

async function researchApplicationToOems({ message, context = {}, diagnostic = {}, fetchImpl = global.fetch } = {}) {
  const identity = deriveApplicationIdentity(message, context, diagnostic);
  const base = {
    used: false,
    provider: 'groq',
    model: DEFAULT_MODEL,
    identity,
    status: 'not_run',
    missing_data: [],
    candidates: [],
    oem_codes: [],
    sources: []
  };

  if (!identityIsResearchable(identity)) {
    return { ...base, status: 'needs_more_data', missing_data: ['manufacturer', 'model', 'engine_or_year'].filter(field => {
      if (field === 'manufacturer') return !identity.manufacturer;
      if (field === 'model') return !identity.model;
      return !(identity.engine || identity.year);
    }) };
  }

  if (!process.env.GROQ_API_KEY || typeof fetchImpl !== 'function') {
    return { ...base, status: 'unavailable' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'Groq-Model-Version': 'latest'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Return strict JSON only. Accuracy and source traceability are mandatory.' },
          { role: 'user', content: buildResearchPrompt(identity) }
        ],
        compound_custom: {
          tools: {
            enabled_tools: ['web_search', 'visit_website']
          }
        }
      })
    });

    if (!response.ok) {
      return { ...base, used: true, status: 'provider_error', provider_status: response.status };
    }

    const payload = await response.json();
    const parsed = extractJsonObject(payload?.choices?.[0]?.message?.content);
    if (!parsed) return { ...base, used: true, status: 'invalid_response' };

    const candidates = (Array.isArray(parsed.candidates) ? parsed.candidates : [])
      .map(normalizeCandidate)
      .filter(candidate => candidateMatchesIdentity(candidate, identity));
    const oemCodes = unique(candidates.flatMap(candidate => candidate.oem_codes));
    const sources = unique(candidates.flatMap(candidate => candidate.sources.map(source => source.url)));

    return {
      ...base,
      used: true,
      status: oemCodes.length ? 'confirmed' : String(parsed.status || 'not_found'),
      missing_data: Array.isArray(parsed.missing_data) ? parsed.missing_data.map(String) : [],
      candidates,
      oem_codes: oemCodes,
      sources
    };
  } catch (error) {
    return {
      ...base,
      used: true,
      status: error?.name === 'AbortError' ? 'timeout' : 'provider_error',
      error: String(error?.message || error).slice(0, 180)
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  normalizeCode,
  deriveApplicationIdentity,
  identityIsResearchable,
  researchApplicationToOems,
  candidateMatchesIdentity,
  extractJsonObject
};
