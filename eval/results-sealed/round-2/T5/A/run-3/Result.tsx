import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

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
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Which item to focus when the menu opens (first via click/ArrowDown, last via ArrowUp).
  const initialIndex = useRef(0);
  const menuId = useId();

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLButtonElement>('button[aria-haspopup]')?.focus();
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) focusTrigger();
  };

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) itemRefs.current[initialIndex.current]?.focus();
  }, [open]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openWith = (index: number) => {
    initialIndex.current = index;
    setOpen(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openWith(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openWith(ACTIONS.length - 1);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const move = (i: number) => {
      e.preventDefault();
      itemRefs.current[(i + ACTIONS.length) % ACTIONS.length]?.focus();
    };
    switch (e.key) {
      case 'ArrowDown':
        move(current + 1);
        break;
      case 'ArrowUp':
        move(current - 1);
        break;
      case 'Home':
        move(0);
        break;
      case 'End':
        move(ACTIONS.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        // Let focus move naturally, but don't leave the menu open behind it.
        setOpen(false);
        break;
    }
  };

  const choose = (action: Action) => {
    close(true);
    onSelect(action);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openWith(0))}
        onKeyDown={onTriggerKeyDown}
      >
        Project actions
      </Button>
      {open && (
        <Panel
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 'var(--nil-spacing-xs)',
            minWidth: '100%',
            zIndex: 10,
          }}
        >
          <div
            id={menuId}
            role="menu"
            aria-label="Project actions"
            onKeyDown={onMenuKeyDown}
            style={{ display: 'flex', flexDirection: 'column', margin: 'calc(var(--nil-spacing-md) * -1)' }}
          >
            {ACTIONS.map((a, i) => (
              <button
                key={a.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => choose(a.id)}
                style={{
                  background: 'transparent',
                  color: 'inherit',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
                  fontFamily: 'var(--nil-font-mono)',
                  fontSize: 'var(--nil-type-scale-xs)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'var(--nil-color-text)';
                  e.currentTarget.style.color = 'var(--nil-color-bg)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
                onMouseEnter={(e) => e.currentTarget.focus()}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
