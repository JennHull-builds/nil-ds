import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

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
  const rootRef = useRef<HTMLDivElement>(null);
  // Which item to focus once the menu has rendered; null = none.
  const pendingFocus = useRef<number | 'last' | null>(null);
  const menuId = useId();

  const getItems = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const getTrigger = () => rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]');

  // Move focus into the menu after opening.
  useEffect(() => {
    if (!open) return;
    const items = getItems();
    const target = pendingFocus.current === 'last' ? items.length - 1 : pendingFocus.current ?? 0;
    items[target]?.focus();
    pendingFocus.current = null;
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

  const closeAndRestoreFocus = () => {
    setOpen(false);
    getTrigger()?.focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      pendingFocus.current = 0;
      setOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      pendingFocus.current = 'last';
      setOpen(true);
    }
    // Enter / Space fire click natively on the button.
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const items = getItems();
    const i = items.indexOf(document.activeElement as HTMLElement);
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowDown':
        next = (i + 1) % items.length;
        break;
      case 'ArrowUp':
        next = (i - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case 'Escape':
        e.preventDefault();
        closeAndRestoreFocus();
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
    if (next !== null) {
      e.preventDefault();
      items[next]?.focus();
    }
  };

  const choose = (action: Action) => {
    closeAndRestoreFocus();
    onSelect(action);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            pendingFocus.current = 0;
            setOpen(true);
          }
        }}
        onKeyDown={onTriggerKeyDown}
      >
        Project actions
      </Button>
      {open && (
        <Panel
          id={menuId}
          role="menu"
          aria-label="Project actions"
          onKeyDown={onMenuKeyDown}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 'var(--nil-spacing-xs, 4px)',
            minWidth: '100%',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-xs, 4px)', margin: -8 }}>
            {ACTIONS.map(({ action, label }) => (
              <Button
                key={action}
                role="menuitem"
                tabIndex={-1}
                variant="ghost"
                size="sm"
                onClick={() => choose(action)}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                {label}
              </Button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
