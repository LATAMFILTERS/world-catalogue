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
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8%",
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
          opacity: 0.35,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>

      {/* Bottom fade */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.95) 100%)",
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: "900px",
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.5rem",
      }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5rem 1.25rem",
            border: "1px solid rgba(255,241,45,0.3)",
            background: "rgba(255,241,45,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "#FFF12D",
            display: "inline-block",
            boxShadow: "0 0 8px rgba(255,241,45,0.8)",
          }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            color: "rgba(255,241,45,0.85)",
            textTransform: "uppercase",
          }}>
            {t("home.badge", "Asset Protection · Industrial Filtration")}
          </span>
          <span style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "#FFF12D",
            display: "inline-block",
            boxShadow: "0 0 8px rgba(255,241,45,0.8)",
          }} />
        </motion.div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.1em" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase",
            }}
          >
            {t("home.heroLine_protecting", "Protecting")}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.38, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#fff",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0.3em",
              flexWrap: "wrap",
            }}
          >
            {t("home.heroLine_industrial", "Industrial")}
            <span style={{ color: "#FFF12D" }}>
              {t("home.heroLine_assets", "Assets.")}
            </span>
          </motion.div>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55, ease }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.42)",
            maxWidth: "580px",
            margin: "0 auto",
          }}
        >
          {t("home.heroDesc", "Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend the operational life of critical industrial equipment.")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/knowledge-system"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              background: "#FFF12D", color: "#000",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "0.8rem", letterSpacing: "0.08em",
              padding: "0.95rem 2.2rem",
              textDecoration: "none", textTransform: "uppercase",
              transition: "box-shadow 0.25s, transform 0.25s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "0 0 45px rgba(255,241,45,0.45)";
              el.style.transform = "translateY(-2px) scale(1.03)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "none";
              el.style.transform = "none";
            }}
          >
            {t("home.ctaProtect", "Protect My Assets")}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

          <motion.a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: "0.8rem", letterSpacing: "0.08em",
              padding: "0.95rem 2.2rem",
              textDecoration: "none", textTransform: "uppercase",
              backdropFilter: "blur(8px)",
              transition: "border-color 0.25s, color 0.25s, transform 0.25s",
            }}
            whileHover={{ borderColor: "rgba(255,241,45,0.45)", color: "#fff", y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {t("home.ctaFilter", "Find my filter")} →
          </motion.a>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          zIndex: 3,
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "36px",
            background: "linear-gradient(to bottom, transparent, rgba(255,241,45,0.45))",
          }}
        />
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .hero-cta-row { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
