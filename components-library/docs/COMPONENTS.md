# Components Catalog

**ELIMFILTERS Components Library v0.1.0**

Catálogo completo de componentes con ejemplos, props y variantes.

---

## SearchBar Component

### Overview
Input de búsqueda con botón de limpiar. Diseñado para búsqueda de SKUs y filtros.

### Props
```typescript
interface SearchBarProps {
  value: string;                    // Valor actual
  onChange: (value: string) => void; // Callback de cambio
  placeholder?: string;              // Texto placeholder
  onClear?: () => void;              // Callback limpiar
  disabled?: boolean;                // Estado deshabilitado
  ariaLabel?: string;                // ARIA label
}
```

### Usage
```typescript
<SearchBar
  value={query}
  onChange={setQuery}
  placeholder="Search by SKU (P552100, LF3620...)"
  onClear={() => setQuery('')}
/>
```

### States
- **Default** — Border `#2d2d2d`, placeholder visible
- **Focused** — Border gold `#e8c94a`, glow shadow
- **Filled** — Clear button (✕) visible
- **Error** — Border red `#ef4444`
- **Disabled** — Opacity 50%

### Design Specs
- Min height: 44px
- Padding: 12px vertical, 16px horizontal
- Border radius: 8px
- Icon: Search (🔍)
- Font size: 16px (body-md)

### Accessibility
- ✅ Keyboard navigable (Tab/Enter)
- ✅ ARIA labels support
- ✅ Focus visible (3px gold border)
- ✅ Contrast 21:1 (white on dark)

---

## ResultCard Component

### Overview
Card de resultado que muestra SKU, título, tags y especificaciones técnicas.

### Props
```typescript
interface ResultCardProps {
  sku: string;
  title: string;
  tags?: Array<{ label: string; color: ColorVariant | 'gold' }>;
  specs?: Array<{ label: string; value: string }>;
  onClick?: () => void;
}
```

### Usage
```typescript
<ResultCard
  sku="P552100"
  title="Air Filter Element"
  tags={[
    { label: 'In Stock', color: 'success' },
    { label: 'Premium', color: 'primary' }
  ]}
  specs={[
    { label: 'OEM', value: 'Donaldson' },
    { label: 'Application', value: 'Heavy Duty' }
  ]}
  onClick={() => openDetail(sku)}
/>
```

### Layout
```
┌─────────────────────────────┐
│  P552100  │  Air Filter...  │
│                              │
│  [In Stock] [Premium]       │
│                              │
│  OEM: Donaldson             │
│  Application: Heavy Duty    │
└─────────────────────────────┘
  ↑ Left gold border 4px
```

### Design Specs
- Left border: 4px gold `#e8c94a`
- Padding: 16px all sides
- Border radius: 12px
- Background: `#0d0d0d`
- Box shadow: `0 4px 12px rgba(0,0,0,0.6)`
- Hover: elevation increase, slight scale
- Hover shadow: `0 12px 32px rgba(0,0,0,0.8)`

---

## FilterChip Component

### Overview
Pill/badge para mostrar filtros activos con opción de remover.

### Props
```typescript
interface FilterChipProps {
  label: string;
  active?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  onClick?: () => void;
}
```

### Usage
```typescript
<FilterChip
  label="In Stock"
  active={true}
  onRemove={() => removeFilter('inStock')}
/>
```

### States
- **Default** — Border outline `#3f3f3f`, text `#d1d5db`
- **Active** — Border gold `#e8c94a`, background `rgba(232,201,74,0.1)`
- **Hover** — Border glow, shadow-sm
- **Disabled** — Opacity 50%

### Design Specs
- Height: 32px
- Padding: 8px 12px
- Border radius: 16px (pill)
- Font: 14px, medium weight
- X icon: clickable, 16px × 16px

---

## TagBadge Component

### Overview
Etiqueta/badge coloreada para categorías, estado, metadata.

### Props
```typescript
interface TagBadgeProps {
  label: string;
  color?: ColorVariant | 'gold';  // primary, success, error, warning, info
  size?: 'sm' | 'md';
  variant?: 'filled' | 'outline';
}
```

### Usage
```typescript
<TagBadge label="In Stock" color="success" size="md" variant="filled" />
<TagBadge label="Premium" color="primary" variant="outline" />
```

### Color Variants
- **Gold** — `#e8c94a` (primary)
- **Green** — `#22c55e` (success)
- **Blue** — `#3b82f6` (info)
- **Cyan** — `#06b6d4` (marine)
- **Red** — `#ef4444` (error)

### Design Specs
- Small: 20px height, 8px padding
- Medium: 28px height, 12px padding
- Border radius: 4px
- Font: 12px, medium weight
- Filled: color background, white text
- Outline: transparent background, color border & text

---

## SpecsGrid Component

### Overview
Grid responsive de pares label-value para especificaciones técnicas.

### Props
```typescript
interface SpecsGridProps {
  items: Array<{ label: string; value: string }>;
  columns?: 2 | 3;  // Default: 2
}
```

### Usage
```typescript
<SpecsGrid
  items={[
    { label: 'OEM', value: 'Donaldson' },
    { label: 'Application', value: 'Heavy Duty' },
    { label: 'Efficiency', value: '99.95%' }
  ]}
  columns={2}
/>
```

### Layout
```
2-column (desktop):
┌──────────┬──────────┐
│ OEM      │ App      │
│ Donaldson│ Heavy    │
├──────────┼──────────┤
│ Eff.     │ Size     │
│ 99.95%   │ Large    │
└──────────┴──────────┘

1-column (mobile):
┌──────────┐
│ OEM      │
│ Donaldson│
├──────────┤
│ App      │
│ Heavy    │
├──────────┤
│ Eff.     │
│ 99.95%   │
└──────────┘
```

### Design Specs
- Label: 12px, uppercase, muted color
- Value: 14px, mono font, primary color
- Gap: 12px between items
- Desktop: 2-3 columns
- Mobile: 1 column
- Responsive: @md breakpoint switches layout

---

## Button Component

### Overview
Botón con múltiples variantes y tamaños.

### Props
```typescript
interface ButtonProps extends HTMLButtonElement {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}
```

### Usage
```typescript
<Button variant="primary" size="md">Search</Button>
<Button variant="outline" size="lg" loading={true}>Processing...</Button>
```

### Variants

**Primary**
- Background: `#e8c94a`
- Text: `#080808`
- Hover: scale 1.02, shadow-md
- Disabled: opacity 50%

**Secondary**
- Background: `#0d0d0d`
- Border: 2px `#e8c94a`
- Text: `#e8c94a`
- Hover: border-glow

**Outline**
- Background: transparent
- Border: 2px `#d1d5db`
- Text: `#d1d5db`
- Hover: border-gold, text-gold

**Ghost**
- Background: transparent
- Text: `#d1d5db`
- Hover: background `rgba(232,201,74,0.1)`

### Sizes
- **Small** — 32px height, 12px padding
- **Medium** — 40px height, 16px padding (default)
- **Large** — 48px height, 20px padding

---

## Input Component

### Overview
Campo de entrada con label y error handling.

### Props
```typescript
interface InputProps extends HTMLInputElement {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

### Usage
```typescript
<Input
  label="SKU"
  placeholder="Enter SKU code"
  value={sku}
  onChange={setSku}
  error={skuError}
/>
```

### States
- **Default** — Border `#2d2d2d`, label secondary color
- **Focused** — Border gold, shadow-glow
- **Filled** — Normal state, value visible
- **Error** — Border red `#ef4444`, error message below
- **Disabled** — Opacity 50%

### Design Specs
- Min height: 40px
- Padding: 12px
- Border radius: 8px
- Label: 12px uppercase, margin-bottom 8px
- Error text: 12px, red color, margin-top 4px

---

## Tabs Component

### Overview
Navegación por tabs con indicador activo.

### Props
```typescript
interface TabsProps {
  items: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  active: string;
  onChange: (id: string) => void;
}
```

### Usage
```typescript
<Tabs
  items={[
    { id: 'specs', label: 'Specs', icon: <SpecIcon /> },
    { id: 'codes', label: 'OEM Codes' },
    { id: 'apps', label: 'Applications' }
  ]}
  active={activeTab}
  onChange={setActiveTab}
/>
```

### Design Specs
- Tab height: 44px
- Padding: 12px 16px
- Active indicator: 4px gold border-bottom
- Font: 14px medium weight
- Hover: background `rgba(232,201,74,0.05)`
- Keyboard: Left/Right arrows for navigation

---

## Loading Component

### Overview
Skeleton loader y spinner para estados de carga.

### Props
```typescript
interface LoadingProps {
  type: 'skeleton' | 'spinner';
  size?: 'sm' | 'md' | 'lg';
  count?: number;  // For skeleton rows
}
```

### Usage
```typescript
<Loading type="skeleton" count={3} />
<Loading type="spinner" size="lg" />
```

### Design
- **Skeleton** — Shimmer animation, matches component height
- **Spinner** — Rotating gold circle, 24px default

---

## Accessibility Summary

All components include:
- ✅ Keyboard navigation support
- ✅ ARIA labels & roles
- ✅ Focus visible states
- ✅ Color contrast WCAG AA minimum
- ✅ Touch targets 44px × 44px
- ✅ Reduced motion support
- ✅ Semantic HTML structure

---

**Last updated:** 2026-04-21 | Status: Catalog Complete
