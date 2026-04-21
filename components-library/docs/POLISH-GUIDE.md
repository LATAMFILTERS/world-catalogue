# Component Polish Guide

**Based on Emil Kowalski's Design Engineering Principles**

Transforms good components into polished, professional interfaces through refined interactions and invisible details.

---

## 🎯 Philosophy

> "Invisible details compound into excellent user experiences"
> 
> — Emil Kowalski (Sonner creator, 13M+ weekly npm downloads)

Every ELIMFILTERS component should feel premium through:
- Smooth, performant animations
- Responsive feedback to user actions
- Gesture-aware interactions
- Accessibility-first micro-interactions
- Invisible craftsmanship

---

## ⚡ Animation Decision Framework

### Choose Based on Interaction Type:

#### 1. **CSS Transitions** (for simple state changes)
✅ **When to use:**
- Hover states (button, chip)
- Focus indicators
- Simple color/opacity changes
- Interactive element visibility

**Example: Button Hover**
```css
.button {
  transition: var(--transition-normal);
  background: var(--color-primary);
}

.button:hover {
  background: var(--color-primary-bright);
  box-shadow: var(--shadow-md);
}
```

#### 2. **CSS Animations (@keyframes)** (for continuous or complex motion)
✅ **When to use:**
- Loading spinners
- Pulsing indicators
- Infinite animations
- Multi-step sequences

**Example: Loading Spinner**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.8s linear infinite;
}
```

#### 3. **JavaScript/Web Animations** (for gesture-driven, complex choreography)
✅ **When to use:**
- Drag interactions
- Momentum/inertia (swipe filtering)
- Complex multi-element choreography
- Gesture detection

**Example: Swipe Filter Chips**
```typescript
const handleSwipe = (direction: 'left' | 'right') => {
  const chipElement = chipRef.current;
  chipElement.animate(
    [{ opacity: 1, transform: `translateX(0)` },
     { opacity: 0, transform: `translateX(${direction === 'left' ? '-' : ''}100px)` }],
    { duration: 300, easing: 'ease-out' }
  );
  // Remove filter after animation
};
```

---

## 🎬 Animation Best Practices for ELIMFILTERS

### 1. GPU-Accelerated Properties Only

**Fast (GPU-accelerated):**
```css
/* Use these for animations */
transform: translateX(10px);
opacity: 0.5;
```

**Slow (CPU-intensive):**
```css
/* Avoid these for animations */
left: 10px;
width: 100px;
padding: 10px;
```

**Why:** Transform and opacity don't trigger layout recalculations. Use them for everything.

### 2. Easing Functions for Natural Motion

```css
/* Entry animations (something appears) */
--ease-out: cubic-bezier(0, 0, 0.2, 1);  /* Fast start, slow end */

/* Exit animations (something disappears) */
--ease-in: cubic-bezier(0.4, 0, 1, 1);   /* Slow start, fast end */

/* State changes (hover, focus) */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth both ways */

/* Playful/bouncy (special moments) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bounce effect */
```

**Apply Correctly:**
```typescript
// Good: Enters with ease-out (fast)
.card { animation: slideIn 0.3s var(--ease-out); }

// Good: Exits with ease-in (accelerates)
.card.closing { animation: slideOut 0.3s var(--ease-in); }

// Bad: Using ease-in for entrance (feels sluggish)
.card { animation: slideIn 0.3s var(--ease-in); }
```

---

## 👆 Gesture & Interaction Patterns

### Press Feedback (All Interactive Elements)

**What users expect:**
1. Visual feedback on click (shadow, scale)
2. Fast response (< 100ms)
3. Subtle scale (0.98, not 0.9)
4. No lag

**Implementation:**
```typescript
// Button press feedback
.button:active {
  transform: scale(0.98);  /* Subtle, not dramatic */
}

// Chip press
.chip:active {
  transform: scale(0.95);
  opacity: 0.8;
}
```

### Popover/Tooltip Behavior

**Principles:**
- Appear with entrance animation (fade + scale-up)
- Close on outside click or Escape
- Position intelligently (avoid viewport edge)
- Never block important content

**Example: Filter Tooltip**
```typescript
const [showTooltip, setShowTooltip] = useState(false);

return (
  <div 
    onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
  >
    <Filter />
    
    {showTooltip && (
      <Tooltip 
        className={styles.tooltipEnter}  // fade + scale
      >
        "Click to toggle this filter"
      </Tooltip>
    )}
  </div>
);
```

### Momentum & Damping (For Swipe)

If adding swipe filtering:

```typescript
// Swipe with momentum
const handleSwipe = (velocity: number) => {
  // Friction reduces velocity over time
  const damping = 0.95;
  let currentVelocity = velocity;
  
  const animate = () => {
    currentVelocity *= damping;
    if (Math.abs(currentVelocity) < 0.1) return;
    
    // Update position with current velocity
    requestAnimationFrame(animate);
  };
  
  animate();
};
```

---

## ✨ Invisible Details Checklist

Before shipping any component, verify:

### Loading States
- [ ] Show skeleton loaders (not spinners for cards)
- [ ] Skeleton matches final layout exactly
- [ ] Shimmer animation (left-to-right gradient)
- [ ] Duration: 1-2 seconds average

### Hover States
- [ ] Visual feedback within 16ms
- [ ] Elevation increase (shadow-lg)
- [ ] Subtle scale (1.02, not 1.1)
- [ ] Color shift (gold accent becomes brighter)
- [ ] No lag on fast movements

### Focus States
- [ ] 3px gold border minimum
- [ ] Visible without color (not just border color change)
- [ ] Outline-offset: 2px (space around element)
- [ ] Keyboard-accessible (no mouse-only)

### Disabled States
- [ ] Opacity 50% (not grayed out)
- [ ] Cursor: not-allowed
- [ ] No hover effects
- [ ] No focus possible (tabindex={-1})

### Error States
- [ ] Error message appears below field
- [ ] Red border on input
- [ ] Error icon or symbol
- [ ] Clear/persistent (doesn't disappear on first keystroke)

### Motion Respect
- [ ] `@media (prefers-reduced-motion: reduce)` applied
- [ ] All transitions removed for reduced motion users
- [ ] Alternative instant feedback provided

### Accessibility
- [ ] Tab order logical
- [ ] Focus always visible
- [ ] Color not used alone
- [ ] ARIA labels descriptive
- [ ] Semantic HTML

### Performance
- [ ] Animations < 300ms (most interactions)
- [ ] GPU-accelerated (transform/opacity only)
- [ ] No layout thrashing
- [ ] 60fps target (no jank)

---

## 🎨 Component-Specific Polish

### SearchBar
- [ ] **Clear button** appears/disappears smoothly (fade)
- [ ] **Focus** has gold glow shadow (not just border)
- [ ] **Typing** feels instant (no debounce delay)
- [ ] **Mobile** has larger touch target (44px)
- [ ] **Placeholder** fades nicely (gray text)

### ResultCard
- [ ] **Hover** elevates smoothly (shadow + scale)
- [ ] **Tags** have subtle background fade
- [ ] **Specs grid** aligns perfectly (no jumpy layout)
- [ ] **Left border** Gold accent stays visible always
- [ ] **Click** provides press feedback (scale 0.98)

### FilterChip
- [ ] **Active state** has gold glow
- [ ] **Remove button** (✕) appears on hover (not always)
- [ ] **Removing** animates out (fade + scale)
- [ ] **Adding** animates in (fade + slide)
- [ ] **Keyboard** removable via Backspace

### Button
- [ ] **Primary** has shadow on hover
- [ ] **Outline** border glows on hover
- [ ] **Loading** spinner animates smoothly
- [ ] **Disabled** feels unavailable (no hover effects)
- [ ] **Press** has scale feedback (0.98)

### Input
- [ ] **Focus** gold border + glow shadow
- [ ] **Error** red border, error message below
- [ ] **Typing** cursor is visible and smooth
- [ ] **Label** stays visible (not placeholder-only)
- [ ] **Icon** optional, aligned perfectly

---

## 🎬 Animation Timing Reference

**Milliseconds for different interactions:**

```
Micro-interactions (feedback):  100-150ms
  - Hover effects
  - Focus indicators
  - Button press

Transitions (state changes):    200-300ms
  - Component appear/disappear
  - Modal open/close
  - Filter toggle

Entrance animations:            300-500ms
  - Page transitions
  - List item stagger (50-100ms between items)
  - Full-screen overlays

Anything longer than 500ms:     Feels slow
  - Users perceive delay
  - Can feel sluggish
  - Use only for dramatic effect (rare)
```

---

## 🚀 Polish Before Shipping

**Checklist order:**

1. **Functionality first** — Component works correctly
2. **Accessibility** — WCAG AA minimum compliance
3. **Responsiveness** — Mobile/tablet/desktop layouts
4. **Performance** — 60fps animations, < 300ms interactions
5. **Polish** — Invisible details, refined interactions
6. **Documentation** — Examples, props, usage

**Don't ship until all 6 are complete.**

---

## 📚 Reference

- [Emil Kowalski's Design Engineering Skill](https://github.com/emilkowalski/skill)
- [Web Animations Best Practices](https://web.dev/animations/)
- [WCAG Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [CSS Easing Functions](https://cubic-bezier.com/)
- [GPU-Accelerated Properties](https://www.smashingmagazine.com/2012/06/how-to-make-the-most-of-your-analytics-data/)

---

**Last Updated:** 2026-04-21 | Status: ✅ Complete
