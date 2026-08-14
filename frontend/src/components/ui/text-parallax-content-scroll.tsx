"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const IMG_PADDING = 12;

const TECHNOLOGIES = [
  {
    imgUrl: "/images/mecanica-air.avif",
    logoUrl: "/assets/MACROCORE.avif",
    title: "Progressive Density Gradient (PDG)",
    p1: "Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9% to 99.98% interception efficiency.",
    p2: "Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, and industrial compressors rated to ISO 5011.",
    link: "/knowledge-system/standards/air-intake-systems",
  },
  {
    imgUrl: "/images/fuellseparator-hero.avif",
    logoUrl: "/assets/TURBOCORE.avif",
    title: "Turbine-Stage Water Separation",
    p1: "TURBOCORE removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency — protecting precision HPCR injectors operating at 1,800 to 2,500 bar.",
    p2: "Engineered for Common Rail and turbine fuel systems in mining, marine, power generation, and agriculture. Validates against ASTM D6304 and SAE J1488.",
    link: "/knowledge-system/standards/fuel-systems",
  },
  {
    imgUrl: "/images/oil-hand.avif",
    logoUrl: "/assets/SYNTRAX.avif",
    title: "Full-Flow Lubrication Protection",
    p1: "SYNTRAX maintains ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals for diesel, gas, and dual-fuel engines, capturing combustion soot above 2% by weight.",
    p2: "It intercepts metal wear particles and fuel dilution byproducts that reduce oil film strength, accelerate bearing wear, and shorten engine service life in mobile and stationary applications.",
    link: "/knowledge-system/standards/lube-oil-systems",
  },
];

export const TechnologiesParallaxContent = () => {
  return (
    <div style={{ background: "#000", color: "#fff" }}>
      {TECHNOLOGIES.map((tech, i) => (
        <TextParallaxContent
          key={i}
          imgUrl={tech.imgUrl}
          logoUrl={tech.logoUrl}
        >
          <ExampleContent
            title={tech.title}
            p1={tech.p1}
            p2={tech.p2}
            link={tech.link}
          />
        </TextParallaxContent>
      ))}
    </div>
  );
};

const TextParallaxContent = ({
  imgUrl,
  logoUrl,
  children,
}: {
  imgUrl: string;
  logoUrl: string;
  children: React.ReactNode;
}) => {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy logoUrl={logoUrl} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }: { imgUrl: string }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{ opacity }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ logoUrl }: { logoUrl: string }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full items-center justify-center"
    >
      {/*
        The AVIF files have a solid BLACK background with WHITE lettering.
        mix-blend-mode: screen makes pure black pixels transparent
        and keeps white pixels fully visible — no white box, just letters.
      */}
      <img
        src={logoUrl}
        alt="technology"
        style={{
          width: "60vw",
          maxWidth: "560px",
          objectFit: "contain",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
};

const ExampleContent = ({
  title,
  p1,
  p2,
  link,
}: {
  title: string;
  p1: string;
  p2: string;
  link: string;
}) => (
  <div
    style={{
      background: "#000",
      color: "#fff",
      maxWidth: "1100px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "2rem",
      padding: "3rem 1.5rem 6rem",
    }}
  >
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
      <h2
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
          color: "#fff",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            marginBottom: "1rem",
          }}
        >
          {p1}
        </p>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            marginBottom: "2rem",
          }}
        >
          {p2}
        </p>
        <a
          href={link}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#FFF12D",
            color: "#000",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: "0.85rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.85rem 2.25rem",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Learn more
          <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  </div>
);
