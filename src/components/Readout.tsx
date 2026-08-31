import type { CSSProperties } from 'react';

export interface ReadoutProps {
  label?: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  size?: 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

/**
 * Oversized numeric/stat display with mono label row.
 */
export function Readout({ label, value, unit, sublabel, size = 'lg', className, style }: ReadoutProps) {
  const valueSize = size === 'lg' ? 'var(--nil-type-scale-3xl)' : 'var(--nil-type-scale-2xl)';

  return (
    <div className={['nil-readout', className].filter(Boolean).join(' ')} style={style}>
      {label ? (
        <div
          style={{
            fontFamily: 'var(--nil-font-mono)',
            fontSize: 'var(--nil-type-scale-xs)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--nil-color-text-muted)',
            marginBottom: 'var(--nil-spacing-xs)',
          }}
        >
          {label}
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25em', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: 'var(--nil-font-display)',
            fontSize: valueSize,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: 'inherit',
          }}
        >
          {value}
        </span>
        {unit ? (
          <span
            style={{
              fontFamily: 'var(--nil-font-display)',
              fontSize: 'var(--nil-type-scale-lg)',
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
              opacity: 0.85,
            }}
          >
            {unit}
          </span>
        ) : null}
      </div>
      {sublabel ? (
        <div
          style={{
            marginTop: 'var(--nil-spacing-xs)',
            fontSize: 'var(--nil-type-scale-sm)',
            color: 'var(--nil-color-text-muted)',
          }}
        >
          {sublabel}
        </div>
      ) : null}
    </div>
  );
}
