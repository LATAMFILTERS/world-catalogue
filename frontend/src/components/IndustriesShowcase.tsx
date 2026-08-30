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
const CARD_HEIGHT = 380;
const CARD_GAP = 16;
const IMAGES_PER_COLUMN = 4;
const TECHNOLOGIES = CANONICAL_TECHNOLOGY_LIST;

const ANIMATION_COLUMNS = TECHNOLOGIES.map((technology, technologyIndex) => ({
  technology,
  industries: Array.from({ length: IMAGES_PER_COLUMN }, (_, imageIndex) => {
    const index = (technologyIndex * IMAGES_PER_COLUMN + imageIndex) % INDUSTRIES.length;
    return INDUSTRIES[index];
  }),
}));

export function IndustriesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const panelsRef = useRef<(HTMLDivElement | null)[][]>(
    Array.from({ length: TECHNOLOGIES.length }, () => []),
  );

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const columns = columnsRef.current.filter(Boolean) as HTMLDivElement[];

    if (!section || !overlay || columns.length !== TECHNOLOGIES.length) return;

    const ctx = gsap.context(() => {
      const allPanels = panelsRef.current.flat().filter(Boolean) as HTMLDivElement[];

      gsap.set(overlay, { autoAlpha: 1, display: 'block' });
      gsap.set(columns, { height: CARD_HEIGHT });
      gsap.set(allPanels, {
        autoAlpha: 1,
        xPercent: -6,
        clipPath: 'inset(0 100% 0 0)',
      });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.to(overlay, {
            autoAlpha: 0,
            duration: 0.35,
            ease: 'power2.out',
            onComplete: () => gsap.set(overlay, { display: 'none' }),
          });
        },
      });

      for (let imageIndex = 0; imageIndex < IMAGES_PER_COLUMN; imageIndex += 1) {
        const currentRow = panelsRef.current
          .map((column) => column[imageIndex])
          .filter(Boolean) as HTMLDivElement[];

        const rowStart = imageIndex === 0 ? 0 : '>-0.25';

        tl.to(
          currentRow,
          {
            xPercent: 0,
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.95,
            stagger: { each: 0.08, from: 'start' },
            ease: 'power3.out',
          },
          rowStart,
        );

        tl.to(
          currentRow,
          {
            xPercent: 4,
            clipPath: 'inset(0 0% 0 100%)',
            duration: 0.85,
            stagger: { each: 0.08, from: 'start' },
            ease: 'power3.in',
          },
          '+=0.22',
        );
      }

      tl.to(
        columns,
        {
          height: 0,
          duration: 1.1,
          stagger: { each: 0.08, from: 'end' },
          ease: 'power3.inOut',
        },
        '+=0.2',
      );

      let hasPlayed = false;
      let raf = 0;

      const tryStart = () => {
        if (hasPlayed) return;
        const rect = section.getBoundingClientRect();
        const triggerLine = window.innerHeight * 0.82;

        if (rect.top <= triggerLine && rect.bottom > window.innerHeight * 0.18) {
          hasPlayed = true;
          tl.play(0);
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        }
      };

      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tryStart);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      requestAnimationFrame(tryStart);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        tl.kill();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * (CARD_WIDTH + CARD_GAP) * 2,
      behavior: 'smooth',
    });
  };

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="industries-heading">
      <div className={styles.headingWrap}>
        <h2 id="industries-heading" className={styles.heading}>
          Built for Every <span className={styles.yellow}>Industry</span>
        </h2>
      </div>

      <div className={styles.carouselWrap}>
        <div ref={overlayRef} className={styles.animationOverlay} aria-hidden="true">
          <div className={styles.animationRail}>
            {ANIMATION_COLUMNS.map(({ technology, industries }, columnIndex) => (
              <div
                key={technology.slug}
                ref={(el) => {
                  columnsRef.current[columnIndex] = el;
                }}
                className={styles.animationColumn}
              >
                {industries.map((industry, imageIndex) => (
                  <div
                    key={`${technology.slug}-${industry.slug}-${imageIndex}`}
                    ref={(el) => {
                      panelsRef.current[columnIndex][imageIndex] = el;
                    }}
                    className={styles.animationPanel}
                  >
                    <div
                      className={styles.animationImage}
                      style={{ backgroundImage: `url(${industry.image})` }}
                    />
                    <div className={styles.animationShade} />
                    <span className={styles.animationIndustryLabel}>{industry.title}</span>
                  </div>
                ))}

                <span className={styles.animationTechnologyLabel}>{technology.name}</span>
              </div>
            ))}
          </div>
        </div>

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
    </section>
  );
}
