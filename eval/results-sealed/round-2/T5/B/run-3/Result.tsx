import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export type ProjectAction = 'rename' | 'duplicate' | 'delete';

export interface ProjectActionsMenuProps {
  onSelect: (action: ProjectAction) => void;
}

const ACTIONS: { id: ProjectAction; label: string }[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete' },
];

export default function ProjectActionsMenu({ onSelect }: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
  const trigger = () => rootRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup]');

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) items()[0]?.focus();
  }, [open]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) trigger()?.focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowDown':
        next = (i + 1) % list.length;
        break;
      case 'ArrowUp':
        next = (i - 1 + list.length) % list.length;
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
        setOpen(false);
        return;
      default:
        return;
    }
    e.preventDefault();
    list[next]?.focus();
  };

  const choose = (action: ProjectAction) => {
    close(true);
    onSelect(action);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : setOpen(true))}
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
            margin: 0,
            marginTop: 'var(--nil-spacing-xs)',
            padding: 'var(--nil-spacing-xs)',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--nil-spacing-xs)',
            background: 'var(--nil-color-surface)',
            color: 'var(--nil-color-text)',
            border: 'var(--nil-border-width-thick) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
          }}
        >
          {ACTIONS.map(({ id, label }) => (
            <li key={id} role="none" style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                role="menuitem"
                tabIndex={-1}
                variant={id === 'delete' ? 'primary' : 'ghost'}
                style={
                  id === 'delete'
                    ? {
                        background: 'var(--nil-color-danger)',
                        borderColor: 'var(--nil-color-danger)',
                      }
                    : undefined
                }
                onClick={() => choose(id)}
              >
                {label}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
