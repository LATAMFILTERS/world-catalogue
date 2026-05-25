'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

const colVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Footer() {
  return (
    <footer
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.02)',
        padding: '4rem 0 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        {/* Grid columns */}
        <StaggerContainer
          staggerDelay={0.1}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px',
            marginBottom: '60px',
          }}
        >
          {/* Company */}
          <motion.div variants={colVariants}>
            <div style={colTitleStyle}>Company</div>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/industries">Industries</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </motion.div>

          {/* Systems */}
          <motion.div variants={colVariants}>
            <div style={colTitleStyle}>Systems</div>
            <FooterLinkExternal href="https://part-search.elimfilters.com/">Part Search</FooterLinkExternal>
            <FooterLink href="/technologies">Technologies</FooterLink>
            <FooterLink href="/systems">Systems</FooterLink>
          </motion.div>

          {/* Support */}
          <motion.div variants={colVariants}>
            <div style={colTitleStyle}>Support</div>
            <FooterLink href="/contact">Technical Support</FooterLink>
            <FooterLink href="/distributor-application">Become a Dealer</FooterLink>
            <FooterLink href="/warranty">Warranty</FooterLink>
          </motion.div>

          {/* Follow Us */}
          <motion.div variants={colVariants}>
            <div style={colTitleStyle}>Follow Us</div>
            <FooterLinkExternal href="https://www.linkedin.com/company/elimfilters/?viewAsMember=false">LinkedIn</FooterLinkExternal>
            <FooterLinkExternal href="https://www.instagram.com/elimfilters.global/?hl=en">Instagram</FooterLinkExternal>
            <FooterLinkExternal href="https://www.youtube.com/@elimfilters9112">YouTube</FooterLinkExternal>
          </motion.div>
        </StaggerContainer>

        {/* Bottom section */}
        <AnimateIn direction="up" delay={0.1}>
          <div
            className="footer-bottom"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              marginTop: '60px',
              paddingTop: '40px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            {/* Left: E logo */}
            <motion.div
              whileHover={{ opacity: 1, scale: 1.04 }}
              transition={{ duration: 0.3 }}
              style={{ opacity: 0.7 }}
            >
              <img
                src="/images/e.png"
                alt="ELIMFILTERS"
                style={{ height: '80px', width: 'auto' }}
              />
            </motion.div>

            {/* Center: Company info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>
                © 2015-2026 ELIMFILTERS LLC
              </p>
              <p style={{
                margin: '0',
                fontSize: '11px',
                color: '#666',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.5px',
              }}>
                Intelligence and Engineering in Filtration
              </p>
            </div>

            {/* Right: Kleo + Address + Social */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              {/* Kleo Logo */}
              <div style={{
                background: '#000',
                padding: '0.25rem 0',
              }}>
                <img
                  src="/images/kleo-tech-sf.avif"
                  alt="Kleo Tech"
                  style={{
                    maxHeight: '45px',
                    maxWidth: '140px',
                    objectFit: 'contain',
                    display: 'block',
                    backgroundColor: '#000',
                    filter: 'brightness(0.95) contrast(1.1)',
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>

              {/* Address */}
              <div style={{
                fontSize: '11px',
                color: '#666',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: "'Barlow Condensed', sans-serif",
                textAlign: 'right',
                lineHeight: '1.4',
              }}>
                Frisco, Texas
              </div>

              {/* Social Icons Row */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <SocialLink href="https://www.linkedin.com/company/elimfilters" label="LinkedIn" />
                <SocialLink href="https://www.instagram.com/elimfilters.global" label="Instagram" />
                <SocialLink href="https://www.youtube.com/@elimfilters9112" label="YouTube" />
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: '12px' }}
    >
      <Link
        href={href}
        style={{
          fontSize: '14px',
          textDecoration: 'none',
          color: '#888',
          display: 'block',
          fontFamily: 'Barlow, sans-serif',
          transition: 'color 0.25s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
      >
        {children}
      </Link>
    </motion.div>
  );
}

function FooterLinkExternal({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: '12px' }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '14px',
          textDecoration: 'none',
          color: '#888',
          display: 'block',
          fontFamily: 'Barlow, sans-serif',
          transition: 'color 0.25s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
      >
        {children}
      </a>
    </motion.div>
  );
}

const colTitleStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: '13px',
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  marginBottom: '25px',
};

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: '1px solid rgba(255,241,45,0.3)',
        color: '#888',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: 'bold',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#FFF12D';
        e.currentTarget.style.color = '#FFF12D';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
        e.currentTarget.style.color = '#888';
      }}
    >
      {label.charAt(0).toUpperCase()}
    </motion.a>
  );
}
