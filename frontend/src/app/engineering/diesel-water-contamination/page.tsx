'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ConversionProvider, useConversion } from '@/components/conversion/ConversionContext';
import { EngineeringRecommendationsSection } from '@/components/engineering';
import { CTACard } from '@/components/conversion/CTACard';

function DieselWaterContaminationContent() {
  const { dispatchTrustSignal, setIntent } = useConversion();

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Navigation */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '920px', margin: '0 auto' }}>
        <Link href="/engineering" style={{
          fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.55)', letterSpacing: '0.12em', marginBottom: '1.25rem',
            }}>
              ENGINEERING TOPIC · FUEL SYSTEMS
            </p>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem',
              maxWidth: '720px',
            }}>
              What happens when water enters diesel fuel?
            </h1>
            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
              maxWidth: '640px', textAlign: 'justify',
            }}>
              Water in diesel fuel is not a contamination event to monitor — it is an active
              failure process. At modern common-rail injection pressures of 1,600–2,500 bar,
              water destroys injector needle seats within minutes of exposure. Understanding
              the ingress pathways and failure mechanisms determines whether contamination
              is detected before or after the repair event.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* 1 · Customer Problem */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-1')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>01 / CUSTOMER PROBLEM</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Fuel filters plugging ahead of schedule. Injectors failing before overhaul.
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1rem',
          }}>
            The operational signal for diesel water contamination is almost never &quot;water in fuel.&quot;
            It is unexplained short filter life: fuel filters that should last 500 operating hours
            plugging at 50–100 hours. It is injector failures arriving outside the normal replacement
            schedule. It is engine hard starts in cold mornings, or power loss under load from
            restricted fuel flow. By the time water is the confirmed diagnosis, the system has
            already been degraded.
          </p>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify',
          }}>
            Water in diesel fuel enters through condensation in partially filled above-ground
            storage tanks, rain ingress through improperly sealed filler caps, cross-contamination
            during fuel delivery, and emulsification during fuel agitation. Every diesel fleet
            operating from bulk storage is exposed to at least one of these pathways continuously.
          </p>
        </motion.section>

        {/* 2 · Operational Consequences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>02 / OPERATIONAL CONSEQUENCES</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1.25rem', color: '#fff',
          }}>
            Quantified impact across the fuel system
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { metric: '−40–70%', label: 'Fuel injector service life under sustained water contamination above 200 ppm' },
              { metric: '−60–80%', label: 'Fuel filter service interval reduction from microbial biomass plugging' },
              { metric: '+5–15%', label: 'Fuel consumption increase from injector tip erosion and spray pattern degradation' },
              { metric: '$5K–$30K', label: 'Full injector set replacement cost; high-pressure fuel pump $3K–$12K' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '1.25rem',
              }}>
                <p style={{
                  fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700, color: '#FFF12D', marginBottom: '0.4rem',
                }}>{item.metric}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, textAlign: 'justify',
          }}>
            A 10,000-litre bulk fuel storage tank with water content above 0.1% by volume can develop
            active microbial contamination within 30–60 days, rendering the entire tank volume
            unusable without chemical treatment and filtration. In agricultural operations dependent
            on large seasonal fuel reserves, a single contamination event can affect multiple
            machines simultaneously during peak operating periods.
          </p>
        </motion.section>

        {/* 3 · Engineering Explanation */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-2')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>03 / ENGINEERING EXPLANATION</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Five failure modes from a single contamination source
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1.25rem',
          }}>
            Water in diesel fuel exists in three forms: dissolved (invisible, below saturation,
            50–200 ppm), free (separate phase at tank bottom, visible above 500 ppm), and
            emulsified (droplets suspended in fuel from agitation or additive interaction). Each
            form causes different damage through different mechanisms across the fuel system.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                mode: 'INJECTOR EROSION',
                text: 'Water at 1,600–2,500 bar injection pressure flashes at injector tip orifices, causing hydraulic erosion of needle and seat at 40–70× the rate in clean fuel. Injector clearances of 1–3 µm are destroyed by erosion within tens of minutes of water slug exposure.',
              },
              {
                mode: 'MICROBIAL GROWTH',
                text: 'Sulphate-reducing bacteria and Hormoconis resinae fungi proliferate at the water-diesel interface in storage tanks. Colonies produce acidic metabolic byproducts, form filter-plugging biomass mats, and accelerate tank corrosion through electrochemical pitting. Active contamination renders a 10,000 L tank unusable in 30–60 days.',
              },
              {
                mode: 'FILTER PLUGGING',
                text: 'Microbial biomass mats plug fuel filter media at particle sizes far below filter rated efficiency. Filters rated for 500-hour life may plug in 50–100 hours under active microbial contamination. Below −5°C, ice crystal formation compounds plugging with wax crystallisation from cold fuel.',
              },
              {
                mode: 'FUEL PUMP CAVITATION',
                text: 'Water-contaminated fuel causes vapour cavitation in high-pressure fuel pump at operating pressure transitions. Cavitation collapses erode pump barrel and plunger surfaces, creating metal debris that enters the fuel circuit downstream of the pump.',
              },
              {
                mode: 'TANK CORROSION',
                text: 'Electrochemical pitting from microbial acid production and water-diesel interface corrosion degrades steel tank walls. Corrosion debris becomes a secondary contamination source, adding abrasive iron oxide particles to an already-contaminated fuel supply.',
              },
            ].map((item) => (
              <div key={item.mode} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px', padding: '1.1rem 1.25rem',
              }}>
                <p style={{
                  fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                  color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em', marginBottom: '0.5rem',
                }}>{item.mode}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 4 · Applicable Standards */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>04 / APPLICABLE STANDARDS</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1.25rem', color: '#fff',
          }}>
            Measurement standards for fuel water content
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                code: 'ASTM D6304',
                scope: 'Karl Fischer coulometric titration method for water in petroleum products. Primary quantitative test for diesel fuel water content. Detects dissolved and emulsified water at ppm-level sensitivity. Required quarterly testing for bulk fuel storage in mining, agriculture, and marine fleet management practice.',
              },
              {
                code: 'ISO 12937',
                scope: 'European equivalent standard for water content determination in petroleum products by Karl Fischer reagent. Equivalent measurement methodology to ASTM D6304; used in European fleet management specifications.',
              },
              {
                code: 'ISO 16332',
                scope: 'Fuel filter water separation efficiency test. Defines coalescing efficiency measurement methodology for fuel-water separators — the standard used to rate HYDROCORE™ and equivalent water separation filter elements.',
              },
            ].map((std) => (
              <div key={std.code} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '1.25rem',
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              }}>
                <p style={{
                  fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', minWidth: '88px', paddingTop: '2px', fontWeight: 600,
                }}>{std.code}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                  {std.scope}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5 · Technology Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-3')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>05 / TECHNOLOGY ARCHITECTURE</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Three-stage fuel protection system
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                tech: 'HYDROCORE™',
                role: 'Primary water separation',
                description: 'Coalescing media that captures and separates free and emulsified water from diesel fuel before injector delivery. Primary defence against water contamination; applies ISO 16332 rated coalescing efficiency. Required on all fuel circuits where bulk storage condensation risk exists.',
                href: '/engineering/technologies/TECH-HYDROCORE',
              },
              {
                tech: 'SYNTEPORE™',
                role: 'High-pressure injector protection',
                description: 'All-synthetic fuel filter media for high-pressure common rail (HPCR) systems. Protects injectors at 1,600–2,500 bar operating pressure from particle contamination produced by microbial biomass breakdown and corrosion debris after water contamination events.',
                href: '/engineering/technologies/TECH-SYNTEPORE',
              },
              {
                tech: 'TURBOCORE™',
                role: 'Three-stage fuel filtration',
                description: 'Three-stage fuel filtration sequence: pre-filter water separation, primary particle filtration, and final HPCR protection. Applied in systems where fuel path length from storage to injection is extended — agricultural equipment with large fuel tanks, marine diesel engines.',
                href: '/engineering/technologies/TECH-TURBOCORE',
              },
            ].map((item) => (
              <Link key={item.tech} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr',
                    gap: '1.25rem', alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem',
                    }}>{item.tech}</p>
                    <p style={{
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.35)', lineHeight: 1.5,
                    }}>{item.role}</p>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                    {item.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 6 · Protection Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-4')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>06 / PROTECTION STRATEGY</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Control at source, not at the injector
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1.25rem',
          }}>
            Water contamination control is most effective when applied at the fuel storage stage —
            where water is present in bulk form and easily separated — rather than at the engine
            fuel filter, where coalescing efficiency is limited by fuel flow rate and microbial
            biomass may already have formed. A contaminated bulk fuel supply will defeat any
            on-engine filtration system if the source contamination rate exceeds the filter&apos;s
            water holding capacity.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Test bulk fuel storage quarterly with ASTM D6304 Karl Fischer titration — before contamination becomes visible',
              'Inspect and seal all storage tank filler caps, vents, and inspection covers against rain ingress',
              'Install fuel transfer filtration with water separation before fuel enters equipment tanks',
              'Keep bulk storage tanks as full as practical to minimise headspace volume available for condensation',
              'Monitor microbial contamination indicators: filter plugging rate, fuel haze, dark deposits at tank outlet',
              'Apply biocide treatment when microbial contamination is confirmed — ASTM D6304 positive does not distinguish microbial from condensation water',
              'Replace all fuel filters and flush the fuel circuit after a water contamination event — do not return equipment to service on contaminated-path filters',
            ].map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', minWidth: '20px', paddingTop: '3px',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{action}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 7 · Recommended Products */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => { dispatchTrustSignal('T-5'); setIntent('FAILURE_DIAGNOSIS'); }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>07 / RECOMMENDED PRODUCTS</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Find fuel water separation elements for your equipment
          </h2>
          <p style={{
            fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
            marginBottom: '1.5rem', textAlign: 'justify',
          }}>
            Product selection follows technology selection. HYDROCORE™ for water separation,
            SYNTEPORE™ for HPCR injector protection, TURBOCORE™ for three-stage systems.
            Equipment make and model determine the correct element dimensions, thread specification,
            and bypass pressure rating.
          </p>
          <CTACard onLeadCapture={() => dispatchTrustSignal('T-6')} />
        </motion.section>

        {/* 8 · Engineering References */}
        <EngineeringRecommendationsSection
          primaryEntityId="CONT-WATER-FUEL"
          queryType="contamination"
          label="08 / ENGINEERING REFERENCES — KNOWLEDGE GRAPH"
        />

        {/* 9 · Related Topics */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginTop: '3.5rem', marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '1.25rem',
          }}>09 / RELATED TOPICS</p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { label: 'Fuel Systems — Standards Domain', href: '/knowledge-system/standards/fuel-systems' },
              { label: 'Diesel Water Contamination — Case Study', href: '/knowledge-system/contamination/diesel-water' },
              { label: 'ASTM D6304 — Karl Fischer Testing', href: '/knowledge-system/standards/fuel-systems' },
              { label: 'Hydraulic Contamination', href: '/engineering/hydraulic-contamination' },
              { label: 'Dust Ingestion — Air Intake', href: '/engineering/dust-ingestion' },
              { label: 'Agriculture — Industry Application', href: '/industries/agriculture' },
              { label: 'Marine — Industry Application', href: '/industries/marine' },
              { label: 'Fleet Fuel Efficiency', href: '/knowledge-system/fleet/fuel-efficiency' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.2)', background: 'rgba(255,241,45,0.03)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '0.9rem 1rem',
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45,
                  }}
                >
                  {link.label} →
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 10 · Next Recommended Journey */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '1.25rem',
          }}>10 / NEXT RECOMMENDED JOURNEY</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                label: 'My fuel system has an active fault',
                href: '/engineering/problem-diagnosis',
                desc: 'Structured root-cause investigation',
                accent: '#f9a8d4',
              },
              {
                label: 'I want to prevent fuel contamination before it occurs',
                href: '/engineering/asset-protection',
                desc: 'Asset protection consultation',
                accent: '#FFF12D',
              },
            ].map((journey) => (
              <Link key={journey.href} href={journey.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: journey.accent }}
                  style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.5rem' }}
                >
                  <p style={{
                    fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                    color: journey.accent, opacity: 0.7, letterSpacing: '0.1em', marginBottom: '0.6rem',
                  }}>{journey.desc.toUpperCase()}</p>
                  <p style={{
                    fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                    color: '#fff', lineHeight: 1.4,
                  }}>{journey.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'What happens when water enters diesel fuel?',
          description: 'Water in diesel fuel causes injector erosion at 1,600–2,500 bar, microbial growth in storage tanks, fuel filter plugging from biomass, and tank corrosion. ASTM D6304 Karl Fischer testing defines the measurement standard.',
          author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
          about: {
            '@type': 'Thing',
            name: 'Diesel Water Contamination',
            description: 'Water ingress into diesel fuel systems causing injector erosion, microbial growth, filter plugging, and tank corrosion.',
          },
          mentions: {
            standards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
            technologies: ['HYDROCORE', 'SYNTEPORE', 'TURBOCORE'],
            contaminationModes: ['water ingress', 'microbial growth', 'filter plugging', 'injector erosion'],
          },
          url: 'https://elimfilters.com/engineering/diesel-water-contamination',
        })}} />

      </div>
    </main>
  );
}

export default function DieselWaterContaminationPage() {
  return (
    <ConversionProvider>
      <DieselWaterContaminationContent />
    </ConversionProvider>
  );
}
