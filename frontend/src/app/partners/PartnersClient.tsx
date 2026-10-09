'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageMenu } from '@/components/LanguageMenu';

const dictionary = {
  "es": {
    "headline": "Protección Total",
    "prefix": "de",
    "highlight": "Activos Críticos",
    "intro": "Tu negocio puede llegar más lejos: nuevas oportunidades de mercado, decisiones más ágiles, mayor capacidad comercial y más valor para tus clientes. Con ELIMFILTERS, la filtración es el medio para desarrollar una propuesta diferenciada de protección de activos críticos.",
    "cta": "Forma Parte de Nuestros Socios Comerciales",
    "note": "Evaluación inicial de asociación comercial · No implica exclusividad",
    "section": "Lo que puede cambiar en tu negocio",
    "footer": "Propuesta comercial sujeta a evaluación y condiciones aprobadas.",
    "titles": [
      "Más Oportunidades de Negocio",
      "Decisiones Más Rápidas y Seguras",
      "Mayor Capacidad Comercial",
      "Más Valor para Tus Clientes"
    ],
    "bodies": [
      "Explora nuevas oportunidades para ampliar tu negocio y desarrollar mercados con mayor proyección.",
      "Accede a información técnica y criterios de aplicación para avanzar con mayor confianza comercial.",
      "Una plataforma de producto más sólida para ampliar tu oferta y fortalecer tu posición en el mercado.",
      "La protección de activos críticos es el objetivo; la filtración es el medio para contribuir a mayor vida útil, disponibilidad y rendimiento."
    ]
  },
  "en": {
    "headline": "Total Protection",
    "prefix": "of",
    "highlight": "Critical Assets",
    "intro": "Your business can go further: new market opportunities, faster decisions, stronger commercial capabilities and more value for your customers. With ELIMFILTERS, filtration is the means to develop a differentiated approach to critical asset protection.",
    "cta": "Become One of Our Commercial Partners",
    "note": "Initial partnership evaluation · No exclusivity implied",
    "section": "What could change for your business",
    "footer": "Commercial proposal subject to evaluation and approved terms.",
    "titles": [
      "More Business Opportunities",
      "Faster, More Confident Decisions",
      "Stronger Commercial Capabilities",
      "More Value for Your Customers"
    ],
    "bodies": [
      "Explore opportunities to expand your business and develop markets with greater potential.",
      "Access technical information and application criteria to move forward with greater commercial confidence.",
      "A stronger product platform to broaden your offering and strengthen your market position.",
      "Critical asset protection is the goal; filtration is the means to contribute to longer service life, availability and performance."
    ]
  },
  "pt": {
    "headline": "Proteção Total",
    "prefix": "de",
    "highlight": "Ativos Críticos",
    "intro": "Seu negócio pode ir mais longe: novas oportunidades de mercado, decisões mais ágeis, maior capacidade comercial e mais valor para seus clientes. Com a ELIMFILTERS, a filtração é o meio para desenvolver uma proposta diferenciada de proteção de ativos críticos.",
    "cta": "Faça Parte dos Nossos Parceiros Comerciais",
    "note": "Avaliação inicial de parceria comercial · Não implica exclusividade",
    "section": "O que pode mudar no seu negócio",
    "footer": "Proposta comercial sujeita a avaliação e condições aprovadas.",
    "titles": [
      "Mais Oportunidades de Negócio",
      "Decisões Mais Rápidas e Seguras",
      "Maior Capacidade Comercial",
      "Mais Valor para Seus Clientes"
    ],
    "bodies": [
      "Explore novas oportunidades para ampliar seu negócio e desenvolver mercados com maior potencial.",
      "Acesse informações técnicas e critérios de aplicação para avançar com maior confiança comercial.",
      "Uma plataforma de produtos mais sólida para ampliar sua oferta e fortalecer sua posição no mercado.",
      "A proteção de ativos críticos é o objetivo; a filtração é o meio para contribuir para maior vida útil, disponibilidade e desempenho."
    ]
  }
};

const benefits = [
  {
    icon: '↗',
    title: 'Más Oportunidades de Negocio',
    body: 'Explora nuevas oportunidades para ampliar tu negocio y desarrollar mercados con mayor proyección.',
  },
  {
    icon: '⚙',
    title: 'Decisiones Más Rápidas y Seguras',
    body: 'Accede a información técnica y criterios de aplicación para avanzar con mayor confianza comercial.',
  },
  {
    icon: '▱',
    title: 'Mayor Capacidad Comercial',
    body: 'Una plataforma de producto más sólida para ampliar tu oferta y fortalecer tu posición en el mercado.',
  },
  {
    icon: '◇',
    title: 'Más Valor para Tus Clientes',
    body: 'La protección de activos críticos es el objetivo; la filtración es el medio para contribuir a mayor vida útil, disponibilidad y rendimiento.',
  },
];

export default function PartnersClient() {
  const { i18n } = useTranslation();
  const code = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2);
  const lang: 'es' | 'en' | 'pt' = code === 'en' || code === 'pt' ? code : 'es';
  const copy = dictionary[lang];
  const localizedBenefits = benefits.map((item, index) => ({
    ...item,
    title: copy.titles[index],
    body: copy.bodies[index],
  }));
  return (
    <main className="partner-landing">
      <img
        className="partner-globe"
        src="/assets/partners-globe.webp"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          display: 'block',
          width: '58%',
          height: '640px',
          right: 0,
          top: 0,
          zIndex: 0,
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 1,
          pointerEvents: 'none'
        }}
      />
      <div className="partner-shell">
        <header className="partner-header">
          <img
            className="partner-logo"
            src="/assets/elimfilters-logo-white.png"
            alt="Elimfilters — Total Assets Protection"
          />
          <LanguageMenu />
        </header>

        <section className="partner-hero" aria-labelledby="partner-title">
          <h1 id="partner-title">
            {copy.headline}
            <span>{copy.prefix} <em>{copy.highlight}</em></span>
          </h1>
          <p className="partner-intro">{copy.intro}</p>
          <Link className="partner-cta" href="/distributor-application/?program=partner">
            <span>{copy.cta}</span>
            <span aria-hidden="true" className="partner-arrow">→</span>
          </Link>
          <p className="partner-cta-note">{copy.note}</p>
        </section>

        <section className="partner-benefits" aria-label={copy.section}>
          {localizedBenefits.map((benefit) => (
            <article className="partner-benefit" key={benefit.title}>
              <span className="partner-icon" aria-hidden="true">{benefit.icon}</span>
              <h2>{benefit.title}</h2>
              <p>{benefit.body}</p>
            </article>
          ))}
        </section>
        <footer className="partner-footer">
          <span>ELIMFILTERS® · TOTAL ASSETS PROTECTION</span>
          <span>{copy.footer}</span>
        </footer>
      </div>
      <style>{`
        .partner-landing { position:relative; isolation:isolate; min-height:100vh; overflow:hidden; color:#f6f7f8; background:radial-gradient(circle at 56% 5%, #1a2630 0, #0a0e13 40%, #030507 78%); font-family:Barlow,Arial,sans-serif; }
        .partner-globe { position:absolute; z-index:0; width:min(53vw,850px); height:740px; right:0; top:8px; background-image:linear-gradient(to right,#080c11 0%,transparent 19%),linear-gradient(to bottom,transparent 72%,#060a0e 99%),url('/assets/partners-globe.webp'); background-position:center; background-size:cover; background-repeat:no-repeat; opacity:.98; pointer-events:none; }
        .partner-shell { position:relative; z-index:1; max-width:1536px; margin:0 auto; padding:22px clamp(24px,5vw,74px) 16px; }
        .partner-header { height:96px; display:flex; align-items:flex-start; overflow:hidden; }
        .partner-logo { display:block; width:clamp(420px,44vw,650px); max-height:none; object-fit:contain; object-position:left top; margin-left:-36px; margin-top:-45px; }
        .partner-hero { max-width:745px; padding-top:8px; min-height:0; }
        .partner-hero h1 { font-family:'Chakra Petch',Barlow,Arial,sans-serif; font-size:clamp(46px,4.7vw,69px); line-height:1.02; letter-spacing:-.045em; font-weight:800; margin:0 0 13px; }
        .partner-hero h1 span { display:block; }
        .partner-hero h1 em { color:#ffd34e; font-style:normal; }
        .partner-intro { max-width:640px; font-size:clamp(17px,1.28vw,19px); font-weight:400; line-height:1.35; color:#e6e7e9; margin:0 0 19px; text-align:left !important; text-wrap:pretty; }
        .partner-cta { display:inline-flex; align-items:center; justify-content:space-between; gap:24px; padding:19px 24px; min-height:62px; background:linear-gradient(#ffdf72,#ffca3a); color:#050505; border-radius:11px; font-family:'Chakra Petch',Barlow,Arial,sans-serif; font-weight:800; font-size:clamp(15px,1.15vw,19px); text-decoration:none; box-shadow:0 0 23px #b87b202b; transition:filter .2s,transform .2s; }
        .partner-cta:hover { filter:brightness(1.08); transform:translateY(-2px); }
        .partner-cta:focus-visible { outline:3px solid white; outline-offset:4px; }
        .partner-arrow { font-size:29px; line-height:1; }
        .partner-cta-note { font-size:13px; margin:13px 0 0; color:#b6b8bc; }
        .partner-benefits { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:0; margin-top:26px; padding:22px 0 14px; border-top:1px solid #ffffff20; }
        .partner-benefit { padding:0 clamp(14px,2vw,27px); min-height:0; border-left:1px solid #ffffff22; }
        .partner-benefit:first-child { padding-left:0; border-left:0; }
        .partner-icon { display:flex; align-items:center; justify-content:center; width:52px; height:52px; color:#ffce43; border:1px solid #ced1d58a; border-radius:50%; font-size:27px; font-family:Arial,sans-serif; margin-bottom:8px; }
        .partner-benefit h2 { font-family:'Chakra Petch',Barlow,Arial,sans-serif; font-weight:700; font-size:clamp(17px,1.45vw,22px); line-height:1.15; margin:0 0 10px; }
        .partner-benefit p { font-size:clamp(14px,1vw,16px); line-height:1.35; color:#d6d7d9; margin:0; text-align:left !important; }
        .partner-footer { border-top:1px solid #ffffff1c; padding-top:10px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:10px; color:#91959c; font-size:12px; }
        @media(max-width:1050px) { .partner-globe { width:62vw; opacity:.58; } .partner-hero { max-width:710px; } .partner-benefits { grid-template-columns:repeat(2,minmax(0,1fr)); row-gap:38px; } .partner-benefit:nth-child(3) { padding-left:0; border-left:0; } }
        @media(max-width:640px) { .partner-shell { padding:25px 24px 34px; } .partner-header { height:100px; } .partner-logo { width:min(80vw,300px); } .partner-globe { top:80px; right:-70px; width:100vw; height:480px; opacity:.29; } .partner-hero { min-height:unset; padding-top:45px; } .partner-hero h1 { font-size:clamp(40px,9vw,56px); letter-spacing:-.045em; } .partner-intro { font-size:17px; line-height:1.55; } .partner-cta { width:100%; box-sizing:border-box; font-size:15px; gap:10px; padding:15px 17px; } .partner-benefits { margin-top:48px; grid-template-columns:1fr; gap:25px; } .partner-benefit,.partner-benefit:nth-child(3) { border-left:0; border-top:1px solid #ffffff22; padding:23px 0 0; min-height:0; } .partner-benefit:first-child { border-top:0; padding-top:0; } .partner-icon { width:54px; height:54px; font-size:28px; margin-bottom:11px; } }
        @media(prefers-reduced-motion:reduce){ .partner-cta { transition:none; } }

        /* partner-visual-fix-v3 */
        .partner-header {
          height: 115px;
          overflow: visible;
        }
        .partner-logo {
          width: 430px;
          height: 115px;
          max-height: none;
          object-fit: cover;
          object-position: center center;
          margin: 0;
        }
        @media (min-width: 1051px) {
          .partner-shell {
            padding-top: 10px;
            padding-bottom: 8px;
          }
          .partner-hero {
            padding-top: 0;
          }
          .partner-hero h1 {
            font-size: clamp(44px, 4.25vw, 64px);
          }
          .partner-intro {
            line-height: 1.3;
            margin-bottom: 13px;
          }
          .partner-cta {
            min-height: 52px;
            padding: 13px 22px;
          }
          .partner-cta-note {
            margin-top: 7px;
          }
          .partner-benefits {
            margin-top: 15px;
            padding-top: 13px;
            padding-bottom: 8px;
          }
          .partner-icon {
            width: 43px;
            height: 43px;
            margin-bottom: 5px;
          }
          .partner-benefit h2 {
            margin-bottom: 5px;
          }
          .partner-benefit p {
            line-height: 1.25;
          }
          .partner-footer {
            padding-top: 7px;
          }
        }
        @media (max-width: 640px) {
          .partner-header { height: 95px; }
          .partner-logo { width: 300px; height: 95px; }
        }

        /* Isolated logo and language menu adjustment */
        .partner-header {
          display:flex; align-items:center; justify-content:space-between;
          height:94px; overflow:visible; position:relative; z-index:5;
        }
        .partner-logo {
          display:block; width:320px; height:90px; max-width:70%;
          object-fit:contain; object-position:left center; margin:0;
        }
        @media(max-width:640px) {
          .partner-logo { width:225px; height:76px; }
          .partner-header { height:80px; }
        }

        /* PARTNERS LOGO SPACING FIX */
        .partner-header {
          height: 112px;
          min-height: 112px;
          align-items: center;
        }
        .partner-logo {
          width: 280px;
          height: 75px;
          max-width: 70%;
          object-fit: contain;
          object-position: left center;
          margin: 0;
        }
        @media (max-width: 640px) {
          .partner-header {
            height: 90px;
            min-height: 90px;
          }
          .partner-logo {
            width: 225px;
            height: 68px;
          }
        }

      `}</style>
    </main>
  );
}
