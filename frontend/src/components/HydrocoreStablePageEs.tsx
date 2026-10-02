import Link from 'next/link';
import styles from './MacrocoreTechnologyPage.module.css';
import { TECHNICAL_REVIEWER } from '@/lib/technical-reviewer';

// Spanish version of HydrocoreStablePage (published at /es/technologies/hydrocore/).
// Keep it a faithful translation of the English page: same scope, no added claims.

const PAGE_URL = 'https://elimfilters.com/es/technologies/hydrocore/';

const faqs = [
  ['¿Qué es HYDROCORE™?','HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS para filtros separadores estándar aprobados, no tipo turbina, incluidas las configuraciones con drenaje y con vaso transparente.'],
  ['¿Por qué es peligrosa el agua en el combustible diésel?','El agua puede contribuir a la corrosión, la erosión, el riesgo de cavitación y el desgaste acelerado en bombas, inyectores y otras interfaces de precisión del sistema de combustible. La gravedad depende del sistema de combustible, del nivel de contaminación y de las condiciones de operación.'],
  ['¿Un separador de agua y combustible restringido puede causar pérdida de potencia?','Sí. Una restricción excesiva puede reducir el suministro de combustible al motor, sobre todo bajo carga. La pérdida de potencia, las oscilaciones o los síntomas de falta de combustible justifican inspeccionar el separador, la condición del combustible aguas arriba y todo el recorrido de suministro.'],
  ['¿Por qué un separador nuevo puede taparse antes de tiempo?','Una carga severa de partículas, la contaminación microbiana, el combustible degradado, los problemas de flujo en frío o la contaminación proveniente de los tanques de almacenamiento pueden acortar la vida útil. Las obstrucciones tempranas repetidas deben motivar una revisión de la calidad del combustible y del almacenamiento.'],
  ['¿Cuál es la función del drenaje o del vaso transparente?','Cuando el separador aprobado incluye drenaje o vaso transparente, estos elementos facilitan la inspección y el retiro del agua separada. La práctica de servicio debe seguir los requisitos de la aplicación específica.'],
  ['¿HYDROCORE™ aplica a los sistemas tipo turbina FH o FG?','No. Los sistemas separadores de agua y combustible tipo turbina FH y FG se rigen por TURBOCORE™. HYDROCORE™ aplica a configuraciones de separadores estándar aprobadas, no tipo turbina.'],
  ['¿HYDROCORE™ reemplaza la filtración de partículas del combustible?','No. HYDROCORE™ gobierna la separación estándar de agua y combustible. La filtración de partículas del combustible diésel se rige por separado mediante SYNTAPORE™, dentro de la arquitectura de protección de la limpieza del combustible de ELIMFILTERS.'],
] as const;

const list=(items:string[])=><ul className={styles.list}>{items.map(x=><li key={x}>{x}</li>)}</ul>;

export function HydrocoreStablePageEs(){
 const article={
  '@context':'https://schema.org','@type':'TechArticle','@id':`${PAGE_URL}#article`,
  headline:'Tecnología de separación de agua y combustible HYDROCORE™',name:'HYDROCORE™',url:PAGE_URL,inLanguage:'es',
  description:'HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS desarrollada para aplicaciones aprobadas de separadores diésel estándar en las que se requiere controlar el agua antes de que el combustible llegue a bombas, inyectores y otros componentes de precisión del sistema de combustible.',
  image:'https://elimfilters.com/images/fuellseparator-hero.avif',
  datePublished:'2026-10-02',dateModified:'2026-10-02',
  author:{'@type':'Organization','@id':'https://elimfilters.com/#organization',name:'ELIMFILTERS'},
  reviewedBy:TECHNICAL_REVIEWER,
  publisher:{'@type':'Organization','@id':'https://elimfilters.com/#organization',name:'ELIMFILTERS'},
  translationOfWork:{'@id':'https://elimfilters.com/technologies/hydrocore/#article'},
  about:['separación de agua y combustible diésel','control de la contaminación del combustible','drenaje del separador de combustible','restricción del combustible','agua en el combustible diésel','corrosión del sistema de combustible'].map(name=>({'@type':'Thing',name})),
  mentions:['bomba de combustible de alta presión','inyectores diésel','falta de combustible bajo carga','contaminación microbiana del combustible','contaminación del combustible almacenado','vaso transparente del separador'].map(name=>({'@type':'Thing',name})),
  isPartOf:{'@type':'WebSite','@id':'https://elimfilters.com/#website',name:'ELIMFILTERS',url:'https://elimfilters.com/'}
 };
 const faq={'@context':'https://schema.org','@type':'FAQPage',inLanguage:'es',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://elimfilters.com/es/'},{'@type':'ListItem',position:2,name:'Tecnologías',item:'https://elimfilters.com/technologies/'},{'@type':'ListItem',position:3,name:'HYDROCORE™',item:PAGE_URL}]};

 return <main id="main-content" className={styles.page}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(article)}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faq)}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>

  <section className={styles.hero} aria-labelledby="hydrocore-title">
   <img className={styles.heroBackground} src="/images/fuellseparator-hero.avif" alt="Entorno de servicio de separación de agua y combustible diésel"/>
   <div className={styles.heroShade} aria-hidden="true"/>
   <h1 id="hydrocore-title" className={styles.srOnly}>Tecnología de separación de agua y combustible HYDROCORE™</h1>
   <img className={styles.heroMark} src="/assets/HYDROCORE_final.avif" alt="HYDROCORE™"/>
  </section>

  <nav aria-label="Ruta de navegación" style={{padding:'1rem clamp(1.15rem,6vw,6rem)',borderBottom:'1px solid rgba(255,255,255,.12)',background:'#020202'}}>
   <div className={styles.inner} style={{display:'flex',gap:'.65rem',fontSize:'.72rem',letterSpacing:'.08em'}}>
    <Link href="/es/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>INICIO</Link><span>→</span>
    <Link href="/technologies/" style={{color:'rgba(255,255,255,.55)',textDecoration:'none'}}>TECNOLOGÍAS</Link><span>→</span>
    <span style={{color:'#fff12d'}}>HYDROCORE™</span>
    <Link href="/technologies/hydrocore/" hrefLang="en" lang="en" style={{color:'rgba(255,255,255,.55)',textDecoration:'none',marginLeft:'auto'}}>ENGLISH</Link>
   </div>
  </nav>

  <section className={styles.introSection}><div className={styles.inner}>
   <p className={styles.eyebrow}>TECNOLOGÍA DE FILTRACIÓN</p>
   <h2 className={styles.displayTitle} style={{fontSize:'clamp(2.25rem,5.25vw,4.65rem)'}}>HYDROCORE™</h2>
   <p className={styles.applicationLine}><strong>Arquitectura de separación de agua y combustible</strong></p>
   <p className={styles.lead}>Una arquitectura de separación de agua y combustible desarrollada para aplicaciones aprobadas de separadores diésel estándar, en las que se requiere controlar el agua antes de que el combustible llegue a bombas, inyectores y otros componentes de precisión del sistema de combustible aguas abajo.</p>

   <div className={styles.mediaGrid}>
    <div className={styles.mediaCopy}>
     <div className={styles.metaStack}>
      <p><span>Tecnología:</span> HYDROCORE™</p>
      <p><span>Aplicación:</span> Separadores de agua y combustible estándar, no tipo turbina</p>
      <p><span>Revisión técnica:</span> <Link href="/about/leadership/">Víctor Abreu — Fundador y CEO</Link></p>
     </div>
     <p className={styles.eyebrow}>DESCRIPCIÓN</p>
     <h3 className={styles.featureTitle}>Separación de agua y combustible y control del drenaje</h3>
     <p className={styles.lead}>HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS, desarrollada para aplicaciones aprobadas de separadores de combustible diésel estándar en las que se requiere controlar el agua antes de que el combustible llegue a bombas, inyectores y otros componentes de precisión del sistema de combustible aguas abajo.</p>
     <p className={styles.bodyWide}>Su medio y su configuración de separador se seleccionan según el caudal de combustible, los requisitos de separación de agua, la carga de contaminantes, la caída de presión, la estrategia de drenaje y la exigencia de operación. Un manejo eficaz del agua ayuda a reducir la exposición aguas abajo a la corrosión, la erosión, la cavitación y el desgaste asociado a la contaminación, y favorece un suministro de combustible constante bajo carga.</p>
     <p className={styles.bodyWide}>La acumulación de agua, un drenaje inadecuado, el combustible contaminado en el almacenamiento y el crecimiento microbiano pueden acelerar la carga del separador y contribuir a una restricción prematura. Por eso, HYDROCORE™ se trata como parte de la estrategia completa de limpieza del combustible y no como un elemento filtrante aislado.</p>
     <p className={styles.bodyWide}>HYDROCORE™ puede configurarse para diseños aprobados de separadores de agua y combustible estándar spin-on y de cartucho, incluidas las versiones con drenaje y con vaso transparente. Los sistemas tipo turbina FH y FG quedan fuera de esta arquitectura y se rigen por separado mediante TURBOCORE™.</p>
    </div>
    <figure className={styles.mediaFigure}>
     <div style={{overflow:'hidden',border:'1px solid rgba(255,255,255,.12)',background:'#707070'}}>
      <img
       className={styles.mediaImage}
       src="/images/SYNTAPORE_media.png"
       alt="Estructura conceptual de medio fibroso de separación de agua y combustible para HYDROCORE"
       style={{border:0,filter:'grayscale(1) contrast(1.08) brightness(.96)',transform:'scale(1.035)',transformOrigin:'center center'}}
      />
     </div>
     <figcaption>Visualización microscópica de la estructura del medio filtrante, con fines de ilustración técnica.</figcaption>
    </figure>
   </div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>REALIDAD OPERATIVA</p>
   <h2 className={styles.h2}>El agua y la restricción pueden convertirse en mecanismos de riesgo para los componentes.</h2>
   <p className={styles.lead}>Cuando el agua pasa aguas abajo, aumenta el riesgo de corrosión, erosión y desgaste en bombas, inyectores y otras interfaces de precisión del sistema de combustible. Cuando la restricción aumenta en exceso, el motor puede perder potencia, oscilar o mostrar síntomas de falta de combustible bajo carga.</p>
   <div className={styles.twoColumnNotes}>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Exposición al agua</h3><p className={styles.body}>El agua separada que no se retira, o el agua que sobrepasa el límite de separación previsto, puede aumentar el riesgo de corrosión y desgaste aguas abajo.</p></article>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Exposición a la restricción</h3><p className={styles.body}>Un separador cargado o con un servicio inadecuado puede reducir el suministro de combustible disponible, con síntomas que suelen hacerse más evidentes a medida que aumenta la demanda del motor.</p></article>
   </div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>ENTORNO DE APLICACIÓN</p>
   <h2 className={styles.h2}>Dónde corresponde HYDROCORE™</h2>
   <div className={styles.editorialColumns}>
    <div><h3 className={styles.h3}>Configuraciones aprobadas</h3>{list(['Separadores de agua y combustible spin-on estándar','Configuraciones de separador de cartucho','Separadores con drenaje','Separadores con vaso transparente, cuando estén aprobados'])}</div>
    <div><h3 className={styles.h3}>Exposición en operación</h3>{list(['Almacenamiento de combustible a granel','Condensación e ingreso de agua','Servicio agrícola y de construcción','Manejo de combustible en sitios remotos o de servicio severo'])}</div>
    <div><h3 className={styles.h3}>Arquitectura excluida</h3>{list(['Sistemas de turbina FH','Sistemas de turbina FG','Filtración diésel solo de partículas','Aplicaciones sin datos validados del separador'])}</div>
   </div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>ESPECIFICACIÓN Y SELECCIÓN</p>
   <h2 className={styles.h2}>Preguntas antes de seleccionar un separador de agua y combustible</h2>
   <div className={styles.editorialColumns}>
    <div><h3 className={styles.h3}>Parámetros clave</h3>{list(['Geometría aprobada del separador','Caudal de combustible requerido','Requisito de separación de agua','Límite de caída de presión','Configuración de drenaje y vaso','Acceso para servicio'])}</div>
    <div><h3 className={styles.h3}>Errores comunes</h3>{list(['Seleccionar solo por dimensiones','Ignorar los requisitos de servicio del drenaje','Tratar toda contaminación por agua como si fuera igual','Extender intervalos pese al aumento de la restricción','Confundir HYDROCORE™ con la arquitectura FH/FG'])}</div>
    <div><h3 className={styles.h3}>Datos para la validación</h3>{list(['Motor o equipo','Referencia actual del separador','Arquitectura del sistema de combustible','Perfil de caudal y exigencia','Condiciones de almacenamiento','Historial de agua u obstrucciones'])}</div>
   </div>
   <div className={styles.inlineCta}><p><strong>¿Conoce la aplicación?</strong> Use Part Search. <strong>¿Problema de agua, restricción u obstrucción repetida?</strong> Solicite una revisión técnica.</p><div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com/es/family/ES9/" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">ENCONTRAR MI REPUESTO</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20Water%20Separator%20Assessment" data-conversion-action="application-support">REVISIÓN TÉCNICA</a></div></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>CÓMO SE COMPORTA EL SISTEMA</p>
   <h2 className={styles.h2}>La carga de agua, el caudal y la restricción evolucionan juntos.</h2>
   <p className={styles.lead}>El separador debe sostener el suministro de combustible requerido y, al mismo tiempo, ofrecer el comportamiento de separación que exige la aplicación aprobada. A medida que se acumulan agua y contaminación, la caída de presión y la demanda de servicio pueden cambiar.</p>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>SERVICIO Y DIAGNÓSTICO</p>
   <h2 className={styles.h2}>Lo que puede indicar la falta de combustible o la obstrucción repetida del separador</h2>
   {list(['Acumulación de agua que requiere drenaje','Alta carga de contaminación desde el almacenamiento','Contaminación microbiana o lodos','Sedimentos de tanques o equipos de transferencia','Problemas de flujo en frío o de combustible degradado','Intervalo de servicio que no corresponde a la exigencia'])}
   <div className={styles.inlineCta}><p>La obstrucción repetida, el agua visible o la pérdida de potencia bajo carga justifican revisar todo el recorrido de suministro de combustible.</p><a href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20System%20Review" data-conversion-action="application-support">SOLICITAR REVISIÓN DEL SISTEMA DE COMBUSTIBLE</a></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>PREGUNTAS DEL CAMPO</p>
   <h2 className={styles.h2}>Respuestas directas a preguntas frecuentes sobre la separación de agua y combustible.</h2>
   <div className={styles.faqList}>{faqs.map(([q,a])=><details className={styles.faqItem} key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>BASE TÉCNICA</p>
   <h2 className={styles.h2}>Referencia técnica</h2>
   <div className={styles.twoColumnNotes}>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Evidencia a nivel de producto</h3><p className={styles.body}>La eficiencia de separación de agua, la caída de presión, la capacidad de caudal, la capacidad de retención de agua y los límites de servicio corresponden a los datos validados de cada separador y al método de ensayo aplicable.</p></article>
    <article className={styles.noteBlock}><h3 className={styles.h3}>Gobernanza de las afirmaciones</h3><p className={styles.body}>A HYDROCORE™ no se le asigna una eficiencia de separación, un grado de micras, una capacidad, un límite de caudal ni un intervalo de servicio universales para todas las aplicaciones.</p></article>
   </div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>CUÁNDO CONVIENE UNA REVISIÓN TÉCNICA</p>
   <h2 className={styles.h2}>Cuando el mantenimiento del separador se convierte en un problema de calidad del combustible</h2>
   <p className={styles.lead}>La acumulación repetida de agua, la vida corta del separador, la contaminación microbiana, la falta de combustible o la evidencia de corrosión aguas abajo justifican revisar el almacenamiento, la transferencia, la separación, la filtración y el mantenimiento como una sola cadena de control de la contaminación.</p>
  </div></section>

  <section className={styles.band}><div className={styles.inner}>
   <p className={styles.eyebrow}>INTEGRACIÓN EN EL SISTEMA</p>
   <h2 className={styles.h2}>Protección de la limpieza del combustible</h2>
   <div className={styles.systemGrid}><div><p className={styles.lead}>HYDROCORE™ aporta la capa de separación de agua y combustible estándar, no tipo turbina, dentro de la protección de la limpieza del combustible de ELIMFILTERS.</p><Link className={styles.systemButton} href="/systems/fuel-cleanliness/">EXPLORAR EL SISTEMA DE PROTECCIÓN</Link></div><p className={styles.bodyWide}>SYNTAPORE™ gobierna la filtración de partículas del combustible diésel. TURBOCORE™ gobierna los sistemas separadores de agua y combustible tipo turbina FH/FG. Mantener separadas esas funciones evita asignar mal la aplicación.</p></div>
  </div></section>

  <section className={styles.ctaSection}><div className={styles.inner}>
   <p className={styles.eyebrow}>SOPORTE DE APLICACIÓN</p>
   <h2 className={styles.h2}>Tráiganos la arquitectura del sistema de combustible, el historial de agua y el ciclo de trabajo, no solo el número de parte.</h2>
   <p className={styles.lead}>Use Part Search cuando conozca el separador. Para problemas repetidos de agua, obstrucción, restricción o calidad del combustible, solicite una revisión técnica.</p>
   <div className={styles.buttonRow}><a className={styles.primaryButton} href="https://part-search.elimfilters.com/es/family/ES9/" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence">ENCONTRAR MI REPUESTO</a><a className={styles.secondaryButton} href="mailto:applications@elimfilters.com?subject=HYDROCORE%20Fuel%20Water%20Separator%20Assessment" data-conversion-action="application-support">SOLICITAR REVISIÓN TÉCNICA</a></div>
  </div></section>

  <section className={styles.bandAlt}><div className={styles.inner}>
   <p className={styles.eyebrow}>TECNOLOGÍAS RELACIONADAS</p>
   <h2 className={styles.h2}>Continúe por la arquitectura de limpieza del combustible.</h2>
   <div className={styles.textLinks}><Link href="/technologies/syntapore/">SYNTAPORE™ →</Link><Link href="/technologies/turbocore/">TURBOCORE™ →</Link><Link href="/es/families/fuel-water-separators/">Separadores de agua y combustible →</Link><a href="https://part-search.elimfilters.com/es/family/ES9/">Part Search →</a></div>
  </div></section>
 </main>;
}
