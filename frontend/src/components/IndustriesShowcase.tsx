'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CANONICAL_TECHNOLOGY_LIST } from '@/lib/canonical-technologies';
import styles from './IndustriesShowcase.module.css';

const INDUSTRIES = [
  { slug: 'mining', title: 'Mining', image: '/images/mineria-1.avif' },
  { slug: 'agriculture', title: 'Agriculture', image: '/images/agricultor-1.avif' },
  { slug: 'construction', title: 'Construction', image: '/images/chino-construction.avif' },
  { slug: 'oil-gas', title: 'Oil & Gas', image: '/images/ingpetrolero.avif' },
  { slug: 'marine', title: 'Marine', image: '/images/ingmarine.avif' },
  { slug: 'power-generation', title: 'Power Generation', image: '/images/generatorsupervisor.avif' },
  { slug: 'trucks-fleets', title: 'Truck Fleets', image: '/images/transport.avif' },
  { slug: 'manufacturing', title: 'Manufacturing', image: '/images/manufactura.avif' },
  { slug: 'railway', title: 'Railway', image: '/images/ing-railway.avif' },
  { slug: 'waste-municipal', title: 'Waste & Municipal', image: '/images/wasted-municipal.avif' },
  { slug: 'bus-coach', title: 'Bus & Coach', image: '/images/bus-hero.avif' },
  { slug: 'automotive', title: 'Automotive', image: '/images/Automotive-1.avif' },
] as const;

const CARD_WIDTH = 300;
const CARD_GAP = 16;
const IMAGES_PER_COLUMN = 4;
const TECHNOLOGIES = CANONICAL_TECHNOLOGY_LIST;
const COLUMN_COUNT = TECHNOLOGIES.length;

const ANIMATION_COLUMNS = TECHNOLOGIES.map((technology, technologyIndex) => ({
  technology,
  industries: Array.from({ length: IMAGES_PER_COLUMN }, (_, imageIndex) =>
    INDUSTRIES[(technologyIndex * IMAGES_PER_COLUMN + imageIndex) % INDUSTRIES.length],
  ),
}));

export function IndustriesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const panelsRef = useRef<(HTMLAnchorElement | null)[][]>(
    Array.from({ length: COLUMN_COUNT }, () => []),
  );

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const columns = columnsRef.current.filter(Boolean) as HTMLDivElement[];

    if (!section || !overlay || columns.length !== COLUMN_COUNT) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      return;
    }

    const ctx = gsap.context(() => {
      const allPanels = panelsRef.current.flat().filter(Boolean) as HTMLAnchorElement[];

      gsap.set(columns, { height: '100%' });
      gsap.set(allPanels, { xPercent: -105, autoAlpha: 1 });
      gsap.set(overlay, { autoAlpha: 1 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
        },
      });

      // Each image must visibly enter, settle fully inside its column,
      // then continue out to the right before the next image takes over.
      for (let imageIndex = 0; imageIndex < IMAGES_PER_COLUMN; imageIndex += 1) {
        const currentRow = panelsRef.current
          .map((column) => column[imageIndex])
          .filter(Boolean) as HTMLAnchorElement[];

        const rowLabel = `row-${imageIndex}`;
        tl.addLabel(rowLabel, imageIndex === 0 ? 0 : '>-0.25');

        tl.to(
          currentRow,
          {
            xPercent: 0,
            duration: 0.95,
            stagger: { each: 0.07, from: 'start' },
            ease: 'power3.out',
          },
          rowLabel,
        );

        tl.to(
          currentRow,
          {
            xPercent: 105,
            duration: 0.95,
            stagger: { each: 0.07, from: 'start' },
            ease: 'power3.in',
          },
          '+=0.18',
        );
      }

      // Only after the final image has completely left do the black
      // technology columns retract, from the last technology to the first.
      tl.to(
        columns,
        {
          height: '0%',
          duration: 1.15,
          stagger: { each: 0.09, from: 'end' },
          ease: 'power3.inOut',
        },
        '+=0.15',
      );

      let hasPlayed = false;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasPlayed) {
            hasPlayed = true;
            tl.play(0);
            observer.disconnect();
          }
        },
        { threshold: 0.55 },
      );

      observer.observe(section);

      return () => observer.disconnect();
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (CARD_WIDTH + CARD_GAP) * 2, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="industries-heading">
      <div ref={overlayRef} className={styles.animationOverlay} aria-hidden="true">
        <div
          className={styles.animationGrid}
          style={{ gridTemplateColumns: `repeat(${COLUMN_COUNT}, minmax(0, 1fr))` }}
        >
          {ANIMATION_COLUMNS.map(({ technology, industries }, columnIndex) => (
            <div
              key={technology.slug}
              ref={(el) => {
                columnsRef.current[columnIndex] = el;
              }}
              className={styles.animationColumn}
            >
              {industries.map((industry, imageIndex) => (
                <a
                  key={`${technology.slug}-${industry.slug}-${imageIndex}`}
                  ref={(el) => {
                    panelsRef.current[columnIndex][imageIndex] = el;
                  }}
                  href={`/industries/${industry.slug}`}
                  tabIndex={-1}
                  className={styles.animationPanel}
                >
                  <div
                    className={styles.animationImage}
                    style={{ backgroundImage: `url(${industry.image})` }}
                  />
                  <div className={styles.animationShade} />
                  <span className={styles.animationIndustryLabel}>{industry.title}</span>
                </a>
              ))}

              <span className={styles.animationTechnologyLabel}>{technology.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.headingWrap}>
          <h2 id="industries-heading" className={styles.heading}>
            Built for Every <span className={styles.yellow}>Industry</span>
          </h2>
        </div>

        <div className={styles.carouselWrap}>
          <button
            type="button"
            aria-label="Scroll industries left"
            onClick={() => scrollByCards(-1)}
            className={`${styles.arrowButton} ${styles.arrowLeft}`}
          >
            {'<'}
          </button>
          <button
            type="button"
            aria-label="Scroll industries right"
            onClick={() => scrollByCards(1)}
            className={`${styles.arrowButton} ${styles.arrowRight}`}
          >
            {'>'}
          </button>

          <div ref={trackRef} className={styles.track}>
            {INDUSTRIES.map((industry) => (
              <a key={industry.slug} href={`/industries/${industry.slug}`} className={styles.card}>
                <div
                  role="img"
                  aria-label={industry.title}
                  className={styles.cardImage}
                  style={{ backgroundImage: `url(${industry.image})` }}
                />
                <div className={styles.cardShade} />
                <div className={styles.cardLabelWrap}>
                  <span className={styles.cardLabel}>{industry.title}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
