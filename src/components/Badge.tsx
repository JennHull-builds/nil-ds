import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'danger' | 'success';
}

const toneColor: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'var(--semantic-color-text-muted)',
  accent: 'var(--semantic-color-accent)',
  danger: 'var(--semantic-color-danger)',
  success: 'var(--semantic-color-success)',
};

/**
 * Extracted from mothership-stable's TagPill, with tone replacing the fixed
 * pill colour. Square corners — CLI lineage, not soft pills.
 */
export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const color = toneColor[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--semantic-spacing-xs)',
        padding: 'var(--semantic-spacing-xs) var(--semantic-spacing-sm)',
        fontFamily: 'var(--semantic-font-mono)',
        fontSize: 'var(--semantic-type-scale-xs)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 'var(--semantic-radius-none)',
        border: `var(--semantic-border-width) solid ${color}`,
        color,
      }}
    >
      {children}
    </span>
  );
}
