import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Heading, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const dangerStyle = {
  background: 'var(--nil-color-danger)',
  borderColor: 'var(--nil-color-danger)',
  color: '#ffffff',
} as const;

/**
 * "Delete project" button that opens a modal alertdialog.
 * Keyboard: Tab/Shift+Tab are trapped inside the dialog, Esc cancels,
 * focus starts on Cancel (the safe choice) and returns to the trigger on close.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Focus management + scroll lock + Escape
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current?.querySelector('button') ?? null;
    cancelRef.current?.querySelector('button')?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, close]);

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)'));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      <span ref={triggerRef} style={{ display: 'inline-block' }}>
        <Button type="button" variant="secondary" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          Delete project
        </Button>
      </span>

      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'var(--nil-color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--nil-spacing-xl)',
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={trapTab}
            style={{ width: '100%', maxWidth: 440 }}
          >
            <Panel title="Warning">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
                <Heading level={3} id={titleId}>
                  Delete this project?
                </Heading>
                <Text id={descId} muted>
                  This permanently deletes the project and everything in it. This action cannot be undone.
                </Text>
                <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <span ref={cancelRef}>
                    <Button type="button" variant="secondary" onClick={close}>
                      Cancel
                    </Button>
                  </span>
                  <Button type="button" variant="primary" style={dangerStyle} onClick={confirm}>
                    Delete project
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
