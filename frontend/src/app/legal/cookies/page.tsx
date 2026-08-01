'use client';

import '@/i18n';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  { title: '1. Scope', body: `This Cookie Policy explains how ELIMFILTERS uses cookies, local storage, pixels, software development kits, and similar technologies across elimfilters.com, Part Search, distributor tools, and related digital services.` },
  { title: '2. Strictly Necessary Technologies', body: `Strictly necessary technologies support security, session continuity, language preferences, load balancing, fraud prevention, and storage of your consent choice. These technologies are required for core platform operation and cannot be disabled through the consent banner.` },
  { title: '3. Analytics Technologies', body: `With your consent, ELIMFILTERS may use Google Analytics 4, PostHog, Microsoft Clarity, or comparable providers to understand page visits, navigation, searches, feature use, errors, device characteristics, and general interaction patterns. These providers may receive technical identifiers and usage data in accordance with their own terms and ELIMFILTERS data-processing arrangements.` },
  { title: '4. Advertising and Social Media', body: `ELIMFILTERS does not currently use cookies to sell personal information. If advertising, retargeting, social-media pixels, or cross-context behavioral advertising are introduced, this policy and the consent controls will be updated before those technologies are activated where consent is required.` },
  { title: '5. Consent and Withdrawal', body: `Optional analytics technologies should not be activated until you select ACCEPT. Selecting DECLINE should prevent optional analytics from loading. Your choice is stored so the banner does not reappear on every visit. You may withdraw or change consent by clearing site storage or using any preference control made available on the platform.` },
  { title: '6. Retention', body: `Cookie and identifier retention periods vary by purpose and provider. ELIMFILTERS configures retention to the shortest period reasonably necessary for analytics, security, and service improvement. Aggregated or de-identified information may be retained longer where it no longer identifies an individual.` },
  { title: '7. Browser Controls', body: `Most browsers allow you to block or delete cookies and site storage. Blocking strictly necessary technologies may prevent account access, consent storage, language persistence, or other platform functions.` },
  { title: '8. Changes', body: `ELIMFILTERS may update this Cookie Policy when technologies, providers, or legal requirements change. Material changes will be reflected by the effective date and, where appropriate, renewed consent.` },
  { title: '9. Contact', body: `Questions about cookies or analytics may be sent to info@elimfilters.com.` },
];

export default function CookiePolicyPage() {
  return <><Navigation /><main style={{ background:'#000', color:'#fff', minHeight:'100vh' }}>
    <div style={{ padding:'1.5rem 8%', borderBottom:'1px solid rgba(255,255,255,0.04)' }}><Link href="/" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', letterSpacing:'0.14em', color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>← ELIMFILTERS</Link></div>
    <section style={{ padding:'4rem 8% 3rem', borderBottom:'1px solid rgba(255,241,45,0.08)' }}><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}><p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem', letterSpacing:'0.18em', color:'#FFF12D', opacity:0.8, marginBottom:'1rem', textTransform:'uppercase' }}>{'// Legal · Cookies'}</p><h1 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'clamp(2rem, 4vw, 3rem)', margin:'0 0 1rem' }}>Cookie Policy</h1><p style={{ color:'rgba(255,255,255,0.45)', margin:0 }}>Last updated: August 2026</p></motion.div></section>
    <div style={{ maxWidth:'820px', margin:'0 auto', padding:'4rem 8%' }}>{SECTIONS.map((s,i)=><section key={i} style={{ marginBottom:'2.5rem', paddingBottom:'2.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)' }}><h2 style={{ fontSize:'1.05rem', color:'#FFF12D', marginBottom:'0.9rem' }}>{s.title}</h2><p style={{ fontSize:'0.92rem', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>{s.body}</p></section>)}</div>
  </main><Footer /></>;
}
