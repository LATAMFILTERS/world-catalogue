# Home Color-Ratio Rebalance — Phase 1 Design

Date: 2026-08-22
Branch: `redesign/color-ratio-phase1`
Scope: `frontend/src/app/page.tsx` and `frontend/src/components/ui/CinematicHero.tsx` only (home page). No child pages, no footer, no typography changes.

## Context

Design benchmark against Donaldson, MANN+HUMMEL and Atmus found the home page uses black as the base background for 7-8 of 8 content sections (measured directly in the shipped HTML/inline styles), with the brand accent (`#FFF12D`) used correctly but with no light "breathing" surface for content to sit on. The three reference sites use white/light-neutral as the dominant surface and their brand color as a targeted accent. Separately, the hero's background video (`/images/moleculas.mp4`, abstract particles) shows no real product, facility, or equipment — evidence review found 177 real photography assets already present under `frontend/public/images` and `frontend/public/assets` that are not referenced anywhere in `src/` (confirmed via repo-wide grep). User confirmed these assets are real, approved ELIMFILTERS photography and cleared for use.

Typography (Chakra Petch display / Barlow body, hardcoded in `CinematicHero.tsx` as `approvedDisplayFont`/`approvedBodyFont`) is explicitly user-approved and out of scope for this change. The mismatch between `tailwind.config.ts` (`sans: Inter`, `heading: Montserrat`) and the fonts actually rendered is a pre-existing, deliberate override and is not resolved in this phase.

## Goal

Rebalance the home page so black is a deliberate "signature" surface used at the open (hero) and close (final CTA slides) of the page, while the content sections in between sit on a light neutral surface — mirroring how the three benchmark sites use their brand color as an accent, not a base. Yellow (`#FFF12D`) stays the sole accent color; its usage pattern does not change except where it appears as running text on a now-light background (contrast fix, see Tokens).

## Non-goals

- Child pages / other heroes that reuse similar dark styling (separate phase, tracked but not started).
- Footer component.
- Mega-menu / navigation restructure (Phase 2 item from the earlier benchmark).
- Stat bar or trust-signal additions beyond the one new component described below.
- Resolving the `tailwind.config.ts` declared-font vs. rendered-font mismatch.
- Any new photography or video production — this phase only wires in existing approved assets.

## Tokens

Added to `tailwind.config.ts` (`theme.extend.colors`) as the documented source of truth, and mirrored as CSS custom properties in `frontend/src/app/globals.css` (the actual mechanism used, since `page.tsx` sets backgrounds via inline `style` objects, not Tailwind utility classes — it already references `var(--font-display)` for fonts, so this follows the existing pattern):

```ts
// tailwind.config.ts — theme.extend.colors, additive only
'surface-light': '#FAFAFA',
'surface-light-2': '#F0F0F0',
ink: '#101214',
'volt-ink': '#8A6D00',
```

```css
/* globals.css — additive only */
--surface-light: #FAFAFA;
--surface-light-2: #F0F0F0;
--ink: #101214;
--volt-ink: #8A6D00;
```

`--volt-ink` exists because `#FFF12D` as running text fails WCAG AA on a white/light surface. Rule: `#FFF12D` (`--volt` / existing literal) stays for solid fills — buttons, badges, underlines, progress bars, dots. `--volt-ink` is used only where the accent color appears as inline text color on a light section (e.g. the "TECHNOLOGY" highlight span, the "OK" checkmarks, tech-card titles). Dark (bookend) sections are unaffected and keep `#FFF12D` text as-is.

Text-on-light replacements: existing `rgba(255,255,255,X)` literals inside sections that move to light background are replaced with `rgba(16,18,20,X)` (same alpha steps, `--ink` base) so the existing opacity-based hierarchy (0.85 / 0.7 / 0.6 / 0.5) is preserved, just inverted.

## Section-by-section plan (`page.tsx`)

| Section | Current | Phase 1 |
|---|---|---|
| Hero (`CinematicHero.tsx`) | `background:#000` + `/images/moleculas.mp4` | **Stays `#000`** (signature bookend #1). Video replaced with `/images/hero-systems.avif` as a static background image (same overlay gradient kept). |
| *(new)* StatBar | — | New component, light surface, directly after Hero. 4 stats pulled from `frontend/catalogue.json`: 12 industries served, 9 proprietary technologies, 5 protection systems, 105+ Knowledge Center resources. `tabular-nums`, counts animate in like existing `Counter` pattern. |
| GlobalBrandSection | dark (component default) | Renders on a light surface. `GlobalBrandSection.tsx` has not been inspected yet — whether that means passing a prop the component already supports or wrapping its call site is an implementation detail to resolve during coding, not a design ambiguity; the requirement is the rendered result reads as light. |
| "What You Can't See" (industries/problem) | `#000` implicit, card `#050505` | `--surface-light`; card → `--surface-light-2`. Yellow badge (`#FFF12D` fill, black text) unchanged — already correct accent usage. |
| "Real Cost of Contamination" | `#050505` | `--surface-light`; the 3 detail cards → `--surface-light-2` with a subtle border instead of `rgba(255,255,255,0.08)` |
| "Why Elimfilters" | dark implicit | `--surface-light` |
| Asset Protection Narrative | `linear-gradient(rgba(255,241,45,0.03), transparent)` on dark | Same gradient concept, base becomes `--surface-light` |
| Scientific Authority | `#050505`, cards `#000` | Container → `--surface-light`. **The 3 ISO standard cards keep `#000`** — deliberate dark accent cards (certification-badge treatment), not a full dark section. |
| Technology grid | dark implicit, cards `#050505` | `--surface-light`; cards → `--surface-light-2` with visible border (dark cards on light need a real border since the current `#1a1a1a` border disappears against light) |
| CTA Slides (final) | `#000` | **Stays `#000`** (signature bookend #2) |
| Footer | dark | Unchanged (non-goal) |

Net effect: hero and closing CTA are the only two content blocks that stay black by design; the footer (unchanged, non-goal) also remains dark. Every section in between moves to a light surface, matching the earlier proposed ~20-30% dark / ~60-70% light / accent-only yellow ratio.

## New component: StatBar

- Location: new file `frontend/src/components/HomeStatBar.tsx`, rendered in `page.tsx` immediately after `<CinematicHero />`.
- Light surface (`--surface-light`), reuses the existing `Counter` animate-on-scroll pattern already defined in `page.tsx` (extracted or duplicated locally — implementation detail for the plan step).
- 4 stats, real and sourced from `frontend/catalogue.json` at build/runtime (not hardcoded strings, so it can't silently drift from the actual catalogue):
  - Industries served → `catalogue.industries.length` (12)
  - Proprietary technologies → `catalogue.technologies.length` (9)
  - Protection systems → 5 (static — systems are not currently modeled in `catalogue.json`; hardcode with a comment noting the source is the Systems nav/IA, not catalogue.json)
  - Knowledge Center resources → 105+ (static — page count is not derived from a live source; hardcode as "105+" with a comment)
- No new dependencies; uses existing `motion/react` already imported in `page.tsx`.

## Accessibility / QA

- Run every text/background pairing that changes through a contrast check (target WCAG AA, 4.5:1 body text / 3:1 large text) before committing — particularly `--ink` opacity steps against `--surface-light` and `--surface-light-2`, and `--volt-ink` against `--surface-light`.
- Visual check via `npm run dev` in the worktree: home page only, both desktop (~1440px) and the existing 768px mobile breakpoint (the `.stats-grid`/`.problem-grid`/etc. media query block in `page.tsx` already defines mobile column collapse — verify it still reads correctly against light backgrounds).
- Confirm `CinematicHero.tsx` is not imported anywhere outside `page.tsx` before editing (already confirmed via repo-wide grep — single usage).
- No change to `Navigation` or `Footer` components — verify visually that the nav's gradient-on-transparent header still reads correctly now that it sits above a dark hero (unchanged) and, on scroll, above light sections (verify nav's scroll-solid state, if any, still has correct contrast — inspect `Navigation.tsx` during implementation if behavior is unclear).

## Out of scope / explicit deferrals

- Mega-menu, trust/certification block beyond StatBar, Knowledge Center homepage strip, `/products` vs `/families` resolution — all Phase 2 items from the earlier benchmark, not started here.
- New photography/video production — Phase 3 item, not started here.
- `tailwind.config.ts` font declarations (`Inter`/`Montserrat`) vs. actual rendered fonts (Chakra Petch/Barlow) — left as-is per explicit user instruction that the hero typography is approved and settled.
