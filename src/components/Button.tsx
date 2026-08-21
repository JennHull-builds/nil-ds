import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    background: 'var(--nil-color-accent)',
    color: 'var(--nil-color-accent-contrast)',
    border: 'var(--nil-border-width) solid transparent',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--nil-color-text)',
    border: 'var(--nil-border-width-thick) solid var(--nil-color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--nil-color-text)',
    border: 'var(--nil-border-width) solid transparent',
  },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: {
    padding: 'var(--nil-spacing-xs) var(--nil-spacing-sm)',
    fontSize: 'var(--nil-type-scale-sm)',
  },
  md: {
    padding: 'var(--nil-spacing-sm) var(--nil-spacing-lg)',
    fontSize: 'var(--nil-type-scale-base)',
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
        fontFamily: 'var(--nil-font-body)',
        fontWeight: 600,
        borderRadius: 'var(--nil-radius-none)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `background var(--nil-motion-duration-base) var(--nil-motion-easing-standard)`,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(disabled
          ? {
              opacity: 0.55,
              cursor: 'not-allowed',
              background: 'var(--nil-color-surface)',
              color: 'var(--nil-color-text-muted)',
              border: 'var(--nil-border-width-thick) solid var(--nil-color-border)',
            }
          : null),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
