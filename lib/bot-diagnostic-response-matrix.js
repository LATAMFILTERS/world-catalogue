'use strict';

const DIAGNOSTIC_MATRIX = Object.freeze({
  power_loss: {
    label: 'pérdida de potencia',
    pending: {
      duration: 'Para separar una restricción progresiva de una falla repentina, necesito saber desde cuándo comenzó la pérdida de potencia y si apareció de golpe o fue empeorando.',
      operatingContext: '¿La pérdida aparece principalmente al acelerar bajo carga o en subida, a velocidad sostenida, o también con el vehículo sin carga? Indica además si el uso es principalmente carretera, transporte/flota u otra operación.',
      installedFilter: 'Para validar la parte de filtración sin cambiar piezas por descarte, necesito la marca y referencia del filtro de aire y/o combustible instalado. Si no la tienes, indícalo y seguimos por condición de operación.'
    },
    assessment: 'Una pérdida de potencia al acelerar debe evaluarse primero como un problema de flujo y demanda del motor. Los frentes principales son restricción de admisión, suministro de combustible, sensores/gestión electrónica y, según la aplicación, escape o sobrealimentación. Un filtro puede contribuir, pero no debe asumirse como causa sin evidencia.',
    checks: [
      'Revisar si la pérdida aparece solo bajo carga, subida o aceleración fuerte.',
      'Comprobar restricción de admisión y condición del elemento de aire antes de reemplazarlo.',
      'Verificar suministro y presión de combustible de acuerdo con el procedimiento del fabricante.',
      'Leer códigos de falla y revisar señales asociadas antes de sustituir componentes.'
    ],
    commercial: 'Si la revisión apunta a filtración, ELIMFILTERS puede validar la aplicación y seleccionar la solución adecuada según el sistema y la condición real de operación, no solo por cruce de referencia.'
  },
  pressure_loss: {
    label: 'pérdida de presión',
    pending: {
      duration: '¿Desde cuándo aparece la caída de presión y ocurre en frío, en caliente o bajo carga?',
      operatingContext: 'Indica el tipo de operación y cuándo cae la presión: ralentí caliente, aceleración, carga continua u otra condición.',
      installedFilter: 'Necesito la referencia del filtro instalado para validar restricción, bypass y compatibilidad de aplicación antes de atribuirle la caída de presión.'
    },
    assessment: 'Una caída de presión requiere separar primero condición del fluido, restricción, regulación y desgaste del sistema. Cambiar un filtro sin confirmar presión real puede ocultar la causa.',
    checks: [
      'Confirmar nivel, condición y especificación del fluido.',
      'Medir presión real en los puntos y condiciones de operación relevantes.',
      'Revisar restricción, bypass y contaminación.',
      'Descartar regulación defectuosa o desgaste interno.'
    ],
    commercial: 'Con la aplicación y la condición de trabajo confirmadas, ELIMFILTERS puede revisar la arquitectura de filtración y la selección del elemento adecuado.'
  },
  hard_start: {
    label: 'dificultad de arranque',
    pending: {
      duration: '¿Desde cuándo cuesta arrancar y sucede más en frío, después de varias horas detenido o también con el motor caliente?',
      operatingContext: 'Indica la operación habitual y si el problema aparece después de permanecer detenido, luego de repostar o durante jornadas largas.',
      installedFilter: 'Necesito la referencia del filtro de combustible instalado para descartar una aplicación incorrecta o una restricción antes de recomendar reemplazo.'
    },
    assessment: 'Un arranque difícil puede relacionarse con suministro de combustible, entrada de aire al circuito, presión, batería/arranque o gestión electrónica. La filtración es una de las variables, no la única.',
    checks: [
      'Revisar presión y cebado del circuito de combustible.',
      'Buscar entrada de aire, fugas o pérdida de cebado.',
      'Confirmar condición del filtro y presencia de contaminación.',
      'Revisar códigos de falla y condición del sistema de arranque.'
    ],
    commercial: 'Si el circuito de combustible resulta involucrado, ELIMFILTERS puede validar la aplicación y la estrategia de protección correspondiente.'
  },
  engine_stall: {
    label: 'apagado del motor',
    pending: {
      duration: '¿Desde cuándo se apaga y ocurre al ralentí, al acelerar, bajo carga o después de calentarse?',
      operatingContext: 'Indica en qué condición de trabajo se presenta el apagado y si vuelve a arrancar inmediatamente.',
      installedFilter: 'Si tienes la referencia del filtro instalado, compártela para validar la aplicación sin asumir que el elemento sea la causa.'
    },
    assessment: 'Un apagado requiere revisar continuidad de combustible, señal eléctrica/electrónica y condiciones de protección del motor. Debe evitarse sustituir filtros por descarte.',
    checks: [
      'Verificar presión y continuidad del suministro de combustible.',
      'Revisar códigos de falla y señales de sensores críticos.',
      'Comprobar restricción y contaminación en el sistema de filtración.',
      'Confirmar si existe una condición térmica o eléctrica asociada.'
    ],
    commercial: 'ELIMFILTERS puede intervenir en la validación del sistema de filtración una vez que la evidencia indique que ese frente debe corregirse.'
  },
  black_smoke: {
    label: 'humo negro',
    pending: {
      duration: '¿Desde cuándo aparece el humo negro y ocurre al acelerar, bajo carga o de forma permanente?',
      operatingContext: 'Indica la condición de operación donde aparece: aceleración fuerte, subida, carga sostenida u otra.',
      installedFilter: 'Comparte la referencia del filtro de aire instalado para validar capacidad y aplicación antes de relacionarlo con la restricción de admisión.'
    },
    assessment: 'Humo negro normalmente exige revisar la relación aire-combustible. La admisión restringida es una posibilidad, pero también deben considerarse inyección, sensores y sobrealimentación cuando aplique.',
    checks: [
      'Medir o verificar restricción de admisión.',
      'Inspeccionar ductos, sellos y elemento de aire.',
      'Revisar inyección y códigos de falla.',
      'Confirmar operación de sobrealimentación cuando exista.'
    ],
    commercial: 'Si se confirma restricción o capacidad insuficiente, ELIMFILTERS puede revisar la solución de admisión con base en el caudal y el entorno de trabajo.'
  },
  high_consumption: {
    label: 'consumo elevado',
    pending: {
      duration: '¿Desde cuándo aumentó el consumo y el cambio fue repentino o gradual?',
      operatingContext: 'Indica si cambió la ruta, carga, velocidad promedio o condición de operación cuando empezó el aumento de consumo.',
      installedFilter: 'Si tienes las referencias de los filtros de aire y combustible instalados, compártelas para validar aplicación y condición de servicio.'
    },
    assessment: 'El aumento de consumo debe analizarse contra carga, ruta, condición mecánica, admisión, combustible y gestión electrónica. La filtración puede afectar eficiencia si existe restricción o aplicación incorrecta.',
    checks: [
      'Comparar consumo bajo condiciones de operación equivalentes.',
      'Revisar restricción de admisión y condición de combustible.',
      'Verificar códigos de falla y parámetros de operación.',
      'Descartar cambios de carga, ruta o hábitos de conducción.'
    ],
    commercial: 'ELIMFILTERS puede revisar la selección de filtración dentro de un análisis de protección y eficiencia del activo, sin reducir el problema a un simple cambio de filtro.'
  },
  restriction: {
    label: 'restricción',
    pending: {
      duration: '¿Desde cuándo aparece la restricción y cómo fue detectada: indicador, medición de presión diferencial o pérdida de rendimiento?',
      operatingContext: 'Indica el ambiente y la condición de trabajo donde aumenta la restricción.',
      installedFilter: 'Comparte la referencia del elemento instalado para validar capacidad, dimensiones y aplicación.'
    },
    assessment: 'Una restricción debe confirmarse por medición o evidencia operacional. El objetivo es determinar si proviene del elemento, del housing, de ductos/líneas o de una selección insuficiente para el duty cycle.',
    checks: [
      'Confirmar la restricción con el método de medición aplicable.',
      'Inspeccionar elemento, housing, ductos o líneas.',
      'Revisar sellado y contaminación acumulada.',
      'Comparar capacidad del sistema con el duty cycle real.'
    ],
    commercial: 'Con esos datos, ELIMFILTERS puede revisar capacidad y arquitectura para evitar reemplazos prematuros o pérdida de rendimiento.'
  },
  contamination: {
    label: 'contaminación',
    pending: {
      duration: '¿Desde cuándo detectas contaminación y cómo fue observada: inspección, análisis de fluido, sedimento o falla recurrente?',
      operatingContext: 'Indica el ambiente de trabajo y cualquier condición que pueda aumentar el ingreso de contaminantes.',
      installedFilter: 'Necesito la referencia del filtro instalado y, si existe, el resultado del análisis de contaminación para revisar la estrategia de control.'
    },
    assessment: 'La contaminación debe tratarse como un problema de ingreso, generación y remoción. Cambiar el elemento sin localizar la fuente suele producir recurrencia.',
    checks: [
      'Identificar tipo y fuente probable del contaminante.',
      'Revisar sellos, respiraderos, tanques y puntos de ingreso.',
      'Confirmar capacidad y eficiencia del sistema de filtración.',
      'Verificar prácticas de servicio y manejo de fluidos.'
    ],
    commercial: 'ELIMFILTERS puede revisar la estrategia completa de control de contaminación y la selección del sistema de protección del activo.'
  }
});

const WATER_PROFILE = Object.freeze({
  label: 'presencia de agua',
  pending: {
    symptom_system: 'Para evaluar correctamente el riesgo necesito ubicar el agua: ¿está en combustible, aceite, refrigerante, hidráulico o en el sistema de aire?',
    duration: '¿Desde cuándo detectas agua y fue un evento puntual o vuelve a aparecer después de drenar o dar servicio?',
    operatingContext: 'Indica la operación y las condiciones donde aparece con mayor frecuencia: humedad, almacenamiento, repostaje, trabajo continuo u otra.',
    installedFilter: 'Comparte la referencia del elemento o separador instalado para validar capacidad de separación y aplicación.'
  },
  assessment: 'La presencia de agua debe tratarse primero identificando el sistema y la fuente de ingreso. La acción correcta cambia completamente entre combustible, lubricación, hidráulico, refrigeración y aire comprimido.',
  checks: [
    'Confirmar en qué sistema está presente el agua.',
    'Localizar la fuente de ingreso o condensación.',
    'Evaluar capacidad de separación o control de humedad.',
    'Corregir la causa antes de limitarse a reemplazar elementos.'
  ],
  commercial: 'Una vez identificado el sistema, ELIMFILTERS puede revisar la solución de separación o filtración adecuada para proteger los componentes críticos.'
});

function primarySymptom(state) {
  const symptoms = Array.isArray(state?.symptoms) ? state.symptoms : [];
  const priority = ['pressure_loss', 'water_in_fuel', 'water_in_oil', 'water_in_hydraulic', 'water_in_air', 'water_in_coolant', 'power_loss', 'hard_start', 'engine_stall', 'black_smoke', 'high_consumption', 'restriction', 'contamination'];
  return priority.find(code => symptoms.some(item => item?.code === code)) || symptoms[0]?.code || null;
}

function profileFor(code) {
  if (!code) return null;
  if (code.startsWith('water_')) return WATER_PROFILE;
  return DIAGNOSTIC_MATRIX[code] || null;
}

function buildTechnicalCommercialAssessment(profile, state) {
  const equipment = [state?.equipment?.brand, state?.equipment?.model, state?.equipment?.year].filter(Boolean).join(' ');
  const heading = equipment ? `Evaluación técnica — ${equipment}` : 'Evaluación técnica';
  const checks = profile.checks.map((item, index) => `${index + 1}. ${item}`).join('\n');
  return `${heading}\n\n${profile.assessment}\n\nQué revisar primero:\n${checks}\n\n${profile.commercial}`;
}

function applyDiagnosticResponseMatrix(canonical) {
  if (!canonical || canonical.intent !== 'diagnostic') return canonical;
  const state = canonical.state || {};
  const code = primarySymptom(state);
  const profile = profileFor(code);
  if (!profile) return canonical;

  const pending = canonical.pending_field || state.pendingField || null;
  if (pending && profile.pending[pending]) {
    canonical.answer = profile.pending[pending];
  } else if (!pending && canonical.phase === 'diagnostic_assessment') {
    canonical.answer = buildTechnicalCommercialAssessment(profile, state);
  }

  canonical.diagnostic_matrix = {
    applied: true,
    symptom: code,
    criterion: profile.label
  };
  return canonical;
}

module.exports = {
  DIAGNOSTIC_MATRIX,
  primarySymptom,
  applyDiagnosticResponseMatrix
};
