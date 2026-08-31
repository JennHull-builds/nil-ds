import type { CSSProperties } from 'react';

export interface DialProps {
  value: string | number;
  unit?: string;
  sublabel?: string;
  /** 0–100 progress for dot position on ring */
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const SIZE_MAP = {
  sm: 'var(--nil-size-dial-sm)',
  md: 'var(--nil-size-dial-md)',
  lg: 'var(--nil-size-dial-lg)',
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
  className,
  style,
}: DialProps) {
  const dim = SIZE_MAP[size];
  const pct = Math.min(100, Math.max(0, progress));
  const angle = (pct / 100) * 360 - 90;

  return (
    <div
      className={['nil-dial', className].filter(Boolean).join(' ')}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--nil-spacing-sm)', ...style }}
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
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--nil-color-border)" strokeWidth="1" opacity="0.3" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '10%',
            height: '10%',
            marginLeft: '-5%',
            marginTop: '-5%',
            borderRadius: '50%',
            background: 'var(--nil-color-accent)',
            transform: `rotate(${angle}deg) translateY(-140%)`,
            transformOrigin: 'center center',
          }}
          aria-hidden
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'var(--nil-spacing-sm)',
          }}
        >
          <span style={{ fontSize: size === 'lg' ? 'var(--nil-type-scale-xl)' : 'var(--nil-type-scale-lg)', fontWeight: 600 }}>
            {value}
            {unit ? <span style={{ fontSize: '0.65em' }}>{unit}</span> : null}
          </span>
          {sublabel ? (
            <span style={{ fontSize: 'var(--nil-type-scale-xs)', color: 'var(--nil-color-text-muted)' }}>{sublabel}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
