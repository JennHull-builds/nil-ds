import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Panel } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * "Delete project" trigger + modal confirmation.
 * Keyboard: Enter/Space opens; focus moves to Cancel (the safe default);
 * Tab/Shift+Tab are trapped inside the dialog; Esc cancels;
 * focus returns to the trigger on close.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const confirm = () => {
    setOpen(false);
    triggerRef.current?.focus();
    onConfirm();
  };

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
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
      <span
        ref={(el) => {
          triggerRef.current = el?.querySelector('button') ?? null;
        }}
        style={{ display: 'inline-flex' }}
      >
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
                  fontSize: 'var(--nil-type-scale-md)',
                  color: 'var(--nil-color-text)',
                }}
              >
                Delete this project?
              </h2>
              <p
                id={descId}
                style={{
                  margin: 'var(--nil-spacing-sm) 0 var(--nil-spacing-md)',
                  color: 'var(--nil-color-text-muted)',
                  fontSize: 'var(--nil-type-scale-sm)',
                }}
              >
                This permanently deletes the project and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', justifyContent: 'flex-end' }}>
                <CancelButton innerRef={cancelRef} onClick={close} />
                <Button
                  type="button"
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

/**
 * The kit's Button does not forward refs, so wrap it in a span and focus the
 * inner <button> through a callback ref.
 */
function CancelButton({
  innerRef,
  onClick,
}: {
  innerRef: React.MutableRefObject<HTMLButtonElement | null>;
  onClick: () => void;
}) {
  return (
    <span
      ref={(el) => {
        innerRef.current = el?.querySelector('button') ?? null;
      }}
      style={{ display: 'inline-flex' }}
    >
      <Button type="button" variant="secondary" onClick={onClick}>
        Cancel
      </Button>
    </span>
  );
}
