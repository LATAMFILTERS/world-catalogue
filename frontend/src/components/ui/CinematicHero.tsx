"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const ease = [0.16, 1, 0.3, 1] as const;

export default function CinematicHero() {
  const { t } = useTranslation();

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 8% 7vh",
      }}
    >
      {/* Full-bleed background video */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.42,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>

      {/* Gradient — stronger at bottom where text lives */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.92) 100%)",
        zIndex: 1,
      }} />

      {/* Top-left eyebrow — anchored to corner, not a box */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "8%",
          zIndex: 3,
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          color: "rgba(255,241,45,0.7)",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {t("home.eyebrow", "Asset Protection Technology Platform")}
      </motion.p>

      {/* Main content — bottom-aligned, full width */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "1400px", width: "100%" }}>

        {/* Large headline — no box, just type on space */}
        <div style={{ marginBottom: "3rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(3rem, 7.5vw, 7rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {t("home.heroLine_protecting", "Protecting")}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.32, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(3rem, 7.5vw, 7rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#fff",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "baseline",
              gap: "0.35em",
              flexWrap: "wrap",
            }}
          >
            {t("home.heroLine_industrial", "Industrial")}
            <span style={{ color: "#FFF12D" }}>
              {t("home.heroLine_assets", "Assets.")}
            </span>
          </motion.div>
        </div>

        {/* Bottom row — description + stats + CTA, spread across full width */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52, ease }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "4rem",
            alignItems: "end",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
          className="hero-bottom-row"
        >
          {/* Left — tagline + CTA */}
          <div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.48)",
              maxWidth: "480px",
              marginBottom: "2rem",
            }}>
              {t("home.heroDesc", "Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend the operational life of critical industrial equipment.")}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              {/* PRIMARY CTA — Asset Protection */}
              <Link
                href="/knowledge-system"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.6rem",
                  background: "#FFF12D", color: "#000",
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "0.8rem", letterSpacing: "0.07em",
                  padding: "0.9rem 2rem",
                  textDecoration: "none", textTransform: "uppercase",
                  borderRadius: "2px",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(255,241,45,0.4)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                Protect My Assets
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>

              {/* SECONDARY CTA — Part Search */}
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ color: "#fff" }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem", letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.32)", textDecoration: "none",
                  textTransform: "uppercase", display: "inline-flex",
                  alignItems: "center", gap: "0.4rem",
                  transition: "color 0.2s",
                }}
              >
                {t("home.ctaFilter", "Find my filter")} →
              </motion.a>
            </div>
          </div>

          {/* Right — 3 outcome stats, raw numbers no boxes */}
          <div style={{ display: "flex", gap: "3rem", alignItems: "flex-end" }}>
            {[
              { value: "15k+",  label: "Hours\nBearing Life" },
              { value: "3–5×",  label: "Asset Life\nExtension" },
              { value: "80%",   label: "Failures from\nContamination" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
                  color: "#fff",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  marginBottom: "0.4rem",
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.28)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator — minimal line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          position: "absolute",
          right: "8%",
          bottom: "7vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 3,
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, transparent, rgba(255,241,45,0.5))",
          }}
        />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.18)",
          textTransform: "uppercase",
          writingMode: "vertical-rl",
        }}>
          scroll
        </span>
      </motion.div>

      <style suppressHydrationWarning>{`
        @media (max-width: 768px) {
          .hero-bottom-row {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .hero-bottom-row > div:last-child {
            justify-content: flex-start !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
