'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';
import ContactEmailActions from './ContactEmailActions';

const EMAIL_CHANNELS = [
  { email: 'info@elimfilters.com', subject: 'Commercial Inquiry - ELIMFILTERS', labelKey: 'contact.channel1Label', titleKey: 'contact.channel1Title', descKey: 'contact.channel1Desc' },
  { email: 'distribution_network@elimfilters.com', subject: 'Distributor Network Inquiry', labelKey: 'contact.channel2Label', titleKey: 'contact.channel2Title', descKey: 'contact.channel2Desc' },
  { email: 'support@elimfilters.com', subject: 'Technical Support Request', labelKey: 'contact.channel3Label', titleKey: 'contact.channel3Title', descKey: 'contact.channel3Desc' },
] as const;

const PRIORITY_KEYS = ['contact.priority1','contact.priority2','contact.priority3','contact.priority4','contact.priority5','contact.priority6'] as const;
const SECTOR_KEYS = ['contact.sector1','contact.sector2','contact.sector3','contact.sector4','contact.sector5','contact.sector6','contact.sector7','contact.sector8'] as const;

const STRUCTURE = {
  en: { routingTag: 'How we can help', routingTitle: 'Direct your request to the right team', sectorsTag: 'Application coverage', sectorsTitle: 'Industrial sectors we support', finalTitle: 'Need application support?', finalDescription: 'Send the part number, equipment make, model and operating context. Our team will route the request to the appropriate commercial or technical channel.', finalCta1: 'Distributor application', finalCta2: 'Knowledge Center' },
  es: { routingTag: 'Cómo podemos ayudar', routingTitle: 'Dirige tu solicitud al equipo correcto', sectorsTag: 'Cobertura de aplicaciones', sectorsTitle: 'Sectores industriales que atendemos', finalTitle: '¿Necesitas soporte de aplicación?', finalDescription: 'Envíanos el número de parte, marca, modelo del equipo y contexto de operación. Nuestro equipo dirigirá la solicitud al canal comercial o técnico correspondiente.', finalCta1: 'Solicitud de distribuidor', finalCta2: 'Centro de Conocimiento' },
  pt: { routingTag: 'Como podemos ajudar', routingTitle: 'Direcione sua solicitação à equipe certa', sectorsTag: 'Cobertura de aplicações', sectorsTitle: 'Setores industriais atendidos', finalTitle: 'Precisa de suporte de aplicação?', finalDescription: 'Envie o número da peça, fabricante, modelo do equipamento e contexto operacional. Nossa equipe encaminhará a solicitação ao canal comercial ou técnico adequado.', finalCta1: 'Solicitação de distribuidor', finalCta2: 'Centro de Conhecimento' },
  fr: { routingTag: 'Comment nous pouvons aider', routingTitle: 'Adressez votre demande à la bonne équipe', sectorsTag: 'Couverture des applications', sectorsTitle: 'Secteurs industriels pris en charge', finalTitle: "Besoin d’un support d’application ?", finalDescription: "Envoyez la référence, la marque, le modèle de l’équipement et le contexte d’exploitation. Notre équipe dirigera la demande vers le canal commercial ou technique approprié.", finalCta1: 'Demande distributeur', finalCta2: 'Centre de connaissances' },
  it: { routingTag: 'Come possiamo aiutare', routingTitle: 'Indirizza la richiesta al team corretto', sectorsTag: 'Copertura applicativa', sectorsTitle: 'Settori industriali supportati', finalTitle: 'Serve supporto applicativo?', finalDescription: 'Invia codice parte, marca, modello dell’attrezzatura e contesto operativo. Il nostro team indirizzerà la richiesta al canale commerciale o tecnico appropriato.', finalCta1: 'Richiesta distributore', finalCta2: 'Centro conoscenze' },
  nl: { routingTag: 'Hoe we kunnen helpen', routingTitle: 'Stuur uw aanvraag naar het juiste team', sectorsTag: 'Toepassingsdekking', sectorsTitle: 'Industriesectoren die we ondersteunen', finalTitle: 'Applicatieondersteuning nodig?', finalDescription: 'Stuur onderdeelnummer, merk, model en operationele context. Ons team leidt de aanvraag naar het juiste commerciële of technische kanaal.', finalCta1: 'Distributeursaanvraag', finalCta2: 'Kenniscentrum' },
  ru: { routingTag: 'Как мы можем помочь', routingTitle: 'Направьте запрос нужной команде', sectorsTag: 'Области применения', sectorsTitle: 'Промышленные отрасли, которые мы поддерживаем', finalTitle: 'Нужна поддержка по применению?', finalDescription: 'Отправьте номер детали, марку, модель оборудования и условия эксплуатации. Наша команда направит запрос в соответствующий коммерческий или технический канал.', finalCta1: 'Заявка дистрибьютора', finalCta2: 'Центр знаний' },
  zh: { routingTag: '我们如何提供帮助', routingTitle: '将您的请求发送给正确的团队', sectorsTag: '应用覆盖', sectorsTitle: '我们支持的工业领域', finalTitle: '需要应用支持？', finalDescription: '请发送零件号、设备品牌、型号和运行环境。我们的团队会将请求转给相应的商务或技术渠道。', finalCta1: '经销商申请', finalCta2: '知识中心' },
  ja: { routingTag: 'サポート内容', routingTitle: '適切なチームへお問い合わせください', sectorsTag: 'アプリケーション範囲', sectorsTitle: '対応する産業分野', finalTitle: 'アプリケーションサポートが必要ですか？', finalDescription: '部品番号、機器メーカー、モデル、運用条件をお送りください。適切な営業または技術窓口へご案内します。', finalCta1: '販売代理店申請', finalCta2: 'ナレッジセンター' },
  ar: { routingTag: 'كيف يمكننا المساعدة', routingTitle: 'وجّه طلبك إلى الفريق المناسب', sectorsTag: 'نطاق التطبيقات', sectorsTitle: 'القطاعات الصناعية التي ندعمها', finalTitle: 'هل تحتاج إلى دعم للتطبيق؟', finalDescription: 'أرسل رقم القطعة والشركة المصنعة وطراز المعدة وسياق التشغيل. سيقوم فريقنا بتوجيه الطلب إلى القناة التجارية أو الفنية المناسبة.', finalCta1: 'طلب موزع', finalCta2: 'مركز المعرفة' },
  fa: { routingTag: 'چگونه می‌توانیم کمک کنیم', routingTitle: 'درخواست خود را به تیم مناسب هدایت کنید', sectorsTag: 'پوشش کاربردها', sectorsTitle: 'صنایع تحت پوشش', finalTitle: 'به پشتیبانی کاربرد نیاز دارید؟', finalDescription: 'شماره قطعه، سازنده، مدل تجهیز و شرایط عملیاتی را ارسال کنید. تیم ما درخواست را به کانال تجاری یا فنی مناسب هدایت می‌کند.', finalCta1: 'درخواست توزیع‌کننده', finalCta2: 'مرکز دانش' },
} as const;

const schemaContact = {
  '@context': 'https://schema.org', '@type': 'ContactPage', '@id': 'https://elimfilters.com/contact/#contact-page',
  name: 'Contact ELIMFILTERS', url: 'https://elimfilters.com/contact/',
  description: 'Contact ELIMFILTERS for industrial filtration, asset protection, authorized distributor opportunities, OEM cross-reference support and technical inquiries.',
  isPartOf: { '@id': 'https://elimfilters.com/#website' },
  mainEntity: {
    '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com/', email: 'info@elimfilters.com',
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'Commercial inquiries', email: 'info@elimfilters.com', availableLanguage: ['English','Spanish'] },
      { '@type': 'ContactPoint', contactType: 'Technical support', email: 'support@elimfilters.com', availableLanguage: ['English','Spanish'] },
      { '@type': 'ContactPoint', contactType: 'Authorized distributor network', email: 'distribution_network@elimfilters.com', availableLanguage: ['English','Spanish'] },
    ],
  },
};

const schemaBreadcrumb = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://elimfilters.com/contact/' },
  ],
};

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0] as keyof typeof STRUCTURE;
  const copy = STRUCTURE[language] || STRUCTURE.en;

  return (
    <main className="contact-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContact) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      <style>{`
        .contact-page{background:#050505;color:#fff;min-height:100vh;font-family:Barlow,Arial,sans-serif}
        .contact-wrap{max-width:1180px;margin:0 auto;padding-left:clamp(20px,5vw,32px);padding-right:clamp(20px,5vw,32px)}
        .contact-kicker{color:#FFF12D;font:700 .72rem/1.2 'Chakra Petch',Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;margin:0 0 14px}
        .contact-hero{position:relative;border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden}
        .contact-hero:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.90),rgba(0,0,0,.72) 58%,rgba(0,0,0,.38)),url('/images/contacto-papa.avif') center/cover no-repeat;opacity:.92}
        .contact-hero .contact-wrap{position:relative;z-index:1;padding-top:88px;padding-bottom:72px}
        .contact-hero h1{font:700 clamp(2.7rem,6vw,5.7rem)/.94 'Chakra Petch',Arial,sans-serif;letter-spacing:-.045em;text-transform:uppercase;max-width:850px;margin:0 0 22px}
        .contact-hero h1 span{color:#FFF12D;display:block}
        .contact-intro{max-width:760px;color:rgba(255,255,255,.74);font-size:clamp(1rem,1.8vw,1.18rem);line-height:1.65;margin:0}
        .contact-channels{padding-top:56px;padding-bottom:64px}
        .contact-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .contact-card{display:flex;flex-direction:column;background:#0a0a0a;border:1px solid rgba(255,255,255,.10);padding:26px;min-height:320px}
        .contact-card h2{font:700 1.35rem/1.05 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;margin:0 0 14px}
        .contact-card p{color:rgba(255,255,255,.62);line-height:1.62;margin:0 0 18px}
        .contact-card .contact-actions{margin-top:auto}
        .contact-section{padding-top:64px;padding-bottom:64px;border-top:1px solid rgba(255,255,255,.07)}
        .contact-section-head{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:48px;align-items:start;margin-bottom:34px}
        .contact-section h2{font:700 clamp(2rem,4vw,3.7rem)/.96 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;margin:0;max-width:650px}
        .contact-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
        .contact-list-item{border-top:2px solid #FFF12D;padding:14px 8px 6px 0;color:rgba(255,255,255,.72);line-height:1.5}
        .contact-list-item span{display:block;color:rgba(255,255,255,.28);font:600 .68rem 'Chakra Petch',Arial,sans-serif;margin-bottom:8px}
        .contact-sectors{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.08);gap:1px}
        .contact-sector{background:#090909;padding:20px;min-height:104px}
        .contact-sector span{display:block;color:#FFF12D;font:600 .68rem 'Chakra Petch',Arial,sans-serif;margin-bottom:12px}
        .contact-sector p{margin:0;color:rgba(255,255,255,.74)}
        .contact-final{padding-top:72px;padding-bottom:80px;border-top:1px solid rgba(255,255,255,.08)}
        .contact-final-box{display:grid;grid-template-columns:1.2fr .8fr;gap:40px;align-items:end;background:linear-gradient(135deg,#101010,#080808);border:1px solid rgba(255,241,45,.28);padding:clamp(28px,5vw,52px)}
        .contact-final h2{font:700 clamp(2rem,4vw,3.6rem)/.96 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;margin:0 0 16px}
        .contact-final p{color:rgba(255,255,255,.65);line-height:1.65;max-width:700px;margin:0}
        .contact-cta{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
        .contact-cta a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border:1px solid rgba(255,255,255,.18);color:#fff;text-decoration:none;font:700 .72rem 'Chakra Petch',Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em}
        .contact-cta a:first-child{background:#FFF12D;color:#050505;border-color:#FFF12D}
        @media(max-width:900px){.contact-grid,.contact-list{grid-template-columns:1fr}.contact-sectors{grid-template-columns:repeat(2,1fr)}.contact-section-head,.contact-final-box{grid-template-columns:1fr}.contact-cta{justify-content:flex-start}}
        @media(max-width:560px){.contact-hero .contact-wrap{padding-top:64px;padding-bottom:52px}.contact-sectors{grid-template-columns:1fr}.contact-card{min-height:0}.contact-section{padding-top:48px;padding-bottom:48px}}
      `}</style>

      <PageHeader currentPage="Contact" />

      <section className="contact-hero">
        <div className="contact-wrap">
          <p className="contact-kicker">{t('contact.heroTag')}</p>
          <h1>{t('contact.heroTitle')}<span>{t('contact.heroSubtitle')}</span></h1>
          <p className="contact-intro">{t('contact.heroDescription')}</p>
        </div>
      </section>

      <section className="contact-channels contact-wrap" aria-label="Contact channels">
        <div className="contact-grid">
          {EMAIL_CHANNELS.map((channel) => (
            <article className="contact-card" key={channel.email}>
              <p className="contact-kicker">{t(channel.labelKey)}</p>
              <h2>{t(channel.titleKey)}</h2>
              <p>{t(channel.descKey)}</p>
              <div className="contact-actions">
                <ContactEmailActions email={channel.email} subject={channel.subject} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-wrap">
          <div className="contact-section-head">
            <div><p className="contact-kicker">{copy.routingTag}</p><h2>{copy.routingTitle}</h2></div>
          </div>
          <div className="contact-list">
            {PRIORITY_KEYS.map((key, index) => (
              <div className="contact-list-item" key={key}><span>{String(index + 1).padStart(2, '0')}</span>{t(key)}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-wrap">
          <div className="contact-section-head">
            <div><p className="contact-kicker">{copy.sectorsTag}</p><h2>{copy.sectorsTitle}</h2></div>
          </div>
          <div className="contact-sectors">
            {SECTOR_KEYS.map((key, index) => (
              <div className="contact-sector" key={key}><span>{String(index + 1).padStart(2, '0')}</span><p>{t(key)}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-final">
        <div className="contact-wrap">
          <div className="contact-final-box">
            <div><p className="contact-kicker">ELIMFILTERS</p><h2>{copy.finalTitle}</h2><p>{copy.finalDescription}</p></div>
            <div className="contact-cta">
              <Link href="/distributor-application/">{copy.finalCta1}</Link>
              <Link href="/knowledge-center/">{copy.finalCta2}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
