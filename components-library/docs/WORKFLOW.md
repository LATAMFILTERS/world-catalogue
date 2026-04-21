# Development Workflow

Cómo usar la biblioteca en el proyecto motor-de-busqueda y futuras aplicaciones.

---

## 🔌 Integration en motor-de-busqueda

### Step 1: Configure Path Alias

En `motor-de-busqueda/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/components-library": ["../../components-library/src"]
    }
  }
}
```

### Step 2: Import Components

```typescript
// motor-de-busqueda/app/components/SearchInterface.tsx
import { SearchBar, ResultCard, FilterChip, Button } from '@/components-library';
import '@/components-library/styles/tokens.css';
import '@/components-library/styles/typography.css';

export function SearchInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  return (
    <div>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by SKU..."
        onClear={() => setQuery('')}
      />

      {results.map(r => (
        <ResultCard key={r.sku} {...r} />
      ))}
    </div>
  );
}
```

### Step 3: Build Library

Antes de usar, compilar TypeScript:

```bash
cd components-library
npm install
npm run build
```

Output: `components-library/dist/` con tipos TypeScript.

---

## 🎯 Using Nano-Banana-MCP for Mockups

### Generate Visual Reference

```bash
# En el proyecto root
/nano-banana generate_image "
SearchBar component in ELIMFILTERS catalog:
- Dark background (#080808)
- Gold accent (#e8c94a) on focus
- Clear button (✕) appears when text present
- Responsive mobile layout
Professional, minimalist B2B design"
```

Output: PNG guardado en `components-library/visual-assets/`.

### Include in Documentation

```markdown
## SearchBar Component

![SearchBar mockup](../visual-assets/searchbar-mockup.png)

### Visual States
- Default: Placeholder visible
- Focused: Gold border + glow
- Filled: Clear button visible
- Error: Red border
```

---

## 📦 Using Stitch-MCP for Validation

### Compare Design vs Implementation

```bash
# Setup Stitch (one-time)
npx @_davideast/stitch-mcp init

# Get design HTML
/stitch get_screen_code "elimfilters-lib" "searchbar-screen"

# Get screenshot for comparison
/stitch get_screen_image "elimfilters-lib" "searchbar-screen"
```

### Claude Code compares

```
Claude Code can then:
1. Read design HTML from Stitch
2. Compare with React component implementation
3. Verify spacing, colors, fonts match
4. Suggest adjustments if needed
```

---

## ✨ AI-Assisted Development Workflow

### Phase 1: Design Token Generation (UI/UX Pro Max)

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "component design dark mode B2B filtration" \
  --design-system -p "ELIMFILTERS"
```

→ Output: Color palettes, typography scales, spacing rules

### Phase 2: Visual Mockup Generation (Nano-Banana)

```
/nano-banana generate_image "SearchBar component with [specs]"
```

→ Output: Professional PNG mockup for documentation

### Phase 3: Component Implementation

```typescript
// Use design tokens & mockup as reference
// Type-safe React component with CSS Modules
// Full accessibility built-in
```

### Phase 4: Design Validation (Stitch-MCP)

```
/stitch get_screen_code project screen
→ Claude Code validates implementation against design
```

### Phase 5: Documentation

```markdown
# Component Name

![Mockup](../visual-assets/...)

## Props
## Usage
## Accessibility
## Design Specs
```

---

## 🔄 Adding New Components

### Template for New Component

Create folder: `src/components/ComponentName/`

**ComponentName.tsx:**
```typescript
import React from 'react';
import { ComponentNameProps } from '../../types/index';
import styles from './ComponentName.module.css';

export const ComponentName: React.FC<ComponentNameProps> = ({
  // props
}) => {
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

**ComponentName.module.css:**
```css
.container {
  /* Use design tokens from tokens.css */
  padding: var(--space-4);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
}
```

### Update Types

In `src/types/index.ts`:
```typescript
export interface ComponentNameProps {
  // Props definition
}
```

### Export in Barrel

In `src/index.ts`:
```typescript
export { ComponentName } from './components/ComponentName/ComponentName';
```

### Generate Mockup

```
/nano-banana generate_image "ComponentName mockup..."
```

### Document It

Create `docs/` entry or update `COMPONENTS.md`

---

## 📊 Testing Components

### Manual Testing

```typescript
// In motor-de-busqueda app
import { SearchBar } from '@/components-library';

export default function TestPage() {
  const [value, setValue] = useState('');
  
  return <SearchBar value={value} onChange={setValue} />;
}
```

### Visual Testing (Nano-Banana)

```
/nano-banana generate_image "
Current SearchBar implementation screenshot
Compare to design mockup and verify:
- Spacing correct
- Colors match
- Focus state visible
- Mobile responsive
"
```

### Accessibility Testing

Use Chrome DevTools:
- Lighthouse → Accessibility score (target: 90+)
- Color Contrast Analyzer
- Tab navigation check

---

## 🚀 Publishing to npm

When library is production-ready:

```bash
# Update version in package.json
npm version minor

# Build
npm run build

# Publish
npm publish

# Usage in other projects
npm install @elimfilters/components-library
```

---

## 🔗 File Structure Reference

```
world-catalogue/
├── components-library/              ← This library
│   ├── src/
│   │   ├── components/              ← React components
│   │   ├── styles/                  ← Design tokens
│   │   ├── types/                   ← TypeScript interfaces
│   │   └── index.ts                 ← Barrel export
│   ├── docs/                        ← Documentation
│   ├── visual-assets/               ← Nano-Banana mockups
│   ├── package.json
│   └── tsconfig.json
│
├── motor-de-busqueda/               ← Next.js app (uses library)
│   ├── app/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx        ← Imports from library
│   │   │   └── ...
│   │   └── tsconfig.json            ← Has path alias
│   └── ...
│
└── .mcp.json                        ← MCP servers config
```

---

## 🛠️ MCP Tools Integration

### Setup Environment

Create `.env.local`:
```
GEMINI_API_KEY=your_key
STITCH_API_KEY=your_key
```

Or use Claude Code settings:
- Settings → Environment Variables
- Add GEMINI_API_KEY and STITCH_API_KEY

### Available Commands

**UI/UX Pro Max (local Python script)**
```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "query"
```

**Nano-Banana-MCP (in Claude Code)**
```
/nano-banana generate_image "description"
/nano-banana continue_editing "adjustments"
```

**Stitch-MCP (in Claude Code)**
```
/stitch list_projects
/stitch get_screen_code project screen
/stitch get_screen_image project screen
```

---

## 📚 Documentation Structure

- **README.md** — Overview & quick start
- **DESIGN-SYSTEM.md** — Design tokens, colors, typography
- **COMPONENTS.md** — Component catalog with specs
- **GETTING-STARTED.md** — Setup & integration
- **UX-GUIDELINES.md** — Best practices & accessibility
- **WORKFLOW.md** — This file, development workflow

---

## ✅ Checklist for New Components

- [ ] Component created in `src/components/`
- [ ] Props defined in `src/types/index.ts`
- [ ] Exported in `src/index.ts`
- [ ] CSS Module created with design tokens
- [ ] Mockup generated (Nano-Banana)
- [ ] Documented in `COMPONENTS.md`
- [ ] Accessibility tested (Lighthouse 90+)
- [ ] TypeScript strict mode passes
- [ ] Examples added to `GETTING-STARTED.md`

---

**Last Updated:** 2026-04-21 | Status: ✅ Production Ready
