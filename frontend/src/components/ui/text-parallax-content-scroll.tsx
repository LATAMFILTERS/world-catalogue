"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const TechnologiesParallaxContent = () => {
  return (
    <div className="bg-black text-white">
      <TextParallaxContent
        imgUrl="/images/air-filters-lab.avif"
        subheading="Air Intake Protection"
        heading="MACROCORE™"
      >
        <ExampleContent
          title="Progressive Density Gradient (PDG)"
          p1="Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency."
          p2="Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, and industrial compressors."
          link="/knowledge-system/standards/air-intake-systems"
        />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="/images/fuellseparator-hero.avif"
        subheading="Fuel Cleanliness Protection"
        heading="HYDROCORE™"
      >
        <ExampleContent
          title="Turbine-Stage Water Separation"
          p1="HYDROCORE™ is a hydrophobic water-separation technology that removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency."
          p2="Engineered for HPCR (High Pressure Common Rail) and turbine fuel systems, it protects precision injector assets from corrosion, cavitation, and microbial contamination."
          link="/knowledge-system/standards/fuel-systems"
        />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="/images/oilfilter-mecan.avif"
        subheading="Lubrication Protection"
        heading="SYNTRAX™"
      >
        <ExampleContent
          title="Full-Flow Lube Protection"
          p1="SYNTRAX™ is a synthetic lubrication protection architecture maintaining ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals for diesel, gas, and dual-fuel engines."
          p2="It captures combustion soot above 2% by weight, metal wear particles, and fuel dilution byproducts — the primary degradation mechanisms that reduce oil film strength."
          link="/knowledge-system/standards/lube-oil-systems"
        />
      </TextParallaxContent>
    </div>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ imgUrl, subheading, heading, children }: any) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }: any) => {
  const targetRef = useRef(null);
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
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }: any) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-2xl text-[#FFF12D] uppercase tracking-widest font-mono">
        {subheading}
      </p>
      <p className="text-center text-5xl font-bold md:text-8xl" style={{ fontFamily: 'var(--font-display)' }}>{heading}</p>
    </motion.div>
  );
};

const ExampleContent = ({ title, p1, p2, link }: any) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12 bg-black text-white">
    <h2 className="col-span-1 text-3xl font-bold md:col-span-4" style={{ fontFamily: 'var(--font-display)' }}>
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-400 md:text-2xl" style={{ fontFamily: 'var(--font-inter)' }}>
        {p1}
      </p>
      <p className="mb-8 text-xl text-neutral-400 md:text-2xl" style={{ fontFamily: 'var(--font-inter)' }}>
        {p2}
      </p>
      <a href={link} className="w-full rounded bg-[#FFF12D] text-black font-semibold px-9 py-4 text-xl transition-colors hover:bg-white md:w-fit inline-block text-center">
        Learn more <ArrowUpRight className="inline ml-2" />
      </a>
    </div>
  </div>
);
