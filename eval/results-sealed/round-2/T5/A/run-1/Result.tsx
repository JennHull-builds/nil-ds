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
  // Which item gets focus when the menu opens (null = none requested yet)
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);

  const focusTrigger = () => triggerRef.current?.querySelector('button')?.focus();

  // Move DOM focus to the active item whenever the menu is open
  useEffect(() => {
    if (open) items()[active]?.focus();
  }, [open, active]);

  // Close on outside pointer press
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

  const choose = (action: Action) => {
    setOpen(false);
    focusTrigger();
    onSelect(action);
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(ACTIONS.length - 1);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const n = ACTIONS.length;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((active + 1) % n);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((active - 1 + n) % n);
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(n - 1);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        focusTrigger();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <span ref={triggerRef} style={{ display: 'inline-block' }}>
        <Button
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => (open ? setOpen(false) : openAt(0))}
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
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-xs, 4px)', margin: -4 }}
          >
            {ACTIONS.map((a, i) => (
              <Button
                key={a.id}
                role="menuitem"
                variant="ghost"
                size="sm"
                tabIndex={i === active ? 0 : -1}
                onClick={() => choose(a.id)}
                onMouseEnter={() => setActive(i)}
                style={{ width: '100%', justifyContent: 'flex-start' }}
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
