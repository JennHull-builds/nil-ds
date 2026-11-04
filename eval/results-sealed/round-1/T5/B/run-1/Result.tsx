import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLButtonElement>('[data-menu-trigger]')?.focus();
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) focusTrigger();
  };

  const openAt = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  // Move DOM focus to the active item whenever the menu is open.
  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
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
        setActiveIndex((i) => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(last);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        // Let focus move on naturally, but don't leave the menu open behind it.
        setOpen(false);
        break;
    }
  };

  const choose = (action: ProjectAction) => {
    close(true);
    onSelect(action);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        data-menu-trigger=""
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openAt(0))}
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
            {ACTIONS.map(({ action, label }, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={action}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={active ? 0 : -1}
                  onClick={() => choose(action)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
                    border: 'none',
                    borderRadius: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--nil-font-mono)',
                    fontSize: 'var(--nil-type-scale-sm)',
                    background: active ? 'var(--nil-color-accent)' : 'transparent',
                    color: active ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
