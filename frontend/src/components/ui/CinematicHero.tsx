"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const METRICS = [
  { value: "99.9%", label: "Filter Efficiency" },
  { value: "3–5×", label: "Asset Life Extension" },
  { value: "70%", label: "Failures from Contamination" },
  { value: "20k+", label: "OEM Cross-References" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function CinematicHero() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#000",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.38,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay — always visible */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)",
          zIndex: 1,
        }}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage:
            "linear-gradient(rgba(255,241,45,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,241,45,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content — animates in on mount, stays visible */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 7%",
          paddingTop: "7rem",
          paddingBottom: "5rem",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            color: "rgba(255,241,45,0.85)",
            textTransform: "uppercase",
            marginBottom: "1.75rem",
            fontWeight: 500,
          }}
        >
          {t("home.eyebrow", "Asset Protection Technology Platform")}
        </motion.p>

        {/* Headline */}
        <div style={{ marginBottom: "2rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(2.1rem, 4.5vw, 3.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: "rgba(255,255,255,0.93)",
            }}
          >
            {t("home.hero1", "Protecting industrial assets")}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.36, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.5rem, 3vw, 2.6rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
              color: "#FFF12D",
              marginTop: "0.2rem",
            }}
          >
            {t("home.hero2", "through contamination control.")}
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.48, ease }}
          style={{
            height: "1px",
            width: "48px",
            background: "rgba(255,241,45,0.45)",
            marginBottom: "1.5rem",
            transformOrigin: "left",
          }}
        />

        {/* Positioning statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.56, ease }}
          style={{ marginBottom: "2.5rem" }}
        >
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "clamp(0.88rem, 1.2vw, 0.97rem)", color: "rgba(255,255,255,0.82)", margin: "0 0 0.2rem", lineHeight: 1.6 }}>
            {t("home.heroPositioning1", "ELIMFILTERS is not a filter company.")}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "clamp(0.88rem, 1.2vw, 0.97rem)", color: "#FFF12D", margin: 0, lineHeight: 1.6 }}>
            {t("home.heroPositioning2", "ELIMFILTERS is an Asset Protection Technology company.")}
          </p>
        </motion.div>

        {/* Metrics card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.68, ease }}
          style={{
            background: "rgba(8,8,8,0.88)",
            border: "1px solid rgba(255,241,45,0.15)",
            borderRadius: "8px",
            padding: "1.75rem 2rem",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maxWidth: "660px",
            marginBottom: "2.5rem",
          }}
        >
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em", color: "#FFF12D", textTransform: "uppercase", margin: "0 0 0.2rem" }}>
                // CONTAMINATION CONTROL METRICS
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Asset Protection Technology Platform
              </p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFF12D", boxShadow: "0 0 10px rgba(255,241,45,0.7)" }} />
          </div>

          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {METRICS.map((m, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.2rem, 2vw, 1.7rem)",
                  color: i === 0 ? "#FFF12D" : "#fff",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}>
                  {m.value}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.3 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* ISO bar */}
          <div style={{ marginTop: "1.25rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ flex: 1, height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "78%" }}
                transition={{ duration: 1.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: "100%", background: "linear-gradient(to right, rgba(255,241,45,0.35), #FFF12D)", borderRadius: "2px" }}
              />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", color: "rgba(255,241,45,0.55)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              ISO 16889 · ISO 4406 · SAE J1539
            </span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.82, ease }}
          style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}
        >
          <motion.a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(255,241,45,0.45)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              background: "#FFF12D", color: "#000",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "0.8rem", letterSpacing: "0.06em",
              padding: "0.85rem 2rem", textDecoration: "none",
              textTransform: "uppercase", borderRadius: "4px",
            }}
          >
            {t("home.ctaFilter", "Find my filter")}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </motion.a>
          <Link
            href="/knowledge-system"
            style={{
              fontFamily: "var(--font-display)", fontWeight: 400,
              fontSize: "0.8rem", letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.38)", textDecoration: "none",
              textTransform: "uppercase", display: "inline-flex",
              alignItems: "center", gap: "0.4rem",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
          >
            {t("home.ctaKnowledge", "Knowledge system")}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          zIndex: 2,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "1px", height: "24px", background: "linear-gradient(to bottom, rgba(255,241,45,0.5), transparent)" }}
        />
      </motion.div>
    </div>
  );
}
