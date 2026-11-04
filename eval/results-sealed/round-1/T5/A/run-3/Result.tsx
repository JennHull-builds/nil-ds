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
  // Which item to focus once the menu has rendered (null = none).
  const pendingFocus = useRef<'first' | 'last' | null>(null);
  const menuId = useId();

  const items = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
  const trigger = () => rootRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup]');

  // Move focus into the menu after it opens.
  useEffect(() => {
    if (!open) return;
    const list = items();
    const target = pendingFocus.current === 'last' ? list[list.length - 1] : list[0];
    pendingFocus.current = null;
    target?.focus();
  }, [open]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) trigger()?.focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      pendingFocus.current = e.key === 'ArrowUp' ? 'last' : 'first';
      setOpen(true);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const list = items();
    const idx = list.indexOf(document.activeElement as HTMLButtonElement);
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowDown':
        next = (idx + 1) % list.length;
        break;
      case 'ArrowUp':
        next = (idx - 1 + list.length) % list.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = list.length - 1;
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        return;
      case 'Tab':
        setOpen(false); // let focus move naturally
        return;
      default:
        return;
    }
    e.preventDefault();
    list[next]?.focus();
  };

  const choose = (action: Action) => {
    close(true);
    onSelect(action);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          pendingFocus.current = open ? null : 'first';
          setOpen((o) => !o);
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {ACTIONS.map(({ action, label }) => (
              <Button
                key={action}
                type="button"
                role="menuitem"
                variant="ghost"
                size="sm"
                tabIndex={-1}
                onClick={() => choose(action)}
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
