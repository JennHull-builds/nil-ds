import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import type { ButtonProps } from './Button';
import { useRovingFocus } from './useRovingFocus';

export interface MenuItem {
  /** The row's text, and its accessible name. */
  label: string;
  /** Called after the menu has closed and focus is back on the trigger. */
  onSelect: () => void;
  /** `danger` is red text, never a filled red row. The label still says what it does. */
  variant?: 'default' | 'danger';
  /** Skipped by the arrow keys and ignored on click. Marked `aria-disabled`, never natively disabled. */
  disabled?: boolean;
}

/** A rule between groups of items. It is not an item: arrow keys step over it. */
export interface MenuSeparator {
  separator: true;
}

export type MenuEntry = MenuItem | MenuSeparator;

export interface MenuProps {
  /** The trigger's text, and the menu's accessible name ("Project actions"). */
  label: string;
  items: MenuEntry[];
  /** Which edge of the menu lines up with the trigger's edge. The menu flips by itself if it would leave the viewport. */
  align?: 'start' | 'end';
  /** The kit Button variant for the trigger. */
  triggerVariant?: ButtonProps['variant'];
  /** Goes on the wrapper that holds the trigger and the menu. */
  className?: string;
  style?: CSSProperties;
}

const isSeparator = (entry: MenuEntry): entry is MenuSeparator => 'separator' in entry;

/**
 * An action menu on the WAI-ARIA Menu Button pattern, with no UI library.
 *
 * The trigger is the kit's Button (`aria-haspopup="menu"`, `aria-expanded`, `aria-controls`). The
 * menu is `role="menu"`, named by the trigger, and its rows are `role="menuitem"` with a roving
 * tabindex.
 *
 * Keys. On the trigger: Enter, Space and ArrowDown open it onto the first item, ArrowUp onto the
 * last. In the menu: ArrowUp and ArrowDown move and wrap, Home and End jump, Enter and Space
 * choose, Escape closes and returns focus to the trigger, and Tab closes without trapping focus.
 * A press outside the menu closes it. Choosing an item closes the menu and puts focus back on the
 * trigger first, then calls `onSelect`, so an action that opens a Dialog hands it a sensible opener.
 *
 * It is not a portal: the menu is positioned below the trigger inside a relative wrapper. Nothing
 * animates, so there is nothing to switch off under reduced motion.
 *
 * Disabled items use `aria-disabled`, not `disabled`, so a screen reader still reads them.
 * Typeahead (jumping by typing a letter) is not built.
 */
export function Menu({ label, items, align = 'start', triggerVariant = 'secondary', className, style }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openTo = useRef<'first' | 'last'>('first');
  const triggerId = useId();
  const menuId = useId();

  // Separators are not items, so item indexes count only the rows that can be focused.
  const rows = items.filter((entry): entry is MenuItem => !isSeparator(entry));
  const roving = useRovingFocus({
    orientation: 'vertical',
    count: rows.length,
    activeIndex,
    onActiveChange: setActiveIndex,
    isDisabled: (index) => Boolean(rows[index]?.disabled),
  });

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const openMenu = (target: 'first' | 'last') => {
    openTo.current = target;
    setOpen(true);
  };

  // Once the list is showing, focus the item the opener asked for. The list is hidden until
  // now, and a hidden element cannot take focus.
  useLayoutEffect(() => {
    if (!open) return;
    if (openTo.current === 'last') roving.focusLast();
    else roving.focusFirst();
    // Runs on open only; the hook's functions read their inputs at call time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the menu inside the viewport: if the chosen edge would leave it, use the other edge.
  useLayoutEffect(() => {
    if (!open) {
      setFlipped(false);
      return;
    }
    const list = listRef.current;
    if (!list) return;
    const rect = list.getBoundingClientRect();
    if (rect.width === 0) return; // no layout (jsdom)
    const edge = document.documentElement.clientWidth;
    if (align === 'start' && rect.right > edge) setFlipped(true);
    else if (align === 'end' && rect.left < 0) setFlipped(true);
  }, [open, align]);

  // A press outside the wrapper closes the menu. Focus is left where the press put it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent | MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      // Put focus on the trigger, then let Tab carry on from there. Nothing is trapped:
      // Tab goes to whatever follows the trigger, Shift+Tab to whatever precedes it.
      triggerRef.current?.focus();
      setOpen(false);
      return;
    }
    roving.onKeyDown(event);
  };

  const choose = (item: MenuItem) => {
    if (item.disabled) return;
    close(true);
    item.onSelect();
  };

  const edge = (align === 'end') !== flipped ? 'end' : 'start';
  let itemIndex = -1;

  return (
    <div ref={wrapperRef} className={['nil-menu', className].filter(Boolean).join(' ')} style={style}>
      <Button
        ref={triggerRef}
        id={triggerId}
        type="button"
        variant={triggerVariant}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? close(false) : openMenu('first'))}
        onKeyDown={onTriggerKeyDown}
      >
        {label}
        <Icon name="chevron-down" size="sm" />
      </Button>
      <div
        ref={listRef}
        id={menuId}
        role="menu"
        aria-labelledby={triggerId}
        hidden={!open}
        className={`nil-menu__list nil-menu__list--${edge}`}
        onKeyDown={onListKeyDown}
      >
        {items.map((entry, entryIndex) => {
          if (isSeparator(entry)) {
            return <div key={`separator-${entryIndex}`} role="separator" className="nil-menu__separator" />;
          }
          itemIndex += 1;
          const index = itemIndex;
          const itemProps = roving.getItemProps(index);
          return (
            <button
              key={`${entry.label}-${entryIndex}`}
              {...itemProps}
              type="button"
              role="menuitem"
              aria-disabled={entry.disabled || undefined}
              className={['nil-menu__item', entry.variant === 'danger' ? 'nil-menu__item--danger' : ''].filter(Boolean).join(' ')}
              // Pointing at a row moves the highlight there, so the mouse and the keys never
              // show two highlighted rows. Disabled rows stay out of it.
              onMouseEnter={(event) => {
                if (!entry.disabled) {
                  event.currentTarget.focus();
                  setActiveIndex(index);
                }
              }}
              onClick={() => choose(entry)}
            >
              {entry.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
