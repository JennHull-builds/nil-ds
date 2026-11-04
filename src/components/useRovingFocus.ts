import { useCallback, useRef } from 'react';
import type { KeyboardEvent } from 'react';

export interface UseRovingFocusOptions {
  /** `vertical` answers ArrowUp and ArrowDown, `horizontal` answers ArrowLeft and ArrowRight. */
  orientation: 'vertical' | 'horizontal';
  /** How many items there are, separators and other non-items excluded. Known up front so the first render puts the right item in the Tab order. */
  count: number;
  /** The one item that sits in the Tab order. Others get `tabIndex={-1}`. -1 or out of range puts the first enabled item there. */
  activeIndex: number;
  /** Called with the index that just received focus from a key press. */
  onActiveChange: (index: number) => void;
  /** Items that arrow keys, Home and End skip. A disabled item is never given focus by this hook. */
  isDisabled?: (index: number) => boolean;
  /** Past the last item goes to the first, and back. Defaults to true. */
  wrap?: boolean;
}

export interface RovingItemProps {
  ref: (element: HTMLElement | null) => void;
  tabIndex: 0 | -1;
}

/**
 * Roving focus for a row or column of items: one item in the Tab order, arrow keys to move,
 * Home and End to jump, wrapping, and disabled items skipped.
 *
 * Menu (vertical) and TabStrip (horizontal) both use it, so there is one copy of the key
 * handling. The hook owns the keys and moving DOM focus. The caller owns which item is active:
 * Menu keeps it in state, TabStrip takes it from the selected tab.
 *
 * Spread `getItemProps(index)` on each item, and put `onKeyDown` on the container. Disabled
 * items should use `aria-disabled`, not the `disabled` attribute, so they stay readable to a
 * screen reader; this hook skips them either way.
 */
export function useRovingFocus({ orientation, count, activeIndex, onActiveChange, isDisabled, wrap = true }: UseRovingFocusOptions) {
  const items = useRef<(HTMLElement | null)[]>([]);
  // Drop registrations for items that no longer exist.
  if (items.current.length > count) items.current.length = count;
  // Read at event time, so the latest closures are used without re-creating the handlers.
  const latest = useRef({ isDisabled, onActiveChange, wrap, orientation });
  latest.current = { isDisabled, onActiveChange, wrap, orientation };

  /** Indexes that can take focus: registered, and not disabled. */
  const enabled = useCallback((): number[] => {
    const out: number[] = [];
    items.current.forEach((el, i) => {
      if (el && !latest.current.isDisabled?.(i)) out.push(i);
    });
    return out;
  }, []);

  const focusItem = useCallback((index: number) => {
    const el = items.current[index];
    if (!el) return;
    el.focus();
    latest.current.onActiveChange(index);
  }, []);

  const focusFirst = useCallback(() => {
    const first = enabled()[0];
    if (first !== undefined) focusItem(first);
  }, [enabled, focusItem]);

  const focusLast = useCallback(() => {
    const list = enabled();
    const last = list[list.length - 1];
    if (last !== undefined) focusItem(last);
  }, [enabled, focusItem]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const { orientation: dir, wrap: shouldWrap } = latest.current;
      const prevKey = dir === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = dir === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      if (![prevKey, nextKey, 'Home', 'End'].includes(event.key)) return;

      const list = enabled();
      if (list.length === 0) return;
      const target = event.target as Node;
      const current = items.current.findIndex((el) => el !== null && el.contains(target));
      // A key from somewhere that is not one of the items (a trigger, say) is not ours.
      if (current === -1) return;

      let next: number | undefined;
      if (event.key === 'Home') next = list[0];
      else if (event.key === 'End') next = list[list.length - 1];
      else {
        const position = list.indexOf(current);
        const step = event.key === nextKey ? 1 : -1;
        if (position === -1) {
          // Focus sits on a disabled item: go to the nearest enabled one in the direction of travel.
          next = step === 1 ? list.find((i) => i > current) : [...list].reverse().find((i) => i < current);
          if (next === undefined && shouldWrap) next = step === 1 ? list[0] : list[list.length - 1];
        } else if (shouldWrap) {
          next = list[(position + step + list.length) % list.length];
        } else {
          next = list[position + step];
        }
      }

      event.preventDefault();
      if (next !== undefined && next !== current) focusItem(next);
    },
    [enabled, focusItem],
  );

  /** Props for item `index`. Allocates a ref callback per render, which is cheap and keeps the registry current. */
  const getItemProps = (index: number): RovingItemProps => {
    let firstEnabled = 0;
    for (let i = 0; i < count; i++) {
      if (!isDisabled?.(i)) {
        firstEnabled = i;
        break;
      }
    }
    const active = activeIndex >= 0 && activeIndex < count && !isDisabled?.(activeIndex) ? activeIndex : firstEnabled;
    return {
      ref: (element) => {
        items.current[index] = element;
      },
      tabIndex: index === active ? 0 : -1,
    };
  };

  return { getItemProps, onKeyDown, focusItem, focusFirst, focusLast };
}
