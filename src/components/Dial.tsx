import type { HTMLAttributes } from 'react';

export interface DialProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  unit?: string;
  sublabel?: string;
  /** 0–100 progress for dot position on ring */
  progress?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  variant?: 'default' | 'solid';
}

const SIZE_MAP = {
  sm: 'var(--nil-size-dial-sm)',
  md: 'var(--nil-size-dial-md)',
  lg: 'var(--nil-size-dial-lg)',
  xl: 'var(--nil-size-dial-xl)',
} as const;

/**
 * Circular gauge — tick ring, dot indicator, center value.
 */
export function Dial({
  value,
  unit,
  sublabel,
  progress = 50,
  size = 'md',
  label,
  variant = 'default',
  className,
  style,
  ...rest
}: DialProps) {
  const dim = SIZE_MAP[size];
  const pct = Math.min(100, Math.max(0, progress));
  const angle = (pct / 100) * 360 - 90;
  const isSolid = variant === 'solid';
  const dotRad = (angle * Math.PI) / 180;
  const dotX = 50 + 38 * Math.cos(dotRad);
  const dotY = 50 + 38 * Math.sin(dotRad);

  return (
    <div
      {...rest}
      className={['nil-dial', className].filter(Boolean).join(' ')}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--nil-spacing-sm)', color: 'var(--nil-color-text)', ...style }}
      role="img"
      aria-label={label ? `${label}: ${value}${unit ?? ''}` : `${value}${unit ?? ''}`}
    >
      {label ? (
        <span
          style={{
            fontFamily: 'var(--nil-font-mono)',
            fontSize: 'var(--nil-type-scale-xs)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--nil-color-text-muted)',
          }}
        >
          {label}
        </span>
      ) : null}
      <div
        style={{
          position: 'relative',
          width: dim,
          height: dim,
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
          {isSolid && <circle cx="50" cy="50" r="39" fill="var(--nil-color-text)" />}
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i / 48) * 360 - 90;
            const rad = (a * Math.PI) / 180;
            const x1 = 50 + 42 * Math.cos(rad);
            const y1 = 50 + 42 * Math.sin(rad);
            const x2 = 50 + 46 * Math.cos(rad);
            const y2 = 50 + 46 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--nil-color-border)"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--nil-color-border)" strokeWidth="1" opacity={isSolid ? 0 : 0.3} />
          <circle cx={dotX} cy={dotY} r="3" fill="var(--nil-color-accent)" />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'var(--nil-spacing-lg)',
            color: isSolid ? 'var(--nil-color-bg)' : 'var(--nil-color-text)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--nil-font-display)',
              fontSize: size === 'xl' ? 'var(--nil-type-scale-2xl)' : size === 'lg' ? 'var(--nil-type-scale-xl)' : 'var(--nil-type-scale-lg)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
            {unit ? <span style={{ fontSize: '0.65em' }}>{unit}</span> : null}
          </span>
          {sublabel ? (
            <span style={{ fontSize: 'var(--nil-type-scale-xs)', color: isSolid ? 'inherit' : 'var(--nil-color-text-muted)', opacity: isSolid ? 0.7 : 1 }}>{sublabel}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
