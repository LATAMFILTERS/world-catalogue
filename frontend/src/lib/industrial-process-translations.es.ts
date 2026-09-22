/**
 * Spanish (es) content overrides for the Industrial & Process data architecture.
 * Only translated fields are listed; anything omitted falls back to the
 * English source in industrial-process-architecture.ts. This keeps partial
 * translation coverage safe to ship incrementally.
 */

export interface EngineeringNoteOverride {
  title: string;
  body: string;
}

export interface TechnologyEsOverride {
  title?: string;
  summary?: string;
  treatmentFunction?: string;
  mechanisms?: readonly string[];
  applications?: readonly string[];
  conditions?: readonly string[];
  selectionInputs?: readonly string[];
  serviceSignals?: readonly string[];
  subfamilies?: readonly string[];
  engineeringNotes?: readonly EngineeringNoteOverride[];
  customFaqs?: readonly (readonly [string, string])[];
}

export interface SelectionGuideEsOverride {
  title: string;
  body: string;
}

export interface QualificationGroupEsOverride {
  title: string;
  items: readonly string[];
}

export interface PlatformEsOverride {
  summary?: string;
  positioning?: string;
  selectionContext?: { eyebrow: string; title: string; lead: string };
  selectionGuide?: Record<string, SelectionGuideEsOverride>;
  qualificationGroups?: readonly QualificationGroupEsOverride[];
  technologies?: Record<string, TechnologyEsOverride>;
}

export const COMMON_SELECTION_ES: readonly string[] = [
  'Condiciones de proceso y objetivo de tratamiento',
  'Caudal y perfil de duty',
  'Presión de operación y de diseño',
  'Temperatura y composición del fluido, gas, aire o agua',
  'Tipo de contaminante, concentración y patrón de carga',
  'Condición de salida requerida u objetivo de limpieza',
  'Materiales, compatibilidad química y restricciones de conexión',
  'Housing, vessel o equipo de proceso existente',
];

export const INDUSTRIAL_PROCESS_ES: Record<string, PlatformEsOverride> = {
  aeremis: {
    summary: 'Tratamiento industrial de aire para ventilación general, entornos de alta limpieza y control de contaminación molecular.',
    positioning: 'AEREMIS™ organiza el tratamiento industrial de aire por desafío de contaminante y condición de aire requerida — desde control particulado general, pasando por etapas críticas de alta eficiencia, hasta tratamiento molecular para gases, vapores y olores. No es un filtro único ni una clase de eficiencia universal; la vía de tratamiento sigue el objetivo de calidad de aire, el perfil del contaminante, la envolvente operativa y el límite del sistema.',
    selectionContext: {
      eyebrow: 'ALCANCE DE TRATAMIENTO DE AIRE',
      title: 'Empareja el problema de contaminación con la vía de tratamiento.',
      lead: 'AEREMIS™ separa el control particulado general, la filtración de aire crítico y el tratamiento molecular para que cada aplicación empiece por el problema real de calidad de aire y no por una forma genérica de filtro.',
    },
    selectionGuide: {
      'general-air-filtration': {
        title: 'Control particulado general',
        body: 'Para ventilación industrial, aire de reposición y trabajos generales de manejo de aire donde el desafío principal es la carga particulada aérea y la caída de presión aceptable del sistema.',
      },
      'he-criva': {
        title: 'Control de limpieza crítica',
        body: 'Para aplicaciones de etapa final o alta limpieza donde el control de partículas finas, la integridad del filtro, el sellado y la prevención de bypass forman parte del requisito de tratamiento.',
      },
      'ma-trea': {
        title: 'Control de contaminación molecular',
        body: 'Para desafíos moleculares de gas, vapor, olor o corrosivos que no se resuelven solo con filtración particulada y requieren un medio seleccionado según la química del contaminante y las condiciones de contacto.',
      },
    },
    qualificationGroups: [
      { title: 'Caudal y entorno', items: ['Caudal de aire y perfil de duty', 'Presión estática disponible y resistencia permisible del sistema', 'Rango de temperatura y humedad', 'Fuente de aire exterior, recirculado o de proceso'] },
      { title: 'Desafío de contaminación', items: ['Tamaño de partícula, concentración y patrón de carga', 'Limpieza requerida o condición del espacio protegido', 'Química de gas, vapor u olor cuando se requiere tratamiento molecular', 'Sensibilidad del proceso u ocupante aguas abajo'] },
      { title: 'Integración y verificación', items: ['Secuencia de prefiltro, etapa final y tratamiento molecular', 'Condición del housing, sellado y control de bypass', 'Estrategia de monitoreo de presión diferencial o condición', 'Acceso de servicio, planificación de reemplazo y método de verificación'] },
    ],
    technologies: {
      'general-air-filtration': {
        summary: 'Filtración particulada para ventilación industrial, aire de reposición y trabajos generales de manejo de aire.',
        treatmentFunction: 'Controlar la partícula aérea antes de que llegue a espacios ocupados, salas de equipo o etapas de tratamiento de aire aguas abajo.',
        mechanisms: ['Prefiltración y captura particulada por etapas', 'Selección de medio por carga de polvo y caída de presión permisible', 'Configuración alrededor del sistema de manejo de aire existente'],
        applications: ['Ventilación general', 'Sistemas de aire de reposición', 'Manejo de aire de salas de equipo', 'Prefiltración particulada aguas arriba'],
        conditions: ['Carga variable de polvo de aire exterior', 'Duty de ventilación continua o intermitente', 'Restricciones de espacio y acceso de servicio', 'Límites de caída de presión en el sistema de manejo de aire'],
        serviceSignals: ['Aumento inesperado de caída de presión', 'Polvo visible aguas abajo', 'Intervalos de servicio cortos', 'Evidencia de bypass o sellado'],
        engineeringNotes: [],
      },
      'he-criva': {
        summary: 'Control particulado de alta eficiencia para aplicaciones de aire crítico y de alta limpieza.',
        treatmentFunction: 'Reducir la partícula fina aérea donde la limpieza requerida es más exigente que el duty de ventilación general.',
        mechanisms: ['Medio particulado de alta eficiencia', 'Prefiltración por etapas para proteger las etapas finales', 'Control de sellado y bypass en la interfaz filtro-housing'],
        applications: ['Ventilación crítica', 'Entornos de producción controlados', 'Filtración particulada de etapa final', 'Manejo de aire de alta limpieza'],
        conditions: ['Requisito de limpieza definido', 'Desafío de partícula fina', 'Control estricto de bypass', 'Sensibilidad a caída de presión en etapa final'],
        serviceSignals: ['Pérdida inesperada de limpieza', 'Carga prematura de etapa final', 'Fuga de sello o marco', 'Caída de presión fuera de tendencia esperada'],
      },
      'ma-trea': {
        summary: 'Tratamiento de aire en fase molecular para gases, vapores, olores y contaminantes moleculares corrosivos usando medios seleccionados según el desafío real del contaminante.',
        treatmentFunction: 'Tratar contaminantes moleculares identificados que no se resuelven solo con filtración particulada, integrando química del medio, condiciones de contacto, integridad del housing y estrategia de servicio.',
        mechanisms: ['Adsorción o quimisorción usando medios seleccionados por aplicación', 'Selección de medio según la química del contaminante objetivo y especies competidoras', 'Evaluación de tiempo de contacto, caudal y carga de contaminante', 'Integración con prefiltración particulada, sellado y acceso de servicio'],
        applications: ['Control de olores industriales', 'Mitigación de gas corrosivo para equipos sensibles y entornos de control', 'Pulido de ventilación de proceso', 'Reducción de gas y vapor objetivo', 'Control de contaminación molecular aérea'],
        conditions: ['Química de contaminante objetivo conocida', 'Concentración de entrada y perfil de carga', 'Caudal y condiciones de contacto requeridas', 'Rango de temperatura y humedad relativa', 'Contaminantes competidores y carga particulada aguas arriba', 'Planificación de agotamiento y reemplazo de medio'],
        selectionInputs: [
          'Gas, vapor, olor o contaminante molecular corrosivo objetivo',
          'Concentración de entrada, variabilidad y perfil de exposición',
          'Caudal, velocidad frontal y condiciones de contacto requeridas',
          'Rango de temperatura y humedad relativa de operación',
          'Gases, vapores competidores y carga particulada aguas arriba',
          'Condición de salida requerida u objetivo del proceso protegido',
          'Restricciones de housing, sellado, bypass e instalación existentes',
          'Estrategia de monitoreo, ensayo y reemplazo de medio',
        ],
        serviceSignals: ['Breakthrough de olor o gas objetivo', 'Agotamiento acelerado del medio', 'La condición de salida se desvía del objetivo requerido', 'Sensibilidad inesperada a la humedad', 'Carga desigual o bypass sospechado', 'Intervalo de servicio materialmente más corto que la expectativa de duty validada'],
        engineeringNotes: [
          { title: 'El tratamiento molecular no es filtración particulada', body: 'Los filtros de partículas y los medios moleculares resuelven problemas de contaminación diferentes. MA-TREA™ se selecciona cuando el desafío controlado es un gas, vapor, olor o contaminante molecular corrosivo, mientras que las etapas particuladas pueden seguir siendo necesarias aguas arriba o abajo.' },
          { title: 'La química del medio sigue al contaminante', body: 'El carbón activado, medios impregnados u otros medios adsorbentes/reactivos no pueden tratarse como universalmente intercambiables. La selección sigue la química objetivo, la concentración, la humedad, los contaminantes competidores y el punto final de tratamiento requerido.' },
          { title: 'El breakthrough importa más que la apariencia', body: 'Los medios moleculares pueden acercarse al agotamiento sin verse visiblemente cargados. La revisión de condición por lo tanto considera el breakthrough del contaminante, monitoreo o ensayo del medio, historial de duty y condiciones de operación en lugar de solo apariencia o presión diferencial.' },
          { title: 'La instalación sigue siendo parte del desempeño', body: 'La integridad del housing, asentamiento del módulo, sellado, distribución de caudal y acceso de servicio afectan si la corriente de aire realmente recibe el tratamiento molecular previsto. El bypass puede anular medios que de otro modo serían adecuados.' },
        ],
        customFaqs: [
          ['¿Qué trata MA-TREA™?', 'MA-TREA™ está pensado para contaminantes moleculares identificados como gases objetivo, vapores, olores o compuestos aéreos corrosivos. El medio y la configuración específicos dependen de la química del contaminante y las condiciones de operación.'],
          ['¿Es MA-TREA™ lo mismo que HEPA o filtración particulada de alta eficiencia?', 'No. MA-TREA™ trata la contaminación en fase molecular, mientras que la filtración particulada trata partículas suspendidas. Un proyecto puede requerir ambos mecanismos de tratamiento en un sistema de tratamiento de aire por etapas.'],
          ['¿Cómo se evalúa el agotamiento del medio molecular?', 'El agotamiento se evalúa a partir del duty de la aplicación y evidencia como breakthrough del contaminante objetivo, monitoreo, ensayo del medio, historial de exposición y condiciones de operación. La presión diferencial sola no establece la capacidad molecular restante.'],
          ['¿Qué información se necesita para seleccionar una vía de tratamiento MA-TREA™?', 'Como mínimo, identificar el contaminante objetivo, la concentración esperada y su variabilidad, el caudal, la temperatura, la humedad, la condición de salida requerida, los contaminantes competidores, las restricciones de housing existentes y la estrategia de monitoreo o reemplazo prevista.'],
        ],
      },
    },
  },
  partion: {
    summary: 'Filtración industrial de polvo y humo para partículas generadas por proceso, sistemas de extracción y entornos de producción exigentes.',
    positioning: 'PARTION™ organiza la filtración alrededor de la partícula generada por el propio proceso industrial — polvo fino, humo y carga de producción mixta — en lugar del polvo de ventilación general. La selección sigue el comportamiento de la partícula, concentración, temperatura, exposición a humedad o aerosol, estrategia de limpieza, caída de presión permisible, acceso de servicio y los requisitos de seguridad validados del proceso.',
    selectionContext: {
      eyebrow: 'ALCANCE DE TRATAMIENTO DE POLVO Y HUMO',
      title: 'Empareja la partícula generada por proceso con la vía de filtración.',
      lead: 'PARTION™ empieza por la fuente real del proceso y el comportamiento de la partícula para que la filtración de polvo y humo se resuelva según la carga, limpieza, caudal y condiciones de servicio, no por un duty de ventilación general.',
    },
    selectionGuide: {
      fumevra: {
        title: 'Control de polvo fino y humo',
        body: 'Para trabajos de escape de proceso, captura de producción y extracción donde la carga particulada fina o mixta requiere medio filtrante y estrategia de servicio seleccionados según el contaminante real generado por el proceso.',
      },
    },
    qualificationGroups: [
      { title: 'Proceso y fuente', items: ['Proceso que genera el polvo o humo', 'Caudal y ciclo de duty', 'Posición de captura en la fuente o de escape', 'Condición de descarga o aguas abajo requerida'] },
      { title: 'Comportamiento del contaminante', items: ['Tamaño de partícula, morfología y concentración', 'Comportamiento seco, pegajoso, higroscópico, abrasivo o aceitoso', 'Exposición a temperatura y humedad', 'Clasificación de combustibilidad o peligro reactivo cuando aplique'] },
      { title: 'Filtración y servicio', items: ['Interfaz con el colector o housing de filtro existente', 'Rango de caída de presión permisible', 'Estrategia de medio limpiable vs. reemplazable', 'Requisitos de acceso de servicio, inspección y disposición'] },
    ],
    technologies: {
      fumevra: {
        summary: 'Filtración de polvo fino y humo generados por proceso para sistemas industriales de extracción y colección de polvo, con selección de medio y elemento resuelta según el comportamiento y duty real de la partícula.',
        treatmentFunction: 'Capturar la partícula fina y el humo generados por el proceso dentro del sistema de extracción o colección de polvo instalado antes de la recirculación, descarga o tratamiento aguas abajo, preservando el caudal, sellado y comportamiento de servicio requeridos de la interfaz del colector validado.',
        mechanisms: ['Filtración superficial o profunda seleccionada por comportamiento de partícula', 'Geometría de medio y elemento emparejada al mecanismo de carga', 'Compatibilidad con limpieza por pulso de aire u otro método solo donde el elemento y el sistema instalado están validados para regeneración', 'Gestión de carga de polvo, liberación de torta y presión diferencial', 'Control de sellado y bypass en la interfaz elemento-colector'],
        applications: ['Colección de polvo de proceso', 'Captura de partícula fina', 'Extracción de humo de soldadura y proceso térmico', 'Extracción de polvo de esmerilado y acabado', 'Filtración de escape de producción'],
        conditions: ['Carga de partícula fina o mixta', 'Duty de producción continua o cíclica', 'Comportamiento de partícula seco, pegajoso, abrasivo, higroscópico o con contenido de aceite', 'Exposición a temperatura, humedad y aerosol', 'Estrategia de limpieza o reemplazo', 'Clasificación de partícula combustible o reactiva cuando aplique'],
        serviceSignals: ['Aumento rápido de presión diferencial', 'Partícula visible aguas abajo', 'Mala recuperación de presión tras un ciclo de limpieza validado', 'Daño, cegado o encostrado inesperado del medio', 'Intervalo de servicio materialmente más corto de lo esperado', 'Evidencia de bypass o mal asentamiento del elemento', 'Carga desigual de polvo entre el banco de elementos instalado'],
        engineeringNotes: [
          { title: 'El polvo de proceso no es polvo de ventilación general', body: 'FUMEVRA™ se resuelve alrededor de la partícula creada por el proceso de producción. El polvo fino y el humo pueden comportarse distinto al polvo ambiental ordinario, así que la selección de medio empieza por el contaminante y duty reales en lugar de una clase de filtro genérica.' },
          { title: 'El comportamiento de la partícula cambia el comportamiento del filtro', body: 'Partículas finas, pegajosas, higroscópicas, abrasivas, calientes, fibrosas o con contenido de aceite pueden alterar la carga, liberación de torta, desarrollo de presión diferencial y vida del elemento. Estas condiciones forman parte de la base de selección.' },
          { title: 'La limpieza por pulso es una interacción de sistema', body: 'Donde un cartucho y colector están validados para limpieza por pulso de aire comprimido, un breve pulso reverso flexiona el medio filtrante y desprende el polvo acumulado de la superficie exterior para que caiga hacia la tolva. El polvo no se inyecta en el filtro, y este comportamiento de limpieza no debe asumirse para toda configuración FUMEVRA™.' },
          { title: 'La estrategia de limpieza es específica de la aplicación', body: 'Un elemento limpiable no es automáticamente apropiado para todo polvo o humo. La construcción del medio, mecanismo de carga, interfaz con el colector, condiciones de pulso donde aplique y el método de limpieza validado deben funcionar juntos antes de confiar en la regeneración.' },
          { title: 'La captura y el caudal siguen siendo parte del resultado', body: 'El elemento filtrante solo puede tratar la partícula que llega al colector. La captura en la fuente, transporte por ducto, balance de caudal y condición del colector siguen siendo variables del sistema fuera del elemento mismo y pueden limitar el desempeño global de control.' },
          { title: 'El filtro no es el colector', body: 'FUMEVRA™ identifica la familia de filtración ELIMFILTERS usada dentro de un sistema de colección de polvo o extracción instalado. El housing del colector, ventilador, ductos, tolva y hardware de limpieza siguen siendo equipo de aplicación salvo que se especifiquen por separado.' },
          { title: 'La presión diferencial y las emisiones son señales diagnósticas', body: 'La tendencia de presión diferencial, la recuperación de limpieza, la partícula visible aguas abajo, la condición del elemento y la evidencia de asentamiento se revisan en conjunto. Ninguna lectura de presión diferencial por sí sola establece la condición del medio o la vida de servicio restante.' },
        ],
        customFaqs: [
          ['¿Qué filtra FUMEVRA™?', 'FUMEVRA™ es la familia de filtración PARTION™ para partícula fina y humo generados por proceso, manejados por sistemas industriales de extracción, colección de polvo y escape de producción.'],
          ['¿En qué se diferencia FUMEVRA™ de la Filtración General de Aire de AEREMIS™?', 'La Filtración General de Aire de AEREMIS™ trata partícula de ventilación general y aire de reposición. FUMEVRA™ se resuelve alrededor de partícula generada por un proceso industrial, donde el comportamiento de carga, la estrategia de limpieza y las condiciones de proceso pueden ser sustancialmente distintas.'],
          ['¿Cómo funciona la autolimpieza por pulso de aire en un sistema de cartucho compatible?', 'Un pulso reverso corto de aire comprimido entra al lado limpio de un cartucho diseñado para ese duty, flexionando brevemente el medio filtrante. La torta de polvo acumulada se libera de la superficie exterior del medio y cae hacia la tolva. El pulso limpia la superficie del filtro; no inyecta polvo al colector.'],
          ['¿Son todos los elementos FUMEVRA™ limpiables?', 'No. La limpiabilidad depende del medio validado, la construcción del elemento, el comportamiento del contaminante y la interfaz de colector o limpieza instalada. Las vías de tratamiento reemplazable y limpiable deben seguir siendo específicas de la aplicación.'],
          ['¿FUMEVRA™ significa que ELIMFILTERS suministra el colector de polvo completo?', 'No. FUMEVRA™ identifica la tecnología de filtración y la familia de elementos filtrantes. El housing del colector instalado, ventilador, ductos, tolva y hardware de limpieza son contexto de sistema salvo que se especifiquen por separado.'],
          ['¿Puede la presión diferencial por sí sola determinar cuándo debe reemplazarse un elemento FUMEVRA™?', 'No. La tendencia de presión diferencial es una entrada diagnóstica. También deben considerarse la recuperación de limpieza, la partícula aguas abajo, la condición del elemento, el sellado, los cambios de proceso y el criterio de servicio validado.'],
          ['¿Qué información se necesita para seleccionar una vía de tratamiento FUMEVRA™?', 'Identificar el proceso generador, la posición de captura en la fuente, las características y concentración de la partícula, el caudal y ciclo de duty, las condiciones de temperatura y humedad, el comportamiento difícil de la partícula, la condición aguas abajo requerida, la interfaz de housing o colector instalada, el método de limpieza cuando aplique y cualquier restricción de seguridad de proceso.'],
        ],
      },
    },
  },
  coalvex: {
    summary: 'Acondicionamiento de corriente de gas para aerosoles líquidos entrapados, gotas y arrastre de líquido libre en duties de gas natural y gas de proceso industrial.',
    positioning: 'COALVEX™ organiza el acondicionamiento de gas por la fase líquida transportada en la corriente de gas. Los aerosoles finos y gotas pequeñas se tratan mediante coalescencia de gas COALERIS™, mientras que el líquido libre en volumen y el arrastre de gotas más grandes se tratan mediante la vía descriptiva de Separación Gas-Líquido. La selección sigue la composición del gas, caudal, presión, temperatura, carga de líquido, comportamiento de gota, turndown, drenaje y la condición aguas abajo requerida.',
    selectionContext: {
      eyebrow: 'ALCANCE DE ACONDICIONAMIENTO DE GAS',
      title: 'Empareja el problema de arrastre de líquido con el mecanismo de separación.',
      lead: 'COALVEX™ separa la coalescencia de aerosoles finos de la separación gas-líquido en volumen para que cada proyecto empiece por la forma real del líquido, el patrón de carga y el requisito de protección aguas abajo.',
    },
    selectionGuide: {
      coaleris: {
        title: 'Coalescencia de aerosol y gota fina',
        body: 'Para aerosoles líquidos finos y gotas pequeñas entrapadas que requieren captura, coalescencia en gotas más grandes y drenaje confiable antes de que el gas llegue a equipo sensible aguas abajo.',
      },
      'gas-liquid-separation': {
        title: 'Separación gas-líquido en volumen',
        body: 'Para líquido libre, gotas más grandes, slugs o arrastre de líquido intermedio que deben removerse antes de etapas coalescentes más finas o equipo de proceso aguas abajo.',
      },
    },
    qualificationGroups: [
      { title: 'Corriente de gas', items: ['Composición del gas y contaminantes', 'Presión de operación y de diseño', 'Rango de temperatura', 'Caudal, turndown y perfil de duty'] },
      { title: 'Desafío de líquido', items: ['Distribución de tamaño de aerosol o gota', 'Composición y tasa de carga del líquido', 'Carga continua, intermitente o tipo slug', 'Condición de líquido aguas abajo requerida'] },
      { title: 'Integración y drenaje', items: ['Interfaz con vessel o housing existente', 'Orientación y sellado del elemento', 'Vía de drenaje y estrategia de remoción de líquido', 'Compatibilidad de materiales, acceso de servicio y requisitos del sistema de presión'] },
    ],
    technologies: {
      coaleris: {
        summary: 'Coalescencia de aerosol líquido fino y gota entrapada para corrientes de gas natural y gas de proceso industrial donde el equipo aguas abajo requiere arrastre de líquido controlado.',
        treatmentFunction: 'Capturar aerosoles líquidos finos y gotas pequeñas entrapadas dentro de medio coalescente, promover el crecimiento de la gota, y proveer una vía de drenaje confiable para que el líquido separado salga de la corriente de gas antes de equipo sensible aguas abajo.',
        mechanisms: ['Captura de aerosol fino y gota pequeña dentro de medio coalescente fibroso o poroso', 'Crecimiento de gota mediante intercepción y coalescencia repetida', 'Drenaje asistido por gravedad tras la formación de gota', 'Control de trayectoria de flujo, sellado de elemento y prevención de bypass', 'Control de re-entrada mediante velocidad de gas y condiciones de drenaje correctas'],
        applications: ['Acondicionamiento de gas natural', 'Protección de compresor y turbina', 'Transmisión y distribución de gas', 'Acondicionamiento de gas combustible', 'Protección de gas de alimentación para etapas de amina, deshidratación, membrana, desecante o catalizador', 'Control de aerosol de gas de proceso industrial'],
        conditions: ['Composición, presión y temperatura del gas', 'Caudal, velocidad y turndown del gas', 'Distribución de tamaño de aerosol fino y carga de líquido', 'Viscosidad, densidad, comportamiento superficial y drenaje del líquido', 'Potencial de líquido libre o slug aguas arriba', 'Sólidos aguas arriba que pueden cargar o ensuciar el medio coalescente', 'Duty continuo, variable o de upset del proceso'],
        serviceSignals: ['Arrastre de líquido aguas abajo', 'Aumento inesperado de presión diferencial', 'Mal drenaje, inundación o acumulación de líquido', 'Re-entrada tras separación aparente', 'Vida de servicio corta del elemento', 'Evidencia de bypass o falla de sello', 'Cambios de desempeño tras variación de condiciones de gas, líquido o caudal'],
        engineeringNotes: [
          { title: 'La coalescencia trata líquido fino entrapado', body: 'COALERIS™ se selecciona cuando la corriente de gas transporta aerosoles líquidos finos o gotas pequeñas que no se remueven de forma confiable solo con gravedad o separación en volumen. El medio captura gotas y promueve su crecimiento para que puedan salir de la corriente de gas por la vía de drenaje.' },
          { title: 'El líquido en volumen y el aerosol fino son duties distintos', body: 'El líquido libre, las gotas grandes y los slugs pueden imponer una carga muy distinta a la del aerosol fino. Donde el desafío de líquido entrante exceda el duty coalescente validado, puede requerirse una etapa de separación en volumen aguas arriba antes de COALERIS™.' },
          { title: 'El drenaje es parte del desempeño coalescente', body: 'El líquido capturado debe salir de la etapa coalescente. El drenaje restringido, la inundación o la acumulación de líquido pueden aumentar la presión diferencial y promover la re-entrada aunque el medio en sí sea apropiado.' },
          { title: 'La velocidad de gas y el turndown afectan el comportamiento de separación', body: 'El caudal, la velocidad local y el turndown del gas influyen en el transporte, residencia y riesgo de re-entrada de la gota. El conteo de elementos, la configuración del vessel y la envolvente operativa por lo tanto pertenecen a la evaluación de la aplicación en lugar de un claim de familia universal.' },
          { title: 'Las propiedades del gas y líquido cambian el duty del elemento', body: 'La presión, temperatura, composición de gas, carga de aerosol, propiedades del líquido y sólidos aguas arriba pueden cambiar la carga del medio, el drenaje, la presión diferencial y el comportamiento de servicio. La selección no puede reducirse a las dimensiones del elemento o un cross-reference solo.' },
          { title: 'El objetivo aguas abajo define el requisito de tratamiento', body: 'Proteger compresores, turbinas, equipo de gas combustible o etapas de tratamiento de gas aguas abajo puede requerir distinto arrastre permisible y márgenes de operación. La condición objetivo debe definirse antes de seleccionar el elemento coalescente.' },
          { title: 'El elemento no es el vessel de presión', body: 'COALERIS™ identifica la familia de elementos coalescentes ELIMFILTERS. Los vessels de presión, separadores, drenajes, controles de nivel, instrumentación y tubería siguen siendo equipo de sistema salvo que se especifiquen por separado.' },
        ],
        customFaqs: [
          ['¿Qué remueve COALERIS™ de una corriente de gas?', 'COALERIS™ está pensado para aerosoles líquidos finos y gotas pequeñas entrapadas en corrientes de gas natural o gas de proceso industrial. El elemento y medio seleccionados dependen de las condiciones del gas, propiedades del líquido, carga y la condición aguas abajo requerida.'],
          ['¿En qué se diferencia la coalescencia de gas de la separación gas-líquido en volumen?', 'La separación en volumen remueve líquido libre, gotas más grandes y carga tipo slug usando mecanismos de disengagement, inerciales o de vessel. COALERIS™ trata aerosoles más finos y gotas pequeñas capturándolos en medio coalescente, haciéndolos crecer en gotas más grandes y permitiendo su drenaje.'],
          ['¿Cuándo puede requerirse un separador en volumen antes de COALERIS™?', 'Cuando el líquido libre, gotas grandes, slugs o carga de líquido excedan el duty coalescente validado, puede requerirse separación en volumen aguas arriba para que la etapa coalescente fina no se sobrecargue.'],
          ['¿Por qué es importante el drenaje en un elemento coalescente?', 'El líquido coalescido debe salir del medio y la etapa de separación. El drenaje restringido, la inundación o la acumulación pueden elevar la presión diferencial y permitir que el líquido se re-entre en la corriente de gas.'],
          ['¿Puede usarse COALERIS™ para proteger compresores o equipo de tratamiento de gas?', 'Sí, esos son objetivos de aplicación comunes, pero el elemento requerido, la configuración del vessel y el margen de operación dependen de la composición, presión, temperatura, caudal, desafío de líquido y requisito aguas abajo reales del gas.'],
          ['¿La orientación del vessel define la tecnología COALERIS™?', 'No. La configuración horizontal o vertical del vessel es una decisión de aplicación y equipo. COALERIS™ identifica la familia de tratamiento coalescente y la función del elemento, no una única arquitectura de vessel universal.'],
          ['¿Se puede seleccionar COALERIS™ solo a partir de un cross-reference o tamaño de elemento?', 'No. La selección requiere composición del gas, presión, temperatura, caudal y turndown, tamaño y carga de aerosol, propiedades del líquido, condiciones de líquido en volumen aguas arriba, interfaz de housing, condiciones de drenaje y el resultado aguas abajo requerido.'],
          ['¿Qué debe revisarse cuando aparece líquido aguas abajo?', 'Revisar si el desafío es aerosol fino o líquido en volumen excesivo, luego revisar el caudal y turndown de gas, tendencia de presión diferencial, asentamiento y sellos del elemento, drenaje, inundación o re-entrada, y si las condiciones de proceso cambiaron respecto a la base de selección.'],
        ],
      },
      'gas-liquid-separation': {
        summary: 'Elementos de filtración y separación diseñados para remover líquido libre y gotas entrapadas de corrientes de gas industrial antes de equipo aguas abajo o etapas coalescentes más finas.',
        treatmentFunction: 'Proveer el elemento interno de filtración y separación que captura líquido libre, gotas entrapadas más grandes y arrastre antes de la coalescencia fina COALERIS™ o equipo sensible aguas abajo.',
        mechanisms: ['Impacto inercial y cambio direccional a través del elemento de separación', 'Captura de gota y disengagement de la corriente de gas en la superficie activa del elemento', 'Drenaje asistido por gravedad del líquido separado lejos del elemento activo', 'Desempeño del elemento evaluado contra carga de líquido, velocidad de gas y caída de presión permisible'],
        applications: ['Pre-separación de gas natural', 'Duties de knockout y remoción de líquido en volumen', 'Protección aguas arriba de compresor', 'Acondicionamiento de gas de proceso', 'Protección aguas arriba de etapas coalescentes finas'],
        conditions: ['Caudal de gas variable y turndown', 'Carga de líquido libre, gota grande o intermitente', 'Rango de presión y temperatura', 'Caída de presión permisible en elemento limpio y cargado', 'Interfaz con housing y elemento interno existentes', 'Vía de drenaje y condiciones de remoción de líquido', 'Compatibilidad química de gas y líquido con materiales del elemento'],
        serviceSignals: ['Arrastre de líquido aguas abajo', 'Cambio inesperado de presión diferencial', 'Carga desigual del elemento o ensuciamiento', 'Evidencia de bypass o mal asentamiento del elemento', 'Drenaje restringido o re-entrada'],
        engineeringNotes: [
          { title: 'La separación en volumen precede a la coalescencia fina cuando el duty lo requiere', body: 'El líquido libre, gotas grandes y carga de líquido intermitente pueden sobrecargar una etapa coalescente fina. Separación Gas-Líquido define la vía de elemento ELIMFILTERS usada antes del tratamiento COALERIS™ más fino cuando se requiere remoción de líquido en volumen o intermedia.' },
          { title: 'El producto ELIMFILTERS es el elemento de separación, no el vessel', body: 'ELIMFILTERS suministra el elemento de filtración o separación y define su función interna validada. Los vessels de presión, housings, tubería, drenajes, controles de nivel, instrumentación y skids de soporte pueden aparecer en imágenes de aplicación solo como contexto operativo y no se presentan como equipo fabricado por ELIMFILTERS salvo que se especifique por separado.' },
          { title: 'La carga de líquido, drenaje y caída de presión gobiernan el duty del elemento', body: 'El desempeño del elemento depende de la velocidad del gas, carga de líquido, comportamiento de gota, asentamiento y sellado, disengagement disponible alrededor del elemento, drenaje que previene inundación o re-entrada, y caída de presión a través del elemento conforme se desarrolla la carga.' },
          { title: 'La selección y el reemplazo son decisiones de elemento', body: 'El elemento se selecciona contra composición, velocidad, presión, temperatura, carga de líquido, comportamiento de gota, compatibilidad, caída de presión permisible y la condición aguas abajo requerida del gas. Las decisiones de reemplazo o servicio deben seguir evidencia de condición validada como arrastre, tendencia de presión diferencial, comportamiento de drenaje, ensuciamiento, asentamiento y el historial de duty real, en lugar de la apariencia del vessel.' },
          { title: 'Separación Gas-Líquido sigue siendo descriptiva', body: 'Esta es una familia de tratamiento de ingeniería bajo COALVEX™, no una marca tecnológica ELIMFILTERS independiente. La arquitectura del vessel y la disposición de planta son contexto de aplicación y no se convierten en tecnologías de producto ELIMFILTERS separadas.' },
        ],
        customFaqs: [
          ['¿Qué suministra ELIMFILTERS para Separación Gas-Líquido?', 'La página se centra en elementos de filtración y separación usados dentro de un housing de separación de gas apropiado para remover líquido libre, gotas entrapadas más grandes y arrastre intermedio. El vessel y equipo de proceso circundantes son contexto de aplicación salvo que se especifiquen por separado.'],
          ['¿En qué se diferencia Separación Gas-Líquido de COALERIS™?', 'Separación Gas-Líquido es la vía de elemento ELIMFILTERS para líquido libre, gotas entrapadas más grandes y arrastre intermedio. COALERIS™ es la tecnología coalescente fina para gotas más pequeñas y aerosoles líquidos. Las dos etapas tratan regímenes de líquido distintos y pueden usarse secuencialmente cuando la aplicación lo requiera.'],
          ['¿Qué información se necesita para seleccionar el elemento de separación?', 'La selección requiere composición del gas, presión, temperatura, caudal y turndown, carga de líquido y comportamiento de gota, caída de presión permisible del elemento, la interfaz de housing y elemento existente, orientación y sellado, condiciones de drenaje, compatibilidad de medio y sello, estrategia de servicio y la condición aguas abajo requerida.'],
          ['¿Presenta ELIMFILTERS el vessel de presión como el producto?', 'No. Los vessels, separadores, housings, tubería, drenajes, controles, instrumentación y skids mostrados en imágenes de aplicación representan el contexto operativo real. El producto comercial ELIMFILTERS es el elemento de filtración o separación salvo que se especifique explícitamente un alcance de sistema separado.'],
          ['¿Cómo debe monitorearse o reemplazarse el elemento?', 'Revisar el arrastre de líquido aguas abajo, la tendencia de presión diferencial, el comportamiento de drenaje, el ensuciamiento o contaminación, el asentamiento y sellos del elemento, el historial de operación y cualquier cambio en el duty de gas o líquido. Los intervalos de reemplazo deben basarse en evidencia de aplicación validada en lugar de un claim de tiempo universal.'],
          ['¿Es Separación Gas-Líquido una marca tecnológica ELIMFILTERS independiente?', 'No. Sigue siendo una familia de tratamiento de ingeniería descriptiva bajo COALVEX™ y corresponde a TC-NG-02.'],
        ],
      },
    },
  },
};
