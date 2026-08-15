'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';
import ContactEmailActions from './ContactEmailActions';

const COPY = {
  en: {
    eyebrow: 'Distribution opportunities',
    title: 'Build ELIMFILTERS in your market.',
    intro: 'We are looking for capable companies that want more than another product line. ELIMFILTERS is building long-term distribution partnerships with businesses prepared to develop their market, carry inventory and grow a serious industrial filtration business.',
    primaryCta: 'Apply to become a distributor',
    secondaryCta: 'Talk to our distribution team',
    whyTag: 'Why partner with ELIMFILTERS',
    whyTitle: 'A partnership designed to help you build a market — not simply place orders.',
    whyIntro: 'Selected partners gain access to a commercial structure designed around territory development, recurring volume and long-term growth.',
    benefits: [
      ['Market Development', 'We work with selected partners to build ELIMFILTERS locally, with clear territory responsibilities and a long-term commercial plan.'],
      ['Factory-Direct Volume Economics', 'A wholesale model built for commercial purchasing, recurring replenishment and competitive landed cost.'],
      ['Commercial Support', 'Product intelligence, cross-reference tools, sales materials, campaign assets and digital resources to help your team sell with confidence.'],
      ['Technical Platform', 'Access to ELIMFILTERS technical knowledge, application support and the engineering content needed to support demanding industrial customers.'],
      ['Build Your Local Network', 'Develop resellers, workshops, fleets and industrial accounts in your market while ELIMFILTERS supports the distributor relationship.'],
      ['Long-Term Partnership', 'We are interested in companies that want to build a durable market position, not in one-time or opportunistic purchases.'],
    ],
    fitTag: 'Who we want to meet',
    fitTitle: 'Strong local companies with the capacity to grow.',
    fitIntro: 'You do not need to know everything about ELIMFILTERS before contacting us. What matters is that you understand your market and have the ability to build distribution professionally.',
    fit: ['Established local commercial presence','Ability to import, warehouse and finance inventory','Access to automotive, heavy-duty or industrial channels','Capacity to purchase and replenish in commercial volume','Sales team or commercial structure capable of developing the territory','Commitment to represent ELIMFILTERS for the long term'],
    inviteTag: 'Start the conversation',
    inviteTitle: 'Could ELIMFILTERS be the next growth platform for your company?',
    inviteBody: 'Tell us who you are, where you operate and how you reach your market. We review each application individually because the objective is not to add as many distributors as possible — it is to select the right partners for each market.',
    apply: 'Complete distributor application',
    email: 'Email distribution team',
    otherTag: 'Already need help?',
    otherTitle: 'Commercial and technical contacts',
    commercial: 'Commercial inquiries',
    commercialBody: 'For buyers, fleets, importers and companies evaluating ELIMFILTERS products or commercial opportunities.',
    technical: 'Technical support',
    technicalBody: 'For application questions, OEM cross-reference validation, specifications and technical support.',
  },
  es: {
    eyebrow: 'Oportunidades de distribución',
    title: 'Construye ELIMFILTERS en tu mercado.',
    intro: 'Buscamos empresas capaces que quieran algo más que otra línea de productos. ELIMFILTERS está construyendo alianzas de distribución de largo plazo con compañías preparadas para desarrollar su mercado, mantener inventario y hacer crecer un negocio serio de filtración industrial.',
    primaryCta: 'Postúlate como distribuidor', secondaryCta: 'Habla con nuestro equipo de distribución',
    whyTag: 'Por qué asociarte con ELIMFILTERS', whyTitle: 'Una alianza diseñada para ayudarte a construir mercado, no simplemente a colocar pedidos.', whyIntro: 'Los socios seleccionados acceden a una estructura comercial pensada para desarrollo territorial, volumen recurrente y crecimiento de largo plazo.',
    benefits: [['Desarrollo de mercado','Trabajamos con socios seleccionados para desarrollar ELIMFILTERS localmente, con responsabilidades territoriales claras y un plan comercial de largo plazo.'],['Economía de volumen directo de fábrica','Un modelo mayorista diseñado para compras comerciales, reposición recurrente y costos competitivos.'],['Soporte comercial','Inteligencia de producto, herramientas de cruce, materiales de venta, activos de campaña y recursos digitales para ayudar a tu equipo a vender con confianza.'],['Plataforma técnica','Acceso al conocimiento técnico de ELIMFILTERS, soporte de aplicaciones y contenido de ingeniería para atender clientes industriales exigentes.'],['Desarrolla tu red local','Construye revendedores, talleres, flotas y cuentas industriales en tu mercado mientras ELIMFILTERS respalda la relación con el distribuidor.'],['Relación de largo plazo','Nos interesan empresas que quieran construir una posición duradera en su mercado, no compras aisladas u oportunistas.']],
    fitTag:'A quién queremos conocer', fitTitle:'Empresas locales sólidas con capacidad de crecer.', fitIntro:'No necesitas conocer todo sobre ELIMFILTERS antes de contactarnos. Lo importante es que conozcas tu mercado y tengas capacidad de desarrollar distribución profesionalmente.', fit:['Presencia comercial local establecida','Capacidad para importar, almacenar y financiar inventario','Acceso a canales automotrices, heavy-duty o industriales','Capacidad de compra y reposición en volumen comercial','Equipo de ventas o estructura comercial capaz de desarrollar el territorio','Compromiso de representar ELIMFILTERS a largo plazo'],
    inviteTag:'Inicia la conversación', inviteTitle:'¿Puede ELIMFILTERS convertirse en la próxima plataforma de crecimiento de tu empresa?', inviteBody:'Cuéntanos quién eres, dónde operas y cómo llegas a tu mercado. Revisamos cada solicitud individualmente porque el objetivo no es sumar la mayor cantidad de distribuidores, sino seleccionar los socios adecuados para cada mercado.', apply:'Completar solicitud de distribuidor', email:'Escribir al equipo de distribución',
    otherTag:'¿Ya necesitas ayuda?', otherTitle:'Contactos comerciales y técnicos', commercial:'Consultas comerciales', commercialBody:'Para compradores, flotas, importadores y empresas que evalúan productos u oportunidades comerciales con ELIMFILTERS.', technical:'Soporte técnico', technicalBody:'Para aplicaciones, validación de cruces OEM, especificaciones y soporte técnico.'
  },
  pt: {
    eyebrow:'Oportunidades de distribuição', title:'Construa a ELIMFILTERS no seu mercado.', intro:'Buscamos empresas capazes que queiram mais do que outra linha de produtos. A ELIMFILTERS está construindo parcerias de distribuição de longo prazo com empresas preparadas para desenvolver seu mercado, manter estoque e crescer um negócio sério de filtração industrial.', primaryCta:'Candidate-se como distribuidor', secondaryCta:'Fale com nossa equipe de distribuição',
    whyTag:'Por que ser parceiro ELIMFILTERS', whyTitle:'Uma parceria criada para ajudar você a construir mercado — não apenas fazer pedidos.', whyIntro:'Parceiros selecionados acessam uma estrutura comercial voltada ao desenvolvimento territorial, volume recorrente e crescimento de longo prazo.', benefits:[['Desenvolvimento de mercado','Trabalhamos com parceiros selecionados para desenvolver a ELIMFILTERS localmente, com responsabilidades territoriais claras e um plano comercial de longo prazo.'],['Economia de volume direto da fábrica','Modelo atacadista para compras comerciais, reposição recorrente e custo competitivo.'],['Suporte comercial','Inteligência de produto, ferramentas de referência cruzada, materiais de vendas e recursos digitais.'],['Plataforma técnica','Acesso ao conhecimento técnico ELIMFILTERS, suporte de aplicação e conteúdo de engenharia.'],['Desenvolva sua rede local','Construa revendedores, oficinas, frotas e contas industriais enquanto a ELIMFILTERS apoia a relação com o distribuidor.'],['Parceria de longo prazo','Buscamos empresas que queiram construir uma posição duradoura no mercado.']], fitTag:'Quem queremos conhecer', fitTitle:'Empresas locais sólidas com capacidade de crescer.', fitIntro:'Você não precisa conhecer tudo sobre ELIMFILTERS antes de falar conosco. O importante é conhecer seu mercado e ter capacidade de desenvolver distribuição profissional.', fit:['Presença comercial local estabelecida','Capacidade de importar, armazenar e financiar estoque','Acesso a canais automotivos, pesados ou industriais','Capacidade de compra e reposição em volume comercial','Equipe comercial capaz de desenvolver o território','Compromisso de longo prazo com ELIMFILTERS'], inviteTag:'Comece a conversa', inviteTitle:'A ELIMFILTERS pode ser a próxima plataforma de crescimento da sua empresa?', inviteBody:'Conte quem você é, onde opera e como alcança seu mercado. Avaliamos cada candidatura individualmente para selecionar os parceiros certos para cada mercado.', apply:'Preencher candidatura de distribuidor', email:'Escrever para a equipe de distribuição', otherTag:'Já precisa de ajuda?', otherTitle:'Contatos comerciais e técnicos', commercial:'Consultas comerciais', commercialBody:'Para compradores, frotas, importadores e empresas avaliando produtos ou oportunidades comerciais.', technical:'Suporte técnico', technicalBody:'Para aplicações, validação de referências OEM, especificações e suporte técnico.'
  },
  fr: null, it: null, nl: null, ru: null, zh: null, ja: null, ar: null, fa: null,
} as const;

type Locale = keyof typeof COPY;
type EnglishCopy = typeof COPY.en;

const schemaContact = {
  '@context':'https://schema.org','@type':'ContactPage','@id':'https://elimfilters.com/contact/#contact-page',
  name:'Contact ELIMFILTERS',url:'https://elimfilters.com/contact/',
  description:'Contact ELIMFILTERS for distributor opportunities, commercial inquiries and technical support.',
  isPartOf:{'@id':'https://elimfilters.com/#website'},
};

export default function ContactPage() {
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0] as Locale;
  const copy: EnglishCopy = (COPY[locale] || COPY.en) as EnglishCopy;

  return (
    <main className="contact-recruit">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schemaContact)}} />
      <PageHeader currentPage="Contact" />
      <style>{`
        .contact-recruit{background:#050505;color:#fff;min-height:100vh;font-family:Barlow,Arial,sans-serif}.cr-wrap{max-width:1180px;margin:0 auto;padding-left:clamp(20px,5vw,32px);padding-right:clamp(20px,5vw,32px)}.cr-kicker{color:#FFF12D;font:700 .72rem/1.2 'Chakra Petch',Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;margin:0 0 16px}.cr-hero{position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08)}.cr-hero:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.93),rgba(0,0,0,.72) 62%,rgba(0,0,0,.35)),url('/images/contacto-papa.avif') center/cover no-repeat}.cr-hero .cr-wrap{position:relative;z-index:1;padding-top:96px;padding-bottom:88px}.cr-hero h1{font:700 clamp(3rem,7vw,6.6rem)/.9 'Chakra Petch',Arial,sans-serif;letter-spacing:-.05em;text-transform:uppercase;max-width:920px;margin:0 0 24px}.cr-hero h1 span{color:#FFF12D}.cr-lead{max-width:820px;color:rgba(255,255,255,.78);font-size:clamp(1.05rem,2vw,1.28rem);line-height:1.68;margin:0 0 30px}.cr-actions{display:flex;gap:12px;flex-wrap:wrap}.cr-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;text-decoration:none;font:700 .75rem 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;border:1px solid rgba(255,255,255,.18);color:#fff}.cr-btn--primary{background:#FFF12D;color:#050505;border-color:#FFF12D}.cr-section{padding-top:72px;padding-bottom:72px;border-bottom:1px solid rgba(255,255,255,.07)}.cr-heading{max-width:900px;font:700 clamp(2.1rem,4.6vw,4.2rem)/.95 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;margin:0 0 18px}.cr-copy{max-width:800px;color:rgba(255,255,255,.65);font-size:1.05rem;line-height:1.7;margin:0}.cr-benefits{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:38px}.cr-benefit{background:#0a0a0a;border:1px solid rgba(255,255,255,.09);padding:26px}.cr-benefit h3{font:700 1.18rem/1.1 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;margin:0 0 12px}.cr-benefit p{color:rgba(255,255,255,.6);line-height:1.62;margin:0}.cr-fit{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:56px;align-items:start}.cr-list{display:grid;gap:0}.cr-list div{padding:15px 0;border-bottom:1px solid rgba(255,255,255,.08);display:flex;gap:12px;line-height:1.55;color:rgba(255,255,255,.76)}.cr-list strong{color:#FFF12D}.cr-invite{background:linear-gradient(135deg,#111,#070707)}.cr-invite-box{border:1px solid rgba(255,241,45,.3);padding:clamp(30px,5vw,56px)}.cr-secondary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:36px}.cr-secondary article{background:#090909;border:1px solid rgba(255,255,255,.09);padding:26px}.cr-secondary h3{font:700 1.2rem 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;margin:0 0 12px}.cr-secondary p{color:rgba(255,255,255,.6);line-height:1.62;margin:0 0 20px}@media(max-width:900px){.cr-benefits{grid-template-columns:1fr}.cr-fit{grid-template-columns:1fr}.cr-secondary{grid-template-columns:1fr}.cr-hero .cr-wrap{padding-top:72px;padding-bottom:64px}}
      `}</style>

      <section className="cr-hero">
        <div className="cr-wrap">
          <p className="cr-kicker">{copy.eyebrow}</p>
          <h1>{copy.title.split('ELIMFILTERS')[0]}<span>ELIMFILTERS</span>{copy.title.split('ELIMFILTERS')[1]}</h1>
          <p className="cr-lead">{copy.intro}</p>
          <div className="cr-actions">
            <Link className="cr-btn cr-btn--primary" href="/distributor-application/">{copy.primaryCta}</Link>
            <a className="cr-btn" href="mailto:distribution_network@elimfilters.com?subject=Distributor%20Network%20Inquiry">{copy.secondaryCta}</a>
          </div>
        </div>
      </section>

      <section className="cr-section">
        <div className="cr-wrap">
          <p className="cr-kicker">{copy.whyTag}</p>
          <h2 className="cr-heading">{copy.whyTitle}</h2>
          <p className="cr-copy">{copy.whyIntro}</p>
          <div className="cr-benefits">{copy.benefits.map(([title,body])=><article className="cr-benefit" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section className="cr-section">
        <div className="cr-wrap cr-fit">
          <div><p className="cr-kicker">{copy.fitTag}</p><h2 className="cr-heading">{copy.fitTitle}</h2><p className="cr-copy">{copy.fitIntro}</p></div>
          <div className="cr-list">{copy.fit.map(item=><div key={item}><strong>✓</strong><span>{item}</span></div>)}</div>
        </div>
      </section>

      <section className="cr-section cr-invite">
        <div className="cr-wrap"><div className="cr-invite-box">
          <p className="cr-kicker">{copy.inviteTag}</p><h2 className="cr-heading">{copy.inviteTitle}</h2><p className="cr-copy">{copy.inviteBody}</p>
          <div className="cr-actions" style={{marginTop:28}}><Link className="cr-btn cr-btn--primary" href="/distributor-application/">{copy.apply}</Link><a className="cr-btn" href="mailto:distribution_network@elimfilters.com?subject=Distributor%20Network%20Inquiry">{copy.email}</a></div>
        </div></div>
      </section>

      <section className="cr-section">
        <div className="cr-wrap">
          <p className="cr-kicker">{copy.otherTag}</p><h2 className="cr-heading">{copy.otherTitle}</h2>
          <div className="cr-secondary">
            <article><h3>{copy.commercial}</h3><p>{copy.commercialBody}</p><ContactEmailActions email="info@elimfilters.com" subject="Commercial Inquiry - ELIMFILTERS" /></article>
            <article><h3>{copy.technical}</h3><p>{copy.technicalBody}</p><ContactEmailActions email="support@elimfilters.com" subject="Technical Support Request" /></article>
          </div>
        </div>
      </section>
    </main>
  );
}
