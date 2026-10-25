'use client';
import { useTranslation } from 'react-i18next';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';

// Scoped editorial fallbacks for MACROCORE headings whose generated reviewed-copy keys
// are not present in the published ES/PT translation bundles.
const MACROCORE_HEADINGS: Record<string, [string, string]> = {
  "FILTRATION TECHNOLOGY": [
    "TECNOLOGÍA DE FILTRACIÓN",
    "TECNOLOGIA DE FILTRAÇÃO"
  ],
  "DESCRIPTION": [
    "DESCRIPCIÓN",
    "DESCRIÇÃO"
  ],
  "Protecting engines begins at the clean-air boundary": [
    "La protección del motor comienza en el límite del aire limpio",
    "A proteção do motor começa na fronteira do ar limpo"
  ],
  "Fine-fiber capture": [
    "Captura mediante fibras finas",
    "Captura por fibras finas"
  ],
  "Surface-oriented loading": [
    "Retención superficial de partículas",
    "Retenção superficial de partículas"
  ],
  "Depth loading": [
    "Retención de partículas en profundidad",
    "Retenção de partículas em profundidade"
  ],
  "Restriction control": [
    "Control de restricción",
    "Controle da restrição"
  ],
  "OPERATING REALITY": [
    "REALIDAD OPERATIVA",
    "REALIDADE OPERACIONAL"
  ],
  "Dust ingestion is an asset-protection risk, not just a filter-maintenance issue.": [
    "La entrada de polvo compromete la protección del activo, no solo el mantenimiento del filtro.",
    "A entrada de poeira compromete a proteção do ativo, não apenas a manutenção do filtro."
  ],
  "A useful distinction": [
    "Una distinción importante",
    "Uma distinção importante"
  ],
  "Primary contaminant: airborne particulate": [
    "Contaminante principal: partículas suspendidas en el aire",
    "Contaminante principal: partículas suspensas no ar"
  ],
  "APPLICATION ENVIRONMENT": [
    "ENTORNO DE APLICACIÓN",
    "AMBIENTE DE APLICAÇÃO"
  ],
  "Where intake contamination threatens equipment availability": [
    "Dónde la contaminación de admisión amenaza la disponibilidad del equipo",
    "Onde a contaminação da admissão ameaça a disponibilidade do equipamento"
  ],
  "Application positions": [
    "Posiciones de aplicación",
    "Posições de aplicação"
  ],
  "Operating conditions that change filter duty": [
    "Condiciones que modifican la exigencia del filtro",
    "Condições que alteram a exigência do filtro"
  ],
  "Operational risk environments": [
    "Entornos de riesgo operativo",
    "Ambientes de risco operacional"
  ],
  "SPECIFICATION & SELECTION": [
    "ESPECIFICACIÓN Y SELECCIÓN",
    "ESPECIFICAÇÃO E SELEÇÃO"
  ],
  "Engineering checks before approving an engine-air filter": [
    "Verificaciones de ingeniería antes de aprobar un filtro de aire del motor",
    "Verificações de engenharia antes de aprovar um filtro de ar do motor"
  ],
  "Key engineering parameters": [
    "Parámetros fundamentales de ingeniería",
    "Parâmetros fundamentais de engenharia"
  ],
  "Common selection errors": [
    "Errores frecuentes de selección",
    "Erros frequentes de seleção"
  ],
  "Application validation": [
    "Validación de la aplicación",
    "Validação da aplicação"
  ],
  "HOW THE SYSTEM BEHAVES": [
    "FUNCIONAMIENTO DEL SISTEMA",
    "COMPORTAMENTO DO SISTEMA"
  ],
  "Primary filtration, safety elements and housing integrity form one protection boundary.": [
    "Filtración primaria, elementos de seguridad e integridad de la carcasa forman una misma barrera de protección.",
    "Filtração primária, elementos de segurança e integridade da carcaça formam uma única barreira de proteção."
  ],
  "Primary stage": [
    "Etapa primaria",
    "Etapa primária"
  ],
  "Secondary protection": [
    "Protección secundaria",
    "Proteção secundária"
  ],
  "Clean-air boundary": [
    "Barrera del aire limpio",
    "Barreira do ar limpo"
  ],
  "Protected assets": [
    "Activos protegidos",
    "Ativos protegidos"
  ],
  "SERVICE & DIAGNOSIS": [
    "SERVICIO Y DIAGNÓSTICO",
    "MANUTENÇÃO E DIAGNÓSTICO"
  ],
  "Diagnose the intake system before replacing filters repeatedly": [
    "Diagnostique el sistema de admisión antes de sustituir filtros repetidamente",
    "Diagnostique o sistema de admissão antes de substituir filtros repetidamente"
  ],
  "QUESTIONS FROM THE FIELD": [
    "PREGUNTAS DESDE EL CAMPO",
    "PERGUNTAS DE CAMPO"
  ],
  "Direct answers to common engine-air filtration questions.": [
    "Respuestas directas sobre filtración de aire del motor.",
    "Respostas diretas sobre filtração de ar do motor."
  ],
  "TECHNICAL BASIS": [
    "BASE TÉCNICA",
    "BASE TÉCNICA"
  ],
  "Technical reference": [
    "Referencia técnica",
    "Referência técnica"
  ],
  "ISO 5011 context": [
    "Contexto de ISO 5011",
    "Contexto da ISO 5011"
  ],
  "Claim governance": [
    "Control de afirmaciones técnicas",
    "Controle das afirmações técnicas"
  ],
  "WHEN A TECHNICAL REVIEW MAKES SENSE": [
    "CUÁNDO SOLICITAR UNA REVISIÓN TÉCNICA",
    "QUANDO SOLICITAR UMA AVALIAÇÃO TÉCNICA"
  ],
  "When intake contamination becomes a fleet reliability problem": [
    "Cuando la contaminación de admisión afecta la confiabilidad de la flota",
    "Quando a contaminação da admissão afeta a confiabilidade da frota"
  ],
  "SYSTEM INTEGRATION": [
    "INTEGRACIÓN DEL SISTEMA",
    "INTEGRAÇÃO DO SISTEMA"
  ],
  "Air Intake & Airflow Protection": [
    "Protección de admisión y flujo de aire",
    "Proteção da admissão e do fluxo de ar"
  ],
  "APPLICATION SUPPORT": [
    "ASISTENCIA PARA APLICACIONES",
    "SUPORTE À APLICAÇÃO"
  ],
  "Specify the operating duty and protection requirement—not only the filter reference.": [
    "Especifique el ciclo de trabajo y la protección requerida, no solo la referencia del filtro.",
    "Especifique o regime de operação e a proteção necessária, não apenas a referência do filtro."
  ],
  "EXPLORE RELATED TECHNOLOGIES": [
    "EXPLORE TECNOLOGÍAS RELACIONADAS",
    "EXPLORE TECNOLOGIAS RELACIONADAS"
  ],
  "Explore related protection technologies and principles.": [
    "Explore tecnologías y principios de protección relacionados.",
    "Explore tecnologias e princípios de proteção relacionados."
  ],
  "Protection Systems": [
    "Sistemas de protección",
    "Sistemas de proteção"
  ],
  "Industries": [
    "Industrias",
    "Indústrias"
  ],
  "Knowledge System": [
    "Sistema de conocimiento",
    "Sistema de conhecimento"
  ]
};


const TECHNOLOGY_HEADINGS: Record<string, [string, string]> = {
  "Fuel particulate control for precision injection-system protection": [
    "Control de partículas en combustible para proteger sistemas de inyección de precisión",
    "Controle de partículas no combustível para proteger sistemas de injeção de precisão"
  ],
  "Diesel fuel cleanliness is a precision-component protection requirement.": [
    "La limpieza del diésel es esencial para proteger los componentes de precisión.",
    "A limpeza do diesel é essencial para proteger os componentes de precisão."
  ],
  "Lubricant cleanliness engineering for wear-sensitive components": [
    "Ingeniería de limpieza del lubricante para componentes sensibles al desgaste",
    "Engenharia de limpeza do lubrificante para componentes sensíveis ao desgaste"
  ],
  "Contaminated lubricant can accelerate wear at critical engine interfaces.": [
    "El lubricante contaminado puede acelerar el desgaste en interfaces críticas del motor.",
    "O lubrificante contaminado pode acelerar o desgaste em interfaces críticas do motor."
  ],
  "Hydraulic cleanliness control for precision pumps, valves and actuators": [
    "Control de limpieza hidráulica para bombas, válvulas y actuadores de precisión",
    "Controle da limpeza hidráulica para bombas, válvulas e atuadores de precisão"
  ],
  "Hydraulic reliability depends on controlling particles at precision clearances.": [
    "La confiabilidad hidráulica exige controlar partículas en holguras de precisión.",
    "A confiabilidade hidráulica exige controlar partículas em folgas de precisão."
  ],
  "Cooling-circuit contamination control and coolant compatibility": [
    "Control de contaminación del circuito de refrigeración y compatibilidad del refrigerante",
    "Controle de contaminação do circuito de arrefecimento e compatibilidade do fluido"
  ],
  "Cooling-circuit deposits, corrosion and coolant condition can compromise asset reliability.": [
    "Los depósitos, la corrosión y el estado del refrigerante pueden comprometer la confiabilidad del activo.",
    "Depósitos, corrosão e condição do fluido de arrefecimento podem comprometer a confiabilidade do ativo."
  ],
  "Compressed-air moisture control for pneumatic component reliability": [
    "Control de humedad del aire comprimido para la confiabilidad neumática",
    "Controle de umidade do ar comprimido para a confiabilidade pneumática"
  ],
  "Pneumatic moisture exposure depends on compressor duty, temperature and purge performance.": [
    "La exposición a humedad depende del ciclo del compresor, la temperatura y la purga.",
    "A exposição à umidade depende do regime do compressor, da temperatura e da purga."
  ],
  "Engine intake housing integrity, airflow routing and bypass prevention": [
    "Integridad de carcasa, flujo de aire y prevención de derivaciones en admisión",
    "Integridade da carcaça, fluxo de ar e prevenção de desvio na admissão"
  ],
  "Even high-efficiency media cannot protect an engine when intake seals or housings permit bypass.": [
    "Ni un medio de alta eficiencia protege el motor si las juntas o la carcasa permiten el paso de aire sin filtrar.",
    "Nem um meio de alta eficiência protege o motor se vedações ou carcaças permitirem a passagem de ar não filtrado."
  ],
  "Cabin particulate control balanced with HVAC airflow": [
    "Control de partículas en cabina equilibrado con el caudal de climatización",
    "Controle de partículas da cabine equilibrado com o fluxo do sistema HVAC"
  ],
  "Cabin-air protection must balance particulate capture with HVAC airflow and pressure drop.": [
    "La protección del aire de cabina exige equilibrar captura de partículas, caudal y pérdida de presión.",
    "A proteção do ar da cabine exige equilibrar captura de partículas, vazão e perda de pressão."
  ],
  "Where SYNTAPORE™ belongs": [
    "Aplicaciones de SYNTAPORE™",
    "Aplicações da SYNTAPORE™"
  ],
  "Where SYNTRAX™ belongs": [
    "Aplicaciones de SYNTRAX™",
    "Aplicações da SYNTRAX™"
  ],
  "Where NANOFORCE™ belongs": [
    "Aplicaciones de NANOFORCE™",
    "Aplicações da NANOFORCE™"
  ],
  "Where THERMACORE™ belongs": [
    "Aplicaciones de THERMACORE™",
    "Aplicações da THERMACORE™"
  ],
  "Where DRYCORE™ belongs": [
    "Aplicaciones de DRYCORE™",
    "Aplicações da DRYCORE™"
  ],
  "Where INTEKCORE™ belongs": [
    "Aplicaciones de INTEKCORE™",
    "Aplicações da INTEKCORE™"
  ],
  "Where MICROKAPPA™ belongs": [
    "Aplicaciones de MICROKAPPA™",
    "Aplicações da MICROKAPPA™"
  ],
  "Technical reference": [
    "Referencia técnica",
    "Referência técnica"
  ],
  "Key engineering parameters": [
    "Parámetros de ingeniería",
    "Parâmetros de engenharia"
  ],
  "Common selection errors": [
    "Errores de selección habituales",
    "Erros de seleção comuns"
  ],
  "Application validation": [
    "Validación de la aplicación",
    "Validação da aplicação"
  ],
  "Protected assets": [
    "Activos protegidos",
    "Ativos protegidos"
  ],
  "Claim governance": [
    "Control de afirmaciones técnicas",
    "Controle das afirmações técnicas"
  ],
  "Product-level evidence": [
    "Evidencia específica del producto",
    "Evidências específicas do produto"
  ]
};

export function ReviewedText({ text, context, stripNumber = false }: { text: string; context?: string; stripNumber?: boolean }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const match = MACROCORE_HEADINGS[text];
  const fallback = match && locale.startsWith('es') ? match[0] : match && locale.startsWith('pt') ? match[1] : text;
  const translated = t(reviewedCopyKey(text) + (context ? '_' + context : ''), { defaultValue: fallback });
  // Never render an empty content block when a locale entry is absent or accidentally blank.
  const safeText = typeof translated === 'string' && translated.trim() && !(match && fallback !== text && translated === text) ? translated : fallback;
  return <>{stripNumber ? safeText.replace(/^\d+\.\s*/, '') : safeText}</>;
}

/** Same lookup as <ReviewedText>, for strings used in props and attributes. */
export function useReviewed() {
  const { t } = useTranslation();
  return (text: string) => {
    const translated = t(reviewedCopyKey(text), { defaultValue: text });
    return typeof translated === 'string' && translated.trim() ? translated : text;
  };
}
