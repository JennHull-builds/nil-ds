import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const descId = useId();

  // Move focus into the dialog on open; return it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current?.querySelector('button');
    // Cancel is the safe default focus target for a destructive prompt.
    cancelRef.current?.querySelector('button')?.focus();
    return () => trigger?.focus();
  }, [open]);

  const close = () => setOpen(false);

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    // Trap Tab inside the dialog.
    const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!items || items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <span ref={triggerRef}>
        <Button
          variant="secondary"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          Delete project
        </Button>
      </span>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--nil-spacing-md)',
          }}
          onKeyDown={onKeyDown}
        >
          <div
            aria-hidden
            onClick={close}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--nil-color-text)',
              opacity: 0.5,
            }}
          />
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}
          >
            <Panel title="Confirm">
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: 'var(--nil-type-scale-lg)',
                  color: 'var(--nil-color-text)',
                }}
              >
                Delete project?
              </h2>
              <p
                id={descId}
                style={{
                  margin: 'var(--nil-spacing-sm) 0 var(--nil-spacing-md)',
                  fontSize: 'var(--nil-type-scale-sm)',
                  color: 'var(--nil-color-text-muted)',
                }}
              >
                This permanently deletes the project. This cannot be undone.
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--nil-spacing-sm)',
                }}
              >
                <span ref={cancelRef}>
                  <Button variant="secondary" onClick={close}>
                    Cancel
                  </Button>
                </span>
                <Button
                  variant="primary"
                  onClick={confirm}
                  style={{
                    background: 'var(--nil-color-danger)',
                    borderColor: 'var(--nil-color-danger)',
                  }}
                >
                  Delete project
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
