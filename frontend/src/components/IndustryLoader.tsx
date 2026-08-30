"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./IndustryLoader.module.css";

interface IndustryLoaderProps {
  onComplete?: () => void;
}

const INDUSTRIES = [
  { name: "Mining", image: "/images/industries/mining.jpg" },
  { name: "Agriculture", image: "/images/industries/agriculture.jpg" },
  { name: "Construction", image: "/images/industries/construction.jpg" },
  { name: "Truck Fleets", image: "/images/industries/trucks.jpg" },
];

export default function IndustryLoader({ onComplete }: IndustryLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mediasRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cols = colsRef.current.filter(Boolean) as HTMLDivElement[];
    const medias = mediasRef.current.filter(Boolean) as HTMLDivElement[];

    if (!cols.length || !medias.length) return;

    gsap.set(cols, { height: "100%" });
    gsap.set(medias, { xPercent: -100 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
        onComplete?.();
      },
    });

    tl.to(medias, {
      xPercent: 100,
      duration: 2.2,
      stagger: { each: 0.35, from: "start" },
      ease: "power2.inOut",
    });

    tl.to(
      cols,
      {
        height: "0%",
        duration: 1.4,
        stagger: { each: 0.18, from: "end" },
        ease: "power3.inOut",
      },
      "-=0.6"
    );

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div className={styles.loader} ref={containerRef}>
      {INDUSTRIES.map((industry, i) => (
        <div
          key={industry.name}
          className={styles.col}
          ref={(el) => { colsRef.current[i] = el; }}
        >
          <div
            className={styles.media}
            ref={(el) => { mediasRef.current[i] = el; }}
          >
            <img src={industry.image} alt={industry.name} />
          </div>
          <span className={styles.label}>{industry.name}</span>
        </div>
      ))}
    </div>
  );
}
