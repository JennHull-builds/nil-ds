import type { CSSProperties } from 'react';

export interface PromptProps {
  children: string;
  prefix?: string;
  showCursor?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Terminal prompt line — prefix + text + optional blink cursor.
 */
export function Prompt({ children, prefix = '>', showCursor = true, className, style }: PromptProps) {
  return (
    <p
      className={['nil-prompt', className].filter(Boolean).join(' ')}
      style={{
        fontFamily: 'var(--nil-font-mono)',
        fontSize: 'var(--nil-type-scale-base)',
        color: 'var(--nil-color-text)',
        lineHeight: 1.5,
        ...style,
      }}
    >
      <span style={{ color: 'var(--nil-color-text-muted)' }}>{prefix} </span>
      {children}
      {showCursor ? (
        <span className="nil-cursor-blink" aria-hidden style={{ color: 'var(--nil-color-accent)' }}>
          ▌
        </span>
      ) : null}
    </p>
  );
}
