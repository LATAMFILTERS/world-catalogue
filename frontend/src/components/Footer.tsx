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
              borderTop: '1px solid #1a1a1a',
              paddingTop: '50px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Left: Large E image */}
            <motion.div
              whileHover={{ opacity: 1, scale: 1.04 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'left', flex: 1, opacity: 0.8 }}
            >
              <img
                src="/images/e.png"
                alt="ELIMFILTERS"
                style={{ height: '120px' }}
              />
            </motion.div>

            {/* Center: FRISCO TEXAS */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '18px',
                  color: '#666',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                }}
              >
                <strong style={{ color: '#fff' }}>FRISCO TEXAS</strong>
              </div>
            </div>

            {/* Right: Copyright */}
            <div style={{ textAlign: 'right', flex: 1 }}>
              <p
                style={{
                  fontSize: '10px',
                  color: '#444',
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
              >
                © 2015-2026 ELIMFILTERS LLC | Intelligence and Engineering in Filtration
              </p>
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
