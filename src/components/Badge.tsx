import type { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'danger' | 'success';
}

/**
 * Extracted from mothership-stable's TagPill, with tone replacing the fixed
 * pill colour. Default radius — CLI lineage, not soft pills.
 *
 * Static shell styling lives in `.nil-badge` (core.css); each tone is a
 * `.nil-badge--<tone>` modifier that only sets `color` — the border reads
 * `currentColor` so it never drifts from the tone colour.
 */
export function Badge({ children, tone = 'neutral', className, style, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={['nil-badge', `nil-badge--${tone}`, className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </span>
  );
}
