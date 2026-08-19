'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useConsent } from '@/lib/useConsent';

const COPY: Record<string, { aria: string; text: string; cookie: string; and: string; privacy: string; decline: string; accept: string }> = {
  en: { aria: 'Cookie and analytics consent', text: 'We use optional analytics providers, including GA4, PostHog, and Microsoft Clarity, to understand platform usage and improve our services. We do not sell personal information. See our', cookie: 'Cookie Policy', and: 'and', privacy: 'Privacy Policy', decline: 'DECLINE', accept: 'ACCEPT' },
  es: { aria: 'Consentimiento de cookies y analítica', text: 'Usamos proveedores de analítica opcionales, incluidos GA4, PostHog y Microsoft Clarity, para comprender el uso de la plataforma y mejorar nuestros servicios. No vendemos información personal. Consulte nuestra', cookie: 'Política de Cookies', and: 'y nuestra', privacy: 'Política de Privacidad', decline: 'RECHAZAR', accept: 'ACEPTAR' },
  pt: { aria: 'Consentimento de cookies e analytics', text: 'Usamos provedores opcionais de analytics, incluindo GA4, PostHog e Microsoft Clarity, para entender o uso da plataforma e melhorar nossos serviços. Não vendemos informações pessoais. Consulte nossa', cookie: 'Política de Cookies', and: 'e nossa', privacy: 'Política de Privacidade', decline: 'RECUSAR', accept: 'ACEITAR' },
  fr: { aria: 'Consentement cookies et analyse', text: 'Nous utilisons des services d\'analyse facultatifs, notamment GA4, PostHog et Microsoft Clarity, afin de comprendre l\'utilisation de la plateforme et d\'améliorer nos services. Nous ne vendons pas de données personnelles. Consultez notre', cookie: 'Politique relative aux cookies', and: 'et notre', privacy: 'Politique de confidentialité', decline: 'REFUSER', accept: 'ACCEPTER' },
  it: { aria: 'Consenso cookie e analisi', text: 'Utilizziamo servizi di analisi opzionali, tra cui GA4, PostHog e Microsoft Clarity, per comprendere l\'uso della piattaforma e migliorare i nostri servizi. Non vendiamo informazioni personali. Consulta la nostra', cookie: 'Informativa sui Cookie', and: 'e la nostra', privacy: 'Informativa sulla Privacy', decline: 'RIFIUTA', accept: 'ACCETTA' },
  nl: { aria: 'Toestemming voor cookies en analyse', text: 'We gebruiken optionele analysediensten, waaronder GA4, PostHog en Microsoft Clarity, om platformgebruik te begrijpen en onze diensten te verbeteren. We verkopen geen persoonsgegevens. Bekijk ons', cookie: 'Cookiebeleid', and: 'en ons', privacy: 'Privacybeleid', decline: 'WEIGEREN', accept: 'ACCEPTEREN' },
  ru: { aria: 'Согласие на cookies и аналитику', text: 'Мы используем необязательные сервисы аналитики, включая GA4, PostHog и Microsoft Clarity, чтобы понимать использование платформы и улучшать наши услуги. Мы не продаём персональные данные. Ознакомьтесь с нашей', cookie: 'Политикой cookies', and: 'и', privacy: 'Политикой конфиденциальности', decline: 'ОТКЛОНИТЬ', accept: 'ПРИНЯТЬ' },
  zh: { aria: 'Cookie 与分析同意', text: '我们使用可选的分析服务，包括 GA4、PostHog 和 Microsoft Clarity，以了解平台使用情况并改进服务。我们不出售个人信息。请查看我们的', cookie: 'Cookie 政策', and: '和', privacy: '隐私政策', decline: '拒绝', accept: '接受' },
  ja: { aria: 'Cookie と分析の同意', text: '当社は、GA4、PostHog、Microsoft Clarity などの任意の分析サービスを使用し、プラットフォームの利用状況を把握してサービス改善に役立てています。個人情報を販売することはありません。', cookie: 'Cookieポリシー', and: 'および', privacy: 'プライバシーポリシー', decline: '拒否', accept: '同意' },
  ar: { aria: 'الموافقة على ملفات تعريف الارتباط والتحليلات', text: 'نستخدم خدمات تحليل اختيارية، بما في ذلك GA4 وPostHog وMicrosoft Clarity، لفهم استخدام المنصة وتحسين خدماتنا. نحن لا نبيع المعلومات الشخصية. راجع', cookie: 'سياسة ملفات تعريف الارتباط', and: 'و', privacy: 'سياسة الخصوصية', decline: 'رفض', accept: 'قبول' },
  fa: { aria: 'رضایت برای کوکی و تحلیل', text: 'ما از سرویس‌های تحلیلی اختیاری، از جمله GA4، PostHog و Microsoft Clarity، برای درک نحوه استفاده از پلتفرم و بهبود خدمات استفاده می‌کنیم. اطلاعات شخصی را نمی‌فروشیم. لطفاً', cookie: 'سیاست کوکی‌ها', and: 'و', privacy: 'سیاست حریم خصوصی', decline: 'رد', accept: 'پذیرفتن' },
};

export default function ConsentBanner() {
  const { consent, accept, decline } = useConsent();
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);
  const copy = COPY[language] || COPY.en;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AnimatePresence>
      {mounted && consent === 'pending' && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label={copy.aria}
          aria-live="polite"
          style={{ position: 'fixed', bottom: 'calc(1.25rem + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 9000, width: 'min(680px, calc(100vw - 2rem))', maxWidth: 'calc(100vw - 2rem)', background: 'rgba(10,10,10,0.97)', border: '1px solid rgba(255,241,45,0.2)', borderRadius: '6px', padding: '1.25rem 1.5rem', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <p style={{ flex: 1, minWidth: '220px', fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {copy.text}{' '}
            <Link href="/legal/cookies" style={{ color: '#FFF12D', textDecoration: 'underline' }}>{copy.cookie}</Link>
            {' '}{copy.and}{' '}
            <Link href="/legal/privacy" style={{ color: '#FFF12D', textDecoration: 'underline' }}>{copy.privacy}</Link>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <button onClick={decline} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
              {copy.decline}
            </button>
            <button onClick={accept} style={{ padding: '0.5rem 1.25rem', background: '#FFF12D', border: 'none', borderRadius: '4px', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>
              {copy.accept}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
