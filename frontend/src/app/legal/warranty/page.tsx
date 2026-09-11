'use client';

import '@/i18n';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Scope and Warrantor',
    body: `This Product Warranty & Claims Policy describes the general process used by Kleo Technology LLC for products sold under the ELIMFILTERS® brand. It applies together with any product-specific warranty statement, invoice, authorized distributor documentation, written commercial agreement, and mandatory rights provided by applicable law.

Where a product-specific written warranty or signed commercial agreement provides different coverage, duration, remedies, or procedures, that document controls to the extent permitted by applicable law. This policy does not create a single universal warranty period for every ELIMFILTERS product, market, vehicle, machine, or operating environment.`,
  },
  {
    title: '2. What ELIMFILTERS Product Warranty Covers',
    body: `During the applicable warranty period, ELIMFILTERS warrants covered products against verified defects in materials or workmanship under their intended application and normal service conditions, subject to the terms applicable to the specific product and market.

Warranty evaluation is application-specific. Physical fit alone does not establish functional compatibility. Product selection must account for the applicable equipment configuration, system requirements, dimensions, sealing interface, operating conditions, and any installation or service requirements that apply to the asset.`,
  },
  {
    title: '3. Coverage Period',
    body: `The warranty period, when provided, is the period stated in the documentation applicable to the specific product or transaction, such as product packaging, a warranty certificate, invoice, authorized distributor documentation, product-specific warranty schedule, or signed commercial agreement.

If no separate written warranty period is stated, this page should not be interpreted as creating a universal time or mileage limit. Rights and remedies that cannot lawfully be excluded or limited remain governed by applicable law.`,
  },
  {
    title: '4. Conditions for Proper Warranty Evaluation',
    body: `A complete warranty evaluation normally requires that the product be identifiable as an ELIMFILTERS product and that the claimed failure can be evaluated in the context of the actual application.

Relevant factors may include correct product selection, equipment and housing configuration, installation method, sealing condition, maintenance history, operating duty, contamination exposure, fluid condition where applicable, and compliance with application-specific service requirements. ELIMFILTERS does not require the use of an ELIMFILTERS-selected repair facility or service provider where such a requirement would be prohibited by applicable law.`,
  },
  {
    title: '5. Information to Submit With a Claim',
    body: `To support a timely technical review, claimants should provide as much of the following information as reasonably available:

— Proof of purchase and seller or authorized distributor information
— ELIMFILTERS part number and quantity involved
— Lot, batch, date code, or other traceability marking visible on the product or packaging
— Vehicle, machine, engine, or equipment identification, including VIN or serial number where applicable
— Equipment configuration and application details relevant to the filter or protected system
— Installation date and mileage, hours, or other service reading at installation
— Date of the reported event and mileage, hours, or service reading at the time of the event
— Identity of the installer or service location, when known
— Maintenance and service records relevant to the reported condition
— Photographs of the product, installation, mounting or sealing interface, packaging, and reported damage
— A clear description of the symptoms, sequence of events, diagnostic findings, and any costs being claimed

ELIMFILTERS may request additional information when reasonably necessary to determine root cause.`,
  },
  {
    title: '6. Preserve the Evidence',
    body: `The product involved in a warranty claim should be preserved in substantially the condition in which it was removed from service until ELIMFILTERS or the authorized claim administrator provides disposition instructions. Where relevant and reasonably practicable, associated seals, packaging, installation components, and representative fluid or contamination samples should also be preserved.

Do not cut open, disassemble, clean, alter, discard, or destroy the claimed product before technical inspection unless necessary for safety or specifically authorized. If continued operation could reasonably increase equipment damage, the asset should be taken out of service when it is safe and practicable to do so.

Failure to preserve evidence may limit the technical conclusions that can be reached, but no claim will be denied solely on that basis where applicable law requires otherwise.`,
  },
  {
    title: '7. Technical and Root-Cause Evaluation',
    body: `A product failure occurring near the time of a filter change does not, by itself, establish that the filter was defective. ELIMFILTERS evaluates the complete failure path, which may include the filter, housing, sealing interface, installation condition, system pressure or restriction, lubrication or fuel condition, contamination source, equipment condition, and relevant maintenance history.

The review may include visual inspection, dimensional verification, product traceability, application verification, media or structural examination, fluid or contamination analysis, and comparison with approved product specifications. Submission of a claim is not an admission of product defect or liability.`,
  },
  {
    title: '8. Conditions Generally Outside Warranty Coverage',
    body: `To the extent permitted by applicable law and subject to any product-specific warranty, coverage generally does not extend to conditions caused by factors other than a defect in ELIMFILTERS materials or workmanship, including:

— Incorrect part selection, misapplication, or use in an incompatible equipment configuration
— Improper installation, damaged or duplicated seals, contaminated mounting surfaces, incorrect assembly, or failure to complete required post-installation checks
— Normal service wear, contaminant loading, media saturation, or routine replacement at the end of the product's service interval
— Equipment, housing, pump, valve, injector, engine, hydraulic, cooling, fuel, lubrication, or other system failures not caused by a verified ELIMFILTERS product defect
— Operation outside application-specific limits or maintenance requirements
— Accident, abuse, misuse, improper storage, external contamination, fire, collision, or environmental damage unrelated to a product defect
— Unauthorized alteration of the claimed ELIMFILTERS product that prevents a reliable technical evaluation

These examples do not override rights that cannot lawfully be excluded.`,
  },
  {
    title: '9. Remedies',
    body: `When ELIMFILTERS confirms that a covered product was defective in materials or workmanship, the remedy will be determined under the warranty applicable to that product and market. Depending on the applicable terms, the remedy may include replacement of the covered ELIMFILTERS product, refund or credit of its purchase price, or another remedy required by applicable law or agreed in writing.

Any claim for damage beyond the ELIMFILTERS product itself requires documented technical causation and is governed by the applicable product-specific warranty, written commercial agreement, and law. Nothing in this policy expands or restricts remedies that cannot lawfully be expanded or restricted by contract.`,
  },
  {
    title: '10. Consumer, Commercial, and Regional Rights',
    body: `ELIMFILTERS serves industrial, heavy-duty, fleet, equipment, and automotive markets globally. Warranty rules differ by product type, purchaser, country, state, and whether a transaction is consumer or commercial.

This policy does not exclude, restrict, or modify statutory warranties, implied warranties, remedies, or other rights to the extent those rights cannot lawfully be excluded, restricted, or modified. Consumer-product warranties in the United States may be subject to federal and state requirements that do not apply in the same manner to products sold for resale or commercial purposes.`,
  },
  {
    title: '11. How to Start a Warranty Claim',
    body: `Start a claim through the ELIMFILTERS seller or authorized distributor that supplied the product when practicable, or contact ELIMFILTERS directly at info@elimfilters.com. Include “Warranty Claim” in the subject line and provide the available claim information listed above.

ELIMFILTERS may issue return, inspection, sample-preservation, or shipping instructions after preliminary review. Products should not be shipped without instructions when hazardous fluids, contamination, transport restrictions, or special handling requirements may apply.`,
  },
  {
    title: '12. Effective Terms and Updates',
    body: `This policy is effective September 2026. ELIMFILTERS may update its warranty administration procedures as products, markets, regulations, and support systems evolve. Unless a change is required by law or expressly agreed otherwise, an update to this website does not retroactively reduce warranty coverage already granted in the written terms applicable when a product was purchased.

Questions regarding product-specific warranty coverage may be directed to info@elimfilters.com before purchase or installation.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Contact', href: '/contact' },
];

export default function ProductWarrantyPage() {
  return (
    <>
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <div style={{ padding: '1.5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← ELIMFILTERS
          </Link>
        </div>

        <section style={{ padding: '4rem 8% 3rem', borderBottom: '1px solid rgba(255,241,45,0.08)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', opacity: 0.8, marginBottom: '1rem', textTransform: 'uppercase' }}>
              Legal · Product Warranty
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15 }}>
              Product Warranty & Claims Policy
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Effective: September 2026
            </p>
          </motion.div>
        </section>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 8%' }}>
          <section style={{ marginBottom: '3rem', padding: '1.25rem 1.4rem', border: '1px solid rgba(255,241,45,0.18)', borderRadius: '6px', background: 'rgba(255,241,45,0.025)' }}>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.76)', lineHeight: 1.8 }}>
              ELIMFILTERS evaluates warranty claims through documented application, installation, traceability, and root-cause evidence. Preserve the claimed product before inspection and contact ELIMFILTERS or the supplying authorized distributor for claim instructions.
            </p>
          </section>

          {SECTIONS.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.025 }}
              style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem', color: '#FFF12D', marginBottom: '0.9rem', lineHeight: 1.35 }}>
                {section.title}
              </h2>
              {section.body.split('\n\n').map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: '0.85rem' }}>
                  {paragraph}
                </p>
              ))}
            </motion.section>
          ))}

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,241,45,0.12)' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Related Documents
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {RELATED.map((item) => (
                <Link key={item.href} href={item.href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', padding: '0.4rem 0.85rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
