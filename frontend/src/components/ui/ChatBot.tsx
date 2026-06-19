"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
};

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const QUICK_REPLIES = [
  "Find my filter",
  "What is contamination control?",
  "Industries served",
  "Contact a specialist",
];

const RESPONSES: Record<string, string> = {
  "find my filter":
    "Use our Part Search tool at part-search.elimfilters.com — cross-references 20,000+ OEM codes by part number or equipment model.",
  "what is contamination control?":
    "Contamination control is a system-level approach to maintaining measurable fluid cleanliness codes (ISO 4406) across all critical circuits — oil, fuel, hydraulic, and air — to prevent wear-driven equipment failure.",
  "industries served":
    "We serve 12 industries: Mining, Agriculture, Marine, Construction, Oil & Gas, Power Generation, Heavy Transport, Forestry, Military, Industrial Equipment, Rail, and Stationary Engines.",
  "contact a specialist":
    "Send us a message at elimfilters.com/contact or email info@elimfilters.com. Our engineering team responds within 24 hours.",
};

const WELCOME: Message = {
  id: 0,
  from: "bot",
  text: "Hello. I'm the ELIMFILTERS Asset Protection assistant. How can I help you today?",
  time: now(),
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const key = text.trim().toLowerCase();
    const reply =
      RESPONSES[key] ||
      Object.entries(RESPONSES).find(([k]) => key.includes(k.split(" ")[0]))?.[1] ||
      "I don't have a specific answer for that yet. Please visit elimfilters.com/contact to speak with our engineering team directly.";

    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: reply, time: now() }]);
    }, 900 + Math.random() * 400);
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
                <div
                  style={{
                    width: 34,
                    height: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
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
                      background: msg.from === "user" ? "#FFF12D" : "rgba(255,255,255,0.05)",
                      border: msg.from === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.83rem",
                      lineHeight: 1.6,
                      color: msg.from === "user" ? "#000" : "rgba(255,255,255,0.85)",
                      fontWeight: msg.from === "user" ? 500 : 400,
                    }}
                  >
                    {msg.text}
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

            {/* Quick replies */}
            <div
              style={{
                padding: "0.6rem 1rem",
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {QUICK_REPLIES.map((r) => (
                <button
                  key={r}
                  onClick={() => send(r)}
                  style={{
                    background: "rgba(255,241,45,0.06)",
                    border: "1px solid rgba(255,241,45,0.15)",
                    borderRadius: "20px",
                    padding: "0.3rem 0.75rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    color: "rgba(255,241,45,0.8)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,241,45,0.14)";
                    (e.target as HTMLButtonElement).style.color = "#FFF12D";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = "rgba(255,241,45,0.06)";
                    (e.target as HTMLButtonElement).style.color = "rgba(255,241,45,0.8)";
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Input */}
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
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,241,45,0.35)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  background: input.trim() ? "#FFF12D" : "rgba(255,255,255,0.06)",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.18s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#000" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

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
