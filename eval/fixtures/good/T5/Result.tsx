import { useEffect, useRef, useState } from 'react';
import { Button } from '../src';

type Action = 'rename' | 'duplicate' | 'delete';
const ACTIONS: { id: Action; label: string }[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete' },
];

/**
 * Fixture: a clean T5 using role="menu". role="menu" promises arrow keys, so ArrowDown/ArrowUp
 * move focus between items. Button does not forward refs, so items are found through the menu's ref.
 */
export default function Result({ onSelect }: { onSelect: (action: Action) => void }) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const close = () => {
    setOpen(false);
    opener.current?.focus();
  };

  useEffect(() => {
    if (open) items()[0]?.focus();
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const all = items();
    const at = all.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowDown') all[(at + 1) % all.length]?.focus();
    else if (event.key === 'ArrowUp') all[(at - 1 + all.length) % all.length]?.focus();
    else return;
    event.preventDefault();
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          opener.current = event.currentTarget;
          setOpen((o) => !o);
        }}
      >
        Project actions
      </Button>
      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Project actions"
          onKeyDown={onKeyDown}
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--nil-spacing-xs)',
            background: 'var(--nil-color-surface)',
            color: 'var(--nil-color-text)',
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
          }}
        >
          {ACTIONS.map((a) => (
            <Button
              key={a.id}
              role="menuitem"
              variant="ghost"
              onClick={() => {
                onSelect(a.id);
                close();
              }}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
