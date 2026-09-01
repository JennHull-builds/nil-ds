import type { CSSProperties, ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  size?: 'sm' | 'base';
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Extracted from mothership-stable's BodyText, generalised to a two-step size scale. */
export function Text({ children, size = 'base', muted = false, className, style }: TextProps) {
  return (
    <p
      className={className}
      style={{
        fontFamily: 'var(--nil-font-body)',
        fontSize: size === 'sm' ? 'var(--nil-type-scale-sm)' : 'var(--nil-type-scale-base)',
        lineHeight: 1.6,
        color: muted ? 'var(--nil-color-text-muted)' : 'var(--nil-color-text)',
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
