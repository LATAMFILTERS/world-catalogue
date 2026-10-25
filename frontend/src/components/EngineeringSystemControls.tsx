'use client';
import { useTranslation } from 'react-i18next';
import { ReviewedImage } from './ReviewedMedia';
import layout from './EngineeringSystemsLayout.module.css';

type SystemKey = 'lubrication' | 'hydraulic' | 'cooling-system';
type Language = 'en' | 'es' | 'pt';
type Entry = {title:string; intro:string; fields: readonly (readonly [string,string])[]};
const CONTENT: Record<Language,Record<SystemKey,Entry>> = {
  "en": {
    "lubrication": {
      "title": "Control debris without interrupting the engine's oil supply.",
      "intro": "Lubrication protection is a balance between contaminant capture, oil-film integrity and service reliability. Filter selection must be verified against the actual engine lubrication circuit.",
      "fields": [
        [
          "Contamination and failure mechanism",
          "Soot agglomerates, wear particles and oxidation insolubles can enter bearing clearances, accelerate abrasive wear and increase the circulating contaminant load."
        ],
        [
          "Flow, viscosity and valve behavior",
          "Check oil delivery at cold start and operating temperature, allowable differential pressure, media dirt-holding capacity, bypass-valve setting and any specified anti-drainback arrangement."
        ],
        [
          "Condition monitoring",
          "Interpret restriction, oil-pressure observations and lubricant-analysis trends together. Elevated wear metals or recurring contamination require diagnosis beyond filter replacement."
        ],
        [
          "Approved maintenance configuration",
          "Confirm exact engine, full-flow position, threads, gasket land, media construction, bypass behavior and OEM evidence. A filter does not renew depleted lubricant additives or repair oil-supply faults."
        ]
      ]
    },
    "hydraulic": {
      "title": "Match fluid cleanliness to the most sensitive component in the circuit.",
      "intro": "Hydraulic protection depends on the cleanliness target, circuit position and fluid-power demand. NANOFORCE™ is selected with evidence from the installed system, not from a micron label alone.",
      "fields": [
        [
          "Contamination and failure mechanism",
          "Dust ingress, reservoir handling and internal wear debris can score pumps, interfere with spool movement and damage actuator seals."
        ],
        [
          "Pressure and filtration constraints",
          "Confirm target ISO 4406 code, operating flow, pressure and surge conditions, allowable pressure loss, collapse resistance and any approved bypass arrangement."
        ],
        [
          "Evidence of system condition",
          "Compare representative fluid sampling, filter restriction, reservoir breather condition and element inspection. Repeated loading can point to leaks, poor servicing or internal wear."
        ],
        [
          "Approved installation",
          "Verify return, suction or pressure location, element retention, housing compatibility and ISO 16889 efficiency evidence when relevant. Dimensional similarity is insufficient."
        ]
      ]
    },
    "cooling-system": {
      "title": "Maintain heat-transfer performance through verified coolant chemistry.",
      "intro": "Cooling protection is not simply the removal of visible debris. THERMACORE™ applications depend on fluid formulation, circuit construction and a validated maintenance strategy.",
      "fields": [
        [
          "Contamination and failure mechanism",
          "Corrosion products, scale and service debris can impair coolant passages and thermal surfaces. Cavitation and inhibitor depletion require controls beyond particle retention."
        ],
        [
          "Coolant and circuit requirements",
          "Confirm whether the engine has a filter position, specified coolant chemistry, additive strategy, service interval and cooling-flow requirements."
        ],
        [
          "Evidence of condition",
          "Review coolant tests, inhibitor status, deposits, pump-seal condition and signs of poor heat rejection. Overheating alone is not proof of filter failure."
        ],
        [
          "Approved service",
          "Match the OEM reference, connection, seal and specified coolant chemistry. Never assume a filter can correct incompatible coolant, leaks, air pockets or blocked heat exchangers."
        ]
      ]
    }
  },
  "es": {
    "lubrication": {
      "title": "Controle los residuos sin interrumpir el suministro de aceite del motor.",
      "intro": "La protección de la lubricación equilibra retención de contaminantes, integridad de la película lubricante y confiabilidad de servicio. La selección se valida contra el circuito real del motor.",
      "fields": [
        [
          "Contaminación y mecanismo de falla",
          "Los aglomerados de hollín, partículas de desgaste e insolubles por oxidación pueden ingresar en las holguras de cojinetes, acelerar el desgaste y aumentar la carga contaminante."
        ],
        [
          "Caudal, viscosidad y válvulas",
          "Compruebe la entrega de aceite en arranque frío y temperatura operativa, presión diferencial admisible, capacidad del medio, ajuste de la válvula de derivación y antirretorno cuando aplique."
        ],
        [
          "Seguimiento de condición",
          "Interprete restricción, presión de aceite y tendencias de análisis del lubricante en conjunto. Metales de desgaste elevados o contaminación recurrente exigen diagnóstico adicional."
        ],
        [
          "Configuración aprobada de servicio",
          "Confirme motor, etapa de paso total, rosca, asiento de junta, medio, derivación y evidencia OEM. El filtro no recupera aditivos agotados ni repara fallas de suministro."
        ]
      ]
    },
    "hydraulic": {
      "title": "Ajuste la limpieza del fluido al componente más sensible del circuito.",
      "intro": "La protección hidráulica depende del objetivo de limpieza, la ubicación del filtro y la demanda de potencia del circuito. NANOFORCE™ requiere evidencia de la instalación, no solo una clasificación en micras.",
      "fields": [
        [
          "Contaminación y mecanismo de falla",
          "El ingreso de polvo, la manipulación del depósito y el desgaste interno pueden rayar bombas, alterar el movimiento de válvulas y deteriorar sellos de actuadores."
        ],
        [
          "Restricciones de presión y filtración",
          "Confirme código objetivo ISO 4406, caudal, presiones de operación y pico, pérdida de presión admisible, resistencia al colapso y derivación aprobada."
        ],
        [
          "Evidencia de condición del sistema",
          "Compare muestreo representativo, restricción del filtro, estado del respiradero e inspección del elemento. La carga repetida puede indicar fugas, servicio deficiente o desgaste."
        ],
        [
          "Instalación aprobada",
          "Verifique ubicación en retorno, succión o presión, retención del elemento, carcasa y evidencia ISO 16889 cuando corresponda. Las dimensiones por sí solas no acreditan compatibilidad."
        ]
      ]
    },
    "cooling-system": {
      "title": "Mantenga el intercambio térmico con una química del refrigerante verificada.",
      "intro": "La protección de refrigeración va más allá de retirar residuos visibles. La aplicación de THERMACORE™ depende de la formulación del fluido, el circuito y una estrategia de mantenimiento validada.",
      "fields": [
        [
          "Contaminación y mecanismo de falla",
          "Los productos de corrosión, incrustaciones y residuos de servicio pueden comprometer conductos y superficies térmicas. La cavitación y el agotamiento de inhibidores requieren controles adicionales."
        ],
        [
          "Requisitos del refrigerante y circuito",
          "Confirme si el motor dispone de una posición filtrante, la química especificada, la estrategia de aditivos, los intervalos de servicio y la circulación."
        ],
        [
          "Evidencia de condición",
          "Revise análisis del refrigerante, nivel de inhibidores, depósitos, sellos de la bomba y síntomas de transferencia térmica deficiente. El sobrecalentamiento no demuestra por sí solo falla del filtro."
        ],
        [
          "Mantenimiento aprobado",
          "Concilie referencia OEM, conexión, junta y química especificada. No suponga que el filtro corregirá fluidos incompatibles, fugas, bolsas de aire o intercambiadores obstruidos."
        ]
      ]
    }
  },
  "pt": {
    "lubrication": {
      "title": "Controle os resíduos sem interromper o fornecimento de óleo ao motor.",
      "intro": "A proteção da lubrificação equilibra retenção de contaminantes, integridade do filme lubrificante e confiabilidade operacional. A seleção depende da validação do circuito real do motor.",
      "fields": [
        [
          "Contaminação e mecanismo de falha",
          "Aglomerados de fuligem, partículas de desgaste e insolúveis por oxidação podem chegar às folgas dos mancais, acelerar o desgaste e aumentar a carga contaminante."
        ],
        [
          "Vazão, viscosidade e válvulas",
          "Verifique fornecimento no arranque a frio e em temperatura operacional, diferencial de pressão permitido, capacidade do meio, regulagem de desvio e antirretorno quando aplicável."
        ],
        [
          "Monitoramento da condição",
          "Avalie em conjunto restrição, pressão do óleo e tendências de análise do lubrificante. Metais de desgaste elevados ou contaminação recorrente exigem investigação adicional."
        ],
        [
          "Configuração de manutenção aprovada",
          "Confirme motor, posição de fluxo total, rosca, assentamento da vedação, meio, desvio e evidência OEM. O filtro não restaura aditivos esgotados nem corrige falhas de alimentação."
        ]
      ]
    },
    "hydraulic": {
      "title": "Ajuste a limpeza do fluido ao componente mais sensível do circuito.",
      "intro": "A proteção hidráulica depende da meta de limpeza, da posição do filtro e da demanda de potência hidráulica. NANOFORCE™ requer evidência do sistema instalado, não apenas uma classificação em mícrons.",
      "fields": [
        [
          "Contaminação e mecanismo de falha",
          "Poeira, manuseio do reservatório e desgaste interno podem riscar bombas, alterar a resposta de válvulas e danificar vedações dos atuadores."
        ],
        [
          "Limites de pressão e filtração",
          "Confirme código ISO 4406 desejado, vazão, pressões de trabalho e de pico, perda de pressão permitida, resistência ao colapso e desvio aprovado."
        ],
        [
          "Evidência da condição do sistema",
          "Compare amostragem representativa, restrição do filtro, respiro do reservatório e inspeção do elemento. Carga recorrente pode indicar vazamentos, manutenção inadequada ou desgaste."
        ],
        [
          "Instalação aprovada",
          "Verifique posição de retorno, sucção ou pressão, retenção do elemento, carcaça e evidência ISO 16889 quando pertinente. Dimensões isoladas não comprovam compatibilidade."
        ]
      ]
    },
    "cooling-system": {
      "title": "Mantenha a troca térmica com a química do líquido de arrefecimento verificada.",
      "intro": "A proteção do arrefecimento vai além da remoção de resíduos visíveis. Aplicações THERMACORE™ dependem da formulação do fluido, do circuito e de uma estratégia de manutenção validada.",
      "fields": [
        [
          "Contaminação e mecanismo de falha",
          "Produtos de corrosão, incrustações e resíduos de manutenção podem comprometer passagens e superfícies térmicas. Cavitação e esgotamento de inibidores exigem controles adicionais."
        ],
        [
          "Requisitos de fluido e circuito",
          "Confirme se o motor possui posição de filtro, química especificada, estratégia de aditivos, intervalos de serviço e circulação."
        ],
        [
          "Evidência da condição",
          "Revise testes do fluido, concentração de inibidores, depósitos, vedações da bomba e sintomas de troca térmica deficiente. Superaquecimento isolado não comprova falha do filtro."
        ],
        [
          "Manutenção aprovada",
          "Concilie referência OEM, conexão, vedação e química especificada. Não presuma que o filtro corrigirá fluidos incompatíveis, vazamentos, bolsas de ar ou trocadores obstruídos."
        ]
      ]
    }
  }
};

const MEDIA: Record<SystemKey,string> = {
  lubrication:'/images/oil-instalado.avif',
  hydraulic:'/images/nanoforce-hero.avif',
  'cooling-system':'/images/coolant-mesa.avif'
};
const MEDIA_ALT: Record<Language,Record<SystemKey,string>> = {
  en:{lubrication:'Installed oil filtration in the engine lubrication circuit',hydraulic:'NANOFORCE hydraulic filtration application', 'cooling-system':'Coolant filtration components used in engine cooling systems'},
  es:{lubrication:'Filtración de aceite instalada en el circuito de lubricación',hydraulic:'Aplicación de filtración hidráulica NANOFORCE','cooling-system':'Componentes de filtración de refrigerante para motores'},
  pt:{lubrication:'Filtração de óleo instalada no circuito de lubrificação',hydraulic:'Aplicação de filtração hidráulica NANOFORCE','cooling-system':'Componentes de filtração de fluido de arrefecimento do motor'}
};

export function EngineeringSystemControls({ system }: {system:SystemKey}) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split('-')[0] ?? i18n.language?.split('-')[0] ?? 'en';
  const lang: Language = language === 'es' || language === 'pt' ? language : 'en';
  const content = CONTENT[lang][system];
  const kicker: Record<Language,string> = { en:'ENGINEERING VALIDATION', es:'VALIDACIÓN DE INGENIERÍA', pt:'VALIDAÇÃO DE ENGENHARIA' };
  return (
    <section className={layout.contentSection} style={{maxWidth:'1560px',margin:'0 auto'}} aria-label={kicker[lang]}>
      <div className={layout.engineeringOverview}>
        <div>
          <p style={{color:'#fff12d',fontSize:'.76rem',fontWeight:700,letterSpacing:'.12em'}}>{kicker[lang]}</p>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(1.9rem,3.4vw,3.4rem)',lineHeight:1.12,maxWidth:'950px',margin:'1rem 0'}}>{content.title}</h2>
          <p style={{fontSize:'clamp(1.05rem,1.25vw,1.24rem)',color:'rgba(255,255,255,.83)',lineHeight:1.7,maxWidth:'850px',margin:'1.4rem 0 0'}}>{content.intro}</p>
        </div>
        <figure className={layout.engineeringMedia}>
          <ReviewedImage src={MEDIA[system]} alt={MEDIA_ALT[lang][system]} loading="lazy" />
        </figure>
      </div>
      <div className={layout.cardGrid4}>
        {content.fields.map(([heading, description], index) => (
          <article key={heading} style={{padding:'clamp(1.4rem,2.4vw,2.5rem)',background:'#0b0b0b',borderTop:'2px solid #fff12d',minWidth:0}}>
            <span style={{display:'block',color:'#fff12d',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'.8rem'}}>{String(index+1).padStart(2,'0')} / 04</span>
            <h3 style={{fontFamily:'var(--font-display)',fontSize:'clamp(1.23rem,1.6vw,1.7rem)',margin:'1rem 0',lineHeight:1.22,textTransform:'uppercase'}}>{heading}</h3>
            <p style={{fontSize:'clamp(1rem,1.12vw,1.12rem)',lineHeight:1.7,color:'rgba(255,255,255,.84)',margin:0}}>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
