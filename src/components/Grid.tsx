import type { HTMLAttributes, ReactNode } from 'react';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: number;
  gap?: string;
}

/** Extracted from mothership-stable's BentoGrid — equal-width column grid for Card cells. */
export function Grid({ children, columns = 3, gap = 'var(--nil-spacing-lg)', style, className, ...rest }: GridProps) {
  return (
    <div
      {...rest}
      className={['nil-component-grid', className].filter(Boolean).join(' ')}
      style={{
        gap,
        ['--nil-grid-columns' as string]: String(columns),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
