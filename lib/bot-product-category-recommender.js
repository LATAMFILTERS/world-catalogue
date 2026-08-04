'use strict';

// Pure product-category recommendation engine (Bloque 2, spec section 7).
// Recommends an ELIMFILTERS *category* (never a SKU — that authority stays
// with lib/knowledge-governance/sku-authority-contract.js / PostgreSQL) for
// the system/symptom combination already identified by the orchestrator.
// No I/O, no database access, no network calls.

const CATEGORY_MAP = Object.freeze({
  air_intake: Object.freeze(['air_filter_primary', 'air_filter_secondary', 'cabin_filter']),
  fuel: Object.freeze(['fuel_filter', 'fuel_water_separator']),
  lubrication: Object.freeze(['oil_filter']),
  hydraulic: Object.freeze(['hydraulic_filter']),
  cooling: Object.freeze(['coolant_filter']),
  air_dryer: Object.freeze(['air_dryer_cartridge'])
});

function pushCategory(list, entry) {
  if (!entry) return;
  if (list.some(c => c.system === entry.system && c.category === entry.category)) return;
  list.push(entry);
}

// One recommendation set per detected symptom code. Deliberately
// conservative: a symptom that doesn't map to a clear, safe category
// recommendation contributes nothing rather than guessing.
function recommendForSymptom(symptomCode, { installedFilter = {} } = {}) {
  const categories = [];

  switch (symptomCode) {
    case 'water_in_fuel':
      pushCategory(categories, {
        system: 'fuel', category: 'fuel_water_separator', priority: 'primary', conditional: false,
        reason: 'Contaminación por agua detectada en el sistema de combustible: el separador agua-combustible es la primera línea de protección.'
      });
      pushCategory(categories, {
        system: 'fuel', category: 'fuel_filter', priority: 'secondary', conditional: false,
        reason: 'El filtro de combustible debe evaluarse junto con el separador tras un evento de contaminación por agua.'
      });
      break;

    case 'water_in_oil':
      // Never a filter-as-fix: only after the mechanical repair (head
      // gasket, oil cooler) and the corresponding oil change.
      pushCategory(categories, {
        system: 'lubrication', category: 'oil_filter', priority: 'secondary', conditional: true,
        reason: 'No corresponde reemplazar el filtro como reparación. Después de corregir la causa mecánica (empaque de culata, enfriador de aceite) y realizar el cambio de aceite, corresponde reemplazar el filtro de aceite.'
      });
      break;

    case 'water_in_hydraulic':
      pushCategory(categories, {
        system: 'hydraulic', category: 'hydraulic_filter', priority: 'primary', conditional: true,
        reason: 'Contaminación por agua en el sistema hidráulico: el reemplazo del filtro está condicionado a la limpieza o reparación del circuito y a la ubicación exacta del punto de ingreso.'
      });
      break;

    case 'water_in_coolant':
      pushCategory(categories, {
        system: 'cooling', category: 'coolant_filter', priority: 'secondary', conditional: true,
        reason: 'Contaminación relacionada con el sistema de refrigerante: evaluar el filtro de refrigerante junto con la causa de la contaminación.'
      });
      break;

    case 'water_in_air':
    case 'restriction':
      pushCategory(categories, {
        system: 'air_intake', category: 'air_filter_primary', priority: 'primary', conditional: false,
        reason: 'Restricción o contaminación detectada en el sistema de admisión de aire: el elemento primario es el punto de partida.'
      });
      if (installedFilter.status !== 'unknown') {
        pushCategory(categories, {
          system: 'air_intake', category: 'air_filter_secondary', priority: 'secondary', conditional: true,
          reason: 'El elemento secundario solo aplica si la configuración del equipo lo utiliza; confirmar antes de recomendar.'
        });
      }
      break;

    case 'pressure_loss':
      pushCategory(categories, {
        system: 'lubrication', category: 'oil_filter', priority: 'primary', conditional: true,
        reason: 'Caída de presión de aceite: el filtro de aceite debe evaluarse junto con la válvula reguladora y el estado del aceite, no como causa aislada.'
      });
      break;

    case 'high_consumption':
      pushCategory(categories, {
        system: 'fuel', category: 'fuel_filter', priority: 'secondary', conditional: true,
        reason: 'El alto consumo de combustible puede asociarse a restricción en el filtro de combustible.'
      });
      break;

    case 'black_smoke':
      pushCategory(categories, {
        system: 'air_intake', category: 'air_filter_primary', priority: 'secondary', conditional: true,
        reason: 'El humo negro puede indicar mezcla rica por restricción de aire; revisar el filtro de aire primario.'
      });
      break;

    default:
      break;
  }

  return categories;
}

// recommendCategories({ intent, equipment, system, symptoms, probableCause,
//   installedFilter, operatingContext, technicalEvidence, oemMaintenance })
//   -> { status: 'recommended' | 'insufficient_data' | 'not_applicable', categories }
function recommendCategories({
  intent = null,
  equipment = {},
  system = null,
  symptoms = [],
  installedFilter = {}
} = {}) {
  if (intent && !['diagnostic', 'application_lookup'].includes(intent)) {
    return { status: 'not_applicable', categories: [] };
  }

  const categories = [];
  for (const symptom of Array.isArray(symptoms) ? symptoms : []) {
    const code = typeof symptom === 'string' ? symptom : symptom?.code;
    for (const entry of recommendForSymptom(code, { installedFilter })) pushCategory(categories, entry);
  }

  // A bare system mention with no matched symptom still gives a starting
  // point — never invented, always tagged conditional.
  if (!categories.length && system && CATEGORY_MAP[system]) {
    pushCategory(categories, {
      system,
      category: CATEGORY_MAP[system][0],
      priority: 'primary',
      conditional: true,
      reason: `Sistema ${system} identificado sin síntoma específico confirmado: se recomienda evaluar el elemento principal de este sistema.`
    });
  }

  if (!categories.length) {
    return { status: 'insufficient_data', categories: [] };
  }

  return { status: 'recommended', categories };
}

module.exports = { CATEGORY_MAP, recommendForSymptom, recommendCategories };
