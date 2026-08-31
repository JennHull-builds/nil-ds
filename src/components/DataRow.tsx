import type { CSSProperties, ReactNode } from 'react';

export interface DataRowProps {
  label: string;
  value?: ReactNode;
  detail?: ReactNode;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Schedule/table row — label, value, optional right detail.
 */
export function DataRow({ label, value, detail, active = false, className, style }: DataRowProps) {
  return (
    <div
      className={['nil-data-row', active ? 'nil-data-row--active' : '', className].filter(Boolean).join(' ')}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 'var(--nil-spacing-md)',
        alignItems: 'center',
        padding: 'var(--nil-spacing-sm) 0',
        borderBottom: 'var(--nil-border-width) solid var(--nil-color-border)',
        fontFamily: 'var(--nil-font-mono)',
        fontSize: 'var(--nil-type-scale-xs)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: active ? 'var(--nil-color-text)' : 'var(--nil-color-text-muted)',
        background: active ? 'var(--nil-color-surface)' : 'transparent',
        marginInline: active ? 'calc(-1 * var(--nil-spacing-md))' : 0,
        paddingInline: active ? 'var(--nil-spacing-md)' : 0,
        ...style,
      }}
    >
      <span>{label}</span>
      {value ? <span style={{ color: 'var(--nil-color-text)' }}>{value}</span> : <span />}
      {detail ? <span style={{ color: 'var(--nil-color-text-muted)', textAlign: 'right' }}>{detail}</span> : <span />}
    </div>
  );
}
