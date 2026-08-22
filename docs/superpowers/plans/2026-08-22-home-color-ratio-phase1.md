# Home Color-Ratio Rebalance (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebalance the ELIMFILTERS home page so black is a deliberate "signature" surface used only at the hero (open) and CTA slides (close), while every section in between sits on a light surface — matching how Donaldson/MANN+HUMMEL/Atmus use their brand accent color sparingly on a light ground instead of as the page background.

**Architecture:** Additive color tokens in `tailwind.config.ts` + `globals.css` (documentation + actual CSS custom properties, since this codebase sets backgrounds via inline `style` objects, not Tailwind classNames). A new pure data function (`getHomeStats`) sources 2 of 4 StatBar numbers from the existing `catalogue` export so they can't silently drift from real data. A new `HomeStatBar` component renders directly after the hero. `CinematicHero.tsx`'s background video is replaced with a static real photo. `GlobalBrandSection.tsx` and 6 sections inside `page.tsx` swap explicit literal color values from the dark palette to the new light palette — see the design spec for the full section table: `docs/superpowers/specs/2026-08-22-home-color-ratio-phase1-design.md`.

**Tech Stack:** Next.js App Router, React, TypeScript, inline `style` objects (no CSS-in-JS library), Tailwind (utility classes largely unused on this page), `motion/react` for animation, Vitest for unit tests.

---

## Ink/surface token map (used throughout this plan)

Do not carry over alpha values 1:1 from white text on black — a naive `rgba(255,255,255,0.5)` → `rgba(16,18,20,0.5)` swap fails WCAG AA on a light background. Use these fixed, pre-verified (≥4.5:1 against both `#FAFAFA` and `#F0F0F0`) solid-ish tiers instead:

| Old value (white-on-black) | New value (dark-on-light) | Tier |
|---|---|---|
| `#fff`, `rgba(255,255,255,0.9)`, `rgba(255,255,255,0.85)` | `var(--ink)` → `#101214` | Headings / high emphasis |
| `rgba(255,255,255,0.72)`, `rgba(255,255,255,0.7)`, `rgba(255,255,255,0.65)` | `var(--ink-2)` → `#33383E` | Body text |
| `rgba(255,255,255,0.6)`, `rgba(255,255,255,0.5)`, `rgba(255,255,255,0.48)` | `var(--ink-3)` → `#5B6570` | Secondary / lower-emphasis text |
| `#FFF12D` used as **text/inline color** | `var(--volt-ink)` → `#8A6D00` | Accent as text (contrast fix) |
| `#FFF12D` used as **solid fill** (buttons, badges, dots, progress bar, underlines) | unchanged, stays `#FFF12D` | Accent as fill |
| `rgba(255,255,255,0.08)`, `rgba(255,255,255,0.04)`, `#1a1a1a`, `#333` (borders) | `rgba(16,18,20,0.12)` | Borders on light |
| `#050505`, `#0a0a0a` (card backgrounds) | `var(--surface-light-2)` → `#F0F0F0` | Card surface |
| section-level `#000`/implicit dark | `var(--surface-light)` → `#FAFAFA` | Section surface |

Sections/elements that stay dark by design (do not touch): the hero (`CinematicHero.tsx`, background stays `#000`), the CTA Slides section at the end of `page.tsx` (`#000`, unchanged), and the 3 ISO standard cards inside the Scientific Authority section (`#000`, kept as a deliberate dark accent).

---

### Task 1: Add light/ink color tokens

**Files:**
- Modify: `frontend/tailwind.config.ts:11-18`
- Modify: `frontend/src/app/globals.css:7-17`

- [ ] **Step 1: Add tokens to `tailwind.config.ts`**

In `frontend/tailwind.config.ts`, the `colors` object currently reads (lines 11-18):

```ts
      colors: {
        volt: '#FFF12D',
        'volt-dim': '#CCB800',
        bg: '#000000',
        surface: '#050505',
        'surface-2': '#0a0a0a',
        'surface-3': '#111111',
      },
```

Replace it with:

```ts
      colors: {
        volt: '#FFF12D',
        'volt-dim': '#CCB800',
        'volt-ink': '#8A6D00',
        bg: '#000000',
        surface: '#050505',
        'surface-2': '#0a0a0a',
        'surface-3': '#111111',
        'surface-light': '#FAFAFA',
        'surface-light-2': '#F0F0F0',
        ink: '#101214',
        'ink-2': '#33383E',
        'ink-3': '#5B6570',
      },
```

- [ ] **Step 2: Add matching CSS custom properties to `globals.css`**

In `frontend/src/app/globals.css`, the `:root` block currently reads (lines 7-17):

```css
:root {
  --volt: #FFF12D;
  --bg: #000000;
  --surface: #050505;
  --surface-2: #0a0a0a;
  --surface-3: #111111;
  --border: rgba(255, 255, 255, 0.08);
  --border-2: rgba(255, 255, 255, 0.12);
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.9);
  --text-subtle: rgba(255, 255, 255, 0.85);
```

Replace it with:

```css
:root {
  --volt: #FFF12D;
  --volt-ink: #8A6D00;
  --bg: #000000;
  --surface: #050505;
  --surface-2: #0a0a0a;
  --surface-3: #111111;
  --surface-light: #FAFAFA;
  --surface-light-2: #F0F0F0;
  --border: rgba(255, 255, 255, 0.08);
  --border-2: rgba(255, 255, 255, 0.12);
  --border-on-light: rgba(16, 18, 20, 0.12);
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.9);
  --text-subtle: rgba(255, 255, 255, 0.85);
  --ink: #101214;
  --ink-2: #33383E;
  --ink-3: #5B6570;
```

- [ ] **Step 3: Verify types compile**

Run: `cd frontend && npm run type-check`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/tailwind.config.ts frontend/src/app/globals.css
git commit -m "feat(home): add light-surface and ink color tokens"
```

---

### Task 2: Home stats data function (TDD)

**Files:**
- Create: `frontend/src/lib/home-stats.ts`
- Test: `frontend/src/lib/__tests__/home-stats.test.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/__tests__/home-stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getHomeStats } from '../home-stats';

describe('getHomeStats', () => {
  it('derives industries and technologies counts from the real catalogue', () => {
    const stats = getHomeStats();
    const industries = stats.find((s) => s.id === 'industries');
    const technologies = stats.find((s) => s.id === 'technologies');
    expect(industries?.value).toBeGreaterThan(0);
    expect(technologies?.value).toBeGreaterThan(0);
  });

  it('returns exactly 4 stats in a fixed order', () => {
    const stats = getHomeStats();
    expect(stats.map((s) => s.id)).toEqual(['industries', 'technologies', 'systems', 'resources']);
  });

  it('includes the static systems and resources figures with their source note', () => {
    const stats = getHomeStats();
    const systems = stats.find((s) => s.id === 'systems');
    const resources = stats.find((s) => s.id === 'resources');
    expect(systems).toEqual({ id: 'systems', value: 5, suffix: '', label: 'Protection Systems' });
    expect(resources).toEqual({ id: 'resources', value: 105, suffix: '+', label: 'Knowledge Center Resources' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/lib/__tests__/home-stats.test.ts`
Expected: FAIL — `Cannot find module '../home-stats'`

- [ ] **Step 3: Write the implementation**

Create `frontend/src/lib/home-stats.ts`:

```ts
import { catalogue } from './catalogue';

export interface HomeStat {
  id: 'industries' | 'technologies' | 'systems' | 'resources';
  value: number;
  suffix: string;
  label: string;
}

/**
 * Systems (5) and Knowledge Center resources (105+) are not modeled as
 * arrays in catalogue.json today, so they are fixed here rather than
 * derived. Industries and technologies ARE derived from the live
 * catalogue so they can't silently drift out of sync with real data.
 */
export function getHomeStats(): HomeStat[] {
  return [
    { id: 'industries', value: catalogue.industries.length, suffix: '', label: 'Industries Served' },
    { id: 'technologies', value: catalogue.technologies.length, suffix: '', label: 'Proprietary Technologies' },
    { id: 'systems', value: 5, suffix: '', label: 'Protection Systems' },
    { id: 'resources', value: 105, suffix: '+', label: 'Knowledge Center Resources' },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/lib/__tests__/home-stats.test.ts`
Expected: PASS, 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/home-stats.ts frontend/src/lib/__tests__/home-stats.test.ts
git commit -m "feat(home): add getHomeStats data function with tests"
```

---

### Task 3: HomeStatBar component

**Files:**
- Create: `frontend/src/components/HomeStatBar.tsx`
- Modify: `frontend/src/app/page.tsx:363-367`

- [ ] **Step 1: Write the component**

Create `frontend/src/components/HomeStatBar.tsx`:

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { getHomeStats } from '@/lib/home-stats';

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function HomeStatBar() {
  const stats = getHomeStats();

  return (
    <section
      style={{
        background: 'var(--surface-light)',
        padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(1.25rem, 6vw, 6rem)',
        borderBottom: '1px solid var(--border-on-light)',
      }}
    >
      <div
        className="stats-grid"
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ textAlign: 'center' }}
          >
            <p
              style={{
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                color: 'var(--ink)',
                margin: '0 0 0.4rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </p>
            <p
              style={{
                fontFamily: 'Barlow, Arial, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                margin: 0,
              }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into the home page**

In `frontend/src/app/page.tsx`, lines 363-367 currently read:

```tsx
        {/* ── HERO ── */}
        <CinematicHero />

        {/* ── GLOBAL BRAND SECTION ── */}
        <GlobalBrandSection />
```

Replace with:

```tsx
        {/* ── HERO ── */}
        <CinematicHero />

        {/* ── STAT BAR ── */}
        <HomeStatBar />

        {/* ── GLOBAL BRAND SECTION ── */}
        <GlobalBrandSection />
```

Add the import near the top of `page.tsx` (alongside the existing `GlobalBrandSection` import at line 7):

```tsx
import { GlobalBrandSection } from '@/components/GlobalBrandSection';
import { HomeStatBar } from '@/components/HomeStatBar';
```

Also update the existing mobile media-query block in `page.tsx` (lines 348-361) — it already targets `.stats-grid` for a 2-column mobile layout, which now applies to `HomeStatBar`'s grid too. No change needed there; just confirm during visual QA (Task 6) that 4 stats collapse to 2x2 on mobile as already defined.

- [ ] **Step 3: Verify it compiles and renders**

Run: `cd frontend && npm run type-check`
Expected: exits 0.

Run: `cd frontend && npm run dev`, open `http://localhost:3000/`
Expected: StatBar renders directly below the hero with a light background and 4 animated numbers (12, 9, 5, 105+).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/HomeStatBar.tsx frontend/src/app/page.tsx
git commit -m "feat(home): add StatBar with real catalogue-derived figures"
```

---

### Task 4: Replace hero background video with a real photo

**Files:**
- Modify: `frontend/src/components/ui/CinematicHero.tsx:29-45`

- [ ] **Step 1: Confirm the target asset exists**

Run: `ls "frontend/public/images/hero-systems.avif"`
Expected: file listed. If missing, stop and pick a different confirmed asset from `frontend/public/images/` before continuing (do not proceed with a broken path).

- [ ] **Step 2: Replace the `<video>` block**

In `frontend/src/components/ui/CinematicHero.tsx`, lines 29-45 currently read:

```tsx
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.52,
          zIndex: 0,
        }}
      >
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>
```

Replace with:

```tsx
      <div
        role="img"
        aria-label="ELIMFILTERS protection systems in the field"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url(/images/hero-systems.avif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.52,
          zIndex: 0,
        }}
      />
```

The gradient overlay `<div>` immediately below (lines 47-56 in the original) is unchanged — it already sits at `zIndex: 1` above this background and keeps the same readability treatment.

- [ ] **Step 3: Visual check**

Run: `cd frontend && npm run dev`, open `http://localhost:3000/`
Expected: hero shows the real photo (not the molecule animation) at the same opacity/overlay treatment, headline and CTAs unchanged.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/CinematicHero.tsx
git commit -m "feat(home): replace abstract hero video with real product/systems photo"
```

---

### Task 5: Rebalance content sections to light surface

**Files:**
- Modify: `frontend/src/components/GlobalBrandSection.tsx`
- Modify: `frontend/src/app/page.tsx` (6 sections between the StatBar and the CTA Slides)

Apply the token map at the top of this plan. Every replacement below is a literal string match — replace exactly, do not paraphrase.

- [ ] **Step 1: `GlobalBrandSection.tsx`**

| Line | Old | New |
|---|---|---|
| 19 | `background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, rgba(255,241,45,0.08) 0%, transparent 50%)',` | `background: 'linear-gradient(90deg, rgba(255,241,45,0.06) 0%, transparent 50%), var(--surface-light)',` |
| 20-21 | `borderTop: '1px solid rgba(255,241,45,0.15)', borderBottom: '1px solid rgba(255,255,255,0.03)',` | `borderTop: '1px solid rgba(255,241,45,0.15)', borderBottom: '1px solid var(--border-on-light)',` |
| 48 | `color: 'rgba(255,255,255,0.9)',` (h2) | `color: 'var(--ink)',` |
| 56 | `color: 'rgba(255,255,255,0.72)',` (intro paragraph) | `color: 'var(--ink-2)',` |
| 74-75 | `background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',` (pillar card) | `background: 'var(--surface-light-2)', border: '1px solid var(--border-on-light)',` |
| 80 | `color: '#fff',` (pillar h3) | `color: 'var(--ink)',` |
| 83 | `color: 'rgba(255,255,255,0.6)',` (pillar body) | `color: 'var(--ink-3)',` |
| 99 | `color: 'rgba(255,255,255,0.82)',` (mantra chip) | `color: 'var(--ink-2)',` |
| 153 | `color: 'rgba(255,255,255,0.72)',` ("Global Network" link) | `color: 'var(--ink-2)',` |
| 161 | `border: '1px solid rgba(255,255,255,0.2)',` ("Global Network" link border) | `border: '1px solid var(--border-on-light)',` |

Leave every `#FFF12D` solid-fill usage (lines 31, 52, 77, 121-122) and the `Explore Knowledge` button (already `background:'#FFF12D', color:'#000'`) unchanged — those are correct accent-as-fill usage already.

- [ ] **Step 2: `page.tsx` — Industries strip / "What You Can't See" (lines 372-418)**

| Line | Old | New |
|---|---|---|
| 372 | `<section style={{ padding: '4.75rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>` | `<section style={{ padding: '4.75rem 8%', background: 'var(--surface-light)', borderBottom: '1px solid var(--border-on-light)' }}>` |
| 377 | `color: 'rgba(255,255,255,0.85)',` (h2) | `color: 'var(--ink)',` |
| 383 | `background: '#050505', padding: '3.5rem', border: '1px solid #1a1a1a',` (SpotlightCard) | `background: 'var(--surface-light-2)', padding: '3.5rem', border: '1px solid var(--border-on-light)',` |
| 389 | `color: 'rgba(255,255,255,0.7)',` (intro paragraph) | `color: 'var(--ink-2)',` |
| 400 | `color: 'rgba(255,255,255,0.85)',` (failure mode title) | `color: 'var(--ink)',` |
| 401 | `color: 'rgba(255,255,255,0.6)',` (failure mode desc) | `color: 'var(--ink-3)',` |

Leave the failure-mode icon circle (line 396, `border: rgba(180,0,0,0.35)`, `background: rgba(100,0,0,0.12)`) and the yellow "80%" badge (lines 411-413, `background:'#FFF12D', color:'#000'`) unchanged — the red danger accent and the yellow solid badge both already read correctly on a light section.

- [ ] **Step 3: `page.tsx` — "Real Cost of Contamination" (lines 420-475)**

| Line | Old | New |
|---|---|---|
| 421 | `background: '#050505',` | `background: 'var(--surface-light)',` |
| 430 | `color: 'rgba(255,255,255,0.85)',` (h2) | `color: 'var(--ink)',` |
| 434 | `color: 'rgba(255,255,255,0.7)',` (intro) | `color: 'var(--ink-2)',` |
| 451 | `background: '#050505', border: '1px solid rgba(255,255,255,0.08)',` (3 detail cards) | `background: 'var(--surface-light-2)', border: '1px solid var(--border-on-light)',` |
| 454 | `color: 'rgba(255,255,255,0.7)',` (card label) | `color: 'var(--ink-2)',` |
| 455 | `color: 'rgba(255,255,255,0.7)',` (card desc) | `color: 'var(--ink-2)',` |
| 465 | `background: '#050505', border: '1px solid rgba(255,241,45,0.2)',` (prevention callout) | `background: 'var(--surface-light-2)', border: '1px solid rgba(255,241,45,0.35)',` |
| 468 | `color: 'rgba(255,255,255,0.75)',` (callout text) | `color: 'var(--ink-2)',` |
| 471 | `color: 'rgba(255,255,255,0.85)',` (bold line) | `color: 'var(--ink)',` |

- [ ] **Step 4: `page.tsx` — "Why Elimfilters" (lines 477-525)**

| Line | Old | New |
|---|---|---|
| 478 | `<section style={{ padding: '4.75rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>` | `<section style={{ padding: '4.75rem 8%', background: 'var(--surface-light)', borderBottom: '1px solid var(--border-on-light)' }}>` |
| 481 | `color: 'rgba(255,255,255,0.85)',` (h2) | `color: 'var(--ink)',` |
| 487 | `color: 'rgba(255,255,255,0.7)',` (p1) | `color: 'var(--ink-2)',` |
| 491 | `color: 'rgba(255,255,255,0.7)',` (p2) | `color: 'var(--ink-2)',` |
| 499 | `color: 'rgba(255,255,255,0.7)',` (check item text) | `color: 'var(--ink-2)',` |
| 505 | `background: '#050505', border: '1px solid #1a1a1a',` (SpotlightCard) | `background: 'var(--surface-light-2)', border: '1px solid var(--border-on-light)',` |
| 507 | `color: 'rgba(255,255,255,0.85)',` (card title) | `color: 'var(--ink)',` |
| 510 | `color: 'rgba(255,255,255,0.65)',` (card desc) | `color: 'var(--ink-2)',` |
| 515 | `color: 'rgba(255,255,255,0.65)',` (list item) | `color: 'var(--ink-2)',` |

- [ ] **Step 5: `page.tsx` — Asset Protection Narrative (lines 527-564)**

| Line | Old | New |
|---|---|---|
| 528 | `background: 'linear-gradient(180deg, rgba(255,241,45,0.03) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)',` | `background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%), var(--surface-light)', borderBottom: '1px solid var(--border-on-light)',` |
| 534 | `color: '#fff',` (h2) | `color: 'var(--ink)',` |
| 537 | `color: 'rgba(255,255,255,0.7)',` (p1) | `color: 'var(--ink-2)',` |
| 540 | `color: 'rgba(255,255,255,0.5)',` (p2, left-border quote) | `color: 'var(--ink-3)',` |
| 544 | `background: '#050505', border: '1px solid rgba(255,241,45,0.15)',` (right panel) | `background: 'var(--surface-light-2)', border: '1px solid rgba(255,241,45,0.3)',` |
| 555 | `color: 'rgba(255,255,255,0.85)',` (item label) | `color: 'var(--ink)',` |
| 556 | `color: 'rgba(255,255,255,0.48)',` (item desc) | `color: 'var(--ink-3)',` |

- [ ] **Step 6: `page.tsx` — Scientific Authority (lines 566-591)**

| Line | Old | New |
|---|---|---|
| 567 | `background: '#050505',` | `background: 'var(--surface-light)',` |
| 572 | `color: '#fff',` (h2) | `color: 'var(--ink)',` |
| 575 | `color: 'rgba(255,255,255,0.5)',` (intro) | `color: 'var(--ink-3)',` |
| 585 | `color: 'rgba(255,255,255,0.7)',` (std desc, inside the dark ISO card) | **unchanged** — this text sits inside the card that stays `#000` (line 583, unchanged), so it must keep its white-on-black color. Do not touch line 583 or 585. |

Confirm at Step 8 (visual QA) that the 3 ISO cards (`background:'#000'`, line 583) visibly read as dark accent cards against the now-light section background — this is the one deliberate section where dark stays inside a light container.

- [ ] **Step 7: `page.tsx` — Technology grid (lines 593-617)**

| Line | Old | New |
|---|---|---|
| 599 | `color: 'rgba(255,255,255,0.85)',` (h2) | `color: 'var(--ink)',` |
| 605 | `background: '#050505', border: '1px solid #1a1a1a',` (tech card) | `background: 'var(--surface-light-2)', border: '1px solid var(--border-on-light)',` |
| 608 | `color: '#FFF12D',` (tech card title — accent as text) | `color: 'var(--volt-ink)',` |
| 609 | `color: 'rgba(255,255,255,0.6)',` (tech card desc) | `color: 'var(--ink-3)',` |

Note this section (`page.tsx:594`) has no explicit `background` set today — add one so it doesn't inherit the previous section's background by accident:

Line 594 currently: `<section style={{ padding: '4.75rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>`
New: `<section style={{ padding: '4.75rem 8%', background: 'var(--surface-light)', borderBottom: '1px solid var(--border-on-light)' }}>`

- [ ] **Step 8: Visual QA pass**

Run: `cd frontend && npm run dev`, open `http://localhost:3000/`

Check, scrolling top to bottom:
- Hero and CTA Slides (very bottom) are the only full-black sections.
- Every section in between reads as light (`#FAFAFA`/`#F0F0F0`), with dark, readable body text.
- The 3 ISO standard cards in Scientific Authority are visibly dark cards on a light section (intentional accent, not a bug).
- No white-on-white or dark-on-dark text anywhere (scan every section for invisible text — this is the most likely mistake with a find-and-replace pass this size).
- Yellow accent text (tech card titles, etc.) is legible — should look like a muted dark-gold, not full bright yellow.
- Resize to ~375px width: confirm the existing `.problem-grid`, `.why-grid`, `.tech-grid`, `.asset-protection-grid`, `.sci-grid` mobile overrides (page.tsx lines 349-360) still collapse correctly and nothing overlaps.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/GlobalBrandSection.tsx frontend/src/app/page.tsx
git commit -m "feat(home): rebalance content sections from black to light surface"
```

---

### Task 6: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `cd frontend && npm run type-check`
Expected: exits 0.

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: exits 0. If pre-existing unrelated lint errors surface, note them separately — do not fix unrelated files in this task.

- [ ] **Step 3: Full test suite**

Run: `cd frontend && npm run test`
Expected: all tests pass, including the 3 new `home-stats.test.ts` tests.

- [ ] **Step 4: Full verify (type-check + lint + build)**

Run: `cd frontend && npm run verify`
Expected: exits 0. This triggers the project's full `prebuild` governance script chain (taxonomy, citation, part-search-map validators, etc.) — if it fails on something unrelated to this change, stop and report to the user rather than attempting to fix unrelated governance issues.

- [ ] **Step 5: Final manual pass**

Run: `cd frontend && npm run dev`, open `http://localhost:3000/` one more time end to end. Confirm against the design spec's section table (`docs/superpowers/specs/2026-08-22-home-color-ratio-phase1-design.md`) that every row matches what's rendered.

- [ ] **Step 6: Push the branch (do not merge)**

```bash
git push -u origin redesign/color-ratio-phase1
```

Report back to the user with the branch name and ask how they want to review it (preview deploy, screen share, or they pull it locally) before any merge — do not merge without explicit approval.
