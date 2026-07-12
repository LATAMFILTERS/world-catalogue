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

## Approved font tokens

### ELIM Display Font

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

### ELIM Body Font

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

### ELIM Mono Font

CSS variable:

```css
var(--font-mono)
```

Approved use:

- Technical labels
- Small uppercase metadata
- Engineering codes
- SKU-like labels
- Measurement callouts

## Forbidden direct font names

Do not hard-code these names in page components or CSS:

- Chakra Petch
- Barlow
- Inter
- Outfit
- JetBrains Mono
- Arial Narrow as primary font
- Google Fonts import URLs
- `next/font/google`

## Implementation rule

Use only the approved tokens:

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

## Build enforcement

The prebuild script `scripts/normalize-site-typography.mjs` enforces this rule before every build.

If a developer adds a hard-coded page-level font, the script normalizes it back to the approved Home typography tokens.
