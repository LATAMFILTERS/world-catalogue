'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE = 'https://part-search.elimfilters.com';
const SUPPORT_EMAIL = 'support@elimfilters.com';
const MAX_QUESTIONS = 3;

// ── i18n strings ─────────────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
  welcome: {
    es: '¡Hola! Soy el asistente de ELIMFILTERS.\n¿Cómo puedo ayudarte?',
    en: 'Hello! I\'m the ELIMFILTERS assistant.\nHow can I help you?',
    pt: 'Olá! Sou o assistente ELIMFILTERS.\nComo posso ajudá-lo?',
    fr: 'Bonjour! Je suis l\'assistant ELIMFILTERS.\nComment puis-je vous aider?',
    it: 'Ciao! Sono l\'assistente ELIMFILTERS.\nCome posso aiutarti?',
    nl: 'Hallo! Ik ben de ELIMFILTERS assistent.\nHoe kan ik u helpen?',
    ru: 'Здравствуйте! Я ассистент ELIMFILTERS.\nЧем могу помочь?',
    zh: '您好！我是ELIMFILTERS助手。\n有什么可以帮助您的？',
    de: 'Hallo! Ich bin der ELIMFILTERS-Assistent.\nWie kann ich Ihnen helfen?',
    ar: 'مرحباً! أنا مساعد ELIMFILTERS.\nكيف يمكنني مساعدتك؟',
  },
  opt_part: {
    es: '🔍 Buscar número de parte', en: '🔍 Search part number',
    pt: '🔍 Buscar número de peça', fr: '🔍 Rechercher une référence',
    it: '🔍 Cercare codice parte', de: '🔍 Teilenummer suchen',
    nl: '🔍 Onderdeelnummer zoeken', ru: '🔍 Поиск номера детали',
    zh: '🔍 搜索零件编号', ar: '🔍 البحث عن رقم القطعة',
  },
  opt_tech: {
    es: '⚙️ Consulta técnica', en: '⚙️ Technical question',
    pt: '⚙️ Consulta técnica', fr: '⚙️ Question technique',
    it: '⚙️ Domanda tecnica', de: '⚙️ Technische Frage',
    nl: '⚙️ Technische vraag', ru: '⚙️ Технический вопрос',
    zh: '⚙️ 技术咨询', ar: '⚙️ استفسار تقني',
  },
  opt_dist: {
    es: '🤝 Quiero ser distribuidor', en: '🤝 Become a distributor',
    pt: '🤝 Quero ser distribuidor', fr: '🤝 Devenir distributeur',
    it: '🤝 Diventare distributore', de: '🤝 Distributor werden',
    nl: '🤝 Distributeur worden', ru: '🤝 Стать дистрибьютором',
    zh: '🤝 成为经销商', ar: '🤝 أريد أن أصبح موزعاً',
  },
  ask_part: {
    es: 'Escribe el número de parte y te redirijo a la búsqueda:',
    en: 'Enter the part number and I\'ll redirect you to search:',
    pt: 'Digite o número da peça e vou redirecioná-lo para a busca:',
    fr: 'Entrez la référence et je vous redirige vers la recherche:',
    it: 'Inserisci il codice parte e ti reindirizzerò alla ricerca:',
    de: 'Geben Sie die Teilenummer ein und ich leite Sie zur Suche weiter:',
    nl: 'Voer het onderdeelnummer in en ik verwijs u door naar de zoekopdracht:',
    ru: 'Введите номер детали, и я перенаправлю вас на поиск:',
    zh: '请输入零件编号，我将为您跳转到搜索页面：',
    ar: 'أدخل رقم القطعة وسأوجهك إلى البحث:',
  },
  redirecting: {
    es: '¡Perfecto! Abriendo la búsqueda para', en: 'Opening search for',
    pt: 'Abrindo busca para', fr: 'Ouverture de la recherche pour',
    it: 'Apertura della ricerca per', de: 'Suche wird geöffnet für',
    nl: 'Zoekopdracht openen voor', ru: 'Открываю поиск для',
    zh: '正在打开搜索：', ar: 'فتح البحث عن',
  },
  dist_redirect: {
    es: 'Te redirijo al formulario de distribuidores. ¡Bienvenido a la red ELIMFILTERS!',
    en: 'Redirecting you to the distributor application form. Welcome to the ELIMFILTERS network!',
    pt: 'Redirecionando para o formulário de distribuidores. Bem-vindo à rede ELIMFILTERS!',
    fr: 'Redirection vers le formulaire distributeur. Bienvenue dans le réseau ELIMFILTERS!',
    it: 'Reindirizzamento al modulo distributore. Benvenuto nella rete ELIMFILTERS!',
    de: 'Weiterleitung zum Distributor-Formular. Willkommen im ELIMFILTERS-Netzwerk!',
    nl: 'U wordt doorverwezen naar het distributeurformulier. Welkom bij het ELIMFILTERS-netwerk!',
    ru: 'Перенаправляю на форму дистрибьютора. Добро пожаловать в сеть ELIMFILTERS!',
    zh: '正在跳转到经销商申请表。欢迎加入ELIMFILTERS网络！',
    ar: 'إعادة التوجيه إلى نموذج الموزع. مرحباً بكم في شبكة ELIMFILTERS!',
  },
  ask_tech: {
    es: 'Cuéntame tu consulta técnica:',
    en: 'Tell me your technical question:',
    pt: 'Diga-me sua consulta técnica:',
    fr: 'Dites-moi votre question technique:',
    it: 'Dimmi la tua domanda tecnica:',
    de: 'Sagen Sie mir Ihre technische Frage:',
    nl: 'Vertel me uw technische vraag:',
    ru: 'Расскажите мне свой технический вопрос:',
    zh: '请告诉我您的技术问题：',
    ar: 'أخبرني باستفسارك التقني:',
  },
  limit_reached: {
    es: 'Has alcanzado el límite de 3 preguntas.\n\nTu consulta ha sido enviada a nuestro equipo técnico. Recibirás una respuesta en menos de 24 horas a través de nuestro equipo de soporte.\n\n📧 support@elimfilters.com',
    en: 'You\'ve reached the 3-question limit.\n\nYour inquiry has been sent to our technical team. You will receive a response within 24 hours from our support team.\n\n📧 support@elimfilters.com',
    pt: 'Você atingiu o limite de 3 perguntas.\n\nSua consulta foi enviada à nossa equipe técnica. Você receberá uma resposta em 24 horas.\n\n📧 support@elimfilters.com',
    fr: 'Vous avez atteint la limite de 3 questions.\n\nVotre demande a été envoyée à notre équipe technique. Vous recevrez une réponse dans les 24 heures.\n\n📧 support@elimfilters.com',
    it: 'Hai raggiunto il limite di 3 domande.\n\nLa tua richiesta è stata inviata al nostro team tecnico. Riceverai una risposta entro 24 ore.\n\n📧 support@elimfilters.com',
    de: 'Sie haben das Limit von 3 Fragen erreicht.\n\nIhre Anfrage wurde an unser technisches Team gesendet. Sie erhalten innerhalb von 24 Stunden eine Antwort.\n\n📧 support@elimfilters.com',
    nl: 'U heeft de limiet van 3 vragen bereikt.\n\nUw vraag is verzonden naar ons technisch team. U ontvangt binnen 24 uur een antwoord.\n\n📧 support@elimfilters.com',
    ru: 'Вы достигли лимита в 3 вопроса.\n\nВаш запрос отправлен нашей технической команде. Вы получите ответ в течение 24 часов.\n\n📧 support@elimfilters.com',
    zh: '您已达到3个问题的限制。\n\n您的咨询已发送至我们的技术团队。您将在24小时内收到回复。\n\n📧 support@elimfilters.com',
    ar: 'لقد وصلت إلى حد 3 أسئلة.\n\nتم إرسال استفسارك إلى فريقنا التقني. ستتلقى رداً خلال 24 ساعة.\n\n📧 support@elimfilters.com',
  },
  placeholder: {
    es: 'Escribe tu mensaje...', en: 'Type your message...',
    pt: 'Digite sua mensagem...', fr: 'Écrivez votre message...',
    it: 'Scrivi il tuo messaggio...', de: 'Schreiben Sie Ihre Nachricht...',
    nl: 'Typ uw bericht...', ru: 'Напишите ваше сообщение...',
    zh: '输入您的消息...', ar: 'اكتب رسالتك...',
  },
};

function t(key: string, lang: string): string {
  return T[key]?.[lang] || T[key]?.en || key;
}

function getLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return T.welcome[lang] ? lang : 'en';
}

function genSessionId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type Stage = 'menu' | 'part_input' | 'technical' | 'done';
interface Msg { role: 'user' | 'assistant'; text: string; isMenu?: boolean; }

// ── Send escalation email via server ─────────────────────────────────────────
async function sendEscalationEmail(sessionId: string, lang: string, history: Msg[]) {
  const transcript = history
    .filter(m => !m.isMenu)
    .map(m => `${m.role === 'user' ? 'CLIENT' : 'AI'}: ${m.text}`)
    .join('\n\n');
  try {
    await fetch(`${API_BASE}/api/ai/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, lang, transcript }),
    });
  } catch { /* silent */ }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(genSessionId);
  const [lang] = useState(getLang);
  const [stage, setStage] = useState<Stage>('menu');
  const [techCount, setTechCount] = useState(0);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !started) {
      setMessages([{ role: 'assistant', text: t('welcome', lang), isMenu: true }]);
      setStarted(true);
    }
  }, [open, started, lang]);

  const addMsg = (msg: Msg) => setMessages(prev => [...prev, msg]);

  const handleMenu = (option: 'part' | 'tech' | 'dist') => {
    if (option === 'part') {
      addMsg({ role: 'user', text: t('opt_part', lang) });
      addMsg({ role: 'assistant', text: t('ask_part', lang) });
      setStage('part_input');
    } else if (option === 'dist') {
      addMsg({ role: 'user', text: t('opt_dist', lang) });
      addMsg({ role: 'assistant', text: t('dist_redirect', lang) });
      setStage('done');
      setTimeout(() => window.open('/distributor-application', '_blank'), 1200);
    } else {
      addMsg({ role: 'user', text: t('opt_tech', lang) });
      addMsg({ role: 'assistant', text: t('ask_tech', lang) });
      setStage('technical');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handlePartInput = (text: string) => {
    addMsg({ role: 'user', text });
    const msg = `${t('redirecting', lang)} "${text}"`;
    addMsg({ role: 'assistant', text: msg });
    setStage('done');
    setTimeout(() => window.open(`https://part-search.elimfilters.com?q=${encodeURIComponent(text)}`, '_blank'), 1000);
  };

  const handleTechnical = async (text: string) => {
    const newCount = techCount + 1;
    setTechCount(newCount);
    addMsg({ role: 'user', text });
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/consult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `[Language: ${lang}] ${text}`,
          agent: 'technical',
          session_id: sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      addMsg({ role: 'assistant', text: data.answer });

      if (newCount >= MAX_QUESTIONS) {
        setTimeout(async () => {
          addMsg({ role: 'assistant', text: t('limit_reached', lang) });
          setStage('done');
          await sendEscalationEmail(sessionId, lang, [...messages, { role: 'user', text }, { role: 'assistant', text: data.answer }]);
        }, 600);
      }
    } catch {
      addMsg({ role: 'assistant', text: '⚠️ Error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading || stage === 'done' || stage === 'menu') return;
    setInput('');
    if (stage === 'part_input') handlePartInput(text);
    else if (stage === 'technical') await handleTechnical(text);
    else {
      // Fallback: if somehow input shows in wrong stage, go to menu
      setStage('menu');
    }
  };

  const isRTL = ['ar', 'fa'].includes(lang);
  const showInput = stage === 'part_input' || stage === 'technical';

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
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>ELIMFILTERS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {stage !== 'menu' && stage !== 'done' && (
                  <button
                    onClick={() => { setStage('menu'); setTechCount(0); addMsg({ role: 'assistant', text: t('welcome', lang), isMenu: true }); }}
                    style={{ background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', color: '#000', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', padding: '0.2rem 0.4rem', borderRadius: '2px' }}
                  >
                    ← menu
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', lineHeight: 1 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                >
                  <div style={{
                    background: m.role === 'user' ? '#FFF12D' : 'rgba(255,255,255,0.07)',
                    color: m.role === 'user' ? '#000' : '#fff',
                    borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    padding: '0.5rem 0.75rem', fontSize: '0.8rem', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif',
                    maxHeight: '7.5rem', overflowY: 'auto',
                  }}>
                    {m.text}
                  </div>

                  {/* Menu options — shown on last message when stage is menu */}
                  {stage === 'menu' && i === messages.length - 1 && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}
                    >
                      {(['part', 'tech', 'dist'] as const).map((opt) => (
                        <button key={opt} onClick={() => handleMenu(opt)} style={{
                          background: 'rgba(255,241,45,0.08)', border: '1px solid rgba(255,241,45,0.25)',
                          borderRadius: '6px', padding: '0.45rem 0.75rem', color: '#FFF12D',
                          fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', cursor: 'pointer',
                          textAlign: isRTL ? 'right' : 'left', transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,241,45,0.15)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,241,45,0.08)')}
                        >
                          {t(opt === 'part' ? 'opt_part' : opt === 'tech' ? 'opt_tech' : 'opt_dist', lang)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Tech question counter */}
              {stage === 'technical' && techCount > 0 && (
                <div style={{ alignSelf: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                  {techCount}/{MAX_QUESTIONS}
                </div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px 12px 12px 2px', padding: '0.65rem 0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF12D' }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {showInput && (
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
                <button onClick={send} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? 'rgba(255,241,45,0.3)' : '#FFF12D',
                  border: 'none', borderRadius: '4px', width: '40px',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s',
                }}>
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
