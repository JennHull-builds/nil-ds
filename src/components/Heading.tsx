import type { HTMLAttributes, ReactNode } from 'react';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level?: 1 | 2 | 3;
}

const levelStyle: Record<NonNullable<HeadingProps['level']>, React.CSSProperties> = {
  1: { fontSize: 'var(--nil-type-scale-2xl)', fontWeight: 800, lineHeight: 1.05 },
  2: { fontSize: 'var(--nil-type-scale-xl)', fontWeight: 700, lineHeight: 1.15 },
  3: { fontSize: 'var(--nil-type-scale-lg)', fontWeight: 600, lineHeight: 1.25 },
};

/** Extracted from mothership-stable's SectionHeading, generalised to h1–h3 via the level prop. */
export function Heading({ children, level = 2, style, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <Tag
      {...rest}
      className={className}
      style={{
        fontFamily: 'var(--nil-font-body)',
        color: 'var(--nil-color-text)',
        margin: 0,
        ...levelStyle[level],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
