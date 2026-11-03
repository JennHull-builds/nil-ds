import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Heading, Panel, Text } from '../src';

export interface DeleteProjectConfirmProps {
  onConfirm: () => void;
}

/**
 * "Delete project" button that opens a modal confirmation.
 * Keyboard: focus moves to Cancel (the safe choice) on open, Tab/Shift+Tab are
 * trapped inside the dialog, Escape cancels, and focus returns to the trigger on close.
 */
export default function DeleteProjectConfirm({ onConfirm }: DeleteProjectConfirmProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    // Restore focus to the trigger after it re-renders.
    requestAnimationFrame(() => triggerRef.current?.querySelector('button')?.focus());
  }, []);

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.querySelector('button')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (!dialogRef.current?.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <span ref={triggerRef} style={{ display: 'inline-block' }}>
        <Button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
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
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '28rem' }}
          >
            <Panel title="Confirm">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
                <div id={titleId}>
                  <Heading level={2}>Delete this project?</Heading>
                </div>
                <div id={descId}>
                  <Text>This permanently deletes the project and can't be undone.</Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 'var(--nil-spacing-sm)',
                  }}
                >
                  <span ref={cancelRef}>
                    <Button type="button" variant="secondary" onClick={close}>
                      Cancel
                    </Button>
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={confirm}
                    style={{
                      color: 'var(--nil-color-danger)',
                      borderColor: 'var(--nil-color-danger)',
                    }}
                  >
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
