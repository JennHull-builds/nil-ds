import type { ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
}

/** Extracted from mothership-stable's BentoGrid — equal-width column grid for Card cells. */
export function Grid({ children, columns = 3, gap = 'var(--semantic-spacing-lg)' }: GridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}
