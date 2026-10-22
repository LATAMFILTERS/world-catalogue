'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

const COPY_EN = {
  "heroTitle": "Understand the asset first. Then define its protection.",
  "heroEyebrow": "ELIMFILTERS® · ENGINEERING PHILOSOPHY",
  "heroParagraphs": [
    "Every industrial asset faces operating conditions, contaminants, and performance demands that call for technically grounded filtration solutions.",
    "At ELIMFILTERS, we believe asset protection begins with understanding how equipment works, which components are critical, what may compromise reliability, and how appropriate filtration can help preserve operation.",
    "That is why we combine engineering, specialized technologies, and applied technical knowledge to help manufacturers, operators, engineers, and distributors make informed decisions that can reduce contamination risks, support maintenance, and strengthen operational continuity."
  ],
  "heroStatement": "The filter is the means. Asset protection is the objective.",
  "sections": [
    {
      "title": "1. Why ELIMFILTERS exists",
      "lead": "The real cost of inadequate filtration is not the filter; it is the asset left unprotected.",
      "paragraphs": [
        "Every day, engines, industrial equipment, and heavy machinery operate under conditions that test their reliability. Precision components can be affected by microscopic contaminants that accelerate wear, interfere with critical systems, and contribute to unplanned downtime, maintenance costs, and lost productivity.",
        "The challenge is not simply to capture particles. It is to understand what each asset needs to protect, how contaminants affect its systems, and which filtration characteristics each application requires under actual operating conditions.",
        "ELIMFILTERS was founded to turn that need into an engineering philosophy: filters are not merely consumables but essential parts of a comprehensive asset-protection strategy.",
        "By developing filtration systems, specialized technologies, and applied technical knowledge, we aim to help manufacturers, operators, engineers, maintenance teams, and distributors make better-informed decisions, reduce contamination risks, and support equipment reliability and operational continuity."
      ],
      "closing": "Our mission is not simply to sell filters. It is to help protect the assets that keep industry moving."
    },
    {
      "title": "2. What we believe",
      "lead": "Asset protection begins with engineering decisions, not with choosing the cheapest filter.",
      "paragraphs": [
        "Every filtration component has a role within a larger system. Its performance must be evaluated against equipment characteristics, contaminants, operating conditions, and the reliability needs of each application.",
        "A filter should not be selected solely by price, size, or physical fit. Separation efficiency, contaminant-holding capacity, resistance, flow restriction, and service behavior can all affect the systems it is meant to protect.",
        "At ELIMFILTERS, we believe engineering, application knowledge, and contamination control must work together to help reduce wear, support reliability, and improve total cost of ownership (TCO)."
      ],
      "closing": "Our principle is simple: protect the value of the equipment throughout its operating life—not merely until the next service interval."
    },
    {
      "title": "3. Our engineering philosophy",
      "lead": "Every system has its own challenges. Protection must respond to them.",
      "paragraphs": [
        "Filtration engineering does not lend itself to universal solutions. Air intake, fuel, lubrication, hydraulic, and cooling systems operate under different conditions and face contaminants that affect their components in different ways.",
        "We therefore seek to understand each system before defining a filtration solution. Relevant factors include contaminant type and size, fluid properties, pressure, flow, temperature, required efficiency, holding capacity, and the operating environment.",
        "Filter media, materials, configurations, and sealing mechanisms must be selected to suit those conditions and the technical requirements of each application.",
        "Higher capture efficiency alone does not always mean a better solution. Protection must be balanced against flow behavior, element capacity, and the equipment's operational requirements."
      ],
      "closing": "Our aim is not simply to retain more contamination, but to determine how, where, and under which conditions filtration should contribute to protecting critical components."
    },
    {
      "title": "4. How we make engineering decisions",
      "lead": "Technical decisions must be grounded in evidence, not marketing promises.",
      "paragraphs": [
        "A technical specification becomes meaningful when it can be connected to defined measurement procedures, evaluation criteria, and application conditions.",
        "Our methodology draws on recognized standards and technical procedures, including ISO 16889 for multi-pass evaluation of hydraulic filter elements, ISO 5011 for air-cleaning system tests, and ISO 4406 for coding solid-particle contamination levels in hydraulic fluids.",
        "The relevant evaluation methods depend on the system and application. Not every standard applies to every product, and referencing a standard is not, by itself, evidence of certification.",
        "We favor technical documentation, engineering analysis, and applicable test results when available. Where evidence is insufficient, a specification remains subject to research, review, or further validation."
      ],
      "closing": "Our responsibility is to distinguish what we know, what we can demonstrate, and what still needs to be verified."
    },
    {
      "title": "5. Why we develop proprietary technologies",
      "lead": "Diverse industrial challenges call for specialization, not one generic solution for every application.",
      "paragraphs": [
        "Industrial assets and modern fleets contain systems with distinct protection requirements. Contamination conditions, environments, and wear mechanisms can differ significantly—even within the same equipment family.",
        "This reality drives ELIMFILTERS' proprietary technologies, organized around our five asset-protection systems.",
        "Technologies such as MACROCORE™, SYNTAPORE™, and NANOFORCE™ represent specialized domains within our filtration architecture, each with defined technical aims and applications.",
        "Their development reflects a long-term vision: create identifiable solutions, deepen system-specific knowledge, and establish consistent criteria for product selection, evaluation, and evolution.",
        "This approach helps direct research and development toward real needs while preserving the technical distinctions between systems and avoiding generalizations that could undermine correct selection."
      ],
      "closing": "Innovation at ELIMFILTERS is not about naming a technology; it is about delivering real, verifiable technical value through its application."
    },
    {
      "title": "6. Our commitment to customers",
      "lead": "Trust grows when customers understand what they are buying, why they need it, and how it helps protect their equipment.",
      "paragraphs": [
        "Our commitment goes beyond supplying filtration products. We aim to support distributors, engineers, maintenance leaders, operators, and asset owners with dependable technical information and decision-support tools.",
        "Through our Knowledge Center and evolving technology platform, we work to make application guidance, filtration principles, contamination mechanisms, selection criteria, and available technical documentation easier to access.",
        "Knowledge should be part of every commercial relationship. Informed customers can better evaluate operating conditions, understand contamination risks, and plan more consistent maintenance strategies.",
        "We are committed to communicating product capabilities transparently, distinguishing documented characteristics from those requiring additional validation, and building professional relationships based on trust, knowledge, and continuous improvement."
      ],
      "closing": "For ELIMFILTERS, a successful commercial relationship does not end with delivering a filter; it begins with helping protect the asset for which it was selected."
    }
  ],
  "principlesEyebrow": "7 GUIDING PRINCIPLES",
  "principlesTitle": "The ELIMFILTERS engineering principles"
};

const PRINCIPLES_EN = [
  {
    "num": "01",
    "title": "Protect the asset, not only the filter.",
    "desc": "Filtration helps preserve equipment, components, and industrial processes. The objective is asset protection and operational continuity."
  },
  {
    "num": "02",
    "title": "Understand contamination before controlling it.",
    "desc": "Identifying its origins, characteristics, and effects helps establish appropriate control strategies for each system and operating condition."
  },
  {
    "num": "03",
    "title": "Ground every application in engineering.",
    "desc": "No technology or configuration is automatically suitable for every asset. Selection must answer the actual needs of each application."
  },
  {
    "num": "04",
    "title": "Put evidence before claims.",
    "desc": "Specifications, capabilities, and results require verifiable information, relevant methods, and clear application limits."
  },
  {
    "num": "05",
    "title": "Use standards to guide engineering.",
    "desc": "Recognized standards and methods support evaluation; normative requirements must not be confused with product-specific certifications."
  },
  {
    "num": "06",
    "title": "Share useful knowledge.",
    "desc": "We promote technical information and tools that help customers, engineers, and distributors make informed decisions."
  },
  {
    "num": "07",
    "title": "Pursue reliability and sustainability.",
    "desc": "We seek to reduce contamination risks, protect critical components, and consider service life, resources, and environmental impact in equipment decisions."
  }
];
const COPY_ES = {
  "heroTitle": "Primero comprendemos el activo. Después definimos su protección.",
  "heroEyebrow": "ELIMFILTERS® · FILOSOFÍA DE INGENIERÍA",
  "heroParagraphs": [
    "Cada equipo industrial enfrenta condiciones de operación, contaminantes y exigencias de desempeño que requieren soluciones de filtración técnicamente fundamentadas.",
    "En ELIMFILTERS creemos que proteger un activo comienza por comprender cómo funciona, cuáles son sus componentes críticos, qué factores pueden comprometer su confiabilidad y cómo una estrategia adecuada de filtración puede contribuir a preservar su funcionamiento.",
    "Por eso integramos ingeniería, tecnologías especializadas y conocimiento técnico aplicado para ayudar a fabricantes, operadores, ingenieros y distribuidores a tomar decisiones que contribuyan a reducir riesgos de contaminación, optimizar el mantenimiento y favorecer la continuidad operativa."
  ],
  "heroStatement": "El filtro es el medio. La protección de los activos es el objetivo.",
  "sections": [
    {
      "title": "1. Por qué existe ELIMFILTERS",
      "lead": "El verdadero costo de una filtración inadecuada no está en el filtro, sino en el activo que deja de estar protegido.",
      "paragraphs": [
        "Cada día, motores, equipos industriales y maquinaria pesada trabajan bajo condiciones que ponen a prueba su confiabilidad. Detrás de su capacidad de operación existen componentes de alta precisión, donde contaminantes microscópicos pueden acelerar el desgaste, comprometer el funcionamiento de sistemas críticos y contribuir a fallas que se traducen en paradas no programadas, mayores costos de mantenimiento y pérdidas de productividad.",
        "El desafío no consiste simplemente en retener partículas. Consiste en comprender qué necesita proteger cada equipo, cómo afectan los contaminantes a sus sistemas y qué características de filtración exige cada aplicación, considerando las condiciones reales de operación.",
        "ELIMFILTERS nació para transformar esa necesidad en una filosofía de ingeniería: dejar de ver los filtros como simples consumibles y entenderlos como componentes fundamentales de una estrategia integral de protección de activos.",
        "A través del desarrollo de sistemas de filtración, tecnologías especializadas y conocimiento técnico aplicado, buscamos ayudar a fabricantes, operadores, ingenieros, responsables de mantenimiento y distribuidores a tomar decisiones más fundamentadas, reducir riesgos de contaminación y contribuir a preservar la confiabilidad y continuidad operativa de sus equipos."
      ],
      "closing": "Nuestra misión no es simplemente vender filtros. Es contribuir a proteger los activos que mantienen en movimiento a la industria."
    },
    {
      "title": "2. Lo que creemos",
      "lead": "La protección de activos comienza con decisiones de ingeniería, no con la elección del filtro más económico.",
      "paragraphs": [
        "Creemos que cada componente de filtración desempeña una función esencial dentro de un sistema mayor. Su desempeño debe evaluarse considerando las características del equipo, los contaminantes presentes, las condiciones de operación y las exigencias de confiabilidad de cada aplicación.",
        "Un filtro no debe seleccionarse únicamente por su precio, dimensiones o compatibilidad física. Su eficiencia de separación, capacidad de retención, resistencia, restricción al flujo y comportamiento durante el servicio pueden influir significativamente en el funcionamiento de los sistemas que protege.",
        "En ELIMFILTERS creemos que la verdadera eficiencia se alcanza cuando la ingeniería, el conocimiento de la aplicación y el control de contaminación trabajan conjuntamente para contribuir a reducir el desgaste, mejorar la confiabilidad y optimizar el costo total de propiedad (TCO)."
      ],
      "closing": "Nuestro principio es simple: proteger el valor del equipo durante su vida operativa, no solamente cumplir con el próximo intervalo de mantenimiento."
    },
    {
      "title": "3. Nuestra filosofía de ingeniería",
      "lead": "Cada sistema tiene sus propios desafíos. La protección debe responder a ellos.",
      "paragraphs": [
        "La ingeniería de filtración no admite soluciones universales. Los sistemas de admisión de aire, combustible, lubricación, hidráulicos y de enfriamiento operan bajo condiciones diferentes y están expuestos a contaminantes que afectan de manera distinta sus componentes.",
        "Por ello, nuestra filosofía se fundamenta en comprender el comportamiento de cada sistema antes de definir una solución de filtración. Analizamos aspectos como el tamaño y la naturaleza de los contaminantes, las características del fluido, la presión, el caudal, la temperatura, la eficiencia requerida, la capacidad de retención y las condiciones ambientales.",
        "La selección de los medios filtrantes, materiales, configuraciones y mecanismos de sellado debe responder a esas variables y a los requisitos técnicos de cada aplicación.",
        "Entendemos que una mayor eficiencia de captura no representa por sí sola una mejor solución. La protección debe equilibrarse con el comportamiento del flujo, la capacidad del elemento y los requisitos operativos del equipo."
      ],
      "closing": "No buscamos simplemente retener más contaminantes. Buscamos definir cómo, dónde y bajo qué condiciones debe actuar la filtración para contribuir a proteger los componentes críticos."
    },
    {
      "title": "4. Cómo tomamos decisiones de ingeniería",
      "lead": "Las decisiones técnicas deben estar sustentadas en evidencia, no en promesas comerciales.",
      "paragraphs": [
        "En ELIMFILTERS consideramos que una especificación técnica solo adquiere verdadero valor cuando puede relacionarse con procedimientos de medición, criterios de evaluación y condiciones de aplicación claramente definidos.",
        "Nuestra metodología toma como referencia normas internacionales y procedimientos técnicos reconocidos, entre ellos ISO 16889 para la evaluación multipaso de elementos filtrantes hidráulicos, ISO 5011 para ensayos de sistemas de limpieza de aire e ISO 4406 para la clasificación del nivel de contaminación por partículas sólidas en fluidos hidráulicos.",
        "Cada sistema y aplicación requiere determinar cuáles métodos de evaluación son pertinentes. No todas las normas corresponden a todos los productos ni una referencia normativa constituye, por sí sola, evidencia de certificación.",
        "Promovemos decisiones sustentadas en documentación técnica, análisis de ingeniería y resultados de ensayos cuando estos se encuentran disponibles y son aplicables. Cuando la evidencia resulta insuficiente, la especificación permanece sujeta a investigación, revisión o validación adicional."
      ],
      "closing": "Nuestra responsabilidad es distinguir entre lo que conocemos, lo que podemos demostrar y lo que todavía necesita comprobarse."
    },
    {
      "title": "5. Por qué desarrollamos tecnologías propias",
      "lead": "La diversidad de los desafíos industriales exige especialización, no soluciones genéricas para todas las aplicaciones.",
      "paragraphs": [
        "Los equipos industriales y las flotas modernas reúnen sistemas con exigencias particulares de protección. Las condiciones de contaminación, los ambientes operativos y los mecanismos de desgaste pueden variar considerablemente entre aplicaciones, incluso dentro de una misma familia de equipos.",
        "Esta realidad impulsa el desarrollo de las tecnologías propias de ELIMFILTERS, organizadas dentro de nuestros cinco sistemas de protección.",
        "Tecnologías como MACROCORE™, SYNTAPORE™ y NANOFORCE™ representan ámbitos especializados de nuestra arquitectura de filtración, cada uno con objetivos técnicos y aplicaciones definidos.",
        "Su desarrollo responde a una visión de largo plazo: construir soluciones identificables, ampliar el conocimiento técnico de cada sistema y establecer criterios consistentes para la selección, evaluación y evolución de nuestros productos.",
        "Esta estrategia permite orientar la investigación y el desarrollo hacia necesidades concretas, manteniendo la diferenciación técnica entre sistemas y evitando generalizaciones que puedan comprometer la selección de una solución adecuada."
      ],
      "closing": "La innovación para ELIMFILTERS no consiste en desarrollar una tecnología por su nombre, sino en que su aplicación aporte un valor técnico real y verificable."
    },
    {
      "title": "6. Nuestro compromiso con los clientes",
      "lead": "La confianza se construye cuando el cliente comprende qué está adquiriendo, por qué lo necesita y cómo contribuye a proteger sus equipos.",
      "paragraphs": [
        "Nuestro compromiso va más allá del suministro de productos de filtración. Buscamos acompañar a distribuidores, ingenieros, responsables de mantenimiento, operadores y propietarios de equipos mediante información técnica confiable y herramientas que faciliten decisiones fundamentadas.",
        "A través de nuestro Centro de Conocimiento y de la evolución de nuestra plataforma tecnológica, trabajamos para poner a disposición información sobre aplicaciones, principios de filtración, mecanismos de contaminación, criterios de selección y documentación técnica disponible.",
        "Creemos que el conocimiento debe formar parte de la relación comercial. Un cliente informado puede evaluar mejor las condiciones de operación, comprender los riesgos asociados a la contaminación y desarrollar estrategias de mantenimiento más consistentes.",
        "Nos comprometemos a comunicar las capacidades de nuestros productos con transparencia, distinguir las características documentadas de las que requieren validación adicional y mantener una relación profesional basada en la confianza, el conocimiento y la mejora continua."
      ],
      "closing": "Para ELIMFILTERS, una relación comercial exitosa no termina con la entrega de un filtro: comienza con la responsabilidad de contribuir a proteger el activo al que está destinado."
    }
  ],
  "principlesEyebrow": "7 PRINCIPIOS RECTORES",
  "principlesTitle": "Los principios de ingeniería de ELIMFILTERS"
};

const PRINCIPLES_ES = [
  {
    "num": "01",
    "title": "Proteger el activo, no solamente el filtro.",
    "desc": "La filtración es un medio para contribuir a preservar equipos, componentes y procesos industriales. Nuestro objetivo es la protección de los activos y su continuidad operativa."
  },
  {
    "num": "02",
    "title": "Comprender la contaminación antes de combatirla.",
    "desc": "Identificar su origen, características y efectos permite establecer estrategias de control adecuadas para cada sistema y condición de operación."
  },
  {
    "num": "03",
    "title": "Fundamentar técnicamente cada aplicación.",
    "desc": "No asumimos que una misma tecnología o configuración sea adecuada para todos los equipos. La selección debe responder a las necesidades reales de cada aplicación."
  },
  {
    "num": "04",
    "title": "Dar prioridad a la evidencia.",
    "desc": "Las especificaciones, capacidades y resultados deben sustentarse en información comprobable, métodos pertinentes y límites de aplicación claramente establecidos."
  },
  {
    "num": "05",
    "title": "Utilizar las normas como guías de ingeniería.",
    "desc": "Los estándares y las metodologías reconocidas orientan la evaluación, sin confundir requisitos normativos con certificaciones o validaciones específicas."
  },
  {
    "num": "06",
    "title": "Compartir conocimiento útil.",
    "desc": "Promovemos información técnica y herramientas que ayuden a clientes, ingenieros y distribuidores a tomar decisiones mejor fundamentadas."
  },
  {
    "num": "07",
    "title": "Orientarnos a la confiabilidad y la sostenibilidad.",
    "desc": "Buscamos contribuir a reducir riesgos de contaminación, proteger componentes críticos y favorecer decisiones que consideren la vida operativa, los recursos y el impacto ambiental."
  }
];
const COPY_PT = {
  "heroTitle": "Primeiro compreendemos o ativo. Depois definimos sua proteção.",
  "heroEyebrow": "ELIMFILTERS® · FILOSOFIA DE ENGENHARIA",
  "heroParagraphs": [
    "Cada equipamento industrial enfrenta condições de operação, contaminantes e exigências de desempenho que requerem soluções de filtração tecnicamente fundamentadas.",
    "Na ELIMFILTERS, acreditamos que proteger um ativo começa por compreender como ele funciona, quais componentes são críticos, o que pode comprometer sua confiabilidade e como a filtração adequada pode contribuir para preservar sua operação.",
    "Por isso integramos engenharia, tecnologias especializadas e conhecimento técnico aplicado para ajudar fabricantes, operadores, engenheiros e distribuidores a tomar decisões fundamentadas que contribuam para reduzir riscos de contaminação, otimizar a manutenção e favorecer a continuidade operacional."
  ],
  "heroStatement": "O filtro é o meio. A proteção dos ativos é o objetivo.",
  "sections": [
    {
      "title": "1. Por que a ELIMFILTERS existe",
      "lead": "O verdadeiro custo de uma filtração inadequada não está no filtro, mas no ativo que deixa de ser protegido.",
      "paragraphs": [
        "Todos os dias, motores, equipamentos industriais e máquinas pesadas operam sob condições que colocam sua confiabilidade à prova. Componentes de alta precisão podem sofrer os efeitos de contaminantes microscópicos que aceleram o desgaste, comprometem sistemas críticos e contribuem para paradas não programadas, custos de manutenção e perdas de produtividade.",
        "O desafio não consiste apenas em reter partículas. Consiste em compreender o que cada equipamento precisa proteger, como os contaminantes afetam seus sistemas e quais características de filtração cada aplicação exige nas condições reais de operação.",
        "A ELIMFILTERS nasceu para transformar essa necessidade em uma filosofia de engenharia: deixar de ver filtros como simples consumíveis e entendê-los como partes fundamentais de uma estratégia integral de proteção de ativos.",
        "Por meio de sistemas de filtração, tecnologias especializadas e conhecimento técnico aplicado, buscamos ajudar fabricantes, operadores, engenheiros, equipes de manutenção e distribuidores a tomar decisões mais fundamentadas, reduzir riscos de contaminação e contribuir para a confiabilidade e a continuidade operacional dos equipamentos."
      ],
      "closing": "Nossa missão não é simplesmente vender filtros. É contribuir para proteger os ativos que mantêm a indústria em movimento."
    },
    {
      "title": "2. No que acreditamos",
      "lead": "A proteção de ativos começa com decisões de engenharia, não com a escolha do filtro mais barato.",
      "paragraphs": [
        "Cada componente de filtração desempenha uma função essencial dentro de um sistema maior. Seu desempenho precisa ser avaliado considerando as características do equipamento, os contaminantes, as condições de operação e as exigências de confiabilidade de cada aplicação.",
        "Um filtro não deve ser escolhido apenas pelo preço, dimensões ou compatibilidade física. Eficiência de separação, capacidade de retenção, resistência, restrição ao fluxo e comportamento em serviço podem influenciar significativamente os sistemas que ele protege.",
        "Na ELIMFILTERS, acreditamos que engenharia, conhecimento da aplicação e controle de contaminação devem atuar juntos para ajudar a reduzir desgaste, melhorar a confiabilidade e otimizar o custo total de propriedade (TCO)."
      ],
      "closing": "Nosso princípio é simples: proteger o valor do equipamento durante sua vida operacional, e não apenas cumprir o próximo intervalo de manutenção."
    },
    {
      "title": "3. Nossa filosofia de engenharia",
      "lead": "Cada sistema tem seus próprios desafios. A proteção deve responder a eles.",
      "paragraphs": [
        "A engenharia de filtração não admite soluções universais. Sistemas de admissão de ar, combustível, lubrificação, hidráulicos e de arrefecimento operam sob condições diferentes e estão sujeitos a contaminantes com efeitos distintos sobre seus componentes.",
        "Nossa filosofia consiste em compreender o comportamento de cada sistema antes de definir a filtração. Consideramos tamanho e natureza dos contaminantes, propriedades do fluido, pressão, vazão, temperatura, eficiência exigida, capacidade de retenção e ambiente operacional.",
        "A seleção dos meios filtrantes, materiais, configurações e mecanismos de vedação deve responder a essas variáveis e aos requisitos técnicos de cada aplicação.",
        "Uma eficiência de captura maior não significa, por si só, uma solução melhor. A proteção deve ser equilibrada com o comportamento do fluxo, a capacidade do elemento e os requisitos operacionais do equipamento."
      ],
      "closing": "Não buscamos apenas reter mais contaminantes. Buscamos definir como, onde e sob quais condições a filtração deve contribuir para proteger componentes críticos."
    },
    {
      "title": "4. Como tomamos decisões de engenharia",
      "lead": "Decisões técnicas devem se apoiar em evidências, não em promessas comerciais.",
      "paragraphs": [
        "Uma especificação técnica só adquire valor real quando pode ser relacionada a procedimentos de medição, critérios de avaliação e condições de aplicação claramente definidos.",
        "Nossa metodologia utiliza normas internacionais e procedimentos técnicos reconhecidos como referência, incluindo ISO 16889 para avaliação multipasse de elementos filtrantes hidráulicos, ISO 5011 para ensaios de sistemas de limpeza de ar e ISO 4406 para classificação dos níveis de contaminação por partículas sólidas em fluidos hidráulicos.",
        "Cada sistema e aplicação exige métodos de avaliação adequados. Nem todas as normas se aplicam a todos os produtos, e a referência a uma norma não constitui, por si só, evidência de certificação.",
        "Promovemos decisões fundamentadas em documentação técnica, análise de engenharia e resultados de ensaios quando disponíveis e aplicáveis. Quando as evidências são insuficientes, a especificação permanece sujeita a pesquisa, revisão ou validação adicional."
      ],
      "closing": "Nossa responsabilidade é distinguir o que sabemos, o que podemos demonstrar e o que ainda precisa ser comprovado."
    },
    {
      "title": "5. Por que desenvolvemos tecnologias próprias",
      "lead": "Os desafios industriais exigem especialização, não soluções genéricas para todas as aplicações.",
      "paragraphs": [
        "Equipamentos industriais e frotas modernas reúnem sistemas com exigências particulares de proteção. As condições de contaminação, os ambientes e os mecanismos de desgaste variam entre aplicações, mesmo dentro de uma mesma família de equipamentos.",
        "Essa realidade impulsiona as tecnologias próprias da ELIMFILTERS, organizadas em nossos cinco sistemas de proteção.",
        "Tecnologias como MACROCORE™, SYNTAPORE™ e NANOFORCE™ representam áreas especializadas de nossa arquitetura de filtração, cada uma com objetivos técnicos e aplicações definidos.",
        "Seu desenvolvimento reflete uma visão de longo prazo: criar soluções identificáveis, aprofundar o conhecimento sobre cada sistema e estabelecer critérios consistentes para seleção, avaliação e evolução dos produtos.",
        "Essa estratégia direciona pesquisa e desenvolvimento às necessidades reais, preservando diferenças técnicas entre sistemas e evitando generalizações que possam comprometer a seleção adequada."
      ],
      "closing": "Para a ELIMFILTERS, inovar não é dar um nome a uma tecnologia, mas fazer com que sua aplicação ofereça valor técnico real e verificável."
    },
    {
      "title": "6. Nosso compromisso com os clientes",
      "lead": "A confiança é construída quando o cliente compreende o que está adquirindo, por que precisa e como isso contribui para proteger seus equipamentos.",
      "paragraphs": [
        "Nosso compromisso vai além do fornecimento de produtos de filtração. Buscamos apoiar distribuidores, engenheiros, gestores de manutenção, operadores e proprietários de equipamentos com informações técnicas confiáveis e ferramentas para decisões fundamentadas.",
        "Por meio de nosso Centro de Conhecimento e da evolução da plataforma tecnológica, trabalhamos para facilitar o acesso a informações sobre aplicações, princípios de filtração, mecanismos de contaminação, critérios de seleção e documentação técnica disponível.",
        "O conhecimento deve integrar a relação comercial. Clientes bem informados podem avaliar melhor as condições de operação, compreender riscos de contaminação e planejar estratégias de manutenção mais consistentes.",
        "Nos comprometemos a comunicar as capacidades dos produtos com transparência, distinguir características documentadas daquelas que requerem validação adicional e manter relações profissionais baseadas em confiança, conhecimento e melhoria contínua."
      ],
      "closing": "Para a ELIMFILTERS, uma relação comercial bem-sucedida não termina com a entrega de um filtro; começa com a responsabilidade de contribuir para proteger o ativo ao qual ele se destina."
    }
  ],
  "principlesEyebrow": "7 PRINCÍPIOS ORIENTADORES",
  "principlesTitle": "Os princípios de engenharia da ELIMFILTERS"
};

const PRINCIPLES_PT = [
  {
    "num": "01",
    "title": "Proteger o ativo, não apenas o filtro.",
    "desc": "A filtração contribui para preservar equipamentos, componentes e processos industriais. O objetivo é a proteção dos ativos e a continuidade operacional."
  },
  {
    "num": "02",
    "title": "Compreender a contaminação antes de combatê-la.",
    "desc": "Identificar origem, características e efeitos permite estabelecer estratégias de controle adequadas a cada sistema e condição de operação."
  },
  {
    "num": "03",
    "title": "Fundamentar tecnicamente cada aplicação.",
    "desc": "Não presumimos que uma tecnologia ou configuração seja adequada para todos os equipamentos. A seleção deve responder às necessidades reais."
  },
  {
    "num": "04",
    "title": "Dar prioridade às evidências.",
    "desc": "Especificações, capacidades e resultados devem se apoiar em dados verificáveis, métodos pertinentes e limites de aplicação claramente estabelecidos."
  },
  {
    "num": "05",
    "title": "Utilizar as normas como guias de engenharia.",
    "desc": "Normas e métodos reconhecidos orientam a avaliação, sem confundir requisitos normativos com certificações específicas."
  },
  {
    "num": "06",
    "title": "Compartilhar conhecimento útil.",
    "desc": "Promovemos informações técnicas e ferramentas que ajudem clientes, engenheiros e distribuidores a tomar decisões mais fundamentadas."
  },
  {
    "num": "07",
    "title": "Buscar confiabilidade e sustentabilidade.",
    "desc": "Buscamos reduzir riscos de contaminação, proteger componentes críticos e considerar vida operacional, recursos e impacto ambiental nas decisões."
  }
];

export default function OurPhilosophyPage() {
  const { i18n } = useTranslation();
  const isPortuguese = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('pt');
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');
  const principles = isPortuguese ? PRINCIPLES_PT : isSpanish ? PRINCIPLES_ES : PRINCIPLES_EN;

  const copy = isPortuguese ? COPY_PT : isSpanish ? COPY_ES : COPY_EN;

  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technology LLC',
    url: 'https://elimfilters.com',
    logo: 'https://elimfilters.com/assets/elimfilters-logo-transparent.png',
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    description: 'ELIMFILTERS is an industrial asset protection company protecting critical equipment through contamination control, proprietary filtration technologies, and system-level engineering frameworks.',
  };

  const schemaPhilosophyPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Our Philosophy — ELIMFILTERS Engineering Doctrine',
    description: 'The official engineering philosophy of ELIMFILTERS. Guided by contamination science, international metrology standards, and system-level asset protection principles.',
    url: 'https://elimfilters.com/about/philosophy',
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
    dateModified: '2026-10-22',
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://elimfilters.com/about' },
      { '@type': 'ListItem', position: 3, name: 'Philosophy', item: 'https://elimfilters.com/about/philosophy' },
    ],
  };

  return (
    <main id="main-content" className="philosophy-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPhilosophyPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isPortuguese ? 'Filosofia' : isSpanish ? 'Filosofía' : 'Philosophy'} />

      <section className="philosophy-hero" style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div className="philosophy-hero-inner" style={wrap}>
          <div className="philosophy-hero-heading">
            <p style={eyebrow}>{copy.heroEyebrow}</p>
            <h1 style={heroTitle}>{copy.heroTitle}</h1>
          </div>
          <div className="philosophy-hero-narrative">
            {copy.heroParagraphs.map((paragraph) => <p key={paragraph} style={heroLead}>{paragraph}</p>)}
          </div>
          <p className="philosophy-hero-statement">{copy.heroStatement}</p>
        </div>
      </section>

      {[copy.sections.slice(0, 2), copy.sections.slice(2, 4), copy.sections.slice(4, 6)].map((pair, groupIndex) => (
        <section key={groupIndex} style={groupIndex % 2 === 0 ? altSection1 : altSection2} aria-label={isPortuguese ? `Filosofia de engenharia: partes ${groupIndex * 2 + 1} e ${groupIndex * 2 + 2}` : isSpanish ? `Filosofía de ingeniería: apartados ${groupIndex * 2 + 1} y ${groupIndex * 2 + 2}` : `Engineering philosophy sections ${groupIndex * 2 + 1} and ${groupIndex * 2 + 2}`}>
          <div className="philosophy-sections-grid" style={twoColGrid}>
            {pair.map((part) => (
              <article className="philosophy-statement" key={part.title}>
                <h2 style={sectionTitle}>{part.title}</h2>
                <p className="philosophy-statement-lead">{part.lead}</p>
                <div className="philosophy-statement-body">
                  {part.paragraphs.map((paragraph) => <p key={paragraph} style={sectionLead}>{paragraph}</p>)}
                </div>
                <p className="philosophy-statement-closing">{part.closing}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section style={altSection2}>
        <div style={wrap}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>{copy.principlesEyebrow}</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '100%', margin: '0 auto 3rem' }}>{copy.principlesTitle}</h2>
          <div className="philosophy-principles-grid">
            {principles.map((pr) => (
              <article key={pr.num} style={principleCard}>
                <span style={principleNum}>{pr.num}</span>
                <h3 style={principleTitle}>{pr.title}</h3>
                <p style={principleDesc}>{pr.desc}</p>
              </article>
            ))}
          </div>
          <p className="philosophy-final-principle">{copy.heroStatement}</p>
        </div>
      </section>
      <style jsx>{`
        .philosophy-hero-inner{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,.98fr) minmax(0,1.02fr);gap:clamp(2rem,5vw,5rem);align-items:start}
        .philosophy-hero-heading,.philosophy-hero-narrative{min-width:0}
        .philosophy-hero-heading h1{font-size:clamp(2.25rem,3.75vw,3.75rem);line-height:1.08;max-width:650px;letter-spacing:-.04em}
        .philosophy-hero-narrative{display:grid;gap:1rem;padding-top:1.75rem;max-width:650px}
        .philosophy-hero-narrative p{margin:0;text-align:left}
        .philosophy-hero-statement{grid-column:1/-1;color:#FFF12D;border-top:1px solid rgba(255,241,45,.45);padding-top:1.25rem;margin:.3rem 0 0;font-family:var(--font-display);font-size:clamp(1rem,1.45vw,1.35rem);font-weight:700;letter-spacing:-.015em;line-height:1.5;text-align:left}
        .philosophy-sections-grid{align-items:start}
        .philosophy-statement{min-width:0;max-width:560px}
        .philosophy-statement h2{max-width:25ch;line-height:1.2}
        .philosophy-statement-lead{color:#fff;font-weight:650;font-size:clamp(1.06rem,1.28vw,1.17rem);line-height:1.55;text-align:left;margin:0 0 1.4rem}
        .philosophy-statement-body{display:grid;gap:1rem}
        .philosophy-statement-body p{margin:0;text-align:left;line-height:1.75}
        .philosophy-statement-closing{border-left:3px solid #FFF12D;padding:.2rem 0 .2rem 1rem;margin:1.5rem 0 0;color:#fff;font-weight:600;line-height:1.6;font-size:1.02rem;text-align:left}
        .philosophy-principles-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;max-width:1180px;margin:auto}
        .philosophy-principles-grid article{max-width:none;min-width:0}
        .philosophy-final-principle{text-align:center;margin:3rem auto 0;padding-top:1.5rem;border-top:1px solid rgba(255,241,45,.35);max-width:850px;color:#FFF12D;font-family:var(--font-display);font-size:clamp(1.2rem,2vw,1.75rem);font-weight:700;line-height:1.4}
        @media(max-width:900px){.philosophy-hero-inner{grid-template-columns:1fr;gap:1.5rem}.philosophy-hero-narrative{padding-top:0}.philosophy-sections-grid{grid-template-columns:1fr!important}.philosophy-statement{max-width:750px}}
        @media(max-width:640px){.philosophy-hero-heading h1{font-size:clamp(2.1rem,8vw,3rem)}.philosophy-principles-grid{grid-template-columns:1fr}.philosophy-hero-statement{font-size:1.08rem}}
      `}</style>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: 'clamp(490px,62vh,720px)', boxSizing:'border-box', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', padding:'clamp(7rem,9vw,8.5rem) clamp(1.25rem,6vw,6rem) clamp(3.5rem,6vw,5rem)', isolation:'isolate' };
const heroImage: CSSProperties = { position:'absolute', inset:0, backgroundImage:'url(/images/air-filters-lab.avif)', backgroundSize:'cover', backgroundPosition:'65% center', opacity:.34 };
const heroOverlay: CSSProperties = { position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(0,0,0,.96) 0%,rgba(0,0,0,.82) 48%,rgba(0,0,0,.75) 100%)' };
const eyebrow: CSSProperties = { color:'#FFF12D', fontFamily:'var(--font-display)', fontSize:'.72rem', fontWeight:700, letterSpacing:'.16em', margin:'0 0 1.2rem', textTransform:'uppercase', position:'relative', zIndex:2 };
const heroTitle: CSSProperties = { position:'relative', zIndex:2, fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:'-.04em', lineHeight:1.08, fontSize:'clamp(2.25rem,3.75vw,3.75rem)', margin:0, textTransform:'uppercase', maxWidth:'650px' };
const heroLead: CSSProperties = { position:'relative', zIndex:2, maxWidth:'650px', color:'rgba(255,255,255,.88)', fontSize:'clamp(1rem,1.18vw,1.12rem)', lineHeight:1.7, fontWeight:400, textAlign:'left' };
const altSection1: CSSProperties = { background:'#050505', color:'#fff', padding:'clamp(4rem,7vw,6.5rem) clamp(1.25rem,6vw,6rem)', borderTop:'1px solid rgba(255,255,255,.08)' };
const altSection2: CSSProperties = { background:'#000', color:'#fff', padding:'clamp(4rem,7vw,6.5rem) clamp(1.25rem,6vw,6rem)', borderTop:'1px solid rgba(255,255,255,.08)' };
const twoColGrid: CSSProperties = { maxWidth:'1180px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:'clamp(2.5rem,6vw,5rem)' };
const sectionTitle: CSSProperties = { fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,2.45vw,2.12rem)', lineHeight:1.2, letterSpacing:'-.02em', margin:'0 0 1.25rem', textTransform:'uppercase', color:'#FFF12D' };
const sectionLead: CSSProperties = { color:'rgba(255,255,255,.75)', lineHeight:1.75, fontSize:'1rem', margin:0, textAlign:'left' };
const principleCard: CSSProperties = { background:'#080808', border:'1px solid rgba(255,255,255,.12)', padding:'clamp(1.4rem,3vw,2rem)', display:'flex', flexDirection:'column', gap:'.75rem', width:'100%' };
const principleNum: CSSProperties = { fontFamily:'var(--font-display)', fontWeight:700, fontSize:'.85rem', color:'#FFF12D' };
const principleTitle: CSSProperties = { fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.15rem', lineHeight:1.4, color:'#fff', margin:0 };
const principleDesc: CSSProperties = { fontSize:'.98rem', color:'rgba(255,255,255,.7)', lineHeight:1.7, margin:0, textAlign:'left' };
