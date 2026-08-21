import type { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  padding?: string;
  style?: CSSProperties;
}

/**
 * Extracted from mothership-stable's BentoContainer. Same idea (a bordered
 * surface cell for grid layouts) with the padding override kept as a prop
 * since callers reach for that most often.
 */
export function Card({ children, padding = 'var(--semantic-spacing-md)', style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--semantic-color-surface)',
        border: `var(--semantic-border-width) solid var(--semantic-color-border)`,
        borderRadius: 'var(--semantic-radius-none)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
