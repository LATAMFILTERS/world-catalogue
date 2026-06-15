"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const ease = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { value: "99.9%", label: "Capture Efficiency" },
  { value: "20k+",  label: "OEM Cross-References" },
  { value: "12",    label: "Industries Served" },
];

export default function CinematicHero() {
  const { t } = useTranslation();

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#000",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        overflow: "hidden",
      }}
      className="hero-split"
    >
      <style>{`
        @media (max-width: 900px) {
          .hero-split { grid-template-columns: 1fr !important; }
          .hero-right  { display: none !important; }
          .hero-left   { padding: 7rem 8% 5rem !important; justify-content: center !important; }
        }
      `}</style>

      {/* ── LEFT — Text ───────────────────────────────────────────── */}
      <div
        className="hero-left"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 8% 8vh 8%",
          paddingTop: "9rem",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            color: "rgba(255,241,45,0.8)",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          {t("home.eyebrow", "Asset Protection Technology Platform")}
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(2.4rem, 4vw, 3.8rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#fff",
            margin: 0,
          }}
        >
          {t("home.hero1", "Protecting industrial assets")}
          <br />
          <span style={{ color: "#FFF12D", fontWeight: 300 }}>
            {t("home.hero2", "through contamination control.")}
          </span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
          style={{
            height: "1px",
            width: "40px",
            background: "#FFF12D",
            margin: "2rem 0",
            transformOrigin: "left",
          }}
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.5)",
            maxWidth: "420px",
            marginBottom: "2.5rem",
          }}
        >
          {t(
            "home.heroDesc",
            "Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend the operational life of critical industrial equipment."
          )}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.68, ease }}
          style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "3.5rem" }}
        >
          <motion.a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(255,241,45,0.4)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.55rem",
              background: "#FFF12D", color: "#000",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "0.78rem", letterSpacing: "0.07em",
              padding: "0.85rem 1.75rem",
              textDecoration: "none", textTransform: "uppercase",
              borderRadius: "3px",
            }}
          >
            {t("home.ctaFilter", "Find my filter")}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </motion.a>

          <Link
            href="/knowledge-system"
            style={{
              fontFamily: "var(--font-body)", fontWeight: 400,
              fontSize: "0.78rem", letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.35)", textDecoration: "none",
              textTransform: "uppercase", display: "inline-flex",
              alignItems: "center", gap: "0.4rem",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            {t("home.ctaKnowledge", "Knowledge system")}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85, ease }}
          style={{
            display: "flex",
            gap: "2rem",
            paddingTop: "1.75rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {STATS.map((s, i) => (
            <div key={i}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
                color: "#FFF12D",
                lineHeight: 1,
                marginBottom: "0.3rem",
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT — Visual ────────────────────────────────────────── */}
      <div
        className="hero-right"
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Video */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        >
          <source src="/images/moleculas.mp4" type="video/mp4" />
        </video>

        {/* Gradient edges */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, #000 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%), linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)",
        }} />

        {/* Floating info card — bottom left of right panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.9, ease }}
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "2rem",
            right: "2rem",
            background: "rgba(6,6,6,0.88)",
            border: "1px solid rgba(255,241,45,0.14)",
            borderRadius: "6px",
            padding: "1.25rem 1.5rem",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", color: "rgba(255,241,45,0.7)", textTransform: "uppercase", margin: 0 }}>
              // CONTAMINATION CONTROL STANDARDS
            </p>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFF12D", boxShadow: "0 0 8px rgba(255,241,45,0.8)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            {[
              { code: "ISO 16889", desc: "Beta ratio filter testing" },
              { code: "ISO 4406",  desc: "Fluid cleanliness codes" },
              { code: "SAE J1539", desc: "Air filter performance" },
              { code: "ASTM D6304",desc: "Fuel water removal" },
            ].map((s) => (
              <div key={s.code} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "4px",
                padding: "0.5rem 0.65rem",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#FFF12D", fontWeight: 500, marginBottom: "0.15rem" }}>{s.code}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
