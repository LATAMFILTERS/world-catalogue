'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ContactEmailActionsProps = {
  email: string;
  subject: string;
  emailLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
};

type ActionLabels = {
  email: string;
  copy: string;
  copied: string;
};

const ACTION_LABELS: Record<string, ActionLabels> = {
  en: { email: 'Send email', copy: 'Copy address', copied: 'Address copied' },
  es: { email: 'Enviar correo', copy: 'Copiar dirección', copied: 'Dirección copiada' },
  pt: { email: 'Enviar e-mail', copy: 'Copiar endereço', copied: 'Endereço copiado' },
  fr: { email: 'Envoyer un e-mail', copy: 'Copier l’adresse', copied: 'Adresse copiée' },
  it: { email: 'Invia e-mail', copy: 'Copia indirizzo', copied: 'Indirizzo copiato' },
  nl: { email: 'E-mail verzenden', copy: 'Adres kopiëren', copied: 'Adres gekopieerd' },
  ru: { email: 'Отправить письмо', copy: 'Копировать адрес', copied: 'Адрес скопирован' },
  zh: { email: '发送邮件', copy: '复制地址', copied: '地址已复制' },
  ja: { email: 'メールを送信', copy: 'アドレスをコピー', copied: 'アドレスをコピーしました' },
  ar: { email: 'إرسال بريد إلكتروني', copy: 'نسخ العنوان', copied: 'تم نسخ العنوان' },
  fa: { email: 'ارسال ایمیل', copy: 'کپی نشانی', copied: 'نشانی کپی شد' },
};

export default function ContactEmailActions({ email, subject }: ContactEmailActionsProps) {
  const { i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const language = i18n.resolvedLanguage?.slice(0, 2) || i18n.language?.slice(0, 2) || 'en';
  const labels = ACTION_LABELS[language] || ACTION_LABELS.en;
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(`${labels.copy}:`, email);
    }
  };

  const actionStyle = {
    border: '1px solid rgba(255,241,45,0.5)',
    padding: '0.72rem 0.9rem',
    color: '#FFF12D',
    background: 'rgba(255,241,45,0.06)',
    textDecoration: 'none',
    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  };

  return (
    <div style={{ marginTop: 'auto' }}>
      <a
        href={mailtoHref}
        style={{
          color: '#FFF12D',
          fontFamily: 'Chakra Petch, Arial Narrow, monospace',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          overflowWrap: 'anywhere',
        }}
      >
        {email}
      </a>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '1rem' }}>
        <a href={mailtoHref} style={actionStyle}>
          {labels.email}
        </a>
        <button type="button" onClick={copyEmail} style={actionStyle} aria-live="polite">
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
    </div>
  );
}
