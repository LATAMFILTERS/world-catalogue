"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const METRICS = [
  { value: "99.9%", label: "Filter Efficiency" },
  { value: "3–5×", label: "Asset Life Extension" },
  { value: "70%", label: "Failures from Contamination" },
  { value: "20k+", label: "OEM Cross-References" },
];

export default function CinematicHero() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let gsap: any, ScrollTrigger: any, ctx: any;

    const init = async () => {
      const gsapModule = await import("gsap");
      const stModule = await import("gsap/ScrollTrigger");
      gsap = gsapModule.gsap;
      ScrollTrigger = stModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=5000",
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
          },
        });

        // Phase 1: fade overlay out, eyebrow fades in
        tl.to(overlayRef.current, { opacity: 0, duration: 0.5 }, 0)
          .fromTo(
            eyebrowRef.current,
            { opacity: 0, y: 20, letterSpacing: "0.35em" },
            { opacity: 1, y: 0, letterSpacing: "0.22em", duration: 0.6 },
            0.1
          )
          // Phase 2: Line 1 sweeps in
          .fromTo(
            line1Ref.current,
            { opacity: 0, y: 80, skewY: 3 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power3.out" },
            0.3
          )
          // Phase 3: Line 2 sweeps in
          .fromTo(
            line2Ref.current,
            { opacity: 0, y: 80, skewY: 3 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power3.out" },
            0.55
          )
          // Phase 4: Lines compress upward, card zooms in
          .to(
            [line1Ref.current, line2Ref.current, eyebrowRef.current],
            { y: -100, opacity: 0, duration: 0.6, ease: "power2.in" },
            1.4
          )
          .fromTo(
            cardRef.current,
            { opacity: 0, scale: 0.7, y: 60 },
            { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "expo.out" },
            1.5
          )
          // Phase 5: Card holds, CTA appears
          .fromTo(
            ctaRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            2.0
          );
      }, containerRef);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          opacity: 0.4,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)",
          zIndex: 1,
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage:
            "linear-gradient(rgba(255,241,45,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,241,45,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Main content container */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1100px",
          padding: "0 7%",
          textAlign: "left",
        }}
      >
        {/* Eyebrow */}
        <p
          ref={eyebrowRef}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            color: "rgba(255,241,45,0.85)",
            textTransform: "uppercase",
            marginBottom: "2rem",
            fontWeight: 700,
            opacity: 0,
          }}
        >
          {t("home.eyebrow", "Asset Protection Technology Platform")}
        </p>

        {/* Headline Line 1 */}
        <div
          ref={line1Ref}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "rgba(255,255,255,0.92)",
            opacity: 0,
          }}
        >
          {t("home.hero1", "Protecting industrial assets")}
        </div>

        {/* Headline Line 2 */}
        <div
          ref={line2Ref}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: "#FFF12D",
            marginBottom: "2rem",
            opacity: 0,
          }}
        >
          {t("home.hero2", "through contamination control.")}
        </div>

        {/* Industrial Metrics Card */}
        <div
          ref={cardRef}
          style={{
            opacity: 0,
            background: "rgba(8,8,8,0.95)",
            border: "1px solid rgba(255,241,45,0.18)",
            borderRadius: "8px",
            padding: "2.5rem",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 80px rgba(255,241,45,0.06), 0 40px 80px rgba(0,0,0,0.8)",
            maxWidth: "700px",
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "#FFF12D",
                  textTransform: "uppercase",
                  margin: "0 0 0.25rem",
                }}
              >
                // CONTAMINATION CONTROL METRICS
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.6)",
                  margin: 0,
                }}
              >
                Asset Protection Technology Platform
              </p>
            </div>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#FFF12D",
                boxShadow: "0 0 12px rgba(255,241,45,0.8)",
              }}
            />
          </div>

          {/* Metrics grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
          >
            {METRICS.map((m, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    color: i === 0 ? "#FFF12D" : "#fff",
                    lineHeight: 1,
                    marginBottom: "0.4rem",
                  }}
                >
                  {m.value}
                </motion.div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    lineHeight: 1.3,
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom status bar */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "2px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "78%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: "100%",
                  background:
                    "linear-gradient(to right, rgba(255,241,45,0.4), #FFF12D)",
                  borderRadius: "2px",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: "0.6rem",
                color: "rgba(255,241,45,0.7)",
                letterSpacing: "0.1em",
              }}
            >
              ISO 16889 · ISO 4406 · SAE J1539
            </span>
          </div>
        </div>

        {/* CTA Row */}
        <div
          ref={ctaRef}
          style={{
            opacity: 0,
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginTop: "2rem",
          }}
        >
          <motion.a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, boxShadow: "0 0 36px rgba(255,241,45,0.45)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "#FFF12D",
              color: "#000",
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              padding: "0.9rem 2.2rem",
              textDecoration: "none",
              textTransform: "uppercase",
              borderRadius: "4px",
            }}
          >
            {t("home.ctaFilter", "Find my filter")}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.a>
          <Link
            href="/knowledge-system"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {t("home.ctaKnowledge", "Knowledge system")}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "28px",
            background: "linear-gradient(to bottom, rgba(255,241,45,0.6), transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}
