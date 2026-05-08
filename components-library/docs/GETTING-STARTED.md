# Getting Started

Guía rápida para empezar a usar la biblioteca de componentes ELIMFILTERS.

## Installation

```bash
npm install @elimfilters/components-library
```

Or in the project:

```bash
cd components-library
npm install
npm run build
```

## Basic Setup

### Import Styles

En tu aplicación principal, importa los tokens CSS:

```typescript
import '@elimfilters/components-library/src/styles/tokens.css';
import '@elimfilters/components-library/src/styles/typography.css';
import '@elimfilters/components-library/src/styles/reset.css';
```

### Import Component

```typescript
import { SearchBar, ResultCard, TagBadge } from '@elimfilters/components-library';
```

## Quick Examples

### SearchBar

```typescript
import { SearchBar } from '@elimfilters/components-library';
import { useState } from 'react';

export function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <SearchBar
      value={query}
      onChange={setQuery}
      placeholder="Search by SKU..."
      onClear={() => setQuery('')}
    />
  );
}
```

### ResultCard

```typescript
import { ResultCard } from '@elimfilters/components-library';

export function SearchResults() {
  return (
    <ResultCard
      sku="P552100"
      title="Air Filter Element"
      tags={[
        { label: 'In Stock', color: 'success' },
        { label: 'Premium', color: 'primary' }
      ]}
      specs={[
        { label: 'OEM', value: 'Donaldson' },
        { label: 'Efficiency', value: '99.95%' }
      ]}
      onClick={() => console.log('Card clicked')}
    />
  );
}
```

### Button & Input

```typescript
import { Button, Input } from '@elimfilters/components-library';

export function Form() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!value) {
      setError('This field is required');
      return;
    }
    console.log('Submitted:', value);
  };

  return (
    <>
      <Input
        label="SKU Code"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={error}
        placeholder="Enter SKU..."
      />
      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </>
  );
}
```

### FilterChips

```typescript
import { FilterChip } from '@elimfilters/components-library';

export function FilterBar() {
  const [filters, setFilters] = useState(['inStock', 'premium']);

  const removeFilter = (filter) => {
    setFilters(filters.filter(f => f !== filter));
  };

  return (
    <div>
      {filters.map(f => (
        <FilterChip
          key={f}
          label={f}
          active={true}
          onRemove={() => removeFilter(f)}
        />
      ))}
    </div>
  );
}
```

### SpecsGrid

```typescript
import { SpecsGrid } from '@elimfilters/components-library';

export function SpecsDisplay() {
  return (
    <SpecsGrid
      items={[
        { label: 'OEM', value: 'Donaldson' },
        { label: 'Type', value: 'Air' },
        { label: 'Efficiency', value: '99.95%' },
        { label: 'Life', value: '2000 hours' }
      ]}
      columns={2}
    />
  );
}
```

## Design Tokens Usage

Access design tokens via CSS variables:

```css
.myElement {
  color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family-sans);
}
```

## Responsive Design

All components are mobile-first responsive:

```css
/* Default: mobile layout */
.grid {
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Accessibility

All components include:
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus visible states
- ✅ Color contrast WCAG AA
- ✅ Semantic HTML

Example with accessibility:

```typescript
<SearchBar
  value={query}
  onChange={setQuery}
  ariaLabel="Search filters by SKU"
  placeholder="Enter SKU..."
/>
```

## TypeScript Support

Full TypeScript support included:

```typescript
import type { SearchBarProps, ResultCardProps } from '@elimfilters/components-library';

const myProps: SearchBarProps = {
  value: '',
  onChange: (v) => console.log(v),
  placeholder: 'Search...'
};
```

## Build & Development

### Development Mode

```bash
npm run dev
```

Watch mode for TypeScript compilation.

### Build for Production

```bash
npm run build
```

Outputs compiled JavaScript to `dist/`.

### Type Checking

```bash
npm run typecheck
```

Validate TypeScript without compilation.

## Next Steps

1. ✅ Review [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) for tokens
2. ✅ Browse [COMPONENTS.md](./COMPONENTS.md) for all components
3. ✅ Check [UX-GUIDELINES.md](./UX-GUIDELINES.md) for best practices
4. 🚀 Start building!

## Support

For issues or questions:
- Check the documentation
- Review component examples
- Check TypeScript interfaces

---

**Happy building! 🎉**
