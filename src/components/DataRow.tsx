import type { HTMLAttributes, ReactNode } from 'react';

export interface DataRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: ReactNode;
  detail?: ReactNode;
  active?: boolean;
}

/**
 * Schedule/table row — label, value, optional right detail.
 * Active row: full-bleed highlight + edge-to-edge rules above and below.
 */
export function DataRow({ label, value, detail, active = false, className, style, ...rest }: DataRowProps) {
  return (
    <div
      {...rest}
      className={['nil-data-row', active ? 'nil-data-row--active' : '', className].filter(Boolean).join(' ')}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 'var(--nil-spacing-md)',
        alignItems: 'center',
        fontFamily: 'var(--nil-font-mono)',
        fontSize: 'var(--nil-type-scale-xs)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: active ? 'var(--nil-color-text)' : 'var(--nil-color-text-muted)',
        ...style,
      }}
    >
      <span>{label}</span>
      {value ? <span style={{ color: 'var(--nil-color-text)' }}>{value}</span> : <span />}
      {detail ? (
        <span
          style={{
            color: active ? 'var(--nil-color-text)' : 'var(--nil-color-text-muted)',
            textAlign: 'right',
          }}
        >
          {detail}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}
