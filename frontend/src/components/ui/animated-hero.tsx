"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["ASSETS", "ENGINES", "FLEETS", "MACHINERY", "SYSTEMS"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2500);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative z-10 text-white">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-white/90">PROTECTING INDUSTRIAL</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center text-[#FFF12D] h-[1.2em] md:pb-4 md:pt-1 mt-2">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <div className="h-[2px] w-[60px] bg-[#FFF12D]/50 mx-auto mt-4 mb-2" />

            <div className="text-center mb-6">
              <p className="font-semibold text-white/80" style={{ fontFamily: 'var(--font-inter)' }}>ELIMFILTERS is not a filter company.</p>
              <p className="font-semibold text-[#FFF12D]" style={{ fontFamily: 'var(--font-inter)' }}>ELIMFILTERS is an Asset Protection Technology company.</p>
            </div>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-white/60 max-w-2xl text-center mx-auto" style={{ fontFamily: 'var(--font-display)' }}>
              Advanced contamination control systems engineered to reduce wear, minimize downtime, improve reliability, and extend the operational life of critical industrial equipment.
            </p>
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <Button size="lg" className="gap-2 bg-[#FFF12D] text-black hover:bg-[#FFF12D]/90 font-bold uppercase tracking-wider" asChild>
              <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer">
                Find my filter <MoveRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" className="gap-2 border-white/20 text-white hover:bg-white/10 uppercase tracking-wider" variant="outline" asChild>
              <a href="/knowledge-system">
                Knowledge system <MoveRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
