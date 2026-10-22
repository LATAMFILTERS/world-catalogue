import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

/** Knowledge Center section hubs published in /es/ and /pt/ (copy translated in place through reviewedCopy). */
export const LOCALIZED_HUBS = {
  engineering: {
    es: ['Biblioteca de ingeniería de filtración | ELIMFILTERS', 'Artículos de ingeniería sobre control de contaminación, ciencia de la filtración, protección de activos, diagnóstico y confiabilidad de sistemas industriales.'],
    pt: ['Biblioteca de engenharia de filtração | ELIMFILTERS', 'Artigos de engenharia sobre controle de contaminação, ciência da filtração, proteção de ativos, diagnóstico e confiabilidade de sistemas industriais.'],
  },
  standards: {
    es: ['Biblioteca de normas de filtración | ELIMFILTERS', 'Guía técnica sobre normas ISO, SAE, ASTM, DIN, NFPA y otras normas de filtración y control de contaminación.'],
    pt: ['Biblioteca de normas de filtração | ELIMFILTERS', 'Orientação técnica sobre normas ISO, SAE, ASTM, DIN, NFPA e outras normas de filtração e controle de contaminação.'],
  },
  problems: {
    es: ['Modos de falla por contaminación | ELIMFILTERS', 'Guía técnica sobre modos de falla causados por la contaminación, componentes afectados, causas raíz y estrategias de control por filtración.'],
    pt: ['Modos de falha por contaminação | ELIMFILTERS', 'Orientação técnica sobre modos de falha causados pela contaminação, componentes afetados, causas raiz e estratégias de controle por filtração.'],
  },
  technologies: {
    es: ['Tecnologías de filtración | Centro de Conocimiento ELIMFILTERS', 'Conozca las tecnologías de filtración ELIMFILTERS para proteger los sistemas de aire, combustible, lubricación, hidráulicos y de enfriamiento.'],
    pt: ['Tecnologias de filtração | Centro de Conhecimento ELIMFILTERS', 'Conheça as tecnologias de filtração ELIMFILTERS para proteger os sistemas de ar, combustível, lubrificação, hidráulicos e de arrefecimento.'],
  },
  systems: {
    es: ['Sistemas de protección de activos | ELIMFILTERS', 'Guía de ingeniería para proteger la admisión de aire, el combustible, la lubricación, los sistemas hidráulicos y el enfriamiento en activos industriales.'],
    pt: ['Sistemas de proteção de ativos | ELIMFILTERS', 'Orientação de engenharia para proteger a admissão de ar, o combustível, a lubrificação, os sistemas hidráulicos e o arrefecimento em ativos industriais.'],
  },
  'fleet-optimization': {
    es: ['Optimización y confiabilidad de flotas | ELIMFILTERS', 'Estrategias de control de contaminación para prolongar la vida de los equipos, reducir fallas y bajar el costo total de propiedad de las flotas.'],
    pt: ['Otimização e confiabilidade de frotas | ELIMFILTERS', 'Estratégias de controle de contaminação para prolongar a vida dos equipamentos, reduzir falhas e baixar o custo total de propriedade das frotas.'],
  },
  glossary: {
    es: ['Glosario de terminología de ingeniería | Centro de Conocimiento ELIMFILTERS', 'Definiciones canónicas de filtración, control de contaminación, mantenimiento y confiabilidad usadas en todo el Centro de Conocimiento.'],
    pt: ['Glossário de terminologia de engenharia | Centro de Conhecimento ELIMFILTERS', 'Definições canônicas de filtração, controle de contaminação, manutenção e confiabilidade usadas em todo o Centro de Conhecimento.'],
  },
  comparisons: {
    es: ['Comparaciones de ingeniería de filtración | ELIMFILTERS', 'Comparaciones técnicas de normas de filtración, métricas de eficiencia, códigos de limpieza y criterios de selección de ingeniería.'],
    pt: ['Comparações de engenharia de filtração | ELIMFILTERS', 'Comparações técnicas de normas de filtração, métricas de eficiência, códigos de limpeza e critérios de seleção de engenharia.'],
  },
  calculators: {
    es: ['Calculadoras de ingeniería de filtración | ELIMFILTERS', 'Calculadoras basadas en normas para códigos de limpieza ISO, relación Beta, caída de presión, intervalos de servicio y análisis de ingeniería de filtración.'],
    pt: ['Calculadoras de engenharia de filtração | ELIMFILTERS', 'Calculadoras baseadas em normas para códigos de limpeza ISO, relação Beta, queda de pressão, intervalos de serviço e análise de engenharia de filtração.'],
  },
  diagrams: {
    es: ['Diagramas de ingeniería | Centro de Conocimiento ELIMFILTERS', 'Diagramas de ingeniería fieles a las normas: circuitos de ensayo, códigos de limpieza, vías de contaminación y sistemas de filtración.'],
    pt: ['Diagramas de engenharia | Centro de Conhecimento ELIMFILTERS', 'Diagramas de engenharia fiéis às normas: circuitos de ensaio, códigos de limpeza, caminhos de contaminação e sistemas de filtração.'],
  },
  'engineering-reference': {
    es: ['Biblioteca de referencia de ingeniería | Centro de Conocimiento ELIMFILTERS', 'Referencias técnicas estructuradas sobre normas de filtración, control de partículas, mecanismos de contaminación, métodos de ensayo y confiabilidad.'],
    pt: ['Biblioteca de referência de engenharia | Centro de Conhecimento ELIMFILTERS', 'Referências técnicas estruturadas sobre normas de filtração, controle de partículas, mecanismos de contaminação, métodos de ensaio e confiabilidade.'],
  },
  'learning-paths': {
    es: ['Rutas de aprendizaje de ingeniería de filtración | ELIMFILTERS', 'Rutas de aprendizaje estructuradas sobre filtración hidráulica, ingeniería de lubricación, limpieza del combustible, admisión de aire y control de contaminación.'],
    pt: ['Trilhas de aprendizagem de engenharia de filtração | ELIMFILTERS', 'Trilhas de aprendizagem estruturadas sobre filtração hidráulica, engenharia de lubrificação, limpeza do combustível, admissão de ar e controle de contaminação.'],
  },
  industries: {
    es: ['Filtración por industria | Centro de Conocimiento ELIMFILTERS', 'Guía de ingeniería para los desafíos de filtración en minería, agricultura, construcción, transporte, marino, energía y manufactura.'],
    pt: ['Filtração por setor | Centro de Conhecimento ELIMFILTERS', 'Orientação de engenharia para os desafios de filtração em mineração, agricultura, construção, transporte, marítimo, energia e manufatura.'],
  },
  'technical-library': {
    es: ['Biblioteca técnica de filtración industrial | ELIMFILTERS', 'Recursos técnicos sobre selección de filtración, estrategia de mantenimiento, confiabilidad de flotas, control de contaminación y costo total de propiedad.'],
    pt: ['Biblioteca técnica de filtração industrial | ELIMFILTERS', 'Recursos técnicos sobre seleção de filtração, estratégia de manutenção, confiabilidade de frotas, controle de contaminação e custo total de propriedade.'],
  },
} as const satisfies Record<string, Record<'es' | 'pt', readonly [string, string]>>;

export type LocalizedHub = keyof typeof LOCALIZED_HUBS;

export function hubMetadata(hub: LocalizedHub, lang: 'es' | 'pt'): Metadata {
  const [title, description] = LOCALIZED_HUBS[hub][lang];
  const url = `https://elimfilters.com/${lang}/knowledge-center/${hub}/`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(`/knowledge-center/${hub}`) },
    openGraph: { title, description, url, type: 'website', siteName: 'ELIMFILTERS', locale: lang === 'es' ? 'es_419' : 'pt_BR' },
  };
}
