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

const WELCOME: Message = {
  id: 0,
  from: "bot",
  text: "Hello. I'm the ELIMFILTERS Asset Protection Assistant. How can I help you today?",
  time: now(),
};

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
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text.trim(), sessionId: getSessionId() }),
      });
      const data = await res.json();

      setTyping(false);

      if (data.limitReached || data.messagesLeft === 0) {
        setLimitReached(true);
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "bot",
            text: "You've reached the limit for this session. For further assistance, please email our engineering team at support@elimfilters.com.",
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
                text: "This is your last question for this session.",
                time: now(),
              },
            ]);
          }, 200);
        }
      } else {
        setMessages((m) => [
          ...m,
          { id: Date.now() + 1, from: "bot", text: "Something went wrong. Please try again or contact support@elimfilters.com.", time: now() },
        ]);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: "Connection error. Please try again.", time: now() },
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
                  placeholder="Ask about filters, standards, industries..."
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
