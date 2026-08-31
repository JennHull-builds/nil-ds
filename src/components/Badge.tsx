import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'danger' | 'success';
}

const toneColor: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'var(--nil-color-text-muted)',
  accent: 'var(--nil-color-accent)',
  danger: 'var(--nil-color-danger)',
  success: 'var(--nil-color-success)',
};

/**
 * Extracted from mothership-stable's TagPill, with tone replacing the fixed
 * pill colour. Default radius — CLI lineage, not soft pills.
 */
export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const color = toneColor[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--nil-spacing-xs)',
        padding: 'var(--nil-spacing-xs) var(--nil-spacing-sm)',
        fontFamily: 'var(--nil-font-mono)',
        fontSize: 'var(--nil-type-scale-xs)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 'var(--nil-radius-default)',
        border: `var(--nil-border-width) solid ${color}`,
        color,
      }}
    >
      {children}
    </span>
  );
}
