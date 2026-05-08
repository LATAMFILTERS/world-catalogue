/* Shared TypeScript types for components library */

export type ColorVariant = 'primary' | 'success' | 'error' | 'warning' | 'info';

export type Size = 'sm' | 'md' | 'lg';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface FilterChipProps {
  label: string;
  active?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  onClick?: () => void;
}

export interface TagBadgeProps {
  label: string;
  color?: ColorVariant | 'gold';
  size?: 'sm' | 'md';
  variant?: 'filled' | 'outline';
}

export interface ResultCardProps {
  sku: string;
  title: string;
  tags?: Array<{ label: string; color: ColorVariant | 'gold' }>;
  specs?: Array<{ label: string; value: string }>;
  onClick?: () => void;
}

export interface SpecsGridProps {
  items: Array<{ label: string; value: string }>;
  columns?: 2 | 3;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: Size;
}
