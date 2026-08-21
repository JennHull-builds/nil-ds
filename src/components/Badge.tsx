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

/** Extracted from mothership-stable's TagPill, with tone replacing the fixed pill colour. */
export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const color = toneColor[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--primitive-spacing-xs)',
        padding: 'var(--primitive-spacing-xs) var(--primitive-spacing-sm)',
        fontFamily: 'var(--primitive-font-mono)',
        fontSize: 'var(--primitive-type-scale-xs)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 'var(--primitive-radius-full)',
        border: `1px solid ${color}`,
        color,
      }}
    >
      {children}
    </span>
  );
}
