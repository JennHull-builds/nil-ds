import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

/**
 * "Delete project" trigger + modal confirmation (role="alertdialog").
 * Keyboard: initial focus lands on Cancel (the safe action), Tab/Shift+Tab are
 * trapped inside the dialog, Escape cancels, and focus returns to the trigger.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelWrapRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = () => {
    setOpen(false);
    // Return focus to the trigger button once the dialog unmounts.
    requestAnimationFrame(() => triggerRef.current?.querySelector('button')?.focus());
  };

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  useEffect(() => {
    if (!open) return;
    cancelWrapRef.current?.querySelector('button')?.focus();
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
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <span ref={triggerRef}>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
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
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontFamily: 'var(--nil-font-mono)',
                  fontSize: 'var(--nil-type-scale-base)',
                  color: 'var(--nil-color-danger)',
                }}
              >
                Delete this project?
              </h2>
              <div id={descId} style={{ marginTop: 'var(--nil-spacing-sm)' }}>
                <Text>This permanently removes the project and cannot be undone.</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--nil-spacing-sm)',
                  marginTop: 'var(--nil-spacing-lg)',
                }}
              >
                <span ref={cancelWrapRef}>
                  <Button type="button" variant="secondary" onClick={close}>
                    Cancel
                  </Button>
                </span>
                {/* The kit has no danger variant; recolour the primary button with semantic tokens. */}
                <Button
                  type="button"
                  variant="primary"
                  onClick={confirm}
                  style={{
                    background: 'var(--nil-color-danger)',
                    borderColor: 'var(--nil-color-danger)',
                    color: 'var(--nil-color-overlay-fg)',
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
