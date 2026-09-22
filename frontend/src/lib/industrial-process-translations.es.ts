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
  flurexis: {
    summary: 'Acondicionamiento industrial de fluido hidráulico y de lubricación para contaminación sólida, agua y productos de degradación de aceite seleccionados.',
    positioning: 'FLUREXIS™ organiza el acondicionamiento de fluido por el mecanismo de contaminación que debe controlarse. HYLTRIS™ y LUBREVA™ tratan la limpieza de partícula sólida en circuitos hidráulicos y de lubricación, DEWATIS™ trata el agua en sus formas relevantes, y OILREVEX™ trata productos de degradación seleccionados que la filtración particulada convencional no resuelve. La selección sigue la química, viscosidad y temperatura del fluido, el duty de caudal y presión, el objetivo de limpieza, el estado del agua, el mecanismo de degradación, la sensibilidad del equipo y el método de verificación requerido.',
    selectionContext: {
      eyebrow: 'ALCANCE DE ACONDICIONAMIENTO DE FLUIDO',
      title: 'Empareja el mecanismo de contaminación con la vía de tratamiento.',
      lead: 'FLUREXIS™ separa el control particulado, la remoción de agua y la remediación de condición del aceite para que el tratamiento empiece por el problema real del fluido en lugar de una forma genérica de filtro.',
    },
    selectionGuide: {
      hyltris: { title: 'Control particulado hidráulico', body: 'Para sistemas hidráulicos donde la contaminación sólida, la ingresión y los residuos de desgaste deben controlarse según la sensibilidad de componentes, objetivos de limpieza, duty de presión y comportamiento de caudal.' },
      lubreva: { title: 'Control particulado de aceite de lubricación', body: 'Para sistemas de lubricación circulantes e industriales donde los residuos de desgaste y sólidos ingresados deben controlarse respetando la viscosidad del aceite, temperatura, caudal y sensibilidad de cojinetes o engranajes.' },
      dewatis: { title: 'Remoción de agua y deshidratación', body: 'Para aceites afectados por agua libre, emulsificada o disuelta, con el método de tratamiento seleccionado según la forma del agua, propiedades del aceite, nivel de contaminación y condición de humedad final requerida.' },
      oilrevex: { title: 'Remediación de condición del aceite', body: 'Para productos de degradación confirmados, precursores de varnish, contaminantes formadores de lodo o condiciones relacionadas con la química que no se resuelven solo con filtración particulada convencional.' },
    },
    qualificationGroups: [
      { title: 'Fluido y sistema', items: ['Tipo de fluido, química y paquete de aditivos', 'Rango de viscosidad y temperatura', 'Caudal, presión y ciclo de duty', 'Volumen de reservorio, patrón de circulación y sensibilidad del equipo'] },
      { title: 'Desafío de contaminación', items: ['Objetivo de limpieza de partícula y fuente de ingresión', 'Forma, concentración y mecanismo de reingreso del agua', 'Evidencia de residuos de desgaste, oxidación o producto de degradación', 'Sólidos, gases o contaminantes de proceso conocidos que afectan el fluido'] },
      { title: 'Integración y verificación', items: ['Arquitectura de presión, retorno, offline o acondicionamiento dedicado', 'Compatibilidad de housing, elemento, sello y material', 'Monitoreo de presión diferencial, conteo de partículas, humedad o análisis de fluido', 'Acceso de servicio, criterio de cambio y verificación posterior al tratamiento'] },
    ],
    technologies: {
      hyltris: {
        title: 'Filtración de Fluido Hidráulico',
        summary: 'Control de contaminación particulada para sistemas hidráulicos industriales donde la confiabilidad del componente depende de una limpieza de fluido sostenida bajo condiciones reales de presión, caudal y viscosidad.',
        treatmentFunction: 'Controlar los sólidos ingresados y residuos de desgaste en circuitos hidráulicos usando una arquitectura de filtración seleccionada según el objetivo de limpieza, la sensibilidad de componentes, el duty de presión, el comportamiento de caudal y las propiedades del fluido.',
        mechanisms: ['Arquitecturas de filtración en línea de presión, retorno y offline', 'Captura de partícula seleccionada según el objetivo de limpieza requerido', 'Gestión de elemento consciente de la presión diferencial y el bypass', 'Control de compatibilidad de trayectoria de flujo, sellado y housing', 'Recirculación offline donde se requiere limpieza continua independiente del caudal de la máquina'],
        applications: ['Unidades de potencia hidráulica', 'Prensas y maquinaria industrial', 'Sistemas servo y proporcionales', 'Bancos de prueba hidráulicos', 'Acondicionamiento offline tipo kidney-loop', 'Soporte de commissioning y limpieza'],
        conditions: ['Sensibilidad de limpieza del componente', 'Presión del sistema y duty de presión cíclica', 'Caudal y transitorios de flujo', 'Viscosidad del fluido y temperatura de arranque en frío', 'Tasa de ingresión y generación de residuos de desgaste', 'Limpieza objetivo y método de monitoreo'],
        serviceSignals: ['Contaminación recurrente de válvula, bomba o actuador', 'El código de limpieza no se recupera como se esperaba', 'Aumento inesperado de presión diferencial', 'Indicación frecuente de bypass o vida corta del elemento', 'Restricción en arranque en frío', 'Evidencia visible de bypass, sello o instalación'],
        selectionInputs: [
          'Tipo de fluido hidráulico y química de aditivos',
          'Limpieza objetivo o requisito de componente protegido',
          'Presión de operación y máxima',
          'Condiciones de caudal nominal, pico y cíclico',
          'Viscosidad del fluido en arranque y temperatura de operación',
          'Carga de partícula, fuente de ingresión y perfil de residuos de desgaste',
          'Ubicación de instalación en línea de presión, retorno u offline',
          'Housing existente, arreglo de colapso/bypass, sellos y materiales',
          'Presión diferencial permisible y método de monitoreo',
          'Acceso de servicio, ciclo de duty y tiempo de limpieza requerido',
        ],
        engineeringNotes: [
          { title: 'La limpieza es una condición de sistema, no una etiqueta de elemento', body: 'La selección de HYLTRIS™ empieza por los componentes protegidos, la fuente de contaminación y la condición de fluido requerida. El desempeño del medio, el tamaño del elemento, la ubicación y la ingresión del sistema deben funcionar juntos para establecer y mantener la limpieza objetivo.' },
          { title: 'La ubicación del filtro cambia el duty', body: 'Los filtros en línea de presión, retorno y offline ven condiciones distintas de presión, caudal, pulsación y contaminación. No debe asumirse que una sola configuración de elemento es adecuada para toda ubicación del circuito hidráulico.' },
          { title: 'La viscosidad y el arranque en frío afectan la restricción', body: 'Una viscosidad más alta a baja temperatura puede elevar la presión diferencial aunque el elemento no esté cargado de contaminación. Las tendencias de restricción deben interpretarse junto con la temperatura y el caudal del fluido.' },
          { title: 'El bypass y el sellado son parte del control de contaminación', body: 'Un medio eficiente no puede proteger el sistema si el fluido hace bypass del elemento por una vía de bypass abierta, un sello dañado, un mal asentamiento o una interfaz de housing incompatible.' },
          { title: 'La familia industrial es independiente de las marcas On-Road / Off-Road', body: 'HYLTRIS™ es la familia de fluido hidráulico de Industrial & Process. No hereda la marca, claims o reglas de producto de NANOFORCE™ de la plataforma On-Road / Off-Road.' },
        ],
        customFaqs: [
          ['¿Qué controla HYLTRIS™?', 'HYLTRIS™ controla la contaminación particulada sólida y los residuos de desgaste en fluidos hidráulicos industriales. El elemento y arquitectura requeridos dependen de la sensibilidad del componente, objetivo de limpieza, presión, caudal, viscosidad, carga de contaminación y ubicación de instalación.'],
          ['¿Es la filtración en línea de presión el mismo duty que la filtración en línea de retorno?', 'No. Las ubicaciones de presión, retorno y offline imponen condiciones distintas de presión, caudal, pulsación y contaminación. La selección debe calificarse para el punto de instalación real.'],
          ['¿Por qué puede subir la presión diferencial durante el arranque?', 'El fluido hidráulico frío puede ser sustancialmente más viscoso que a temperatura normal de operación. Ese aumento de viscosidad puede elevar la restricción del elemento, así que la presión diferencial debe interpretarse junto con la temperatura y el caudal.'],
          ['¿Se puede seleccionar HYLTRIS™ solo por el rating en micras?', 'No. La selección también requiere el objetivo de limpieza, el desempeño de remoción validado, caudal, presión, viscosidad, carga de contaminación, interfaz de housing, arreglo de bypass y sensibilidad del componente protegido.'],
        ],
      },
      lubreva: {
        title: 'Filtración de Lubricación Industrial',
        summary: 'Control particulado de aceite de lubricación industrial para sistemas circulantes, cajas de engranajes, cojinetes y duties de lubricación de turbina o maquinaria.',
        treatmentFunction: 'Controlar los sólidos ingresados y los residuos de desgaste generados internamente manteniendo un caudal y restricción de aceite aceptables a través de la envolvente real de viscosidad y temperatura.',
        mechanisms: ['Filtración particulada de flujo completo y offline', 'Selección de medio profundo o superficial según carga de sólidos y objetivo de limpieza', 'Recirculación offline para limpieza continua independiente del caudal de la máquina', 'Gestión de elemento basada en presión diferencial y condición', 'Control de compatibilidad de sello, housing y fluido'],
        applications: ['Cajas de engranajes', 'Sistemas de lubricación de turbina', 'Sistemas de aceite circulante', 'Lubricación de cojinetes industriales', 'Lubricación de maquinaria de papel, metales y proceso', 'Acondicionamiento offline de reservorio'],
        conditions: ['Rango de viscosidad y temperatura del aceite', 'Generación de residuos de desgaste e ingresión externa', 'Duty de circulación continua o intermitente', 'Sensibilidad de limpieza de cojinete, engranaje o servo', 'Productos de oxidación o agua que pueden coexistir con partículas', 'Presión diferencial disponible y comportamiento de la bomba'],
        serviceSignals: ['Aumenta la tendencia de residuos de desgaste', 'Contaminación de partícula persistente', 'Intervalos de servicio cortos del filtro', 'Restricción fuera del comportamiento esperado de temperatura/caudal', 'Depósitos aguas abajo persisten pese a control aceptable de partículas', 'Evidencia de sello o bypass'],
        selectionInputs: [
          'Tipo de lubricante, grado de viscosidad y química de aditivos',
          'Temperatura de operación y arranque',
          'Caudal de circulación y presión diferencial disponible',
          'Componente protegido de cojinete, engranaje, turbina o lubricación',
          'Objetivo de limpieza y método de monitoreo de conteo de partículas',
          'Perfil de residuos de desgaste e ingresión',
          'Ubicación de tratamiento de flujo completo, side-stream u offline',
          'Agua o productos de degradación que puedan requerir una etapa de tratamiento separada',
          'Housing, sellos, materiales y acceso de servicio existentes',
          'Criterio de cambio de elemento y método de verificación posterior al servicio',
        ],
        engineeringNotes: [
          { title: 'La limpieza de lubricación y la condición del aceite están relacionadas pero no son idénticas', body: 'LUBREVA™ trata la contaminación particulada. El agua, los productos de degradación disueltos, los precursores de varnish o los problemas de química pueden requerir DEWATIS™ u OILREVEX™ en lugar de simplemente instalar un elemento particulado más fino.' },
          { title: 'La viscosidad define el duty real del filtro', body: 'Los aceites de lubricación pueden operar en un amplio rango de viscosidad. La temperatura de arranque, el caudal de la bomba y el grado del fluido afectan materialmente la presión diferencial y deben considerarse al dimensionar el elemento y el housing.' },
          { title: 'Los residuos de desgaste son tanto contaminante como señal diagnóstica', body: 'Una tendencia creciente de residuos de desgaste puede indicar un problema de equipo además de una carga de filtración. La vida corta repetida del elemento debe activar la investigación de la fuente de contaminación en lugar de escalar automáticamente a un medio más fino.' },
          { title: 'El acondicionamiento offline puede separar el caudal de limpieza del caudal de la máquina', body: 'Un loop offline dedicado puede soportar la limpieza continua del reservorio sin forzar que el caudal de tratamiento iguale al caudal de lubricación de la máquina, pero su efectividad sigue dependiendo de la rotación del reservorio, la ingresión y la generación de contaminación.' },
          { title: 'La lubricación industrial sigue siendo distinta de la marca de lubricación de motor', body: 'LUBREVA™ es la familia de lubricación de Industrial & Process. No hereda la marca SYNTRAX™ ni los claims de producto On-Road / Off-Road.' },
        ],
        customFaqs: [
          ['¿Cuál es el rol principal de LUBREVA™?', 'LUBREVA™ controla la contaminación sólida y los residuos de desgaste en sistemas de lubricación industrial respetando la viscosidad, caudal, temperatura del aceite y los requisitos del equipo protegido.'],
          ['¿Cuándo es útil la filtración offline?', 'El tratamiento offline es útil cuando se requiere limpieza continua del reservorio independiente del caudal de lubricación de la máquina, siempre que el loop se dimensione según la rotación del reservorio, la generación de contaminación y el objetivo de limpieza requerido.'],
          ['¿Remover partículas también remueve agua o varnish?', 'No necesariamente. El agua y los productos de degradación disueltos o semisolubles pueden requerir mecanismos de tratamiento distintos. FLUREXIS™ separa esos duties en DEWATIS™ y OILREVEX™ cuando el diagnóstico lo respalda.'],
          ['¿Se puede seleccionar LUBREVA™ solo por la viscosidad del aceite?', 'No. La viscosidad es una entrada. La selección también requiere caudal, temperatura, objetivo de limpieza, carga de contaminación, sensibilidad del equipo, interfaz de housing y presión diferencial permisible.'],
        ],
      },
      dewatis: {
        title: 'Deshidratación de Aceite y Remoción de Agua',
        summary: 'Tratamiento de remoción de agua para aceites hidráulicos y de lubricación donde el agua libre, emulsificada o disuelta degrada la condición del fluido o la confiabilidad del equipo.',
        treatmentFunction: 'Reducir la contaminación de agua con un mecanismo de tratamiento seleccionado según el estado real del agua, la química del aceite, la viscosidad, la temperatura, el nivel de contaminación y la condición de humedad final requerida.',
        mechanisms: ['Separación de agua libre donde el comportamiento por gravedad o coalescencia es adecuado', 'Deshidratación al vacío u otro tratamiento de transferencia de masa validado para duties de agua disuelta y libre', 'Recirculación offline y acondicionamiento de reservorio', 'Prefiltración o pulido particulado donde los sólidos afectan el proceso de deshidratación', 'Monitoreo de humedad antes y después del tratamiento'],
        applications: ['Reservorios hidráulicos', 'Sistemas de aceite de lubricación', 'Aceites de turbina y circulantes', 'Aceites industriales almacenados o contaminados', 'Programas de commissioning, recuperación y acondicionamiento de fluido'],
        conditions: ['Estado de agua libre, emulsificada o disuelta', 'Química del aceite, viscosidad y compatibilidad de aditivos', 'Temperatura de operación', 'Carga y tasa de reingreso de agua', 'Volumen de reservorio y vía de recirculación', 'Condición de humedad final requerida y método de verificación'],
        serviceSignals: ['El contenido de agua no declina como se esperaba', 'Reingreso rápido de agua tras el tratamiento', 'Emulsión persistente', 'Espuma o gas entrapado acompaña el problema de agua', 'La condición del fluido permanece inestable tras el tratamiento', 'El tratamiento causa preocupaciones inesperadas de compatibilidad o aditivos'],
        engineeringNotes: [
          { title: 'La forma del agua determina el mecanismo de tratamiento', body: 'El agua libre, las emulsiones estables y la humedad disuelta no responden igual a un solo método de tratamiento. La calificación de DEWATIS™ por lo tanto empieza identificando cómo existe el agua en el aceite en lugar de seleccionar equipo a partir de un solo número de humedad.' },
          { title: 'La deshidratación al vacío es un proceso de transferencia de masa', body: 'Donde sea apropiada para el fluido y la aplicación, la deshidratación al vacío promueve la transferencia de agua y gases entrapados fuera del aceite bajo presión reducida. La tasa real de tratamiento depende de las propiedades del fluido, temperatura, carga de agua, área superficial y configuración del sistema.' },
          { title: 'La fuente de ingreso debe corregirse', body: 'Remover agua sin atender enfriadores con fuga, condensación, ingreso por lavado, respiraderos, sellos o contaminación de proceso puede producir un rebote rápido y ciclos de tratamiento repetidos.' },
          { title: 'La verificación de humedad requiere muestreo comparable', body: 'Los resultados de agua antes y después son significativos solo cuando las muestras representan condiciones de operación comparables y usan un método apropiado para el fluido y el rango de humedad esperado.' },
          { title: 'DEWATIS™ no es un claim de desempeño de purificador universal', body: 'El nombre de la familia no asigna un porcentaje de remoción, nivel de ppm final, capacidad de caudal o tiempo de tratamiento único para todo aceite y sistema. Los claims numéricos siguen siendo específicos de producto y proyecto.' },
        ],
        customFaqs: [
          ['¿DEWATIS™ remueve tanto agua libre como disuelta?', 'La familia cubre arquitecturas de remoción de agua para distintos estados del agua, pero el mecanismo seleccionado debe calificarse para la condición específica de aceite y agua. Un método efectivo en agua libre no es automáticamente adecuado para humedad disuelta.'],
          ['¿Por qué puede regresar el agua después del tratamiento?', 'El agua puede reingresar por condensación, enfriadores, sellos, lavado, respiración del reservorio o ingreso de proceso. La fuente debe identificarse y controlarse o la condición de humedad puede rebotar tras un tratamiento exitoso.'],
          ['¿Siempre se requiere deshidratación al vacío?', 'No. La deshidratación al vacío es una vía de tratamiento. El método correcto depende de si el agua es libre, emulsificada o disuelta, junto con la química del aceite, viscosidad, temperatura, carga de agua y la condición de salida requerida.'],
          ['¿Se puede asignar un único valor final de agua universal a DEWATIS™?', 'No. La condición de humedad aceptable depende del fluido, equipo, temperatura de operación y requisito del proyecto. Los límites numéricos deben atarse a evidencia validada de producto o aplicación.'],
        ],
      },
      oilrevex: {
        title: 'Remediación de Condición del Aceite',
        summary: 'Remediación dirigida para productos de degradación de aceite seleccionados y contaminantes relacionados con la química que la filtración particulada convencional por sí sola no resuelve.',
        treatmentFunction: 'Usar análisis de fluido para identificar el mecanismo de degradación, luego aplicar un tratamiento offline compatible como adsorción validada, intercambio iónico u otro medio de remediación, y verificar la condición del aceite antes y después del tratamiento.',
        mechanisms: ['Adsorción o captura dirigida de productos de degradación seleccionados', 'Tratamiento de intercambio iónico donde esté validado para la química del fluido y el contaminante', 'Recirculación offline a través de medio de remediación dedicado', 'Filtración particulada usada como etapa de apoyo en lugar de sustituto del diagnóstico químico', 'Verificación de condición del fluido antes, durante y después del tratamiento'],
        applications: ['Aceites de turbina y circulantes', 'Sistemas de lubricación industrial', 'Sistemas hidráulicos con preocupaciones confirmadas de producto de degradación', 'Remediación de éster fosfatado u otro fluido especializado cuando la química está validada', 'Programas de restauración de aceite basados en condición'],
        conditions: ['Mecanismo de degradación confirmado', 'Química del fluido, base y compatibilidad de aditivos', 'Estado de contaminación soluble, insoluble o formador de depósito', 'Temperatura e historial de oxidación', 'Carga de contaminante y potencial de rebote', 'Punto final de tratamiento requerido y verificación de laboratorio'],
        serviceSignals: ['Los indicadores de condición del fluido no mejoran', 'La tendencia a varnish o depósito regresa rápidamente', 'El medio de remediación se agota inesperadamente', 'La presión diferencial sube por depósitos liberados o capturados', 'Surgen preocupaciones de compatibilidad de aditivo o fluido', 'Los depósitos persisten porque la oxidación o el estrés térmico raíz siguen activos'],
        engineeringNotes: [
          { title: 'La remediación empieza con diagnóstico', body: 'OILREVEX™ no se selecciona simplemente porque el aceite se vea oscuro o el equipo tenga depósitos. El análisis de fluido debe distinguir productos de oxidación, potencial de varnish, especies ácidas, lodo, cambios de aditivo y otras posibles causas antes de elegir un medio de remediación.' },
          { title: 'Los filtros particulados no remueven todo producto de degradación', body: 'Algunos productos de degradación de aceite permanecen disueltos o semisolubles hasta que las condiciones causan que se depositen. La filtración particulada convencional puede apoyar la limpieza pero puede no resolver la química responsable del varnish u otros depósitos.' },
          { title: 'La compatibilidad del medio es parte del tratamiento', body: 'Los medios de adsorción e intercambio iónico pueden interactuar de forma distinta con bases, aditivos y productos de degradación. El tratamiento debe validarse para que el contaminante objetivo se trate sin crear un cambio inaceptable en el fluido.' },
          { title: 'El rebote puede indicar una causa raíz activa', body: 'El retorno rápido del potencial de varnish o los indicadores de degradación tras el tratamiento puede apuntar a oxidación continua, estrés térmico, descarga electrostática, contaminación u otro mecanismo de generación sin resolver.' },
          { title: 'El punto final debe medirse', body: 'La remediación exitosa se verifica con datos apropiados de condición de fluido y evidencia de operación. La apariencia visual por sí sola no es base suficiente para declarar el aceite restaurado.' },
        ],
        customFaqs: [
          ['¿Qué problemas busca atender OILREVEX™?', 'OILREVEX™ trata productos de degradación seleccionados y contaminación relacionada con la química confirmada por análisis de fluido, particularmente condiciones que no se resuelven solo con filtración particulada convencional.'],
          ['¿Es OILREVEX™ simplemente un filtro de aceite más fino?', 'No. Es una familia de remediación seleccionada a partir de la condición diagnosticada del aceite. Según el fluido y contaminante, el tratamiento puede involucrar adsorción, intercambio iónico u otro medio offline validado además del control particulado.'],
          ['¿Por qué se requiere análisis de laboratorio antes del tratamiento?', 'Distintos síntomas pueden originarse por oxidación, agua, partículas, cambios de aditivo, acidez o productos de degradación formadores de depósito. El mecanismo de tratamiento debe coincidir con la causa confirmada en lugar del síntoma visual.'],
          ['¿Qué causa que los resultados de remediación reboten?', 'Si la oxidación, el estrés térmico, los efectos electrostáticos, la contaminación u otra fuente de degradación permanece activa, el contaminante objetivo puede regenerarse tras el tratamiento. La corrección de la causa raíz por lo tanto es parte del plan de remediación.'],
        ],
      },
    },
  },
  aquvexis: {
    summary: 'Tratamiento industrial de agua mediante mecanismos de separación particulada, adsorción, membrana e iónica.',
    technologies: {
      'depth-filtration': {
        title: 'Filtración en Profundidad',
        summary: 'Remoción particulada mediante estructuras de medio en profundidad seleccionadas según la carga de sólidos y objetivos de calidad de agua.',
        treatmentFunction: 'Capturar sólidos suspendidos a través del espesor del medio como pretratamiento o etapa independiente de control particulado.',
        mechanisms: ['Captura graduada en profundidad', 'Configuración de cartucho o lecho de medio', 'Prefiltración antes del tratamiento aguas abajo'],
        applications: ['Pretratamiento de agua industrial', 'Soporte de clarificación de agua de proceso', 'Protección de membrana', 'Control particulado de agua de servicio'],
        conditions: ['Carga de sólidos del agua de alimentación', 'Distribución de tamaño de partícula', 'Límites de caudal y caída de presión', 'Sensibilidad aguas abajo'],
        serviceSignals: ['Taponamiento rápido', 'Breakthrough de sólidos', 'Carga desigual', 'Ensuciamiento persistente aguas abajo'],
      },
      adsovex: {
        title: 'Tratamiento de Carbón Adsorbente',
        summary: 'Tratamiento de carbón adsorbente para orgánicos disueltos seleccionados, oxidantes residuales y duties de acondicionamiento de calidad de agua.',
        treatmentFunction: 'Usar medio de carbón para adsorber los constituyentes objetivo identificados en el análisis de agua y el objetivo de tratamiento.',
        mechanisms: ['Adsorción por carbón activado', 'Selección de medio según el perfil de contaminante', 'Gestión de tiempo de contacto y agotamiento'],
        applications: ['Pretratamiento de agua industrial', 'Pulido de agua de proceso', 'Pretratamiento de membrana', 'Duties seleccionados de reducción de olor y orgánicos'],
        conditions: ['Constituyente objetivo conocido', 'Concentración del agua de alimentación', 'Tiempo de contacto requerido', 'Contaminantes competidores y agotamiento del medio'],
        serviceSignals: ['Breakthrough temprano', 'Agotamiento inesperado del medio', 'La calidad de salida se desvía', 'El tratamiento aguas abajo permanece inestable'],
      },
      membravex: {
        title: 'Separación por Membrana',
        summary: 'Arquitectura de separación por membrana que abarca vías de tratamiento de ósmosis inversa, ultrafiltración y nanofiltración.',
        treatmentFunction: 'Separar constituyentes disueltos o suspendidos usando procesos de membrana seleccionados a partir del análisis del agua de alimentación y los requisitos del agua producto.',
        mechanisms: ['Separación por membrana impulsada por presión', 'Arquitectura de pretratamiento y control de ensuciamiento', 'Estrategia de recuperación, rechazo y limpieza por proyecto'],
        applications: ['Tratamiento de agua de proceso', 'Sistemas de reúso y recuperación', 'Acondicionamiento de agua de servicio', 'Preparación de agua de alimentación de alta calidad'],
        conditions: ['Análisis del agua de alimentación y potencial de ensuciamiento', 'Calidad de permeado requerida', 'Objetivo de recuperación', 'Estrategia de limpieza y pretratamiento'],
        serviceSignals: ['La calidad del permeado se deteriora', 'La demanda de presión normalizada sube', 'La recuperación declina', 'La frecuencia de limpieza se vuelve excesiva'],
        subfamilies: ['Ósmosis Inversa', 'Ultrafiltración', 'Nanofiltración'],
      },
      ionvexa: {
        title: 'Intercambio Iónico',
        summary: 'Tratamiento de intercambio iónico para remoción iónica selectiva y acondicionamiento de agua.',
        treatmentFunction: 'Intercambiar iones objetivo usando química de resina seleccionada según la composición del agua de alimentación y la calidad de salida requerida.',
        mechanisms: ['Intercambio catiónico y aniónico', 'Tratamiento de resina selectiva', 'Diseño de regeneración o ciclo de servicio'],
        applications: ['Ablandamiento de agua', 'Trenes de desmineralización', 'Acondicionamiento de agua de proceso', 'Pretratamiento y pulido'],
        conditions: ['Composición iónica del agua de alimentación', 'Iones objetivo y requisito de salida', 'Capacidad de resina y estrategia de regeneración', 'Iones competidores y riesgo de ensuciamiento'],
        serviceSignals: ['Ciclo de servicio corto', 'Fuga de dureza o iones', 'Mala recuperación en regeneración', 'La calidad de salida varía inesperadamente'],
      },
      electrodeionization: {
        title: 'Electrodesionización',
        summary: 'Pulido iónico asistido eléctricamente usado dentro de sistemas de agua de alta pureza adecuadamente pretratados.',
        treatmentFunction: 'Reducir especies iónicas residuales mediante una etapa continua de remoción de iones impulsada eléctricamente tras un tratamiento aguas arriba apropiado.',
        mechanisms: ['Medio de intercambio iónico', 'Membranas ion-selectivas', 'Potencial eléctrico aplicado para transporte iónico continuo'],
        applications: ['Pulido de agua de alta pureza', 'Desionización post-membrana', 'Sistemas industriales de agua de servicio', 'Acondicionamiento final de agua de proceso'],
        conditions: ['Calidad de alimentación pretratada estable', 'Carga iónica residual', 'Ventana operativa eléctrica e hidráulica', 'Control de incrustación y ensuciamiento'],
        serviceSignals: ['La resistividad o conductividad del agua producto se desvía', 'Sube la caída de presión', 'La demanda de corriente cambia inesperadamente', 'Se desarrolla evidencia de incrustación o ensuciamiento'],
      },
    },
  },
};
