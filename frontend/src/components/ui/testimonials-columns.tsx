"use client";
import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
  company: string;
};

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
            {props.testimonials.map(({ text, image, name, role, company }, i) => (
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
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.72)',
                  textAlign: 'left',
                }}>
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                    style={{ border: '1px solid rgba(255,241,45,0.2)' }}
                  />
                  <div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#fff',
                      lineHeight: 1.3,
                    }}>{name}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>{role} · {company}</div>
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
