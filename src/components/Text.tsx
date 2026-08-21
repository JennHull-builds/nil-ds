import type { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  size?: 'sm' | 'base';
  muted?: boolean;
}

/** Extracted from mothership-stable's BodyText, generalised to a two-step size scale. */
export function Text({ children, size = 'base', muted = false }: TextProps) {
  return (
    <p
      style={{
        fontFamily: 'var(--nil-font-body)',
        fontSize: size === 'sm' ? 'var(--nil-type-scale-sm)' : 'var(--nil-type-scale-base)',
        lineHeight: 1.6,
        color: muted ? 'var(--nil-color-text-muted)' : 'var(--nil-color-text)',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}
