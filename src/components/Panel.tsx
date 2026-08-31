import type { CSSProperties, ReactNode } from 'react';

export interface PanelProps {
  children: ReactNode;
  /** Header label — mono uppercase */
  title?: string;
  /** Right side of header row */
  headerRight?: ReactNode;
  variant?: 'default' | 'inverse';
  className?: string;
  style?: CSSProperties;
}

/**
 * Bordered instrument shell — optional header row + body slot.
 * inverse = ink fill for status readout blocks.
 */
export function Panel({
  children,
  title,
  headerRight,
  variant = 'default',
  className,
  style,
}: PanelProps) {
  const isInverse = variant === 'inverse';

  return (
    <div
      className={['nil-panel', isInverse ? 'nil-panel--inverse' : '', className].filter(Boolean).join(' ')}
      style={{
        border: 'var(--nil-border-width) solid var(--nil-color-border)',
        borderRadius: 'var(--nil-radius-default)',
        background: isInverse ? 'var(--nil-color-text)' : 'var(--nil-color-surface)',
        color: isInverse ? 'var(--nil-color-bg)' : 'var(--nil-color-text)',
        ...style,
      }}
    >
      {(title || headerRight) && (
        <div
          className="nil-panel__header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--nil-spacing-sm)',
            padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
            borderBottom: 'var(--nil-border-width) solid var(--nil-color-border)',
            fontFamily: 'var(--nil-font-mono)',
            fontSize: 'var(--nil-type-scale-xs)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {title ? <span>{title}</span> : <span />}
          {headerRight}
        </div>
      )}
      <div className="nil-panel__body" style={{ padding: 'var(--nil-spacing-md)' }}>{children}</div>
    </div>
  );
}
