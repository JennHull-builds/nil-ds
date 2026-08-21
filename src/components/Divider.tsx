export interface DividerProps {
  spacing?: string;
}

/** New for this kit — a plain rule using the border/spacing tokens, no Mothership equivalent existed. */
export function Divider({ spacing = 'var(--nil-spacing-md)' }: DividerProps) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: 'var(--nil-border-width) solid var(--nil-color-border)',
        margin: `${spacing} 0`,
      }}
    />
  );
}
