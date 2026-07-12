"use client";
import { motion } from "motion/react";
import { TestimonialsColumn, type Testimonial } from "./testimonials-columns";

// Composite operator feedback patterns observed across field deployments.
// Roles and sectors are generic — not attributed to named individuals or companies.
const testimonials: Testimonial[] = [
  {
    text: "Fleets running high-dust haul routes typically report fewer hydraulic failures after standardizing on contamination-controlled filtration across the fleet.",
    role: "Fleet Maintenance Director",
    sector: "Heavy-Duty Mining Haul Fleet",
  },
  {
    text: "High-dust job sites moving to progressive-density air intake protection commonly see engine service intervals extend well beyond baseline.",
    role: "Heavy-Duty Service Manager",
    sector: "Off-Highway Construction Equipment",
  },
  {
    text: "Standardizing ISO cleanliness targets across a mixed haul-truck fleet lets operations teams treat contamination control as a maintenance KPI, not an afterthought.",
    role: "Mining Operations Manager",
    sector: "Open-Pit Mining Fleet",
  },
  {
    text: "Reducing hydraulic oil top-ups and servo valve failures on precision agricultural equipment typically shows measurable ROI within a single harvest season.",
    role: "Procurement Lead",
    sector: "Precision Agriculture Equipment",
  },
  {
    text: "Coastal generator installations exposed to salt air see fewer corrosion-related cooling system failures once coolant filtration is upgraded.",
    role: "Site Engineer",
    sector: "Standby Power Generation",
  },
  {
    text: "Cabin air quality upgrades on construction fleets shift from a compliance checkbox to a real factor in operator recruitment and retention.",
    role: "HSE Director",
    sector: "Construction Fleet Operations",
  },
  {
    text: "Tightening hydraulic cleanliness codes on press and injection systems is a common lever for extending proportional valve life in manufacturing plants.",
    role: "Plant Manager",
    sector: "Industrial Manufacturing",
  },
  {
    text: "Offshore support vessels see fuel system injector failures drop sharply once fuel water-separation performance is addressed directly.",
    role: "Fleet Engineer",
    sector: "Marine & Offshore Support Vessels",
  },
  {
    text: "Distributors who reposition filter replacement as asset protection, not routine maintenance, report a real shift in how customers evaluate total cost of ownership.",
    role: "Regional Distribution Manager",
    sector: "Industrial Equipment Distribution",
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
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.24em', color: '#FFF12D', marginBottom: '0.9rem' }}>
            FIELD DEPLOYMENT PATTERNS
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            What operational teams report<br />
            <span style={{ color: '#FFF12D' }}>after protecting their assets.</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'center' }}>
            Composite feedback patterns observed across mining, agriculture, marine, and power generation deployments — not verified individual endorsements.
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
