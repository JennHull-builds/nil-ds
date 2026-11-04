import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Heading, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * "Delete project" button + modal confirmation.
 * Keyboard: Escape cancels, Tab/Shift+Tab are trapped inside the dialog,
 * focus starts on the safe action (Cancel) and returns to the trigger on close.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Focus management: move into dialog on open, restore to trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current?.querySelector('button') ?? null;
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
      <span ref={triggerRef} style={{ display: 'inline-block' }}>
        <Button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
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
                <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', justifyContent: 'flex-end' }}>
                  <span ref={cancelRef}>
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
