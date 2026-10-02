import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCT_FAMILY_LIST, getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import { FAILURE_KNOWLEDGE } from '@/lib/failure-knowledge';
import { HERO_MEDIA_TREATMENT } from '@/lib/hero-media';
import {
  FAMILY_ES, TECHNOLOGY_ES, SYSTEM_ES, FAILURE_ES, PROTECTED_COMPONENTS_ES,
  FIELD_QUESTIONS_ES, SERVICE_DISCIPLINE_ES, INDUSTRY_ES,
} from '@/lib/families-es';
import {
  FAMILY_PT, TECHNOLOGY_PT, SYSTEM_PT, FAILURE_PT, PROTECTED_COMPONENTS_PT,
  FIELD_QUESTIONS_PT, SERVICE_DISCIPLINE_PT, INDUSTRY_PT,
} from '@/lib/families-pt';
import { OG_LOCALE, languageAlternates, localizedPath, type PageLang } from '@/lib/localized-routes';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const BASE_URL = 'https://elimfilters.com';
const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

export type FamilyLang = PageLang;

// Governed translations overlaid on the canonical English records per published language.
const LOCALE_CONTENT = {
  es: { family: FAMILY_ES, technology: TECHNOLOGY_ES, system: SYSTEM_ES, failure: FAILURE_ES, components: PROTECTED_COMPONENTS_ES, questions: FIELD_QUESTIONS_ES, service: SERVICE_DISCIPLINE_ES, industry: INDUSTRY_ES },
  pt: { family: FAMILY_PT, technology: TECHNOLOGY_PT, system: SYSTEM_PT, failure: FAILURE_PT, components: PROTECTED_COMPONENTS_PT, questions: FIELD_QUESTIONS_PT, service: SERVICE_DISCIPLINE_PT, industry: INDUSTRY_PT },
} as const;

const PROTECTED_COMPONENTS: Record<string, readonly string[]> = {
  macrocore: ['Cylinders', 'Piston rings', 'Turbochargers', 'Combustion air path'],
  microkappa: ['Operator environment', 'HVAC airflow path', 'Cabin air quality'],
  intekcore: ['Element-to-housing seal', 'Intake boundary', 'Airflow path', 'Filter retention interface'],
  drycore: ['Pneumatic valves', 'Actuators', 'Brake air circuit', 'Compressed-air controls'],
  syntapore: ['High-pressure fuel pump', 'Injectors', 'Fuel metering components', 'Injection circuit'],
  hydrocore: ['Fuel transfer path', 'Water-sensitive fuel components', 'Injection-system feed'],
  turbocore: ['FH/FG turbine housing', 'Dedicated separator element', 'Bowl and drain assembly', 'Downstream fuel-system feed'],
  syntrax: ['Bearings', 'Journals', 'Lubricated interfaces', 'Engine oil circuit'],
  nanoforce: ['Hydraulic pumps', 'Control valves', 'Actuators', 'Servo controls'],
  thermacore: ['Coolant passages', 'Seals', 'Wet liners', 'Heat-transfer surfaces'],
};

const FIELD_QUESTIONS: Record<string, readonly string[]> = {
  'primary-air': ['What is the ambient dust load?', 'What restriction limit applies to the intake?', 'How is sealing verified after service?', 'What duty cycle determines inspection frequency?'],
  'secondary-air': ['Is the safety element intended as a final barrier rather than a routine dust-loading element?', 'Is the primary element serviced without contaminating the clean side?', 'Is element seating verified before restart?', 'Has the housing been inspected for bypass paths?'],
  'air-cleaner-housings': ['Is the housing correctly sized for required airflow?', 'Are inlet routing and restriction acceptable?', 'Does the element seat uniformly against the seal?', 'Are clamps, covers and interfaces structurally intact?'],
  'primary-fuel': ['What contamination enters from storage and transfer?', 'What flow and pressure-drop limits apply?', 'Is water also present in the fuel supply?', 'What downstream filtration stage must be protected?'],
  'secondary-fuel': ['What cleanliness level is required upstream of the injection circuit?', 'What flow and pressure-drop limits apply at final filtration?', 'Is upstream water separation effective?', 'Are service practices preventing clean-side contamination?'],
  'fuel-water-separators': ['Is contamination free water, emulsified water, particulate, or a combination?', 'What fuel flow must the separator support?', 'How is collected water inspected and drained?', 'Is installation orientation and service access correct?'],
  'fuel-turbine': ['Which approved FH or FG housing is installed?', 'Which dedicated 2010, 2020 or 2040-series replacement configuration applies?', 'What fuel flow, port arrangement and service condition must the turbine system support?', 'Are bowl, drain, seals and element orientation verified for the approved housing?'],
  'oil-filters': ['What engine duty and oil condition define the service interval?', 'What viscosity range and flow must be supported?', 'What contaminant loading is expected?', 'Are bypass and anti-drainback functions appropriate to the application?'],
  'hydraulic-filters': ['Which component has the tightest clearance?', 'What cleanliness target applies to the circuit?', 'What are system flow, pressure and temperature?', 'What collapse strength and duty cycle are required?'],
  'coolant-filters': ['What coolant chemistry is approved for the engine?', 'What contamination or corrosion products are present?', 'What flow and capacity are required?', 'How does the filter fit the cooling-system maintenance strategy?'],
  'cabin-filters': ['What contaminants are present in the operator environment?', 'What HVAC airflow and pressure-drop limits apply?', 'Is particulate-only or adsorption media required?', 'How often does the operating environment justify inspection?'],
  'air-dryer-filters': ['What is the compressor duty cycle?', 'What ambient moisture exposure is expected?', 'Is purge behavior operating correctly?', 'What replacement interval matches the pneumatic duty?'],
};

const SERVICE_DISCIPLINE: Record<string, readonly string[]> = {
  macrocore: ['Inspect the complete intake boundary, not only the element.', 'Keep the clean side protected during element removal.', 'Verify element seating and seal contact before returning the asset to service.'],
  microkappa: ['Inspect airflow performance together with media condition.', 'Use the media configuration required by the operating environment.', 'Avoid introducing debris into the HVAC clean side during replacement.'],
  intekcore: ['Inspect housing geometry, covers, clamps and seal lands.', 'Correct any bypass path before installing a new element.', 'Confirm inlet routing and element retention after service.'],
  drycore: ['Treat moisture control as a pneumatic-system reliability function.', 'Confirm purge behavior and compressor duty when service life appears abnormal.', 'Inspect downstream evidence of moisture rather than replacing the element in isolation.'],
  syntapore: ['Protect the clean side of the fuel circuit during service.', 'Investigate storage or transfer contamination when filters load abnormally fast.', 'Verify the complete staged-filtration path rather than treating one element as the whole system.'],
  hydrocore: ['Drain collected water according to operating conditions.', 'Inspect seals, bowl condition and installation orientation.', 'Investigate the upstream fuel source when water loading becomes recurrent.'],
  turbocore: ['Service the FH/FG housing and dedicated element as one approved turbine-specific architecture.', 'Verify bowl, drain, seals, element orientation and flow path before returning the system to service.', 'Do not substitute standard non-turbine separator elements solely by dimensions or appearance.'],
  syntrax: ['Evaluate filter condition together with lubricant condition and engine duty.', 'Prevent contamination from entering during filter and oil service.', 'Investigate abnormal debris loading as a possible indicator of component wear.'],
  nanoforce: ['Set the filtration target from the most contamination-sensitive component.', 'Control contamination introduced during hose, cylinder and reservoir service.', 'Investigate abnormal differential pressure or debris loading before simply shortening intervals.'],
  thermacore: ['Keep filter selection aligned with approved coolant chemistry.', 'Inspect coolant condition and contamination sources when loading is abnormal.', 'Treat filtration as part of the complete cooling-system maintenance strategy.'],
};

// Search-intent titles: lead with the terms buyers type, keep the brand suffix.
const FAMILY_SEO_TITLES: Record<string, string> = {
  'primary-air': 'Primary Air Filter Elements for Heavy-Duty Engines',
  'secondary-air': 'Secondary & Safety Air Filter Elements',
  'air-cleaner-housings': 'Heavy-Duty Air Cleaner Housings',
  'primary-fuel': 'Primary Diesel Fuel Filters',
  'secondary-fuel': 'Secondary Diesel Fuel Filters',
  'fuel-water-separators': 'Diesel Fuel Water Separator Filters',
  'oil-filters': 'Engine Oil Filters for Heavy & Light Duty',
  'hydraulic-filters': 'Hydraulic Filters for Heavy Equipment',
  'coolant-filters': 'Heavy-Duty Coolant Filters',
  'cabin-filters': 'Cabin Air Filters for Trucks & Equipment',
  'fuel-turbine': 'Turbine-Style Fuel Water Separators (FH / FG)',
  'air-dryer-filters': 'Air Brake Dryer Filter Cartridges',
};

const COPY = {
  en: {
    back: 'FAMILIES',
    eyebrow: 'CRITICAL ASSET PROTECTION',
    duty: (duty: string) => `${duty} DUTY`,
    heroAlt: (name: string) => `${name} filtration application`,
    ogAlt: (name: string) => `${name} asset protection`,
    whyKicker: 'WHY THIS FAMILY EXISTS',
    whyTitle: 'Protect the machine before contamination becomes damage.',
    assetKicker: 'PROTECTED ASSET',
    assetTitle: 'What sits behind the filter matters more than the filter itself.',
    riskKicker: 'CONTAMINATION RISK',
    riskTitle: 'What happens when the protection boundary is lost.',
    riskLink: 'READ CONTAMINATION GUIDANCE',
    strategyKicker: 'PROTECTION STRATEGY',
    strategyTitle: 'Selection starts with the operating system, not a part number.',
    controlStrategy: 'Control strategy',
    systemContext: 'System context',
    familyRole: 'Family role',
    selectionKicker: 'BEFORE SELECTING A FILTER',
    selectionTitle: 'Questions the application should answer first.',
    selectionBody: 'The correct element is defined by the protected asset, contamination exposure and operating duty. These are the questions that should be resolved before cross-reference or part selection.',
    serviceKicker: 'SERVICE DISCIPLINE',
    serviceTitle: 'A new element cannot correct a contaminated maintenance practice.',
    contextKicker: 'TECHNICAL CONTEXT',
    contextTitle: 'Technology, system and applicable standards.',
    contextNote: 'These references define the engineering context for the family. Final product selection still depends on the approved application and operating conditions.',
    technology: 'Technology',
    protectionSystem: 'Protection system',
    references: 'Applicable references',
    industriesKicker: 'OPERATING ENVIRONMENTS',
    industriesTitle: 'Where this protection system is applied.',
    actionKicker: 'FROM ENGINEERING TO PART IDENTIFICATION',
    actionTitle: 'Protect the asset first. Then identify the part.',
    actionBody: 'Use Part Search when the application is known. Contact ELIMFILTERS when the operating condition, protection requirement or cross-reference needs technical review.',
    browse: (prefix: string) => `BROWSE ${prefix} SKUS`,
    partSearch: 'PART SEARCH',
    support: 'TECHNICAL SUPPORT',
    knowledge: 'KNOWLEDGE CENTER',
    home: 'Home',
    families: 'Families',
    category: 'Industrial Filtration',
    variesBy: 'Duty Class',
  },
  es: {
    back: 'FAMILIAS',
    eyebrow: 'PROTECCIÓN DE ACTIVOS CRÍTICOS',
    duty: (duty: string) => `SERVICIO ${duty}`,
    heroAlt: (name: string) => `Aplicación de filtración: ${name}`,
    ogAlt: (name: string) => `${name}: protección de activos`,
    whyKicker: 'POR QUÉ EXISTE ESTA FAMILIA',
    whyTitle: 'Proteja la máquina antes de que la contaminación se convierta en daño.',
    assetKicker: 'ACTIVO PROTEGIDO',
    assetTitle: 'Lo que está detrás del filtro importa más que el filtro mismo.',
    riskKicker: 'RIESGO DE CONTAMINACIÓN',
    riskTitle: 'Qué ocurre cuando se pierde la barrera de protección.',
    riskLink: 'LEER LA GUÍA DE CONTAMINACIÓN',
    strategyKicker: 'ESTRATEGIA DE PROTECCIÓN',
    strategyTitle: 'La selección empieza por el sistema en operación, no por un número de parte.',
    controlStrategy: 'Estrategia de control',
    systemContext: 'Contexto del sistema',
    familyRole: 'Función de la familia',
    selectionKicker: 'ANTES DE SELECCIONAR UN FILTRO',
    selectionTitle: 'Preguntas que la aplicación debe responder primero.',
    selectionBody: 'El elemento correcto lo definen el activo protegido, la exposición a la contaminación y la exigencia de operación. Estas preguntas deben resolverse antes de la referencia cruzada o de la selección del repuesto.',
    serviceKicker: 'DISCIPLINA DE SERVICIO',
    serviceTitle: 'Un elemento nuevo no corrige una práctica de mantenimiento contaminada.',
    contextKicker: 'CONTEXTO TÉCNICO',
    contextTitle: 'Tecnología, sistema y normas aplicables.',
    contextNote: 'Estas referencias definen el contexto de ingeniería de la familia. La selección final del producto sigue dependiendo de la aplicación aprobada y de las condiciones de operación.',
    technology: 'Tecnología',
    protectionSystem: 'Sistema de protección',
    references: 'Referencias aplicables',
    industriesKicker: 'ENTORNOS DE OPERACIÓN',
    industriesTitle: 'Dónde se aplica este sistema de protección.',
    actionKicker: 'DE LA INGENIERÍA A LA IDENTIFICACIÓN DEL REPUESTO',
    actionTitle: 'Primero proteja el activo. Luego identifique el repuesto.',
    actionBody: 'Use Part Search cuando conozca la aplicación. Contacte a ELIMFILTERS cuando la condición de operación, el requisito de protección o la referencia cruzada necesiten revisión técnica.',
    browse: (prefix: string) => `VER SKUS ${prefix}`,
    partSearch: 'PART SEARCH',
    support: 'SOPORTE TÉCNICO',
    knowledge: 'KNOWLEDGE CENTER',
    home: 'Inicio',
    families: 'Familias',
    category: 'Filtración industrial',
    variesBy: 'Clase de servicio',
  },
  pt: {
    back: 'FAMÍLIAS',
    eyebrow: 'PROTEÇÃO DE ATIVOS CRÍTICOS',
    duty: (duty: string) => `LINHA ${duty}`,
    heroAlt: (name: string) => `Aplicação de filtração: ${name}`,
    ogAlt: (name: string) => `${name}: proteção de ativos`,
    whyKicker: 'POR QUE ESTA FAMÍLIA EXISTE',
    whyTitle: 'Proteja a máquina antes que a contaminação se transforme em dano.',
    assetKicker: 'ATIVO PROTEGIDO',
    assetTitle: 'O que está por trás do filtro importa mais do que o próprio filtro.',
    riskKicker: 'RISCO DE CONTAMINAÇÃO',
    riskTitle: 'O que acontece quando a barreira de proteção é perdida.',
    riskLink: 'LER O GUIA DE CONTAMINAÇÃO',
    strategyKicker: 'ESTRATÉGIA DE PROTEÇÃO',
    strategyTitle: 'A seleção começa pelo sistema em operação, não por um número de peça.',
    controlStrategy: 'Estratégia de controle',
    systemContext: 'Contexto do sistema',
    familyRole: 'Função da família',
    selectionKicker: 'ANTES DE SELECIONAR UM FILTRO',
    selectionTitle: 'Perguntas que a aplicação deve responder primeiro.',
    selectionBody: 'O elemento correto é definido pelo ativo protegido, pela exposição à contaminação e pela severidade da operação. Estas perguntas devem ser respondidas antes da referência cruzada ou da seleção da peça.',
    serviceKicker: 'DISCIPLINA DE MANUTENÇÃO',
    serviceTitle: 'Um elemento novo não corrige uma prática de manutenção contaminada.',
    contextKicker: 'CONTEXTO TÉCNICO',
    contextTitle: 'Tecnologia, sistema e normas aplicáveis.',
    contextNote: 'Estas referências definem o contexto de engenharia da família. A seleção final do produto continua dependendo da aplicação aprovada e das condições de operação.',
    technology: 'Tecnologia',
    protectionSystem: 'Sistema de proteção',
    references: 'Referências aplicáveis',
    industriesKicker: 'AMBIENTES DE OPERAÇÃO',
    industriesTitle: 'Onde este sistema de proteção é aplicado.',
    actionKicker: 'DA ENGENHARIA À IDENTIFICAÇÃO DA PEÇA',
    actionTitle: 'Primeiro proteja o ativo. Depois identifique a peça.',
    actionBody: 'Use o Part Search quando a aplicação for conhecida. Fale com a ELIMFILTERS quando a condição de operação, o requisito de proteção ou a referência cruzada precisarem de revisão técnica.',
    browse: (prefix: string) => `VER SKUS ${prefix}`,
    partSearch: 'PART SEARCH',
    support: 'SUPORTE TÉCNICO',
    knowledge: 'KNOWLEDGE CENTER',
    home: 'Início',
    families: 'Famílias',
    category: 'Filtração industrial',
    variesBy: 'Classe de serviço',
  },
} as const;

export const familySlugs = () => PRODUCT_FAMILY_LIST.map((f) => ({ slug: f.slug }));

const familyPath = (slug: string, lang: FamilyLang) => localizedPath(`/families/${slug}`, lang);

// Technology pages that have published /es/ and /pt/ versions.
const LOCALIZED_TECHNOLOGY_PAGES = new Set(['hydrocore']);

export function familyMetadata(slug: string, lang: FamilyLang): Metadata {
  const fam = getFamilyBySlug(slug);
  if (!fam) return { title: 'Not Found' };
  const local = lang === 'en' ? undefined : LOCALE_CONTENT[lang].family[fam.slug];
  const name = local?.name ?? fam.name;
  const purpose = local?.purpose ?? fam.purpose;
  const url = `${BASE_URL}${familyPath(fam.slug, lang)}`;
  const title = `${local?.seoTitle ?? FAMILY_SEO_TITLES[fam.slug] ?? fam.name} | ELIMFILTERS`;

  return {
    title,
    description: purpose,
    alternates: {
      canonical: url,
      languages: languageAlternates(`/families/${fam.slug}`),
    },
    openGraph: {
      title,
      description: purpose,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      locale: OG_LOCALE[lang],
      images: [{ url: fam.heroImage, alt: COPY[lang].ogAlt(name) }],
    },
    twitter: { card: 'summary_large_image', title, description: purpose, images: [fam.heroImage] },
  };
}

function standardHref(std: string) {
  const key = std.toLowerCase();
  if (key.includes('iso 16889')) return '/knowledge-center/standards/iso-16889/';
  if (key.includes('iso 4406')) return '/knowledge-center/standards/iso-4406/';
  if (key.includes('iso 5011')) return '/knowledge-center/standards/iso-5011/';
  if (key.includes('iso 16332')) return '/knowledge-center/standards/iso-16332/';
  if (key.includes('astm d6304')) return '/knowledge-center/standards/astm-d6304/';
  if (key.includes('iso 12937')) return '/knowledge-center/standards/iso-12937/';
  if (key.includes('nfpa t2.14')) return '/knowledge-center/standards/nfpa-t2-14/';
  if (key.includes('din 51524')) return '/knowledge-center/standards/din-51524/';
  if (key.includes('iso 11155-1')) return '/knowledge-center/standards/iso-11155-1/';
  if (key.includes('iso 8573-1')) return '/knowledge-center/standards/iso-8573-1/';
  return '/knowledge-center/standards/';
}

function industryLabel(value: string, lang: FamilyLang) {
  const local = lang === 'en' ? undefined : (LOCALE_CONTENT[lang].industry as Record<string, string>)[value];
  if (local) return local;
  return value
    .replace('trucks-fleets', 'Truck Fleets')
    .replace('oil-gas', 'Oil & Gas')
    .replace('bus-coach', 'Bus & Coach')
    .replace('power-generation', 'Power Generation')
    .replace('waste-municipal', 'Waste & Municipal')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function FamilyPageView({ slug, lang }: { slug: string; lang: FamilyLang }) {
  const source = getFamilyBySlug(slug);
  if (!source) notFound();
  const c = COPY[lang];

  // Localized routes overlay the governed translation on the canonical English records.
  const content = lang === 'en' ? undefined : LOCALE_CONTENT[lang];
  const famLocal = content?.family[source.slug];
  const fam = { ...source, name: famLocal?.name ?? source.name, purpose: famLocal?.purpose ?? source.purpose, engineering: famLocal?.engineering ?? source.engineering };
  const systemSource = getProtectionSystemBySlug(fam.protectionSystem);
  const system = systemSource && { ...systemSource, ...((content && content.system[systemSource.slug]) || {}) };
  const technologySource = getTechnologyEngineering(fam.primaryTechnology);
  const technology = technologySource && { ...technologySource, ...((content && content.technology[fam.primaryTechnology]) || {}) };
  const failures = Object.values(FAILURE_KNOWLEDGE)
    .filter((failure) => failure.families.includes(fam.slug))
    .map((failure) => ({ ...failure, ...((content && content.failure[failure.key]) || {}) }));
  const components = (content ? content.components : PROTECTED_COMPONENTS)[fam.primaryTechnology] ?? [];
  const fieldQuestions = (content ? content.questions : FIELD_QUESTIONS)[fam.slug] ?? [];
  const serviceDiscipline = (content ? content.service : SERVICE_DISCIPLINE)[fam.primaryTechnology] ?? [];
  const familyUrl = `${BASE_URL}${familyPath(fam.slug, lang)}`;
  const technologyHref = LOCALIZED_TECHNOLOGY_PAGES.has(fam.primaryTechnology)
    ? localizedPath(`/technologies/${fam.primaryTechnology}`, lang)
    : `/technologies/${fam.primaryTechnology}/`;
  const hubBase = `https://part-search.elimfilters.com${lang === 'en' ? '' : `/${lang}`}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.home, item: `${BASE_URL}${localizedPath('/', lang)}` },
      { '@type': 'ListItem', position: 2, name: c.families, item: `${BASE_URL}/families/` },
      { '@type': 'ListItem', position: 3, name: fam.name, item: familyUrl },
    ],
  };

  const productGroupSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${familyUrl}#productgroup`,
    name: fam.name,
    description: fam.purpose,
    url: familyUrl,
    brand: { '@type': 'Brand', '@id': `${BASE_URL}/#brand`, name: 'ELIMFILTERS' },
    manufacturer: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
    category: c.category,
    variesBy: [c.variesBy],
    inLanguage: lang,
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productGroupSchema) }} />

      <Link href="/families/" style={backButton}>{c.back}</Link>
      <LanguageSwitcher style={languageChip} />

      <header style={hero}>
        <img src={fam.heroImage} alt={c.heroAlt(fam.name)} fetchPriority="high" style={heroImage} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <span style={eyebrow}>{c.eyebrow}</span>
          <h1 style={heroTitle}>{fam.name}</h1>
          <p style={heroLead}>{fam.purpose}</p>
          <div style={heroMeta}>
            {system && <Link href={`/systems/${system.slug}/`} style={metaLink}>{system.name}</Link>}
            {technology && <Link href={technologyHref} style={metaLink}>{technology.name}</Link>}
            <span style={metaText}>{c.duty(fam.dutyClass)}</span>
          </div>
        </div>
      </header>

      <section style={introSection}>
        <div style={introGrid}>
          <div>
            <span style={sectionKicker}>{c.whyKicker}</span>
            <h2 style={sectionTitle}>{c.whyTitle}</h2>
          </div>
          <div>
            <p style={leadText}>{fam.engineering}</p>
            {technology && <p style={bodyText}>{technology.engineeringPrinciple}</p>}
          </div>
        </div>
      </section>

      <section style={assetSection}>
        <div style={wrap}>
          <div style={sectionHeadingRow}>
            <div>
              <span style={sectionKicker}>{c.assetKicker}</span>
              <h2 style={sectionTitleSmall}>{c.assetTitle}</h2>
            </div>
            {technology && <p style={headingNote}>{technology.operationalImpact}</p>}
          </div>

          <div style={componentGrid}>
            {components.map((component) => (
              <div key={component} style={componentCard}>
                <span style={componentName}>{component}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {failures.length > 0 && (
        <section style={riskSection}>
          <div style={wrap}>
            <span style={sectionKicker}>{c.riskKicker}</span>
            <h2 style={sectionTitleSmall}>{c.riskTitle}</h2>
            <div style={riskGrid}>
              {failures.map((failure) => (
                <article key={failure.key} style={riskCard}>
                  <h3 style={cardTitle}>{failure.name}</h3>
                  <p style={cardBody}>{failure.mechanism}</p>
                  <div style={riskDivider} />
                  <p style={impactText}>{failure.operationalImpact}</p>
                  <Link href={failure.href} style={textLink}>{c.riskLink}</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={strategySection}>
        <div style={strategyGrid}>
          <div>
            <span style={sectionKicker}>{c.strategyKicker}</span>
            <h2 style={sectionTitleSmall}>{c.strategyTitle}</h2>
          </div>
          <div style={strategyStack}>
            {technology && (
              <div style={strategyItem}>
                <span style={strategyLabel}>{c.controlStrategy}</span>
                <p style={strategyText}>{technology.controlStrategy}</p>
              </div>
            )}
            {system && (
              <div style={strategyItem}>
                <span style={strategyLabel}>{c.systemContext}</span>
                <p style={strategyText}>{system.engineeringPrinciple}</p>
              </div>
            )}
            <div style={strategyItem}>
              <span style={strategyLabel}>{c.familyRole}</span>
              <p style={strategyText}>{fam.purpose}</p>
            </div>
          </div>
        </div>
      </section>

      {fieldQuestions.length > 0 && (
        <section style={selectionSection}>
          <div style={wrap}>
            <div style={selectionIntro}>
              <span style={sectionKicker}>{c.selectionKicker}</span>
              <h2 style={sectionTitleSmall}>{c.selectionTitle}</h2>
              <p style={bodyText}>{c.selectionBody}</p>
            </div>
            <div style={questionGrid}>
              {fieldQuestions.map((question, index) => (
                <div key={question} style={questionCard}>
                  <span style={questionNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <p style={questionText}>{question}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {serviceDiscipline.length > 0 && (
        <section style={serviceSection}>
          <div style={serviceGrid}>
            <div>
              <span style={sectionKicker}>{c.serviceKicker}</span>
              <h2 style={sectionTitleSmall}>{c.serviceTitle}</h2>
            </div>
            <div style={serviceList}>
              {serviceDiscipline.map((item, index) => (
                <div key={item} style={serviceItem}>
                  <span style={serviceNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <p style={serviceText}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={standardsSection}>
        <div style={wrap}>
          <div style={standardsHeader}>
            <div>
              <span style={sectionKicker}>{c.contextKicker}</span>
              <h2 style={sectionTitleSmall}>{c.contextTitle}</h2>
            </div>
            <p style={headingNote}>{c.contextNote}</p>
          </div>

          <div style={contextGrid}>
            {technology && (
              <Link href={technologyHref} style={contextCardYellow}>
                <span style={contextLabel}>{c.technology}</span>
                <strong style={contextTitle}>{technology.name}</strong>
                <span style={contextBody}>{technology.definition}</span>
              </Link>
            )}
            {system && (
              <Link href={`/systems/${system.slug}/`} style={contextCard}>
                <span style={contextLabel}>{c.protectionSystem}</span>
                <strong style={contextTitle}>{system.name}</strong>
                <span style={contextBody}>{system.overview}</span>
              </Link>
            )}
          </div>

          <div style={standardsBand}>
            <span style={contextLabel}>{c.references}</span>
            <div style={standardLinks}>
              {fam.applicableStandards.map((std) => (
                <Link key={std} href={standardHref(std)} style={standardLink}>{std}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {system && system.relatedIndustries.length > 0 && (
        <section style={industriesSection}>
          <div style={wrap}>
            <span style={sectionKicker}>{c.industriesKicker}</span>
            <h2 style={sectionTitleSmall}>{c.industriesTitle}</h2>
            <div style={industryGrid}>
              {system.relatedIndustries.map((industry) => (
                <Link key={industry} href={`/industries/${industry}/`} style={industryLink}>{industryLabel(industry, lang)}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={actionSection}>
        <div style={actionInner}>
          <div>
            <span style={sectionKicker}>{c.actionKicker}</span>
            <h2 style={actionTitle}>{c.actionTitle}</h2>
            <p style={actionBody}>{c.actionBody}</p>
          </div>
          <div style={actionLinks}>
            {[fam.hdPrefix, fam.ldPrefix].filter((prefix): prefix is string => Boolean(prefix)).map((prefix) => (
              <Link key={prefix} href={`${hubBase}/family/${prefix}/`} style={yellowButton}>{c.browse(prefix)}</Link>
            ))}
            <Link href="https://part-search.elimfilters.com" style={darkButton}>{c.partSearch}</Link>
            <Link href={localizedPath('/contact', lang)} style={darkButton}>{c.support}</Link>
            <Link href="/knowledge-center/" style={darkButton}>{c.knowledge}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const languageChip: CSSProperties = { position: 'fixed', top: '1rem', right: '1.2rem', zIndex: 50, background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.16)', padding: '0.42rem 0.75rem', backdropFilter: 'blur(12px)' };
const backButton: CSSProperties = { position: 'fixed', top: '1rem', left: '1.2rem', zIndex: 50, background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.72rem', padding: '0.72rem 1rem', backdropFilter: 'blur(12px)' };
const hero: CSSProperties = { minHeight: '82vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 'clamp(7rem, 12vw, 10rem) clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 7rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: HERO_MEDIA_TREATMENT.opacity, filter: 'none' };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: HERO_MEDIA_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.9, fontSize: 'clamp(3.2rem, 7vw, 7rem)', maxWidth: '980px', margin: '0.8rem 0 0', textTransform: 'uppercase' };
const heroLead: CSSProperties = { margin: '1.5rem 0 0', maxWidth: '820px', color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem, 1.55vw, 1.28rem)', lineHeight: 1.65, fontWeight: 500 };
const heroMeta: CSSProperties = { display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.7rem' };
const metaLink: CSSProperties = { color: '#fff', textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.34)', paddingTop: '0.65rem', marginRight: '1.2rem', fontFamily: displayFont, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' };
const metaText: CSSProperties = { ...metaLink, color: 'rgba(255,255,255,0.58)' };
const introSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const introGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 7vw, 6rem)' };
const sectionKicker: CSSProperties = { display: 'block', color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.7rem', marginBottom: '1rem' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.4rem, 4.7vw, 4.8rem)', lineHeight: 0.97, letterSpacing: '-0.04em', margin: 0, maxWidth: '700px', textTransform: 'uppercase' };
const sectionTitleSmall: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2rem, 3.8vw, 3.7rem)', maxWidth: '780px' };
const leadText: CSSProperties = { margin: 0, color: '#fff', fontSize: 'clamp(1.1rem, 1.65vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600 };
const bodyText: CSSProperties = { margin: '1.2rem 0 0', color: 'rgba(255,255,255,0.64)', fontSize: '1rem', lineHeight: 1.78 };
const assetSection: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem)', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const sectionHeadingRow: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'end' };
const headingNote: CSSProperties = { margin: 0, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, fontSize: '0.98rem' };
const componentGrid: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', marginTop: '3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' };
const componentCard: CSSProperties = { background: '#0a0a0a', minHeight: '130px', padding: '1.4rem', display: 'flex', alignItems: 'flex-end', flex: '1 1 210px', maxWidth: '340px', minWidth: 0 };
const componentName: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', textTransform: 'uppercase' };
const riskSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const riskGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2.7rem' };
const riskCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', padding: '1.6rem', background: 'rgba(255,255,255,0.018)', minHeight: '330px', display: 'flex', flexDirection: 'column' };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.025em', textTransform: 'uppercase', margin: 0 };
const cardBody: CSSProperties = { color: 'rgba(255,255,255,0.67)', lineHeight: 1.68, margin: '1rem 0 0' };
const riskDivider: CSSProperties = { height: '1px', background: 'rgba(255,241,45,0.35)', margin: '1.4rem 0' };
const impactText: CSSProperties = { color: '#fff', lineHeight: 1.65, margin: 0, fontWeight: 600 };
const textLink: CSSProperties = { color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', marginTop: 'auto', paddingTop: '1.4rem' };
const strategySection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const strategyGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 7vw, 6rem)' };
const strategyStack: CSSProperties = { display: 'grid', gap: 0, borderTop: '1px solid rgba(255,255,255,0.14)' };
const strategyItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.14)' };
const strategyLabel: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.13em', textTransform: 'uppercase' };
const strategyText: CSSProperties = { margin: '0.65rem 0 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.68, fontSize: '1.03rem' };
const selectionSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const selectionIntro: CSSProperties = { maxWidth: '850px' };
const questionGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2.8rem' };
const questionCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.24)', paddingTop: '1rem', minHeight: '145px' };
const questionNumber: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em' };
const questionText: CSSProperties = { color: '#fff', fontWeight: 600, lineHeight: 1.55, margin: '1rem 0 0', fontSize: '1.03rem' };
const serviceSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const serviceGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 7vw, 6rem)' };
const serviceList: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.14)' };
const serviceItem: CSSProperties = { display: 'grid', gridTemplateColumns: '52px 1fr', gap: '1rem', padding: '1.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.14)' };
const serviceNumber: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em' };
const serviceText: CSSProperties = { margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: 1.62, fontWeight: 600 };
const standardsSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const standardsHeader: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'end' };
const contextGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2.8rem' };
const contextCard: CSSProperties = { color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', padding: '1.5rem', minHeight: '230px', display: 'flex', flexDirection: 'column' };
const contextCardYellow: CSSProperties = { ...contextCard, borderColor: 'rgba(255,241,45,0.42)' };
const contextLabel: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.13em', textTransform: 'uppercase' };
const contextTitle: CSSProperties = { fontFamily: displayFont, fontSize: '1.55rem', marginTop: '1rem', textTransform: 'uppercase' };
const contextBody: CSSProperties = { color: 'rgba(255,255,255,0.64)', lineHeight: 1.62, marginTop: '1rem' };
const standardsBand: CSSProperties = { marginTop: '1rem', border: '1px solid rgba(255,255,255,0.12)', padding: '1.5rem' };
const standardLinks: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1rem' };
const standardLink: CSSProperties = { color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,241,45,0.45)', paddingBottom: '0.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.82rem' };
const industriesSection: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem)', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const industryGrid: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '2rem' };
const industryLink: CSSProperties = { color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.16)', padding: '0.75rem 0.9rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase' };
const actionSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'linear-gradient(135deg, rgba(255,241,45,0.13), transparent 45%)' };
const actionInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', gap: 'clamp(2.5rem, 7vw, 6rem)', alignItems: 'end' };
const actionTitle: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2.4rem, 4.8vw, 4.8rem)' };
const actionBody: CSSProperties = { color: 'rgba(255,255,255,0.68)', maxWidth: '760px', lineHeight: 1.72, fontSize: '1.02rem', margin: '1.4rem 0 0' };
const actionLinks: CSSProperties = { display: 'grid', gap: '0.75rem' };
const yellowButton: CSSProperties = { background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.15rem', textAlign: 'center' };
const darkButton: CSSProperties = { color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.15rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' };
