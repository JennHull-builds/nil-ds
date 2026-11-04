import { useEffect, useRef, useState } from 'react';
import { Button } from '../src';

type Action = 'rename' | 'duplicate' | 'delete';
const ACTIONS: { id: Action; label: string }[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete' },
];

/**
 * Fixture: a clean T5 using the native popover attribute and showPopover(). A disclosure of plain
 * buttons, no role="menu", so Tab moves between the actions. jsdom has no popover support, so the
 * checker's test-only shim (eval/behaviour/shim.ts) supplies it.
 */
export default function Result({ onSelect }: { onSelect: (action: Action) => void }) {
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const popover = { popover: 'auto' } as Record<string, string>;

  // React 18's types have no onToggle for a div, so listen for the native toggle event directly.
  useEffect(() => {
    const el = list.current;
    const onToggle = (event: Event) => setOpen((event as unknown as { newState: string }).newState === 'open');
    el?.addEventListener('toggle', onToggle);
    return () => el?.removeEventListener('toggle', onToggle);
  }, []);

  return (
    <div>
      <Button
        aria-expanded={open}
        aria-controls="project-actions-list"
        onClick={() => {
          list.current?.showPopover();
          setOpen(true);
          list.current?.querySelector<HTMLElement>('button')?.focus();
        }}
      >
        Project actions
      </Button>
      <div
        id="project-actions-list"
        ref={list}
        {...popover}
        style={{
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
            variant="ghost"
            onClick={() => {
              onSelect(a.id);
              list.current?.hidePopover();
            }}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
