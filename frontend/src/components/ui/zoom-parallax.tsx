"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

interface IndustryImage {
  src: string;
  label: string;
  slug: string;
}

interface ZoomParallaxProps {
  images: IndustryImage[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  // Layout positions for each image index (max 7)
  const positions = [
    // index 0: center large — the hero
    "top-0 left-0 h-full w-full",
    // index 1
    "",
    // index 2
    "",
    // index 3
    "",
    // index 4
    "",
    // index 5
    "",
    // index 6
    "",
  ];

  // Inner div overrides per index (matching original component logic)
  const innerStyles: React.CSSProperties[] = [
    { position: "relative", height: "25vh", width: "25vw" },
    { position: "absolute", top: "-30vh", left: "5vw", height: "30vh", width: "35vw" },
    { position: "absolute", top: "-10vh", left: "-25vw", height: "45vh", width: "20vw" },
    { position: "absolute", left: "27.5vw", height: "25vh", width: "25vw" },
    { position: "absolute", top: "27.5vh", left: "5vw", height: "25vh", width: "20vw" },
    { position: "absolute", top: "27.5vh", left: "-22.5vw", height: "25vh", width: "30vw" },
    { position: "absolute", top: "22.5vh", left: "25vw", height: "15vh", width: "15vw" },
  ];

  const visibleImages = images.slice(0, 7);

  return (
    <div ref={container} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {visibleImages.map(({ src, label, slug }, index) => {
          const scale = scales[index % scales.length];

          return (
            <motion.div
              key={index}
              style={{ scale }}
              className="absolute top-0 flex h-full w-full items-center justify-center"
            >
              <a href={`/industries/${slug}`} style={{ textDecoration: "none" }}>
                <div style={{ ...innerStyles[index], overflow: "hidden", cursor: "pointer" }}>
                  <img
                    src={src}
                    alt={label}
                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                  />
                  {/* Industry title overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "0.6rem 0.75rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 600,
                        fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#fff",
                        lineHeight: 1,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
