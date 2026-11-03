import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export type ProjectAction = 'rename' | 'duplicate' | 'delete';

export interface ProjectActionsMenuProps {
  onSelect: (action: ProjectAction) => void;
}

const ACTIONS: { action: ProjectAction; label: string }[] = [
  { action: 'rename', label: 'Rename' },
  { action: 'duplicate', label: 'Duplicate' },
  { action: 'delete', label: 'Delete' },
];

export default function ProjectActionsMenu({ onSelect }: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLButtonElement>('button[aria-haspopup]')?.focus();
  };

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) focusTrigger();
  };

  // Move DOM focus to the active item whenever the menu is open.
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (action: ProjectAction) => {
    close(true);
    onSelect(action);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).getAttribute('role') === 'menuitem') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(ACTIONS.length - 1);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }} onKeyDown={onTriggerKeyDown}>
      <Button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openAt(0))}
      >
        Project actions
      </Button>
      {open && (
        <div
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
            marginTop: 'var(--nil-spacing-xs)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--nil-color-surface)',
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
            fontFamily: 'var(--nil-font-mono)',
            fontSize: 'var(--nil-type-scale-sm)',
          }}
        >
          {ACTIONS.map(({ action, label }, i) => {
            const isActive = i === active;
            return (
              <button
                key={action}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={isActive ? 0 : -1}
                onClick={() => choose(action)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                style={{
                  appearance: 'none',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  font: 'inherit',
                  border: 'none',
                  borderRadius: 'var(--nil-radius-none)',
                  padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
                  backgroundColor: isActive ? 'var(--nil-color-accent)' : 'transparent',
                  color: isActive
                    ? 'var(--nil-color-accent-contrast)'
                    : action === 'delete'
                      ? 'var(--nil-color-danger)'
                      : 'var(--nil-color-text)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
