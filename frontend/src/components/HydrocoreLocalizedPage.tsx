import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';
import { TECHNICAL_REVIEWER } from '@/lib/technical-reviewer';

// Localized versions of HydrocoreStablePage, published at /es/ and /pt/technologies/hydrocore/.
// Each language is a faithful translation of the English page: same scope, no added claims.

type HydrocoreLang = 'es' | 'pt';

const COPY = {
  es: {
    title: 'Tecnología de separación de agua y combustible HYDROCORE™',
    description: 'HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS desarrollada para aplicaciones aprobadas de separadores diésel estándar en las que se requiere controlar el agua antes de que el combustible llegue a bombas, inyectores y otros componentes de precisión del sistema de combustible.',
    about: ['separación de agua y combustible diésel', 'control de la contaminación del combustible', 'drenaje del separador de combustible', 'restricción del combustible', 'agua en el combustible diésel', 'corrosión del sistema de combustible'],
    mentions: ['bomba de combustible de alta presión', 'inyectores diésel', 'falta de combustible bajo carga', 'contaminación microbiana del combustible', 'contaminación del combustible almacenado', 'vaso transparente del separador'],
    home: 'Inicio', technologies: 'Tecnologías', breadcrumbLabel: 'Ruta de navegación',
    heroAlt: 'Entorno de servicio de separación de agua y combustible diésel',
    eyebrow: 'TECNOLOGÍA DE FILTRACIÓN',
    applicationLine: 'Arquitectura de separación de agua y combustible',
    lead: 'Una arquitectura de separación de agua y combustible desarrollada para aplicaciones aprobadas de separadores diésel estándar, en las que se requiere controlar el agua antes de que el combustible llegue a bombas, inyectores y otros componentes de precisión del sistema de combustible aguas abajo.',
    metaTechnology: 'Tecnología:', metaApplication: 'Aplicación:', metaApplicationValue: 'Separadores de agua y combustible estándar, no tipo turbina',
    metaReview: 'Revisión técnica:', reviewer: 'Víctor Abreu — Fundador y CEO',
    descriptionKicker: 'DESCRIPCIÓN',
    featureTitle: 'Separación de agua y combustible y control del drenaje',
    featureLead: 'HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS, desarrollada para aplicaciones aprobadas de separadores de combustible diésel estándar en las que se requiere controlar el agua antes de que el combustible llegue a bombas, inyectores y otros componentes de precisión del sistema de combustible aguas abajo.',
    featureBody: [
      'Su medio y su configuración de separador se seleccionan según el caudal de combustible, los requisitos de separación de agua, la carga de contaminantes, la caída de presión, la estrategia de drenaje y la exigencia de operación. Un manejo eficaz del agua ayuda a reducir la exposición aguas abajo a la corrosión, la erosión, la cavitación y el desgaste asociado a la contaminación, y favorece un suministro de combustible constante bajo carga.',
      'La acumulación de agua, un drenaje inadecuado, el combustible contaminado en el almacenamiento y el crecimiento microbiano pueden acelerar la carga del separador y contribuir a una restricción prematura. Por eso, HYDROCORE™ se trata como parte de la estrategia completa de limpieza del combustible y no como un elemento filtrante aislado.',
      'HYDROCORE™ puede configurarse para diseños aprobados de separadores de agua y combustible estándar spin-on y de cartucho, incluidas las versiones con drenaje y con vaso transparente. Los sistemas tipo turbina FH y FG quedan fuera de esta arquitectura y se rigen por separado mediante TURBOCORE™.',
    ],
    mediaAlt: 'Estructura conceptual de medio fibroso de separación de agua y combustible para HYDROCORE',
    mediaCaption: 'Visualización microscópica de la estructura del medio filtrante, con fines de ilustración técnica.',
    realityKicker: 'REALIDAD OPERATIVA',
    realityTitle: 'El agua y la restricción pueden convertirse en mecanismos de riesgo para los componentes.',
    realityLead: 'Cuando el agua pasa aguas abajo, aumenta el riesgo de corrosión, erosión y desgaste en bombas, inyectores y otras interfaces de precisión del sistema de combustible. Cuando la restricción aumenta en exceso, el motor puede perder potencia, oscilar o mostrar síntomas de falta de combustible bajo carga.',
    waterTitle: 'Exposición al agua',
    waterBody: 'El agua separada que no se retira, o el agua que sobrepasa el límite de separación previsto, puede aumentar el riesgo de corrosión y desgaste aguas abajo.',
    restrictionTitle: 'Exposición a la restricción',
    restrictionBody: 'Un separador cargado o con un servicio inadecuado puede reducir el suministro de combustible disponible, con síntomas que suelen hacerse más evidentes a medida que aumenta la demanda del motor.',
    environmentKicker: 'ENTORNO DE APLICACIÓN',
    environmentTitle: 'Dónde corresponde HYDROCORE™',
    approvedTitle: 'Configuraciones aprobadas',
    approved: ['Separadores de agua y combustible spin-on estándar', 'Configuraciones de separador de cartucho', 'Separadores con drenaje', 'Separadores con vaso transparente, cuando estén aprobados'],
    exposureTitle: 'Exposición en operación',
    exposure: ['Almacenamiento de combustible a granel', 'Condensación e ingreso de agua', 'Servicio agrícola y de construcción', 'Manejo de combustible en sitios remotos o de servicio severo'],
    excludedTitle: 'Arquitectura excluida',
    excluded: ['Sistemas de turbina FH', 'Sistemas de turbina FG', 'Filtración diésel solo de partículas', 'Aplicaciones sin datos validados del separador'],
    selectionKicker: 'ESPECIFICACIÓN Y SELECCIÓN',
    selectionTitle: 'Preguntas antes de seleccionar un separador de agua y combustible',
    parametersTitle: 'Parámetros clave',
    parameters: ['Geometría aprobada del separador', 'Caudal de combustible requerido', 'Requisito de separación de agua', 'Límite de caída de presión', 'Configuración de drenaje y vaso', 'Acceso para servicio'],
    errorsTitle: 'Errores comunes',
    errors: ['Seleccionar solo por dimensiones', 'Ignorar los requisitos de servicio del drenaje', 'Tratar toda contaminación por agua como si fuera igual', 'Extender intervalos pese al aumento de la restricción', 'Confundir HYDROCORE™ con la arquitectura FH/FG'],
    inputsTitle: 'Datos para la validación',
    inputs: ['Motor o equipo', 'Referencia actual del separador', 'Arquitectura del sistema de combustible', 'Perfil de caudal y exigencia', 'Condiciones de almacenamiento', 'Historial de agua u obstrucciones'],
    knownQ: '¿Conoce la aplicación?', knownA: 'Use Part Search.', problemQ: '¿Problema de agua, restricción u obstrucción repetida?', problemA: 'Solicite una revisión técnica.',
    findPart: 'ENCONTRAR MI REPUESTO', technicalReview: 'REVISIÓN TÉCNICA',
    behaviorKicker: 'CÓMO SE COMPORTA EL SISTEMA',
    behaviorTitle: 'La carga de agua, el caudal y la restricción evolucionan juntos.',
    behaviorLead: 'El separador debe sostener el suministro de combustible requerido y, al mismo tiempo, ofrecer el comportamiento de separación que exige la aplicación aprobada. A medida que se acumulan agua y contaminación, la caída de presión y la demanda de servicio pueden cambiar.',
    diagnosisKicker: 'SERVICIO Y DIAGNÓSTICO',
    diagnosisTitle: 'Lo que puede indicar la falta de combustible o la obstrucción repetida del separador',
    diagnosis: ['Acumulación de agua que requiere drenaje', 'Alta carga de contaminación desde el almacenamiento', 'Contaminación microbiana o lodos', 'Sedimentos de tanques o equipos de transferencia', 'Problemas de flujo en frío o de combustible degradado', 'Intervalo de servicio que no corresponde a la exigencia'],
    diagnosisCta: 'La obstrucción repetida, el agua visible o la pérdida de potencia bajo carga justifican revisar todo el recorrido de suministro de combustible.',
    diagnosisButton: 'SOLICITAR REVISIÓN DEL SISTEMA DE COMBUSTIBLE',
    faqKicker: 'PREGUNTAS DEL CAMPO',
    faqTitle: 'Respuestas directas a preguntas frecuentes sobre la separación de agua y combustible.',
    faqs: [
      ['¿Qué es HYDROCORE™?', 'HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS para filtros separadores estándar aprobados, no tipo turbina, incluidas las configuraciones con drenaje y con vaso transparente.'],
      ['¿Por qué es peligrosa el agua en el combustible diésel?', 'El agua puede contribuir a la corrosión, la erosión, el riesgo de cavitación y el desgaste acelerado en bombas, inyectores y otras interfaces de precisión del sistema de combustible. La gravedad depende del sistema de combustible, del nivel de contaminación y de las condiciones de operación.'],
      ['¿Un separador de agua y combustible restringido puede causar pérdida de potencia?', 'Sí. Una restricción excesiva puede reducir el suministro de combustible al motor, sobre todo bajo carga. La pérdida de potencia, las oscilaciones o los síntomas de falta de combustible justifican inspeccionar el separador, la condición del combustible aguas arriba y todo el recorrido de suministro.'],
      ['¿Por qué un separador nuevo puede taparse antes de tiempo?', 'Una carga severa de partículas, la contaminación microbiana, el combustible degradado, los problemas de flujo en frío o la contaminación proveniente de los tanques de almacenamiento pueden acortar la vida útil. Las obstrucciones tempranas repetidas deben motivar una revisión de la calidad del combustible y del almacenamiento.'],
      ['¿Cuál es la función del drenaje o del vaso transparente?', 'Cuando el separador aprobado incluye drenaje o vaso transparente, estos elementos facilitan la inspección y el retiro del agua separada. La práctica de servicio debe seguir los requisitos de la aplicación específica.'],
      ['¿HYDROCORE™ aplica a los sistemas tipo turbina FH o FG?', 'No. Los sistemas separadores de agua y combustible tipo turbina FH y FG se rigen por TURBOCORE™. HYDROCORE™ aplica a configuraciones de separadores estándar aprobadas, no tipo turbina.'],
      ['¿HYDROCORE™ reemplaza la filtración de partículas del combustible?', 'No. HYDROCORE™ gobierna la separación estándar de agua y combustible. La filtración de partículas del combustible diésel se rige por separado mediante SYNTAPORE™, dentro de la arquitectura de protección de la limpieza del combustible de ELIMFILTERS.'],
    ],
    basisKicker: 'BASE TÉCNICA', basisTitle: 'Referencia técnica',
    evidenceTitle: 'Evidencia a nivel de producto',
    evidenceBody: 'La eficiencia de separación de agua, la caída de presión, la capacidad de caudal, la capacidad de retención de agua y los límites de servicio corresponden a los datos validados de cada separador y al método de ensayo aplicable.',
    governanceTitle: 'Gobernanza de las afirmaciones',
    governanceBody: 'A HYDROCORE™ no se le asigna una eficiencia de separación, un grado de micras, una capacidad, un límite de caudal ni un intervalo de servicio universales para todas las aplicaciones.',
    reviewKicker: 'CUÁNDO CONVIENE UNA REVISIÓN TÉCNICA',
    reviewTitle: 'Cuando el mantenimiento del separador se convierte en un problema de calidad del combustible',
    reviewLead: 'La acumulación repetida de agua, la vida corta del separador, la contaminación microbiana, la falta de combustible o la evidencia de corrosión aguas abajo justifican revisar el almacenamiento, la transferencia, la separación, la filtración y el mantenimiento como una sola cadena de control de la contaminación.',
    systemKicker: 'INTEGRACIÓN EN EL SISTEMA',
    systemTitle: 'Protección de la limpieza del combustible',
    systemLead: 'HYDROCORE™ aporta la capa de separación de agua y combustible estándar, no tipo turbina, dentro de la protección de la limpieza del combustible de ELIMFILTERS.',
    systemButton: 'EXPLORAR EL SISTEMA DE PROTECCIÓN',
    systemBody: 'SYNTAPORE™ gobierna la filtración de partículas del combustible diésel. TURBOCORE™ gobierna los sistemas separadores de agua y combustible tipo turbina FH/FG. Mantener separadas esas funciones evita asignar mal la aplicación.',
    supportKicker: 'SOPORTE DE APLICACIÓN',
    supportTitle: 'Tráiganos la arquitectura del sistema de combustible, el historial de agua y el ciclo de trabajo, no solo el número de parte.',
    supportLead: 'Use Part Search cuando conozca el separador. Para problemas repetidos de agua, obstrucción, restricción o calidad del combustible, solicite una revisión técnica.',
    supportButton: 'SOLICITAR REVISIÓN TÉCNICA',
    relatedKicker: 'TECNOLOGÍAS RELACIONADAS',
    relatedTitle: 'Continúe por la arquitectura de limpieza del combustible.',
    relatedFamily: 'Separadores de agua y combustible',
  },
  pt: {
    title: 'Tecnologia de separação de água e combustível HYDROCORE™',
    description: 'O HYDROCORE™ é a arquitetura de separação de água e combustível da ELIMFILTERS desenvolvida para aplicações aprovadas de separadores diesel padrão, nas quais é preciso controlar a água antes que o combustível chegue às bombas, aos injetores e a outros componentes de precisão do sistema de combustível.',
    about: ['separação de água e combustível diesel', 'controle da contaminação do combustível', 'drenagem do separador de combustível', 'restrição do combustível', 'água no combustível diesel', 'corrosão do sistema de combustível'],
    mentions: ['bomba de combustível de alta pressão', 'injetores diesel', 'falta de combustível sob carga', 'contaminação microbiana do combustível', 'contaminação do combustível armazenado', 'copo transparente do separador'],
    home: 'Início', technologies: 'Tecnologias', breadcrumbLabel: 'Trilha de navegação',
    heroAlt: 'Ambiente de manutenção de separação de água e combustível diesel',
    eyebrow: 'TECNOLOGIA DE FILTRAÇÃO',
    applicationLine: 'Arquitetura de separação de água e combustível',
    lead: 'Uma arquitetura de separação de água e combustível desenvolvida para aplicações aprovadas de separadores diesel padrão, nas quais é preciso controlar a água antes que o combustível chegue às bombas, aos injetores e a outros componentes de precisão do sistema de combustível a jusante.',
    metaTechnology: 'Tecnologia:', metaApplication: 'Aplicação:', metaApplicationValue: 'Separadores de água e combustível padrão, não tipo turbina',
    metaReview: 'Revisão técnica:', reviewer: 'Víctor Abreu — Fundador e CEO',
    descriptionKicker: 'DESCRIÇÃO',
    featureTitle: 'Separação de água e combustível e controle da drenagem',
    featureLead: 'O HYDROCORE™ é a arquitetura de separação de água e combustível da ELIMFILTERS, desenvolvida para aplicações aprovadas de separadores de combustível diesel padrão, nas quais é preciso controlar a água antes que o combustível chegue às bombas, aos injetores e a outros componentes de precisão do sistema de combustível a jusante.',
    featureBody: [
      'Seu meio e sua configuração de separador são selecionados de acordo com a vazão de combustível, os requisitos de separação de água, a carga de contaminantes, a perda de carga, a estratégia de drenagem e a severidade da operação. Um gerenciamento eficaz da água ajuda a reduzir a exposição a jusante à corrosão, à erosão, à cavitação e ao desgaste associado à contaminação, e favorece um fornecimento de combustível constante sob carga.',
      'O acúmulo de água, a drenagem inadequada, o combustível contaminado no armazenamento e o crescimento microbiano podem acelerar a saturação do separador e contribuir para uma restrição prematura. Por isso, o HYDROCORE™ é tratado como parte da estratégia completa de limpeza do combustível, e não como um elemento filtrante isolado.',
      'O HYDROCORE™ pode ser configurado para projetos aprovados de separadores de água e combustível padrão spin-on e de cartucho, incluindo versões com dreno e com copo transparente. Os sistemas tipo turbina FH e FG ficam fora desta arquitetura e são governados separadamente pelo TURBOCORE™.',
    ],
    mediaAlt: 'Estrutura conceitual de meio fibroso de separação de água e combustível para o HYDROCORE',
    mediaCaption: 'Visualização microscópica da estrutura do meio filtrante, para fins de ilustração técnica.',
    realityKicker: 'REALIDADE OPERACIONAL',
    realityTitle: 'A água e a restrição podem se tornar mecanismos de risco para os componentes.',
    realityLead: 'Quando a água passa para jusante, aumenta o risco de corrosão, erosão e desgaste em bombas, injetores e outras interfaces de precisão do sistema de combustível. Quando a restrição aumenta em excesso, o motor pode perder potência, oscilar ou apresentar sintomas de falta de combustível sob carga.',
    waterTitle: 'Exposição à água',
    waterBody: 'A água separada que não é removida, ou a água que ultrapassa o limite de separação previsto, pode aumentar o risco de corrosão e desgaste a jusante.',
    restrictionTitle: 'Exposição à restrição',
    restrictionBody: 'Um separador saturado ou com manutenção inadequada pode reduzir o fornecimento de combustível disponível, com sintomas que costumam ficar mais evidentes à medida que aumenta a demanda do motor.',
    environmentKicker: 'AMBIENTE DE APLICAÇÃO',
    environmentTitle: 'Onde o HYDROCORE™ se aplica',
    approvedTitle: 'Configurações aprovadas',
    approved: ['Separadores de água e combustível spin-on padrão', 'Configurações de separador de cartucho', 'Separadores com dreno', 'Separadores com copo transparente, quando aprovados'],
    exposureTitle: 'Exposição na operação',
    exposure: ['Armazenamento de combustível a granel', 'Condensação e entrada de água', 'Operação agrícola e de construção', 'Manuseio de combustível em locais remotos ou de serviço severo'],
    excludedTitle: 'Arquitetura excluída',
    excluded: ['Sistemas de turbina FH', 'Sistemas de turbina FG', 'Filtração diesel apenas de partículas', 'Aplicações sem dados validados do separador'],
    selectionKicker: 'ESPECIFICAÇÃO E SELEÇÃO',
    selectionTitle: 'Perguntas antes de selecionar um separador de água e combustível',
    parametersTitle: 'Parâmetros principais',
    parameters: ['Geometria aprovada do separador', 'Vazão de combustível exigida', 'Requisito de separação de água', 'Limite de perda de carga', 'Configuração de dreno e copo', 'Acesso para manutenção'],
    errorsTitle: 'Erros comuns',
    errors: ['Selecionar apenas por dimensões', 'Ignorar os requisitos de manutenção do dreno', 'Tratar toda contaminação por água como se fosse igual', 'Estender intervalos apesar do aumento da restrição', 'Confundir o HYDROCORE™ com a arquitetura FH/FG'],
    inputsTitle: 'Dados para a validação',
    inputs: ['Motor ou equipamento', 'Referência atual do separador', 'Arquitetura do sistema de combustível', 'Perfil de vazão e severidade', 'Condições de armazenamento', 'Histórico de água ou entupimentos'],
    knownQ: 'Conhece a aplicação?', knownA: 'Use o Part Search.', problemQ: 'Problema de água, restrição ou entupimento repetido?', problemA: 'Solicite uma revisão técnica.',
    findPart: 'ENCONTRAR MINHA PEÇA', technicalReview: 'REVISÃO TÉCNICA',
    behaviorKicker: 'COMO O SISTEMA SE COMPORTA',
    behaviorTitle: 'A carga de água, a vazão e a restrição evoluem juntas.',
    behaviorLead: 'O separador precisa sustentar o fornecimento de combustível exigido e, ao mesmo tempo, oferecer o comportamento de separação que a aplicação aprovada exige. À medida que água e contaminação se acumulam, a perda de carga e a demanda de manutenção podem mudar.',
    diagnosisKicker: 'MANUTENÇÃO E DIAGNÓSTICO',
    diagnosisTitle: 'O que a falta de combustível ou o entupimento repetido do separador pode indicar',
    diagnosis: ['Acúmulo de água que exige drenagem', 'Alta carga de contaminação vinda do armazenamento', 'Contaminação microbiana ou borra', 'Sedimentos de tanques ou equipamentos de transferência', 'Problemas de fluxo a frio ou de combustível degradado', 'Intervalo de troca incompatível com a severidade'],
    diagnosisCta: 'O entupimento repetido, a água visível ou a perda de potência sob carga justificam revisar todo o trajeto de fornecimento de combustível.',
    diagnosisButton: 'SOLICITAR REVISÃO DO SISTEMA DE COMBUSTÍVEL',
    faqKicker: 'PERGUNTAS DO CAMPO',
    faqTitle: 'Respostas diretas às perguntas frequentes sobre separação de água e combustível.',
    faqs: [
      ['O que é o HYDROCORE™?', 'O HYDROCORE™ é a arquitetura de separação de água e combustível da ELIMFILTERS para filtros separadores padrão aprovados, não tipo turbina, incluindo as configurações com dreno e com copo transparente.'],
      ['Por que a água no diesel é perigosa?', 'A água pode contribuir para corrosão, erosão, risco de cavitação e desgaste acelerado em bombas, injetores e outras interfaces de precisão do sistema de combustível. A gravidade depende do sistema de combustível, do nível de contaminação e das condições de operação.'],
      ['Um separador de água e combustível restrito pode causar perda de potência?', 'Sim. Uma restrição excessiva pode reduzir o fornecimento de combustível ao motor, principalmente sob carga. Perda de potência, oscilações ou sintomas de falta de combustível justificam inspecionar o separador, a condição do combustível a montante e todo o trajeto de fornecimento.'],
      ['Por que um separador novo pode entupir antes do tempo?', 'Uma carga severa de partículas, contaminação microbiana, combustível degradado, problemas de fluxo a frio ou contaminação vinda dos tanques de armazenamento podem reduzir a vida útil. Entupimentos precoces repetidos devem motivar uma revisão da qualidade do combustível e do armazenamento.'],
      ['Qual é a função do dreno ou do copo transparente?', 'Quando o separador aprovado tem dreno ou copo transparente, esses recursos facilitam a inspeção e a remoção da água separada. A prática de manutenção deve seguir os requisitos da aplicação específica.'],
      ['O HYDROCORE™ se aplica aos sistemas tipo turbina FH ou FG?', 'Não. Os sistemas separadores de água e combustível tipo turbina FH e FG são governados pelo TURBOCORE™. O HYDROCORE™ se aplica a configurações de separadores padrão aprovadas, não tipo turbina.'],
      ['O HYDROCORE™ substitui a filtração de partículas do combustível?', 'Não. O HYDROCORE™ governa a separação padrão de água e combustível. A filtração de partículas do combustível diesel é governada separadamente pelo SYNTAPORE™, dentro da arquitetura de proteção da limpeza do combustível da ELIMFILTERS.'],
    ],
    basisKicker: 'BASE TÉCNICA', basisTitle: 'Referência técnica',
    evidenceTitle: 'Evidência no nível do produto',
    evidenceBody: 'A eficiência de separação de água, a perda de carga, a capacidade de vazão, a capacidade de retenção de água e os limites de manutenção pertencem aos dados validados de cada separador e ao método de ensaio aplicável.',
    governanceTitle: 'Governança das afirmações',
    governanceBody: 'Ao HYDROCORE™ não é atribuída uma eficiência de separação, um grau de mícrons, uma capacidade, um limite de vazão ou um intervalo de troca universais para todas as aplicações.',
    reviewKicker: 'QUANDO UMA REVISÃO TÉCNICA FAZ SENTIDO',
    reviewTitle: 'Quando a manutenção do separador se torna um problema de qualidade do combustível',
    reviewLead: 'O acúmulo repetido de água, a vida curta do separador, a contaminação microbiana, a falta de combustível ou evidências de corrosão a jusante justificam revisar o armazenamento, a transferência, a separação, a filtração e a manutenção como uma única cadeia de controle de contaminação.',
    systemKicker: 'INTEGRAÇÃO NO SISTEMA',
    systemTitle: 'Proteção da limpeza do combustível',
    systemLead: 'O HYDROCORE™ fornece a camada de separação de água e combustível padrão, não tipo turbina, dentro da proteção da limpeza do combustível da ELIMFILTERS.',
    systemButton: 'EXPLORAR O SISTEMA DE PROTEÇÃO',
    systemBody: 'O SYNTAPORE™ governa a filtração de partículas do combustível diesel. O TURBOCORE™ governa os sistemas separadores de água e combustível tipo turbina FH/FG. Manter essas funções separadas evita a atribuição incorreta da aplicação.',
    supportKicker: 'SUPORTE DE APLICAÇÃO',
    supportTitle: 'Traga a arquitetura do sistema de combustível, o histórico de água e o ciclo de trabalho, não apenas o número da peça.',
    supportLead: 'Use o Part Search quando o separador for conhecido. Para problemas repetidos de água, entupimento, restrição ou qualidade do combustível, solicite uma revisão técnica.',
    supportButton: 'SOLICITAR REVISÃO TÉCNICA',
    relatedKicker: 'TECNOLOGIAS RELACIONADAS',
    relatedTitle: 'Continue pela arquitetura de limpeza do combustível.',
    relatedFamily: 'Separadores de água e combustível',
  },
} as const;

const list = (items: readonly string[]) => <ul className={styles.list}>{items.map(x => <li key={x}>{x}</li>)}</ul>;

export function HydrocoreLocalizedPage({ lang }: { lang: HydrocoreLang }) {
 const c = COPY[lang];
 const pageUrl = `https://elimfilters.com/${lang}/technologies/hydrocore/`;
 const partSearch = `https://part-search.elimfilters.com/${lang}/family/ES9/`;
 const article = {
  '@context': 'https://schema.org', '@type': 'TechArticle', '@id': `${pageUrl}#article`,
  headline: c.title, name: 'HYDROCORE™', url: pageUrl, inLanguage: lang === 'pt' ? 'pt-BR' : 'es',
  description: c.description,
  image: 'https://elimfilters.com/images/fuellseparator-hero.avif',
  datePublished: '2026-10-02', dateModified: '2026-10-02',
  author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
  reviewedBy: TECHNICAL_REVIEWER,
  publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
  translationOfWork: { '@id': 'https://elimfilters.com/technologies/hydrocore/#article' },
  about: c.about.map(name => ({ '@type': 'Thing', name })),
  mentions: c.mentions.map(name => ({ '@type': 'Thing', name })),
  isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website', name: 'ELIMFILTERS', url: 'https://elimfilters.com/' },
 };
 const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: article.inLanguage, mainEntity: c.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
 const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: c.home, item: `https://elimfilters.com/${lang}/` }, { '@type': 'ListItem', position: 2, name: c.technologies, item: 'https://elimfilters.com/technologies/' }, { '@type': 'ListItem', position: 3, name: 'HYDROCORE™', item: pageUrl }] };
 const crumb = { color: 'rgba(255,255,255,.55)', textDecoration: 'none' };

 return <main id="main-content" className={styles.page}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}/>

  <section className={styles.hero} aria-labelledby="hydrocore-title">
   <img className={styles.heroBackground} src="/images/fuellseparator-hero.avif" alt={c.heroAlt}/>
   <div className={styles.heroShade} aria-hidden="true"/>
   <h1 id="hydrocore-title" className={styles.srOnly}>{c.title}</h1>
   <img className={styles.heroMark} src="/assets/HYDROCORE_final.avif" alt="HYDROCORE™"/>
  </section>

  <nav aria-label={c.breadcrumbLabel} style={{ padding: '1rem clamp(1.15rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.12)', background: '#020202' }}>
   <div className={styles.inner} style={{ display: 'flex', gap: '.65rem', fontSize: '.72rem', letterSpacing: '.08em' }}>
    <Link href={`/${lang}/`} style={crumb}>{c.home.toUpperCase()}</Link><span>→</span>
    <Link href="/technologies/" style={crumb}>{c.technologies.toUpperCase()}</Link><span>→</span>
    <span style={{ color: '#fff12d' }}>HYDROCORE™</span>
    <Link href="/technologies/hydrocore/" hrefLang="en" lang="en" style={{ ...crumb, marginLeft: 'auto' }}>ENGLISH</Link>
   </div>
  </nav>

  <section className={styles.introSection}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.eyebrow}</p>
   <h2 className={styles.displayTitle} style={{ fontSize: 'clamp(2.25rem,5.25vw,4.65rem)' }}>HYDROCORE™</h2>
   <p className={styles.applicationLine}><strong>{c.applicationLine}</strong></p>
   <p className={styles.lead}>{c.lead}</p>

   <div className={styles.mediaGrid}>
    <div className={styles.mediaCopy}>
     <div className={styles.metaStack}>
      <p><span>{c.metaTechnology}</span> HYDROCORE™</p>
      <p><span>{c.metaApplication}</span> {c.metaApplicationValue}</p>
      <p><span>{c.metaReview}</span> <Link href="/about/leadership/">{c.reviewer}</Link></p>
     </div>
     <p className={styles.eyebrow}>{c.descriptionKicker}</p>
     <h3 className={styles.featureTitle}>{c.featureTitle}</h3>
     <p className={styles.lead}>{c.featureLead}</p>
     {c.featureBody.map(text => <p key={text.slice(0, 40)} className={styles.bodyWide}>{text}</p>)}
    </div>
    <figure className={styles.mediaFigure}>
     <div style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: '#707070' }}>
      <img
       className={styles.mediaImage}
       src="/images/SYNTAPORE_media.png"
       alt={c.mediaAlt}
       style={{ border: 0, filter: 'grayscale(1) contrast(1.08) brightness(.96)', transform: 'scale(1.035)', transformOrigin: 'center center' }}
      />
     </div>
     <figcaption>{c.mediaCaption}</figcaption>
    </figure>
   </div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.realityKicker}</p>
   <h2 className={styles.h2}>{c.realityTitle}</h2>
   <p className={styles.lead}>{c.realityLead}</p>
   <div className={styles.twoColumnNotes}>
    <article className={styles.noteBlock}><h3 className={styles.h3}>{c.waterTitle}</h3><p className={styles.body}>{c.waterBody}</p></article>
    <article className={styles.noteBlock}><h3 className={styles.h3}>{c.restrictionTitle}</h3><p className={styles.body}>{c.restrictionBody}</p></article>
   </div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.environmentKicker}</p>
   <h2 className={styles.h2}>{c.environmentTitle}</h2>
   <div className={styles.editorialColumns}>
    <div><h3 className={styles.h3}>{c.approvedTitle}</h3>{list(c.approved)}</div>
    <div><h3 className={styles.h3}>{c.exposureTitle}</h3>{list(c.exposure)}</div>
    <div><h3 className={styles.h3}>{c.excludedTitle}</h3>{list(c.excluded)}</div>
   </div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.selectionKicker}</p>
   <h2 className={styles.h2}>{c.selectionTitle}</h2>
   <div className={styles.editorialColumns}>
    <div><h3 className={styles.h3}>{c.parametersTitle}</h3>{list(c.parameters)}</div>
    <div><h3 className={styles.h3}>{c.errorsTitle}</h3>{list(c.errors)}</div>
    <div><h3 className={styles.h3}>{c.inputsTitle}</h3>{list(c.inputs)}</div>
   </div>
   <div className={styles.inlineCta}><p><strong>{c.knownQ}</strong> {c.knownA} <strong>{c.problemQ}</strong> {c.problemA}</p><div className={styles.buttonRow}><a className={styles.primaryButton} href={partSearch} target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">{c.findPart}</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20Water%20Separator%20Assessment" data-conversion-action="application-support">{c.technicalReview}</a></div></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.behaviorKicker}</p>
   <h2 className={styles.h2}>{c.behaviorTitle}</h2>
   <p className={styles.lead}>{c.behaviorLead}</p>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.diagnosisKicker}</p>
   <h2 className={styles.h2}>{c.diagnosisTitle}</h2>
   {list(c.diagnosis)}
   <div className={styles.inlineCta}><p>{c.diagnosisCta}</p><a href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20System%20Review" data-conversion-action="application-support">{c.diagnosisButton}</a></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.faqKicker}</p>
   <h2 className={styles.h2}>{c.faqTitle}</h2>
   <div className={styles.faqList}>{c.faqs.map(([q, a]) => <details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.basisKicker}</p>
   <h2 className={styles.h2}>{c.basisTitle}</h2>
   <div className={styles.twoColumnNotes}>
    <article className={styles.noteBlock}><h3 className={styles.h3}>{c.evidenceTitle}</h3><p className={styles.body}>{c.evidenceBody}</p></article>
    <article className={styles.noteBlock}><h3 className={styles.h3}>{c.governanceTitle}</h3><p className={styles.body}>{c.governanceBody}</p></article>
   </div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.reviewKicker}</p>
   <h2 className={styles.h2}>{c.reviewTitle}</h2>
   <p className={styles.lead}>{c.reviewLead}</p>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.systemKicker}</p>
   <h2 className={styles.h2}>{c.systemTitle}</h2>
   <div className={styles.systemGrid}><div><p className={styles.lead}>{c.systemLead}</p><Link className={styles.systemButton} href="/systems/fuel-cleanliness/">{c.systemButton}</Link></div><p className={styles.bodyWide}>{c.systemBody}</p></div>
  </div></section>

  <section className={styles.ctaSection}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.supportKicker}</p>
   <h2 className={styles.h2}>{c.supportTitle}</h2>
   <p className={styles.lead}>{c.supportLead}</p>
   <div className={styles.buttonRow}><a className={styles.primaryButton} href={partSearch} target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">{c.findPart}</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20Water%20Separator%20Assessment" data-conversion-action="application-support">{c.supportButton}</a></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>{c.relatedKicker}</p>
   <h2 className={styles.h2}>{c.relatedTitle}</h2>
   <div className={styles.textLinks}><Link href="/technologies/syntapore/">SYNTAPORE™ →</Link><Link href="/technologies/turbocore/">TURBOCORE™ →</Link><Link href={`/${lang}/families/fuel-water-separators/`}>{c.relatedFamily} →</Link><a href={partSearch}>Part Search →</a></div>
  </div></section>
 </main>;
}
