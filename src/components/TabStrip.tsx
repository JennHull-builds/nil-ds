import type { CSSProperties } from 'react';

export interface TabStripProps {
  tabs: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Horizontal nav tabs — active = thick underline.
 */
export function TabStrip({ tabs, activeIndex, onTabChange, className, style }: TabStripProps) {
  return (
    <div
      role="tablist"
      className={['nil-tab-strip', className].filter(Boolean).join(' ')}
      style={{
        display: 'flex',
        gap: 'var(--nil-spacing-lg)',
        borderBottom: 'var(--nil-border-width) solid var(--nil-color-border)',
        ...style,
      }}
    >
      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            className="nil-tab-strip__tab"
            onClick={() => onTabChange(i)}
            style={{
              fontFamily: 'var(--nil-font-mono)',
              fontSize: 'var(--nil-type-scale-xs)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: 'var(--nil-spacing-sm) 0',
              marginBottom: 'calc(-1 * var(--nil-border-width))',
              border: 'none',
              borderBottom: active ? 'var(--nil-border-width-thick) solid var(--nil-color-text)' : 'var(--nil-border-width) solid transparent',
              background: 'transparent',
              color: active ? 'var(--nil-color-text)' : 'var(--nil-color-text-muted)',
              cursor: 'pointer',
              transition: `color var(--nil-motion-duration-fast) var(--nil-motion-easing-standard), border-color var(--nil-motion-duration-fast) var(--nil-motion-easing-standard)`,
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
