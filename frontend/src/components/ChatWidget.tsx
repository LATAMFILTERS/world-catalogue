'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE = 'https://part-search.elimfilters.com';

const WELCOME: Record<string, string> = {
  es: '¡Hola! Soy el asistente de ELIMFILTERS. ¿En qué puedo ayudarte?',
  en: 'Hello! I\'m the ELIMFILTERS assistant. How can I help you?',
  fr: 'Bonjour! Je suis l\'assistant ELIMFILTERS. Comment puis-je vous aider?',
  it: 'Ciao! Sono l\'assistente ELIMFILTERS. Come posso aiutarti?',
  nl: 'Hallo! Ik ben de ELIMFILTERS assistent. Hoe kan ik u helpen?',
  ru: 'Здравствуйте! Я ассистент ELIMFILTERS. Чем могу помочь?',
  zh: '您好！我是ELIMFILTERS助手。有什么可以帮助您的？',
  ja: 'こんにちは！ELIMFILTERSのアシスタントです。ご用件は何でしょうか？',
  ar: 'مرحباً! أنا مساعد ELIMFILTERS. كيف يمكنني مساعدتك؟',
  pt: 'Olá! Sou o assistente ELIMFILTERS. Como posso ajudá-lo?',
  de: 'Hallo! Ich bin der ELIMFILTERS-Assistent. Wie kann ich Ihnen helfen?',
};

function getLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return WELCOME[lang] ? lang : 'en';
}

function genSessionId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface Msg { role: 'user' | 'assistant'; text: string; }

// Auto-detect agent from query content
function detectAgent(query: string): string {
  const q = query.toLowerCase();
  const salesWords = ['precio', 'price', 'costo', 'cost', 'comprar', 'buy', 'distribuidor', 'distributor', 'cotiz', 'quote', 'descuento', 'discount'];
  const supportWords = ['instalac', 'install', 'garant', 'warrant', 'cambio', 'replace', 'instruc', 'how to', 'cómo', 'problema', 'problem', 'falla', 'fail'];
  if (salesWords.some(w => q.includes(w))) return 'sales';
  if (supportWords.some(w => q.includes(w))) return 'support';
  return 'technical';
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(genSessionId);
  const [lang] = useState(getLang);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !started) {
      setMessages([{ role: 'assistant', text: WELCOME[lang] || WELCOME.en }]);
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, started, lang]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/consult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `[Language: ${lang}] ${text}`,
          agent: detectAgent(text),
          session_id: sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch {
      const errMsgs: Record<string, string> = {
        es: 'Lo siento, ocurrió un error. Intenta de nuevo.',
        en: 'Sorry, an error occurred. Please try again.',
        pt: 'Desculpe, ocorreu um erro. Tente novamente.',
        fr: 'Désolé, une erreur est survenue. Réessayez.',
      };
      setMessages(prev => [...prev, { role: 'assistant', text: errMsgs[lang] || errMsgs.en }]);
    } finally {
      setLoading(false);
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
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              width: '56px',
              height: '56px',
              background: '#FFF12D',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              boxShadow: '0 4px 20px rgba(255,241,45,0.35)',
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
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              width: '360px',
              maxWidth: 'calc(100vw - 2rem)',
              height: '520px',
              maxHeight: 'calc(100vh - 4rem)',
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              background: '#FFF12D',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src="/assets/elimfilters-e.png" alt="ELIMFILTERS" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#000' }}>
                  ELIMFILTERS
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: '0.2rem', lineHeight: 1 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  <div style={{
                    background: m.role === 'user' ? '#FFF12D' : 'rgba(255,255,255,0.07)',
                    color: m.role === 'user' ? '#000' : '#fff',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.875rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '12px 12px 12px 2px',
                    padding: '0.65rem 0.9rem',
                    display: 'flex', gap: '4px', alignItems: 'center',
                  }}>
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
            <div style={{
              padding: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.5rem',
              flexShrink: 0,
              background: '#0a0a0a',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={lang === 'es' ? 'Escribe tu pregunta...' : lang === 'pt' ? 'Escreva sua pergunta...' : lang === 'fr' ? 'Écrivez votre question...' : 'Type your question...'}
                rows={1}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  padding: '0.6rem 0.75rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  background: loading || !input.trim() ? 'rgba(255,241,45,0.3)' : '#FFF12D',
                  border: 'none',
                  borderRadius: '4px',
                  width: '40px',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="#000"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
