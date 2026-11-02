import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

/**
 * Multi-line composer. Enter sends, Shift+Enter inserts a newline,
 * whitespace-only messages are ignored.
 *
 * The kit's Input is single-line (<input>), so this uses a <textarea> with the
 * kit's `nil-input` classes to keep token-driven styling.
 */
export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const id = useId();
  const isEmpty = text.trim().length === 0;

  const send = () => {
    if (isEmpty) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send while an IME is composing (e.g. confirming a candidate).
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form
      className="nil-input-group"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label htmlFor={id} className="nil-input-label">
        Message
      </label>
      <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', alignItems: 'flex-end' }}>
        <textarea
          id={id}
          className="nil-input"
          style={{ flex: 1, resize: 'vertical', minWidth: 0 }}
          rows={3}
          value={text}
          placeholder="Type a message. Enter to send, Shift+Enter for a new line."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="submit" variant="primary" disabled={isEmpty}>
          Send
        </Button>
      </div>
    </form>
  );
}
