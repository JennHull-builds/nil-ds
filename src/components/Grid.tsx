import type { ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
}

/** Extracted from mothership-stable's BentoGrid — equal-width column grid for Card cells. */
export function Grid({ children, columns = 3, gap = 'var(--nil-spacing-lg)' }: GridProps) {
  return (
    <div
      className="nil-component-grid"
      style={{
        gap,
        ['--nil-grid-columns' as string]: String(columns),
      }}
    >
      {children}
    </div>
  );
}
