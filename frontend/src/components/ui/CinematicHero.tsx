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
        padding: "90px 6% 0",
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

      {/* Gradient overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.65) 100%)",
        zIndex: 1,
      }} />

      {/* Content — centered */}
      <div style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        maxWidth: "860px",
        width: "100%",
      }}>

        {/* Overline tag */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            color: "rgba(255,241,45,0.65)",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          {t("home.overline", "Industrial Asset Protection")}
        </motion.p>

        {/* Headline */}
        <div style={{ marginBottom: "2rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "clamp(1.6rem, 4vw, 3.8rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
              marginBottom: "0.15em",
            }}
          >
            {t("home.heroLine_protecting", "Protecting")}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5.5vw, 5rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
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

        {/* Accent line — like reference */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "60px" }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          style={{
            height: "2px",
            background: "rgba(255,241,45,0.5)",
            margin: "0 auto 2rem",
          }}
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease }}
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 400,
            fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.45)",
            maxWidth: "540px",
            margin: "0 auto 2.5rem",
          }}
        >
          {t("home.heroDesc", "Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend the operational life of critical industrial equipment.")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            flexWrap: "wrap",
          }}
        >
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
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              padding: "0.8rem 1.8rem",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(255,241,45,0.4)";
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
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              padding: "0.8rem 1.8rem",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "border-color 0.2s, color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,241,45,0.4)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            {t("home.ctaFilter", "Find My Filter")} →
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
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
    </section>
  );
}
