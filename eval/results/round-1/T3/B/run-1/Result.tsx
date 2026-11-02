import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

/**
 * Multi-line composer. Enter sends, Shift+Enter inserts a newline.
 * Empty (or whitespace-only) messages are never sent.
 *
 * The kit's `Input` is single-line, so this uses a native textarea with the
 * kit's `nil-input` class to pick up the token-driven styling.
 */
export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const id = useId();
  const canSend = text.trim().length > 0;

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore Enter while an IME is composing (e.g. confirming a candidate).
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--nil-spacing-sm)',
      }}
    >
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        Message
      </label>
      <textarea
        id={id}
        className="nil-input"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        style={{ flex: 1, resize: 'vertical', minWidth: 0 }}
      />
      <Button type="submit" variant="primary" disabled={!canSend}>
        Send
      </Button>
    </form>
  );
}
