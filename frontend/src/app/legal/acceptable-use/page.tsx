'use client';

import '@/i18n';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  { title: '1. Authorized Use', body: `ELIMFILTERS platforms may be used only for lawful product research, technical support, equipment maintenance, purchasing, distributor operations, and other purposes expressly authorized by ELIMFILTERS. Access does not transfer ownership of platform content, databases, software, or technical intelligence.` },
  { title: '2. Security Restrictions', body: `You may not probe, scan, penetration-test, disrupt, overload, bypass, or attempt to defeat authentication, rate limits, access controls, monitoring, or security measures without prior written authorization. Introducing malware, malicious prompts, destructive code, or unauthorized automated traffic is prohibited.` },
  { title: '3. Automated Extraction', body: `Scraping, crawling, harvesting, bulk downloading, automated querying, systematic copying, or extraction of catalog data, cross references, prices, specifications, documents, or AI outputs is prohibited unless expressly authorized in writing. You may not use ELIMFILTERS data or outputs to build a competing database, service, model, or product.` },
  { title: '4. Artificial Intelligence Misuse', body: `You may not use AI features to reveal system instructions, obtain confidential information, evade safeguards, generate deceptive technical claims, impersonate ELIMFILTERS personnel, or reconstruct proprietary datasets. Repeated or scripted prompting intended to extract the platform knowledge base is prohibited.` },
  { title: '5. Accounts and Credentials', body: `Credentials are personal to the authorized user or organization. Sharing, reselling, transferring, sublicensing, or using another person's credentials is prohibited. Users must promptly report suspected unauthorized access and remain responsible for activity performed through their accounts to the extent permitted by law.` },
  { title: '6. Data and Content', body: `You may not upload unlawful, infringing, deceptive, defamatory, malicious, confidential third-party, export-controlled, or unnecessarily sensitive personal information. You must have authority to submit equipment data, documents, photographs, trademarks, and other materials provided to ELIMFILTERS.` },
  { title: '7. Commercial and Technical Misrepresentation', body: `You may not alter, misstate, remove context from, or represent ELIMFILTERS technical guidance, cross-reference data, certifications, product claims, or AI outputs as independently verified engineering conclusions. Product selection and installation must be validated for the specific application.` },
  { title: '8. Enforcement', body: `ELIMFILTERS may investigate suspected violations and may rate-limit, suspend, terminate, preserve evidence, or restrict access when reasonably necessary to protect users, systems, data, intellectual property, or legal rights. Serious violations may be reported to affected parties or competent authorities where legally appropriate.` },
  { title: '9. Contact', body: `Security concerns, requests for authorized testing, and acceptable-use questions may be sent to support@elimfilters.com.` },
];

export default function AcceptableUsePolicyPage() {
  return <><Navigation /><main style={{ background:'#000', color:'#fff', minHeight:'100vh' }}>
    <div style={{ padding:'1.5rem 8%', borderBottom:'1px solid rgba(255,255,255,0.04)' }}><Link href="/" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', letterSpacing:'0.14em', color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>← ELIMFILTERS</Link></div>
    <section style={{ padding:'4rem 8% 3rem', borderBottom:'1px solid rgba(255,241,45,0.08)' }}><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}><p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem', letterSpacing:'0.18em', color:'#FFF12D', opacity:0.8, marginBottom:'1rem', textTransform:'uppercase' }}>{'Legal · Acceptable Use'}</p><h1 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'clamp(2rem, 4vw, 3rem)', margin:'0 0 1rem' }}>Acceptable Use Policy</h1><p style={{ color:'rgba(255,255,255,0.45)', margin:0 }}>Last updated: August 2026</p></motion.div></section>
    <div style={{ maxWidth:'820px', margin:'0 auto', padding:'4rem 8%' }}>{SECTIONS.map((s,i)=><section key={i} style={{ marginBottom:'2.5rem', paddingBottom:'2.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)' }}><h2 style={{ fontSize:'1.05rem', color:'#FFF12D', marginBottom:'0.9rem' }}>{s.title}</h2><p style={{ fontSize:'0.92rem', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>{s.body}</p></section>)}</div>
  </main><Footer /></>;
}
