import type { CSSProperties } from 'react';

export interface RingProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

const SIZE_MAP = {
  sm: 'var(--nil-size-ring-sm)',
  md: 'var(--nil-size-ring-md)',
} as const;

/**
 * Compact circular % indicator — thin track + thick progress stroke.
 */
export function Ring({ value, label, size = 'sm', className, style }: RingProps) {
  const dim = SIZE_MAP[size];
  const pct = Math.min(100, Math.max(0, value));
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className={['nil-ring', className].filter(Boolean).join(' ')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--nil-spacing-xs)',
        ...style,
      }}
      role="img"
      aria-label={label ? `${label}: ${pct}%` : `${pct}%`}
    >
      <div style={{ position: 'relative', width: dim, height: dim }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--nil-color-border)"
            strokeWidth="4"
            opacity="0.25"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--nil-color-accent)"
            strokeWidth="8"
            strokeLinecap="butt"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--nil-font-display)',
            fontSize: 'var(--nil-type-scale-xs)',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pct}%
        </div>
      </div>
      {label ? (
        <span
          style={{
            fontFamily: 'var(--nil-font-mono)',
            fontSize: 'var(--nil-type-scale-xs)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--nil-color-text-muted)',
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
