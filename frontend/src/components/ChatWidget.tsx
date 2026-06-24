'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SUPPORT_EMAIL = 'support@elimfilters.com';
const PART_SEARCH_BASE = 'https://part-search.elimfilters.com';

// ── i18n ─────────────────────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
  welcome: {
    es: '¿En qué puedo ayudarte hoy?',
    en: 'How can I help you today?',
    pt: 'Como posso ajudá-lo hoje?',
    fr: 'Comment puis-je vous aider aujourd\'hui?',
    it: 'Come posso aiutarti oggi?',
    nl: 'Hoe kan ik u vandaag helpen?',
    ru: 'Чем могу помочь сегодня?',
    zh: '今天我能帮您什么？',
    de: 'Wie kann ich Ihnen heute helfen?',
    ar: 'كيف يمكنني مساعدتك اليوم؟',
  },
  placeholder: {
    es: 'Escribe tu consulta o número de parte…',
    en: 'Type your question or part number…',
    pt: 'Digite sua dúvida ou número da peça…',
    fr: 'Écrivez votre question ou référence…',
    it: 'Scrivi la tua domanda o codice parte…',
    de: 'Frage oder Teilenummer eingeben…',
    nl: 'Typ uw vraag of onderdeelnummer…',
    ru: 'Напишите вопрос или номер детали…',
    zh: '输入问题或零件编号…',
    ar: 'اكتب سؤالك أو رقم القطعة…',
  },
  redirect_part: {
    es: 'Buscando',
    en: 'Searching for',
    pt: 'Buscando',
    fr: 'Recherche de',
    it: 'Ricerca di',
    de: 'Suche nach',
    nl: 'Zoeken naar',
    ru: 'Поиск',
    zh: '搜索',
    ar: 'البحث عن',
  },
  redirect_dist: {
    es: 'Te redirigimos al formulario de distribuidores ELIMFILTERS.',
    en: 'Redirecting you to the ELIMFILTERS distributor application form.',
    pt: 'Redirecionando para o formulário de distribuidores ELIMFILTERS.',
    fr: 'Redirection vers le formulaire distributeur ELIMFILTERS.',
    it: 'Reindirizzamento al modulo distributore ELIMFILTERS.',
    de: 'Weiterleitung zum ELIMFILTERS Distributor-Formular.',
    nl: 'Doorverwijzing naar het ELIMFILTERS distributeurformulier.',
    ru: 'Перенаправляю на форму дистрибьютора ELIMFILTERS.',
    zh: '正在跳转到ELIMFILTERS经销商申请表。',
    ar: 'إعادة التوجيه إلى نموذج موزع ELIMFILTERS.',
  },
  escalated: {
    es: 'Tu consulta fue recibida. Nuestro equipo técnico te responderá en menos de 24 horas.\n\n📧 ' + SUPPORT_EMAIL,
    en: 'Your inquiry was received. Our technical team will respond within 24 hours.\n\n📧 ' + SUPPORT_EMAIL,
    pt: 'Sua consulta foi recebida. Nossa equipe técnica responderá em 24 horas.\n\n📧 ' + SUPPORT_EMAIL,
    fr: 'Votre demande a été reçue. Notre équipe technique répondra dans les 24 heures.\n\n📧 ' + SUPPORT_EMAIL,
    it: 'La tua richiesta è stata ricevuta. Il nostro team tecnico risponderà entro 24 ore.\n\n📧 ' + SUPPORT_EMAIL,
    de: 'Ihre Anfrage wurde erhalten. Unser technisches Team antwortet innerhalb von 24 Stunden.\n\n📧 ' + SUPPORT_EMAIL,
    nl: 'Uw vraag is ontvangen. Ons technisch team reageert binnen 24 uur.\n\n📧 ' + SUPPORT_EMAIL,
    ru: 'Ваш запрос получен. Наша техническая команда ответит в течение 24 часов.\n\n📧 ' + SUPPORT_EMAIL,
    zh: '您的咨询已收到。我们的技术团队将在24小时内回复。\n\n📧 ' + SUPPORT_EMAIL,
    ar: 'تم استلام استفسارك. سيرد فريقنا التقني خلال 24 ساعة.\n\n📧 ' + SUPPORT_EMAIL,
  },
  error_send: {
    es: 'Error al enviar. Escríbenos directamente a ' + SUPPORT_EMAIL,
    en: 'Failed to send. Please write to us at ' + SUPPORT_EMAIL,
    pt: 'Falha ao enviar. Escreva-nos em ' + SUPPORT_EMAIL,
    fr: 'Échec de l\'envoi. Écrivez-nous à ' + SUPPORT_EMAIL,
    it: 'Invio fallito. Scrivici a ' + SUPPORT_EMAIL,
    de: 'Senden fehlgeschlagen. Schreiben Sie uns: ' + SUPPORT_EMAIL,
    nl: 'Verzenden mislukt. Schrijf ons op ' + SUPPORT_EMAIL,
    ru: 'Ошибка отправки. Напишите нам: ' + SUPPORT_EMAIL,
    zh: '发送失败。请直接写信至 ' + SUPPORT_EMAIL,
    ar: 'فشل الإرسال. اكتب إلينا على ' + SUPPORT_EMAIL,
  },
};

function t(key: string, lang: string): string {
  return T[key]?.[lang] || T[key]?.en || key;
}

function getLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const l = navigator.language?.slice(0, 2).toLowerCase();
  return T.welcome[l] ? l : 'en';
}

function genSessionId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Part number: 5-20 alphanumeric chars, may contain dashes (e.g. EF-AF-1234, P550039, LF16035)
const PART_RE = /^[A-Z0-9][A-Z0-9\-]{3,19}$/i;

// Distributor intent keywords per language
const DIST_KEYWORDS: Record<string, string[]> = {
  en: ['distributor', 'dealer', 'reseller', 'wholesale', 'distribute'],
  es: ['distribuidor', 'revendedor', 'mayorista', 'distribuir', 'dealer'],
  pt: ['distribuidor', 'revendedor', 'atacado', 'distribuir'],
  fr: ['distributeur', 'revendeur', 'grossiste', 'distribuer'],
  it: ['distributore', 'rivenditore', 'grossista', 'distribuire'],
  de: ['distributor', 'händler', 'großhändler', 'verteilen'],
  nl: ['distributeur', 'dealer', 'groothandel', 'verdelen'],
  ru: ['дистрибьютор', 'дилер', 'оптовик', 'распространять'],
  zh: ['经销商', '分销商', '批发'],
  ar: ['موزع', 'تاجر', 'بالجملة'],
};

function detectIntent(text: string, lang: string): 'part' | 'dist' | 'tech' {
  const clean = text.trim().replace(/\s+/g, ' ');

  // Single token that looks like a part number
  if (/^\S+$/.test(clean) && PART_RE.test(clean)) return 'part';

  // Distributor keywords
  const distWords = [
    ...(DIST_KEYWORDS[lang] || []),
    ...DIST_KEYWORDS.en,
  ];
  const lower = clean.toLowerCase();
  if (distWords.some(w => lower.includes(w))) return 'dist';

  return 'tech';
}

interface Msg { role: 'user' | 'assistant'; text: string; }

async function escalate(sessionId: string, lang: string, history: Msg[]) {
  const transcript = history
    .map(m => `${m.role === 'user' ? 'CLIENT' : 'BOT'}: ${m.text}`)
    .join('\n\n');
  await fetch(`${PART_SEARCH_BASE}/api/ai/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, lang, transcript }),
  });
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionId] = useState(genSessionId);
  const [lang] = useState(getLang);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (open && !started) {
      setMessages([{ role: 'assistant', text: t('welcome', lang) }]);
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, started, lang]);

  const addMsg = (msg: Msg) => setMessages(prev => [...prev, msg]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || done) return;
    setInput('');
    addMsg({ role: 'user', text });

    const intent = detectIntent(text, lang);

    if (intent === 'part') {
      addMsg({ role: 'assistant', text: `${t('redirect_part', lang)} "${text.toUpperCase()}"…` });
      setDone(true);
      setTimeout(() => window.open(`${PART_SEARCH_BASE}?q=${encodeURIComponent(text)}`, '_blank'), 900);
      return;
    }

    if (intent === 'dist') {
      addMsg({ role: 'assistant', text: t('redirect_dist', lang) });
      setDone(true);
      setTimeout(() => window.open('/dealer', '_blank'), 1000);
      return;
    }

    // Technical / general — escalate to human team
    setSending(true);
    try {
      await escalate(sessionId, lang, [
        ...messages,
        { role: 'user', text },
      ]);
      addMsg({ role: 'assistant', text: t('escalated', lang) });
      setDone(true);
    } catch {
      addMsg({ role: 'assistant', text: t('error_send', lang) });
    } finally {
      setSending(false);
    }
  };

  const isRTL = ['ar', 'fa'].includes(lang);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem',
              width: '56px', height: '56px',
              background: '#FFF12D', border: 'none', borderRadius: '4px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, boxShadow: '0 4px 20px rgba(255,241,45,0.35)',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Chat with ELIMFILTERS"
          >
            <img src="/assets/elimfilters-e.png" alt="ELIMFILTERS" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem',
              width: '300px', maxWidth: 'calc(100vw - 2rem)',
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px', display: 'flex', flexDirection: 'column',
              zIndex: 9999, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              background: '#FFF12D', padding: '0.6rem 0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src="/assets/elimfilters-e.png" alt="ELIMFILTERS" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>ELIMFILTERS</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', lineHeight: 1 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                >
                  <div style={{
                    background: m.role === 'user' ? '#FFF12D' : 'rgba(255,255,255,0.07)',
                    color: m.role === 'user' ? '#000' : '#fff',
                    borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    padding: '0.5rem 0.75rem', fontSize: '0.8rem', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif',
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {sending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px 12px 12px 2px', padding: '0.65rem 0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF12D' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!done && (
              <div style={{ padding: '0.5rem 0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.4rem', flexShrink: 0, background: '#0a0a0a' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={t('placeholder', lang)}
                  rows={1}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                    padding: '0.6rem 0.75rem', outline: 'none', resize: 'none', lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  style={{
                    background: sending || !input.trim() ? 'rgba(255,241,45,0.3)' : '#FFF12D',
                    border: 'none', borderRadius: '4px', width: '40px',
                    cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="#000"/>
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
