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
    border: 'var(--semantic-border-width) solid transparent',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--semantic-color-text)',
    border: 'var(--semantic-border-width-thick) solid var(--semantic-color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--semantic-color-text)',
    border: 'var(--semantic-border-width) solid transparent',
  },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: {
    padding: 'var(--semantic-spacing-xs) var(--semantic-spacing-sm)',
    fontSize: 'var(--semantic-type-scale-sm)',
  },
  md: {
    padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-lg)',
    fontSize: 'var(--semantic-type-scale-base)',
  },
};

/**
 * Extracted from mothership-stable's BracketButton, generalised: variant/size
 * props replace the bracket-specific decoration so it fits any visual system
 * that consumes these tokens.
 */
export function Button({ children, variant = 'primary', size = 'md', style, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        fontFamily: 'var(--semantic-font-body)',
        fontWeight: 600,
        borderRadius: 'var(--semantic-radius-none)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `background var(--semantic-motion-duration-base) var(--semantic-motion-easing-standard)`,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(disabled
          ? {
              opacity: 0.55,
              cursor: 'not-allowed',
              background: 'var(--semantic-color-surface)',
              color: 'var(--semantic-color-text-muted)',
              border: 'var(--semantic-border-width-thick) solid var(--semantic-color-border)',
            }
          : null),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
