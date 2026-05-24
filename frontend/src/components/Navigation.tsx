'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.startsWith('en');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        background: scrolled ? 'rgba(0,0,0,0.96)' : 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <motion.div whileHover={{ opacity: 0.85 }} transition={{ duration: 0.2 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/assets/logo-elimfilters.png"
              alt="ELIMFILTERS"
              width={220}
              height={220}
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="hidden-mobile">
          <NavLink href="/industries">{t('nav.industries')}</NavLink>
          <NavLink href="/systems">{t('nav.systems')}</NavLink>
          <NavLink href="/technologies">{t('nav.technologies')}</NavLink>
          <NavLink href="/knowledge-system">{t('nav.knowledge')}</NavLink>
          <NavLink href="/contact">{t('nav.contact')}</NavLink>

          {/* EN toggle — only show when not in English */}
          {!isEnglish && (
            <motion.button
              onClick={() => i18n.changeLanguage('en')}
              whileHover={{ borderColor: '#FFF12D', color: '#FFF12D' }}
              transition={{ duration: 0.18 }}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
              }}
            >
              EN
            </motion.button>
          )}

          <motion.a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ boxShadow: '0 0 28px rgba(255,241,45,0.55)', y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              padding: '0.5rem 1.25rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {t('nav.findMyFilter')}
          </motion.a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'none' }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  rotate: menuOpen && i === 0 ? 45 : menuOpen && i === 2 ? -45 : 0,
                  scaleX: menuOpen && i === 1 ? 0 : 1,
                  y: menuOpen && i === 0 ? 7 : menuOpen && i === 2 ? -7 : 0,
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block', height: '2px', background: '#FFF12D', transformOrigin: 'center' }}
              />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.98)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
              style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {[
                { href: '/industries', label: t('nav.industries') },
                { href: '/systems', label: t('nav.systems') },
                { href: '/technologies', label: t('nav.technologies') },
                { href: '/knowledge-system', label: t('nav.knowledge') },
                { href: '/contact', label: t('nav.contact') },
              ].map((item) => (
                <motion.div
                  key={item.href}
                  variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={item.href} style={mobileLinkStyle} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href="https://part-search.elimfilters.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...mobileLinkStyle, color: '#FFF12D', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}
                >
                  {t('nav.findMyFilter')} →
                </a>
                {!isEnglish && (
                  <button
                    onClick={() => { i18n.changeLanguage('en'); setMenuOpen(false); }}
                    style={{ ...mobileLinkStyle, background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', cursor: 'pointer', padding: '0.5rem 1rem', textAlign: 'left' }}
                  >
                    EN — Switch to English
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <Link
        href={href}
        style={{
          color: hovered ? '#FFF12D' : 'rgba(255,255,255,0.75)',
          textDecoration: 'none',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
          fontWeight: 500,
          letterSpacing: '0.05em',
          transition: 'color 0.2s ease',
          display: 'block',
          paddingBottom: '3px',
        }}
      >
        {children}
      </Link>
      <motion.span
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: '#FFF12D',
          transformOrigin: 'left',
          display: 'block',
        }}
      />
    </motion.div>
  );
}

const mobileLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  fontWeight: 500,
};
