// Spanish copy for the published /es/families/ pages.
// Translations of the governed English sources (product-families-data, canonical-engineering,
// protection-systems-data, failure-knowledge). Technology names stay as registered marks.
// Keep meaning identical to the English source: no added claims, values or certifications.

export interface FamilyEs {
  readonly name: string;
  readonly seoTitle: string;
  readonly purpose: string;
  readonly engineering: string;
}

export const FAMILY_ES: Record<string, FamilyEs> = {
  'primary-air': {
    name: 'Aire primario',
    seoTitle: 'Elementos de filtro de aire primario para motores de servicio pesado',
    purpose: 'Los elementos de aire primario son la principal barrera contra la contaminación que protege la cámara de combustión de la ingestión de partículas.',
    engineering: 'El medio de densidad progresiva MACROCORE™ distribuye la carga de contaminantes en toda la profundidad del medio, equilibrando eficiencia, capacidad y restricción.',
  },
  'secondary-air': {
    name: 'Elementos de aire secundario / de seguridad',
    seoTitle: 'Elementos de filtro de aire secundario y de seguridad',
    purpose: 'Los elementos de aire secundario y de seguridad forman la barrera de protección final aguas abajo del elemento primario cuando este está dañado, sobrecargado, mal asentado o retirado durante el servicio.',
    engineering: 'El medio de seguridad de fibra fina aporta redundancia de protección, no carga rutinaria de polvo. Esta familia única reemplaza el antiguo listado duplicado de Elementos de Seguridad.',
  },
  'air-cleaner-housings': {
    name: 'Carcasas de filtro de aire',
    seoTitle: 'Carcasas de filtro de aire para servicio pesado',
    purpose: 'Las carcasas de filtro de aire proporcionan el alojamiento estructural y la interfaz de sellado para los elementos de aire primario y secundario.',
    engineering: 'La arquitectura de carcasa INTEKCORE™ controla la geometría de sellado, la integridad estructural, el recorrido del flujo de aire y la protección contra el bypass en la interfaz entre elemento y carcasa.',
  },
  'primary-fuel': {
    name: 'Combustible primario',
    seoTitle: 'Filtros de combustible diésel primarios',
    purpose: 'Los filtros de combustible primarios retienen sedimentos, óxido y contaminación gruesa por partículas antes de que el combustible llegue a la etapa de filtración final y al circuito de inyección.',
    engineering: 'El medio SYNTAPORE™ proporciona una captura escalonada de partículas acorde con los requisitos de limpieza del sistema de combustible y las condiciones de servicio.',
  },
  'secondary-fuel': {
    name: 'Combustible secundario',
    seoTitle: 'Filtros de combustible diésel secundarios',
    purpose: 'Los filtros de combustible secundarios realizan el control final de partículas inmediatamente aguas arriba de la bomba de alta presión y los inyectores.',
    engineering: 'La filtración fina SYNTAPORE™ controla la población crítica de partículas que amenaza las holguras de precisión de la inyección.',
  },
  'fuel-water-separators': {
    name: 'Separadores de agua y combustible',
    seoTitle: 'Filtros separadores de agua para diésel',
    purpose: 'Los separadores de agua y combustible retiran el agua libre y emulsionada, y apoyan el control de partículas en los sistemas de combustible diésel.',
    engineering: 'HYDROCORE™ combina separación escalonada, coalescencia de gotas, recolección de agua y una barrera hidrofóbica final para aplicaciones estándar de separadores de agua y combustible spin-on y de cartucho, no tipo turbina.',
  },
  'oil-filters': {
    name: 'Filtros de aceite',
    seoTitle: 'Filtros de aceite de motor para servicio pesado y liviano',
    purpose: 'Los filtros de aceite controlan los aglomerados de hollín, las partículas de desgaste y los subproductos de oxidación antes de que el lubricante regrese a las interfaces críticas.',
    engineering: 'El medio compuesto de flujo total SYNTRAX™ equilibra eficiencia, capacidad de retención, caída de presión e integridad de válvulas a lo largo del intervalo de servicio.',
  },
  'hydraulic-filters': {
    name: 'Filtros hidráulicos',
    seoTitle: 'Filtros hidráulicos para maquinaria pesada',
    purpose: 'Los filtros hidráulicos mantienen la limpieza del fluido según las tolerancias de bombas, válvulas, actuadores y servocontroles.',
    engineering: 'NANOFORCE™ utiliza medios con clasificación Beta y una construcción resistente al colapso, adaptados al caudal, la presión, el tamaño de partícula y el ciclo de trabajo.',
  },
  'coolant-filters': {
    name: 'Filtros de refrigerante',
    seoTitle: 'Filtros de refrigerante para servicio pesado',
    purpose: 'Los filtros de refrigerante controlan los productos de corrosión y las incrustaciones, y apoyan la condición de los aditivos del refrigerante en circuitos de refrigeración de servicio pesado.',
    engineering: 'THERMACORE™ combina la liberación controlada de aditivos con la retención de partículas para proteger camisas, sellos, conductos y superficies de transferencia de calor.',
  },
  'cabin-filters': {
    name: 'Filtros de cabina',
    seoTitle: 'Filtros de aire de cabina para camiones y equipos',
    purpose: 'Los filtros de cabina protegen el aire del operador y de los pasajeros frente a partículas, alérgenos, olores y determinados contaminantes gaseosos.',
    engineering: 'MICROKAPPA™ combina la captura mecánica y electrostática de partículas con capas de adsorción cuando la aplicación lo requiere.',
  },
  'fuel-turbine': {
    name: 'Separación de combustible tipo turbina',
    seoTitle: 'Separadores de agua de combustible tipo turbina (FH / FG)',
    purpose: 'Carcasas de separación de combustible Turbine Series FH y FG y sus elementos de reemplazo dedicados para la arquitectura aprobada de separación de agua y combustible tipo turbina.',
    engineering: 'TURBOCORE™ gobierna exclusivamente la arquitectura de carcasa y elemento tipo turbina FH/FG. La familia del elemento y el grado de micras se seleccionan por separado: 2010 = serie 500, 2020 = serie 1000 y 2040 = serie 900. Cada familia puede usar grados de 2, 10 o 30 µm cuando estén aprobados; 2 µm es filtración final, 10 µm filtración secundaria y 30 µm filtración primaria. Los sufijos históricos SM/TM/PM corresponden a 2/10/30 µm. El número 2010/2020/2040 nunca define por sí solo el grado de micras. HYDROCORE™ se reserva para separadores de agua y combustible estándar, no tipo turbina.',
  },
  'air-dryer-filters': {
    name: 'Filtros secadores de aire',
    seoTitle: 'Cartuchos secadores de aire para frenos',
    purpose: 'Los elementos secadores de aire retiran el vapor de agua de los sistemas neumáticos de frenado y de aire de instrumentos.',
    engineering: 'El desecante de tamiz molecular DRYCORE™ adsorbe el vapor de agua para proteger válvulas, actuadores y controles neumáticos frente a la corrosión y el congelamiento.',
  },
};

export interface TechnologyEs {
  readonly engineeringPrinciple: string;
  readonly operationalImpact: string;
  readonly controlStrategy: string;
  readonly definition: string;
}

export const TECHNOLOGY_ES: Record<string, TechnologyEs> = {
  macrocore: {
    engineeringPrinciple: 'La configuración del medio, la integridad del sellado y la gestión del flujo de aire actúan en conjunto para controlar la contaminación transportada por el aire antes de que llegue al motor.',
    operationalImpact: 'Controlar la contaminación en la admisión ayuda a proteger cilindros, anillos de pistón, turbocompresores y el desempeño del sistema de combustión.',
    controlStrategy: 'Adaptar la configuración del medio, la geometría de sellado, los límites de restricción y el intervalo de servicio al ciclo de trabajo de la admisión y a la carga de contaminación.',
    definition: 'Una arquitectura de filtración de aire del motor para la protección primaria y secundaria de la admisión.',
  },
  intekcore: {
    engineeringPrinciple: 'La geometría de la carcasa, la integridad estructural, la retención del elemento y la carga del sello preservan el límite protegido de la admisión.',
    operationalImpact: 'Un sellado y una gestión del flujo de aire confiables reducen el ingreso de aire sin filtrar y respaldan el desempeño del sistema de admisión.',
    controlStrategy: 'Validar el dimensionamiento de la carcasa, el recorrido de entrada, la restricción, el ajuste del elemento y el sellado bajo el ciclo de trabajo previsto.',
    definition: 'Una arquitectura de carcasa de filtro de aire y sellado para un flujo de aire controlado y la prevención del bypass.',
  },
  syntapore: {
    engineeringPrinciple: 'La filtración de combustible se escalona para controlar la contaminación por partículas antes de que llegue a bombas e inyectores.',
    operationalImpact: 'Un combustible más limpio ayuda a mantener la confiabilidad del sistema de combustible y la protección de los componentes de precisión.',
    controlStrategy: 'Aplicar la eficiencia, capacidad, caudal y caída de presión requeridos en cada etapa aprobada de filtración de combustible.',
    definition: 'Una arquitectura de filtración de partículas del combustible diésel para aplicaciones de filtros de combustible primarios, secundarios y de cartucho.',
  },
  hydrocore: {
    engineeringPrinciple: 'El comportamiento de separación y coalescencia se adapta a la configuración aprobada de separador estándar, sin extender el alcance de HYDROCORE a sistemas tipo turbina FH o FG.',
    operationalImpact: 'Una separación controlada del agua ayuda a reducir el arrastre de agua hacia los componentes del sistema de combustible aguas abajo.',
    controlStrategy: 'Adaptar el elemento separador, el caudal requerido, la configuración de manejo del agua y la condición de servicio a la aplicación aprobada no tipo turbina.',
    definition: 'Una arquitectura de separación de agua y combustible para filtros separadores estándar aprobados, no tipo turbina, incluidas las configuraciones con drenaje y con vaso transparente.',
  },
  syntrax: {
    engineeringPrinciple: 'El desempeño de filtración, la capacidad de retención, la caída de presión y la integridad de válvulas se equilibran a lo largo del intervalo de servicio del lubricante.',
    operationalImpact: 'Un lubricante más limpio ayuda a proteger cojinetes, muñones y otros componentes lubricados.',
    controlStrategy: 'Adaptar el desempeño de filtración y el intervalo de servicio a la exigencia del motor y a la condición del lubricante.',
    definition: 'Una arquitectura de filtración de lubricación para controlar las partículas de desgaste y la contaminación del lubricante.',
  },
  nanoforce: {
    engineeringPrinciple: 'El medio y la construcción del elemento se adaptan al caudal, la presión, el tamaño de partícula, la temperatura y el ciclo de trabajo.',
    operationalImpact: 'Controlar la limpieza del fluido ayuda a reducir el desgaste, el agarrotamiento de válvulas y la pérdida de precisión hidráulica.',
    controlStrategy: 'Fijar los objetivos de limpieza según el componente hidráulico más sensible y validar la selección del filtro frente a los requisitos aplicables.',
    definition: 'Una arquitectura de filtración hidráulica para el control de la contaminación en sistemas de potencia fluida.',
  },
  thermacore: {
    engineeringPrinciple: 'La filtración del refrigerante apoya la limpieza de conductos, sellos y superficies de transferencia de calor dentro de la estrategia aprobada de mantenimiento del sistema de refrigeración.',
    operationalImpact: 'Una condición estable del refrigerante ayuda a proteger los componentes del sistema de refrigeración y el desempeño térmico.',
    controlStrategy: 'Adaptar la química del filtro, la capacidad, el caudal y el intervalo de servicio a los requisitos del motor y del refrigerante.',
    definition: 'Una arquitectura de protección del sistema de refrigeración para la limpieza del refrigerante y la protección de componentes.',
  },
  microkappa: {
    engineeringPrinciple: 'La filtración de cabina se selecciona según la exposición del operador, la demanda de flujo de aire y los límites de caída de presión del sistema HVAC.',
    operationalImpact: 'Una mejor calidad del aire de cabina favorece la comodidad del operador y la operación sostenida del equipo.',
    controlStrategy: 'Adaptar la configuración del medio al entorno de operación y al requisito de protección del aire de cabina.',
    definition: 'Una arquitectura de protección del aire de cabina para el control de partículas y de determinados contaminantes gaseosos.',
  },
  turbocore: {
    engineeringPrinciple: 'La geometría de la carcasa, la separación escalonada, la retención del elemento, el sellado y el recorrido del flujo operan como una sola arquitectura de separación de agua y combustible específica para turbina. La familia del elemento y el grado de filtración son variables de selección independientes: 2010 corresponde a la arquitectura serie 500, 2020 a la serie 1000 y 2040 a la serie 900; cada familia puede especificarse en grados de 2, 10 o 30 µm cuando estén aprobados.',
    operationalImpact: 'Mantener tanto la familia de elemento correcta para la turbina como el grado de micras correcto respalda la función de separación escalonada prevista y reduce los riesgos de bypass, sellado, montaje y selección de etapa incorrecta.',
    controlStrategy: 'Primero, asociar la carcasa FH o FG aprobada con la familia de elemento correcta (2010, 2020 o 2040). Luego, seleccionar de forma independiente el grado de filtración aprobado: 2 µm final, 10 µm secundaria o 30 µm primaria. Los sufijos históricos SM/TM/PM corresponden a 2/10/30 µm, respectivamente. No deducir el grado de micras a partir del número de familia 2010/2020/2040 ni sustituir con elementos de separadores estándar no tipo turbina.',
    definition: 'Una arquitectura de separación de agua y combustible tipo turbina, reservada exclusivamente para sistemas aprobados de las series FH y FG y sus elementos de reemplazo dedicados.',
  },
  drycore: {
    engineeringPrinciple: 'El medio del secador de aire retira la humedad del aire comprimido antes de que la condensación afecte a los componentes neumáticos.',
    operationalImpact: 'El aire comprimido seco ayuda a proteger válvulas, actuadores y la confiabilidad del sistema de frenos.',
    controlStrategy: 'Adaptar la capacidad, el comportamiento de purga, el flujo de aire y el intervalo de reemplazo a la exigencia del compresor y a la exposición a la humedad ambiental.',
    definition: 'Una arquitectura de filtración para secadores de aire que controla la humedad en sistemas neumáticos de frenos.',
  },
};

export interface SystemEs {
  readonly name: string;
  readonly engineeringPrinciple: string;
  readonly overview: string;
}

export const SYSTEM_ES: Record<string, SystemEs> = {
  'air-intake': {
    name: 'Protección de admisión y flujo de aire',
    engineeringPrinciple: 'La densidad progresiva del medio, el sellado controlado, la captura electrostática, la adsorción y el secado con desecante se aplican según el recorrido de aire protegido. Cada familia atiende un límite de contaminación distinto y forma parte de una sola arquitectura de protección del flujo de aire.',
    overview: 'La protección de admisión y flujo de aire es la primera capa de defensa de cualquier estrategia de control de la contaminación. Integra la filtración de aire del motor, la protección secundaria de seguridad, la calidad del aire de la cabina del operador, las carcasas de filtro de aire y los elementos secadores de aire en un solo dominio coordinado de protección del flujo de aire.',
  },
  'fuel-cleanliness': {
    name: 'Protección de la limpieza del combustible',
    engineeringPrinciple: 'SYNTAPORE™ controla la contaminación por partículas. HYDROCORE™ gobierna las aplicaciones estándar de separadores de agua y combustible spin-on y de cartucho, no tipo turbina, mientras que TURBOCORE™ gobierna las carcasas de separación de agua y combustible tipo turbina FH/FG aplicables y sus configuraciones de reemplazo dedicadas de las series 2010/2020/2040.',
    overview: 'La protección de la limpieza del combustible defiende los sistemas de inyección de alta presión al controlar la contaminación por partículas y el agua antes de que el combustible llegue a bombas e inyectores de precisión.',
  },
  lubrication: {
    name: 'Protección de la lubricación',
    engineeringPrinciple: 'El medio compuesto de flujo total equilibra eficiencia, capacidad de retención, caída de presión e integridad de válvulas frente a cambios de viscosidad y temperatura.',
    overview: 'La protección de la lubricación controla el hollín, las partículas de desgaste y los subproductos de oxidación antes de que el aceite regrese a los cojinetes críticos y a las interfaces lubricadas.',
  },
  hydraulic: {
    name: 'Protección hidráulica',
    engineeringPrinciple: 'El medio con clasificación Beta, la construcción resistente al colapso y la estabilidad térmica se adaptan al caudal, la presión, el tamaño crítico de partícula y el ciclo de trabajo.',
    overview: 'La protección hidráulica mantiene la limpieza del fluido según las tolerancias de bombas, válvulas, actuadores y servocontroles.',
  },
  'cooling-system': {
    name: 'Protección del sistema de refrigeración',
    engineeringPrinciple: 'La liberación controlada de aditivos y la retención de partículas protegen camisas húmedas, superficies de transferencia de calor, sellos y conductos de refrigerante a lo largo del intervalo de servicio.',
    overview: 'La protección del sistema de refrigeración controla los productos de corrosión, los residuos de incrustaciones y la condición de los aditivos del refrigerante en circuitos de refrigeración de motores de servicio pesado.',
  },
};

export interface FailureEs {
  readonly name: string;
  readonly mechanism: string;
  readonly operationalImpact: string;
}

export const FAILURE_ES: Record<string, FailureEs> = {
  'particle-wear': {
    name: 'Desgaste por partículas',
    mechanism: 'Las partículas cortan, desgastan, marcan o inician fatiga en las superficies de los componentes cuando su tamaño, dureza y concentración superan la tolerancia de holgura de la interfaz protegida.',
    operationalImpact: 'El resultado es una pérdida progresiva de sellado, menor eficiencia, aumento de holguras, control inestable y menor vida útil de los componentes.',
  },
  'diesel-water': {
    name: 'Contaminación del diésel por agua',
    mechanism: 'El agua favorece la corrosión, reduce la lubricidad, propicia el crecimiento microbiano y genera riesgo de erosión o agarrotamiento dentro de los componentes de inyección de alta presión.',
    operationalImpact: 'La calidad del combustible se degrada, los inyectores pierden precisión de dosificación, la calidad de la combustión disminuye y aumenta la probabilidad de falla de bombas e inyectores.',
  },
  'hydraulic-system': {
    name: 'Contaminación del sistema hidráulico',
    mechanism: 'Las partículas circulan por bombas, válvulas, actuadores y servocontroles, donde producen abrasión, fatiga superficial, agarrotamiento y un desgaste acelerado de los sellos.',
    operationalImpact: 'La contaminación progresiva aumenta las fugas, reduce la precisión de control, eleva la generación de calor y aumenta la exposición a fallas de bombas, válvulas y actuadores.',
  },
};

export const PROTECTED_COMPONENTS_ES: Record<string, readonly string[]> = {
  macrocore: ['Cilindros', 'Anillos de pistón', 'Turbocompresores', 'Recorrido del aire de combustión'],
  microkappa: ['Entorno del operador', 'Recorrido de aire del HVAC', 'Calidad del aire de cabina'],
  intekcore: ['Sello entre elemento y carcasa', 'Límite de la admisión', 'Recorrido del flujo de aire', 'Interfaz de retención del filtro'],
  drycore: ['Válvulas neumáticas', 'Actuadores', 'Circuito de aire de frenos', 'Controles de aire comprimido'],
  syntapore: ['Bomba de combustible de alta presión', 'Inyectores', 'Componentes de dosificación de combustible', 'Circuito de inyección'],
  hydrocore: ['Recorrido de transferencia de combustible', 'Componentes de combustible sensibles al agua', 'Alimentación del sistema de inyección'],
  turbocore: ['Carcasa de turbina FH/FG', 'Elemento separador dedicado', 'Conjunto de vaso y drenaje', 'Alimentación del sistema de combustible aguas abajo'],
  syntrax: ['Cojinetes', 'Muñones', 'Interfaces lubricadas', 'Circuito de aceite del motor'],
  nanoforce: ['Bombas hidráulicas', 'Válvulas de control', 'Actuadores', 'Servocontroles'],
  thermacore: ['Conductos de refrigerante', 'Sellos', 'Camisas húmedas', 'Superficies de transferencia de calor'],
};

export const FIELD_QUESTIONS_ES: Record<string, readonly string[]> = {
  'primary-air': ['¿Cuál es la carga de polvo ambiental?', '¿Qué límite de restricción aplica a la admisión?', '¿Cómo se verifica el sellado después del servicio?', '¿Qué ciclo de trabajo determina la frecuencia de inspección?'],
  'secondary-air': ['¿El elemento de seguridad está pensado como barrera final y no como elemento de carga rutinaria de polvo?', '¿Se da servicio al elemento primario sin contaminar el lado limpio?', '¿Se verifica el asentamiento del elemento antes de volver a arrancar?', '¿Se inspeccionó la carcasa en busca de vías de bypass?'],
  'air-cleaner-housings': ['¿La carcasa está correctamente dimensionada para el flujo de aire requerido?', '¿El recorrido de entrada y la restricción son aceptables?', '¿El elemento asienta de manera uniforme contra el sello?', '¿Abrazaderas, tapas e interfaces están estructuralmente intactas?'],
  'primary-fuel': ['¿Qué contaminación ingresa desde el almacenamiento y la transferencia?', '¿Qué límites de caudal y caída de presión aplican?', '¿También hay agua en el suministro de combustible?', '¿Qué etapa de filtración aguas abajo debe protegerse?'],
  'secondary-fuel': ['¿Qué nivel de limpieza se requiere aguas arriba del circuito de inyección?', '¿Qué límites de caudal y caída de presión aplican en la filtración final?', '¿Es eficaz la separación de agua aguas arriba?', '¿Las prácticas de servicio evitan la contaminación del lado limpio?'],
  'fuel-water-separators': ['¿La contaminación es agua libre, agua emulsionada, partículas o una combinación?', '¿Qué caudal de combustible debe soportar el separador?', '¿Cómo se inspecciona y drena el agua recolectada?', '¿La orientación de instalación y el acceso para servicio son correctos?'],
  'fuel-turbine': ['¿Qué carcasa FH o FG aprobada está instalada?', '¿Qué configuración de reemplazo dedicada de las series 2010, 2020 o 2040 aplica?', '¿Qué caudal de combustible, disposición de puertos y condición de servicio debe soportar el sistema tipo turbina?', '¿Se verificaron el vaso, el drenaje, los sellos y la orientación del elemento para la carcasa aprobada?'],
  'oil-filters': ['¿Qué exigencia del motor y condición del aceite definen el intervalo de servicio?', '¿Qué rango de viscosidad y caudal deben soportarse?', '¿Qué carga de contaminantes se espera?', '¿Las funciones de bypass y antidrenaje son adecuadas para la aplicación?'],
  'hydraulic-filters': ['¿Qué componente tiene la holgura más estrecha?', '¿Qué objetivo de limpieza aplica al circuito?', '¿Cuáles son el caudal, la presión y la temperatura del sistema?', '¿Qué resistencia al colapso y ciclo de trabajo se requieren?'],
  'coolant-filters': ['¿Qué química de refrigerante está aprobada para el motor?', '¿Qué contaminación o productos de corrosión están presentes?', '¿Qué caudal y capacidad se requieren?', '¿Cómo encaja el filtro en la estrategia de mantenimiento del sistema de refrigeración?'],
  'cabin-filters': ['¿Qué contaminantes hay en el entorno del operador?', '¿Qué límites de flujo de aire y caída de presión del HVAC aplican?', '¿Se requiere un medio solo para partículas o con adsorción?', '¿Con qué frecuencia el entorno de operación justifica una inspección?'],
  'air-dryer-filters': ['¿Cuál es el ciclo de trabajo del compresor?', '¿Qué exposición a la humedad ambiental se espera?', '¿La purga funciona correctamente?', '¿Qué intervalo de reemplazo corresponde a la exigencia neumática?'],
};

export const SERVICE_DISCIPLINE_ES: Record<string, readonly string[]> = {
  macrocore: ['Inspeccionar todo el límite de la admisión, no solo el elemento.', 'Mantener protegido el lado limpio durante el retiro del elemento.', 'Verificar el asentamiento del elemento y el contacto del sello antes de devolver el activo al servicio.'],
  microkappa: ['Inspeccionar el desempeño del flujo de aire junto con la condición del medio.', 'Usar la configuración de medio que exige el entorno de operación.', 'Evitar introducir residuos en el lado limpio del HVAC durante el reemplazo.'],
  intekcore: ['Inspeccionar la geometría de la carcasa, las tapas, las abrazaderas y las superficies de sellado.', 'Corregir cualquier vía de bypass antes de instalar un elemento nuevo.', 'Confirmar el recorrido de entrada y la retención del elemento después del servicio.'],
  drycore: ['Tratar el control de la humedad como una función de confiabilidad del sistema neumático.', 'Confirmar el comportamiento de purga y la exigencia del compresor cuando la vida útil parezca anormal.', 'Inspeccionar la evidencia de humedad aguas abajo en lugar de reemplazar el elemento de forma aislada.'],
  syntapore: ['Proteger el lado limpio del circuito de combustible durante el servicio.', 'Investigar la contaminación del almacenamiento o la transferencia cuando los filtros se cargan anormalmente rápido.', 'Verificar todo el recorrido de filtración escalonada en lugar de tratar un solo elemento como todo el sistema.'],
  hydrocore: ['Drenar el agua recolectada según las condiciones de operación.', 'Inspeccionar los sellos, el estado del vaso y la orientación de instalación.', 'Investigar la fuente de combustible aguas arriba cuando la carga de agua se vuelve recurrente.'],
  turbocore: ['Dar servicio a la carcasa FH/FG y a su elemento dedicado como una sola arquitectura aprobada específica para turbina.', 'Verificar el vaso, el drenaje, los sellos, la orientación del elemento y el recorrido del flujo antes de devolver el sistema al servicio.', 'No sustituir con elementos de separadores estándar no tipo turbina basándose solo en dimensiones o apariencia.'],
  syntrax: ['Evaluar la condición del filtro junto con la condición del lubricante y la exigencia del motor.', 'Evitar el ingreso de contaminación durante el servicio de filtro y aceite.', 'Investigar una carga anormal de residuos como posible indicador de desgaste de componentes.'],
  nanoforce: ['Fijar el objetivo de filtración según el componente más sensible a la contaminación.', 'Controlar la contaminación introducida durante el servicio de mangueras, cilindros y depósitos.', 'Investigar una presión diferencial o una carga de residuos anormales antes de simplemente acortar los intervalos.'],
  thermacore: ['Mantener la selección del filtro alineada con la química de refrigerante aprobada.', 'Inspeccionar la condición del refrigerante y las fuentes de contaminación cuando la carga es anormal.', 'Tratar la filtración como parte de la estrategia completa de mantenimiento del sistema de refrigeración.'],
};

export const INDUSTRY_ES: Record<string, string> = {
  mining: 'Minería',
  agriculture: 'Agricultura',
  construction: 'Construcción',
  'trucks-fleets': 'Flotas de camiones',
  'power-generation': 'Generación de energía',
  marine: 'Sector marino',
  'oil-gas': 'Petróleo y gas',
  railway: 'Ferroviaria',
  'bus-coach': 'Buses y autocares',
  manufacturing: 'Manufactura',
  'waste-municipal': 'Residuos y servicios municipales',
  automotive: 'Automotriz',
};
