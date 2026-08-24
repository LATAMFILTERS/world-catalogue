'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRODUCT_FAMILIES, type FamilyKey } from '@/lib/product-families-data';

const CORE_KEYS: FamilyKey[] = ['primary-air', 'primary-fuel', 'oil-filters', 'cabin-filters'];
const EXTRA_HD_KEYS: FamilyKey[] = ['fuel-water-separators', 'air-dryer-filters', 'coolant-filters'];

// Approved ELIMFILTERS product renders, hosted on Cloudflare R2 (elimfilters-renders bucket).
const R2_BASE = 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20';

// HD-prefix renders (EA1/EF9/EL8/EC1/ES9/ED4/EW7) — used by every industry except Automotive.
const HD_IMAGES: Partial<Record<FamilyKey, string>> = {
  'primary-air': `${R2_BASE}/EA10489-MACROCORE-approved-opt.png`,
  'secondary-air': `${R2_BASE}/EA10489-MACROCORE-approved-opt.png`,
  'air-cleaner-housings': `${R2_BASE}/EA20080-INTEKCORE-approved-opt.png`,
  'primary-fuel': `${R2_BASE}/EF98279-SYNTAPORE-approved-opt.png`,
  'secondary-fuel': `${R2_BASE}/EF98960-SYNTAPORE-approved-opt.png`,
  'fuel-water-separators': `${R2_BASE}/ES90990-HYDROCORE-approved-opt.png`,
  'oil-filters': `${R2_BASE}/EL87900-LF14000NN-1of20-approved.png`,
  'hydraulic-filters': `${R2_BASE}/EH60388-NANOFORCE-approved-opt.png`,
  'coolant-filters': `${R2_BASE}/EW74685-WF2077-2of20-approved-opt.png`,
  'cabin-filters': `${R2_BASE}/EC10249-MICROKAPPA-approved-opt.png`,
  'air-dryer-filters': `${R2_BASE}/ED43571-THERMACORE-approved-opt.png`,
};

// LD-prefix renders (EA3/EF3/EL3/EC3) — Automotive only. EF3 (fuel) and EC3 (cabin) have no
// approved render in the bucket yet, so those two fall back to the HD image until produced.
const LD_IMAGES: Partial<Record<FamilyKey, string>> = {
  'primary-air': `${R2_BASE}/EA30755-MACROCORE-approved-opt.png`,
  'oil-filters': `${R2_BASE}/EL36889-SYNTRAX-approved-opt.png`,
};

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

const INDUSTRY_INTRO: Record<string, string> = {
  Mining: 'Mining operations run on machines that cost more per hour of downtime than almost any other industry. ELIMFILTERS® protection systems are built to hold up under constant dust loading, vibration, and extreme duty cycles, so contamination does not turn into an unplanned failure. Working through a global distributor network, we make sure the right protection system is available where the equipment actually operates, not just where it was purchased.',
  Agriculture: 'Planting and harvest windows do not wait for equipment repairs. ELIMFILTERS® filtration technology is engineered to extend service intervals and protect fuel and lubrication systems through heavy dust and long operating hours, which translates into better fuel efficiency and less time in the shop when the season matters most. Less downtime means more productive hours in the field and a lower total cost of ownership across the equipment’s working life.',
  Construction: 'Every day a machine sits idle on a jobsite is a day a project falls further behind schedule. ELIMFILTERS® filtration protects the hydraulic systems, engines, and drivetrains that keep excavators, loaders, and compactors working through abrasive silica dust and constant start-stop cycles. Our distributor partners keep that protection close to the jobsite, so contractors spend less time waiting on parts and more time building.',
  'Oil Gas': 'Energy operations often run in places where a service call can take days, not hours. ELIMFILTERS® systems are engineered to withstand salt air, fuel contamination, and the pressure cycling that comes with continuous-duty compressors, turbines, and pumps. Through distributors positioned across upstream, offshore, and energy-support markets, we help operators protect equipment that cannot afford to fail without warning.',
  Marine: 'At sea, a contamination problem does not wait for the next port call. ELIMFILTERS® marine protection systems are built to handle salt air, humidity, and fuel-water contamination that put engines, deck machinery, and steering systems at risk on every voyage. Our distributor network keeps the correct protection system stocked and available across the ports and service centers vessels actually depend on.',
  'Power Generation': 'Backup power has to work the moment it is needed, with no second chance. Our technical team works closely with ELIMFILTERS® distributor partners to match the right protection system to each generator set, fuel system, and cooling circuit, whether it is running continuously or sitting in standby readiness for months. That close distributor relationship is what lets hospitals, data centers, and industrial plants trust their emergency power to stay ready.',
  'Trucks Fleets': 'A truck that is not moving is not earning. ELIMFILTERS® filtration and protection systems are engineered to extend service intervals and protect HPCR fuel systems, engines, and drivetrains across long-haul, regional, and vocational duty cycles, which means fewer surprises and lower total cost of ownership per mile. Because our distributors are positioned across the routes fleets actually run, the right part is never far from where the truck is parked.',
  Manufacturing: 'In a production environment, a single failed filter can stop an entire line. ELIMFILTERS® systems protect the compressors, hydraulic power units, and rotating machinery that keep manufacturing facilities running through continuous duty cycles and process contamination. Our distributor partners help plants keep the correct protection system in inventory, so a scheduled service interval never turns into an unscheduled shutdown.',
  Railway: 'Rail networks run on tight schedules, and a locomotive pulled for unplanned maintenance affects every train behind it. ELIMFILTERS® protection systems are engineered for the vibration, thermal cycling, and extended duty cycles of passenger and freight locomotives, helping maintenance teams plan service instead of reacting to failure. Our distributors support the maintenance depots and rail operators that keep networks moving on schedule.',
  'Waste Municipal': 'A refuse truck or emergency vehicle that is out of service is a gap in a service the public depends on every day. ELIMFILTERS® systems are built for the stop-and-go duty cycles, dust, and debris exposure that define municipal fleet work, protecting engines and drivetrains through 24/7 service demand. Our distributor network keeps municipal and public works fleets supplied with the protection systems they need to stay in service.',
  'Bus Coach': 'Every bus taken out of rotation is a route that runs short. ELIMFILTERS® protection systems are engineered for the stop-and-go cycles, pneumatic brake systems, and cabin air quality that transit and coach operators depend on to keep passengers moving safely. Working with distributors that serve transit depots directly, we help operators protect both the vehicle and the passenger experience.',
  Automotive: 'Automotive and light-commercial fleets run on predictable maintenance, not surprises. ELIMFILTERS® systems protect engines, fuel systems, and cabin air quality across passenger vehicles, delivery fleets, and service vans through everyday urban and highway duty cycles. Because our distributor network reaches the service shops and parts counters drivers already use, the right filter is always within reach.',
};

interface IndustryFilterCarouselProps {
  dutyClass: 'HD' | 'LD';
  industryName: string;
}

export function IndustryFilterCarousel({ dutyClass, industryName }: IndustryFilterCarouselProps) {
  const keys = dutyClass === 'LD' ? CORE_KEYS : [...CORE_KEYS, ...EXTRA_HD_KEYS];
  const families = keys.map((key) => PRODUCT_FAMILIES[key]);
  const [index, setIndex] = useState(0);

  const go = (direction: 1 | -1) => {
    setIndex((prev) => (prev + direction + families.length) % families.length);
  };

  const family = families[index];
  const image = (dutyClass === 'LD' ? LD_IMAGES[family.key] : undefined) ?? HD_IMAGES[family.key];

  return (
    <section style={{ background: '#000', padding: 'clamp(4rem, 8vw, 7rem) 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '0 clamp(1.25rem, 6vw, 6rem)', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
        <h2
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 0.9rem',
          }}
        >
          Filters Built For <span style={{ color: '#FFF12D' }}>{industryName}</span>
        </h2>
        <p style={{ fontFamily: bodyFont, fontSize: '1rem', lineHeight: 1.78, color: 'rgba(255,255,255,0.58)', maxWidth: '780px', margin: 0 }}>
          {INDUSTRY_INTRO[industryName] ?? `We are proud to serve customers who build a better future and protect what matters. ELIMFILTERS® protection systems keep ${industryName.toLowerCase()} equipment running, because the industries we serve most depend on us being reliable.`}
        </p>
      </div>

      <div style={{ position: 'relative', padding: '0 clamp(1.25rem, 6vw, 6rem)' }}>
        <div
          className="filter-carousel-slide"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
            gap: 'clamp(2rem, 5vw, 4rem)',
            alignItems: 'center',
            minHeight: '360px',
          }}
        >
          <div>
            <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.16em', color: '#FFF12D' }}>
              {String(index + 1).padStart(2, '0')} / {String(families.length).padStart(2, '0')}
            </span>
            <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', color: '#fff', margin: '0.9rem 0 1.1rem', textTransform: 'uppercase' }}>
              {family.name}
            </h3>
            <p style={{ fontFamily: bodyFont, fontSize: '1.02rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', margin: '0 0 1.5rem', maxWidth: '520px' }}>
              {family.purpose}
            </p>
            <Link
              href={`/families/${family.slug}/`}
              style={{
                display: 'inline-block',
                fontFamily: displayFont,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: '#000',
                background: '#FFF12D',
                padding: '0.85rem 1.4rem',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              View {family.name} →
            </Link>
            <button type="button" aria-label="Previous filter" onClick={() => go(-1)} style={{ ...arrowButtonStyle, marginTop: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              {'<'}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#fff' }}>
              <img
                src={image}
                alt={family.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '1.5rem' }}
              />
            </div>
            <button
              type="button"
              aria-label="Next filter"
              onClick={() => go(1)}
              style={{ ...arrowButtonStyle, position: 'absolute', top: '50%', right: '-24px', transform: 'translateY(-50%)' }}
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const arrowButtonStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: bodyFont,
  fontSize: '1.1rem',
  transition: 'all 0.2s ease',
};
