import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Destructive styling per AGENTS.md: primary Button, only background + borderColor overridden. */
const dangerStyle = {
  background: 'var(--nil-color-danger)',
  borderColor: 'var(--nil-color-danger)',
} as const;

export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const descId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Move focus into the dialog on open (Cancel, the safe choice); restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current?.querySelector<HTMLElement>('button');
    const cancel = dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]');
    cancel?.focus();

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
    // Trap Tab inside the dialog.
    const items = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
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

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      <span ref={triggerRef}>
        <Button
          type="button"
          variant="primary"
          style={dangerStyle}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          Delete project
        </Button>
      </span>

      {open && (
        <div
          onClick={close}
          onKeyDown={handleKeyDown}
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
            aria-label="Delete project?"
            aria-describedby={descId}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '28rem' }}
          >
            <Panel title="Delete project?">
              <Text id={descId}>
                This permanently deletes the project. This action cannot be undone.
              </Text>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--nil-spacing-sm)',
                  marginTop: 'var(--nil-spacing-md)',
                }}
              >
                <Button type="button" variant="secondary" data-autofocus onClick={close}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" style={dangerStyle} onClick={confirm}>
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
