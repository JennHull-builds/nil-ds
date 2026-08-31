import type { CSSProperties, ReactNode } from 'react';

export interface StackProps {
  children: ReactNode;
  /** Number of peek layers behind top card (1–3) */
  depth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Offset hard-border card stack — left-stacked shadows, default radius.
 */
export function Stack({ children, depth = 2, className, style }: StackProps) {
  const layers = Math.min(3, Math.max(1, depth));

  return (
    <div
      className={['nil-stack', className].filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        paddingLeft: `${layers * 8}px`,
        paddingBottom: `${layers * 8}px`,
        ...style,
      }}
    >
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="nil-stack__layer"
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${-8 * (layers - i)}px, ${8 * (layers - i)}px)`,
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
            background: 'var(--nil-color-surface)',
            boxShadow: `${4 * (layers - i)}px ${4 * (layers - i)}px 0 var(--nil-color-shadow-stack)`,
            zIndex: i,
          }}
        />
      ))}
      <div
        className="nil-stack__top"
        style={{
          position: 'relative',
          zIndex: layers + 1,
          border: 'var(--nil-border-width) solid var(--nil-color-border)',
          borderRadius: 'var(--nil-radius-default)',
          background: 'var(--nil-color-bg)',
          boxShadow: '4px 4px 0 var(--nil-color-shadow-stack)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
