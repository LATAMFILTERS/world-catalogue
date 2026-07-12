# ELIMFILTERS Approved Typography System

This document defines the only typography system approved for ELIMFILTERS public web pages.

## Approved rule

All pages must use the same typography system used by the Home page.

This applies to:

- Home
- Hero sections
- Internal pages
- Subpages
- Knowledge Center pages
- Product Experience pages
- Technologies pages
- Systems pages
- Industries pages
- Families pages
- Legal pages
- Navigation, cards, labels, forms, and CTAs

## Approved font families

### ELIM Display Font

Approved family:

```text
Chakra Petch
```

CSS variable:

```css
var(--font-display)
```

Approved use:

- Hero titles
- Page titles
- Section headings
- Card titles
- Strong visual labels
- CTA labels

### ELIM Body Font

Approved family:

```text
Barlow
```

CSS variable:

```css
var(--font-body)
```

Approved use:

- Paragraphs
- Navigation
- Body copy
- Descriptions
- Buttons
- Forms
- General UI text

### ELIM Technical Font

Approved family:

```text
Chakra Petch
```

CSS variable:

```css
var(--font-mono)
```

Approved use:

- Technical labels
- ISO / SAE codes
- Small uppercase metadata
- Engineering codes
- SKU-like labels
- Measurement callouts

## Implementation rule

Components and pages must not hard-code raw font-family stacks. They must use only the approved tokens:

```tsx
fontFamily: 'var(--font-display)'
fontFamily: 'var(--font-body)'
fontFamily: 'var(--font-mono)'
```

or in CSS:

```css
font-family: var(--font-display);
font-family: var(--font-body);
font-family: var(--font-mono);
```

## Not approved

Do not introduce additional families or local page-level typography systems such as:

- Inter
- Outfit
- JetBrains Mono
- Arial Narrow as primary font
- random per-page font stacks
- page-level Google Fonts imports
- `next/font/google` imports inside pages/components

## Build enforcement

The prebuild script `scripts/normalize-site-typography.mjs` enforces this rule before every build.

If a developer adds a hard-coded page-level font, the script normalizes it back to the approved Home typography tokens.
