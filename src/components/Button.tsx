import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'bracket';
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
  bracket: {
    background: 'var(--nil-color-surface)',
    color: 'var(--nil-color-text)',
    border: 'var(--nil-border-width-thick) solid var(--nil-color-border)',
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
 * Bracket variant restores the terminal `[ ACTION ]` vocabulary from the
 * cyber-brutalist explorations. Other variants stay general-purpose.
 */
export function Button({ children, variant = 'primary', size = 'md', style, disabled, className, ...rest }: ButtonProps) {
  const isBracket = variant === 'bracket';

  return (
    <button
      {...rest}
      disabled={disabled}
      className={['nil-btn', `nil-btn--${variant}`, className].filter(Boolean).join(' ')}
      style={{
        fontFamily: isBracket ? 'var(--nil-font-mono)' : 'var(--nil-font-body)',
        fontWeight: isBracket ? 500 : 600,
        letterSpacing: isBracket ? '0.08em' : undefined,
        textTransform: isBracket ? 'uppercase' : undefined,
        borderRadius: 'var(--nil-radius-default)',
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
      {isBracket ? (
        <>
          <span aria-hidden className="nil-btn__bracket">
            [
          </span>
          <span className="nil-btn__label">{children}</span>
          <span aria-hidden className="nil-btn__bracket">
            ]
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
