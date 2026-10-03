'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { localeFromPath } from '@/i18n-locales';
import { LanguageMenu } from './LanguageMenu';

const HEADER_DISPLAY_FONT = 'Chakra Petch, Arial Narrow, monospace';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const routeLocale = localeFromPath(pathname);
  const contactHref = routeLocale ? `/${routeLocale}/contact/` : '/contact';
  const { t } = useTranslation();

  useEffect(() => {
    const isHome = pathname === '/';

    const handler = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 40);

      if (!isHome || menuOpen || currentY <= 40) {
        setHeaderVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setHeaderVisible(false);
      } else if (currentY < lastScrollY.current - 4) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [pathname, menuOpen]);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transform: headerVisible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.28s ease, background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        background: scrolled ? 'rgba(0,0,0,0.70)' : 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      <div style={{ width: '100%', maxWidth: 'none', margin: 0, padding: 'clamp(0.65rem, 2.4vw, 1.4rem) 0.75rem clamp(0.5rem, 1.7vw, 0.9rem) clamp(1rem, 2vw, 1.75rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} role="banner">
        <motion.div whileHover={{ opacity: 0.85 }} transition={{ duration: 0.2 }} style={{ marginLeft: 0, transform: 'translateY(-10px) scale(0.8568)', transformOrigin: 'bottom left', flexShrink: 0 }}>
          <Link href="/" aria-label="ELIMFILTERS — home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {logoError ? (
              <span style={{ fontFamily: HEADER_DISPLAY_FONT, fontWeight: 700, fontSize: 'clamp(1.05rem, 3.6vw, 1.4rem)', letterSpacing: '-0.01em', color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>ELIMFILTERS</span>
            ) : (
              // Size is intentionally fixed — Víctor asked explicitly to keep the
              // header at this exact size (2026-09-01). Don't re-enlarge it.
              <img
                src="/assets/elimfilters-logo-white.png"
                alt="ELIMFILTERS — Total Asset Protection"
                className="nav-logo"
                onError={() => setLogoError(true)}
                style={{ height: 'clamp(36px, 7.8vw, 58px)', width: 'auto', display: 'block', objectFit: 'contain', flexShrink: 0 }}
              />
            )}
          </Link>
        </motion.div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.9rem, 1vw, 1.25rem)', flex: 1, justifyContent: 'space-between', minWidth: 0, marginLeft: 'clamp(1.25rem, 2.4vw, 2.5rem)' }} className="hidden-mobile" aria-label="Main navigation">
          <NavLink href="/industries">{t('nav.industries', 'Industries')}</NavLink>
          <NavLink href="/systems">{t('nav.systems', 'Systems')}</NavLink>
          <NavLink href="/technologies">{t('nav.technologies', 'Technologies')}</NavLink>
          <NavLink href="/knowledge-center/">{t('nav.knowledgeCenter', 'Knowledge Center')}</NavLink>
          <NavLink href="/industrial-process" accent>Industrial & Process</NavLink>
          <NavLink href="/about">{t('nav.about', 'Company')}</NavLink>
          <NavLink href={contactHref}>{t('nav.contact', 'Contact')}</NavLink>

          <motion.a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" whileHover={{ boxShadow: '0 0 28px rgba(255,241,45,0.55)', y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }} style={{ background: '#FFF12D', color: '#000', fontFamily: HEADER_DISPLAY_FONT, fontWeight: 700, fontSize: '0.80rem', letterSpacing: '0.07em', padding: '0.38rem 0.72rem', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {t('nav.findMyFilter', 'FIND MY FILTER')}
          </motion.a>
          <LanguageMenu style={{ flexShrink: 0 }} />
        </nav>

        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: '0.1rem' }}>
        <LanguageMenu />
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.65rem' }} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen}>
          <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0, 1, 2].map((i) => (
              <motion.span key={i} animate={{ rotate: menuOpen && i === 0 ? 45 : menuOpen && i === 2 ? -45 : 0, scaleX: menuOpen && i === 1 ? 0 : 1, y: menuOpen && i === 0 ? 7 : menuOpen && i === 2 ? -7 : 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'block', height: '2px', background: '#FFF12D', transformOrigin: 'center' }} />
            ))}
          </div>
        </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }} style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { href: '/industries', label: t('nav.industries', 'Industries') },
                { href: '/systems', label: t('nav.systems', 'Systems') },
                { href: '/technologies', label: t('nav.technologies', 'Technologies') },
                { href: '/knowledge-center/', label: t('nav.knowledge', 'Knowledge') },
                { href: '/industrial-process', label: 'Industrial & Process', accent: true },
                { href: '/about', label: t('nav.about', 'Company') },
                { href: contactHref, label: t('nav.contact', 'Contact') },
              ].map((item) => (
                <motion.div key={item.href} variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <Link href={item.href} style={{ ...mobileLinkStyle, ...(item.accent ? { color: '#FFF12D', fontWeight: 700 } : {}) }} onClick={() => setMenuOpen(false)}>{item.label}</Link>
                </motion.div>
              ))}
              <motion.div variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{ ...mobileLinkStyle, color: '#FFF12D', fontFamily: HEADER_DISPLAY_FONT, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('nav.findMyFilter', 'FIND MY FILTER')} →</a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* The full menu (links + CTA + globe) only fits from 1280px in en/es/pt; below that the
           hamburger bar is used, and it carries the globe too. */
        @media (max-width: 1279px) {
          .hidden-mobile{display:none!important}
          .show-mobile{display:flex!important}
        }
        @media (min-width: 1280px) {.show-mobile{display:none!important}}
      `}</style>
    </nav>
  );
}

function NavLink({ href, children, accent = false }: { href: string; children: React.ReactNode; accent?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} style={{ position: 'relative', display: 'inline-block' }}>
      <Link href={href} style={{ color: accent ? '#FFF12D' : (hovered ? '#FFF12D' : 'rgba(255,255,255,0.75)'), textDecoration: 'none', fontFamily: HEADER_DISPLAY_FONT, fontSize: '0.97rem', fontWeight: accent ? 700 : 600, letterSpacing: accent ? '0.04em' : '0.025em', transition: 'color 0.2s ease', display: 'block', paddingBottom: '3px' }}>{children}</Link>
      <motion.span animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: '#FFF12D', transformOrigin: 'left', display: 'block' }} />
    </motion.div>
  );
}

const mobileLinkStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontFamily: HEADER_DISPLAY_FONT, fontSize: '1rem', fontWeight: 600, letterSpacing: '0.025em' };
