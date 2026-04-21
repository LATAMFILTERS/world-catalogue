# Impeccable + ELIMFILTERS Components Integration

Impeccable provides AI-guided frontend design expertise that elevates our component library beyond generic templates.

## What We Get from Impeccable

### 7 Domain-Specific References

1. **Typography** — Type systems, font pairing, modular scales, OpenType features
2. **Color & Contrast** — OKLCH color systems, tinted neutrals, dark mode, WCAG compliance
3. **Spatial Design** — Spacing systems, grids, visual hierarchy, rhythm
4. **Motion Design** — Easing curves, staggering, reduced motion support
5. **Interaction Design** — Forms, focus states, loading patterns, affordances
6. **Componentry** — Component architecture, composition patterns, prop design
7. **Accessibility** — WCAG guidelines, screen readers, keyboard navigation

### 18 Steering Commands

**Audit & Review:**
- `/audit-design` — Identify design inconsistencies
- `/review-accessibility` — Check WCAG compliance
- `/audit-typography` — Verify type hierarchy

**Polish & Enhance:**
- `/polish` — Refine interactions and micro-animations
- `/distill` — Simplify and remove unnecessary elements
- `/animate` — Add thoughtful motion

**Optimize:**
- `/check-contrast` — Verify color contrast ratios
- `/optimize-spacing` — Apply consistent spacing rhythm
- `/validate-hierarchy` — Ensure visual hierarchy

## How It Powers Our Components

### Typography System
```
Base: Inter (sans-serif) + JetBrains Mono (code)
Scale: 12px → 30px (modular scale)
Weights: 400 → 700 (4 weights minimum)
Guidance: Impeccable ensures readable, predictable hierarchy
```

### Color System
```
Primary: #e8c94a (gold accent)
Dark BG: #080808 (true black for AMOLED)
Text: #ffffff (white, 21:1 contrast)
Guidance: OKLCH color space for consistent perceptual brightness
```

### Motion Design
```
Fast (micro): 150ms ease-out
Normal (transitions): 300ms cubic-bezier(0.4,0,0.2,1)
Entrance: ease-out (fast start, slow end)
Exit: ease-in (slow start, fast end)
Guidance: GPU-accelerated, respects prefers-reduced-motion
```

### Interaction Design
```
Buttons: 44px minimum touch target
Focus states: 3px gold outline + glow shadow
Press feedback: scale(0.98) for tactile response
Error handling: Red border + descriptive message below
Guidance: Form patterns tested with screen readers
```

### Accessibility Built-In
```
WCAG AA minimum (4.5:1 contrast)
WCAG AAA where possible (7:1 contrast)
Keyboard-only navigation
Screen reader support with ARIA
Semantic HTML structure
Guidance: Impeccable anti-patterns prevent common a11y mistakes
```

## Integration Points

### 1. Design Tokens
All our CSS variables follow Impeccable's spacing, color, and motion recommendations.

### 2. Component Development
When adding new components, use Impeccable's interaction design patterns:
- Form inputs → interaction-design.md
- Navigation → componentry.md
- Loading states → motion-design.md

### 3. Accessibility Validation
Run `/review-accessibility` on new components to catch issues early.

### 4. Refinement Process
Before shipping:
1. `/audit-design` — Catch inconsistencies
2. `/polish` — Add micro-interactions
3. `/animate` — Implement motion with purpose
4. `/check-contrast` — Verify WCAG compliance

## Commands Available

```bash
# In a Claude conversation with Impeccable enabled:
/audit-design          # Review design system consistency
/review-accessibility  # Check WCAG compliance
/audit-typography      # Verify type hierarchy
/polish                # Refine interactions
/distill               # Simplify components
/animate               # Add purposeful motion
/check-contrast        # Verify color ratios
/optimize-spacing      # Apply spacing rhythm
/validate-hierarchy    # Ensure visual hierarchy
```

## Anti-Patterns We Avoid

✅ No generic purple gradients (use our gold accent system)
✅ No gray text on colored backgrounds (use tinted neutrals)
✅ No cards nested in cards (clear hierarchy)
✅ No motion for motion's sake (purposeful animations only)
✅ No color alone for information (always add icons/text)
✅ No keyboard shortcuts without documentation
✅ No animations that ignore prefers-reduced-motion

## Example: SearchBar Component with Impeccable

```typescript
// Component follows:
// - typography.md: Readable placeholder, monospace for SKU input
// - color-and-contrast.md: #ffffff on #080808 = 21:1 contrast
// - spatial-design.md: 16px padding from spacing scale
// - motion-design.md: 150ms ease-out focus animation
// - interaction-design.md: 44px height for touch, visible focus state
// - accessibility.md: ARIA label, semantic <input>, keyboard support

<SearchBar
  ariaLabel="Search filters by SKU"
  placeholder="e.g., P552100"
  // Uses Impeccable interaction design
/>
```

## How to Use This

1. **When building components** — Reference the appropriate Impeccable file
2. **When reviewing work** — Use the audit commands
3. **When troubleshooting** — Check anti-patterns for common mistakes
4. **When polishing** — Apply the motion and interaction principles

## Result

Components that are:
- **Beautifully consistent** (unified design language)
- **Fully accessible** (WCAG AAA where possible)
- **Thoughtfully animated** (purposeful motion)
- **Interaction-rich** (responsive, delightful)
- **Free of generic mistakes** (anti-patterns eliminated)

---

**Impeccable + ELIMFILTERS = Production-Ready Excellence**

Version: 0.1.0 | Integration Date: 2026-04-21
