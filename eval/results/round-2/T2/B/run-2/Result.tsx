import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

// Kit has no danger Button: primary Button, only background + borderColor overridden.
const destructiveStyle = {
  background: 'var(--nil-color-danger)',
  borderColor: 'var(--nil-color-danger)',
} as const;

export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerWrapRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = () => {
    setOpen(false);
    // Return focus to the trigger so keyboard users keep their place.
    triggerWrapRef.current?.querySelector('button')?.focus();
  };

  const confirm = () => {
    close();
    onConfirm();
  };

  // Start on Cancel: the safe default for a destructive prompt.
  useEffect(() => {
    if (open) dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [open]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    // Trap focus inside the dialog.
    const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!items || items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
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
      <span ref={triggerWrapRef}>
        <Button type="button" variant="primary" style={destructiveStyle} aria-haspopup="dialog" onClick={() => setOpen(true)}>
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
            style={{ width: '100%' }}
          >
            <Panel title="Confirm">
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: 'var(--nil-type-scale-lg)',
                  fontFamily: 'var(--nil-font-mono)',
                }}
              >
                Delete this project?
              </h2>
              <p
                id={descId}
                style={{
                  margin: 'var(--nil-spacing-sm) 0 var(--nil-spacing-lg)',
                  fontSize: 'var(--nil-type-scale-sm)',
                  color: 'var(--nil-color-text-muted)',
                }}
              >
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={close} data-autofocus>
                  Cancel
                </Button>
                <Button type="button" variant="primary" style={destructiveStyle} onClick={confirm}>
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
