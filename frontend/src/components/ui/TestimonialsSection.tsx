"use client";
import { motion } from "motion/react";
import { TestimonialsColumn, type Testimonial } from "./testimonials-columns";

const testimonials: Testimonial[] = [
  {
    text: "Since switching to ELIMFILTERS on our mining haul fleet, hydraulic failures dropped 60%. Contamination is no longer our leading cause of unplanned downtime.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
    name: "Marcus Okafor",
    role: "Fleet Director",
    company: "Rio Tinto Operations",
  },
  {
    text: "Their MACROCORE air filtration system extended our excavator engine intervals from 500h to 1,200h in high-dust operations. The engineering support was outstanding.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "Javier Mendoza",
    role: "Maintenance Manager",
    company: "Grupo CAT Chile",
  },
  {
    text: "ELIMFILTERS redefined how we manage contamination across 340 trucks. ISO cleanliness targets are now part of our maintenance KPIs, not an afterthought.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "Daniel Ferreira",
    role: "VP Operations",
    company: "TransBrasil Logística",
  },
  {
    text: "We reduced hydraulic oil top-ups by 40% and virtually eliminated servo valve failures on our precision ag fleet. The ROI was clear within one harvest season.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Sarah Kowalski",
    role: "Equipment Manager",
    company: "Prairie Harvest Group",
  },
  {
    text: "Our generator sets operate in coastal environments. THERMACORE cooling filtration eliminated the corrosion-related failures that were costing us $80k annually.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Ahmed Al-Rashidi",
    role: "Site Engineer",
    company: "Gulf Power Solutions",
  },
  {
    text: "Cabin air quality on our construction sites went from a compliance risk to a selling point for operator recruitment. ISO 11155 compliance on every machine.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b9e33a1b?w=80&h=80&fit=crop&crop=face",
    name: "Claudia Herrera",
    role: "HSE Director",
    company: "Constructora Omega",
  },
  {
    text: "The NANOFORCE hydraulic filters took our press injection systems from 19/17/14 to 16/14/11 cleanliness codes. Proportional valve life tripled.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    name: "Wolfgang Bauer",
    role: "Plant Manager",
    company: "Bavarian Hydraulics GmbH",
  },
  {
    text: "Fuel system injector failures on our offshore supply vessels dropped to near zero. HYDROCORE water separation in demanding marine environments simply works.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    name: "Ingrid Thorsen",
    role: "Fleet Engineer",
    company: "Nordic Offshore AS",
  },
  {
    text: "We now quote filter replacement as asset protection cost, not maintenance cost. The shift in how our clients think about contamination control has been significant.",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face",
    name: "Ricardo Palacios",
    role: "Regional Director",
    company: "LATAM Equipment Distributors",
  },
];

const firstColumn  = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn  = testimonials.slice(6, 9);

export default function TestimonialsSection() {
  return (
    <section style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* subtle yellow glow top-center */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,241,45,0.3), transparent)' }} />

      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center max-w-xl mx-auto mb-12"
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.8)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            // FIELD RESULTS · ASSET PROTECTION IN PRACTICE
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            What operators say<br />
            <span style={{ color: '#FFF12D' }}>after protecting their assets.</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'center' }}>
            From mining and agriculture to marine and power generation — contamination control delivers measurable results across every industry.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[680px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn}  duration={18} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
          <TestimonialsColumn testimonials={thirdColumn}  className="hidden lg:block" duration={20} />
        </div>
      </div>
    </section>
  );
}
