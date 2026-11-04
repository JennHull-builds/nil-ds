import { useRef } from 'react';
import { Button, Heading, Text } from '../src';

/**
 * Fixture: a clean T2 using the native <dialog> element and showModal(). The browser gives focus
 * handling and Escape for free. jsdom does not, so the checker installs a test-only shim
 * (eval/behaviour/shim.ts). This fixture proves the shim lets the modern answer pass.
 */
export default function Result({ onConfirm }: { onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <div>
      <Button onClick={() => dialog.current?.showModal()}>Delete project</Button>
      <dialog
        ref={dialog}
        aria-labelledby="delete-title"
        style={{
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
          <Button variant="ghost" onClick={() => dialog.current?.close()}>
            Cancel
          </Button>
          <Button
            style={{ color: 'var(--nil-color-danger)', borderColor: 'var(--nil-color-danger)' }}
            onClick={() => {
              onConfirm();
              dialog.current?.close();
            }}
          >
            Delete project
          </Button>
        </div>
      </dialog>
    </div>
  );
}
