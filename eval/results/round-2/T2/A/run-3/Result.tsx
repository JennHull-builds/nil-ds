import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * "Delete project" button + modal confirmation.
 * Keyboard: Tab/Shift+Tab are trapped in the dialog, Esc cancels, Enter/Space
 * activate the focused button. Focus starts on Cancel (the safe choice) and
 * returns to the trigger when the dialog closes.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelWrapRef = useRef<HTMLSpanElement>(null);
  const triggerWrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerWrapRef.current?.querySelector<HTMLElement>('button');
    cancelWrapRef.current?.querySelector<HTMLElement>('button')?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
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

  return (
    <>
      <span ref={triggerWrapRef} style={{ display: 'inline-block' }}>
        <Button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          style={{
            color: 'var(--nil-color-danger)',
            borderColor: 'var(--nil-color-danger)',
          }}
        >
          Delete project
        </Button>
      </span>

      {open && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'var(--nil-color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--nil-spacing-md)',
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={handleKeyDown}
            style={{ width: '100%', maxWidth: 440 }}
          >
            <Panel title="Warning">
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
              <p
                id={descId}
                style={{
                  margin: 'var(--nil-spacing-sm) 0 var(--nil-spacing-lg)',
                  fontSize: 'var(--nil-type-scale-sm)',
                  lineHeight: 1.5,
                  color: 'var(--nil-color-text-muted)',
                }}
              >
                This permanently deletes the project and cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
                <span ref={cancelWrapRef}>
                  <Button type="button" variant="secondary" onClick={close}>
                    Cancel
                  </Button>
                </span>
                <Button
                  type="button"
                  variant="primary"
                  onClick={confirm}
                  style={{
                    background: 'var(--nil-color-danger)',
                    borderColor: 'var(--nil-color-danger)',
                    color: '#ffffff',
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
