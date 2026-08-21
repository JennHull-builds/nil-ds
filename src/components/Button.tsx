import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    background: 'var(--semantic-color-accent)',
    color: 'var(--semantic-color-accent-contrast)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--semantic-color-text)',
    border: 'var(--primitive-border-width-thick) solid var(--semantic-color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--semantic-color-text)',
    border: '1px solid transparent',
  },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: 'var(--primitive-spacing-xs) var(--primitive-spacing-sm)', fontSize: 'var(--primitive-type-scale-sm)' },
  md: { padding: 'var(--primitive-spacing-sm) var(--primitive-spacing-lg)', fontSize: 'var(--primitive-type-scale-base)' },
};

/**
 * Extracted from mothership-stable's BracketButton, generalised: variant/size
 * props replace the bracket-specific decoration so it fits any visual system
 * that consumes these tokens.
 */
export function Button({ children, variant = 'primary', size = 'md', style, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        fontFamily: 'var(--primitive-font-body)',
        fontWeight: 600,
        borderRadius: 'var(--primitive-radius-sm)',
        cursor: 'pointer',
        transition: `background var(--primitive-motion-duration-base) var(--primitive-motion-easing-standard)`,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
