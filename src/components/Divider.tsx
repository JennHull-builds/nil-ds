import type { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  spacing?: string;
}

/** New for this kit — a plain rule using the border/spacing tokens, no Mothership equivalent existed. */
export function Divider({ spacing = 'var(--nil-spacing-md)', style, className, ...rest }: DividerProps) {
  return (
    <hr
      {...rest}
      className={className}
      style={{
        border: 'none',
        borderTop: 'var(--nil-border-width) solid var(--nil-color-border)',
        margin: `${spacing} 0`,
        ...style,
      }}
    />
  );
}
