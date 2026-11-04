import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

type Action = 'rename' | 'duplicate' | 'delete';

export interface ProjectActionsMenuProps {
  onSelect: (action: Action) => void;
}

const ACTIONS: { id: Action; label: string }[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete' },
];

export default function ProjectActionsMenu({ onSelect }: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const triggerEl = () => rootRef.current?.querySelector<HTMLButtonElement>('button[aria-haspopup]');

  // Move DOM focus to the active item whenever the menu is open.
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerEl()?.focus();
  };

  const choose = (action: Action) => {
    close(true);
    onSelect(action);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(ACTIONS.length - 1);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = ACTIONS.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        // Let focus move naturally, but don't leave the menu hanging open.
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openAt(0))}
        onKeyDown={onTriggerKeyDown}
      >
        Project actions
      </Button>
      {open && (
        <ul
          id={menuId}
          role="menu"
          aria-label="Project actions"
          onKeyDown={onMenuKeyDown}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            minWidth: '100%',
            margin: 0,
            marginTop: 'var(--nil-spacing-xs)',
            padding: 0,
            listStyle: 'none',
            background: 'var(--nil-color-surface)',
            color: 'var(--nil-color-text)',
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
            fontFamily: 'var(--nil-font-mono)',
            fontSize: 'var(--nil-type-scale-sm)',
          }}
        >
          {ACTIONS.map((a, i) => {
            const highlighted = focusedIndex === i;
            return (
              <li key={a.id} role="none">
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => choose(a.id)}
                  onFocus={() => {
                    setFocusedIndex(i);
                    setActive(i);
                  }}
                  onBlur={() => setFocusedIndex((cur) => (cur === i ? null : cur))}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
                    border: 'none',
                    borderRadius: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    background: highlighted ? 'var(--nil-color-accent)' : 'transparent',
                    color: highlighted
                      ? 'var(--nil-color-accent-contrast)'
                      : a.id === 'delete'
                        ? 'var(--nil-color-danger)'
                        : 'var(--nil-color-text)',
                    outline: 'none',
                  }}
                >
                  {a.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
