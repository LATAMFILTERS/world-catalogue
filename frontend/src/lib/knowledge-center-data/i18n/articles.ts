// Server-only: reviewed /es/ and /pt/ engineering article bodies, read at build time (never shipped in the client bundle).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { KCArticle, KCComparison, KCDiagram, KCIndustryDetail, KCStandard, KCSystemDetail, KCTechnology } from '../types';
import type { KC_INDUSTRIES } from '../canonical-industries-registry';
import type { KC_SYSTEMS } from '../canonical-systems-registry';
import type { ProblemStub, TerminologyEntry } from '@/lib/knowledge-center';

export function translatedArticle(slug: string, lang: 'es' | 'pt'): KCArticle {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, `${slug}.json`), 'utf8'));
}

export interface TranslatedFAQ {
  questions: Record<string, { question: string; answer: string }>;
  topics: Record<string, string>;
  categories: Record<string, string>;
}

export function translatedFAQ(lang: 'es' | 'pt'): TranslatedFAQ {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'faq.json'), 'utf8'));
}

export interface TranslatedSystem {
  system: (typeof KC_SYSTEMS)[number];
  detail: KCSystemDetail | null;
}

export function translatedSystem(slug: string, lang: 'es' | 'pt'): TranslatedSystem {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'systems', `${slug}.json`), 'utf8'));
}

export function translatedTechnology(slug: string, lang: 'es' | 'pt'): KCTechnology {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'technologies', `${slug}.json`), 'utf8'));
}

const LOCALIZED_STANDARD_TITLES: Record<'es' | 'pt', Record<string, string>> = {
  "es": {
    "iso-4406": "Codificación del nivel de contaminación por partículas sólidas en fluidos hidráulicos",
    "iso-16889": "Método multipaso para evaluar el desempeño de elementos filtrantes hidráulicos",
    "iso-11171": "Calibración de contadores automáticos de partículas en líquidos",
    "nas-1638": "Requisitos de limpieza para componentes de sistemas hidráulicos",
    "sae-j726": "Código de ensayo de filtros de aire para motores",
    "iso-16332": "Métodos de ensayo de la eficiencia de separación de agua en filtros de combustible diésel",
    "iso-3723": "Método de ensayo de carga axial en elementos filtrantes hidráulicos",
    "iso-2941": "Verificación de la resistencia al colapso o rotura de elementos filtrantes hidráulicos",
    "din-51524": "Fluidos hidráulicos: requisitos y clasificación",
    "iso-5011": "Ensayo del desempeño de filtros de aire de admisión de motores y compresores",
    "sae-j1539": "Código de ensayo de filtros de aire para motores diésel",
    "iso-29463": "Filtros y medios filtrantes de alta eficiencia: clasificación y ensayo",
    "iso-11155-1": "Ensayo de filtración de aire del habitáculo en vehículos de carretera",
    "din-71460": "Filtros de aire de cabina para vehículos de carretera",
    "iso-12937": "Determinación del contenido de agua mediante valoración culombimétrica Karl Fischer",
    "astm-d6304": "Determinación de agua en productos petrolíferos mediante valoración culombimétrica Karl Fischer",
    "iso-8573-1": "Clases de contaminantes y pureza del aire comprimido",
    "sae-j1858": "Filtros de aceite lubricante de flujo total: selección y especificación",
    "iso-19438": "Ensayos de filtros de combustible para motores diésel y de gasolina",
    "astm-d5185": "Determinación de metales de desgaste, aditivos y contaminantes en aceites por ICP-OES",
    "iso-8573-2": "Medición del contenido de aceite en aerosoles del aire comprimido",
    "iso-3968": "Evaluación de la característica de presión diferencial frente a caudal"
  },
  "pt": {
    "iso-4406": "Codificação do nível de contaminação por partículas sólidas em fluidos hidráulicos",
    "iso-16889": "Método multipassagem para avaliar o desempenho de elementos filtrantes hidráulicos",
    "iso-11171": "Calibração de contadores automáticos de partículas em líquidos",
    "nas-1638": "Requisitos de limpeza para componentes de sistemas hidráulicos",
    "sae-j726": "Código de ensaio de filtros de ar para motores",
    "iso-16332": "Métodos de ensaio da eficiência de separação de água em filtros de combustível diesel",
    "iso-3723": "Método de ensaio de carga axial em elementos filtrantes hidráulicos",
    "iso-2941": "Verificação da resistência ao colapso ou ruptura de elementos filtrantes hidráulicos",
    "din-51524": "Fluidos hidráulicos: requisitos e classificação",
    "iso-5011": "Ensaio de desempenho de filtros de ar de admissão de motores e compressores",
    "sae-j1539": "Código de ensaio de filtros de ar para motores diesel",
    "iso-29463": "Filtros e meios filtrantes de alta eficiência: classificação e ensaio",
    "iso-11155-1": "Ensaio de filtração do ar do habitáculo em veículos rodoviários",
    "din-71460": "Filtros de ar de cabine para veículos rodoviários",
    "iso-12937": "Determinação do teor de água por titulação coulométrica Karl Fischer",
    "astm-d6304": "Determinação de água em produtos petrolíferos por titulação coulométrica Karl Fischer",
    "iso-8573-1": "Classes de contaminantes e pureza do ar comprimido",
    "sae-j1858": "Filtros de óleo lubrificante de fluxo total: seleção e especificação",
    "iso-19438": "Ensaios de filtros de combustível para motores diesel e gasolina",
    "astm-d5185": "Determinação de metais de desgaste, aditivos e contaminantes em óleos por ICP-OES",
    "iso-8573-2": "Medição do teor de óleo em aerossóis do ar comprimido",
    "iso-3968": "Avaliação da característica de pressão diferencial em função da vazão"
  }
};

export function translatedStandard(slug: string, lang: 'es' | 'pt'): KCStandard {
  const standard = JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'standards', `${slug}.json`), 'utf8')) as KCStandard;
  const localizedTitle = LOCALIZED_STANDARD_TITLES[lang][slug];
  return localizedTitle ? { ...standard, title: localizedTitle } : standard;
}

export function translatedTerm(slug: string, lang: 'es' | 'pt'): TerminologyEntry {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'glossary', `${slug}.json`), 'utf8'));
}

export function translatedProblem(slug: string, lang: 'es' | 'pt'): ProblemStub {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'problems', `${slug}.json`), 'utf8'));
}

export function translatedComparison(slug: string, lang: 'es' | 'pt'): KCComparison {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'comparisons', `${slug}.json`), 'utf8'));
}

export function translatedIndustry(slug: string, lang: 'es' | 'pt'): { industry: (typeof KC_INDUSTRIES)[number]; detail: KCIndustryDetail | null } {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'industries', `${slug}.json`), 'utf8'));
}

export function translatedDiagram(slug: string, lang: 'es' | 'pt'): KCDiagram {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/lib/knowledge-center-data/i18n', lang, 'diagrams', `${slug}.json`), 'utf8'));
}
