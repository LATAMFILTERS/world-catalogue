'use strict';

const crypto = require('crypto');
const { groqChatJson } = require('./bot-protocol-groq');
const { queryKnowledgeEngine } = require('./bot-protocol-knowledge-engine');
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
const { buildUnvalidatedEvidence } = require('./knowledge-governance/technical-evidence-contract');
const { buildSkuAuthorityFromCatalogResult } = require('./knowledge-governance/sku-authority-contract');
const { createKnowledgeGap } = require('./knowledge-governance/knowledge-gap-contract');
const {
  buildResponseGovernance,
  redactUnauthorizedClaims,
  determineSafeToPublish
} = require('./knowledge-governance/response-governance-contract');

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

function buildDiagnosticAssessmentAnswer(state, catalog) {
  const checklist = SAFETY_CHECKLISTS[primarySymptomCode(state)] || SAFETY_CHECKLISTS.default;
  const checklistText = checklist.map((line, index) => `${index + 1}. ${line}`).join('\n');
  const operationText = state.operatingContext ? ` en operación ${state.operatingContext}` : '';
  const intro = `La información apunta a un problema técnico${operationText} que no debe atribuirse únicamente al filtro sin verificación mecánica.`;

  if (state.installedFilter.status === 'unknown') {
    return `${intro}\n\nAcciones recomendadas:\n${checklistText}\n\nNo se pudo validar el filtro instalado en la base de datos ELIMFILTERS porque el cliente no cuenta con la referencia. No asignaré un SKU sin evidencia.`;
  }

  if (!state.installedFilter.reference) {
    return `${intro}\n\nAcciones recomendadas:\n${checklistText}\n\nNo se validó un filtro instalado en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.`;
  }

  if (!catalog || !catalog.products.length) {
    return `${intro}\n\nAcciones recomendadas:\n${checklistText}\n\nNo encontré una equivalencia confirmada para ${state.installedFilter.reference} en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.`;
  }

  const product = catalog.products[0];
  const skuLine = `${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`;
  const finalStep = `${checklist.length + 1}. Sustituir el filtro por ${product.sku} después de confirmar la aplicación exacta del equipo.`;
  return `${intro}\n\nLa referencia instalada (${state.installedFilter.reference}) fue validada en la base de datos ELIMFILTERS. La equivalencia confirmada es:\n\n• ${skuLine}\n\nAcciones recomendadas:\n${checklistText}\n${finalStep}\n\nEsta referencia no confirma por sí sola la causa raíz: complete las verificaciones mecánicas antes de instalar.`;
}

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

function directAnswer(intent) {
  if (intent === 'distribution_inquiry') return 'Para evaluar una oportunidad de distribución necesito país o territorio, tipo de clientes que atendés y experiencia en filtración, flotas o equipos pesados.';
  if (intent === 'commercial_inquiry') return 'Para preparar una cotización necesito el código o la aplicación exacta, la cantidad requerida y el país o ciudad de entrega.';
  if (intent === 'support_request') return 'Describí el equipo, el problema y cualquier código o referencia disponible. Con esos datos puedo iniciar la revisión técnica.';
  return 'Indicá qué necesitás revisar: una aplicación, una equivalencia, una especificación, un diagnóstico técnico o información comercial.';
}

function shouldUseKnowledge(intent, phase) {
  if (phase === 'collecting_diagnostic_data' || phase === 'collecting_application_data') return false;
  return ['diagnostic', 'specification_lookup', 'general', 'support_request'].includes(intent);
}

async function synthesizeGeneralAnswer(message, state, knowledge, deterministicAnswer) {
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
        knowledge_answer: knowledge?.answer || null,
        knowledge_citations: knowledge?.citations || []
      })
    }
  ], { maxTokens: 700, temperature: 0.1, timeoutMs: 6500 });

  return typeof result?.answer === 'string' && result.answer.trim() ? result.answer.trim() : deterministicAnswer;
}

// ── Top-level orchestration ─────────────────────────────────────────────────

async function runBotProtocol(body) {
  const requestId = crypto.randomUUID();
  const message = String(body.message || '').trim();
  const key = memoryKey(body);
  const { state: loaded, source: memorySource } = await loadMemory(key);

  // c. greeting / reset detection
  const greeting = isStandaloneGreeting(message);
  let state = greeting ? createEmptyState() : loaded;
  if (!greeting && isNewDiagnosticStart(message, state)) state = resetDiagnosticState(state);

  if (greeting) {
    const payload = buildPayload({
      requestId, state: { ...createEmptyState(), intent: 'greeting', phase: 'conversation_start' },
      answer: 'Hola. ¿En qué equipo o sistema necesitás ayuda? Podés indicar marca, modelo, motor, año y el problema que presenta.',
      classifierSource: 'deterministic', catalog: { products: [], lookupStatus: 'not_required' }, knowledge: { status: 'skipped' }
    });
    return finalize({ requestId, key, state: createEmptyState(), body, payload, memorySource });
  }

  // d/e. Groq classify with deterministic fallback
  let classification = await classifyWithGroq(message, state);
  let classifierSource = 'groq';
  if (!classification) {
    classification = deterministicClassify(message, state);
    classifierSource = 'deterministic';
  }

  // f. merge entities with memory
  state = mergeEntitiesIntoState(state, classification, message);

  // g. determine next action
  const action = determineNextAction(state);
  state.pendingField = action.pendingField;
  state.phase = action.phase;

  // h/i. Knowledge Engine + Postgres (only when the state machine says we're ready)
  let knowledge = { status: 'skipped', answer: null, citations: [] };
  let catalog = { products: [], lookupStatus: 'not_required' };

  if (!action.pendingField) {
    catalog = await runCatalogQuery(state, classification);
    if (catalog.products.length) state.validatedProducts = catalog.products;
  }

  let answer;
  if (action.pendingField) {
    answer = action.question;
  } else if (state.intent === 'diagnostic') {
    answer = buildDiagnosticAssessmentAnswer(state, catalog);
  } else if (['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'application_lookup'].includes(state.intent)) {
    if (!catalog.products.length) {
      answer = 'No encontré una equivalencia confirmada en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.';
    } else {
      const lines = catalog.products.map(p => `• ${p.sku}${p.codigo_base ? ` / ${p.codigo_base}` : ''}${p.filter_type ? ` — ${p.filter_type}` : ''}`);
      answer = `Referencia confirmada en la base de datos ELIMFILTERS:\n\n${lines.join('\n')}`;
    }
  } else {
    answer = directAnswer(state.intent);
  }

  if (shouldUseKnowledge(state.intent, state.phase)) {
    knowledge = await queryKnowledgeEngine(message, body, state);
    answer = await synthesizeGeneralAnswer(message, state, knowledge, answer);
  }

  // Track unresolved attempts on server-tracked state only for
  // catalog-relevant intents — governs the 5-attempt human handoff.
  const catalogRelevant = ['diagnostic', 'application_lookup', 'exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup'].includes(state.intent);
  if (catalogRelevant) {
    state.unresolvedAttempts = catalog.products.length > 0 ? 0 : (state.unresolvedAttempts || 0) + 1;
  }

  const governanceResult = applyKnowledgeGovernance({ requestId, body, state, catalog, knowledge, answer });
  answer = governanceResult.answer;

  const payload = buildPayload({ requestId, state, answer, classifierSource, catalog, knowledge, classification, governance: governanceResult.governance });
  return finalize({ requestId, key, state, body, payload, memorySource });
}

// Builds the response_governance object for this turn (Bloque 1: contracts +
// enforcement only — no real HERMES calls, no Obsidian writes). The Knowledge
// Engine Runtime consulted above is NOT yet an Obsidian-authorized source, so
// technical_source_validated stays false until a real Obsidian pipeline
// exists; this step's job in this phase is purely defensive — stripping any
// SKU or OEM-interval claim that slipped into the free-text answer without
// going through PostgreSQL/Obsidian, and registering a knowledge gap when a
// diagnostic reaches assessment with no approved technical evidence behind it.
function applyKnowledgeGovernance({ requestId, body, state, catalog, knowledge, answer }) {
  const skuAuthority = buildSkuAuthorityFromCatalogResult(catalog, {
    queryType: state.intent === 'application_lookup' ? 'application' : 'exact_reference',
    inputReference: state.installedFilter?.reference || null,
    equipment: state.equipment
  });

  const technicalEvidence = knowledge?.answer
    ? buildUnvalidatedEvidence({
      extracted_statement: knowledge.answer,
      equipment: state.equipment,
      system: state.symptoms.find(s => s.system)?.system || null
    })
    : null;

  let knowledgeGap = null;
  if (state.intent === 'diagnostic' && state.phase === 'diagnostic_assessment' && !technicalEvidence) {
    knowledgeGap = createKnowledgeGap({
      request_type: 'oem_maintenance_interval',
      origin: 'bot_orchestrator',
      equipment: state.equipment,
      system: state.symptoms.find(s => s.system)?.system || null,
      question: state.conversationHistory[state.conversationHistory.length - 1] || '',
      reason: 'diagnostic reached assessment without Obsidian-approved technical evidence',
      requested_by: 'bot_orchestrator',
      conversation_id: body.conversation_id || body.user_id || body.contact_id || null,
      channel: body.channel || null,
      priority: 'medium'
    });
  }

  const governance = buildResponseGovernance({
    technicalEvidence,
    oemMaintenance: null, // no OEM interval contract flows through the bot yet in this phase
    knowledgeGap,
    hermesRequestId: null, // no real HERMES requests are made in this phase
    skuAuthority
  });

  const redacted = redactUnauthorizedClaims(answer, governance);
  governance.authority_violations = [...governance.authority_violations, ...redacted.violations];
  governance.safe_to_publish = determineSafeToPublish(governance);

  console.info('[knowledge-governance]', {
    request_id: requestId,
    conversation_id: body.conversation_id || body.user_id || body.contact_id || null,
    technical_source_validated: governance.technical_source_validated,
    knowledge_gap_registered: governance.knowledge_gap_registered,
    hermes_request_created: governance.hermes_request_created,
    sku_validated_in_postgresql: governance.sku_validated_in_postgresql,
    authority_violation_count: governance.authority_violations.length,
    safe_to_publish: governance.safe_to_publish
  });

  return { answer: redacted.text, governance };
}

function buildPayload({ requestId, state, answer, classifierSource, catalog, knowledge, classification, governance }) {
  return {
    protocol_version: PROTOCOL_VERSION,
    request_id: requestId,
    intent: state.intent,
    phase: state.phase,
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
      unresolvedAttempts: state.unresolvedAttempts
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
      knowledge_confidence: knowledge?.confidence ?? null,
      citations: knowledge?.citations || [],
      clarification_reason: classification?.clarificationReason || null
    },
    // Public-safe subset only — full evidence/knowledge-gap/source objects
    // (question text, source titles, etc.) are internal and stay out of the
    // client-facing response.
    knowledge_governance: {
      safe_to_publish: governance?.safe_to_publish ?? true,
      technical_source_validated: governance?.technical_source_validated ?? false,
      knowledge_gap_registered: governance?.knowledge_gap_registered ?? false,
      sku_validated_in_postgresql: governance?.sku_validated_in_postgresql ?? false,
      authority_violation_count: governance?.authority_violations?.length ?? 0
    },
    answer
  };
}

async function finalize({ key, state, body, payload, memorySource }) {
  let finalPayload = applyProtocolGuardrails(payload, body);
  finalPayload = formatForChannel(finalPayload, body);

  const savedSource = await saveMemory(key, state);
  finalPayload.memory = {
    enabled: Boolean(key),
    key_scope: key ? 'channel_conversation' : null,
    memory_source: key ? savedSource : memorySource,
    pending_field: state.pendingField,
    reset: !key
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
  extractEngine
};
