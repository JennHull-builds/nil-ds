import type { ReactNode } from 'react';

export interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
}

const levelStyle: Record<NonNullable<HeadingProps['level']>, React.CSSProperties> = {
  1: { fontSize: 'var(--semantic-type-scale-2xl)', fontWeight: 800, lineHeight: 1.05 },
  2: { fontSize: 'var(--semantic-type-scale-xl)', fontWeight: 700, lineHeight: 1.15 },
  3: { fontSize: 'var(--semantic-type-scale-lg)', fontWeight: 600, lineHeight: 1.25 },
};

/** Extracted from mothership-stable's SectionHeading, generalised to h1–h3 via the level prop. */
export function Heading({ children, level = 2 }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <Tag
      style={{
        fontFamily: 'var(--semantic-font-body)',
        color: 'var(--semantic-color-text)',
        margin: 0,
        ...levelStyle[level],
      }}
    >
      {children}
    </Tag>
  );
}
