// BAD FIXTURE R10 (T2): Escape does not close the dialog. Every other rule must still pass.
import { useEffect, useRef, useState } from 'react';
import { Button, Heading, Text } from '../src';

/**
 * Fixture: a clean T2 using a div with role="dialog". The kit's Button does not forward refs, so
 * the opener is remembered from the click event and focus is returned to it by hand.
 */
export default function Result({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const close = () => {
    setOpen(false);
    opener.current?.focus();
  };

  useEffect(() => {
    if (open) document.getElementById('cancel-delete')?.focus();
  }, [open]);

  return (
    <div>
      <Button
        onClick={(event) => {
          opener.current = event.currentTarget;
          setOpen(true);
        }}
      >
        Delete project
      </Button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--nil-spacing-md)',
            padding: 'var(--nil-spacing-lg)',
            background: 'var(--nil-color-surface)',
            color: 'var(--nil-color-text)',
            border: 'var(--nil-border-width) solid var(--nil-color-border)',
            borderRadius: 'var(--nil-radius-default)',
          }}
        >
          <Heading level={2} id="delete-title">
            Delete this project?
          </Heading>
          <Text>This cannot be undone.</Text>
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)' }}>
            <Button id="cancel-delete" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              style={{ color: 'var(--nil-color-danger)', borderColor: 'var(--nil-color-danger)' }}
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              Delete project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
