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
  const triggerWrapRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Which item to focus when the menu opens.
  const initialFocus = useRef<'first' | 'last'>('first');
  const menuId = useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
  const focusTrigger = () => triggerWrapRef.current?.querySelector('button')?.focus();

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) focusTrigger();
  };

  // Move focus into the menu on open.
  useEffect(() => {
    if (!open) return;
    const list = items();
    (initialFocus.current === 'last' ? list[list.length - 1] : list[0])?.focus();
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

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      initialFocus.current = e.key === 'ArrowUp' ? 'last' : 'first';
      if (open) {
        const list = items();
        (e.key === 'ArrowUp' ? list[list.length - 1] : list[0])?.focus();
      } else {
        setOpen(true);
      }
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
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
        // Let focus move naturally, but dismiss the menu.
        setOpen(false);
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
      <span ref={triggerWrapRef}>
        <Button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => {
            initialFocus.current = 'first';
            setOpen((o) => !o);
          }}
          onKeyDown={onTriggerKeyDown}
        >
          Project actions
        </Button>
      </span>
      {open && (
        <Panel
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 'var(--nil-spacing-xs, 4px)',
            minWidth: '100%',
            zIndex: 10,
          }}
        >
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Project actions"
            onKeyDown={onMenuKeyDown}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-xs, 4px)', margin: -8 }}
          >
            {ACTIONS.map((a) => (
              <Button
                key={a.id}
                type="button"
                role="menuitem"
                variant="ghost"
                size="sm"
                tabIndex={-1}
                onClick={() => choose(a.id)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
