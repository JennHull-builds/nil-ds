import type { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Extracted from mothership-stable's BentoContainer. Same idea (a bordered
 * surface cell for grid layouts) with the padding override kept as a prop
 * since callers reach for that most often.
 */
export function Card({ children, padding = 'var(--nil-spacing-md)', style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--nil-color-surface)',
        border: `var(--nil-border-width) solid var(--nil-color-border)`,
        borderRadius: 'var(--nil-radius-default)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
