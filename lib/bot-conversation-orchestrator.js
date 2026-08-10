'use strict';

const crypto = require('crypto');
const { groqChatJson } = require('./bot-protocol-groq');
const { searchByReferences, searchByApplication, extractReferences } = require('./bot-protocol-catalog');
const {
  memoryKey,
  createEmptyState,
  isStandaloneGreeting,
  isNewDiagnosticStart,
  resetDiagnosticState,
  loadMemory,
  saveMemory
} = require('./bot-protocol-memory');
const { applyProtocolGuardrails } = require('./bot-protocol-guardrails');
const { formatForChannel } = require('./bot-protocol-channel-format');
const { extractValidEmail, buildSupportLeadTicket, dispatchTicket } = require('./bot-protocol-support-lead');
const { sanitizeTechnicalEvidence } = require('./knowledge-governance/technical-evidence-contract');
const { buildSkuAuthorityFromCatalogResult } = require('./knowledge-governance/sku-authority-contract');
const { buildDeduplicationKey } = require('./knowledge-governance/knowledge-gap-contract');
const { APPROVED_GENERAL_PRACTICES } = require('./knowledge-governance/oem-maintenance-contract');
const {
  buildResponseGovernance,
  redactUnauthorizedClaims,
  determineSafeToPublish
} = require('./knowledge-governance/response-governance-contract');
const { queryApprovedTechnicalKnowledge } = require('./knowledge-governance/obsidian-knowledge-client');
const { createHermesResearchRequest } = require('./knowledge-governance/hermes-client');
const {
  upsertKnowledgeGap,
  attachHermesResearchId
} = require('./knowledge-governance/knowledge-gap-store');
const { recommendCategories } = require('./bot-product-category-recommender');

const PROTOCOL_VERSION = '3.0.0';

const INTENTS = [
  'greeting', 'diagnostic', 'application_lookup', 'exact_reference_lookup',
  'cross_reference_lookup', 'specification_lookup', 'distribution_inquiry',
  'commercial_inquiry', 'support_request', 'general'
];

const SYSTEM_KEYWORDS = [
  ['fuel', /combustible|diesel|di[eé]sel|gasoil/i],
  ['oil', /aceite|lubricante/i],
  ['coolant', /refrigerante|radiador|enfriamiento|anticongelante/i],
  ['hydraulic', /hidr[aá]ulico/i],
  ['air', /\baire\b|admisi[oó]n/i]
];

const KNOWN_BRANDS = /\b(?:JOHN\s*DEERE|MACK|VOLVO|FREIGHTLINER|KENWORTH|PETERBILT|INTERNATIONAL|CATERPILLAR|KOMATSU|HITACHI|CASE|NEW\s+HOLLAND|CUMMINS|DETROIT|SCANIA|MAN|MERCEDES-BENZ|ISUZU|HINO)\b/i;
const KNOWN_ENGINES = /\b(?:MP\d{1,2}|D1[136]|DD\d{1,2}|SERIES\s*60|ISX\d*|X15|L9|B6\.7|C\d{1,2}(?:\.\d)?)\b/i;
const KNOWN_FILTER_BRANDS = /\b(?:DONALDSON|FLEETGUARD|MANN|WIX|BALDWIN|FRAM|BOSCH|MAHLE|CATERPILLAR)\b/i;

// ── Pure entity/text helpers ────────────────────────────────────────────────

function conversationText(message, state) {
  const history = Array.isArray(state.conversationHistory) ? state.conversationHistory.slice(-12) : [];
  return [...history, String(message || '')].filter(Boolean).join('\n');
}

function extractYear(text) {
  const match = String(text || '').match(/\b(19[8-9]\d|20[0-3]\d)\b/);
  return match ? Number(match[1]) : null;
}

function extractBrand(text) {
  const match = String(text || '').match(KNOWN_BRANDS);
  return match ? match[0].toUpperCase().replace(/\s+/g, ' ') : null;
}

function extractEngine(text) {
  const match = String(text || '').match(KNOWN_ENGINES);
  return match ? match[0].toUpperCase().replace(/\s+/g, ' ') : null;
}

function extractModel(text, brand) {
  if (!brand) return null;
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\ /g, '\\s*');
  const match = String(text || '').match(new RegExp(`${escaped}\\s+([A-Z0-9][A-Z0-9 .-]{1,20})`, 'i'));
  if (!match) return null;
  const candidate = match[1].split(/(?:con\b|motor\b|a[ñn]o\b|,|\.|\?)/i)[0].trim().slice(0, 30) || null;
  // A bare model-year (e.g. "Freightliner 2007") is not a model — it's
  // already captured separately by extractYear().
  return candidate && /^(?:19[8-9]\d|20[0-3]\d)$/.test(candidate) ? null : candidate;
}

function detectSystemFromText(text) {
  for (const [system, pattern] of SYSTEM_KEYWORDS) if (pattern.test(text)) return system;
  return null;
}

// Detects symptoms with system-aware codes. Critically, generic "agua en el
// sistema" (no system named) is NOT treated as complete information — it is
// recorded with system:'unknown' so the orchestrator is forced to ask which
// system before the diagnostic can proceed.
function detectSymptoms(text) {
  const value = String(text || '');
  const symptoms = [];

  const waterMatch = value.match(/\bagua\s+(?:en|dentro\s+de)\s+(?:el\s+)?(?:sistema|circuito|l[ií]nea|filtro|tanque|dep[oó]sito|combustible|diesel|di[eé]sel|gasoil|aceite|lubricante|refrigerante|radiador|hidr[aá]ulico|aire)\b/i);
  if (waterMatch) {
    const system = detectSystemFromText(waterMatch[0]);
    const codeBySystem = { fuel: 'water_in_fuel', oil: 'water_in_oil', coolant: 'water_in_coolant', hydraulic: 'water_in_hydraulic', air: 'water_in_air' };
    symptoms.push({ code: system ? codeBySystem[system] : 'water_contamination', raw: waterMatch[0], system: system || 'unknown' });
  }

  const rules = [
    ['pressure_loss', /ca[ií]da\s+de\s+presi[oó]n|presi[oó]n\s+(?:de\s+)?aceite\s+baja|baja\s+(?:la\s+)?presi[oó]n(?:\s+de\s+aceite)?|pierde\s+presi[oó]n/i],
    ['power_loss', /p[eé]rdida\s+de\s+potencia|pierde\s+potencia|sin\s+fuerza/i],
    ['black_smoke', /humo\s+negro/i],
    ['white_smoke', /humo\s+blanco/i],
    ['hard_start', /arranque\s+dif[ií]cil|le\s+cuesta\s+arrancar|no\s+arranca/i],
    ['engine_stall', /se\s+apaga|apagones/i],
    ['high_consumption', /alto\s+consumo|consume\s+m[aá]s\s+combustible/i],
    ['restriction', /restricci[oó]n|filtro\s+tapado|obstrucci[oó]n/i],
    ['contamination', /contaminaci[oó]n|sedimento|suciedad|part[ií]culas/i],
    ['warning_light', /prende\s+la\s+luz|luz\s+(?:roja\s+)?(?:de\s+aceite\s+)?(?:se\s+enciende)?|testigo\s+(?:de\s+)?aceite/i]
  ];
  for (const [code, pattern] of rules) if (pattern.test(value)) symptoms.push({ code, raw: value.match(pattern)[0], system: null });

  return symptoms;
}

function extractDuration(text) {
  const match = String(text || '').match(/(?:desde\s+hace|hace)\s+([^,.!?]+)/i) ||
    String(text || '').match(/^\s*(\d+\s*(?:minutos?|horas?|d[ií]as?|semanas?|meses?|a[nñ]os?))\s*$/i);
  return match ? match[1].trim() : null;
}

function extractOperatingContext(text) {
  const value = String(text || '');
  if (/carretera|flota|transporte/i.test(value)) return 'carretera';
  if (/min(?:a|er[ií]a)/i.test(value)) return 'mineria';
  if (/construcci[oó]n|obra/i.test(value)) return 'construccion';
  if (/agricultura|agr[ií]cola|cosecha/i.test(value)) return 'agricultura';
  if (/generaci[oó]n/i.test(value)) return 'generacion';
  if (/marino/i.test(value)) return 'marino';
  if (/industrial/i.test(value)) return 'industrial';
  return null;
}

function extractImpact(text) {
  const value = String(text || '');
  if (/detenid[oa]|parad[oa]|fuera\s+de\s+servicio/i.test(value)) return 'equipment_down';
  if (/p[eé]rdida\s+de\s+potencia|mayor\s+consumo|riesgo\s+de\s+da[nñ]o|producci[oó]n|retraso|downtime/i.test(value)) return 'operational_loss';
  return null;
}

// NOTE: no trailing \b here — JS's \b only recognizes ASCII \w, so a
// boundary placed immediately after an accented vowel (e.g. "sé") silently
// fails to match because both the accented char and a following space count
// as "non-word", and \b requires a word/non-word transition.
function customerDoesNotKnow(text) {
  return /\b(?:no\s+lo\s+s[eé]|no\s+s[eé]|no\s+puedo\s+verlo|no\s+se\s+ve|desconozco|no\s+tengo\s+el\s+c[oó]digo)/i.test(String(text || ''));
}

function extractInstalledFilter(text) {
  const value = String(text || '');
  if (customerDoesNotKnow(value)) return { brand: null, reference: null, status: 'unknown' };
  const brandMatch = value.match(KNOWN_FILTER_BRANDS);
  const references = extractReferences(value);
  if (!brandMatch && !references.length) return null;
  return {
    brand: brandMatch ? brandMatch[0].toUpperCase() : null,
    reference: references[0] || null,
    status: references.length ? 'reference_provided' : 'brand_only'
  };
}

// Single-word answers to "which system?" once a water_contamination symptom
// with system:'unknown' is pending clarification.
function interpretSystemClarification(text) {
  return detectSystemFromText(String(text || ''));
}

// ── Deterministic fallback classifier (used ONLY when Groq is unavailable
// or fails to return valid structured JSON) ─────────────────────────────────

function deterministicIntent(message, state) {
  const value = String(message || '').trim();
  if (isStandaloneGreeting(value)) return 'greeting';
  if (/distribuidor|distribuci[oó]n|representar|territorio|dealer|importador/i.test(value)) return 'distribution_inquiry';
  if (/cotizaci[oó]n|precio|comprar|pedido|orden|disponibilidad/i.test(value)) return 'commercial_inquiry';
  if (/equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye/i.test(value)) return 'cross_reference_lookup';
  if (/especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal/i.test(value)) return 'specification_lookup';
  if (state.pendingField === 'symptom_system') return 'diagnostic';
  // A detected symptom is the single source of truth for "this is a
  // diagnostic message" — reusing detectSymptoms() here (instead of a
  // second, separately-maintained keyword list) is what prevents the
  // classifier and the symptom extractor from silently disagreeing.
  if (detectSymptoms(value).length > 0 || /falla|fallando|problema|s[ií]ntoma/i.test(value)) return 'diagnostic';
  if (state.intent === 'diagnostic' && state.phase !== 'diagnostic_assessment') return 'diagnostic';
  if (/recomiend|qu[eé]\s+filtros?|cu[aá]l(?:es)?\s+filtros?|aplicaci[oó]n|usa|lleva/i.test(value)) return 'application_lookup';
  if (extractReferences(value).length) return 'exact_reference_lookup';
  if (state.pendingField) return state.intent || 'diagnostic';
  return 'general';
}

function deterministicClassify(message, state) {
  const text = conversationText(message, state);
  const intent = deterministicIntent(message, state);
  const brand = extractBrand(text) || state.equipment.brand;
  // Symptoms are extracted from the current message only (not full history):
  // history is already accumulated in state, and re-scanning it would
  // re-detect already-resolved symptoms (e.g. a system clarification that
  // was already answered) as if they were new/unresolved again.
  const symptoms = detectSymptoms(message);
  return {
    intent,
    isFollowUp: Boolean(state.pendingField),
    entities: {
      brand,
      model: extractModel(text, brand) || state.equipment.model,
      engine: extractEngine(text) || state.equipment.engine,
      year: extractYear(text) || state.equipment.year,
      symptoms,
      duration: extractDuration(message),
      operatingContext: extractOperatingContext(message),
      impact: extractImpact(message),
      installedFilterBrand: extractInstalledFilter(message)?.brand || null,
      installedFilterReference: extractInstalledFilter(message)?.reference || null
    },
    requiresClarification: symptoms.some(s => s.system === 'unknown'),
    clarificationReason: symptoms.some(s => s.system === 'unknown') ? 'No se identificó en qué sistema aparece el agua' : null,
    source: 'deterministic'
  };
}

const SYMPTOM_TAXONOMY = [
  'power_loss', 'black_smoke', 'white_smoke', 'hard_start', 'engine_stall', 'high_consumption',
  'pressure_loss', 'restriction', 'contamination', 'warning_light',
  'water_in_fuel', 'water_in_oil', 'water_in_coolant', 'water_in_hydraulic', 'water_in_air', 'water_contamination'
];

async function classifyWithGroq(message, state) {
  const result = await groqChatJson([
    {
      role: 'system',
      content: `Eres el clasificador central de ELIMFILTERS para diagnostico tecnico de filtracion. Devuelve JSON estricto con EXACTAMENTE este esquema:
{"intent":"<${INTENTS.join('|')}>","isFollowUp":boolean,"entities":{"brand":string|null,"model":string|null,"engine":string|null,"year":number|null,"symptoms":[{"code":string,"raw":string,"system":"fuel"|"oil"|"coolant"|"hydraulic"|"air"|"unknown"|null}],"duration":string|null,"operatingContext":string|null,"impact":string|null,"installedFilterBrand":string|null,"installedFilterReference":string|null},"requiresClarification":boolean,"clarificationReason":string|null}

Reglas obligatorias:
1. Usa todo el historial de la conversacion, no solo el ultimo mensaje.
2. Un saludo acompanado de una consulta tecnica NO es "greeting".
3. Codigos de sintoma permitidos: ${SYMPTOM_TAXONOMY.join(', ')}.
4. "Agua en el sistema" SIN nombrar el sistema exacto (combustible, aceite, refrigerante, hidraulico, aire) es INFORMACION INCOMPLETA: usa code "water_contamination", system "unknown", requiresClarification true, clarificationReason "No se identifico en que sistema aparece el agua". NUNCA asumas el sistema.
5. Si el usuario ya nombro el sistema (ej. "agua en el combustible"), usa el code especifico (water_in_fuel, water_in_oil, water_in_coolant, water_in_hydraulic, water_in_air) y system correspondiente, requiresClarification false.
6. No inventes entidades que no esten en el texto o el historial.`
    },
    { role: 'user', content: JSON.stringify({ message, history: state.conversationHistory.slice(-12), known_state: { equipment: state.equipment, symptoms: state.symptoms, pendingField: state.pendingField } }) }
  ], { maxTokens: 500, temperature: 0, timeoutMs: 6500 });

  if (!result || !INTENTS.includes(result.intent) || !result.entities) return null;
  return {
    intent: result.intent,
    isFollowUp: Boolean(result.isFollowUp),
    entities: {
      brand: result.entities.brand || null,
      model: result.entities.model || null,
      engine: result.entities.engine || null,
      year: Number(result.entities.year) || null,
      symptoms: Array.isArray(result.entities.symptoms) ? result.entities.symptoms : [],
      duration: result.entities.duration || null,
      operatingContext: result.entities.operatingContext || null,
      impact: result.entities.impact || null,
      installedFilterBrand: result.entities.installedFilterBrand || null,
      installedFilterReference: result.entities.installedFilterReference || null
    },
    requiresClarification: Boolean(result.requiresClarification),
    clarificationReason: result.clarificationReason || null,
    source: 'groq'
  };
}

// ── State merge ──────────────────────────────────────────────────────────

function mergeEntitiesIntoState(state, classification, message) {
  const entities = classification.entities;
  const next = {
    ...state,
    intent: classification.intent,
    equipment: {
      brand: entities.brand || state.equipment.brand,
      model: entities.model || state.equipment.model,
      engine: entities.engine || state.equipment.engine,
      year: entities.year || state.equipment.year
    },
    duration: entities.duration || state.duration,
    operatingContext: entities.operatingContext || state.operatingContext,
    impact: entities.impact || state.impact
  };

  // Merge symptoms by code, resolving system:'unknown' clarifications in place
  // rather than appending a duplicate entry.
  const bySystemClarification = state.pendingField === 'symptom_system' ? interpretSystemClarification(message) : null;
  let symptoms = [...state.symptoms];
  if (bySystemClarification) {
    const codeBySystem = { fuel: 'water_in_fuel', oil: 'water_in_oil', coolant: 'water_in_coolant', hydraulic: 'water_in_hydraulic', air: 'water_in_air' };
    symptoms = symptoms.map(s => (s.system === 'unknown'
      ? { code: codeBySystem[bySystemClarification], raw: s.raw, system: bySystemClarification }
      : s));
  }
  for (const incoming of entities.symptoms) {
    if (!incoming?.code) continue;
    // Already resolved (e.g. same wording, now mapped to a specific system) —
    // never re-add as a fresh unresolved symptom.
    if (symptoms.some(s => s.raw === incoming.raw && s.system !== 'unknown')) continue;
    const existingIndex = symptoms.findIndex(s => s.code === incoming.code || (s.system === 'unknown' && incoming.system && incoming.system !== 'unknown' && s.code.startsWith('water_')));
    if (existingIndex === -1) symptoms.push({ code: incoming.code, raw: incoming.raw || incoming.code, system: incoming.system || null });
    else if (incoming.system && incoming.system !== 'unknown') symptoms[existingIndex] = { code: incoming.code, raw: incoming.raw || symptoms[existingIndex].raw, system: incoming.system };
  }
  next.symptoms = symptoms;

  // Installed filter: only overwrite once we actually learn something new.
  const installedBrand = entities.installedFilterBrand;
  const installedRef = entities.installedFilterReference;
  const doesNotKnow = customerDoesNotKnow(message);
  if (doesNotKnow && (state.pendingField === 'installedFilter' || state.pendingField === 'operating_and_filter')) {
    next.installedFilter = { type: state.installedFilter.type, brand: null, reference: null, status: 'unknown' };
  } else if (installedBrand || installedRef) {
    next.installedFilter = {
      type: state.installedFilter.type,
      brand: installedBrand || state.installedFilter.brand,
      reference: installedRef || state.installedFilter.reference,
      status: installedRef ? 'reference_provided' : 'brand_only'
    };
  }

  next.conversationHistory = [...state.conversationHistory, message].filter(Boolean).slice(-20);
  return next;
}

// ── Next-action state machine ───────────────────────────────────────────────

function determineNextAction(state) {
  if (state.intent !== 'diagnostic') return { pendingField: null, phase: 'catalog_resolution' };

  const hasUnknownSystemSymptom = state.symptoms.some(s => s.system === 'unknown');
  if (hasUnknownSystemSymptom) {
    return {
      pendingField: 'symptom_system',
      phase: 'collecting_diagnostic_data',
      question: '¿En cuál sistema detectaste agua: combustible, aceite, refrigerante, hidráulico o aire?'
    };
  }

  if (!state.equipment.brand && !state.symptoms.length) {
    return {
      pendingField: 'equipment',
      phase: 'collecting_diagnostic_data',
      question: '¿Cuál es la marca, modelo y motor exactos del equipo, y qué problema está presentando?'
    };
  }

  if (!state.symptoms.length) {
    return {
      pendingField: 'symptoms',
      phase: 'collecting_diagnostic_data',
      question: '¿Qué síntomas observás exactamente en el equipo?'
    };
  }

  if (!state.duration) {
    return {
      pendingField: 'duration',
      phase: 'collecting_diagnostic_data',
      question: '¿Desde cuándo ocurre este problema?'
    };
  }

  const needsOperatingContext = !state.operatingContext;
  const needsInstalledFilter = state.installedFilter.status !== 'unknown' && !state.installedFilter.reference;
  if (needsOperatingContext && needsInstalledFilter) {
    return {
      pendingField: 'operating_and_filter',
      phase: 'collecting_diagnostic_data',
      question: '¿En qué tipo de operación trabaja el equipo (carretera, minería, construcción, agricultura u otra) y qué filtro está instalado actualmente? Indica marca y código, o envía una foto clara.'
    };
  }
  if (needsOperatingContext) {
    return {
      pendingField: 'operatingContext',
      phase: 'collecting_diagnostic_data',
      question: '¿En qué tipo de operación trabaja el equipo: carretera, minería, construcción, agricultura u otra?'
    };
  }
  if (needsInstalledFilter) {
    return {
      pendingField: 'installedFilter',
      phase: 'collecting_diagnostic_data',
      question: '¿Qué filtro está usando actualmente? Indica marca y código impresos, o envía una foto clara.'
    };
  }

  return { pendingField: null, phase: 'diagnostic_assessment' };
}

// ── Catalog + answer synthesis ──────────────────────────────────────────────

function primarySymptomCode(state) {
  const priority = ['pressure_loss', 'water_in_fuel', 'water_in_oil', 'water_in_coolant', 'water_in_hydraulic', 'water_in_air', 'power_loss'];
  for (const code of priority) if (state.symptoms.some(s => s.code === code)) return code;
  return state.symptoms[0]?.code || null;
}

const SAFETY_CHECKLISTS = {
  pressure_loss: [
    'Verificar nivel, condición y viscosidad del aceite.',
    'Medir la presión con un manómetro mecánico en frío, en ralentí caliente y bajo carga.',
    'Revisar contaminación o dilución del aceite.',
    'Confirmar la válvula reguladora y descartar desgaste interno.'
  ],
  water_in_fuel: [
    'Drenar el separador agua-combustible y verificar el volumen de agua acumulada.',
    'Revisar el sello y la condición del tanque de combustible.',
    'Confirmar el estado del filtro primario y secundario de combustible.',
    'Verificar la fuente de ingreso de agua (condensación, tapa de tanque, línea de llenado).'
  ],
  water_in_oil: [
    'Revisar el color y la consistencia del aceite (lechoso indica agua).',
    'Verificar el estado del empaque de culata y el enfriador de aceite.',
    'Confirmar si hay pérdida de refrigerante asociada.'
  ],
  water_in_coolant: [
    'Verificar el nivel y color del refrigerante.',
    'Revisar el radiador, mangueras y tapa de presión.',
    'Confirmar ausencia de gases de combustión en el sistema de enfriamiento.'
  ],
  default: [
    'Verificar el estado general del sistema afectado.',
    'Confirmar la fuente de contaminación antes de reemplazar componentes.'
  ]
};

function applicableGeneralPractices(system) {
  if (!system) return [];
  return APPROVED_GENERAL_PRACTICES.filter(practice => practice.appliesTo.includes(system));
}

function formatCategoryLine(entry) {
  const label = String(entry.category || '').replace(/_/g, ' ');
  const qualifier = entry.conditional ? ' (condicionado a verificación)' : '';
  return `• ${label}${qualifier} — ${entry.reason}`;
}

function buildSkuSection(state, catalog) {
  if (state.installedFilter.status === 'unknown') {
    return 'Aplicación:\nNo se pudo validar el filtro instalado en la base de datos ELIMFILTERS porque el cliente no cuenta con la referencia. No asignaré un SKU sin evidencia.';
  }
  if (!state.installedFilter.reference) {
    return 'Aplicación:\nNo se validó un filtro instalado en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.';
  }
  if (!catalog || !catalog.products.length) {
    return `Aplicación:\nNo encontré una equivalencia confirmada para ${state.installedFilter.reference} en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.`;
  }
  const product = catalog.products[0];
  const skuLine = `${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`;
  return `Aplicación:\nLa referencia instalada (${state.installedFilter.reference}) fue validada en la base de datos ELIMFILTERS. La equivalencia confirmada es:\n\n• ${skuLine}\n\nEsta referencia no confirma por sí sola la causa raíz: complete las verificaciones mecánicas antes de instalar.`;
}

// A-F structured diagnostic answer (Bloque 2, spec section 6). `pipeline` is
// optional (defaults keep this backward compatible with a bare
// buildDiagnosticAssessmentAnswer(state, catalog) call): A) preliminary
// diagnosis, B) corrective action / checklist, C) Obsidian-approved OEM
// citation (or an explicit "not confirmed, gap registered" statement — never
// an invented interval), D) general approved practices, E) ELIMFILTERS
// category recommendation, F) validated SKU or missing-data statement.
function buildDiagnosticAssessmentAnswer(state, catalog, pipeline = {}) {
  const { technicalKnowledge = null, categoryRecommendation = null } = pipeline;
  const checklist = SAFETY_CHECKLISTS[primarySymptomCode(state)] || SAFETY_CHECKLISTS.default;
  const checklistText = checklist.map((line, index) => `${index + 1}. ${line}`).join('\n');
  const operationText = state.operatingContext ? ` en operación ${state.operatingContext}` : '';

  const sections = [];

  sections.push(`Diagnóstico preliminar:\nLa información apunta a un problema técnico${operationText} que no debe atribuirse únicamente al filtro sin verificación mecánica.`);
  sections.push(`Acción recomendada:\n${checklistText}`);

  if (technicalKnowledge?.status === 'validated' && technicalKnowledge.answer) {
    const sourceNames = (technicalKnowledge.evidence || []).map(e => e.source_title).filter(Boolean).join('; ');
    sections.push(`Mantenimiento OEM:\nSegún ${sourceNames || 'fuente técnica aprobada'}: ${technicalKnowledge.answer}`);
  } else {
    sections.push('Mantenimiento OEM:\nNo tengo confirmado el procedimiento o intervalo OEM exacto para esta configuración. La consulta fue registrada para investigación técnica. Mientras tanto, debe verificarse el manual oficial del equipo.');
  }

  const system = state.symptoms.find(s => s.system && s.system !== 'unknown')?.system || null;
  const practices = applicableGeneralPractices(system);
  if (practices.length) {
    sections.push(`Prácticas generales aprobadas:\n${practices.slice(0, 3).map(p => `• ${p.statement}`).join('\n')}`);
  }

  if (categoryRecommendation?.status === 'recommended' && categoryRecommendation.categories.length) {
    sections.push(`Protección ELIMFILTERS:\n${categoryRecommendation.categories.map(formatCategoryLine).join('\n')}`);
  }

  sections.push(buildSkuSection(state, catalog));

  return sections.join('\n\n');
}

// True only for a GENUINELY verified catalog search -- the query actually
// ran against the canonical Postgres catalog (never skipped, never failed)
// and legitimately found nothing. Used by both the diagnostic and the
// standalone lookup-intent branches to trigger the same immediate email-ask
// instead of waiting for the 5-unresolved-attempts escalation threshold.
function verifiedNoMatch(catalog) {
  return Boolean(catalog) && catalog.lookupStatus === 'completed' && !catalog.products.length;
}

const SUPPORT_EMAIL_REQUEST = 'Nuestro equipo técnico revisará tu caso personalmente. ¿Podrías compartirme tu correo electrónico para que te contactemos?';

async function runCatalogQuery(state, classification) {
  const intent = classification.intent;

  if (intent === 'diagnostic') {
    if (!state.installedFilter.reference) return { products: [], lookupStatus: 'not_required' };
    return searchByReferences([state.installedFilter.reference]);
  }

  if (['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup'].includes(intent)) {
    const references = extractReferences(state.conversationHistory[state.conversationHistory.length - 1] || '');
    return searchByReferences(references);
  }

  if (intent === 'application_lookup') {
    const tokens = [state.equipment.brand, state.equipment.model, state.equipment.engine].filter(Boolean);
    return searchByApplication(tokens, state.equipment.year);
  }

  return { products: [], lookupStatus: 'not_required' };
}

// B2C never reaches this branch: distribution_inquiry only fires from an
// explicit distributor/territory/dealer/importador signal (see the intent
// classifier), which is itself the B2B declaration. Generic "where can I
// buy" questions classify as commercial_inquiry below and never receive the
// distributor-application link, regardless of customer type.
function directAnswer(intent, state) {
  if (intent === 'distribution_inquiry') {
    if (state && state.distributionQualificationConfirmed) {
      return 'Gracias por la información. Para iniciar el proceso de precalificación comercial B2B, completá el formulario en https://elimfilters.com/distributor-application. Nuestro equipo comercial evaluará tu solicitud según el país, la experiencia y el volumen estimado, y se pondrá en contacto.';
    }
    return 'Para evaluar una oportunidad de distribución necesito país o territorio, tipo de clientes que atendés y experiencia en filtración, flotas o equipos pesados.';
  }
  if (intent === 'commercial_inquiry') return 'Para preparar una cotización necesito el código o la aplicación exacta, la cantidad requerida y el país o ciudad de entrega.';
  if (intent === 'support_request') return 'Describí el equipo, el problema y cualquier código o referencia disponible. Con esos datos puedo iniciar la revisión técnica.';
  return 'Indicá qué necesitás revisar: una aplicación, una equivalencia, una especificación, un diagnóstico técnico o información comercial.';
}

function shouldUseKnowledge(intent, phase) {
  if (phase === 'collecting_diagnostic_data' || phase === 'collecting_application_data') return false;
  return ['diagnostic', 'specification_lookup', 'general', 'support_request'].includes(intent);
}

// `approvedKnowledge` must already be Obsidian-approved (status === 'validated')
// or null — callers never pass an unapproved/ESCALATE'd result here, so Groq
// can only ever phrase evidence that already cleared the governance gate; it
// never gets a chance to "discover" an unapproved answer and restate it.
async function synthesizeGeneralAnswer(message, state, approvedKnowledge, deterministicAnswer) {
  if (!process.env.GROQ_API_KEY) return deterministicAnswer;
  const result = await groqChatJson([
    {
      role: 'system',
      content: 'Eres el cerebro tecnico central de ELIMFILTERS. Responde en espanol claro y profesional usando el historial y el conocimiento provisto. Reglas absolutas: 1) no inventes SKU, equivalencias ni especificaciones; 2) si no hay evidencia de catalogo, dilo explicitamente; 3) no repitas preguntas ya resueltas; 4) prioriza seguridad ante riesgos mecanicos. Devuelve JSON {"answer":"texto final"}.'
    },
    {
      role: 'user',
      content: JSON.stringify({
        message,
        history: state.conversationHistory.slice(-8),
        deterministic_answer: deterministicAnswer,
        knowledge_answer: approvedKnowledge?.answer || null,
        knowledge_sources: (approvedKnowledge?.evidence || []).map(e => e.source_title).filter(Boolean)
      })
    }
  ], { maxTokens: 700, temperature: 0.1, timeoutMs: 6500 });

  return typeof result?.answer === 'string' && result.answer.trim() ? result.answer.trim() : deterministicAnswer;
}

function hashDeduplicationKey(value) {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 16);
}

function emptyPipelineResult() {
  return {
    technicalKnowledge: null,
    categoryRecommendation: { status: 'not_applicable', categories: [] },
    knowledgeGapRecord: null,
    hermesResult: null
  };
}

// Reconstructs a minimal-but-valid evidence object from the compact,
// non-sensitive pointer already saved in conversation memory
// (state.technicalKnowledge — see bot-protocol-memory.js). This is re-use of
// a real prior approval, never a fresh one: the source_id being replayed was
// only ever written after isApprovedTechnicalEvidence genuinely passed for
// it earlier this same conversation (see applyPipelineToState below).
function hydrateCachedTechnicalEvidence(cached, equipment, system) {
  const sourceId = (cached.sourceIds || [])[0] || null;
  if (!sourceId) return { status: 'not_found', answer: null, evidence: [], oem_maintenance: null, general_approved_practices: [], source_count: 0, conflicts_detected: false, latency_ms: 0 };
  const evidence = [sanitizeTechnicalEvidence({
    technical_source_validated: true,
    source_authority: 'obsidian',
    source_id: sourceId,
    source_type: 'approved_internal_document',
    equipment,
    system,
    approved_for_bot_use: true,
    approved_at: cached.validatedAt,
    approved_by: 'knowledge_center_production_eligibility_gate',
    confidence: 'medium',
    retrieved_at: cached.validatedAt
  })];
  return {
    status: 'validated', answer: null, evidence, oem_maintenance: null, general_approved_practices: [],
    source_count: evidence.length, conflicts_detected: false, latency_ms: 0, cached: true
  };
}

// Runs the parts of the operational pipeline (spec section 5, steps 6-10)
// that need I/O: Obsidian query (with in-conversation reuse), product
// category recommendation, and — only when Obsidian genuinely has no
// evidence — knowledge-gap persistence plus a gated/deduplicated HERMES
// research request. Never throws: every sub-call already degrades to a
// safe status internally, so a single failed dependency never breaks the
// conversation.
async function runKnowledgeGovernancePipeline({ requestId, body, state, message, system }) {
  const conversationId = body.conversation_id || body.user_id || body.contact_id || null;
  const result = emptyPipelineResult();

  if (state.technicalKnowledge?.status === 'validated' && state.equipment.brand) {
    result.technicalKnowledge = hydrateCachedTechnicalEvidence(state.technicalKnowledge, state.equipment, system);
  } else {
    result.technicalKnowledge = await queryApprovedTechnicalKnowledge({
      question: message,
      equipment: state.equipment,
      system,
      intent: state.intent,
      conversationId,
      requestId
    });
    console.info('[obsidian-knowledge]', {
      request_id: requestId,
      conversation_id: conversationId,
      status: result.technicalKnowledge.status,
      source_count: result.technicalKnowledge.source_count,
      validated_count: (result.technicalKnowledge.evidence || []).length,
      conflicts_detected: result.technicalKnowledge.conflicts_detected,
      latency_ms: result.technicalKnowledge.latency_ms
    });
  }

  if (['diagnostic', 'application_lookup'].includes(state.intent)) {
    result.categoryRecommendation = recommendCategories({
      intent: state.intent,
      equipment: state.equipment,
      system,
      symptoms: state.symptoms,
      installedFilter: state.installedFilter
    });
    console.info('[product-category]', {
      request_id: requestId,
      system,
      categories: result.categoryRecommendation.categories.map(c => c.category),
      status: result.categoryRecommendation.status
    });
  }

  // Anything other than a genuinely validated answer means we don't have
  // approved evidence to back a claim to the customer — that is worth
  // tracking as a gap regardless of the specific reason (not found, a
  // conflict, insufficient equipment data, or Obsidian being unreachable).
  const shouldRegisterGap = state.intent === 'diagnostic' && state.phase === 'diagnostic_assessment' &&
    result.technicalKnowledge && result.technicalKnowledge.status !== 'validated';

  if (shouldRegisterGap) {
    const dedupKey = buildDeduplicationKey({ request_type: 'oem_maintenance_interval', equipment: state.equipment, system, question: message });
    const reason = `technical knowledge query returned ${result.technicalKnowledge.status}`;
    const priority = state.impact === 'equipment_down' ? 'high' : 'medium';

    if (state.knowledgeGap?.deduplicationKey === dedupKey && state.knowledgeGap.requestId) {
      // Already tracked this conversation — reuse the pointer instead of a
      // fresh database round trip.
      result.knowledgeGapRecord = {
        request_id: state.knowledgeGap.requestId,
        deduplication_key: dedupKey,
        status: state.knowledgeGap.status,
        hermes_research_id: state.knowledgeGap.hermesResearchId,
        equipment: state.equipment,
        system,
        question: message,
        reason,
        request_type: 'oem_maintenance_interval',
        priority
      };
    } else {
      const upsert = await upsertKnowledgeGap({
        request_type: 'oem_maintenance_interval',
        origin: 'bot_orchestrator',
        equipment: state.equipment,
        system,
        question: message,
        reason,
        requested_by: 'bot_orchestrator',
        conversation_id: conversationId,
        channel: body.channel || null,
        priority
      });
      console.info('[knowledge-gap-store]', {
        request_id: requestId,
        deduplication_key_hash: hashDeduplicationKey(dedupKey),
        status: upsert.gap?.status || 'unknown',
        occurrences: upsert.gap?.occurrences ?? null,
        persistence_status: upsert.persisted ? 'persisted' : 'unavailable'
      });
      result.knowledgeGapRecord = upsert.gap || {
        request_id: dedupKey, deduplication_key: dedupKey, status: 'detected', hermes_research_id: null,
        equipment: state.equipment, system, question: message, reason, request_type: 'oem_maintenance_interval', priority
      };
    }

    if (result.knowledgeGapRecord && !result.knowledgeGapRecord.hermes_research_id) {
      const startedAt = Date.now();
      result.hermesResult = await createHermesResearchRequest({
        knowledgeGap: result.knowledgeGapRecord,
        researchRequest: { research_question: message, required_source_types: ['oem_manual'] },
        requestId,
        conversationId
      });
      console.info('[hermes-request]', {
        request_id: requestId,
        knowledge_gap_request_id: result.knowledgeGapRecord.request_id,
        status: result.hermesResult.status,
        duplicate: result.hermesResult.status === 'duplicate',
        latency_ms: Date.now() - startedAt
      });
      if (result.hermesResult.status === 'accepted' && result.knowledgeGapRecord.request_id) {
        const attach = await attachHermesResearchId(result.knowledgeGapRecord.request_id, result.hermesResult.hermes_research_id);
        result.knowledgeGapRecord = attach.gap || { ...result.knowledgeGapRecord, hermes_research_id: result.hermesResult.hermes_research_id };
      }
    }
  }

  return result;
}

// Persists the compact, non-sensitive pointers from this turn's pipeline
// result into conversation state (spec section 9) — never full evidence
// text, never full manual content.
function applyPipelineToState(state, pipeline, message) {
  if (pipeline.technicalKnowledge && !pipeline.technicalKnowledge.cached) {
    state.technicalKnowledge = pipeline.technicalKnowledge.status === 'validated'
      ? {
        status: 'validated',
        sourceIds: (pipeline.technicalKnowledge.evidence || []).map(e => e.source_id).filter(Boolean),
        lastQuery: String(message || '').slice(0, 200),
        validatedAt: new Date().toISOString()
      }
      : { status: pipeline.technicalKnowledge.status, sourceIds: [], lastQuery: String(message || '').slice(0, 200), validatedAt: null };
  }

  if (pipeline.categoryRecommendation?.status === 'recommended') {
    state.productRecommendation = {
      categories: pipeline.categoryRecommendation.categories,
      validatedSkus: (state.validatedProducts || []).map(p => p.sku).filter(Boolean)
    };
  }

  if (pipeline.knowledgeGapRecord) {
    state.knowledgeGap = {
      requestId: pipeline.knowledgeGapRecord.request_id,
      deduplicationKey: pipeline.knowledgeGapRecord.deduplication_key,
      status: pipeline.knowledgeGapRecord.status,
      hermesResearchId: pipeline.knowledgeGapRecord.hermes_research_id || null
    };
  }
}

// Composes response_governance for this turn from the pipeline's outputs
// and the real PostgreSQL catalog result, then redacts anything
// unauthorized that slipped into the free-text answer.
function finalizeResponseGovernance({ requestId, body, state, catalog, answer, pipeline }) {
  const skuAuthority = buildSkuAuthorityFromCatalogResult(catalog, {
    queryType: state.intent === 'application_lookup' ? 'application' : 'exact_reference',
    inputReference: state.installedFilter?.reference || null,
    equipment: state.equipment
  });

  const technicalEvidence = pipeline.technicalKnowledge?.status === 'validated' && pipeline.technicalKnowledge.evidence?.length
    ? pipeline.technicalKnowledge.evidence[0]
    : null;

  const governance = buildResponseGovernance({
    technicalEvidence,
    // No structured OEM interval is ever synthesized from Knowledge Engine
    // free text in this phase — see docs/KNOWLEDGE_PIPELINE_OPERATIONS.md
    // ("pending risks") for why, and lib/knowledge-governance/oem-
    // maintenance-contract.js for the shape a future phase would populate.
    oemMaintenance: null,
    knowledgeGap: pipeline.knowledgeGapRecord,
    hermesRequestId: pipeline.knowledgeGapRecord?.hermes_research_id || null,
    skuAuthority,
    productCategoryRecommended: pipeline.categoryRecommendation
  });

  const redacted = redactUnauthorizedClaims(answer, governance);
  governance.authority_violations = [...governance.authority_violations, ...redacted.violations];
  governance.safe_to_publish = determineSafeToPublish(governance);

  const conversationId = body.conversation_id || body.user_id || body.contact_id || null;
  console.info('[knowledge-governance]', {
    request_id: requestId,
    conversation_id: conversationId,
    technical_source_validated: governance.technical_source_validated,
    knowledge_gap_registered: governance.knowledge_gap_registered,
    hermes_request_created: governance.hermes_request_created,
    sku_validated_in_postgresql: governance.sku_validated_in_postgresql,
    authority_violation_count: governance.authority_violations.length,
    safe_to_publish: governance.safe_to_publish
  });
  console.info('[catalog-authority]', {
    request_id: requestId,
    lookup_status: skuAuthority.lookup_status,
    evidence_count: skuAuthority.evidence_count,
    sku_count: skuAuthority.validated_skus.length,
    validated: skuAuthority.sku_validated_in_postgresql
  });

  return { answer: redacted.text, governance, skuAuthority };
}

// ── Top-level orchestration ─────────────────────────────────────────────────

// Accepts a channel adapter's one-time backfill of prior conversation
// history (e.g. WhatsApp's last 20 messages from its own operational DB,
// sent while migrating a user who already had a conversation before this
// engine existed for them). Only ever applied when no memory already exists
// for this key (idempotent by construction -- a retried/duplicated
// context_seed on an already-seeded or already-active conversation is a
// no-op because `found` is true from then on). Only raw text goes into
// conversationHistory; nothing here is treated as structured/validated
// state (equipment, symptoms, etc. still come only from the live
// conversation itself).
function extractSeedHistory(contextSeed) {
  if (!Array.isArray(contextSeed) || !contextSeed.length) return [];
  return contextSeed
    .map(entry => (typeof entry === 'string' ? entry : (entry && typeof entry.text === 'string' ? entry.text : '')))
    .map(text => String(text || '').trim())
    .filter(Boolean)
    .slice(-20);
}

async function runBotProtocol(body) {
  const requestId = crypto.randomUUID();
  const message = String(body.message || '').trim();
  const key = memoryKey(body);
  const { state: loaded, source: memorySource, found } = await loadMemory(key);

  const seededHistory = found ? [] : extractSeedHistory(body.context_seed);
  if (seededHistory.length) loaded.conversationHistory = seededHistory;

  // c. greeting / reset detection
  const greeting = isStandaloneGreeting(message);
  let state = greeting ? { ...createEmptyState(), conversationHistory: seededHistory } : loaded;
  if (!greeting && isNewDiagnosticStart(message, state)) state = resetDiagnosticState(state);

  if (greeting) {
    const payload = buildPayload({
      requestId, state: { ...createEmptyState(), intent: 'greeting', phase: 'conversation_start', conversationHistory: seededHistory },
      answer: 'Hola. ¿En qué equipo o sistema necesitás ayuda? Podés indicar marca, modelo, motor, año y el problema que presenta.',
      classifierSource: 'deterministic', catalog: { products: [], lookupStatus: 'not_required' }, knowledge: { status: 'skipped' }
    });
    return finalize({ requestId, key, state, body, payload, memorySource, contextSeedApplied: seededHistory.length > 0 });
  }

  // b2. Awaiting the customer's support email after a verified catalog
  // search found nothing (see the exact_reference_lookup/cross_reference_
  // lookup/specification_lookup/application_lookup branch below). Intercept
  // BEFORE classification so a message that's just the email reply is never
  // reinterpreted as a fresh, unrelated intent. isNewDiagnosticStart (above)
  // already runs first and resets this phase via resetDiagnosticState if the
  // user pivots to a genuinely new problem instead of replying with email --
  // that is deliberate and takes priority over this block.
  if (state.phase === 'AWAITING_SUPPORT_EMAIL') {
    const email = extractValidEmail(message);
    let answer;

    if (email && state.supportLead.created) {
      // Idempotent: a repeated/duplicate email delivery for an
      // already-registered lead never creates a second lead or repeats
      // the thank-you.
      answer = 'Tu consulta y tu correo ya están registrados. Nuestro equipo técnico se pondrá en contacto contigo a la brevedad.';
    } else if (email) {
      const ticket = buildSupportLeadTicket({ state, body, email });
      const dispatch = await dispatchTicket(ticket);
      if (!dispatch.duplicate) {
        state.supportLead = {
          status: 'CREATED',
          email,
          created: true,
          ticketId: ticket.ticket_id,
          createdAt: ticket.created_at
        };
        if (!dispatch.emailed) {
          console.error('[support-lead] internal notification email failed', { ticket_id: ticket.ticket_id, error: dispatch.error || null });
        }
      } else {
        // dispatchTicket's own Redis SET NX caught this as a duplicate
        // (e.g. two near-simultaneous deliveries of the same message) --
        // still mark it created locally so this conversation's state
        // reflects reality and future turns don't re-attempt.
        state.supportLead = { status: 'CREATED', email, created: true, ticketId: ticket.ticket_id, createdAt: ticket.created_at };
      }
      // Equipment/symptoms/installedFilter are intentionally left exactly
      // as they were -- never re-asked once a lead is registered.
      state.phase = 'conversation_start';
      answer = 'Gracias. Registramos tu correo y tu consulta -- nuestro equipo técnico la revisará y se pondrá en contacto contigo a la brevedad.';
    } else {
      answer = 'No pude identificar un correo válido. ¿Podrías confirmarlo nuevamente? Por ejemplo: nombre@dominio.com';
      // phase stays AWAITING_SUPPORT_EMAIL; nothing else in state changes.
    }

    const payload = buildPayload({
      requestId, state, answer, classifierSource: 'deterministic',
      catalog: { products: [], lookupStatus: 'not_required' }, knowledge: { status: 'skipped' }
    });
    return finalize({ requestId, key, state, body, payload, memorySource, contextSeedApplied: seededHistory.length > 0 });
  }

  // d/e. Groq classify with deterministic fallback
  let classification = await classifyWithGroq(message, state);
  let classifierSource = 'groq';
  if (!classification) {
    classification = deterministicClassify(message, state);
    classifierSource = 'deterministic';
  }

  // f. merge entities with memory
  const awaitingDistributionQualification = state.distributionQualificationPending === true;
  state = mergeEntitiesIntoState(state, classification, message);
  if (awaitingDistributionQualification) {
    // The previous turn asked the B2B qualification question (país/
    // territorio, tipo de clientes, experiencia) -- this message is that
    // reply, not a fresh request. Keep the user on the distribution_inquiry
    // path regardless of what the classifier guessed for this single
    // message, so the distributor-application link is only ever reached
    // after we have actually asked and received a qualification answer.
    // (resetDiagnosticState already clears distributionQualificationPending
    // when the message is a genuine new diagnostic problem, so this branch
    // is never reached in that case.)
    state.intent = 'distribution_inquiry';
    state.distributionQualificationConfirmed = true;
  }

  // g. determine next action
  const action = determineNextAction(state);
  state.pendingField = action.pendingField;
  state.phase = action.phase;

  // h. Postgres catalog (only when the state machine says we're ready)
  let catalog = { products: [], lookupStatus: 'not_required' };
  if (!action.pendingField) {
    catalog = await runCatalogQuery(state, classification);
    if (catalog.products.length) state.validatedProducts = catalog.products;
  }

  // i. Obsidian-approved technical knowledge + category recommendation +
  // (only when evidence is genuinely missing) knowledge-gap/HERMES tracking.
  // Only runs once the state machine is done collecting fields — never
  // mid-clarification, and never twice for the same already-answered
  // question (see runKnowledgeGovernancePipeline's in-conversation reuse).
  const equipmentSystem = state.symptoms.find(s => s.system && s.system !== 'unknown')?.system || null;
  let pipeline = emptyPipelineResult();
  if (!action.pendingField && shouldUseKnowledge(state.intent, state.phase)) {
    pipeline = await runKnowledgeGovernancePipeline({ requestId, body, state, message, system: equipmentSystem });
  }

  let answer;
  if (action.pendingField) {
    answer = action.question;
  } else if (state.intent === 'diagnostic') {
    answer = buildDiagnosticAssessmentAnswer(state, catalog, pipeline);
    // Case 3 of buildSkuSection() only: a reference WAS provided and the
    // catalog WAS genuinely queried for it (not "customer doesn't know
    // their filter" / "no reference given at all", which never reach
    // verifiedNoMatch since catalog.lookupStatus stays 'not_required' for
    // those). The diagnostic guidance already produced above is kept --
    // this only appends the email request, it never discards it.
    if (state.installedFilter.reference && verifiedNoMatch(catalog) && !state.supportLead.created) {
      state.phase = 'AWAITING_SUPPORT_EMAIL';
      answer = `${answer}\n\nNo encontré una coincidencia verificada para esa referencia en el catálogo ELIMFILTERS. ${SUPPORT_EMAIL_REQUEST}`;
    }
  } else if (['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'application_lookup'].includes(state.intent)) {
    if (verifiedNoMatch(catalog) && !state.supportLead.created) {
      // Never wait for the 5-unresolved-attempts escalation threshold for
      // this specific, definitive case -- ask for the customer's email
      // immediately.
      state.phase = 'AWAITING_SUPPORT_EMAIL';
      answer = `No encontré una coincidencia verificada en el catálogo ELIMFILTERS para esa referencia. ${SUPPORT_EMAIL_REQUEST}`;
    } else if (!catalog.products.length) {
      answer = 'No encontré una equivalencia confirmada en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.';
    } else {
      const lines = catalog.products.map(p => `• ${p.sku}${p.codigo_base ? ` / ${p.codigo_base}` : ''}${p.filter_type ? ` — ${p.filter_type}` : ''}`);
      answer = `Referencia confirmada en la base de datos ELIMFILTERS:\n\n${lines.join('\n')}`;
    }
  } else {
    answer = directAnswer(state.intent, state);
    if (state.intent === 'distribution_inquiry' && !state.distributionQualificationConfirmed) {
      state.distributionQualificationPending = true;
    }
  }

  // Groq only ever rewrites ALREADY-APPROVED technical knowledge — an
  // unapproved/ESCALATE'd pipeline result is never handed to it.
  if (['specification_lookup', 'general', 'support_request'].includes(state.intent) && pipeline.technicalKnowledge) {
    const approvedKnowledge = pipeline.technicalKnowledge.status === 'validated' ? pipeline.technicalKnowledge : null;
    answer = await synthesizeGeneralAnswer(message, state, approvedKnowledge, answer);
  }

  // Track unresolved attempts on server-tracked state only for
  // catalog-relevant intents — governs the 5-attempt human handoff.
  const catalogRelevant = ['diagnostic', 'application_lookup', 'exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup'].includes(state.intent);
  if (catalogRelevant) {
    state.unresolvedAttempts = catalog.products.length > 0 ? 0 : (state.unresolvedAttempts || 0) + 1;
  }

  const governanceResult = finalizeResponseGovernance({ requestId, body, state, catalog, answer, pipeline });
  answer = governanceResult.answer;

  applyPipelineToState(state, pipeline, message);

  const payload = buildPayload({
    requestId, state, answer, classifierSource, catalog,
    knowledge: pipeline.technicalKnowledge, classification, governance: governanceResult.governance
  });
  return finalize({ requestId, key, state, body, payload, memorySource, contextSeedApplied: seededHistory.length > 0 });
}

function buildPayload({ requestId, state, answer, classifierSource, catalog, knowledge, classification, governance }) {
  return {
    protocol_version: PROTOCOL_VERSION,
    request_id: requestId,
    intent: state.intent,
    phase: state.phase,
    // Additive contract fields (camelCase, alongside the existing snake_case
    // ones above/below for backward compatibility -- see
    // docs/CONVERSATION_ENGINE_ARCHITECTURE.md section 7).
    conversationState: state.phase,
    supportLead: {
      status: state.supportLead?.status || null,
      email: state.supportLead?.email || null,
      created: Boolean(state.supportLead?.created)
    },
    state: {
      intent: state.intent,
      phase: state.phase,
      equipment: state.equipment,
      symptoms: state.symptoms,
      duration: state.duration,
      operatingContext: state.operatingContext,
      impact: state.impact,
      installedFilter: state.installedFilter,
      pendingField: state.pendingField,
      validatedProducts: state.validatedProducts,
      conversationHistory: state.conversationHistory,
      unresolvedAttempts: state.unresolvedAttempts,
      supportLead: state.supportLead
    },
    pending_field: state.pendingField,
    evidence: {
      source: 'elimfilters_catalog',
      count: catalog?.products?.length || 0,
      validated: Boolean(catalog?.products?.length),
      lookup_status: catalog?.lookupStatus || 'not_required',
      products: catalog?.products || []
    },
    intelligence: {
      classifier: classifierSource,
      groq_enabled: Boolean(process.env.GROQ_API_KEY),
      knowledge_status: knowledge?.status || 'skipped',
      knowledge_source_count: knowledge?.source_count ?? 0,
      knowledge_conflicts_detected: knowledge?.conflicts_detected ?? false,
      clarification_reason: classification?.clarificationReason || null
    },
    // Public-safe subset only — full evidence/knowledge-gap/source objects
    // (question text, source titles, etc.) are internal and stay out of the
    // client-facing response.
    knowledge_governance: {
      safe_to_publish: governance?.safe_to_publish ?? true,
      technical_source_validated: governance?.technical_source_validated ?? false,
      oem_maintenance_found: governance?.oem_maintenance_found ?? false,
      knowledge_gap_registered: governance?.knowledge_gap_registered ?? false,
      hermes_request_created: governance?.hermes_request_created ?? false,
      sku_validated_in_postgresql: governance?.sku_validated_in_postgresql ?? false,
      authority_violation_count: governance?.authority_violations?.length ?? 0
    },
    answer
  };
}

async function finalize({ key, state, body, payload, memorySource, contextSeedApplied = false }) {
  let finalPayload = applyProtocolGuardrails(payload, body);
  finalPayload = formatForChannel(finalPayload, body);

  const savedSource = await saveMemory(key, state);
  finalPayload.memory = {
    enabled: Boolean(key),
    key_scope: key ? 'channel_conversation' : null,
    memory_source: key ? savedSource : memorySource,
    pending_field: state.pendingField,
    reset: !key,
    // true only on the single call that actually applied an adapter's
    // context_seed (i.e. no memory existed yet for this key). Any repeat
    // delivery of the same context_seed on a later call is a no-op and
    // reports false here -- that's the idempotency guarantee.
    context_seed_applied: contextSeedApplied
  };
  return finalPayload;
}

async function handleBotProtocolRequest(req, res) {
  const startedAt = Date.now();
  try {
    const payload = await runBotProtocol(req.body || {});
    console.info('[bot-conversation-orchestrator]', {
      request_id: payload.request_id,
      intent: payload.intent,
      phase: payload.phase,
      pending_field: payload.pending_field,
      evidence_count: payload.evidence?.count || 0,
      duration_ms: Date.now() - startedAt
    });
    return res.json(payload);
  } catch (error) {
    console.error('[bot-conversation-orchestrator]', { error: error.message, stack: error.stack, duration_ms: Date.now() - startedAt });
    return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
  }
}

module.exports = {
  handleBotProtocolRequest,
  runBotProtocol,
  deterministicClassify,
  classifyWithGroq,
  mergeEntitiesIntoState,
  determineNextAction,
  detectSymptoms,
  extractInstalledFilter,
  buildDiagnosticAssessmentAnswer,
  extractYear,
  extractBrand,
  extractEngine,
  runKnowledgeGovernancePipeline,
  finalizeResponseGovernance,
  applyPipelineToState
};
