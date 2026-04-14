# ELIMFILTERS Design System

## Brand Identity

Industrial precision meets modern engineering. Dark surfaces, gold accents, technical typography. Communicates reliability, expertise, and innovation in filtration technology.

**Brand Voice:** Technical but accessible. Confident. Precise.

---

## Color Palette

### Base
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-void` | `#080808` | Page background |
| `--bg-surface` | `#0d0d0d` | Cards, panels |
| `--bg-elevated` | `#141414` | Elevated components |
| `--bg-overlay` | `#1a1a1a` | Modals, tooltips |
| `--border` | `#222222` | Dividers, borders |
| `--border-subtle` | `#1a1a1a` | Subtle separators |

### Accent (Gold)
| Token | Hex | Usage |
|-------|-----|-------|
| `--gold-bright` | `#f0d060` | Hover states, highlights |
| `--gold-primary` | `#e8c94a` | CTAs, SKU labels, active |
| `--gold-muted` | `#b89a30` | Secondary accent |
| `--gold-dim` | `#5a4a18` | Backgrounds, tags |
| `--gold-glow` | `rgba(232,201,74,0.15)` | Glow effects |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#ffffff` | Headlines, labels |
| `--text-secondary` | `#cccccc` | Body text |
| `--text-muted` | `#888888` | Captions, metadata |
| `--text-dim` | `#555555` | Disabled, placeholder |

### Status
| Token | Hex | Usage |
|-------|-----|-------|
| `--green` | `#22c55e` | Success, HD duty |
| `--blue` | `#3b82f6` | Info, marine |
| `--orange` | `#f97316` | Warning |
| `--red` | `#ef4444` | Error |

---

## Typography

**Primary:** `'Inter', 'Segoe UI', system-ui, sans-serif`
**Mono:** `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`

| Scale | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-hero` | `4rem / 64px` | 900 | Hero headlines |
| `--text-h1` | `2.5rem / 40px` | 800 | Page titles |
| `--text-h2` | `1.75rem / 28px` | 700 | Section headers |
| `--text-h3` | `1.25rem / 20px` | 600 | Card titles |
| `--text-sku` | `2.6rem / 42px` | 900 | SKU display (mono) |
| `--text-body` | `0.9rem / 14px` | 400 | Body text |
| `--text-small` | `0.75rem / 12px` | 400 | Captions, tags |
| `--text-label` | `0.65rem / 10px` | 700 | Uppercase labels |

---

## Spacing

Base unit: `4px`

```
xs:  4px    sm:  8px    md: 16px
lg: 24px    xl: 32px   2xl: 48px   3xl: 64px
```

---

## Borders & Radius

```
--radius-sm:   4px   (tags, badges)
--radius-md:   8px   (buttons, inputs)
--radius-lg:  12px   (cards)
--radius-xl:  16px   (panels, modals)
--radius-full: 9999px (pills, avatars)
```

---

## Shadows & Glow

```css
--shadow-sm:   0 2px 8px rgba(0,0,0,0.4);
--shadow-md:   0 4px 16px rgba(0,0,0,0.6);
--shadow-lg:   0 8px 40px rgba(0,0,0,0.8);
--glow-gold:   0 0 20px rgba(232,201,74,0.3), 0 0 60px rgba(232,201,74,0.1);
--glow-gold-sm: 0 0 8px rgba(232,201,74,0.4);
```

---

## Animation

```css
--ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);

--duration-fast:   150ms;
--duration-base:   250ms;
--duration-slow:   400ms;
--duration-slower: 600ms;
```

**Principles:**
- Entrances: slide-up + fade (translateY 12px → 0, opacity 0 → 1)
- Exits: fade only
- Hover: scale(1.02) on cards, gold border glow on inputs
- Loading: shimmer sweep left-to-right

---

## Components

### Button Primary
```
bg: --gold-primary  |  text: #000  |  weight: 700
padding: 10px 24px  |  radius: --radius-md
hover: bg --gold-bright, shadow --glow-gold-sm
transition: 200ms --ease-smooth
```

### Button Ghost
```
bg: transparent  |  border: 1px solid --border  |  text: --text-secondary
hover: border --gold-primary, text --gold-primary
```

### Input / Search
```
bg: --bg-elevated  |  border: 1px solid --border  |  text: --text-primary
focus: border --gold-primary, box-shadow --glow-gold-sm
font: --text-body  |  padding: 12px 16px  |  radius: --radius-md
```

### Card
```
bg: --bg-surface  |  border: 1px solid --border
radius: --radius-lg  |  shadow: --shadow-md
hover: border rgba(232,201,74,0.3), shadow --shadow-lg
transition: 300ms --ease-smooth
```

### SKU Badge
```
font: --text-sku, monospace  |  color: --gold-primary
letter-spacing: 1px
```

### Filter Type Tag
```
bg: --gold-dim  |  color: --gold-primary
font: --text-label, uppercase  |  padding: 3px 8px
radius: --radius-sm
```

### Duty Badge
```
HD: bg rgba(34,197,94,0.15), color #22c55e
LD: bg rgba(59,130,246,0.15), color #3b82f6
Marine: bg rgba(6,182,212,0.15), color #06b6d4
```

---

## Layout

- Max width: `1280px`
- Content padding: `24px` (mobile: `16px`)
- Grid: 12-column, gap `24px`
- Sidebar: `280px`

---

## Iconography

Use **Lucide Icons** (stroke, 1.5px weight). Size: 16px inline, 20px standalone.
Gold for active/accent, `--text-muted` for inactive.

---

## Motion Patterns

### Page Load
```
Hero text: stagger 100ms, slide-up 20px, fade 600ms
Background: subtle grid pattern fade-in 1s
```

### Search Results
```
Cards appear: stagger 50ms each, slide-up 8px, fade 300ms
```

### Chatbot
```
Messages: slide-in from side, fade 200ms
Typing indicator: dot pulse 1.2s infinite
Panel: slide-up from bottom-right, 400ms spring
```
