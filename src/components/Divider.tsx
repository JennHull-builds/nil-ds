export interface DividerProps {
  spacing?: string;
}

/** New for this kit — a plain rule using the border/spacing tokens, no Mothership equivalent existed. */
export function Divider({ spacing = 'var(--semantic-spacing-md)' }: DividerProps) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: 'var(--semantic-border-width) solid var(--semantic-color-border)',
        margin: `${spacing} 0`,
      }}
    />
  );
}
