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
        fontFamily: 'var(--semantic-font-body)',
        fontSize: size === 'sm' ? 'var(--semantic-type-scale-sm)' : 'var(--semantic-type-scale-base)',
        lineHeight: 1.6,
        color: muted ? 'var(--semantic-color-text-muted)' : 'var(--semantic-color-text)',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}
