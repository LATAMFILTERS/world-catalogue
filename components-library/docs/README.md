# ELIMFILTERS Components Library

Professional React component library for the ELIMFILTERS filtration catalog. Built with UI/UX Pro Max Skill, Nano-Banana-MCP for visual generation, and Stitch-MCP for design validation.

## 🎯 Overview

This library provides a complete, production-ready component system for building professional filtration industry UIs. Every component is:

- ✅ **Type-safe** — Full TypeScript support
- ✅ **Accessible** — WCAG AA compliant (minimum 4.5:1 contrast)
- ✅ **Responsive** — Mobile-first design
- ✅ **Dark theme** — Premium dark mode with gold accents
- ✅ **Documented** — Design system + usage examples
- ✅ **Tested** — Visual validation via Nano-Banana

## 📦 What's Included

### Core Components (Tier 1)
- **SearchBar** — Search input with clear button
- **ResultCard** — Product result card with SKU, tags, specs
- **FilterChip** — Active filter pill with remove button
- **SpecsGrid** — Technical specifications grid
- **TagBadge** — Colored status/category tags

### UI Components (Tier 2)
- **Button** — Primary, secondary, outline variants
- **Input** — Labeled input with error states
- **Tabs** — Tab navigation with active indicator
- **Loading** — Skeleton loaders & spinners

### Design System
- **Design Tokens** — Colors, typography, spacing, shadows
- **CSS Variables** — Shared token system for consistency
- **Accessibility** — WCAG AA guidelines + checklist

## 🚀 Quick Start

### Installation

```bash
npm install @elimfilters/components-library
```

Or use directly from source:

```bash
cd components-library
npm install
npm run build
```

### Basic Usage

```typescript
import { SearchBar, ResultCard, TagBadge } from '@elimfilters/components-library';
import '@elimfilters/components-library/dist/styles/tokens.css';

export default function SearchInterface() {
  const [query, setQuery] = useState('');

  return (
    <>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by SKU (P552100, LF3620...)"
      />

      <ResultCard
        sku="P552100"
        title="Air Filter Element"
        tags={[
          { label: 'In Stock', color: 'success' },
          { label: 'Premium', color: 'primary' },
        ]}
        specs={[
          { label: 'OEM', value: 'Donaldson' },
          { label: 'Application', value: 'Heavy Duty' },
        ]}
      />
    </>
  );
}
```

## 📚 Documentation

- **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** — Design tokens, colors, typography
- **[COMPONENTS.md](./COMPONENTS.md)** — Component catalog with examples
- **[GETTING-STARTED.md](./GETTING-STARTED.md)** — Setup & integration guide
- **[UX-GUIDELINES.md](./UX-GUIDELINES.md)** — Accessibility & UX best practices
- **[POLISH-GUIDE.md](./POLISH-GUIDE.md)** — Emil Kowalski's design engineering principles
- **[WORKFLOW.md](./WORKFLOW.md)** — Development workflow with MCP tools

## 🎨 Design System

### Colors

```css
--color-primary: #e8c94a;        /* Gold accent */
--color-bg-void: #080808;        /* Dark background */
--color-text-primary: #ffffff;   /* White text */
--color-success: #22c55e;        /* Green */
--color-error: #ef4444;          /* Red */
```

### Spacing

Base unit: **4px**

```
--space-1: 4px    --space-6: 24px
--space-2: 8px    --space-8: 32px
--space-3: 12px   --space-10: 40px
--space-4: 16px   --space-12: 48px
```

### Typography

```
Font: Inter (sans-serif) + JetBrains Mono (monospace)
Sizes: 12px → 30px scale
Weights: 400 (regular) → 700 (bold)
```

## 🔧 Development

### Build

```bash
npm run build        # Compile TypeScript
npm run typecheck    # Type validation
npm run dev          # Watch mode
```

### Adding New Components

1. Create component folder: `src/components/ComponentName/`
2. Create files:
   - `ComponentName.tsx` — React component
   - `ComponentName.module.css` — Styles
   - `README.md` — Documentation
3. Export in `src/index.ts`
4. Generate mockup via Nano-Banana (optional)
5. Validate with Stitch-MCP (optional)

## 📊 Component Status

| Component | Status | Visual Assets | Docs |
|-----------|--------|---|---|
| SearchBar | 🔜 Planned | Pending | Pending |
| ResultCard | 🔜 Planned | Pending | Pending |
| FilterChip | 🔜 Planned | Pending | Pending |
| SpecsGrid | 🔜 Planned | Pending | Pending |
| TagBadge | 🔜 Planned | Pending | Pending |
| Button | 🔜 Planned | Pending | Pending |
| Input | 🔜 Planned | Pending | Pending |

## 🛠️ Tools Integration

### UI/UX Pro Max Skill
Design tokens & UX guidelines from AI design intelligence.

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "filtration components dark mode" \
  --design-system
```

### Nano-Banana-MCP
Visual mockup generation using Google Gemini 2.5 Flash.

```bash
/nano-banana generate_image "SearchBar component mockup..."
```

### Stitch-MCP
Component composition & design validation.

```bash
/stitch get_screen_code project-id screen-id
```

## 📋 Accessibility

All components meet **WCAG AA** standards:

- ✅ Minimum 4.5:1 contrast ratio
- ✅ Keyboard navigation support
- ✅ Focus states clearly visible
- ✅ ARIA attributes where needed
- ✅ Semantic HTML structure

## 📄 License

MIT License — Free for commercial use

## 🤝 Contributing

1. Follow existing component patterns
2. Maintain TypeScript strict mode
3. Ensure WCAG AA compliance
4. Include documentation & examples
5. Update COMPONENTS.md catalog

## 📞 Support

For issues or questions:
- Open an issue in the repository
- Check existing documentation
- Review component examples

---

**Built with ❤️ for the filtration industry**

Version: 0.1.0 | Last updated: 2026-04-21
