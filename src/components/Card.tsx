import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: string;
}

/**
 * Extracted from mothership-stable's BentoContainer. Same idea (a bordered
 * surface cell for grid layouts) with the padding override kept as a prop
 * since callers reach for that most often.
 */
export function Card({ children, padding = 'var(--nil-spacing-md)', style, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
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
