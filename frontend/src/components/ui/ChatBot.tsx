"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
  isLimit?: boolean;
};

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME_TEXT: Record<string, string> = {
  es: "Hola. Soy el Asistente de Protección de Activos de ELIMFILTERS. ¿En qué puedo ayudarte hoy?",
  pt: "Olá. Sou o Assistente de Proteção de Ativos da ELIMFILTERS. Como posso ajudá-lo hoje?",
  fr: "Bonjour. Je suis l'Assistant Protection des Actifs ELIMFILTERS. Comment puis-je vous aider aujourd'hui ?",
  it: "Ciao. Sono l'Assistente di Protezione degli Asset di ELIMFILTERS. Come posso aiutarti oggi?",
  nl: "Hallo. Ik ben de ELIMFILTERS Asset Protection Assistent. Hoe kan ik u vandaag helpen?",
  ru: "Здравствуйте. Я Ассистент по защите активов ELIMFILTERS. Чем могу помочь сегодня?",
  zh: "您好。我是ELIMFILTERS资产保护助手。今天有什么可以帮助您的？",
  ja: "こんにちは。ELIMFILTERSアセットプロテクションアシスタントです。本日はどのようなご用件でしょうか？",
  ar: "مرحباً. أنا مساعد حماية الأصول من ELIMFILTERS. كيف يمكنني مساعدتك اليوم؟",
  fa: "سلام. من دستیار حفاظت از دارایی‌های ELIMFILTERS هستم. چطور می‌توانم امروز کمکتان کنم؟",
  en: "Hello. I'm the ELIMFILTERS Asset Protection Assistant. How can I help you today?",
};

const LIMIT_TEXT: Record<string, string> = {
  es: "Has alcanzado el límite de esta sesión. Para más ayuda, escribe a support@elimfilters.com.",
  pt: "Você atingiu o limite desta sessão. Para mais assistência, envie um e-mail para support@elimfilters.com.",
  fr: "Vous avez atteint la limite de cette session. Pour plus d'aide, écrivez à support@elimfilters.com.",
  it: "Hai raggiunto il limite per questa sessione. Per ulteriore assistenza, scrivi a support@elimfilters.com.",
  nl: "U heeft de sessielimiet bereikt. Voor verdere hulp, e-mail support@elimfilters.com.",
  ru: "Вы достигли лимита сессии. Для дальнейшей помощи напишите на support@elimfilters.com.",
  zh: "您已达到本次会话的限制。如需进一步帮助，请发送邮件至 support@elimfilters.com。",
  ja: "このセッションの上限に達しました。詳細はsupport@elimfilters.comまでご連絡ください。",
  ar: "لقد وصلت إلى حد هذه الجلسة. للمزيد من المساعدة، راسلنا على support@elimfilters.com.",
  fa: "به حد این نشست رسیده‌اید. برای کمک بیشتر با support@elimfilters.com تماس بگیرید.",
  en: "You've reached the limit for this session. For further assistance, please email our engineering team at support@elimfilters.com.",
};

const LAST_MSG_TEXT: Record<string, string> = {
  es: "Esta es tu última pregunta de esta sesión.",
  pt: "Esta é sua última pergunta desta sessão.",
  fr: "C'est votre dernière question pour cette session.",
  it: "Questa è la tua ultima domanda per questa sessione.",
  nl: "Dit is uw laatste vraag voor deze sessie.",
  ru: "Это ваш последний вопрос в этой сессии.",
  zh: "这是您本次会话的最后一个问题。",
  ja: "これがこのセッションの最後の質問です。",
  ar: "هذا هو سؤالك الأخير في هذه الجلسة.",
  fa: "این آخرین سوال شما در این نشست است.",
  en: "This is your last question for this session.",
};

const PLACEHOLDER_TEXT: Record<string, string> = {
  es: "Pregunta sobre filtros, normas, industrias...",
  pt: "Pergunte sobre filtros, normas, indústrias...",
  fr: "Posez une question sur les filtres, normes, industries...",
  it: "Chiedi di filtri, norme, industrie...",
  nl: "Vraag over filters, normen, industrieën...",
  ru: "Спросите о фильтрах, стандартах, отраслях...",
  zh: "询问过滤器、标准、行业...",
  ja: "フィルター、規格、産業について質問...",
  ar: "اسأل عن المرشحات والمعايير والصناعات...",
  fa: "درباره فیلترها، استانداردها، صنایع بپرسید...",
  en: "Ask about filters, standards, industries...",
};

const WARMUP_TEXT: Record<string, string> = {
  es: "Iniciando el motor de ingeniería... un momento.",
  pt: "Iniciando o motor de engenharia... um momento.",
  fr: "Démarrage du moteur d'ingénierie... un instant.",
  it: "Avvio del motore di ingegneria... un momento.",
  nl: "Technische motor starten... even geduld.",
  ru: "Запуск инженерного модуля... подождите.",
  zh: "正在启动工程引擎...请稍候。",
  ja: "エンジニアリングエンジンを起動中...少々お待ちください。",
  ar: "جاري تشغيل محرك الهندسة... لحظة.",
  fa: "در حال راه‌اندازی موتور مهندسی... لطفاً صبر کنید.",
  en: "Starting the engineering engine... one moment.",
};

const ERROR_TEXT: Record<string, string> = {
  es: "Error de conexión. Por favor inténtalo de nuevo.",
  pt: "Erro de conexão. Por favor, tente novamente.",
  fr: "Erreur de connexion. Veuillez réessayer.",
  it: "Errore di connessione. Riprova.",
  nl: "Verbindingsfout. Probeer het opnieuw.",
  ru: "Ошибка соединения. Попробуйте ещё раз.",
  zh: "连接错误，请重试。",
  ja: "接続エラーが発生しました。もう一度お試しください。",
  ar: "خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
  fa: "خطای اتصال. لطفاً دوباره تلاش کنید.",
  en: "Connection error. Please try again.",
};

function detectLangSync(): string {
  if (typeof window === "undefined") return "en";
  // Only use cached geo result — never browser/i18next language (causes Spanish for US users)
  const geoLang = localStorage.getItem("ef_geo_lang") || "";
  if (geoLang && WELCOME_TEXT[geoLang]) return geoLang;
  return "en"; // Default English until geo-detection completes
}

async function detectLangAsync(): Promise<string> {
  if (typeof window === "undefined") return "en";
  // If geo cache already exists, return immediately
  const cached = localStorage.getItem("ef_geo_lang") || "";
  if (cached && WELCOME_TEXT[cached]) return cached;
  // Otherwise call ip-api.com (same as LanguageDetector component)
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch("https://ip-api.com/json/?fields=countryCode", { signal: ctrl.signal });
    const data = await res.json();
    const COUNTRY_LANG: Record<string, string> = {
      ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", VE: "es",
      EC: "es", BO: "es", PY: "es", UY: "es", DO: "es", GT: "es", HN: "es",
      SV: "es", NI: "es", CR: "es", PA: "es", CU: "es", PR: "es",
      BR: "pt", PT: "pt", FR: "fr", BE: "fr", CH: "fr",
      IT: "it", NL: "nl", RU: "ru", BY: "ru", KZ: "ru", UA: "ru",
      CN: "zh", TW: "zh", HK: "zh", JP: "ja",
      SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar",
      IR: "fa",
    };
    const lang = COUNTRY_LANG[data.countryCode || "US"] || "en";
    localStorage.setItem("ef_geo_lang", lang);
    localStorage.setItem("ef_geo_ts", String(Date.now()));
    return lang;
  } catch {
    return "en";
  }
}

function getWelcome(lang: string): Message {
  return { id: 0, from: "bot", text: WELCOME_TEXT[lang] || WELCOME_TEXT.en, time: now() };
}

// Generate or retrieve a stable session ID for this browser session
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("elim_chat_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("elim_chat_sid", id);
  }
  return id;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<string>(() => detectLangSync());
  const [messages, setMessages] = useState<Message[]>(() => [getWelcome(detectLangSync())]);

  // Resolve geo-language async — updates welcome message if lang changes after detection
  useEffect(() => {
    detectLangAsync().then((resolved) => {
      if (resolved !== lang) {
        setLang(resolved);
        setMessages((prev) => {
          // Only update the welcome message (id === 0), leave user messages untouched
          if (prev.length === 1 && prev[0].id === 0) {
            return [getWelcome(resolved)];
          }
          return prev;
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || typing || limitReached) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const doFetch = async (attempt: number): Promise<Response> => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://part-search.elimfilters.com";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);
      try {
        const res = await fetch(`${apiBase}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text.trim(), sessionId: getSessionId(), lang }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return res;
      } catch (e) {
        clearTimeout(timeout);
        if (attempt === 0) {
          // Show warm-up message and retry once
          setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: WARMUP_TEXT[lang] || WARMUP_TEXT.en, time: now() }]);
          await new Promise((r) => setTimeout(r, 3000));
          return doFetch(1);
        }
        throw e;
      }
    };

    try {
      const res = await doFetch(0);
      const data = await res.json();

      setTyping(false);

      if (data.limitReached || data.messagesLeft === 0) {
        setLimitReached(true);
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "bot",
            text: LIMIT_TEXT[lang] || LIMIT_TEXT.en,
            time: now(),
            isLimit: true,
          },
        ]);
        return;
      }

      if (data.reply) {
        setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: data.reply, time: now() }]);
        if (data.messagesLeft === 1) {
          // Warn on last message
          setTimeout(() => {
            setMessages((m) => [
              ...m,
              {
                id: Date.now() + 2,
                from: "bot",
                text: LAST_MSG_TEXT[lang] || LAST_MSG_TEXT.en,
                time: now(),
              },
            ]);
          }, 200);
        }
      } else {
        setMessages((m) => [
          ...m,
          { id: Date.now() + 1, from: "bot", text: ERROR_TEXT[lang] || ERROR_TEXT.en, time: now() },
        ]);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: ERROR_TEXT[lang] || ERROR_TEXT.en, time: now() },
      ]);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: "5.5rem",
              right: "1.5rem",
              width: "clamp(300px, 90vw, 360px)",
              zIndex: 9999,
              borderRadius: "12px",
              overflow: "hidden",
              background: "#080808",
              border: "1px solid rgba(255,241,45,0.18)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0a0a0a",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <img src="/images/e.png" alt="E" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "#fff", margin: 0, lineHeight: 1.2 }}>
                    ELIMFILTERS
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "rgba(255,241,45,0.7)", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Asset Protection Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "rgba(255,255,255,0.4)", lineHeight: 1, borderRadius: "4px" }}
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                maxHeight: "320px",
                scrollbarWidth: "none",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.from === "user" ? "flex-end" : "flex-start",
                    gap: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "0.65rem 0.9rem",
                      borderRadius: msg.from === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
                      background: msg.isLimit
                        ? "rgba(255,68,68,0.08)"
                        : msg.from === "user"
                        ? "#FFF12D"
                        : "rgba(255,255,255,0.05)",
                      border: msg.isLimit
                        ? "1px solid rgba(255,68,68,0.25)"
                        : msg.from === "user"
                        ? "none"
                        : "1px solid rgba(255,255,255,0.07)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.83rem",
                      lineHeight: 1.6,
                      color: msg.from === "user" ? "#000" : "rgba(255,255,255,0.85)",
                      fontWeight: msg.from === "user" ? 500 : 400,
                    }}
                  >
                    {msg.isLimit ? (
                      <>
                        {msg.text.split("support@elimfilters.com").map((part, i, arr) =>
                          i < arr.length - 1 ? (
                            <span key={i}>
                              {part}
                              <a href="mailto:support@elimfilters.com" style={{ color: "#FFF12D", textDecoration: "underline" }}>
                                support@elimfilters.com
                              </a>
                            </span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
                    {msg.time}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                  <div
                    style={{
                      padding: "0.65rem 0.9rem",
                      borderRadius: "2px 12px 12px 12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,241,45,0.5)" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — replaced with support CTA when limit reached */}
            {limitReached ? (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "#0a0a0a",
                  textAlign: "center",
                }}
              >
                <a
                  href="mailto:support@elimfilters.com"
                  style={{
                    display: "inline-block",
                    background: "#FFF12D",
                    color: "#000",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                  }}
                >
                  Email Support →
                </a>
              </div>
            ) : (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  background: "#0a0a0a",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder={PLACEHOLDER_TEXT[lang] || PLACEHOLDER_TEXT.en}
                  disabled={typing}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.85rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.83rem",
                    color: "#fff",
                    outline: "none",
                    transition: "border-color 0.2s",
                    opacity: typing ? 0.5 : 1,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,241,45,0.35)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || typing}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    background: input.trim() && !typing ? "#FFF12D" : "rgba(255,255,255,0.06)",
                    border: "none",
                    cursor: input.trim() && !typing ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.18s ease",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !typing ? "#000" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Brand footer */}
            <div
              style={{
                padding: "0.45rem 1rem",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                background: "#060606",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Powered by
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "rgba(255,241,45,0.5)", letterSpacing: "0.08em" }}>
                ELIMFILTERS
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: open ? "#fff" : "#FFF12D",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          boxShadow: "0 4px 24px rgba(255,241,45,0.35), 0 2px 8px rgba(0,0,0,0.6)",
          transition: "background 0.2s ease",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </motion.svg>
          ) : (
            <motion.svg key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Unread dot when closed */}
      {!open && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: "fixed",
            bottom: "calc(1.5rem + 38px)",
            right: "1.5rem",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ff4444",
            border: "2px solid #000",
            zIndex: 10000,
          }}
        />
      )}
    </>
  );
}
