'use client';

import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';
import { HERO_MEDIA_TREATMENT } from '@/lib/hero-media';

const COPY_PT = {
  "heroTitle": "Quem Somos",
  "heroLead": "ELIMFILTERS® nasceu em 2015 em Valencia, Venezuela, e rapidamente se estabeleceu em seu mercado de origem antes de se expandir para a Colômbia, a República Dominicana e os Estados Unidos, onde a marca estabeleceu suas operações em Frisco, Texas, em 2020 — organizada em torno da proteção do ativo, em vez da substituição de filtros, uma distinção que define desde a arquitetura de produtos até a estrutura executiva.",
  "profileEyebrow": "PERFIL DA EMPRESA",
  "profileTitle": "De Valencia, Venezuela, a operações em quatro países.",
  "profileBody": "ELIMFILTERS® nasceu em 2015 em Valencia, Venezuela, onde iniciou operações comerciais e rapidamente estabeleceu sua posição. A partir daí, expandiu-se para a Colômbia e a República Dominicana e, depois, para os Estados Unidos, onde a marca estabeleceu suas operações em Frisco, Texas, em 2020, sob a Kleo Technology LLC. A empresa opera um modelo comercial que prioriza distribuidores, com capacidade coordenada para contas estratégicas, e organiza sua plataforma técnica em torno de cinco sistemas de proteção, em vez de um catálogo plano de peças: ar do motor e da cabine, combustível, lubrificação e circuitos hidráulicos e de arrefecimento, cada um atendido por uma tecnologia própria desenvolvida especificamente para esse domínio.",
  "globalEyebrow": "EXPANSÃO GLOBAL",
  "globalTitle": "Hoje, a ELIMFILTERS se lança à globalização.",
  "globalBody": "A tecnologia colocou uma rede de distribuição global ao alcance de um celular, tablet ou computador, e a ELIMFILTERS está usando essa mudança para se globalizar — entrando em um dos mercados mais essenciais e menos visíveis do mundo. Os motores movem o mundo; controlar a contaminação que os desgasta é o que o mantém em movimento. Essa é a oportunidade que abrimos a novos empreendedores em qualquer lugar: integrar nossa rede de distribuidores sob uma filosofia operacional feita para permanecer simples, moderna e adaptável às mudanças do mercado.",
  "globalLink": "Torne-se um distribuidor →",
  "builtEyebrow": "COMO ESTAMOS ORGANIZADOS",
  "builtTitle": "Uma Chief Executive Office humana, acompanhada por agentes executivos de IA especializados.",
  "builtBody": "O Founder & CEO, Víctor Abreu, mantém a autoridade executiva final, e a Chief Executive Office conserva a responsabilidade institucional pela estrutura da empresa e por suas decisões materiais. A execução diária por domínio — operações, produto e tecnologia, mercados comerciais, finanças e risco, estratégia e inteligência — é conduzida por cinco agentes executivos de IA especializados, sob autoridade delegada, responsabilidade formal e encaminhamento humano para decisões estratégicas ou irreversíveis.",
  "builtLink": "Conheça a equipe de liderança →",
  "purposeEyebrow": "PROTEÇÃO AMBIENTAL",
  "purposeTitle": "O controle de contaminação é inseparável do impacto ambiental.",
  "purposeBody": "Cada falha que a filtragem disciplinada evita é também uma falha que o ambiente não precisa absorver: menos fluidos contaminados para descartar, menos componentes prematuramente desgastados fabricados para substituir o que deveria ter durado mais, e menos combustível ou energia consumidos por equipamentos que trabalham mais do que deveriam porque não estão operando limpos. Proteger o ativo e proteger o ambiente ao seu redor são, na prática, a mesma disciplina de engenharia."
};

export default function WhoWeArePage() {
  const { i18n, t } = useTranslation();
  const isPortuguese = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('pt');
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  const copy = isPortuguese ? COPY_PT : isSpanish ? {
    heroTitle: 'Quiénes Somos',
    heroLead: 'ELIMFILTERS® nació en 2015 en Valencia, Venezuela, y se posicionó rápidamente en su mercado de origen antes de expandirse a Colombia, República Dominicana y Estados Unidos, donde en 2020 estableció sus operaciones en Frisco, Texas — organizada alrededor de la protección del activo, no del reemplazo de filtros, una distinción que define desde la arquitectura de producto hasta la estructura ejecutiva.',
    profileEyebrow: 'PERFIL DE LA EMPRESA',
    profileTitle: 'De Valencia, Venezuela, a una operación con presencia en cuatro países.',
    profileBody: 'ELIMFILTERS® nació en 2015 en Valencia, Venezuela, donde comenzó operaciones comerciales y se posicionó rápidamente. Desde ahí se expandió a Colombia y República Dominicana, y luego a Estados Unidos, donde en 2020 la marca estableció sus operaciones en Frisco, Texas, bajo Kleo Technology LLC. La compañía opera un modelo comercial distributor-first, con capacidad coordinada para cuentas estratégicas, y organiza su plataforma técnica alrededor de cinco sistemas de protección en lugar de un catálogo plano de piezas: aire de motor y cabina, combustible, lubricación, circuitos hidráulicos y de enfriamiento, cada uno atendido por una tecnología propia diseñada específicamente para ese dominio.',
    globalEyebrow: 'EXPANSIÓN GLOBAL',
    globalTitle: 'Hoy, ELIMFILTERS se lanza a la globalización.',
    globalBody: 'La tecnología puso una red de distribución global al alcance de un celular, una tablet o una computadora, y ELIMFILTERS está usando ese cambio para globalizarse — entrando en uno de los mercados más esenciales y menos visibles del mundo. Los motores mueven el mundo; controlar la contaminación que los desgasta es lo que lo mantiene en marcha. Esa es la oportunidad que abrimos a nuevos emprendedores en cualquier parte: sumarse a nuestra red de distribuidores bajo una filosofía operativa simple, moderna y que se adapta a los cambios del mercado.',
    globalLink: 'Conviértete en distribuidor →',
    builtEyebrow: 'CÓMO ESTAMOS CONSTRUIDOS',
    builtTitle: 'Una Chief Executive Office humana, junto con agentes ejecutivos de IA especializados.',
    builtBody: 'El Founder & CEO, Víctor Abreu, mantiene la autoridad ejecutiva final, y la Chief Executive Office conserva la responsabilidad institucional sobre la estructura de la compañía y sus decisiones materiales. La ejecución diaria por dominio —operaciones, producto y tecnología, mercados comerciales, finanzas y riesgo, estrategia e inteligencia— la llevan cinco agentes ejecutivos de IA especializados, bajo autoridad delegada, responsabilidad formal y escalamiento humano para decisiones estratégicas o irreversibles.',
    builtLink: 'Conocer al equipo de liderazgo →',
    purposeEyebrow: 'PROTECCIÓN AMBIENTAL',
    purposeTitle: 'El control de contaminación es inseparable del impacto ambiental.',
    purposeBody: 'Cada falla que la filtración disciplinada previene es también una falla que el ambiente no tiene que absorber: menos fluidos contaminados que desechar, menos componentes desgastados prematuramente que fabricar para reemplazar lo que debió durar más, y menos combustible o energía consumidos por un equipo que trabaja más de lo necesario porque no está operando limpio. Proteger el activo y proteger el entorno que lo rodea son, en la práctica, la misma disciplina de ingeniería.',
  } : {
    heroTitle: 'Who We Are',
    heroLead: 'ELIMFILTERS® was founded in 2015 in Valencia, Venezuela, and quickly established itself in its home market before expanding into Colombia, the Dominican Republic, and the United States, where the brand established its operations in Frisco, Texas in 2020 — organized around asset protection rather than filter replacement, a distinction that shapes everything from product architecture to executive structure.',
    profileEyebrow: 'COMPANY PROFILE',
    profileTitle: 'From Valencia, Venezuela, to operations across four countries.',
    profileBody: 'ELIMFILTERS® was founded in 2015 in Valencia, Venezuela, where it began commercial operations and quickly established its position. From there it expanded into Colombia and the Dominican Republic, and then into the United States, where the brand established its operations in Frisco, Texas in 2020 under Kleo Technology LLC. The company operates a distributor-first commercial model with coordinated capability for strategic accounts, and organizes its technical platform around five protection systems rather than a flat parts catalog: engine air and cabin air, fuel, lubrication, hydraulic, and cooling-system circuits, each served by a purpose-built technology of its own.',
    globalEyebrow: 'GLOBAL EXPANSION',
    globalTitle: 'Today, ELIMFILTERS is going global.',
    globalBody: 'Technology has put a global distribution network within reach of a phone, a tablet, or a laptop, and ELIMFILTERS is using that shift to go global — entering one of the world’s most essential yet least visible markets. Engines move the world; controlling the contamination that wears them down is what keeps it running. That is the opportunity we are opening to new entrepreneurs everywhere: join our distributor network under an operating philosophy built to stay simple, modern, and adaptable as the market changes.',
    globalLink: 'Become a distributor →',
    builtEyebrow: 'HOW WE’RE BUILT',
    builtTitle: 'A human Chief Executive Office, paired with specialized executive AI agents.',
    builtBody: 'Founder & CEO Víctor Abreu holds final executive authority, and the Chief Executive Office retains institutional accountability for the company’s structure and material decisions. Day-to-day domain execution — operations, product and technology, commercial markets, finance and risk, strategy and intelligence — is carried by five specialized executive AI agents operating under delegated authority, formal accountability, and human escalation for strategic or irreversible decisions.',
    builtLink: 'Meet the leadership team →',
    purposeEyebrow: 'ENVIRONMENTAL PROTECTION',
    purposeTitle: 'Contamination control is inseparable from environmental impact.',
    purposeBody: 'Every failure that disciplined filtration prevents is also a failure the environment doesn’t have to absorb: fewer contaminated fluids to dispose of, fewer prematurely worn components manufactured to replace what should have lasted, and less fuel or energy burned by equipment working harder than it should because it isn’t running clean. Protecting the asset and protecting the environment around it are, in practice, the same engineering discipline.',
  };

  return (
    <main id="main-content" style={main}>
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isPortuguese ? 'Quem Somos' : isSpanish ? 'Quiénes Somos' : 'Who We Are'} />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={wrap}>
          <p style={eyebrow}>ELIMFILTERS · {isPortuguese ? 'QUEM SOMOS' : isSpanish ? 'QUIÉNES SOMOS' : 'WHO WE ARE'}</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{t('corporatePositioning.description')}</p>
        </div>
      </section>

      <section style={lightSection}>
        <div style={identityGrid}>
          <div>
            <p style={darkEyebrow}>{copy.profileEyebrow}</p>
            <h2 style={darkTitle}>{copy.profileTitle}</h2>
            <p style={darkBody}>{copy.profileBody}</p>
          </div>
          <div style={identityPhotoShell}>
            <img src="/images/planta_converted.avif" alt={isPortuguese ? 'Instalações de fabricação da ELIMFILTERS' : isSpanish ? 'Instalaciones de fabricación de ELIMFILTERS' : 'ELIMFILTERS manufacturing facility'} style={portraitImage} />
          </div>
        </div>
      </section>

      <section style={globalSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.globalEyebrow}</p>
          <h2 style={sectionTitle}>{copy.globalTitle}</h2>
          <p style={sectionLead}>{copy.globalBody}</p>
          <Link href="/distributor-application" style={textLink}>{copy.globalLink}</Link>
        </div>
      </section>

      <section style={darkSectionDivided}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.builtEyebrow}</p>
          <h2 style={sectionTitle}>{copy.builtTitle}</h2>
          <p style={sectionLead}>{copy.builtBody}</p>
          <Link href="/about/leadership" style={textLink}>{copy.builtLink}</Link>
        </div>
      </section>

      <section style={closingSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.purposeEyebrow}</p>
          <h2 style={closingTitle}>{copy.purposeTitle}</h2>
          <p style={closingBody}>{copy.purposeBody}</p>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: '76vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: HERO_MEDIA_TREATMENT.opacity };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: HERO_MEDIA_TREATMENT.overlayBackground };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase', position: 'relative', zIndex: 2 };
const darkEyebrow: CSSProperties = { ...eyebrow, color: '#6c6100' };
const heroTitle: CSSProperties = { position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(3.2rem,7vw,7rem)', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { position: 'relative', zIndex: 2, marginTop: '1.5rem', maxWidth: '900px', color: 'rgba(255,255,255,.82)', fontSize: 'clamp(1rem,1.5vw,1.25rem)', lineHeight: 1.75, fontWeight: 550 };
const lightSection: CSSProperties = { background: '#050505', color: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const identityGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' };
const identityPhotoShell: CSSProperties = { aspectRatio: '4 / 3', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)' };
const portraitImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const darkTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '850px', margin: '0 0 1.5rem', textTransform: 'uppercase' };
const darkBody: CSSProperties = { maxWidth: '880px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '1.05rem' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '950px', margin: '0 0 1rem', textTransform: 'uppercase' };
const sectionLead: CSSProperties = { color: 'rgba(255,255,255,.68)', lineHeight: 1.75, maxWidth: '900px', fontSize: '1.03rem' };
const globalSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const darkSectionDivided: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const textLink: CSSProperties = { display: 'inline-block', marginTop: '1.5rem', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.05em' };
const closingSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.16)' };
const closingTitle: CSSProperties = { ...sectionTitle, maxWidth: '900px' };
const closingBody: CSSProperties = { ...sectionLead, maxWidth: '850px' };
