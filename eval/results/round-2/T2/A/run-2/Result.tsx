import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Heading, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * "Delete project" button that opens a modal confirmation.
 * Keyboard: Enter/Space opens; focus moves to Cancel (the safe default);
 * Tab/Shift+Tab are trapped inside the dialog; Esc cancels; focus returns
 * to the trigger on close.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger once it is back in the DOM flow.
    requestAnimationFrame(() => triggerRef.current?.querySelector('button')?.focus());
  }, []);

  const confirm = useCallback(() => {
    setOpen(false);
    onConfirm();
    requestAnimationFrame(() => triggerRef.current?.querySelector('button')?.focus());
  }, [onConfirm]);

  // Focus the safe action on open; lock background scroll.
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
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) return;
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
      <span ref={triggerRef} style={{ display: 'inline-flex' }}>
        <Button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
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
            style={{ width: '100%', maxWidth: 440 }}
          >
            <Panel title="Warning">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
                <Heading level={3} id={titleId}>
                  Delete this project?
                </Heading>
                <Text id={descId} muted>
                  This action cannot be undone. The project and everything in it will be permanently deleted.
                </Text>
                <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <span ref={cancelRef} style={{ display: 'inline-flex' }}>
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
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
