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
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const triggerEl = () => rootRef.current?.querySelector<HTMLButtonElement>('button[aria-haspopup]');

  // Move DOM focus to the active item whenever the menu is open.
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  // Close on pointer interaction outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const closeAndRestore = () => {
    setOpen(false);
    triggerEl()?.focus();
  };

  const choose = (action: Action) => {
    closeAndRestore();
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
        closeAndRestore();
        break;
      case 'Tab':
        // Let focus move naturally, but don't leave the menu open behind it.
        setOpen(false);
        break;
      default: {
        // Typeahead: jump to the next item starting with the typed character.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ch = e.key.toLowerCase();
          for (let n = 1; n <= ACTIONS.length; n++) {
            const idx = (active + n) % ACTIONS.length;
            if (ACTIONS[idx].label.toLowerCase().startsWith(ch)) {
              setActive(idx);
              break;
            }
          }
        }
      }
    }
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : openAt(0))}
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
            margin: 'var(--nil-primitive-spacing-xs, 4px) 0 0',
            padding: 'var(--nil-primitive-spacing-xs, 4px)',
            listStyle: 'none',
            background: 'var(--nil-primitive-color-neutral-0, #0a0a0a)',
            color: 'var(--nil-primitive-color-overlay-fg, #f5f5f4)',
            border: 'var(--nil-primitive-border-width, 1.5px) solid var(--nil-primitive-color-overlay-border, rgba(245,245,244,0.4))',
            fontFamily: 'var(--nil-primitive-type-font-mono, monospace)',
            fontSize: 'var(--nil-primitive-type-scale-sm, 0.875rem)',
          }}
        >
          {ACTIONS.map((action, i) => {
            const isActive = i === active;
            const isDanger = action.id === 'delete';
            return (
              <li key={action.id} role="none">
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => choose(action.id)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--nil-primitive-spacing-sm, 8px) var(--nil-primitive-spacing-md, 16px)',
                    font: 'inherit',
                    cursor: 'pointer',
                    border: 'none',
                    background: isActive ? 'var(--nil-primitive-color-neutral-100, #1c1c1c)' : 'transparent',
                    color: isDanger ? 'var(--nil-primitive-color-danger-fg, #ff6b73)' : 'inherit',
                    outline: isActive ? '2px solid var(--nil-primitive-color-accent, #3b6ef5)' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
