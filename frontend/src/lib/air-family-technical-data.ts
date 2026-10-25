// Scoped engineering editorial for the four air-related product families.
// These are application principles, not SKU-specific test or fitment approvals.
export const AIR_FAMILY_TECHNICAL_COPY = {
  "en": {
    "primary-air": {
      "headline": "Primary filtration: contamination load, airflow and installed sealing.",
      "mechanism": "The primary element is the normal dust-loading stage in the engine intake. Its media captures airborne particulate upstream of the turbocharger and combustion path; a correct fit and undamaged housing prevent unfiltered-air bypass.",
      "checks": [
        "Verify engine air demand, permissible restriction and any OEM restriction-indicator setting.",
        "Confirm media geometry, effective area, element retention, gasket compression and installation orientation.",
        "Evaluate dust exposure, precleaner configuration and service history; use documented ISO 5011 evidence for product performance claims."
      ],
      "boundary": "A secondary or safety element does not replace a loaded primary filter. Never infer suitability from external dimensions or nominal efficiency alone.",
      "parameters": [
        "Engine demand, allowable intake restriction and restriction-indicator setting.",
        "Dust exposure, precleaner condition, media surface area and expected loading.",
        "Primary element geometry, radial/axial seal and housing fit."
      ],
      "failureSignals": [
        "Dust traces downstream of the seal or particles on the clean side.",
        "Early restriction, reduced airflow or damaged media after severe-duty operation.",
        "Deformed end caps, compromised housing closures or an incorrect element seat."
      ],
      "service": [
        "Protect the clean-side outlet before removing the used primary element.",
        "Inspect seal lands, intake ducting, latches and restriction indicators; never clean the housing toward the clean side.",
        "Install the approved element without damaging media or seals and document post-service restriction."
      ]
    },
    "secondary-air": {
      "headline": "Secondary filtration: independent downstream protection.",
      "mechanism": "Where specified by the air-cleaner design, the secondary element forms a separate barrier downstream of the primary filter. Its function is protective redundancy during service or primary-stage damage, not routine environmental dust capture.",
      "checks": [
        "Verify the OEM housing provides an approved secondary-element position and compatible element geometry.",
        "Inspect independent seal contact, seating and retention without exposing or contaminating the clean side.",
        "Confirm assembled airflow and restriction with both stages installed; investigate clean-side dust or primary-filter damage before returning the equipment to service."
      ],
      "boundary": "Do not run the engine routinely with the primary element removed. A safety element must not be substituted for the primary stage or selected solely on size.",
      "parameters": [
        "Approved secondary position and exact primary/secondary element combination.",
        "Independent downstream seal and correct element seating, even with the primary removed for service.",
        "System pressure loss with both elements installed and the specified inspection policy."
      ],
      "failureSignals": [
        "Dust found on or past the secondary element; investigate primary-side bypass.",
        "Distorted safety element, torn seals or displaced retainers.",
        "Unexpected restriction after an unapproved secondary replacement."
      ],
      "service": [
        "Do not treat the secondary element as a routine cleaning or primary replacement stage.",
        "Leave the clean-side protection in place according to OEM service procedures; avoid dust transfer during primary service.",
        "Replace a contaminated or damaged secondary only as specified, after investigating the primary and housing."
      ]
    },
    "air-cleaner-housings": {
      "headline": "Housing and sealing: the physical boundary against bypass.",
      "mechanism": "INTEKCORE™ designates the air-cleaner housing and interface architecture. Correct inlet and outlet routing, closure, element retention and seal-land integrity keep intake air within the filtration path; the housing itself is not particulate media.",
      "checks": [
        "Match assembly identification, ports, mounting envelope and flow direction to the installed engine.",
        "Inspect covers, latches, clamps, seals, inlet ducts and housing deformation; check the element seats uniformly.",
        "Confirm design airflow and acceptable restriction using the specified primary and optional secondary elements."
      ],
      "boundary": "A visually similar housing cannot be considered interchangeable without complete mechanical and application verification. An intact filter medium cannot compensate for housing bypass.",
      "parameters": [
        "Housing part/assembly identity, inlet-outlet geometry and mounting clearances.",
        "Rated airflow and assembled restriction with the approved element configuration.",
        "Seal-land geometry, element retention, covers, drains or ejector valves when fitted."
      ],
      "failureSignals": [
        "Dust tracks around a gasket or at a joint on the clean side.",
        "Cracked housing, missing fasteners, warped lids or disconnected intake ducts.",
        "Unusual restriction from duct routing, collapsed components or a blocked precleaner."
      ],
      "service": [
        "Inspect the empty housing and downstream duct for dust ingress or damage.",
        "Replace failed seals, clamps and housings before installing a new filter element.",
        "Verify closure torque or retention as specified; recheck airflow path and access for future service."
      ]
    },
    "cabin-filters": {
      "headline": "Cabin HVAC filtration: particulate control within airflow limits.",
      "mechanism": "MICROKAPPA™ covers cabin ventilation-air filter media. Particle retention and, when specified, adsorption media address distinct contaminants. Media selection must respect HVAC airflow and pressure-drop requirements.",
      "checks": [
        "Identify the approved cabin-filter housing, element dimensions, airflow direction and seal interfaces.",
        "Evaluate dust, pollen and particle exposure; specify carbon adsorption only for validated element configurations.",
        "Confirm blower airflow, pressure-drop allowance, maintenance access and any applicable cabin filtration test evidence."
      ],
      "boundary": "Cabin filtration must not be presented as certified respiratory protection or universal protection from exhaust gases. Media capabilities must be verified for each approved application.",
      "parameters": [
        "HVAC blower airflow, permissible pressure drop and element dimensions.",
        "Particle-exposure environment and validated particulate-media configuration.",
        "Adsorption stage only where approved, including media orientation and available service space."
      ],
      "failureSignals": [
        "Decreased airflow through vents with abnormal pressure loss.",
        "Dust bypass at a mis-seated cabin filter or damaged HVAC cover.",
        "Persistent odors despite a particulate-only element; investigate the actual adsorption requirement."
      ],
      "service": [
        "Inspect enclosure and sealing rails before placing the replacement element.",
        "Respect airflow direction; do not crush pleats or bypass the frame.",
        "Confirm blower operation and air delivery; do not present the element as gas or respiratory protection."
      ]
    },
    "air-dryer-filters": {
      "headline": "Compressed-air drying depends on the cartridge and the complete pneumatic system.",
      "mechanism": "DRYCORE™ applies to approved air-dryer cartridges and desiccant configurations. Adsorption of water vapor depends on operating temperature, pressure, flow, purge regeneration and the integrity of the installed dryer assembly.",
      "checks": [
        "Identify compressor, dryer assembly, cartridge model and approved sealing design.",
        "Confirm flow, operating pressure, temperature, purge cycle and expected moisture loading.",
        "Inspect drain or purge function and downstream moisture evidence; distinguish dryer faults from cartridge exhaustion."
      ],
      "boundary": "An air-dryer cartridge cannot guarantee pneumatic-brake safety or a universal dry-air performance level. The compressor and dryer must operate correctly and the exact installation must be validated.",
      "parameters": [
        "Compressor duty cycle, compressed-air volume, pressure and temperature.",
        "Regeneration/purge behavior, desiccant configuration and cartridge compatibility.",
        "Ambient moisture exposure, leakage and maintenance requirements downstream."
      ],
      "failureSignals": [
        "Repeated downstream liquid water or abnormal moisture indications.",
        "Short or ineffective purge cycles, excessive compressor run time or air leaks.",
        "Incorrect cartridge seating, damaged O-rings or mechanical dryer faults."
      ],
      "service": [
        "Inspect compressor operation, dryer exhaust/purge and tubing before replacing a cartridge.",
        "Fit the approved cartridge with correct seals, alignment and specified tightening procedure.",
        "Check purge and downstream moisture after service according to the equipment manufacturer."
      ]
    }
  },
  "es": {
    "primary-air": {
      "headline": "Filtración primaria: carga de polvo, caudal y sellado instalado.",
      "mechanism": "El elemento primario soporta la carga normal de polvo en la admisión del motor. Su medio retiene partículas antes del turbocompresor y la combustión; el ajuste correcto y la integridad de la carcasa evitan el paso de aire sin filtrar.",
      "checks": [
        "Verificar el caudal de aire requerido, la restricción admisible y el ajuste del indicador de restricción según el OEM.",
        "Confirmar geometría del medio, área efectiva, retención, compresión de juntas y orientación de montaje.",
        "Evaluar exposición al polvo, prelimpieza e historial de servicio; exigir evidencia ISO 5011 del producto para declarar prestaciones."
      ],
      "boundary": "El elemento secundario o de seguridad no sustituye al primario cargado. No debe inferirse idoneidad únicamente por dimensiones externas o eficiencia nominal.",
      "parameters": [
        "Caudal de admisión exigido por el motor, restricción admisible y ajuste del indicador.",
        "Concentración y tipo de polvo, estado de prelimpieza, superficie de medio y carga prevista.",
        "Geometría del primario, sellado radial o axial y ajuste dentro de la carcasa."
      ],
      "failureSignals": [
        "Rastros de polvo aguas abajo del sello o partículas en el lado limpio.",
        "Restricción prematura, pérdida de caudal o medio dañado en servicio severo.",
        "Tapas deformadas, cierres defectuosos o elemento mal asentado."
      ],
      "service": [
        "Proteger la salida del lado limpio antes de retirar el elemento utilizado.",
        "Inspeccionar superficies de sellado, conductos, cierres e indicador de restricción; evitar introducir polvo hacia el lado limpio.",
        "Montar el elemento aprobado sin dañar pliegues ni juntas y registrar la condición de restricción."
      ]
    },
    "secondary-air": {
      "headline": "Filtración secundaria: protección independiente aguas abajo.",
      "mechanism": "Cuando la carcasa está diseñada para ello, el elemento secundario crea una barrera adicional aguas abajo del primario. Su función es aportar redundancia durante el servicio o ante daños en la etapa primaria, no retener la carga ambiental normal de polvo.",
      "checks": [
        "Verificar que la carcasa OEM dispone de una posición aprobada para secundario y geometría compatible.",
        "Inspeccionar contacto del sello independiente, asiento y retención sin exponer ni contaminar el lado limpio.",
        "Confirmar caudal y restricción con ambas etapas instaladas; investigar polvo en el lado limpio o daños antes del retorno al servicio."
      ],
      "boundary": "No operar rutinariamente el motor sin el primario. El elemento de seguridad no puede sustituir esa etapa ni seleccionarse solo por tamaño.",
      "parameters": [
        "Posición secundaria aprobada y combinación exacta de elementos primario/secundario.",
        "Sellado independiente aguas abajo y asiento correcto durante el servicio del primario.",
        "Pérdida de presión con ambas etapas montadas y política de inspección OEM."
      ],
      "failureSignals": [
        "Polvo depositado sobre o después del secundario: investigar fuga en el primario.",
        "Elemento de seguridad deformado, sellos rotos o retención desplazada.",
        "Restricción inesperada tras instalar un secundario no aprobado."
      ],
      "service": [
        "No utilizar el secundario como etapa de limpieza rutinaria ni reemplazo del primario.",
        "Mantener la protección del lado limpio conforme al procedimiento OEM; evitar transferir polvo durante el servicio.",
        "Sustituir un secundario contaminado o dañado según especificación, después de investigar primario y carcasa."
      ]
    },
    "air-cleaner-housings": {
      "headline": "Carcasa y sellado: barrera física frente al bypass.",
      "mechanism": "INTEKCORE™ identifica la arquitectura de carcasa e interfaces de admisión. La orientación de entradas y salidas, el cierre, la retención y la integridad de las superficies de sellado mantienen el aire dentro del recorrido filtrante; la carcasa no es un medio de captura de partículas.",
      "checks": [
        "Conciliar identificación del conjunto, puertos, geometría de montaje y dirección de flujo con el motor instalado.",
        "Inspeccionar tapas, pestillos, abrazaderas, juntas, conductos y deformaciones; comprobar asiento uniforme del elemento.",
        "Confirmar caudal de diseño y restricción admisible con el primario y el secundario cuando corresponda."
      ],
      "boundary": "Una carcasa visualmente similar no acredita intercambiabilidad sin verificación mecánica y de aplicación. Un medio filtrante intacto no corrige un bypass en la carcasa.",
      "parameters": [
        "Identidad del conjunto, geometría de puertos, orientación y espacio de montaje.",
        "Caudal nominal y restricción del conjunto con los elementos aprobados.",
        "Superficies de sellado, retención, tapas y válvulas de evacuación cuando existan."
      ],
      "failureSignals": [
        "Huellas de polvo en la junta o unión del lado limpio.",
        "Grietas, fijaciones ausentes, tapas deformadas o conductos desconectados.",
        "Restricción por conductos mal dispuestos, componentes colapsados o prelimpieza bloqueada."
      ],
      "service": [
        "Inspeccionar la carcasa vacía y el conducto aguas abajo para detectar ingreso de polvo.",
        "Corregir juntas, abrazaderas o carcasas dañadas antes de instalar un elemento nuevo.",
        "Verificar cierre y retención según especificación; comprobar recorrido y accesibilidad para mantenimiento."
      ]
    },
    "cabin-filters": {
      "headline": "HVAC de cabina: captura de partículas y límites de caudal.",
      "mechanism": "MICROKAPPA™ comprende los medios filtrantes del aire de ventilación de cabina. La retención de partículas y la adsorción, cuando se especifique, responden a contaminantes diferentes. La selección debe respetar caudal y pérdida de presión del HVAC.",
      "checks": [
        "Identificar carcasa, dimensiones, dirección del aire e interfaces de sellado aprobadas.",
        "Evaluar polvo, polen y partículas; especificar carbón activo solo en configuraciones de elemento validadas.",
        "Confirmar caudal del ventilador, presión diferencial admisible, acceso de servicio y ensayos aplicables de filtración de cabina."
      ],
      "boundary": "La filtración de cabina no debe presentarse como protección respiratoria certificada ni como barrera universal contra gases de escape. Las prestaciones del medio deben verificarse para cada aplicación aprobada.",
      "parameters": [
        "Caudal del ventilador HVAC, pérdida de presión admisible y dimensiones del elemento.",
        "Condiciones de exposición a partículas y configuración validada del medio filtrante.",
        "Adsorción solo cuando esté aprobada, con orientación y acceso de servicio adecuados."
      ],
      "failureSignals": [
        "Caudal reducido en difusores acompañado de pérdida de presión anormal.",
        "Paso de polvo por filtro mal asentado o tapa del HVAC dañada.",
        "Persistencia de olores con un filtro solo de partículas: evaluar necesidad real de adsorción."
      ],
      "service": [
        "Inspeccionar carcasa y guías de sellado antes de instalar el repuesto.",
        "Respetar dirección de flujo; no aplastar pliegues ni dejar huecos alrededor del marco.",
        "Comprobar ventilador y distribución de aire; no presentar el filtro como protección respiratoria ni contra gases universales."
      ]
    },
    "air-dryer-filters": {
      "headline": "El secado de aire comprimido depende del cartucho y del circuito neumático.",
      "mechanism": "DRYCORE™ comprende cartuchos secadores y configuraciones desecantes aprobadas. La adsorción del vapor de agua depende de temperatura, presión, caudal, regeneración por purga e integridad del conjunto secador instalado.",
      "checks": [
        "Identificar compresor, secador, modelo de cartucho y diseño de sellado aprobado.",
        "Verificar caudal, presión, temperatura, ciclo de purga y exposición esperada a humedad.",
        "Inspeccionar funcionamiento de purga y humedad aguas abajo; diferenciar fallos del secador de saturación del cartucho."
      ],
      "boundary": "Un cartucho secador no certifica por sí mismo la seguridad de los frenos neumáticos ni un nivel universal de secado. Es imprescindible validar el funcionamiento del compresor y del conjunto secador.",
      "parameters": [
        "Ciclo de trabajo del compresor, volumen de aire, presión y temperatura.",
        "Comportamiento de regeneración y purga, medio desecante y compatibilidad del cartucho.",
        "Humedad ambiental, fugas y requisitos de mantenimiento aguas abajo."
      ],
      "failureSignals": [
        "Aparición recurrente de agua líquida aguas abajo o indicación de humedad anormal.",
        "Purga incompleta, tiempo excesivo de compresor o fugas de aire.",
        "Cartucho mal asentado, juntas tóricas dañadas o fallos mecánicos del secador."
      ],
      "service": [
        "Inspeccionar funcionamiento del compresor, escape de purga y tuberías antes de sustituir el cartucho.",
        "Instalar cartucho aprobado con sellos y apriete según el fabricante.",
        "Comprobar purga y humedad aguas abajo después del servicio según especificación del equipo."
      ]
    }
  },
  "pt": {
    "primary-air": {
      "headline": "Filtração primária: carga de poeira, vazão e vedação instalada.",
      "mechanism": "O elemento primário recebe a carga normal de poeira na admissão do motor. Seu meio retém partículas antes do turbocompressor e da combustão; o encaixe correto e a integridade da carcaça evitam passagem de ar não filtrado.",
      "checks": [
        "Verificar a vazão de ar exigida, a restrição permitida e a regulagem do indicador de restrição conforme o OEM.",
        "Confirmar geometria do meio, área efetiva, retenção, compressão das vedações e orientação de montagem.",
        "Avaliar exposição à poeira, pré-limpeza e histórico de manutenção; exigir evidências ISO 5011 do produto para alegações de desempenho."
      ],
      "boundary": "O elemento secundário ou de segurança não substitui o primário carregado. Não se deve inferir adequação apenas por dimensões externas ou eficiência nominal.",
      "parameters": [
        "Vazão de admissão exigida, restrição permitida e regulagem do indicador.",
        "Concentração e tipo de poeira, condição do pré-limpador, área do meio e carga prevista.",
        "Geometria do elemento primário, vedação radial ou axial e encaixe na carcaça."
      ],
      "failureSignals": [
        "Rastros de poeira após a vedação ou partículas no lado limpo.",
        "Restrição prematura, queda de vazão ou meio danificado em serviço severo.",
        "Tampas deformadas, fechamentos deficientes ou elemento fora do assento."
      ],
      "service": [
        "Proteger a saída do lado limpo antes da retirada do elemento usado.",
        "Inspecionar superfícies de vedação, dutos, travas e indicador de restrição, sem levar poeira ao lado limpo.",
        "Instalar o elemento aprovado sem danificar pregas ou vedações e registrar a restrição."
      ]
    },
    "secondary-air": {
      "headline": "Filtração secundária: proteção independente a jusante.",
      "mechanism": "Quando prevista na carcaça, a etapa secundária oferece uma barreira adicional a jusante do elemento primário. Sua finalidade é redundância protetora durante a manutenção ou diante de danos na etapa principal, não a retenção normal da poeira ambiental.",
      "checks": [
        "Confirmar que a carcaça OEM possui posição aprovada para elemento secundário e geometria compatível.",
        "Inspecionar contato da vedação independente, assentamento e retenção sem expor ou contaminar o lado limpo.",
        "Verificar vazão e restrição com ambos os estágios instalados; investigar poeira no lado limpo ou danos antes de retomar a operação."
      ],
      "boundary": "Não operar rotineiramente o motor sem o primário. O elemento de segurança não substitui esse estágio nem deve ser selecionado apenas por tamanho.",
      "parameters": [
        "Posição secundária aprovada e conjunto exato dos elementos primário e secundário.",
        "Vedação independente a jusante e assentamento correto durante o serviço do primário.",
        "Perda de pressão com ambos os estágios instalados e política de inspeção OEM."
      ],
      "failureSignals": [
        "Poeira sobre ou após o secundário: investigar falha da etapa primária.",
        "Elemento de segurança deformado, vedações rasgadas ou retenção deslocada.",
        "Restrição inesperada após substituição por secundário não aprovado."
      ],
      "service": [
        "Não usar o secundário para limpeza rotineira nem como substituto do primário.",
        "Manter a proteção do lado limpo conforme o procedimento OEM, sem transferir poeira durante o serviço.",
        "Substituir secundário contaminado ou danificado segundo especificação, após examinar primário e carcaça."
      ]
    },
    "air-cleaner-housings": {
      "headline": "Carcaça e vedação: limite físico contra passagem sem filtração.",
      "mechanism": "INTEKCORE™ identifica a arquitetura da carcaça e das interfaces de admissão. Entradas e saídas corretas, fechamento, retenção e superfícies de vedação íntegras mantêm o ar no percurso filtrante; a carcaça não é um meio de captura de partículas.",
      "checks": [
        "Conciliar identificação do conjunto, conexões, geometria de montagem e direção de fluxo com o motor instalado.",
        "Inspecionar tampas, travas, abraçadeiras, vedações, dutos e deformações; verificar assentamento uniforme do elemento.",
        "Confirmar vazão de projeto e restrição permitida com primário e secundário quando aplicável."
      ],
      "boundary": "Uma carcaça visualmente semelhante não comprova intercambialidade sem verificação mecânica e de aplicação. Um meio filtrante íntegro não corrige desvio de ar pela carcaça.",
      "parameters": [
        "Identidade do conjunto, geometria das conexões, orientação e espaço de montagem.",
        "Vazão nominal e restrição do conjunto com os elementos aprovados.",
        "Superfícies de vedação, retenção, tampas e válvulas de evacuação quando existentes."
      ],
      "failureSignals": [
        "Marcas de poeira na junta ou conexão do lado limpo.",
        "Trincas, fixadores ausentes, tampas deformadas ou dutos desconectados.",
        "Restrição por roteamento incorreto, componentes colapsados ou pré-limpeza bloqueada."
      ],
      "service": [
        "Inspecionar a carcaça vazia e o duto a jusante em busca de poeira.",
        "Corrigir vedações, abraçadeiras ou carcaças danificadas antes de instalar elemento novo.",
        "Verificar fechamento e retenção conforme especificação; conferir fluxo e acesso para manutenção."
      ]
    },
    "cabin-filters": {
      "headline": "HVAC de cabine: partículas e limites de vazão.",
      "mechanism": "MICROKAPPA™ abrange os meios de filtração do ar de ventilação da cabine. Retenção de partículas e adsorção, quando especificada, tratam contaminantes distintos. A seleção deve respeitar a vazão e a perda de pressão do HVAC.",
      "checks": [
        "Identificar carcaça, dimensões, direção do ar e interfaces de vedação aprovadas.",
        "Avaliar poeira, pólen e partículas; especificar carvão ativado apenas em configurações de elemento validadas.",
        "Confirmar vazão do ventilador, diferencial de pressão permitido, acesso de manutenção e ensaios aplicáveis à filtração de cabine."
      ],
      "boundary": "A filtração de cabine não deve ser apresentada como proteção respiratória certificada ou barreira universal contra gases de escapamento. O desempenho do meio deve ser verificado para cada aplicação aprovada.",
      "parameters": [
        "Vazão do ventilador HVAC, perda de pressão permitida e dimensões do elemento.",
        "Condições de partículas no ambiente e configuração validada do meio.",
        "Adsorção apenas em configurações aprovadas, respeitando orientação e acesso."
      ],
      "failureSignals": [
        "Fluxo reduzido nos difusores com perda de pressão anormal.",
        "Poeira passando por filtro mal assentado ou tampa HVAC danificada.",
        "Odores persistentes com elemento apenas particulado: avaliar necessidade de adsorção."
      ],
      "service": [
        "Inspecionar carcaça e trilhos de vedação antes de instalar o refil.",
        "Respeitar direção do fluxo; não esmagar pregas nem deixar folgas no quadro.",
        "Conferir ventilador e distribuição de ar; não apresentar o filtro como proteção respiratória ou universal contra gases."
      ]
    },
    "air-dryer-filters": {
      "headline": "A secagem do ar comprimido depende do cartucho e do circuito pneumático.",
      "mechanism": "DRYCORE™ abrange cartuchos secadores aprovados e meios dessecantes. A adsorção do vapor de água depende de temperatura, pressão, vazão, regeneração por purga e integridade do conjunto secador instalado.",
      "checks": [
        "Identificar compressor, secador, modelo do cartucho e projeto de vedação aprovado.",
        "Verificar vazão, pressão, temperatura, ciclo de purga e exposição à umidade.",
        "Inspecionar função da purga e umidade a jusante; diferenciar falhas do secador de saturação do cartucho."
      ],
      "boundary": "Um cartucho secador não certifica sozinho a segurança dos freios pneumáticos nem um nível universal de secagem. É necessário validar compressor e conjunto secador.",
      "parameters": [
        "Ciclo do compressor, volume de ar, pressão e temperatura.",
        "Comportamento de regeneração/purga, meio dessecante e compatibilidade do cartucho.",
        "Umidade ambiente, vazamentos e requisitos de manutenção a jusante."
      ],
      "failureSignals": [
        "Água líquida recorrente a jusante ou indicação anormal de umidade.",
        "Purga incompleta, operação excessiva do compressor ou vazamentos.",
        "Cartucho mal assentado, anéis de vedação danificados ou falhas mecânicas do secador."
      ],
      "service": [
        "Inspecionar compressor, escape de purga e tubulação antes de trocar o cartucho.",
        "Instalar cartucho aprovado com vedação e aperto previstos pelo fabricante.",
        "Verificar purga e umidade a jusante após manutenção conforme especificação."
      ]
    }
  }
} as const;

export const AIR_FAMILY_SECTION_LABELS = {
  "en": {
    "label": "ENGINEERING APPLICATION REVIEW",
    "mechanism": "CONTROL MECHANISM",
    "checks": "APPLICATION VERIFICATION",
    "boundary": "OPERATING LIMIT",
    "parameters": "APPLICATION PARAMETERS",
    "failureSignals": "FAILURE INDICATORS",
    "service": "SERVICE AND INSTALLATION CONTROL"
  },
  "es": {
    "label": "REVISIÓN TÉCNICA DE APLICACIÓN",
    "mechanism": "MECANISMO DE PROTECCIÓN",
    "checks": "VERIFICACIÓN DE APLICACIÓN",
    "boundary": "LÍMITE OPERATIVO",
    "parameters": "PARÁMETROS DE APLICACIÓN",
    "failureSignals": "INDICIOS DE FALLA",
    "service": "CONTROL DE SERVICIO E INSTALACIÓN"
  },
  "pt": {
    "label": "REVISÃO TÉCNICA DA APLICAÇÃO",
    "mechanism": "MECANISMO DE PROTEÇÃO",
    "checks": "VERIFICAÇÃO DE APLICAÇÃO",
    "boundary": "LIMITE OPERACIONAL",
    "parameters": "PARÂMETROS DA APLICAÇÃO",
    "failureSignals": "INDÍCIOS DE FALHA",
    "service": "CONTROLE DE SERVIÇO E INSTALAÇÃO"
  }
} as const;
