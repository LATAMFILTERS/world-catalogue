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
        fontFamily: "var(--font-body)",
      }}
    >
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
          opacity: 0.32,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 46%, rgba(0,0,0,0.30) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.18), transparent 36%)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease }}
          style={{
            maxWidth: "960px",
            fontFamily: "var(--font-display)",
            lineHeight: 0.9,
            letterSpacing: "-0.055em",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "1.65rem",
            color: "#fff",
          }}
        >
          <span style={{ display: "block", fontSize: "clamp(2.48rem, 6vw, 5.76rem)" }}>
            {t("home.heroLine_protecting", "Protecting")} {t("home.heroLine_industrial", "Industrial")}
          </span>
          <span
            style={{
              display: "block",
              color: "#FFF12D",
              fontSize: "clamp(2.25rem, 5.45vw, 5.25rem)",
              lineHeight: 0.9,
            }}
          >
            {t("home.heroLine_assets", "Assets")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45, ease }}
          style={{
            maxWidth: "850px",
            color: "rgba(255,255,255,0.76)",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1rem, 1.45vw, 1.18rem)",
            lineHeight: 1.65,
            fontWeight: 600,
            marginBottom: "2rem",
          }}
        >
          ELIMFILTERS engineers Total Asset Protection Systems that control contamination, reduce equipment wear, minimize downtime, improve reliability, and extend the operational life of critical industrial assets.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.55, ease }}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}
        >
          <Link
            href="/knowledge-system"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              background: "#FFF12D",
              color: "#000",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.16em",
              padding: "0.95rem 1.4rem",
              textDecoration: "none",
              textTransform: "uppercase",
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.04)",
              padding: "0.95rem 1.4rem",
              fontFamily: "var(--font-display)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
              textDecoration: "none",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FFF12D";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,241,45,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
            }}
          >
            {t("home.ctaFilter", "Find My Filter")}
          </a>
        </motion.div>
      </div>

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
          section {
            padding: 120px 7% 0 !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
