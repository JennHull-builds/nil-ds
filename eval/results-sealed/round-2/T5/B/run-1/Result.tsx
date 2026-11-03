import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

type Action = 'rename' | 'duplicate' | 'delete';

export interface ProjectActionsMenuProps {
  onSelect: (action: Action) => void;
}

const ACTIONS: { action: Action; label: string }[] = [
  { action: 'rename', label: 'Rename' },
  { action: 'duplicate', label: 'Duplicate' },
  { action: 'delete', label: 'Delete' },
];

export default function ProjectActionsMenu({ onSelect }: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
  const focusTrigger = () => rootRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup]')?.focus();

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) items()[initialIndex]?.focus();
  }, [open, initialIndex]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openAt = (index: number) => {
    setInitialIndex(index);
    setOpen(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(ACTIONS.length - 1);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    const move = (n: number) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    switch (e.key) {
      case 'ArrowDown':
        return move(i + 1);
      case 'ArrowUp':
        return move(i - 1);
      case 'Home':
        return move(0);
      case 'End':
        return move(list.length - 1);
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        focusTrigger();
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
  };

  const choose = (action: Action) => {
    setOpen(false);
    focusTrigger();
    onSelect(action);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onKeyDown={onTriggerKeyDown} style={{ display: 'inline-block' }}>
        <Button
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => (open ? setOpen(false) : openAt(0))}
        >
          Project actions
        </Button>
      </div>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Project actions"
          onKeyDown={onMenuKeyDown}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            marginTop: 'var(--nil-spacing-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--nil-spacing-xs)',
            padding: 'var(--nil-spacing-sm)',
            minWidth: '100%',
            background: 'var(--nil-color-surface)',
            color: 'var(--nil-color-text)',
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
          }}
        >
          {ACTIONS.map(({ action, label }) => (
            <Button
              key={action}
              role="menuitem"
              variant={action === 'delete' ? 'primary' : 'secondary'}
              style={
                action === 'delete'
                  ? {
                      background: 'var(--nil-color-danger)',
                      borderColor: 'var(--nil-color-danger)',
                    }
                  : undefined
              }
              onClick={() => choose(action)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
