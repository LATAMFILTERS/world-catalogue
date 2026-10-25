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

export function ReviewedText({ text, context, stripNumber = false }: { text: string; context?: string; stripNumber?: boolean }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const match = MACROCORE_HEADINGS[text];
  const fallback = match && locale.startsWith('es') ? match[0] : match && locale.startsWith('pt') ? match[1] : text;
  const translated = t(reviewedCopyKey(text) + (context ? '_' + context : ''), { defaultValue: fallback });
  // Never render an empty content block when a locale entry is absent or accidentally blank.
  const safeText = typeof translated === 'string' && translated.trim() ? translated : fallback;
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
