"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const IMG_PADDING = 12;

// ── DATA ──────────────────────────────────────────────────────────────────────
const TECHNOLOGIES = [
  {
    // Background: mechanic in lab handling large air filter element
    imgUrl: "/images/mecanica-air.avif",
    logoUrl: "/assets/MACROCORE.avif",
    subheading: "Air Intake & Airflow Protection",
    title: "Progressive Density Gradient (PDG)",
    p1: "Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency.",
    p2: "Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, and industrial compressors rated to ISO 5011.",
    link: "/knowledge-system/standards/air-intake-systems",
  },
  {
    // Background: fuel separator hero image — turbine fuel systems
    imgUrl: "/images/fuellseparator-hero.avif",
    logoUrl: "/assets/HYDROCORE.avif",
    subheading: "Fuel Cleanliness Protection",
    title: "Turbine-Stage Water Separation",
    p1: "HYDROCORE™ removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency — protecting precision HPCR injectors operating at 1,800–2,500 bar.",
    p2: "Engineered for Common Rail and turbine fuel systems in mining, marine, power generation, and agriculture. Validates against ASTM D6304 and SAE J1488.",
    link: "/knowledge-system/standards/fuel-systems",
  },
  {
    // Background: oil-hand.avif — industrial oil / lubrication context
    imgUrl: "/images/oil-hand.avif",
    logoUrl: "/assets/SYNTRAX.avif",
    subheading: "Lubrication Protection",
    title: "Full-Flow Lube Protection",
    p1: "SYNTRAX™ maintains ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals for diesel, gas, and dual-fuel engines — capturing combustion soot above 2% by weight.",
    p2: "It intercepts metal wear particles and fuel dilution byproducts that reduce oil film strength, accelerate bearing wear, and reduce engine service life in mobile and stationary applications.",
    link: "/knowledge-system/standards/lube-oil-systems",
  },
];

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export const TechnologiesParallaxContent = () => {
  return (
    <div className="bg-black text-white">
      {TECHNOLOGIES.map((tech, i) => (
        <TextParallaxContent
          key={i}
          imgUrl={tech.imgUrl}
          logoUrl={tech.logoUrl}
          subheading={tech.subheading}
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

// ── WRAPPER ───────────────────────────────────────────────────────────────────
const TextParallaxContent = ({
  imgUrl,
  logoUrl,
  subheading,
  children,
}: {
  imgUrl: string;
  logoUrl: string;
  subheading: string;
  children: React.ReactNode;
}) => {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy logoUrl={logoUrl} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

// ── BACKGROUND IMAGE ──────────────────────────────────────────────────────────
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
      {/* dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
      {/* fade-out overlay driven by scroll */}
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{ opacity }}
      />
    </motion.div>
  );
};

// ── BRAND LOGO OVERLAY ────────────────────────────────────────────────────────
const OverlayCopy = ({
  logoUrl,
  subheading,
}: {
  logoUrl: string;
  subheading: string;
}) => {
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
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center gap-4"
    >
      {/* Category label */}
      <p className="text-center text-sm md:text-base uppercase tracking-[0.25em] font-mono text-[#FFF12D]">
        {subheading}
      </p>

      {/* Brand logo image — replaces plain text heading */}
      <img
        src={logoUrl}
        alt={logoUrl}
        className="w-[70vw] max-w-2xl object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </motion.div>
  );
};

// ── CONTENT SECTION BELOW EACH IMAGE ─────────────────────────────────────────
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
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12 bg-black text-white">
    <h2
      className="col-span-1 text-3xl font-bold md:col-span-4"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p
        className="mb-4 text-xl text-neutral-400 md:text-2xl"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {p1}
      </p>
      <p
        className="mb-8 text-xl text-neutral-400 md:text-2xl"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {p2}
      </p>
      <a
        href={link}
        className="inline-flex items-center gap-2 rounded bg-[#FFF12D] text-black font-semibold px-9 py-4 text-lg transition-colors hover:bg-white uppercase tracking-wider"
      >
        Learn more <ArrowUpRight className="w-5 h-5" />
      </a>
    </div>
  </div>
);
