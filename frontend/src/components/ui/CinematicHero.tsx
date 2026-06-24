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
        alignItems: "center",
        padding: "90px 7% 0",
      }}
    >
      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.32,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>

      {/* Gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)",
        zIndex: 1,
      }} />

      {/* Horizontal two-column layout */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "1400px",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: "4rem",
        alignItems: "center",
      }}
        className="hero-grid"
      >
        {/* LEFT — headline */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            style={{ display: 'none' }}
          >
            {t("home.overline", "Industrial Asset Protection")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
            style={{ margin: 0 }}
          >
            <span style={{
              display: "block",
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 4.2vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
            }}>
              {t("home.heroLine_protecting", "Protecting")}
            </span>
            <span style={{
              display: "block",
              fontFamily: "var(--font-inter)",
              fontWeight: 800,
              fontSize: "clamp(2.2rem, 5.5vw, 5.2rem)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
              color: "#fff",
              textTransform: "uppercase",
            }}>
              {t("home.heroLine_industrial", "Industrial")}
            </span>
            <span style={{
              display: "block",
              fontFamily: "var(--font-inter)",
              fontWeight: 800,
              fontSize: "clamp(2.2rem, 5.5vw, 5.2rem)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
              color: "#FFF12D",
              textTransform: "uppercase",
            }}>
              {t("home.heroLine_assets", "Assets.")}
            </span>
          </motion.h1>
        </div>

        {/* RIGHT — divider + description + CTAs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.45, ease }}
          style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
        >
          {/* Top accent line */}
          <div style={{
            width: "40px",
            height: "2px",
            background: "rgba(255,241,45,0.45)",
          }} />

          <p style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 400,
            fontSize: "clamp(0.82rem, 1.1vw, 0.95rem)",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.42)",
            margin: 0,
          }}>
            {t("home.heroDesc", "Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend the operational life of critical industrial equipment.")}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href="/knowledge-system"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                background: "#FFF12D",
                color: "#000",
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                padding: "0.85rem 1.6rem",
                textDecoration: "none",
                textTransform: "uppercase",
                width: "fit-content",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(255,241,45,0.4)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              {t("home.ctaProtect", "Protect My Assets")}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>

            <a
              href="https://part-search.elimfilters.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "color 0.2s",
                width: "fit-content",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#FFF12D"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
            >
              {t("home.ctaFilter", "Find My Filter")} →
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator — bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "36px",
            background: "linear-gradient(to bottom, transparent, rgba(255,241,45,0.4))",
            margin: "0 auto",
          }}
        />
      </motion.div>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
