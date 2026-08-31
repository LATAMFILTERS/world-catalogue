import Link from 'next/link';
import { PageHeader } from './PageHeader';
import MacrocoreConceptDiagram from './technologies/MacrocoreConceptDiagram';
import { ApplicationCards } from './technologies/ApplicationCards';
import { MACROCORE_APPLICATIONS } from '@/lib/macrocore-applications';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/technologies/macrocore/`;

const protectionPath = [
  ['AMBIENT AIR', 'Dust, soot, fibers and airborne debris enter through the intake environment.'],
  ['PRIMARY FILTRATION', 'The primary element carries the normal contamination load while maintaining the airflow required by the engine application.'],
  ['SECONDARY PROTECTION', 'Where specified, a safety element protects the clean-air side during primary-element service or abnormal primary-element conditions.'],
  ['SEALED CLEAN-AIR PATH', 'Housing condition, element fit and sealing geometry preserve the contamination boundary downstream of the filter.'],
  ['ENGINE', 'Controlled intake contamination helps protect turbocharger compressor surfaces, cylinder walls, piston rings and the combustion-air path.'],
] as const;

const decisionFactors = [
  ['Airflow Demand', 'Engine displacement, operating load and intake-system design determine the airflow that the filter and housing must support.'],
  ['Restriction', 'The selected configuration must remain compatible with the restriction limits defined by the equipment application.'],
  ['Dust Loading', 'Contaminant concentration, particle distribution and duty environment influence media loading and service behavior.'],
  ['Housing + Seal', 'Dimensions alone do not prove fit. Element retention, gasket geometry, housing condition and clean-side sealing are part of the protection decision.'],
  ['Primary vs. Secondary Role', 'Primary and safety elements occupy different positions in the intake architecture and should not be treated as interchangeable components.'],
  ['Service Strategy', 'Restriction indication, inspection history and operating environment should guide maintenance rather than visual appearance alone.'],
] as const;

const protectedAssets = [
  ['Turbocharger Compressor', 'Airborne particulate reaching compressor surfaces can contribute to erosive wear and loss of surface integrity.'],
  ['Cylinder Walls', 'Fine particulate entering the combustion air path can contribute to abrasive contact at the cylinder interface.'],
  ['Piston Rings', 'Dust ingestion can increase abrasive exposure at ring and liner surfaces.'],
  ['Combustion Air Path', 'The intake system must deliver required air while preserving the clean-air boundary.'],
] as const;

const faqs = [
  ['What is MACROCORE™?', 'MACROCORE™ is the ELIMFILTERS engine-air filtration architecture used for primary and secondary intake protection. It is applied within the Air Intake & Airflow Protection system.'],
  ['What does MACROCORE™ protect?', 'The technology is used to control airborne contamination before it reaches the clean-air side of the engine intake system, helping protect downstream surfaces such as the turbocharger compressor, cylinders and piston rings.'],
  ['Is MACROCORE™ a product family?', 'No. MACROCORE™ is the technology architecture. Primary Air Filters and Secondary / Safety Air Elements are product families that use the technology.'],
  ['Can an engine air filter be selected only by dimensions?', 'No. Dimensions are useful evidence, but airflow demand, restriction, seal geometry, housing fit, element position and application compatibility also matter.'],
  ['What does ISO 5011 mean for MACROCORE™?', 'ISO 5011 provides test methods used for engine air-cleaner and filter performance evaluation. Product-level claims should remain tied to validated data for the specific element or assembly.'],
  ['What information is useful for a MACROCORE™ application review?', 'Equipment model, engine, current element reference, housing information, operating environment, duty cycle and any history of restriction, dust bypass or premature service are useful starting points.'],
] as const;

const families = [
  ['Primary Air Filters', '/families/primary-air/', 'Main engine-intake contamination barrier for the normal service load.'],
  ['Secondary / Safety Air Elements', '/families/secondary-air/', 'Additional downstream protection where the intake architecture specifies a secondary element.'],
] as const;

export function MacrocoreTechnologyPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${PAGE_URL}#article`,
      headline: 'MACROCORE™ Engine Air Filtration Technology',
      name: 'MACROCORE™',
      url: PAGE_URL,
      description: 'MACROCORE™ is the ELIMFILTERS engine-air filtration architecture for primary and secondary intake protection.',
      author: { '@id': `${BASE_URL}/#organization` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: { '@type': 'DefinedTerm', '@id': `${PAGE_URL}#technology`, name: 'MACROCORE™' },
      isPartOf: { '@id': `${BASE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Technologies', item: `${BASE_URL}/technologies/` },
        { '@type': 'ListItem', position: 3, name: 'MACROCORE™', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];

  return (
    <main className="macrocore-page">
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <PageHeader breadcrumbs={[{ label: 'Technologies', href: '/technologies/' }]} currentPage="MACROCORE™" />

      <section className="mc-hero">
        <img className="mc-hero-media" src="/images/mecanica-air.avif" alt="Engine air intake filtration application" />
        <div className="mc-hero-overlay" />
        <div className="mc-shell mc-hero-content">
          <img className="mc-mark" src="/assets/MACROCORE_final.avif" alt="MACROCORE technology" />
          <p className="mc-eyebrow">ENGINE AIR FILTRATION TECHNOLOGY</p>
          <h1>MACROCORE™ <span>Engine Air Protection</span></h1>
          <p className="mc-hero-promise">Control airborne contamination while preserving airflow, restriction discipline, sealing integrity and the real intake duty cycle.</p>
          <p className="mc-hero-lead">MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine-air filtration. Selection starts with the intake system and operating environment, not with a visually similar part.</p>
          <div className="mc-actions">
            <a href="#selection" className="mc-button mc-button-primary">IDENTIFY THE INTAKE REQUIREMENT</a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence" className="mc-button mc-button-secondary">FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-shell mc-two-col">
          <div>
            <p className="mc-eyebrow">DIRECT ANSWER</p>
            <h2>The media is only one part of the clean-air boundary.</h2>
          </div>
          <div>
            <p className="mc-lead">Engine air protection depends on the complete intake path: ambient contamination, primary filtration, any specified secondary element, housing condition, seal integrity and the airflow required by the engine.</p>
            <p className="mc-body">MACROCORE™ belongs to the Air Intake & Airflow Protection system and is implemented through primary and secondary engine-air product families.</p>
          </div>
        </div>
      </section>

      <section className="mc-section mc-section-media">
        <div className="mc-shell mc-media-grid">
          <div>
            <p className="mc-eyebrow">APPLICATION</p>
            <p className="mc-application">Primary and secondary engine air-intake filtration</p>
            <h2>Airflow Management and Particle Control</h2>
            <p className="mc-lead">MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions.</p>
          </div>
          <figure className="mc-media-figure">
            <img src="/images/MACROCORE-media.png" alt="Conceptual fibrous structure representing MACROCORE engine air-intake filtration media architecture" />
            <figcaption>Conceptual representation of a fibrous structure. This image is not an actual MACROCORE™ micrograph.</figcaption>
          </figure>
        </div>
      </section>

      <section className="mc-section mc-section-alt">
        <div className="mc-shell">
          <p className="mc-eyebrow">CONTAMINATION PATH</p>
          <h2>Follow the air from the environment to the engine.</h2>
          <div className="mc-path-grid">
            {protectionPath.map(([title, text], index) => (
              <article key={title} className="mc-card">
                <span className="mc-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-shell">
          <p className="mc-eyebrow">ENGINEERING ARCHITECTURE</p>
          <h2>Airflow and contamination control have to coexist.</h2>
          <p className="mc-lead mc-max-copy">A filtration configuration cannot be judged by efficiency alone. Media, restriction behavior, housing fit and sealing must work as one intake boundary.</p>
          <div className="mc-diagram"><MacrocoreConceptDiagram /></div>
        </div>
      </section>

      <section id="selection" className="mc-section mc-section-alt">
        <div className="mc-shell">
          <p className="mc-eyebrow">SELECTION LOGIC</p>
          <h2>Six factors determine whether the air-filter decision is technically complete.</h2>
          <div className="mc-grid-3">
            {decisionFactors.map(([title, text]) => (
              <article key={title} className="mc-card">
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-shell">
          <p className="mc-eyebrow">WHAT SITS DOWNSTREAM</p>
          <h2>The protected asset begins after the clean-air seal.</h2>
          <div className="mc-grid-2">
            {protectedAssets.map(([title, text]) => (
              <article key={title} className="mc-line-card">
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-section mc-section-alt">
        <div className="mc-shell">
          <p className="mc-eyebrow">PRODUCT ARCHITECTURE</p>
          <h2>Technology first. Product family second. Validated part number last.</h2>
          <div className="mc-grid-2">
            {families.map(([name, href, description]) => (
              <Link key={name} href={href} className="mc-family-card">
                <h3>{name}</h3>
                <p>{description}</p>
                <span>VIEW PRODUCT FAMILY →</span>
              </Link>
            ))}
          </div>
          <div className="mc-flow">
            {['AIR INTAKE & AIRFLOW PROTECTION', 'MACROCORE™', 'PRIMARY / SECONDARY AIR FAMILY', 'VALIDATED PART NUMBER'].map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-shell mc-two-col">
          <div>
            <p className="mc-eyebrow">VALIDATION CONTEXT</p>
            <h2>ISO 5011 is a test framework, not a universal performance claim.</h2>
          </div>
          <div>
            <p className="mc-lead">Engine air-cleaner performance is commonly evaluated using ISO 5011 methods.</p>
            <p className="mc-body">Published efficiency, dust-capacity, restriction or durability values should remain tied to validated test data for the specific element or assembly.</p>
          </div>
        </div>
      </section>

      <section className="mc-section mc-section-alt">
        <div className="mc-shell">
          <p className="mc-eyebrow">OPERATING ENVIRONMENTS</p>
          <h2>MACROCORE™ follows the intake duty, not an industry label alone.</h2>
          <p className="mc-lead mc-max-copy">The same technology can serve different industries, but selection still depends on the equipment, engine, housing, airflow requirement, dust exposure and validated application evidence.</p>
          <div className="mc-applications"><ApplicationCards applications={MACROCORE_APPLICATIONS} /></div>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-shell">
          <p className="mc-eyebrow">FROM INTAKE CONDITION TO PART</p>
          <h2>Resolve the application in a controlled sequence.</h2>
          <div className="mc-flow mc-flow-6">
            {['1. EQUIPMENT + ENGINE', '2. HOUSING + ELEMENT POSITION', '3. AIRFLOW + RESTRICTION', '4. DUST / DUTY ENVIRONMENT', '5. OEM + DIMENSIONAL EVIDENCE', '6. VALIDATED ELIMFILTERS PART'].map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-section mc-section-alt">
        <div className="mc-shell">
          <p className="mc-eyebrow">FREQUENT QUESTIONS</p>
          <h2>MACROCORE™ Engine Air Protection</h2>
          <div className="mc-faq-grid">
            {faqs.map(([question, answer]) => (
              <article key={question} className="mc-faq-card">
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-final">
        <div className="mc-shell">
          <p className="mc-eyebrow">HAVE AN ENGINE AIR APPLICATION TO RESOLVE?</p>
          <h2>Start with the intake system, not with a visually similar filter.</h2>
          <p className="mc-lead mc-max-copy">Send the equipment, engine, current element reference, housing information and duty environment. That evidence is used to identify the correct protection path before the final part number is accepted.</p>
          <div className="mc-actions">
            <a href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Support" data-conversion-action="application-support" className="mc-button mc-button-primary">IDENTIFY MY MACROCORE APPLICATION</a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence" className="mc-button mc-button-secondary">PART SEARCH</a>
            <Link href="/systems/air-intake/" className="mc-button mc-button-secondary">AIR INTAKE SYSTEM</Link>
          </div>
        </div>
      </section>

      <style>{`
        .macrocore-page{background:#000;color:#fff;min-height:100vh;overflow-x:hidden;font-family:var(--font-body)}
        .mc-shell{width:min(1180px,calc(100% - 2.5rem));margin:0 auto}
        .mc-hero{position:relative;min-height:82vh;display:flex;align-items:center;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08)}
        .mc-hero-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.48}
        .mc-hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.95) 0%,rgba(0,0,0,.77) 52%,rgba(0,0,0,.38) 100%)}
        .mc-hero-content{position:relative;z-index:2;padding:6rem 0}
        .mc-mark{display:block;width:min(300px,62vw);height:auto;object-fit:contain;margin:0 0 1.5rem}
        .mc-eyebrow{margin:0 0 1rem;color:#FFF12D;font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
        .mc-hero h1,.mc-section h2,.mc-final h2{font-family:var(--font-display);font-weight:700;text-transform:uppercase;letter-spacing:-.035em;margin:0}
        .mc-hero h1{font-size:clamp(3rem,7vw,6.4rem);line-height:.9;max-width:1000px}
        .mc-hero h1 span{display:block;color:#FFF12D}
        .mc-section h2,.mc-final h2{font-size:clamp(2rem,4vw,3.5rem);line-height:.98;max-width:1000px}
        .mc-hero-promise{font-family:var(--font-display);font-size:clamp(1.1rem,2vw,1.42rem);font-weight:700;line-height:1.4;max-width:850px;margin:1.6rem 0 0}
        .mc-hero-lead,.mc-lead{font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.72;color:rgba(255,255,255,.78);margin:1rem 0 0}
        .mc-body{font-size:1rem;line-height:1.76;color:rgba(255,255,255,.62);margin:1rem 0 0}
        .mc-actions{display:flex;gap:.85rem;flex-wrap:wrap;margin-top:2rem}
        .mc-button{display:inline-block;padding:1rem 1.25rem;text-decoration:none;font-family:var(--font-display);font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
        .mc-button-primary{background:#FFF12D;color:#000}
        .mc-button-secondary{background:rgba(0,0,0,.45);border:1px solid rgba(255,241,45,.38);color:#FFF12D}
        .mc-section{padding:clamp(4rem,8vw,7rem) 0}
        .mc-section-alt{background:#050505;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}
        .mc-section-media{background:linear-gradient(135deg,rgba(255,241,45,.05),rgba(255,255,255,.018) 42%,rgba(0,0,0,0));border-top:1px solid rgba(255,241,45,.13);border-bottom:1px solid rgba(255,255,255,.07)}
        .mc-two-col{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(2.5rem,6vw,5rem);align-items:start}
        .mc-media-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(2.5rem,6vw,5rem);align-items:center}
        .mc-application{margin:0;color:rgba(255,255,255,.82);font-weight:600;line-height:1.6}
        .mc-media-figure{margin:0}
        .mc-media-figure img{display:block;width:100%;height:auto;object-fit:contain;border:1px solid rgba(255,255,255,.1);background:#050505}
        .mc-media-figure figcaption{margin-top:.8rem;color:rgba(255,255,255,.48);font-size:.78rem;line-height:1.55;font-style:italic}
        .mc-path-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.08);margin-top:2.2rem}
        .mc-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2.2rem}
        .mc-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:2.2rem}
        .mc-card{background:#0a0a0a;border:1px solid rgba(255,255,255,.08);padding:1.5rem;min-height:100%;box-sizing:border-box}
        .mc-card h3,.mc-line-card h3,.mc-family-card h3,.mc-faq-card h3{font-family:var(--font-display);font-size:1.02rem;line-height:1.35;text-transform:uppercase;margin:0;color:#fff}
        .mc-card p,.mc-line-card p,.mc-family-card p,.mc-faq-card p{font-size:.98rem;line-height:1.7;color:rgba(255,255,255,.62);margin:.8rem 0 0}
        .mc-number{display:block;color:#FFF12D;font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.15em;margin-bottom:1rem}
        .mc-diagram{margin-top:2.2rem}
        .mc-line-card{border-top:1px solid rgba(255,241,45,.28);padding:1.4rem 0}
        .mc-family-card{display:block;text-decoration:none;color:#fff;background:#090909;border:1px solid rgba(255,255,255,.1);padding:1.6rem;box-sizing:border-box}
        .mc-family-card span{display:inline-block;margin-top:1.2rem;color:#FFF12D;font-family:var(--font-display);font-size:.68rem;font-weight:700;letter-spacing:.12em}
        .mc-flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.08);margin-top:2.4rem}
        .mc-flow-6{grid-template-columns:repeat(6,minmax(0,1fr))}
        .mc-flow>div{background:#090909;padding:1.15rem;color:rgba(255,255,255,.82);font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.06em;line-height:1.45}
        .mc-applications{margin-top:2rem}
        .mc-faq-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:2.2rem}
        .mc-faq-card{border-top:1px solid rgba(255,241,45,.3);padding:1.35rem 0}
        .mc-max-copy{max-width:880px}
        .mc-final{padding:clamp(5rem,9vw,8rem) 0;background:radial-gradient(circle at 50% 0%,rgba(255,241,45,.15),transparent 42%);border-top:1px solid rgba(255,241,45,.2)}
        @media (max-width:980px){
          .mc-two-col,.mc-media-grid{grid-template-columns:1fr}
          .mc-path-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
          .mc-grid-3{grid-template-columns:repeat(2,minmax(0,1fr))}
          .mc-flow-6{grid-template-columns:repeat(3,minmax(0,1fr))}
        }
        @media (max-width:640px){
          .mc-shell{width:min(100% - 1.5rem,1180px)}
          .mc-hero{min-height:74vh}
          .mc-hero-content{padding:4.5rem 0}
          .mc-path-grid,.mc-grid-3,.mc-grid-2,.mc-faq-grid,.mc-flow,.mc-flow-6{grid-template-columns:1fr}
          .mc-actions{flex-direction:column}
          .mc-button{text-align:center;width:100%;box-sizing:border-box}
        }
      `}</style>
    </main>
  );
}
