import type { HTMLAttributes, ReactNode } from 'react';

export interface MetaProps extends HTMLAttributes<HTMLSpanElement> {
  /** Key shown before the value, e.g. "ROLE". Rendered uppercase. */
  label: string;
  /** Value after the label, e.g. "Design Engineer". */
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'danger' | 'success';
}

const toneColor: Record<NonNullable<MetaProps['tone']>, string> = {
  neutral: 'var(--nil-color-border)',
  accent: 'var(--nil-color-accent)',
  danger: 'var(--nil-color-danger)',
  success: 'var(--nil-color-success)',
};

/**
 * Extracted from mothership-stable's MetaRow (single item). Bracket key-value
 * token — compose several in a flex wrap for a strip. Restores the CLI
 * `[ KEY: value ]` vocabulary that Badge left behind. Not case-study chrome.
 */
export function Meta({ label, children, tone = 'neutral', style, ...rest }: MetaProps) {
  const brackets = toneColor[tone];
  const labelColor =
    tone === 'neutral' ? 'var(--nil-color-text-muted)' : toneColor[tone];
  const emphasisWeight = 'var(--nil-type-weight-mono-emphasis)';
  const baseWeight = 'var(--nil-type-weight-mono)';
  const labelWeight = tone === 'neutral' ? baseWeight : emphasisWeight;

  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.35em',
        fontFamily: 'var(--nil-font-mono)',
        fontSize: 'var(--nil-type-scale-xs)',
        fontWeight: baseWeight,
        letterSpacing: '0.04em',
        lineHeight: 1.45,
        textTransform: 'uppercase',
        borderRadius: 'var(--nil-radius-default)',
        color: 'var(--nil-color-text)',
        whiteSpace: 'nowrap',
        minWidth: 0,
        maxWidth: '100%',
        ...style,
      }}
    >
      <span
        aria-hidden
        className="nil-bracket"
        style={{ color: brackets, fontWeight: labelWeight }}
      >
        [
      </span>
      <span style={{ color: labelColor, fontWeight: labelWeight }}>{label}:</span>
      <span style={{ overflowWrap: 'anywhere' }}>{children}</span>
      <span
        aria-hidden
        className="nil-bracket"
        style={{ color: brackets, fontWeight: labelWeight }}
      >
        ]
      </span>
    </span>
  );
}
