import type { CSSProperties, ReactNode } from 'react';

export interface StackProps {
  children: ReactNode;
  /** Number of peek layers behind top card (1–3) */
  depth?: number;
  className?: string;
  style?: CSSProperties;
}

/** 8px offset per back layer — depth from geometry, not box-shadow. */
const STACK_OFFSET = 8;

/**
 * Offset hard-border card stack. Back layers peek left/down; top card sits forward
 * with bg vs surface contrast. No box-shadow — stacked offsets read cleaner than
 * competing hard shadows on every layer.
 */
export function Stack({ children, depth = 2, className, style }: StackProps) {
  const layers = Math.min(3, Math.max(1, depth));
  const peek = `${layers * STACK_OFFSET}px`;

  return (
    <div
      className={['nil-stack', className].filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        paddingLeft: peek,
        paddingBottom: peek,
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
            left: peek,
            top: 0,
            right: 0,
            bottom: peek,
            transform: `translate(${-STACK_OFFSET * (layers - i)}px, ${STACK_OFFSET * (layers - i)}px)`,
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
            background: 'var(--nil-color-surface)',
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
        }}
      >
        {children}
      </div>
    </div>
  );
}
