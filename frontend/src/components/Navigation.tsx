'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { detectGeoLanguage } from '@/lib/geoLanguage';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ar', label: 'العربية' },
  { code: 'fa', label: 'فارسی' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.slice(0, 2) || 'en';

  // Geo-detect language on first load
  useEffect(() => {
    detectGeoLanguage().then(({ language, showSwitcher: show }) => {
      i18n.changeLanguage(language);
      setShowSwitcher(show);
    });
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
    setMenuOpen(false);
  };

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

          {/* Language switcher — shown for all non-US/CA users */}
          {showSwitcher && (
            <div ref={langRef} style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setLangOpen(!langOpen)}
                whileHover={{ borderColor: '#FFF12D', color: '#FFF12D' }}
                transition={{ duration: 0.18 }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRadius: '2px',
                }}
              >
                {currentLang.toUpperCase()}
                <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{langOpen ? '▲' : '▼'}</span>
              </motion.button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      minWidth: '150px',
                      overflow: 'hidden',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                      zIndex: 200,
                    }}
                  >
                    {LANGUAGES.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => handleLangChange(code)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.6rem 1rem',
                          background: currentLang === code ? 'rgba(255,241,45,0.08)' : 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          color: currentLang === code ? '#FFF12D' : 'rgba(255,255,255,0.65)',
                          fontFamily: code === 'ar' || code === 'fa' ? 'system-ui, sans-serif' : 'Outfit, sans-serif',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                          direction: code === 'ar' || code === 'fa' ? 'rtl' : 'ltr',
                        }}
                        onMouseEnter={(e) => {
                          if (currentLang !== code) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#fff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentLang !== code) {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                          }
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <a
                  href="https://part-search.elimfilters.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...mobileLinkStyle, color: '#FFF12D', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}
                >
                  {t('nav.findMyFilter')} →
                </a>

                {/* Mobile language picker — non-US/CA only */}
                {showSwitcher && (
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                      Language / Idioma
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {LANGUAGES.map(({ code, label }) => (
                        <button
                          key={code}
                          onClick={() => handleLangChange(code)}
                          style={{
                            background: currentLang === code ? 'rgba(255,241,45,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${currentLang === code ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            color: currentLang === code ? '#FFF12D' : 'rgba(255,255,255,0.55)',
                            fontFamily: code === 'ar' || code === 'fa' ? 'system-ui, sans-serif' : 'Outfit, sans-serif',
                            fontSize: '0.78rem',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            borderRadius: '2px',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
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
