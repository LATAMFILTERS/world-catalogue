"use client";
import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  role: string;
  sector: string;
};

function monogram(role: string): string {
  const words = role.split(' ').filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-4 pb-4"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, role, sector }, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl max-w-xs w-full"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 0 0 1px rgba(255,241,45,0.04)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.72)',
                  textAlign: 'left',
                }}>
                  {text}
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <div
                    aria-hidden="true"
                    className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: '1px solid rgba(255,241,45,0.3)',
                      background: 'rgba(255,241,45,0.06)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      color: '#FFF12D',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {monogram(role)}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#fff',
                      lineHeight: 1.3,
                    }}>{role}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>{sector}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
