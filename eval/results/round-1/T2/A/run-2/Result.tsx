import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Heading, Panel, Text } from '../src';

export interface DeleteProjectProps {
  onConfirm: () => void;
}

const dangerStyle = {
  background: 'var(--nil-color-danger)',
  borderColor: 'var(--nil-color-danger)',
  color: '#fff',
} as const;

/**
 * "Delete project" button + modal confirmation.
 * Keyboard: Enter/Space opens; focus moves to Cancel (the safe default) and is
 * trapped in the dialog; Esc cancels; focus returns to the trigger on close.
 */
export default function DeleteProject({ onConfirm }: DeleteProjectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    // Restore focus to the trigger once it is back in the DOM.
    requestAnimationFrame(() => triggerRef.current?.querySelector('button')?.focus());
  }, []);

  const confirm = () => {
    onConfirm();
    close();
  };

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
    }
  };

  return (
    <>
      <span ref={triggerRef}>
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
            onClick={(e) => e.stopPropagation()}
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
                <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button type="button" variant="secondary" data-autofocus onClick={close}>
                    Cancel
                  </Button>
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
