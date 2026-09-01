import type { HTMLAttributes, ReactNode } from 'react';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  size?: 'sm' | 'base';
  muted?: boolean;
}

/**
 * Extracted from mothership-stable's BodyText, generalised to a two-step size scale.
 *
 * Base look lives in `.nil-text` (core.css); `size` and `muted` toggle the
 * `.nil-text--sm|base` and `.nil-text--muted` modifiers.
 */
export function Text({ children, size = 'base', muted = false, className, style, ...rest }: TextProps) {
  return (
    <p
      {...rest}
      className={['nil-text', `nil-text--${size}`, muted ? 'nil-text--muted' : '', className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </p>
  );
}
