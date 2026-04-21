# UX Guidelines

**Best practices for using ELIMFILTERS components in filtration & industrial B2B contexts**

---

## 🎯 Search & Filtration UX

### Clear Search Affordance
- **DO:** Use search icon (🔍) clearly visible
- **DO:** Placeholder text showing example SKU (e.g., "P552100, LF3620")
- **DON'T:** Use just "Search" text
- **WHY:** B2B users need context about what they're searching

### Instant Clear Button
- **DO:** Show (✕) button only when text present
- **DO:** Clear on click, focus returns to input
- **DON'T:** Always show clear button (visual clutter)
- **WHY:** Users need quick way to reset search

### Real-Time Filtering Feedback
- **DO:** Show results count ("123 filters found")
- **DO:** Disable filters that have 0 results
- **DON'T:** Load results without indicating progress
- **WHY:** Industrial users need immediate feedback

---

## 🏷️ Filter Chips UX

### Active vs Inactive State
- **DO:** Make active filters visually distinct (gold border + background)
- **DO:** Show (✕) only on active filters
- **DON'T:** Make inactive filters look clickable
- **WHY:** Users need clear "what's applied" visibility

### Keyboard Navigation
- **DO:** Tab through filters, Enter to toggle, Backspace to remove
- **DON'T:** Require mouse for filter management
- **WHY:** Power users (B2B) prefer keyboard shortcuts

### Multiple Selection Clarity
- **DO:** Arrange filters left-to-right, wrap to new line
- **DO:** Show total active filters count
- **DON'T:** Use small hard-to-read chips
- **WHY:** Industrial catalogs have 50+ filter combinations

---

## 📋 Result Cards UX

### Hierarchy & Scanability
**Optimal order for B2B users:**
1. **SKU** (most important—top, bold, mono font)
2. **Product Title** (secondary anchor)
3. **Tags** (quick status: "In Stock", "Premium", "Certifications")
4. **Specs Grid** (detailed technical info below fold)

**WHY:** B2B users scan for SKU first, then verify specs

### Hover States
- **DO:** Slight elevation increase on hover (shadow-lg)
- **DO:** Keep left gold border visible on hover
- **DON'T:** Hide information on hover
- **WHY:** Desktop users expect interactive feedback

### Click Targets
- **DO:** Entire card clickable (except chips/tags)
- **DO:** Min 44px height for mobile
- **DON'T:** Tiny clickable areas
- **WHY:** Industrial warehouse/maintenance users work in harsh conditions

---

## 📊 Specs Grid UX

### Technical Information Display
- **DO:** Use monospace font for values (SKU, codes, numbers)
- **DO:** 2-column layout on desktop, 1-column on mobile
- **DO:** Show units explicitly ("2000 hours", "99.95%")
- **DON'T:** Abbreviate technical values
- **WHY:** Specs are critical for procurement decisions

### Label Clarity
- **DO:** Uppercase labels ("OEM", "EFFICIENCY", "LIFE")
- **DO:** Keep labels under 20 characters
- **DON'T:** Use vague labels ("Param A", "Value 1")
- **WHY:** B2B users need immediate understanding

---

## 🎨 Color Usage Guidelines

### Status Indicators
```
✅ In Stock = Green (#22c55e)
⚠️  Back Order = Yellow (#f59e0b)
❌ Out of Stock = Red (#ef4444)
ℹ️  Info = Blue (#3b82f6)
⭐ Premium = Gold (#e8c94a)
```

**IMPORTANT:**
- **DO:** Combine color with icon/text
- **DON'T:** Use color alone (accessibility)
- **WHY:** Color-blind users (8% of men, 0.5% of women) need text/icon backup

### Dark Theme Best Practices
- **DO:** Use white text (#ffffff) for primary information
- **DO:** Use secondary text (#d1d5db) for helper text
- **DO:** Maintain 4.5:1 contrast minimum
- **DON'T:** Use light grays below #9ca3af
- **WHY:** Industrial environments have varied lighting (warehouse floors, field)

---

## ⌨️ Keyboard Accessibility

### Tab Order
- **DO:** Tab order follows logical reading order (left-to-right, top-to-bottom)
- **DO:** Focus visible with 3px gold border
- **DON'T:** Skip focusable elements
- **WHY:** ~15% of users rely on keyboard only

### Keyboard Shortcuts
```
Tab             — Move to next interactive element
Shift+Tab       — Move to previous element
Enter/Space     — Activate button/link
Escape          — Close dropdown/modal
Left/Right      — Navigate between tabs
Backspace       — Remove filter chip
```

### Focus Visible
- **DO:** Always show focus indicator (cannot be removed)
- **DO:** Use 3px gold border minimum
- **DON'T:** Hide focus state on hover
- **WHY:** Keyboard users need to see where they are

---

## 🔍 Contrast & Readability

### WCAG AA Compliance (Minimum 4.5:1)

✅ **Sufficient Contrast:**
- White (#ffffff) on dark (#080808) = 21:1
- Secondary (#d1d5db) on dark = 11.2:1
- Muted (#9ca3af) on dark = 7.1:1
- Gold (#e8c94a) on dark = 4.5:1

❌ **Insufficient Contrast:**
- Any text below #9ca3af on #080808
- Light colors on light backgrounds
- Reversed light text on light buttons

### Text Size
- **DO:** Body text minimum 14px (16px preferred)
- **DO:** Labels minimum 12px (14px preferred)
- **DON'T:** Use text below 12px
- **WHY:** Industrial users often 40+ years old; presbyopia affects 35% of population

---

## 🎬 Motion & Animation

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

- **DO:** Respect `prefers-reduced-motion` media query
- **DO:** Provide instant feedback without animation
- **DON'T:** Force animations on users who disable them
- **WHY:** 30% of users have motion sensitivity (vestibular disorders)

### Animation Best Practices
- **DO:** Use `transition-fast` (0.15s) for micro-interactions
- **DO:** Use `ease-out` for entry, `ease-in` for exit
- **DON'T:** Animate more than 3 properties simultaneously
- **WHY:** Heavy animation reduces productivity

---

## 📱 Mobile & Responsive UX

### Touch Targets
- **DO:** Minimum 44px × 44px (iOS/Android standard)
- **DO:** 8px spacing between touch targets
- **DON'T:** Use small buttons or close spacing
- **WHY:** Industrial users work in gloves, harsh conditions

### Mobile Layout Changes
```
Mobile (< 768px):
- 1-column search results
- Full-width cards
- Stacked filter chips

Tablet (768px - 1024px):
- 2-column grid possible
- Wider cards
- Inline filter chips

Desktop (> 1024px):
- 2-3 column layouts
- Larger cards with more detail
- Sidebar filters optional
```

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 🔌 Form Input UX

### Labels & Placeholders
- **DO:** Always use visible labels (not just placeholder)
- **DO:** Placeholder as example ("e.g., P552100")
- **DON'T:** Use placeholder as label substitute
- **WHY:** Users forget what field requires after clicking

### Error Handling
- **DO:** Show error message below field (red text)
- **DO:** Keep error visible while user types
- **DON'T:** Clear error on first character
- **WHY:** Users need to know their fix was correct

### Disabled vs Read-Only
- **DO:** Use disabled for unavailable fields
- **DO:** Use read-only for data that can't change
- **DON'T:** Mix disabled/read-only semantics
- **WHY:** Screen reader users need different feedback

---

## 🌐 Browser & Device Support

### Tested Environments
- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (iOS 14+)
- ✅ Mobile Chrome (Android 10+)

### Progressive Enhancement
- **DO:** Components work without JavaScript (semantic HTML)
- **DO:** Degrade gracefully on older browsers
- **DON'T:** Require JavaScript for basic functionality
- **WHY:** Some B2B systems run on old/locked-down machines

---

## ✅ Accessibility Checklist

Before shipping components, verify:

- [ ] All text meets 4.5:1 contrast (WCAG AA)
- [ ] Interactive elements are 44px × 44px minimum
- [ ] Focus states are clearly visible (3px border)
- [ ] Keyboard navigation works completely
- [ ] Color not used alone for information
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Forms have visible labels
- [ ] Error messages are descriptive
- [ ] Touch targets have 8px spacing
- [ ] No placeholder text as labels
- [ ] Semantic HTML (nav, main, form, button)
- [ ] ARIA attributes only when needed
- [ ] Skip links for major sections
- [ ] Language attribute on HTML tag
- [ ] Images have alt text

---

## 🎯 B2B-Specific Guidelines

### Industrial Workflow Context
- **DO:** Optimize for speed (power users scan quickly)
- **DO:** Show batch operations ("Select all", "Clear filters")
- **DO:** Provide keyboard shortcuts for power users
- **DON'T:** Require mouse-only workflow
- **WHY:** Industrial maintenance schedules are urgent

### Offline/Low-Bandwidth Scenarios
- **DO:** Cache common SKUs/filters locally
- **DO:** Show last-known state if offline
- **DON'T:** Require constant internet connection
- **WHY:** Warehouse networks are often unreliable

### Print-Friendly Design
- **DO:** Ensure specs grid is readable in print
- **DO:** Hide irrelevant UI when printing
- **DON'T:** Use colors that don't print (pale gold)
- **WHY:** Users print filter specs for reference

---

## 📊 Performance Guidelines

### Page Load
- **DO:** Load search results in < 1 second
- **DO:** Show skeleton loaders for cards
- **DON'T:** Block UI while loading
- **WHY:** Users expect instant results (1000+ SKUs)

### Interaction Response
- **DO:** Button click feedback < 100ms
- **DO:** Filter results < 500ms
- **DON'T:** Lag on user input
- **WHY:** Industrial decisions are time-sensitive

---

**Last Updated:** 2026-04-21 | Status: ✅ Complete
