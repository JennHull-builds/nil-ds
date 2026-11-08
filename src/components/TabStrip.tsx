import type { HTMLAttributes } from 'react';
import { useRovingFocus } from './useRovingFocus';

export interface TabStripProps extends HTMLAttributes<HTMLDivElement> {
  tabs: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

/**
 * Horizontal nav tabs — active = thick underline.
 *
 * Keyboard (WAI-ARIA Tabs, automatic activation): only the selected tab is in the Tab order.
 * ArrowLeft and ArrowRight move to the previous or next tab and select it, wrapping at the
 * ends, and Home and End jump to the first and last. Selecting calls `onTabChange`, so it
 * should be cheap, as it is in every current use. The key handling is the kit's
 * `useRovingFocus`, shared with Menu.
 */
export function TabStrip({ tabs, activeIndex, onTabChange, className, style, onKeyDown, ...rest }: TabStripProps) {
  const roving = useRovingFocus({
    orientation: 'horizontal',
    count: tabs.length,
    activeIndex,
    onActiveChange: onTabChange,
  });

  return (
    <div
      {...rest}
      role="tablist"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) roving.onKeyDown(event);
      }}
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
            {...roving.getItemProps(i)}
            className="nil-tab-strip__tab"
            onClick={() => onTabChange(i)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
