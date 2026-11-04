import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

// No danger variant exists in the kit, so recolour the primary button with semantic tokens.
const dangerStyle = {
  background: 'var(--nil-color-danger)',
  borderColor: 'var(--nil-color-danger)',
  color: 'var(--nil-color-accent-contrast)',
} as const;

export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cancelRef = useRef<HTMLSpanElement>(null);

  const close = () => setOpen(false);

  // Move focus into the dialog on open (Cancel is the safe default), restore on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current?.querySelector('button');
    cancelRef.current?.querySelector('button')?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    // Trap focus inside the modal.
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const confirm = () => {
    close();
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
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '28rem' }}
          >
            <Panel title="Confirm deletion">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
                <h2
                  id={titleId}
                  style={{
                    margin: 0,
                    fontFamily: 'var(--nil-font-mono)',
                    fontSize: 'var(--nil-type-scale-lg)',
                    color: 'var(--nil-color-text)',
                  }}
                >
                  Delete this project?
                </h2>
                <div id={descId}>
                  <Text>This permanently deletes the project and cannot be undone.</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
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
